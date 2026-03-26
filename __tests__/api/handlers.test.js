/**
 * API 라우트 핸들러 통합 테스트
 * 실제 route handler 함수를 직접 호출하여 요청/응답 검증
 */

// Response polyfill for jsdom
if (typeof globalThis.Response === 'undefined') {
  globalThis.Response = class Response {
    constructor(body, init = {}) {
      this._body = body;
      this.status = init.status || 200;
      this._headers = new Map();
      if (init.headers) {
        for (const [k, v] of Object.entries(init.headers)) {
          this._headers.set(k, v);
        }
      }
    }
    async text() { return this._body; }
    async json() { return JSON.parse(this._body); }
    get headers() {
      return {
        get: (key) => this._headers.get(key) || null,
        set: (key, value) => this._headers.set(key, value),
      };
    }
  };
}

// Mock next/server
jest.mock('next/server', () => {
  class MockNextResponse {
    constructor(body, init = {}) {
      this._body = body;
      this.status = init.status || 200;
      this._headers = new Map(Object.entries(init.headers || {}));
    }
    async json() { return JSON.parse(this._body); }
    get headers() {
      return {
        get: (key) => this._headers.get(key),
        set: (key, value) => this._headers.set(key, value),
      };
    }
    static json(data, init = {}) {
      return new MockNextResponse(JSON.stringify(data), init);
    }
  }
  return {
    NextResponse: MockNextResponse,
    NextRequest: class {
      constructor(url, init = {}) {
        this.url = url;
        this.method = init.method || 'GET';
        this._body = init.body || null;
        this.headers = { get: (key) => (init.headers || {})[key] || null };
        this.nextUrl = new URL(url);
      }
      async json() { return JSON.parse(this._body); }
    },
  };
});

// Mock Supabase — configurable per test
const mockSingle = jest.fn().mockResolvedValue({ data: null, error: null });
const mockSelect = jest.fn().mockReturnValue({
  eq: jest.fn().mockReturnValue({
    single: mockSingle,
    eq: jest.fn().mockReturnValue({
      single: mockSingle,
      limit: jest.fn().mockResolvedValue({ data: [], error: null }),
    }),
    neq: jest.fn().mockReturnValue({
      limit: jest.fn().mockResolvedValue({ data: [], error: null }),
    }),
    order: jest.fn().mockReturnValue({
      limit: jest.fn().mockResolvedValue({ data: [], error: null }),
    }),
  }),
  order: jest.fn().mockReturnValue({
    limit: jest.fn().mockResolvedValue({ data: [], error: null }),
  }),
});

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({ select: mockSelect })),
    rpc: jest.fn().mockResolvedValue({ data: { success: true, order_id: 'test-order' }, error: null }),
  },
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: mockSelect,
      insert: jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ data: { id: 'new-id' }, error: null }) }) }),
      update: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ data: { id: 'updated' }, error: null }) }) }) }),
      delete: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) }),
    })),
    rpc: jest.fn().mockResolvedValue({ data: { success: true, order_id: 'order-123', earned_points: 50 }, error: null }),
  },
}));

jest.mock('@/lib/authServer', () => ({
  verifyAuth: jest.fn().mockResolvedValue({ profile: { id: 'user-1', role: 'consumer' }, error: null }),
  requireRole: jest.fn().mockResolvedValue({ profile: { id: 'admin-1', role: 'admin' }, error: null, status: 200 }),
}));

jest.mock('@/lib/rateLimit', () => ({
  checkRateLimit: jest.fn().mockResolvedValue(null),
}));

import { verifyAuth, requireRole } from '@/lib/authServer';
import { checkRateLimit } from '@/lib/rateLimit';

