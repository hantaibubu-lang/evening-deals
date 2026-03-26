/**
 * 환경변수 런타임 검증
 * 서버 시작 시 필수 환경변수가 설정되어 있는지 확인
 */

const requiredServerEnv = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

const optionalServerEnv = [
  { key: 'SUPABASE_SERVICE_ROLE_KEY', desc: 'Admin DB 접근 (없으면 anon key 사용)' },
  { key: 'NEXT_PUBLIC_KAKAO_MAP_KEY', desc: '카카오맵 표시' },
  { key: 'NEXT_PUBLIC_SENTRY_DSN', desc: 'Sentry 에러 모니터링' },
  { key: 'UPSTASH_REDIS_REST_URL', desc: 'Redis Rate Limiting (없으면 인메모리)' },
  { key: 'UPSTASH_REDIS_REST_TOKEN', desc: 'Redis Rate Limiting 인증' },
];

export function validateEnv() {
  const missing = requiredServerEnv.filter(key => !process.env[key]);

  if (missing.length > 0) {
    const msg = `[ENV ERROR] 필수 환경변수 누락: ${missing.join(', ')}\n` +
      `.env.local 파일을 확인하세요. 예시: .env.example`;
    console.error(msg);
    if (process.env.NODE_ENV === 'production') {
      throw new Error(msg);
    }
  }

  if (process.env.NODE_ENV !== 'test') {
    const missingOptional = optionalServerEnv.filter(({ key }) => !process.env[key]);
    if (missingOptional.length > 0) {
      console.warn(
        '[ENV WARN] 선택 환경변수 미설정:\n' +
        missingOptional.map(({ key, desc }) => `  - ${key}: ${desc}`).join('\n')
      );
    }
  }
}
