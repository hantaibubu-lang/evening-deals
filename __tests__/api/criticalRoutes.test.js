/**
 * 결제 확인 / 주문 취소 / 매장 분석 핵심 API 테스트
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
    }
    async json() { return JSON.parse(this._body); }
    static json(data, init = {}) {
      return new MockNextResponse(JSON.stringify(data), init);
    }
  }
  return { NextResponse: MockNextResponse };
});

// ─── 테이블별 결과 추적 (테스트마다 설정) ───────────────────
let tableResults = {};
let tableCallCount = {};

function createChain(resolvedValue) {
  const promise = Promise.resolve(resolvedValue);
  const chain = {};
  // 터미널 메서드 — Promise 반환
  chain.single = jest.fn(() => promise);
  chain.maybeSingle = jest.fn(() => promise);
  // 체인 자체를 thenable로 (Promise.all 지원)
  chain.then = (resolve, reject) => promise.then(resolve, reject);
  chain.catch = (reject) => promise.catch(reject);
  // 체이닝 메서드 — chain 반환
  ['select', 'insert', 'update', 'delete', 'eq', 'neq', 'gte', 'lt', 'ilike', 'order', 'limit'].forEach(m => {
    chain[m] = jest.fn(() => chain);
  });
  return chain;
}

const mockFrom = jest.fn((table) => {
  if (!tableCallCount[table]) tableCallCount[table] = 0;
  const results = tableResults[table] || [{ data: null, error: null }];
  const idx = Math.min(tableCallCount[table]++, results.length - 1);
  return createChain(results[idx]);
});

const mockRpc = jest.fn().mockResolvedValue({
  data: { success: true, order_id: 'order-123', earned_points: 50 },
  error: null,
});

jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: { from: mockFrom, rpc: mockRpc },
}));

jest.mock('@/lib/authServer', () => ({
  verifyAuth: jest.fn().mockResolvedValue({
    profile: { id: 'user-1', role: 'consumer', points: 1000, saved_money: 50000, coupon_count: 3 },
    error: null,
  }),
  requireRole: jest.fn().mockResolvedValue({
    profile: { id: 'owner-1', role: 'manager' },
    error: null,
    status: 200,
  }),
}));

jest.mock('@/lib/rateLimit', () => ({
  checkRateLimit: jest.fn().mockResolvedValue(null),
}));

jest.mock('@/utils/validate', () => ({
  isValidUUID: jest.fn().mockReturnValue(true),
}));

jest.mock('@/lib/logger', () => ({
  logEvent: jest.fn(),
}));

process.env.TOSS_SECRET_KEY = 'test_sk_key';

import { verifyAuth, requireRole } from '@/lib/authServer';
import { isValidUUID } from '@/utils/validate';

// ═══════════════════════════════════════════════════════════
//  POST /api/payments/confirm — 토스페이먼츠 결제 확인
// ═══════════════════════════════════════════════════════════
describe('POST /api/payments/confirm', () => {
  let POST;
  const originalFetch = global.fetch;

  beforeAll(async () => {
    const mod = await import('@/app/api/payments/confirm/route');
    POST = mod.POST;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    tableResults = {};
    tableCallCount = {};
    verifyAuth.mockResolvedValue({
      profile: { id: 'user-1', role: 'consumer', points: 1000 },
      error: null,
    });
    mockRpc.mockResolvedValue({
      data: { success: true, order_id: 'order-123', earned_points: 50 },
      error: null,
    });
    // 기본: 토스 API 성공
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ paymentKey: 'pk_test', orderId: 'oid-1', status: 'DONE' }),
    });
  });

  afterAll(() => { global.fetch = originalFetch; });

  function makeReq(body) {
    return { json: async () => body, headers: { get: () => null } };
  }

  test('인증 실패 시 401 반환', async () => {
    verifyAuth.mockResolvedValue({ profile: null, error: '인증 필요' });
    const res = await POST(makeReq({}));
    expect(res.status).toBe(401);
  });

  test('결제 정보 누락 시 400 반환', async () => {
    const res = await POST(makeReq({ paymentKey: 'pk', orderId: null, amount: null }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('결제 정보가 누락');
  });

  test('토스 API 실패 시 400 반환', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Invalid payment' }),
    });
    const res = await POST(makeReq({
      paymentKey: 'pk_test', orderId: 'oid-1', amount: 10000,
      productId: 'p1', storeId: 's1', quantity: 1,
    }));
    expect(res.status).toBe(400);
  });

  test('상품을 찾을 수 없으면 404 반환', async () => {
    tableResults = { products: [{ data: null, error: { message: 'not found' } }] };
    const res = await POST(makeReq({
      paymentKey: 'pk_test', orderId: 'oid-1', amount: 5000,
      productId: 'p1', storeId: 's1', quantity: 1,
    }));
    expect(res.status).toBe(404);
  });

  test('비활성 상품이면 400 반환', async () => {
    tableResults = {
      products: [{ data: { discount_price: 5000, quantity: 10, status: 'sold_out', store_id: 's1' }, error: null }],
    };
    const res = await POST(makeReq({
      paymentKey: 'pk_test', orderId: 'oid-1', amount: 5000,
      productId: 'p1', storeId: 's1', quantity: 1,
    }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('구매할 수 없는');
  });

  test('서버 계산 금액과 불일치하면 400 반환', async () => {
    tableResults = {
      products: [{ data: { discount_price: 5000, quantity: 10, status: 'active', store_id: 's1' }, error: null }],
    };
    const res = await POST(makeReq({
      paymentKey: 'pk_test', orderId: 'oid-1', amount: 99999,
      productId: 'p1', storeId: 's1', quantity: 1,
    }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('금액이 일치하지');
  });

  test('RPC 성공 시 주문 생성 완료', async () => {
    tableResults = {
      products: [{ data: { discount_price: 5000, quantity: 10, status: 'active', store_id: 's1' }, error: null }],
    };
    const res = await POST(makeReq({
      paymentKey: 'pk_test', orderId: 'oid-1', amount: 5000,
      productId: 'p1', storeId: 's1', quantity: 1,
    }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.orderId).toBe('order-123');
    expect(body.earnedPoints).toBe(50);
  });

  test('RPC 실패 시 폴백으로 직접 주문 생성', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'RPC not found' } });
    tableResults = {
      products: [{ data: { discount_price: 5000, quantity: 10, status: 'active', store_id: 's1' }, error: null }],
      orders: [{ data: { id: 'fallback-order' }, error: null }],
      users: [{ data: { id: 'user-1' }, error: null }],
    };
    const res = await POST(makeReq({
      paymentKey: 'pk_test', orderId: 'oid-1', amount: 5000,
      productId: 'p1', storeId: 's1', quantity: 1,
    }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.orderId).toBe('fallback-order');
  });

  test('±10원 허용 오차 내 금액은 통과', async () => {
    tableResults = {
      products: [{ data: { discount_price: 5000, quantity: 10, status: 'active', store_id: 's1' }, error: null }],
    };
    // 서버 예상: 5000, 클라이언트: 5010 (허용 범위)
    const res = await POST(makeReq({
      paymentKey: 'pk_test', orderId: 'oid-1', amount: 5010,
      productId: 'p1', storeId: 's1', quantity: 1,
    }));
    expect(res.status).toBe(200);
  });
});

// ═══════════════════════════════════════════════════════════
//  POST /api/orders/[id]/cancel — 고객 주문 취소
// ═══════════════════════════════════════════════════════════
describe('POST /api/orders/[id]/cancel', () => {
  let POST;
  const originalFetch = global.fetch;

  beforeAll(async () => {
    const mod = await import('@/app/api/orders/[id]/cancel/route');
    POST = mod.POST;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    tableResults = {};
    tableCallCount = {};
    verifyAuth.mockResolvedValue({
      profile: { id: 'user-1', role: 'consumer', points: 1000, saved_money: 50000 },
      error: null,
    });
    isValidUUID.mockReturnValue(true);
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'CANCELED' }),
    });
  });

  afterAll(() => { global.fetch = originalFetch; });

  const params = { id: '550e8400-e29b-41d4-a716-446655440000' };
  const request = { headers: { get: () => null } };

  test('인증 실패 시 401 반환', async () => {
    verifyAuth.mockResolvedValue({ profile: null, error: '인증 필요' });
    const res = await POST(request, { params });
    expect(res.status).toBe(401);
  });

  test('유효하지 않은 UUID면 400 반환', async () => {
    isValidUUID.mockReturnValue(false);
    const res = await POST(request, { params: { id: 'bad-id' } });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('유효하지 않은 주문 ID');
  });

  test('주문을 찾을 수 없으면 404 반환', async () => {
    tableResults = { orders: [{ data: null, error: { message: 'not found' } }] };
    const res = await POST(request, { params });
    expect(res.status).toBe(404);
  });

  test('본인 주문이 아니면 403 반환', async () => {
    tableResults = {
      orders: [{ data: { id: 'o1', user_id: 'other-user', status: 'PENDING' }, error: null }],
    };
    const res = await POST(request, { params });
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain('본인의 주문만');
  });

  test('PENDING이 아닌 주문은 취소 불가', async () => {
    tableResults = {
      orders: [{ data: { id: 'o1', user_id: 'user-1', status: 'PREPARING' }, error: null }],
    };
    const res = await POST(request, { params });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('픽업 준비가 시작된');
  });

  test('이미 취소된 주문은 적절한 메시지 반환', async () => {
    tableResults = {
      orders: [{ data: { id: 'o1', user_id: 'user-1', status: 'CANCELLED' }, error: null }],
    };
    const res = await POST(request, { params });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('이미 취소된');
  });

  test('토스 환불 실패 시 500 반환', async () => {
    tableResults = {
      orders: [{
        data: {
          id: 'o1', user_id: 'user-1', status: 'PENDING',
          product_id: 'p1', quantity: 1, total_price: 5000, payment_key: 'pk_test',
        },
        error: null,
      }],
    };
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: '잔액 부족' }),
    });
    const res = await POST(request, { params });
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toContain('환불 처리에 실패');
  });

  test('유료 주문 취소 성공 (환불 포함)', async () => {
    tableResults = {
      orders: [
        {
          data: {
            id: 'o1', user_id: 'user-1', status: 'PENDING',
            product_id: 'p1', quantity: 2, total_price: 10000, payment_key: 'pk_test',
          },
          error: null,
        },
        { data: { id: 'o1', status: 'CANCELLED' }, error: null },
      ],
      products: [{ data: { quantity: 5 }, error: null }],
      users: [{ data: null, error: null }],
      user_coupons: [{ data: null, error: null }],
    };
    const res = await POST(request, { params });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.refunded).toBe(true);
  });

  test('무료 주문 취소 시 토스 API 호출 없이 성공', async () => {
    tableResults = {
      orders: [
        {
          data: {
            id: 'o1', user_id: 'user-1', status: 'PENDING',
            product_id: 'p1', quantity: 1, total_price: 0, payment_key: null,
          },
          error: null,
        },
        { data: { id: 'o1', status: 'CANCELLED' }, error: null },
      ],
      products: [{ data: { quantity: 3 }, error: null }],
      users: [{ data: null, error: null }],
      user_coupons: [{ data: null, error: null }],
    };
    const res = await POST(request, { params });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.refunded).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════
//  GET /api/stores/analytics — 매장 매출 분석
// ═══════════════════════════════════════════════════════════
describe('GET /api/stores/analytics', () => {
  let GET;

  beforeAll(async () => {
    const mod = await import('@/app/api/stores/analytics/route');
    GET = mod.GET;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    tableResults = {};
    tableCallCount = {};
    requireRole.mockResolvedValue({
      profile: { id: 'owner-1', role: 'manager' },
      error: null,
      status: 200,
    });
  });

  function makeReq(period = 'week') {
    return { url: `http://localhost/api/stores/analytics?period=${period}` };
  }

  test('권한 없는 사용자는 403 반환', async () => {
    requireRole.mockResolvedValue({ profile: null, error: '권한이 없습니다.', status: 403 });
    const res = await GET(makeReq());
    expect(res.status).toBe(403);
  });

  test('매장이 없으면 404 반환', async () => {
    tableResults = { stores: [{ data: [], error: null }] };
    const res = await GET(makeReq());
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toContain('매장을 찾을 수 없습니다');
  });

  test('주간 분석 데이터 구조 검증', async () => {
    const now = new Date();
    tableResults = {
      stores: [{ data: [{ id: 'store-1' }], error: null }],
      orders: [{
        data: [
          { id: 'o1', total_price: 5000, status: 'COMPLETED', created_at: now.toISOString(), quantity: 2, product_id: 'p1', product: { name: '떡볶이' } },
          { id: 'o2', total_price: 8000, status: 'COMPLETED', created_at: now.toISOString(), quantity: 1, product_id: 'p2', product: { name: '김밥' } },
        ],
        error: null,
      }],
    };
    const res = await GET(makeReq('week'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.period).toBe('week');
    expect(body.totalRevenue).toBe(13000);
    expect(body.totalOrders).toBe(2);
    expect(body.savedFoodKg).toBeGreaterThan(0);
    expect(body.dailyStats).toHaveLength(7);
    expect(body.topProducts).toBeDefined();
    expect(body.bestDay).toBeDefined();
    expect(body.peakHour).toBeDefined();
  });

  test('월간 분석에는 일별 통계(dateStats) 포함', async () => {
    tableResults = {
      stores: [{ data: [{ id: 'store-1' }], error: null }],
      orders: [{ data: [], error: null }],
    };
    const res = await GET(makeReq('month'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.period).toBe('month');
    expect(body.dateStats.length).toBeGreaterThan(0);
  });

  test('주문이 없어도 0으로 정상 응답', async () => {
    tableResults = {
      stores: [{ data: [{ id: 'store-1' }], error: null }],
      orders: [{ data: [], error: null }],
    };
    const res = await GET(makeReq());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.totalRevenue).toBe(0);
    expect(body.totalOrders).toBe(0);
    expect(body.topProducts).toEqual([]);
    expect(body.savedFoodKg).toBe(0);
  });

  test('인기 상품 TOP 5 정렬 검증', async () => {
    const now = new Date();
    const orders = [];
    for (let i = 0; i < 7; i++) {
      orders.push({
        id: `o${i}`, total_price: (i + 1) * 1000, status: 'COMPLETED',
        created_at: now.toISOString(), quantity: 1,
        product_id: `p${i % 6}`, product: { name: `상품${i % 6}` },
      });
    }
    tableResults = {
      stores: [{ data: [{ id: 'store-1' }], error: null }],
      orders: [{ data: orders, error: null }],
    };
    const res = await GET(makeReq());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.topProducts.length).toBeLessThanOrEqual(5);
    // 매출 내림차순 정렬 확인
    for (let i = 1; i < body.topProducts.length; i++) {
      expect(body.topProducts[i - 1].revenue).toBeGreaterThanOrEqual(body.topProducts[i].revenue);
    }
  });
});
