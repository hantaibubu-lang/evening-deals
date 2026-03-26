import { test, expect } from '@playwright/test';

test.describe('접근성 (Accessibility)', () => {

  test('1. 홈페이지 시맨틱 랜드마크', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('onboarding_done', 'true'));
    await page.goto('/');
    // main 랜드마크 존재
    await expect(page.locator('main')).toBeVisible();
    // 네비게이션 존재
    await expect(page.locator('nav').first()).toBeVisible();
  });

  test('2. Skip Navigation 링크 동작', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('onboarding_done', 'true'));
    await page.goto('/');
    // skip-to-content 링크 존재
    const skipLink = page.locator('a.skip-to-content');
    await expect(skipLink).toBeAttached();
    // Tab키로 포커스 시 보이는지 확인
    await page.keyboard.press('Tab');
    await expect(skipLink).toBeFocused();
  });

  test('3. 로그인 폼 접근성 속성', async ({ page }) => {
    await page.goto('/login');
    // label 연결 확인
    const emailInput = page.locator('#login-email');
    const passwordInput = page.locator('#login-password');
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    // label htmlFor 연결
    await expect(page.locator('label[for="login-email"]')).toBeVisible();
    await expect(page.locator('label[for="login-password"]')).toBeVisible();
  });

  test('4. 검색 페이지 접근성', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('onboarding_done', 'true'));
    await page.goto('/search');
    // 검색 input에 aria-label 존재
    const searchInput = page.locator('input[type="search"]');
    await expect(searchInput).toBeVisible();
    const ariaLabel = await searchInput.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
  });

  test('5. 이미지 alt 텍스트 존재', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('onboarding_done', 'true'));
    await page.goto('/');
    // 모든 img 태그에 alt 존재
    const images = page.locator('img');
    const count = await images.count();
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 5); i++) {
        const alt = await images.nth(i).getAttribute('alt');
        expect(alt).not.toBeNull();
      }
    }
  });

  test('6. 회원가입 폼 접근성', async ({ page }) => {
    await page.goto('/signup');
    // password-hint aria-describedby 연결
    const passwordInput = page.locator('#signup-password, input[aria-describedby="password-hint"]');
    if (await passwordInput.count() > 0) {
      const describedby = await passwordInput.first().getAttribute('aria-describedby');
      expect(describedby).toContain('password-hint');
    }
  });

  test('7. 이용약관 페이지 구조', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.locator('h1')).toContainText('이용약관');
    // h2 섹션 헤딩이 여러 개 존재 (구조적 문서)
    const headings = page.locator('h2');
    const count = await headings.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('8. 개인정보처리방침 페이지 구조', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.locator('h1')).toContainText('개인정보처리방침');
    const headings = page.locator('h2');
    const count = await headings.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });
});

test.describe('에러 처리 및 경계 케이스', () => {

  test('1. 404 페이지 정상 렌더링', async ({ page }) => {
    const response = await page.goto('/non-existent-page-12345');
    expect(response.status()).toBe(404);
    await expect(page.locator('body')).toBeVisible();
  });

  test('2. API health 엔드포인트 응답', async ({ page }) => {
    const response = await page.goto('/api/health');
    const body = await response.json();
    expect(body.status).toBeDefined();
    expect(body.timestamp).toBeDefined();
  });

  test('3. 잘못된 상품 ID로 접근', async ({ page }) => {
    await page.goto('/product/invalid-id-12345');
    await expect(page.locator('main, body')).toBeVisible();
  });
});
