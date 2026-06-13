import { test, expect } from '@playwright/test';

const fakeUserBody = JSON.stringify({
  username: 'test', nickname: '테스터', avatar: '🐱',
  projectCount: 0, totalLikes: 0,
});

const fakeAgentStream = 'data: 안녕! 나는 와냥이야!\n\ndata: [DONE]\n\n';

test.describe('텍스트 에이전트 (인증 상태)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('token', 'test-token'));
    await page.route('**/users/me', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: fakeUserBody })
    );
    await page.route('**/agent/chat', route =>
      route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
        body: fakeAgentStream,
      })
    );
  });

  test('에디터에 💬 채팅 버튼이 표시된다', async ({ page }) => {
    // Given
    await page.goto('/editor/new');
    // Then
    await expect(page.getByRole('button', { name: /채팅|와냥이|chat/i })).toBeVisible();
  });

  test('💬 버튼 클릭 시 채팅 패널이 열린다', async ({ page }) => {
    // Given
    await page.goto('/editor/new');
    // When
    await page.getByRole('button', { name: /채팅|와냥이|chat/i }).click();
    // Then
    await expect(page.getByRole('textbox')).toBeVisible();
  });

  test('채팅 패널 열린 상태에서 닫기 클릭 시 패널이 닫힌다', async ({ page }) => {
    // Given
    await page.goto('/editor/new');
    await page.getByRole('button', { name: /채팅|와냥이|chat/i }).click();
    await expect(page.getByRole('textbox')).toBeVisible();
    // When
    await page.getByRole('button', { name: /닫기|close/i }).click();
    // Then
    await expect(page.getByRole('textbox')).not.toBeVisible();
  });

  test('에디터에 마이크(🎙️) 버튼이 표시되지 않는다', async ({ page }) => {
    // Given
    await page.goto('/editor/new');
    // Then — VoiceAgentToggle의 aria-label 패턴
    await expect(page.getByRole('button', { name: /AI 와냥이 시작/ })).not.toBeVisible();
  });

  test('메시지 입력 후 전송 시 사용자 말풍선이 대화 내역에 표시된다', async ({ page }) => {
    // Given
    await page.goto('/editor/new');
    await page.getByRole('button', { name: /채팅|와냥이|chat/i }).click();
    // When
    await page.getByRole('textbox').fill('안녕하세요!');
    await page.getByRole('button', { name: /전송|send/i }).click();
    // Then
    await expect(page.getByText('안녕하세요!')).toBeVisible();
  });
});
