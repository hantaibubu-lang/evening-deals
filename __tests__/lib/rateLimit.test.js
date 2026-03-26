/**
 * rateLimit.js 유닛 테스트
 * 인메모리 Token Bucket 방식 테스트 (Redis 없이)
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

// Redis 환경변수를 unset하여 인메모리 모드 강제
delete process.env.UPSTASH_REDIS_REST_URL;
delete process.env.UPSTASH_REDIS_REST_TOKEN;

import { rateLimit, getClientIp, checkRateLimit } from '@/lib/rateLimit';

describe('rateLimit (인메모리 모드)', () => {
  test('limit 이내 요청은 success: true', async () => {
    const key = `test:basic:${Date.now()}`;
    const result = await rateLimit(key, { limit: 3, windowMs: 60000 });
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(2); // 3 - 1 = 2
  });

  test('limit 초과 시 success: false', async () => {
    const key = `test:exceed:${Date.now()}`;
    const opts = { limit: 2, windowMs: 60000 };

    await rateLimit(key, opts); // 1번째 (남은: 1)
    await rateLimit(key, opts); // 2번째 (남은: 0)
    const result = await rateLimit(key, opts); // 3번째 (초과)

    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  test('remaining이 순차적으로 감소한다', async () => {
    const key = `test:remaining:${Date.now()}`;
    const opts = { limit: 5, windowMs: 60000 };

    const r1 = await rateLimit(key, opts);
    const r2 = await rateLimit(key, opts);
    const r3 = await rateLimit(key, opts);

    expect(r1.remaining).toBe(4);
    expect(r2.remaining).toBe(3);
    expect(r3.remaining).toBe(2);
  });

  test('resetAt이 미래 시점이다', async () => {
    const key = `test:reset:${Date.now()}`;
    const result = await rateLimit(key, { limit: 5, windowMs: 60000 });
    expect(result.resetAt).toBeGreaterThan(Date.now());
  });

  test('기본값으로 60회/60초', async () => {
    const key = `test:default:${Date.now()}`;
    const result = await rateLimit(key);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(59); // 60 - 1
  });
});

describe('getClientIp', () => {
  test('x-forwarded-for에서 첫 번째 IP 추출', () => {
    const request = {
      headers: {
        get: (name) => {
          if (name === 'x-forwarded-for') return '1.2.3.4, 5.6.7.8';
          return null;
        },
      },
    };
    expect(getClientIp(request)).toBe('1.2.3.4');
  });

  test('x-real-ip 폴백', () => {
    const request = {
      headers: {
        get: (name) => {
          if (name === 'x-real-ip') return '10.0.0.1';
          return null;
        },
      },
    };
    expect(getClientIp(request)).toBe('10.0.0.1');
  });

  test('IP 없으면 unknown 반환', () => {
    const request = {
      headers: { get: () => null },
    };
    expect(getClientIp(request)).toBe('unknown');
  });
});

describe('checkRateLimit', () => {
  test('limit 이내면 null 반환 (통과)', async () => {
    const request = {
      headers: { get: () => null },
    };
    const result = await checkRateLimit(request, {
      limit: 10,
      windowMs: 60000,
      keyPrefix: `test:check:${Date.now()}`,
    });
    expect(result).toBeNull();
  });

  test('limit 초과 시 429 Response 반환', async () => {
    const prefix = `test:block:${Date.now()}`;
    const request = {
      headers: { get: () => null },
    };
    const opts = { limit: 1, windowMs: 60000, keyPrefix: prefix };

    await checkRateLimit(request, opts); // 1번째 (통과)
    const response = await checkRateLimit(request, opts); // 2번째 (차단)

    expect(response).not.toBeNull();
    expect(response.status).toBe(429);

    const body = JSON.parse(await response.text());
    expect(body.error).toContain('요청이 너무 많습니다');
  });

  test('429 응답에 Rate Limit 헤더 포함', async () => {
    const prefix = `test:headers:${Date.now()}`;
    const request = {
      headers: { get: () => null },
    };
    const opts = { limit: 1, windowMs: 60000, keyPrefix: prefix };

    await checkRateLimit(request, opts);
    const response = await checkRateLimit(request, opts);

    expect(response.headers.get('X-RateLimit-Limit')).toBe('1');
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
    expect(response.headers.get('Retry-After')).toBeDefined();
    expect(response.headers.get('X-RateLimit-Reset')).toBeDefined();
  });
});
