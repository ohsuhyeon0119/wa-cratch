import { test, expect } from '@playwright/test';

test('툴바에 실행/멈추기 버튼이 렌더링된다', async ({ page }) => {
  // Given
  await page.goto('/editor/test');
  // Then
  await expect(page.locator('[class*="toolbar"]').first()).toBeVisible();
  await expect(page.getByRole('button', { name: /실행하기/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /멈추기/ })).toBeVisible();
});

test('카테고리 탭 클릭 시 해당 블록 목록으로 전환된다', async ({ page }) => {
  // Given
  await page.goto('/editor/test');
  // When
  await page.getByRole('button', { name: /감지/ }).click();
  // Then
  await expect(page.getByText(/위 키 눌렸을 때/).first()).toBeVisible();
  await expect(page.getByText(/이동하기/)).not.toBeVisible();
});

test('스테이지 패널이 렌더링된다', async ({ page }) => {
  // Given
  await page.goto('/editor/test');
  // Then
  await expect(page.locator('[class*="stagePanel"]')).toBeVisible();
  await expect(page.getByText('🎬 스테이지')).toBeVisible();
});

test('저장 버튼 클릭 시 토스트 메시지가 나타난다', async ({ page }) => {
  // Given
  await page.goto('/editor/test');
  // When
  await page.getByRole('button', { name: /저장/ }).click();
  // Then
  await expect(page.locator('[class*="toast"]')).toBeVisible();
});

test('공유하기 버튼 클릭 시 공유 모달이 나타난다', async ({ page }) => {
  // Given
  await page.goto('/editor/test');
  // When
  await page.getByRole('button', { name: /공유하기/ }).click();
  // Then
  await expect(page.locator('[class*="shareModal"]')).toBeVisible();
  await expect(page.getByRole('button', { name: /링크 복사/ })).toBeVisible();
});

test('실행하기 버튼 클릭 시 실행 중 상태로 전환된다', async ({ page }) => {
  // Given
  await page.goto('/editor/test');
  // When
  await page.getByRole('button', { name: /실행하기/ }).click();
  // Then
  await expect(page.getByText(/실행 중/)).toBeVisible();
});
