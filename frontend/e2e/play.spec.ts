import { test, expect } from '@playwright/test';

test('내비게이션과 스테이지 캔버스가 렌더링된다', async ({ page }) => {
  // Given
  await page.goto('/play/test');
  // Then
  await expect(page.locator('nav')).toBeVisible();
  await expect(page.locator('[class*="stageWrapper"]')).toBeVisible();
});

test('좋아요/공유 버튼이 렌더링된다', async ({ page }) => {
  // Given
  await page.goto('/play/test');
  // Then
  await expect(page.getByRole('button', { name: /좋아요/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /공유/ })).toBeVisible();
});

test('우측 패널에 조작방법 카드가 렌더링된다', async ({ page }) => {
  // Given
  await page.goto('/play/test');
  // Then
  await expect(page.getByText('📋 조작 방법')).toBeVisible();
});

test('좋아요 버튼 클릭 시 활성 상태로 토글된다', async ({ page }) => {
  // Given
  await page.goto('/play/test');
  const likeBtn = page.getByRole('button', { name: /좋아요/ });
  await expect(likeBtn).not.toHaveClass(/liked/);
  // When
  await likeBtn.click();
  // Then
  await expect(likeBtn).toHaveClass(/liked/);
});

test('공유 버튼 클릭 시 공유 모달이 나타난다', async ({ page }) => {
  // Given
  await page.goto('/play/test');
  // When
  await page.getByRole('button', { name: /공유/ }).click();
  // Then
  await expect(page.locator('[class*="shareModal"]')).toBeVisible();
  await expect(page.getByRole('button', { name: /링크 복사/ })).toBeVisible();
});

test('공유 모달에서 ESC 키 누르면 모달이 닫힌다', async ({ page }) => {
  // Given
  await page.goto('/play/test');
  await page.getByRole('button', { name: /공유/ }).click();
  await expect(page.locator('[class*="shareModal"]')).toBeVisible();
  // When
  await page.keyboard.press('Escape');
  // Then
  await expect(page.locator('[class*="shareModal"]')).not.toBeVisible();
});
