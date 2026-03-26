import { test, expect } from '@playwright/test';

test.describe('사장님 플로우', () => {

  test('1. 매장 등록 페이지 접근', async ({ page }) => {
    await page.goto('/store/register');
    await expect(page.locator('main')).toBeVisible();
  });

  test('2. 매장 등록 완료 페이지 렌더링', async ({ page }) => {
    await page.goto('/store/register/complete');
    await expect(page.locator('main')).toBeVisible();
  });

  test('3. 매장 소통 페이지 렌더링', async ({ page }) => {
    await page.goto('/store/communication');
    await expect(page.locator('main')).toBeVisible();
  });

  test('4. 대시보드 주문 관리 페이지', async ({ page }) => {
    await page.goto('/store/dashboard/orders');
    await expect(page.locator('main')).toBeVisible();
  });

  test('5. 대시보드 상품 관리 페이지', async ({ page }) => {
    await page.goto('/store/dashboard/products');
    await expect(page.locator('main')).toBeVisible();
  });

  test('6. 매출 분석 페이지', async ({ page }) => {
    await page.goto('/store/dashboard/analytics');
    await expect(page.locator('main')).toBeVisible();
  });

  test('7. 마케팅 페이지', async ({ page }) => {
    await page.goto('/store/dashboard/marketing');
    await expect(page.locator('main')).toBeVisible();
  });
});
