# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Service Overview

**CatCratch** — 어린이 대상 블록 코딩 서비스. Blockly 기반 블록 에디터 + HTML5 Canvas 2D 스테이지. 추후 AI 에이전트(Claude API) 통합 예정.

## 기능 스펙

**UI 레이아웃**
Scratch 방식 3패널: `[툴박스] | [블록 워크스페이스] | [스테이지]`

**블록 기능**
- 움직임: 상하좌우 이동, 좌표 이동, 회전
- 감지: 키보드 입력, 벽 충돌
- 말풍선: 말하기 블록

**스테이지**
- HTML5 Canvas, 단색 배경 고정
- 스프라이트 1개, 기본 에셋 라이브러리 (확장 가능)
- 실행 버튼 → 위에서 아래로 순차 실행

**계정 / 프로젝트**
- 로그인/회원가입 (JWT)
- 프로젝트 저장/불러오기
- 링크 공유 → `/play/:id` 로 누구나 접근 가능한 플레이어 뷰 (편집 불가)

**2차 구현 (AI 에이전트)**
- Claude API 채팅 패널
- 블록 JSON 자동 조립
- 현재 프로젝트 설명 및 디버깅

## 개발 커맨드

```bash
# 프론트엔드
cd frontend && yarn dev           # dev server (http://localhost:5173)
cd frontend && yarn build
cd frontend && npx playwright test

# 백엔드
cd backend && uvicorn app.main:app --reload  # (http://localhost:8000)

# 로컬 전체 환경
docker-compose up                 # DB + backend
docker-compose up db              # DB만

# 테스트
hurl --test backend/tests/hurl/*.hurl --variable base_url=http://localhost:8000
cd frontend && npx playwright test
```

## 기술 스택

| 영역 | 선택 |
|------|------|
| Frontend | React + TypeScript (Vite), Yarn |
| 스타일 | CSS Modules |
| 상태관리 | React Context |
| 블록 에디터 | Blockly (raw, useEffect로 DOM inject) |
| 스테이지 | HTML5 Canvas |
| Backend | Python FastAPI, pip + requirements.txt |
| ORM | SQLAlchemy |
| DB | PostgreSQL |
| Auth | JWT |
| 로컬 환경 | Docker Compose (모노레포) |
| 배포 | 추후 결정 |

## 개발 파이프라인

### 래칫 방법론 (Ratchet Pattern)
구현은 AI가 한다. 완료 판정은 테스트가 한다.

- **LLM**: 생성만 한다
- **Verifier** (Hurl / Playwright): pass/fail 판정만 한다
- **Ratchet** (Pre-commit Hook): 테스트 통과 전까지 커밋을 막는다

테스트 코드는 개발자가 직접 작성한다. AI는 테스트 파일을 수정할 수 없다. 테스트가 통과하면 그 상태는 잠긴다 — 뒤로 돌아가지 않는다.

### 역할 분담

| 항목 | 개발자 | AI |
|------|--------|----|
| 이슈 작성 / 칸반 관리 | ✅ | 읽기만 |
| 테스트 코드 작성 | ✅ | 확인 요청 후 수정 가능 |
| 기능 구현 | | ✅ |
| 커밋 | | ✅ (테스트 통과 후) |
| PR 생성 | | ✅ (개발자 요청 시) |
| PR 머지 | ✅ | |
| Wiki 수정 | ✅ | 읽기만 |

### 작업 사이클 (이슈 하나 처리 흐름)

```
1. GitHub 칸반보드에서 이슈 확인
2. 테스트 코드 먼저 작성 (개발자)
   - 백엔드: backend/tests/hurl/ 에 Hurl 파일
   - 프론트: frontend/e2e/ 에 Playwright 스펙
3. /suhyeon-workflow #이슈번호 실행
   - GitHub MCP로 이슈 읽기 + design/ 디렉토리 디자인 파일 확인
   - 브레인스토밍 → 플랜 → TDD → 구현 순으로 진행 (각 단계 개발자 승인)
   - 구현 목표: 이미 작성된 테스트가 통과하는 것
4. 작업 단위마다 커밋
   - 형식: feat: [작업 내용 명시] (#이슈번호)
   - Pre-commit Hook이 테스트 통과 여부 강제 검증 (실패 시 커밋 차단)
5. 모든 테스트 통과 → 개발자가 PR 생성 요청 → AI가 GitHub MCP로 PR 작성
6. GitHub Actions에서 Hurl + Playwright 자동 실행
7. 통과 → 머지 → 칸반 Done
```

