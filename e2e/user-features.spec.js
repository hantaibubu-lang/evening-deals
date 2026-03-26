import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: 'user@eveningdeals.com',
  password: 'user1234!',
};

async function login(page) {
  await page.goto('/login');
  await page.fill('#login-email', TEST_USER.email);
  await page.fill('#login-password', TEST_USER.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/', { timeout: 10000 });
}

test.describe('사용자 기능 (마이페이지)', () => {

  test('1. 쿠폰 페이지', async ({ page }) => {
    await login(page);
    await page.goto('/mypage/coupons');
    await expect(page.locator('main')).toBeVisible();
  });

  test('2. 포인트 페이지', async ({ page }) => {
    await login(page);
    await page.goto('/mypage/points');
    await expect(page.locator('main')).toBeVisible();
  });

  test('3. 리뷰 관리 페이지', async ({ page }) => {
    await login(page);
    await page.goto('/mypage/reviews');
    await expect(page.locator('main')).toBeVisible();
  });

  test('4. 알림 설정 페이지', async ({ page }) => {
    await login(page);
    await page.goto('/mypage/notifications');
    await expect(page.locator('main')).toBeVisible();
  });

  test('5. 위치 설정 페이지', async ({ page }) => {
    await login(page);
    await page.goto('/mypage/location');
    await expect(page.locator('main')).toBeVisible();
  });

  test('6. 고객지원 페이지', async ({ page }) => {
    await login(page);
    await page.goto('/mypage/support');
    await expect(page.locator('main')).toBeVisible();
  });

  test('7. 공지사항 페이지', async ({ page }) => {
    await login(page);
    await page.goto('/mypage/notices');
    await expect(page.locator('main')).toBeVisible();
  });

  test('8. 앱 설정 페이지', async ({ page }) => {
    await page.goto('/mypage/settings');
    await expect(page.locator('main')).toBeVisible();
    // 다크 모드 토글 존재
    await expect(page.getByText('다크 모드')).toBeVisible();
  });

  test('9. 이용약관 페이지 (설정 내)', async ({ page }) => {
    await page.goto('/mypage/settings/terms');
    await expect(page.getByText('이용약관')).toBeVisible();
    await expect(page.getByText('제1조')).toBeVisible();
  });

  test('10. 개인정보처리방침 (설정 내)', async ({ page }) => {
    await page.goto('/mypage/settings/privacy');
    await expect(page.locator('main')).toBeVisible();
  });

  test('11. 오픈소스 라이선스', async ({ page }) => {
    await page.goto('/mypage/settings/opensource');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('검색 기능 상세', () => {

  test('1. 검색 페이지 로딩', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('onboarding_done', 'true'));
    await page.goto('/search');
    await expect(page.locator('main')).toBeVisible();
    // 검색 입력 필드 존재
    await expect(page.locator('input[type="text"], input[type="search"]').first()).toBeVisible();
  });

  test('2. 온보딩 페이지', async ({ page }) => {
    await page.evaluate(() => localStorage.removeItem('onboarding_done'));
    await page.goto('/onboarding');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('에러 처리', () => {

  test('1. 존재하지 않는 페이지 → 404', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');
    expect(response.status()).toBe(404);
  });

  test('2. 환불 정책 페이지 접근', async ({ page }) => {
    await page.goto('/refund-policy');
    await expect(page.locator('main')).toBeVisible();
  });
});
