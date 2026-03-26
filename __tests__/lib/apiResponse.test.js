/**
 * apiResponse.js 유닛 테스트
 * API 응답 형식 일관성 검증
 */

// NextResponse mock
jest.mock('next/server', () => ({
  NextResponse: {
    json: (body, init) => ({
      body,
      status: init?.status || 200,
      json: async () => body,
    }),
  },
}));

import { apiSuccess, apiError, ApiErrors } from '@/lib/apiResponse';

describe('apiSuccess', () => {
  test('기본 성공 응답 (200)', () => {
    const res = apiSuccess({ products: [] });
    expect(res.body.success).toBe(true);
    expect(res.body.products).toEqual([]);
    expect(res.status).toBe(200);
  });

  test('커스텀 상태 코드', () => {
    const res = apiSuccess({ id: '123' }, 201);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.id).toBe('123');
  });

  test('빈 데이터', () => {
    const res = apiSuccess();
    expect(res.body.success).toBe(true);
    expect(res.status).toBe(200);
  });
});

describe('apiError', () => {
  test('기본 에러 응답 (500)', () => {
    const res = apiError('서버 오류');
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('서버 오류');
    expect(res.body.statusCode).toBe(500);
    expect(res.status).toBe(500);
  });

  test('커스텀 상태 코드와 추가 데이터', () => {
    const res = apiError('잘못된 요청', 400, { field: 'email' });
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('잘못된 요청');
    expect(res.body.statusCode).toBe(400);
    expect(res.body.field).toBe('email');
    expect(res.status).toBe(400);
  });
});

describe('ApiErrors 프리셋', () => {
  test('unauthorized (401)', () => {
    const res = ApiErrors.unauthorized();
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('인증이 필요합니다.');
  });

  test('unauthorized 커스텀 메시지', () => {
    const res = ApiErrors.unauthorized('토큰이 만료되었습니다.');
    expect(res.body.error).toBe('토큰이 만료되었습니다.');
  });

  test('forbidden (403)', () => {
    const res = ApiErrors.forbidden();
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('접근 권한이 없습니다.');
  });

  test('notFound (404)', () => {
    const res = ApiErrors.notFound();
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('리소스를 찾을 수 없습니다.');
  });

  test('badRequest (400)', () => {
    const res = ApiErrors.badRequest();
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('잘못된 요청입니다.');
  });

  test('conflict (409)', () => {
    const res = ApiErrors.conflict();
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('이미 존재하는 리소스입니다.');
  });

  test('tooMany (429)', () => {
    const res = ApiErrors.tooMany();
    expect(res.status).toBe(429);
    expect(res.body.error).toContain('요청이 너무 많습니다');
  });

  test('server (500)', () => {
    const res = ApiErrors.server();
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('서버 오류가 발생했습니다.');
  });

  test('모든 프리셋이 일관된 형식을 가진다', () => {
    const presets = ['unauthorized', 'forbidden', 'notFound', 'badRequest', 'conflict', 'tooMany', 'server'];
    for (const preset of presets) {
      const res = ApiErrors[preset]();
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error');
      expect(res.body).toHaveProperty('statusCode');
      expect(typeof res.body.error).toBe('string');
      expect(typeof res.body.statusCode).toBe('number');
    }
  });
});