### Hook 규칙 (.claude/settings.json)
- **PreToolUse / git commit**: Hurl + Playwright 테스트 미통과 시 커밋 차단 (exit 2)
- **PreToolUse / Bash**: `git push --force` 차단 (exit 2)

### Knowledge Base
GitHub Wiki에 유지. AI는 읽기만 하고 절대 수정하지 않는다.

KB가 필요할 때는 Wiki 레포를 클론해서 읽는다:
```bash
git clone https://github.com/ohsuhyeon0119/cat-cratch.wiki.git /tmp/catcratch-wiki
```

---

## AI 행동 지침

### 작업 시작 시

1. **이슈 파악**: GitHub MCP로 해당 이슈 읽기 → 스펙, 완료 조건 확인
2. **KB 확인**: 관련 아키텍처/도메인 내용이 있으면 Wiki에서 읽기
3. **라이브러리 문서**: 외부 라이브러리 코드 작성 전 Context7 MCP로 최신 API 확인

### 구현 중

- 테스트 파일(`backend/tests/hurl/`, `frontend/e2e/`)을 수정해야 할 경우, 반드시 개발자에게 먼저 확인을 받는다. 확인 없이 절대 수정하지 않는다.
- 커밋은 작업 단위로, 반드시 이슈 번호를 포함한다
  ```
  feat: 로그인 API 구현 (#3)
  fix: 스프라이트 이동 오차 수정 (#7)
  ```
- 커밋 전, 현재 이슈에 해당하는 테스트(Hurl / Playwright)가 모두 통과해야 한다. 통과하지 않으면 커밋하지 않는다.
- 커밋 전 테스트 통과 여부는 Hook이 자동 검증한다 (실패 시 차단됨)

### PR 생성 시

- 개발자가 명시적으로 요청할 때만 PR을 생성한다
- PR 본문에 관련 이슈 번호(`Closes #N`), 변경 내용, 테스트 방법을 포함한다
- PR 생성 후 GitHub Actions 결과를 확인한다

### 브랜치 전략

- `main` 브랜치에 직접 커밋하지 않는다
- 이슈 작업 시 `feat/이슈번호-간단한설명` 브랜치를 생성해서 작업한다
  ```
  feat/3-auth-login
  feat/7-sprite-motion
  fix/12-wall-collision-bug
  ```
- 작업 완료 후 PR → main 머지

### 하지 말아야 할 것

- `main`에 직접 커밋
- 테스트 파일을 개발자 확인 없이 수정
- `git push --force`
- GitHub 이슈/칸반 상태 변경 (읽기만 가능)
- Wiki 내용 수정 (읽기만 가능)

## MCP 사용 가이드

### Context7
**언제**: 라이브러리 API를 사용하는 코드를 작성하기 전 항상 호출한다.
**왜**: 학습 데이터가 오래됐을 수 있다. Blockly, FastAPI, React 등 버전별 API 변경사항을 놓치지 않기 위함.
**대상**: Blockly, React, FastAPI, SQLAlchemy, Playwright 등 외부 라이브러리 사용 시.

### GitHub MCP
**언제**: 칸반보드 확인 + 작업 사이클 1단계(이슈 파악) + PR 생성 시.
**왜**: 이슈에 적힌 API 스펙, UI 플로우, 완료 조건을 정확히 읽어야 구현 방향이 틀리지 않는다.
**주의**: 이슈/PR/칸반 상태 변경은 개발자만 한다. AI는 이슈 읽기와 PR 생성만.

### Playwright MCP
**언제**: 프론트엔드 테스트 코드를 작성할 때 (실행할 때 아님).
**왜**: 실제 DOM을 보지 않고 셀렉터를 추측하면 테스트가 불안정해진다. MCP로 실제 UI를 보고 정확한 셀렉터를 확인한 뒤 스펙을 작성한다.
**구분**:
- Playwright MCP → 테스트 작성 시 (DOM 탐색, 셀렉터 확인)
- `npx playwright test --headless` → 래칫 검증/CI (Hook에서 자동 실행)

## 에이전트 전략
대화 과정에서 명확하게 정해지지 않은 스펙 사항이 있으면 다시 되물어보면서 구체화하라.