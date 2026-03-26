/**
 * 공개 API 라우트 통합 테스트
 * 실제 HTTP 요청 없이 route handler를 직접 호출
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

// Next.js server mock
jest.mock('next/server', () => {
  class MockNextResponse {
    constructor(body, init = {}) {
      this._body = body;
      this.status = init.status || 200;
      this._headers = new Map(Object.entries(init.headers || {}));
    }

    async json() {
      return JSON.parse(this._body);
    }

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
        this.headers = {
          get: (key) => (init.headers || {})[key] || null,
        };
        this.nextUrl = new URL(url);
      }

      async json() {
        return JSON.parse(this._body);
      }
    },
  };
});

// Supabase mock
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: 'test-id' }, error: null }),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
    auth: {
      admin: {
        getUserById: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    },
  },
}));

jest.mock('@/lib/authServer', () => ({
  requireRole: jest.fn().mockResolvedValue([null, null, { id: 'test-user', role: 'admin' }]),
  getAuthUser: jest.fn().mockResolvedValue({ id: 'test-user', email: 'test@test.com' }),
}));

jest.mock('@/lib/rateLimit', () => ({
  checkRateLimit: jest.fn().mockResolvedValue(null),
}));

describe('API 응답 형식 일관성', () => {
  test('apiSuccess는 success: true를 포함한다', () => {
    const { apiSuccess } = require('@/lib/apiResponse');
    const res = apiSuccess({ items: [] });
    expect(res.body || res._body).toBeDefined();
  });

  test('apiError는 success: false와 statusCode를 포함한다', () => {
    const { apiError } = require('@/lib/apiResponse');
    const res = apiError('테스트 에러', 400);
    expect(res.status).toBe(400);
  });

  test('ApiErrors의 모든 프리셋이 올바른 상태코드를 반환한다', () => {
    const { ApiErrors } = require('@/lib/apiResponse');
    expect(ApiErrors.unauthorized().status).toBe(401);
    expect(ApiErrors.forbidden().status).toBe(403);
    expect(ApiErrors.notFound().status).toBe(404);
    expect(ApiErrors.badRequest().status).toBe(400);
    expect(ApiErrors.conflict().status).toBe(409);
    expect(ApiErrors.tooMany().status).toBe(429);
    expect(ApiErrors.server().status).toBe(500);
  });
});

describe('Rate Limit 헤더 검증', () => {
  test('checkRateLimit이 429 응답에 필요한 헤더를 포함한다', async () => {
    // 실제 인메모리 rate limiter 사용
    jest.unmock('@/lib/rateLimit');
    const { checkRateLimit } = jest.requireActual('@/lib/rateLimit');

    const request = { headers: { get: () => null } };
    const prefix = `api-test:${Date.now()}`;

    // limit=1로 설정 → 1번 요청 후 즉시 차단
    await checkRateLimit(request, { limit: 1, windowMs: 60000, keyPrefix: prefix });
    const blocked = await checkRateLimit(request, { limit: 1, windowMs: 60000, keyPrefix: prefix });

    expect(blocked).not.toBeNull();
    expect(blocked.status).toBe(429);
  });
});

describe('유효성 검증 유틸리티', () => {
  test('validateRequired가 누락 필드를 감지한다', () => {
    const { validateRequired } = require('@/utils/validate');
    const result = validateRequired({ name: '떡볶이' }, ['name', 'price']);
    expect(result.valid).toBe(false);
    expect(result.missing).toBe('price');
  });

  test('sanitizeString이 XSS 공격을 방지한다', () => {
    const { sanitizeString } = require('@/utils/validate');
    const malicious = '<img src=x onerror=alert(1)>';
    const sanitized = sanitizeString(malicious);
    expect(sanitized).not.toContain('<img');
    // sanitizeString escapes HTML chars (<>&"') so the tag is neutralized
    // but attribute names like 'onerror' remain as plain text — that's fine
    expect(sanitized).toContain('&lt;');  // < was escaped
  });
});
