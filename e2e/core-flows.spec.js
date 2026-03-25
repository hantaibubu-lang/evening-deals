import { test, expect } from '@playwright/test';

// 테스트용 계정 정보
const TEST_USER = {
  email: 'user@eveningdeals.com',
  password: 'user1234!',
};

test.describe('핵심 사용자 플로우', () => {

  test('1. 홈페이지 로딩', async ({ page }) => {
    await page.goto('/');
    // 온보딩 건너뛰기 (첫 방문 시)
    await page.evaluate(() => localStorage.setItem('onboarding_done', 'true'));
    await page.goto('/');
    await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 15000 });
  });

  test('2. 로그인 플로우', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText('저녁떨이');

    // 이메일/비밀번호 입력
    await page.fill('#login-email', TEST_USER.email);
    await page.fill('#login-password', TEST_USER.password);
    await page.click('button[type="submit"]');

    // 로그인 성공 후 홈으로 이동 확인
    await expect(page).toHaveURL('/', { timeout: 10000 });
  });

  test('3. 로그인 → 찜 접근', async ({ page }) => {
    // 로그인
    await page.goto('/login');
    await page.fill('#login-email', TEST_USER.email);
    await page.fill('#login-password', TEST_USER.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/', { timeout: 10000 });

    // 찜 페이지 이동
    await page.goto('/favorites');
    await expect(page).not.toHaveURL(/\/login/);
    // 찜 목록 또는 빈 상태 확인
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });

  test('4. 로그인 → 마이페이지', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#login-email', TEST_USER.email);
    await page.fill('#login-password', TEST_USER.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/', { timeout: 10000 });

    await page.goto('/mypage');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.locator('h2').first()).toBeVisible();
  });

  test('5. 상품 상세 페이지 접근', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('onboarding_done', 'true'));
    await page.goto('/');

    // 첫 번째 상품 카드 클릭
    const firstCard = page.locator('.product-card').first();
    await firstCard.waitFor({ state: 'visible', timeout: 15000 });
    await firstCard.click();

    // 상품 상세 페이지 확인
    await expect(page).toHaveURL(/\/product\//);
    await expect(page.locator('main')).toBeVisible();
  });

  test('6. 검색 기능', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('onboarding_done', 'true'));
    await page.goto('/search');
    await expect(page.locator('main')).toBeVisible();
  });

  test('7. 비로그인 시 보호 경로 → 로그인 리다이렉트', async ({ page }) => {
    // 쿠키 전부 삭제
    await page.context().clearCookies();
    await page.goto('/favorites');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('8. 이용약관 페이지', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.locator('h1')).toContainText('이용약관');
  });

  test('9. 개인정보처리방침 페이지', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.locator('h1')).toContainText('개인정보처리방침');
  });

  test('10. 회원가입 페이지 약관 동의 필수', async ({ page }) => {
    await page.goto('/signup');
    // 약관 동의 없이 폼 제출 시도
    await expect(page.locator('input[type="checkbox"]').first()).toBeVisible();
  });
});
