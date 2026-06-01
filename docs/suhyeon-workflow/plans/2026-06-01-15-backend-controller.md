# #15 백엔드 컨트롤러 + 프론트 API 연결 플랜

## 영향 범위

- 수정: `backend/app/schemas/__init__.py`
- 수정: `backend/app/core/security.py`
- 수정: `backend/app/routers/auth.py`
- 수정: `backend/app/routers/projects.py`
- 생성: `backend/app/routers/activity.py`
- 수정: `backend/app/main.py`
- 생성: `frontend/src/api/client.ts`
- 생성: `frontend/src/api/auth.ts`
- 생성: `frontend/src/api/projects.ts`
- 생성: `frontend/src/api/activity.ts`
- 생성: `frontend/src/context/AuthContext.tsx`
- 수정: `frontend/src/main.tsx`
- 수정: `frontend/src/pages/LoginPage/LoginPage.tsx`
- 수정: `frontend/src/pages/DashboardPage/DashboardPage.tsx`
- 수정: `frontend/src/pages/ExplorePage/ExplorePage.tsx`
- 수정: `frontend/src/pages/PlayPage/PlayPage.tsx`
- 수정: `frontend/src/pages/EditorPage/EditorPage.tsx`

## 태스크

### Task 1 — Pydantic 스키마 정의 (3분)
- 파일: `backend/app/schemas/__init__.py`
- 구현:
  - `RegisterRequest(username, nickname, password)`
  - `LoginRequest(username, password)`
  - `TokenResponse(access_token, token_type)`
  - `UserResponse(id, username, nickname, avatar, projectCount, followers, totalLikes)`
  - `ProjectResponse(id, title, author, authorId, emoji, likes, views, published, description, tags)`
  - `ProjectCreateRequest(title, emoji?, description?, tags?)`
  - `ProjectUpdateRequest(title?, emoji?, description?, tags?, published?, blocks_json?)`
  - `ActivityResponse(type, icon, text, actor, projectTitle, time)`
- 검증: 파이썬 import 오류 없음

### Task 2 — JWT + 비밀번호 보안 유틸 (3분)
- 파일: `backend/app/core/security.py`
- 구현:
  - `create_access_token(data: dict) -> str` — HS256, 만료 24h
  - `decode_access_token(token: str) -> dict` — 검증 실패 시 401
  - `hash_password(plain: str) -> str`
  - `verify_password(plain: str, hashed: str) -> bool`
  - `get_current_user(token)` — FastAPI Depends 용 함수
  - SECRET_KEY 하드코딩 (dev용)
- 검증: 파이썬 import 오류 없음

### Task 3 — Auth 라우터 (4분)
- 파일: `backend/app/routers/auth.py`
- 구현:
  - `POST /auth/register` — 인메모리 mock 유저 생성, JWT 반환
  - `POST /auth/login` — `username=test / password=test` mock 유저 검증, JWT 반환
  - `GET /auth/me` — JWT에서 유저 정보 반환
  - 인메모리 mock 유저 dict (모듈 레벨 상수)
- 검증: `hurl --test backend/tests/hurl/auth.hurl --variable base_url=http://localhost:8000`

### Task 4 — Projects 라우터 (5분)
- 파일: `backend/app/routers/projects.py`
- 구현:
  - `GET /projects` — 공개 프로젝트 목록 (query: sort=latest|views|likes, search=str)
  - `GET /projects/my` — 내 프로젝트 목록 (JWT 필요)
  - `GET /projects/{id}` — 프로젝트 상세 + 작성자 정보
  - `POST /projects` — 프로젝트 생성 (JWT 필요, 인메모리 추가)
  - `PUT /projects/{id}` — 프로젝트 수정 (JWT 필요)
  - `DELETE /projects/{id}` — 프로젝트 삭제 (JWT 필요)
  - 인메모리 mock 프로젝트 list (현재 MOCK_PROJECTS + MY_PROJECTS 데이터 기반)
- 검증: `hurl --test backend/tests/hurl/projects.hurl --variable base_url=http://localhost:8000`

