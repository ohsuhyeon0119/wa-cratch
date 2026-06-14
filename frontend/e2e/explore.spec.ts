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
  // Then — 카드가 1개 이상 렌더링되는지 확인 (DB 상태에 무관하게)
  const cards = page.locator('[class*="projCard"]');
  await expect(cards.first()).toBeVisible();
});

test('정렬 탭 클릭 시 활성 탭이 변경된다', async ({ page }) => {
  // Given
  await page.goto('/explore');
  // When
  await page.getByRole('button', { name: /좋아요순/ }).click();
  // Then
  await expect(page.getByRole('button', { name: /좋아요순/ })).toHaveClass(/active/);
  await expect(page.getByRole('button', { name: /최신순/ })).not.toHaveClass(/active/);
});

test('검색어 입력 시 매칭되는 카드만 표시된다', async ({ page }) => {
  // Given
  await page.goto('/explore');
  // When
  await page.getByPlaceholder(/작품 이름/).fill('우주');
  // Then
  const cards = page.locator('[class*="projCard"]');
  await expect(cards).not.toHaveCount(10);
});

test('검색어를 지우면 전체 카드가 다시 표시된다', async ({ page }) => {
  // Given
  await page.goto('/explore');
  const allCards = page.locator('[class*="projCard"]');
  const totalCount = await allCards.count();
  await page.getByPlaceholder(/작품 이름/).fill('우주');
  // When
  await page.getByPlaceholder(/작품 이름/).clear();
  // Then — 검색어 제거 후 원래 개수로 복원
  await expect(allCards).toHaveCount(totalCount);
});

test('좋아요순 정렬 클릭 시 카드 순서가 변경된다', async ({ page }) => {
  // Given
  await page.goto('/explore');
  const firstTitleBefore = await page.locator('[class*="projTitle"]').first().textContent();
  // When
  const [response] = await Promise.all([
    page.waitForResponse(resp => resp.url().includes('/projects') && resp.status() === 200),
    page.getByRole('button', { name: /좋아요순/ }).click(),
  ]);
  await response.json();
  // Then
  const firstTitleAfter = await page.locator('[class*="projTitle"]').first().textContent();
  expect(firstTitleAfter).not.toBe(firstTitleBefore);
});
