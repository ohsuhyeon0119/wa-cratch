import { test, expect } from '@playwright/test';

test('내비게이션과 스테이지 캔버스가 렌더링된다', async ({ page }) => {
  // Given
  await page.goto('/play/test');
  // Then
  await expect(page.locator('nav')).toBeVisible();
  await expect(page.locator('[class*="stageWrapper"]')).toBeVisible();
});

test('좋아요/공유/리믹스 버튼이 렌더링된다', async ({ page }) => {
  // Given
  await page.goto('/play/test');
  // Then
  await expect(page.getByRole('button', { name: /좋아요/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /공유/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /리믹스/ })).toBeVisible();
});

test('우측 패널에 조작방법 카드가 렌더링된다', async ({ page }) => {
  // Given
  await page.goto('/play/test');
  // Then
  await expect(page.getByText('📋 조작 방법')).toBeVisible();
});
