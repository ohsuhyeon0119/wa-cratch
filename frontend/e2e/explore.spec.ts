import { test, expect } from '@playwright/test';

test('페이지 헤더와 검색창이 렌더링된다', async ({ page }) => {
  // Given
  await page.goto('/explore');
  // Then
  await expect(page.getByText('작품을')).toBeVisible();
  await expect(page.getByPlaceholder(/작품 이름/)).toBeVisible();
});

test('프로젝트 카드 그리드가 렌더링된다', async ({ page }) => {
  // Given
  await page.goto('/explore');
  // Then
  const cards = page.locator('[class*="projCard"]');
  await expect(cards).toHaveCount(10);
});

test('정렬 탭 클릭 시 활성 탭이 변경된다', async ({ page }) => {
  // Given
  await page.goto('/explore');
  // When
  await page.getByRole('button', { name: /조회순/ }).click();
  // Then
  await expect(page.getByRole('button', { name: /조회순/ })).toHaveClass(/active/);
  await expect(page.getByRole('button', { name: /최신순/ })).not.toHaveClass(/active/);
});