describe('POST /api/orders', () => {
  let POST;

  beforeAll(async () => {
    const mod = await import('@/app/api/orders/route');
    POST = mod.POST;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    verifyAuth.mockResolvedValue({ profile: { id: 'user-1', role: 'consumer' }, error: null });
    checkRateLimit.mockResolvedValue(null);
  });

  test('유효한 주문 요청이면 성공 반환', async () => {
    const request = {
      json: async () => ({
        productId: '550e8400-e29b-41d4-a716-446655440000',
        storeId: '550e8400-e29b-41d4-a716-446655440001',
        quantity: 2,
        totalPrice: 10000,
      }),
      headers: { get: () => null },
    };

    const res = await POST(request);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.order).toBeDefined();
  });

  test('인증 실패 시 401 반환', async () => {
    verifyAuth.mockResolvedValue({ profile: null, error: '인증 필요' });

    const request = {
      json: async () => ({}),
      headers: { get: () => null },
    };

    const res = await POST(request);
    expect(res.status).toBe(401);
  });

  test('Rate Limit 초과 시 429 반환', async () => {
    checkRateLimit.mockResolvedValue(new Response(
      JSON.stringify({ error: '요청이 너무 많습니다' }),
      { status: 429 }
    ));

    const request = {
      json: async () => ({}),
      headers: { get: () => null },
    };

    const res = await POST(request);
    expect(res.status).toBe(429);
  });

  test('잘못된 productId면 400 반환', async () => {
    const request = {
      json: async () => ({
        productId: 'invalid-uuid',
        storeId: '550e8400-e29b-41d4-a716-446655440001',
        quantity: 1,
        totalPrice: 5000,
      }),
      headers: { get: () => null },
    };

    const res = await POST(request);
    expect(res.status).toBe(400);
  });

  test('수량이 0이면 400 반환', async () => {
    const request = {
      json: async () => ({
        productId: '550e8400-e29b-41d4-a716-446655440000',
        storeId: '550e8400-e29b-41d4-a716-446655440001',
        quantity: 0,
        totalPrice: 5000,
      }),
      headers: { get: () => null },
    };

    const res = await POST(request);
    expect(res.status).toBe(400);
  });

  test('수량이 101이면 400 반환', async () => {
    const request = {
      json: async () => ({
        productId: '550e8400-e29b-41d4-a716-446655440000',
        storeId: '550e8400-e29b-41d4-a716-446655440001',
        quantity: 101,
        totalPrice: 5000,
      }),
      headers: { get: () => null },
    };

    const res = await POST(request);
    expect(res.status).toBe(400);
  });
});

describe('GET /api/products/[id]', () => {
  let GET;

  beforeAll(async () => {
    const mod = await import('@/app/api/products/[id]/route');
    GET = mod.GET;
  });

  test('상품이 없으면 404 반환', async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'not found' } });

    const request = { url: 'http://localhost/api/products/test-id' };
    const res = await GET(request, { params: { id: 'test-id' } });
    expect(res.status).toBe(404);
  });

  test('서버 에러 시 500 반환', async () => {
    mockSingle.mockRejectedValueOnce(new Error('DB connection failed'));

    const request = { url: 'http://localhost/api/products/test-id' };
    const res = await GET(request, { params: { id: 'test-id' } });
    expect(res.status).toBe(500);
  });
});

describe('PATCH /api/products/[id]', () => {
  let PATCH;

  beforeAll(async () => {
    const mod = await import('@/app/api/products/[id]/route');
    PATCH = mod.PATCH;
  });

  beforeEach(() => {
    requireRole.mockResolvedValue({ profile: { id: 'admin-1', role: 'admin' }, error: null, status: 200 });
  });

  test('인증 실패 시 에러 반환', async () => {
    requireRole.mockResolvedValue({ profile: null, error: '권한 없음', status: 403 });

    const request = { json: async () => ({ status: 'sold_out' }) };
    const res = await PATCH(request, { params: { id: 'test-id' } });
    expect(res.status).toBe(403);
  });

  test('잘못된 status 값이면 400 반환', async () => {
    const request = { json: async () => ({ status: 'invalid_status' }) };
    const res = await PATCH(request, { params: { id: 'test-id' } });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/orders 입력 검증', () => {
  let POST;

  beforeAll(async () => {
    const mod = await import('@/app/api/orders/route');
    POST = mod.POST;
  });

  beforeEach(() => {
    verifyAuth.mockResolvedValue({ profile: { id: 'user-1', role: 'consumer' }, error: null });
    checkRateLimit.mockResolvedValue(null);
  });

  test('금액이 99원이면 400 반환 (최소 100원)', async () => {
    const request = {
      json: async () => ({
        productId: '550e8400-e29b-41d4-a716-446655440000',
        storeId: '550e8400-e29b-41d4-a716-446655440001',
        quantity: 1,
        totalPrice: 99,
      }),
      headers: { get: () => null },
    };

    const res = await POST(request);
    expect(res.status).toBe(400);
  });

  test('storeId 누락 시 400 반환', async () => {
    const request = {
      json: async () => ({
        productId: '550e8400-e29b-41d4-a716-446655440000',
        quantity: 1,
        totalPrice: 5000,
      }),
      headers: { get: () => null },
    };

    const res = await POST(request);
    expect(res.status).toBe(400);
  });
});
