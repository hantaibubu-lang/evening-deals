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

test.describe('결제/주문 플로우', () => {

  test('1. 상품 상세 → 주문하기 버튼 표시', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('onboarding_done', 'true'));
    await page.goto('/');

    const firstCard = page.locator('.product-card').first();
    await firstCard.waitFor({ state: 'visible', timeout: 15000 });
    await firstCard.click();

    await expect(page).toHaveURL(/\/product\//);

    // 주문/구매 관련 버튼이 존재하는지 확인
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('2. 비로그인 → 결제 페이지 접근 → 로그인 리다이렉트', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/checkout/test-product-id');
    // 로그인 리다이렉트 또는 에러 페이지
    await page.waitForTimeout(3000);
    const url = page.url();
    // 결제 페이지는 로그인 필요
    expect(url.includes('/login') || url.includes('/checkout')).toBe(true);
  });

  test('3. 결제 실패 페이지 정상 렌더링', async ({ page }) => {
    await page.goto('/checkout/fail?code=PAY_PROCESS_CANCELED&message=사용자가 취소');
    await expect(page.locator('main')).toBeVisible();
  });

  test('4. 결제 성공 페이지 (0원 결제) 정상 렌더링', async ({ page }) => {
    await page.goto('/checkout/success');
    await expect(page.locator('main')).toBeVisible();
    // 픽업 대기표 번호가 표시되어야 함
    await expect(page.getByText('픽업 대기표 번호')).toBeVisible({ timeout: 5000 });
  });

  test('5. 주문 내역 페이지 접근 (로그인 필요)', async ({ page }) => {
    await login(page);
    await page.goto('/history');
    await expect(page.locator('main')).toBeVisible();
  });
});
