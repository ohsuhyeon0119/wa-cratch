# #17 service 및 database 단 완성 플랜

## 브레인스토밍 결정 요약
- 엔드포인트: `/auth/me` → `/users/me`, `/projects/my` → `/projects/me` (백엔드 변경)
- Likes: `projects.likes` INT 컬럼만 (별도 테이블 없음)
- Activity: mock 유지
- User 통계: 동적 계산 (projectCount=COUNT, totalLikes=SUM, followers=0)
- DB 초기화: FastAPI startup 이벤트에서 테이블 생성 + test 계정 시드
- Hurl 테스트 파일 URL 수정 승인됨

## 영향 범위

### 생성
- `backend/app/services/__init__.py`
- `backend/app/services/auth_service.py`
- `backend/app/services/project_service.py`
- `backend/app/routers/users.py`

### 수정
- `backend/app/models/user.py` — nickname, avatar 컬럼 추가
- `backend/app/models/project.py` — emoji, description, tags, likes, views, published 컬럼 추가
- `backend/app/routers/auth.py` — mock 제거, DB 서비스 연동
- `backend/app/routers/projects.py` — mock 제거, DB 서비스 연동, /my → /me
- `backend/app/main.py` — startup 이벤트, users 라우터 등록
- `backend/app/schemas/__init__.py` — UserResponse에 created_at 제거 확인
- `backend/tests/hurl/auth.hurl` — /auth/me → /users/me
- `backend/tests/hurl/projects.hurl` — /projects/my → /projects/me

## 태스크

### Task 1 — DB 모델 확장 (3분)
- 파일: `backend/app/models/user.py`, `backend/app/models/project.py`
- 구현:
  - User: `nickname VARCHAR NOT NULL`, `avatar VARCHAR DEFAULT '🐱'` 추가
  - Project: `emoji VARCHAR DEFAULT '🐱'`, `description TEXT DEFAULT ''`, `tags JSONB DEFAULT []`, `likes INT DEFAULT 0`, `views INT DEFAULT 0`, `published BOOLEAN DEFAULT false` 추가
- 검증: `python3 -c "from app.models.user import User; from app.models.project import Project; print('OK')"` (venv 활성화 후)

### Task 2 — Auth 서비스 레이어 (3분)
- 파일: `backend/app/services/__init__.py`, `backend/app/services/auth_service.py`
- 구현:
  - `create_user(db, username, nickname, password) → User`
  - `get_user_by_username(db, username) → User | None`
  - `authenticate_user(db, username, password) → User | None`
  - `get_user_stats(db, user_id) → dict` — projectCount, totalLikes, followers(=0)
- 검증: 모듈 임포트 확인

### Task 3 — Project 서비스 레이어 (3분)
- 파일: `backend/app/services/project_service.py`
- 구현:
  - `list_public_projects(db, sort, search) → list[Project]`
  - `list_user_projects(db, user_id) → list[Project]`
  - `get_project(db, project_id) → Project | None`
  - `create_project(db, user_id, data) → Project`
  - `update_project(db, project_id, data) → Project`
  - `delete_project(db, project_id) → None`
- 검증: 모듈 임포트 확인

### Task 4 — Auth 라우터 DB 연동 (3분)
- 파일: `backend/app/routers/auth.py`
- 구현:
  - `MOCK_USERS` 딕셔너리 제거
  - `/auth/register`: `auth_service.create_user()` 호출
  - `/auth/login`: `auth_service.authenticate_user()` 호출
  - DB 세션 `Depends(get_db)` 주입
- 검증: hurl auth.hurl (register, login, 401 케이스)

### Task 5 — Users 라우터 신규 생성 (2분)
- 파일: `backend/app/routers/users.py`
- 구현:
  - `GET /users/me`: JWT 검증 → `auth_service.get_user_stats()` → `UserResponse` 반환
- 검증: hurl auth.hurl (GET /users/me)

### Task 6 — Projects 라우터 DB 연동 (4분)
- 파일: `backend/app/routers/projects.py`
- 구현:
  - `MOCK_PROJECTS` 딕셔너리 제거
  - `MOCK_USERS` import 제거
  - 모든 엔드포인트 `project_service.*` 호출로 교체
  - `/projects/my` → `/projects/me` 이름 변경
  - DB 세션 `Depends(get_db)` 주입
- 검증: hurl projects.hurl (CRUD 전체)

### Task 7 — Main.py 업데이트 (2분)
- 파일: `backend/app/main.py`
- 구현:
  - FastAPI `lifespan` 컨텍스트 매니저 추가:
    - `Base.metadata.create_all(bind=engine)`
    - `test` 계정 없으면 시드 (username="test", nickname="테스트유저", password="test", avatar="🧇")
  - `users` 라우터 등록: `prefix="/users"`
- 검증: 서버 기동 + `GET /users/me` 응답 확인

### Task 8 — Hurl 테스트 URL 수정 (2분)
- 파일: `backend/tests/hurl/auth.hurl`, `backend/tests/hurl/projects.hurl`
- 구현:
  - `auth.hurl`: `GET /auth/me` → `GET /users/me`
  - `projects.hurl`: `GET /projects/my` → `GET /projects/me`
- 검증: `hurl --test backend/tests/hurl/*.hurl --variable base_url=http://localhost:8000`