### Task 5 — Activity 라우터 + main.py 업데이트 (2분)
- 파일: `backend/app/routers/activity.py`, `backend/app/main.py`
- 구현:
  - `GET /activity` — 최근 활동 목록 (JWT 필요, 하드코딩 mock)
  - main.py에 activity 라우터 등록
- 검증: 서버 구동 후 `GET /activity` 200 응답

### Task 6 — axios 클라이언트 + API 모듈 (3분)
- 파일: `frontend/src/api/client.ts`, `frontend/src/api/auth.ts`, `frontend/src/api/projects.ts`, `frontend/src/api/activity.ts`
- 구현:
  - `client.ts`: axios 인스턴스 (baseURL=http://localhost:8000), 요청 인터셉터에서 localStorage JWT 자동 주입
  - `auth.ts`: `login()`, `register()`, `getMe()`
  - `projects.ts`: `getProjects(sort?, search?)`, `getMyProjects()`, `getProject(id)`, `createProject()`, `updateProject(id)`, `deleteProject(id)`
  - `activity.ts`: `getActivity()`
- 검증: TypeScript 컴파일 오류 없음 (`yarn tsc --noEmit`)

### Task 7 — AuthContext (3분)
- 파일: `frontend/src/context/AuthContext.tsx`, `frontend/src/main.tsx`
- 구현:
  - `AuthContext`: `user`, `token`, `login()`, `logout()`, `isLoading` 상태
  - `login()`: API 호출 → token localStorage 저장 → user 상태 갱신
  - `logout()`: localStorage 클리어 → user null
  - 앱 시작 시 localStorage 토큰 있으면 `getMe()` 호출하여 user 복원
  - `main.tsx`에 `AuthProvider` 감싸기
- 검증: TypeScript 컴파일 오류 없음

### Task 8 — LoginPage API 연결 (3분)
- 파일: `frontend/src/pages/LoginPage/LoginPage.tsx`
- 구현:
  - 로그인 폼 submit → `AuthContext.login()` 호출 → 성공 시 `/dashboard` 이동
  - 회원가입 폼 submit → `register()` API 호출 → 성공 시 자동 로그인 후 `/dashboard` 이동
  - 실패 시 에러 메시지 표시
- 검증: `npx playwright test e2e/login.spec.ts`

### Task 9 — DashboardPage API 연결 (3분)
- 파일: `frontend/src/pages/DashboardPage/DashboardPage.tsx`
- 구현:
  - `getMyProjects()` + `getActivity()` 호출 (useEffect)
  - 로딩 상태 처리
  - 유저 정보는 `AuthContext.user` 사용 (닉네임, 아바타)
  - `MY_PROJECTS`, `MOCK_ACTIVITY` import 제거
- 검증: `npx playwright test e2e/dashboard.spec.ts`

### Task 10 — ExplorePage API 연결 (2분)
- 파일: `frontend/src/pages/ExplorePage/ExplorePage.tsx`
- 구현:
  - `getProjects(sort, search)` 호출 (정렬/검색 변경 시 재호출)
  - `MOCK_PROJECTS` import 제거
- 검증: `npx playwright test e2e/explore.spec.ts`

### Task 11 — PlayPage API 연결 (2분)
- 파일: `frontend/src/pages/PlayPage/PlayPage.tsx`
- 구현:
  - `useParams()` 로 id 추출 → `getProject(id)` 호출
  - 프로젝트 제목, 작성자, 설명, 태그, 좋아요/조회수 표시
- 검증: `npx playwright test e2e/play.spec.ts`

### Task 12 — EditorPage API 연결 (3분)
- 파일: `frontend/src/pages/EditorPage/EditorPage.tsx`
- 구현:
  - `id !== 'new'`이면 `getProject(id)` 로 blocks_json 로드 → Blockly workspace 복원
  - 저장 버튼: `id === 'new'`면 `createProject()`, 아니면 `updateProject(id)`
- 검증: `npx playwright test e2e/editor.spec.ts`
