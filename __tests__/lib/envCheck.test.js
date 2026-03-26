/**
 * envCheck.js 유닛 테스트
 */
import { validateEnv } from '@/lib/envCheck';

describe('validateEnv', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  test('필수 환경변수가 모두 있으면 에러 없음', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
    process.env.NODE_ENV = 'development';
    expect(() => validateEnv()).not.toThrow();
  });

  test('필수 환경변수 누락 시 production에서 throw', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    process.env.NODE_ENV = 'production';
    expect(() => validateEnv()).toThrow(/필수 환경변수 누락/);
  });

  test('필수 환경변수 누락 시 development에서는 throw하지 않음', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    process.env.NODE_ENV = 'development';
    const spy = jest.spyOn(console, 'error').mockImplementation();
    expect(() => validateEnv()).not.toThrow();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test('선택 환경변수 누락 시 경고만 출력', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
    process.env.NODE_ENV = 'development';
    const spy = jest.spyOn(console, 'warn').mockImplementation();
    validateEnv();
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('선택 환경변수'));
    spy.mockRestore();
  });
});
