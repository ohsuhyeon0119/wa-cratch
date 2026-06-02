import { test, expect } from '@playwright/test';

const fakeUserBody = JSON.stringify({
  username: 'test', nickname: '테스터', avatar: '🐱',
  projectCount: 0, followers: 0, totalLikes: 0,
});

test.describe('에디터 (인증 상태)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('token', 'test-token'));
    await page.route('**/users/me', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: fakeUserBody })
    );
  });

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
    // When — Blockly 툴박스 카테고리는 treeitem 역할로 렌더링됨
    await page.getByRole('treeitem', { name: /감지/ }).click();
    // Then — Blockly flyout(SVG)의 텍스트 내용으로 블록 확인
    const flyout = page.locator('.blocklyFlyout:not(.blocklyTrashcanFlyout)');
    await expect(flyout).toBeVisible();
    // Blockly SVG는 공백을 U+00A0(non-breaking space)로 렌더링하므로 정규화 후 비교
    const rawText = await flyout.textContent() ?? '';
    const flyoutText = rawText.replace(/ /g, ' ');
    expect(flyoutText).toMatch(/위 키 눌렸을 때/);
    expect(flyoutText).not.toMatch(/이동하기/);
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

  // #32: /editor/new 라우트 추가
  test('/editor/new 라우트가 에디터를 렌더링한다', async ({ page }) => {
    // Given
    await page.goto('/editor/new');
    // Then
    await expect(page.locator('[class*="toolbar"]').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /실행하기/ })).toBeVisible();
  });

  // #36: 상태바 스프라이트명 동적 표시
  test('상태바에 스프라이트 이름이 표시된다', async ({ page }) => {
    // Given
    await page.goto('/editor/new');
    // Then
    await expect(page.getByText(/스프라이트:/)).toBeVisible();
  });
});

// #32: Protected Route
test('비인증 상태에서 /editor/new 직접 접근 시 /login으로 리디렉션된다', async ({ page }) => {
  // Given — 토큰 없음
  // When
  await page.goto('/editor/new');
  // Then
  await expect(page).toHaveURL('/login');
});
