# 저녁떨이 API Reference

Base URL: `/api`

모든 응답은 `{ success: boolean, data?: any, error?: string }` 형식입니다.
인증이 필요한 엔드포인트는 Supabase Auth 세션 쿠키로 인증합니다.

---

## 공개 API (인증 불필요)

### 상품

| Method | Endpoint | 설명 | 주요 파라미터 |
|--------|----------|------|---------------|
| GET | `/products/{id}` | 상품 상세 | - |
| GET | `/products/nearby` | 주변 상품 목록 | `lat`, `lng`, `radius`, `category`, `query`, `sort`, `page` |
| GET | `/products/autocomplete` | 검색 자동완성 | `q` |

### 매장

| Method | Endpoint | 설명 | 주요 파라미터 |
|--------|----------|------|---------------|
| GET | `/stores` | 매장 목록 | - |
| GET | `/stores/{id}` | 매장 상세 | - |
| GET | `/stores/nearby` | 주변 매장 | `lat`, `lng`, `radius` |

### 기타

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/geocode` | 좌표→주소 변환 (`lat`, `lng`) |
| GET | `/reviews` | 리뷰 목록 (`productId` 또는 `storeId`) |

---

## 사용자 API (인증 필요)

### 인증

| Method | Endpoint | 설명 | Body |
|--------|----------|------|------|
| POST | `/users/signup` | 회원가입 | `{ email, password, name }` |
| POST | `/auth/profile` | 프로필 등록/업데이트 | `{ name, phone, role }` |

### 주문

| Method | Endpoint | 설명 | Body |
|--------|----------|------|------|
| POST | `/orders` | 주문 생성 | `{ productId, storeId, quantity, totalPrice }` |
| GET | `/users/orders` | 내 주문 내역 | - |
| POST | `/orders/{id}/cancel` | 주문 취소 | `{ reason }` |

### 결제

| Method | Endpoint | 설명 | Body |
|--------|----------|------|------|
| POST | `/payments/confirm` | 토스페이먼츠 결제 승인 | `{ paymentKey, orderId, amount }` |

### 찜하기

| Method | Endpoint | 설명 | Body |
|--------|----------|------|------|
| GET | `/users/favorites` | 찜 목록 | - |
| POST | `/users/favorites` | 찜 추가 | `{ targetId, targetType }` |
| DELETE | `/users/favorites` | 찜 해제 | `{ targetId, targetType }` |

### 프로필

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/users/profile` | 내 프로필 조회 |
| PATCH | `/users/profile` | 프로필 수정 |

### 쿠폰

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/coupons` | 사용 가능한 쿠폰 |
| POST | `/coupons` | 쿠폰 사용 |

### 리뷰

| Method | Endpoint | 설명 | Body |
|--------|----------|------|------|
| POST | `/reviews` | 리뷰 작성 | `{ orderId, productId, storeId, rating, content, images }` |

### 알림

| Method | Endpoint | 설명 | Body |
|--------|----------|------|------|
| POST | `/notifications/subscribe` | FCM 푸시 구독 | `{ token }` |
| DELETE | `/notifications/subscribe` | 푸시 구독 해제 | `{ token }` |

### 기타

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/support` | 고객지원 문의 |
| POST | `/upload` | 이미지 업로드 (multipart) |

---

## 사장님 API (store_manager 역할 필요)

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/stores` | 매장 등록 |
| PATCH | `/stores` | 매장 정보 수정 |
| POST | `/products` | 상품 등록 |
| PATCH | `/products/{id}` | 상품 수정 |
| DELETE | `/products/{id}` | 상품 삭제 |
| GET | `/stores/orders` | 매장 주문 목록 |
| PATCH | `/stores/orders` | 주문 상태 변경 |
| GET | `/stores/products` | 매장 상품 목록 |
| PATCH | `/stores/products` | 상품 상태 변경 |
| GET | `/stores/analytics` | 매출 분석 |
| GET | `/stores/marketing` | 마케팅 현황 |
| POST | `/notifications/send` | 고객에게 푸시 발송 |

---

## 관리자 API (admin 역할 필요)

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/admin/dashboard` | 대시보드 통계 |
| GET | `/admin/users` | 회원 목록 |
| PATCH | `/admin/users` | 회원 역할 변경 |
| GET | `/admin/orders` | 전체 주문 |
| PATCH | `/admin/orders/{id}/status` | 주문 상태 변경 |
| GET/POST/PATCH/DELETE | `/admin/coupons` | 쿠폰 CRUD |
| GET/POST/PATCH/DELETE | `/admin/notices` | 공지사항 CRUD |
| GET/PATCH/DELETE | `/admin/inquiries` | 문의 관리 |
| GET | `/admin/sales` | 매출 데이터 |
| GET/PATCH | `/admin/settlements` | 정산 관리 |

---

## 에러 응답

| 코드 | 설명 |
|------|------|
| 400 | 잘못된 요청 (필수 필드 누락 등) |
| 401 | 인증 필요 |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 409 | 충돌 (이미 존재하는 리소스) |
| 429 | 요청 횟수 초과 (Rate Limit) |
| 500 | 서버 내부 오류 |

### Rate Limit 헤더 (429 응답 시)

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1700000000
Retry-After: 45
```
