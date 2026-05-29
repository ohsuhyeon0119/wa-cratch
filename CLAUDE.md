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

### 작업 사이클 (이슈 하나 처리 흐름)

```
1. GitHub 칸반보드에서 이슈 확인 (개발자)
2. 테스트 코드 먼저 작성 (개발자)
   - 백엔드: backend/tests/hurl/ 에 Hurl 파일
   - 프론트: frontend/e2e/ 에 Playwright 스펙
3. /feature-dev 실행 → AI가 이슈 내용 + 테스트 코드를 함께 읽고 구현
4. 작업 단위마다 커밋
   - 형식: feat: [작업 내용 명시] (#이슈번호)
   - Pre-commit Hook이 관련 테스트 통과 여부 강제 검증 (실패 시 커밋 차단)
5. 모든 테스트 통과 → 개발자가 PR 생성 요청 → AI가 PR 작성
6. GitHub Actions에서 Hurl + Playwright 자동 실행
7. 통과 → 머지 → 칸반 Done
```

### Hook 규칙 (.claude/settings.json)
- **PreToolUse / git commit**: Hurl + Playwright 테스트 미통과 시 커밋 차단 (exit 2)
- **PreToolUse / Edit,Write**: `backend/tests/hurl/`, `frontend/e2e/` 파일 수정 차단 (exit 2)
- **PreToolUse / Bash**: `git push --force` 차단 (exit 2)

### Knowledge Base
GitHub Wiki에 유지. AI는 읽기만 하고 절대 수정하지 않는다.
