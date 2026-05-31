import { test, expect } from '@playwright/test';

test('로그인 탭이 기본으로 활성화된다', async ({ page }) => {
  // Given
  await page.goto('/login');
  // Then
  const loginTab = page.getByRole('button', { name: '🔑 로그인' });
  await expect(loginTab).toHaveClass(/active/);
  await expect(page.getByText('다시 만났어요!')).toBeVisible();
});

test('회원가입 탭 클릭 시 회원가입 폼으로 전환된다', async ({ page }) => {
  // Given
  await page.goto('/login');
  // When
  await page.getByRole('button', { name: /회원가입/ }).click();
  // Then
  await expect(page.getByText('와피냥 친구 되기!')).toBeVisible();
  await expect(page.getByPlaceholder(/닉네임/)).toBeVisible();
});

test('비밀번호 입력 시 강도 표시가 나타난다', async ({ page }) => {
  // Given
  await page.goto('/login');
  await page.getByRole('button', { name: /회원가입/ }).click();
  // When
  await page.getByPlaceholder(/8자 이상/).fill('test1234');
  // Then
  await expect(page.locator('[class*="pwStrength"]')).toBeVisible();
});
