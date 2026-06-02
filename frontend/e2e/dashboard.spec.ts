import { test, expect } from '@playwright/test';

const fakeUserBody = JSON.stringify({
  username: 'test', nickname: '테스터', avatar: '🐱',
  projectCount: 0, followers: 0, totalLikes: 0,
});

test.describe('대시보드 (인증 상태)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('token', 'test-token'));
    await page.route('**/users/me', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: fakeUserBody })
    );
    await page.route('**/projects/me', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    );
  });

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

  test('로그아웃 클릭 시 홈으로 이동한다', async ({ page }) => {
    // Given
    await page.goto('/dashboard');
    // When
    await page.getByRole('link', { name: /로그아웃/ }).click();
    // Then
    await expect(page).toHaveURL('/');
  });

  // #31: 로그아웃 시 localStorage 토큰 제거
  test('로그아웃 후 localStorage에서 token이 제거된다', async ({ page }) => {
    // Given
    await page.goto('/dashboard');
    // When
    await page.getByRole('link', { name: /로그아웃/ }).click();
    await expect(page).toHaveURL('/');
    // Then
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
  });

  // #35: 전체 보기 링크 제거
  test('"전체 보기" 링크가 존재하지 않는다', async ({ page }) => {
    // Given
    await page.goto('/dashboard');
    // Then
    await expect(page.getByText('전체 보기 →')).not.toBeVisible();
  });
});

// #32: Protected Route
test('비인증 상태에서 /dashboard 직접 접근 시 /login으로 리디렉션된다', async ({ page }) => {
  // Given — 토큰 없음 (localStorage 기본 비어 있음)
  // When
  await page.goto('/dashboard');
  // Then
  await expect(page).toHaveURL('/login');
});
