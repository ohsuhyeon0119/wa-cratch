---
name: sw-tdd
description: >
  TDD 스킬. superpowers:test-driven-development를 기반으로 하되
  시나리오 목록을 먼저 개발자에게 제시하고 승인 후 테스트 코드를 작성한다.
  Playwright(프론트), Hurl(백엔드) 형식을 강제한다.
  "테스트 작성", "TDD", "시나리오" 키워드에 트리거.
---

# sw-tdd

`superpowers:test-driven-development` 스킬의 Red-Green-Refactor 원칙을 따른다.
아래는 프로젝트에 맞게 추가된 규칙이다.

## 2단계 승인 프로세스

### 1단계: 시나리오 목록 제시

테스트 코드 작성 전에 반드시 다음 형식으로 제시한다:

```
다음 시나리오를 테스트합니다:

[프론트엔드 - Playwright]
1. (Happy Path) 버튼 클릭 시 카운트가 1 증가한다
2. (Edge Case) 카운트가 0일 때 감소 버튼은 비활성화된다

[백엔드 - Hurl]
1. (Happy Path) POST /auth/login → 200 + JWT 반환
2. (Error Case) 잘못된 비밀번호 → 401 반환

승인하시겠습니까? 추가/제거할 시나리오가 있으면 말씀해주세요.
```

개발자 승인 전까지 테스트 코드를 작성하지 않는다.

### 2단계: 테스트 코드 작성 후 승인

작성된 테스트 코드를 보여주고 개발자 확인을 받는다.
승인 후 구현 단계로 넘어간다.

## 테스트 형식 규칙

### 프론트엔드 — Playwright
```typescript
// frontend/e2e/기능명.spec.ts
test('시나리오 설명', async ({ page }) => {
  // Given
  await page.goto('/');
  // When
  await page.getByRole('button').click();
  // Then
  await expect(page.getByRole('button')).toContainText('1');
});
```

### 백엔드 — Hurl
```hurl
# backend/tests/hurl/기능명.hurl
POST {{base_url}}/endpoint
Content-Type: application/json
{ ... }

HTTP 200
[Asserts]
jsonpath "$.field" isString
```

## 절대 규칙 (superpowers:test-driven-development 준수)

- 테스트 없이 구현 코드를 먼저 작성하지 않는다
- 테스트가 실패하는 것을 반드시 확인한 후 구현한다
- 기존 테스트 파일을 개발자 승인 없이 수정하지 않는다
