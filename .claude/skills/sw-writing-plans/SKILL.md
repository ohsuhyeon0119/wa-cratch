---
name: sw-writing-plans
description: >
  브레인스토밍 결과를 구체적인 구현 플랜으로 변환.
  superpowers:writing-plans를 기반으로 하되 프로젝트 구조
  (Playwright/Hurl 테스트, 프론트/백엔드 분리)를 반영한다.
  "플랜 작성", "태스크 분해", "구현 계획" 키워드에 트리거.
---

# sw-writing-plans

`superpowers:writing-plans` 스킬을 기반으로 동작한다.
아래는 프로젝트에 맞게 추가된 규칙이다.

## 플랜 형식

브레인스토밍 승인 결과를 받아 아래 형식으로 플랜을 작성한다.
저장 위치: `docs/suhyeon-workflow/plans/YYYY-MM-DD-이슈번호-기능명.md`

```markdown
# #5 로그인 기능 구현 플랜

## 영향 범위
- 생성: frontend/src/components/LoginForm.tsx
- 수정: backend/app/routes/auth.py
- 테스트: frontend/e2e/login.spec.ts, backend/tests/hurl/auth.hurl

## 태스크

### Task 1 — 백엔드 로그인 엔드포인트 (3분)
- 파일: backend/app/routes/auth.py
- 구현: POST /auth/login → JWT 반환
- 검증: hurl --test backend/tests/hurl/auth.hurl

### Task 2 — 프론트엔드 LoginForm 컴포넌트 (4분)
- 파일: frontend/src/components/LoginForm.tsx
- 구현: 이메일/비밀번호 입력 + 제출 버튼
- 검증: npx playwright test e2e/login.spec.ts

...
```

## 태스크 작성 규칙

- 태스크 하나당 2~5분 분량으로 쪼갠다
- 프론트엔드 / 백엔드 태스크를 분리한다
- 각 태스크에 반드시 포함: 파일 경로, 구현 내용, 검증 명령어
- 태스크 순서는 의존성 기준으로 정렬 (백엔드 API → 프론트엔드 연동)
- DRY, YAGNI 원칙 준수

## 승인 게이트

플랜 작성 후 개발자에게 제시:
```
플랜 작성 완료: docs/suhyeon-workflow/plans/YYYY-MM-DD-#5-login.md

총 N개 태스크 / 예상 소요 약 XX분
[태스크 목록 요약]

승인하시겠습니까? 수정할 태스크가 있으면 말씀해주세요.
```

개발자 승인 전까지 구현 단계로 넘어가지 않는다.
