---
description: 래칫 기반 개발 워크플로우 실행
argument-hint: 이슈 번호 (예: #5)
---

# suhyeon-workflow

이슈 번호를 받아 브레인스토밍 → 플랜 → TDD → 구현 → 마무리까지 전체 사이클을 진행한다.

## 실행 순서

1. **이슈 파악**
   - `mcp__github__get_issue`로 이슈 #$ARGUMENTS 읽기
   - 기능 아이디어, 테스트 큰 틀 파악
   - `context7` MCP로 관련 라이브러리 최신 API 확인

2. **브레인스토밍** (`suhyeon-workflow:sw-brainstorming` 스킬 호출)
   - `design/` 디렉토리에 관련 HTML 파일이 있으면 UI/레이아웃은 그것을 기준으로 고정
   - 디자인에 없는 부분(인터랙션, 상태, API 연동 등)은 브레인스토밍에서 논의
   - 개발자와 질문/답변 반복
   - GitHub Wiki 변경 필요 시 업데이트
   - 개발자 최종 승인 후 다음 단계

3. **브랜치 + 워크스페이스 격리** (`superpowers:using-git-worktrees` 호출)
   - 브랜치 생성: `feat/$ARGUMENTS-간단한설명`
   - 격리된 워크트리 생성
   - 테스트 기준선 확인 (기존 테스트 전부 통과 상태인지)

4. **플랜 작성** (`suhyeon-workflow:sw-writing-plans` 스킬 호출)
   - 브레인스토밍 결과를 2~5분 단위 태스크로 분해
   - 각 태스크: 파일 경로, 구현 내용, 검증 방법 명시
   - 개발자 승인 후 다음 단계

5. **TDD** (`suhyeon-workflow:sw-tdd` 스킬 호출)
   - 테스트 시나리오 목록 제시 → 개발자 승인
   - Playwright / Hurl 테스트 코드 작성 → 개발자 승인
   - 승인 후 다음 단계

6. **구현** (`superpowers:subagent-driven-development` 호출)
   - 플랜의 태스크 순서대로 서브에이전트 디스패치
   - 각 태스크: TDD 사이클 (Red → Green → Refactor)
   - Hook이 커밋마다 테스트 통과 자동 강제

7. **마무리** (`superpowers:finishing-a-development-branch` 호출)
   - PR 생성 / 머지 / 정리 옵션 제시
   - PR은 개발자가 명시적으로 선택할 때만 생성

## 주의
- 테스트 파일(e2e/, tests/hurl/)은 개발자 승인 없이 수정하지 않는다
- main 브랜치에 직접 커밋하지 않는다
- 각 단계는 개발자 승인 없이 다음 단계로 넘어가지 않는다
