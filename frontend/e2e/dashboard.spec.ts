import { test, expect } from '@playwright/test';

test('상단 내비게이션과 사이드바가 렌더링된다', async ({ page }) => {
  // Given
  await page.goto('/dashboard');
  // Then
  await expect(page.locator('[class*="topnav"]')).toBeVisible();
  await expect(page.locator('[class*="sidebar"]')).toBeVisible();
  await expect(page.getByRole('link', { name: /내 프로젝트/ })).toBeVisible();
});

test('웰컴 배너가 렌더링된다', async ({ page }) => {
  // Given
  await page.goto('/dashboard');
  // Then
  await expect(page.locator('[class*="welcome"]').first()).toBeVisible();
  await expect(page.getByText(/오늘도 멋진 작품을 만들어볼까요/)).toBeVisible();
});

test('프로젝트 그리드가 렌더링된다', async ({ page }) => {
  // Given
  await page.goto('/dashboard');
  // Then
  await expect(page.getByText('🎮 내 프로젝트')).toBeVisible();
  await expect(page.locator('[class*="projGrid"]')).toBeVisible();
});
