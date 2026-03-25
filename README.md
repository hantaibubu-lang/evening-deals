# 저녁떨이 - 김해 마감 세일 할인 정보

[![CI/CD](https://github.com/hantaibubu-lang/evening-deals/actions/workflows/ci.yml/badge.svg)](https://github.com/hantaibubu-lang/evening-deals/actions/workflows/ci.yml)
[![Lighthouse CI](https://github.com/hantaibubu-lang/evening-deals/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/hantaibubu-lang/evening-deals/actions/workflows/lighthouse.yml)

> 동네 가게의 마감 떨이 상품을 최대 70% 할인된 가격에 만나보세요.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Database**: Supabase (PostgreSQL + Realtime + Auth)
- **Payment**: Toss Payments SDK v1
- **Push**: Firebase Cloud Messaging (FCM)
- **Monitoring**: Sentry (Error Tracking)
- **Analytics**: Google Analytics 4
- **Deploy**: Vercel
- **CI/CD**: GitHub Actions
- **E2E Test**: Playwright

## Getting Started

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local

# 개발 서버
npm run dev
```

`http://localhost:3000`에서 확인하세요.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | 개발 서버 (Turbopack) |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 |
| `npm run lint` | ESLint 검사 |
| `npm test` | Playwright E2E 테스트 |
| `npm run test:e2e` | Playwright UI 모드 |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 공개 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서비스 롤 키 |
| `NEXT_PUBLIC_TOSS_CLIENT_KEY` | Toss Payments 클라이언트 키 |
| `TOSS_SECRET_KEY` | Toss Payments 시크릿 키 |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 측정 ID |
| `NEXT_PUBLIC_KAKAO_JS_KEY` | Kakao JavaScript 키 |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase 설정 (API Key, Project ID 등) |
| `SENTRY_DSN` | Sentry DSN |
| `VERCEL_TOKEN` | Vercel 배포 토큰 (CI/CD) |

## CI/CD Pipeline

### PR 생성 시
1. **Lint** - ESLint 코드 검사
2. **Build** - Next.js 프로덕션 빌드 검증
3. **E2E Tests** - Playwright 핵심 플로우 테스트

### main 브랜치 Push 시
1. **Lint & Build** - 코드 품질 검증
2. **Deploy** - Vercel 프로덕션 자동 배포
3. **Lighthouse** - 배포 후 성능 자동 측정

## Project Structure

```
src/
├── app/                  # Next.js App Router 페이지
│   ├── api/              # API Routes
│   ├── checkout/         # 결제 플로우
│   ├── product/[id]/     # 상품 상세 (OG Image, JSON-LD)
│   ├── store/[id]/       # 가게 상세 (OG Image, JSON-LD)
│   └── mypage/           # 마이페이지
├── components/           # 재사용 컴포넌트
├── contexts/             # React Context (Auth)
├── hooks/                # 커스텀 훅
├── lib/                  # Supabase, Rate Limit 등
└── utils/                # 유틸리티 함수
```

## License

Private - (주)당근헬스
