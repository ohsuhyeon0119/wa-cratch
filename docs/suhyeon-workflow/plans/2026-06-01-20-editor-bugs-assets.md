# #20 에디터 버그 수정 & 에셋 추가 플랜

## 영향 범위

- 수정: `frontend/src/pages/EditorPage/EditorPage.module.css`
- 수정: `frontend/src/pages/EditorPage/spriteRuntime.ts`
- 수정: `frontend/src/pages/EditorPage/blockDefs.ts`
- 수정: `frontend/src/pages/EditorPage/EditorPage.tsx`
- 수정: `frontend/src/pages/EditorPage/StageCanvas.tsx`
- 수정: `frontend/src/pages/EditorPage/StageCanvas.module.css`

---

## 태스크

### Task 1 — B1: 툴박스 텍스트 오버플로 CSS 픽스 (2분)

- **파일**: `src/pages/EditorPage/EditorPage.module.css`
- **구현**:
  - `:global(.blocklyTreeSelected)` 및 `:global(.blocklyTreeRow)` 에
    `white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;` 추가
  - `:global(.blocklyToolboxContents)` 에 `overflow: hidden;` 추가
- **검증**: `npx playwright test e2e/editor.spec.ts`

---

### Task 2 — B2: 캐릭터 기본 위치 수정 (2분)

- **파일**: `src/pages/EditorPage/spriteRuntime.ts`
- **구현**:
  - `defaultSpriteState()` → `y: -35` 로 변경
  - (하늘 배경 ground=259px, 스프라이트 44px 절반 → center=215 → y=-35)
- **검증**: `npx playwright test e2e/editor.spec.ts`

---

### Task 3 — B3: Flyout 자동 닫힘 방지 + 닫기 버튼 (3분)

- **파일**: `src/pages/EditorPage/EditorPage.tsx`
- **구현**:
  - Blockly inject 직후 `workspace.getFlyout()?.autoClose = false`
  - `workspace.addChangeListener` 로 `TOOLBOX_ITEM_SELECT` 이벤트 감지
  - flyout이 열릴 때 DOM에 `<<` 닫기 버튼 삽입 (클릭 시 `workspace.getFlyout()?.hide()`)
  - 버튼 스타일: 기존 `.sBtn` 스타일 인라인 적용 (position: absolute, flyout 상단)
- **검증**: `npx playwright test e2e/editor.spec.ts`

---

### Task 4 — F1a: 스프라이트 라이브러리 SVG + 런타임 확장 (5분)

- **파일**: `src/pages/EditorPage/spriteRuntime.ts`
- **구현**:
  - `SpriteState` 인터페이스에 `spriteId: string` 필드 추가
  - `defaultSpriteState()` → `spriteId: 'cat'`, `y: -35`
  - `SPRITE_LIBRARY`: `Record<string, { name: string; svg: string }>` 정의
    - `cat`: 기존 SPRITE_SVG
    - `ball`: 주황 그라디언트 원 + 광택 SVG
    - `paddle`: 둥근 모서리 직사각형 SVG
    - `brick_red`: 빨간 벽돌 SVG
    - `brick_blue`: 파란 벽돌 SVG
  - `getSpriteImage(id: string)`: id별로 캐싱 (`Map<string, HTMLImageElement>`)
  - `getSpriteImageExport(id?)`: id 선택적으로 받도록 변경
  - `renderStage()`: `state.spriteId` 기반으로 이미지 로드
  - `SpriteRuntime.constructor`: `getSpriteImage(state.spriteId)` 로 변경
- **검증**: `npx playwright test e2e/editor.spec.ts`

---

### Task 5 — F1b + B4: 스프라이트 패널 UI (4분)

- **파일**: `src/pages/EditorPage/StageCanvas.tsx`, `StageCanvas.module.css`
- **구현**:
  - Props에 `onSpriteChange: (id: string) => void` 추가
  - `spriteImgUrls` state: 각 스프라이트 id→imgSrc 맵 (useEffect로 로드)
  - 스프라이트 썸네일: `🧇` 이모지 → `<img src={spriteImgUrls['cat']} />` 로 교체
  - `+` 버튼 클릭 → `libraryOpen` state true → 라이브러리 패널 표시
  - 라이브러리 패널: `SPRITE_LIBRARY` 목록을 그리드로 표시, 클릭 시 `onSpriteChange(id)` 호출
  - `EditorPage.tsx`: `onSpriteChange` → `setSpriteState(prev => ({...prev, spriteId: id}))` + runtime 업데이트
- **검증**: `npx playwright test e2e/editor.spec.ts`

---

### Task 6 — F2a: 새 블록 정의 (4분)

- **파일**: `src/pages/EditorPage/blockDefs.ts`
- **구현**:
  - **📊 변수** 카테고리 추가:
    - `wc_var_set`: `변수 [이름] 을 [값] 으로 정하기`
    - `wc_var_change`: `변수 [이름] 을 [값] 만큼 바꾸기`
    - `wc_var_get`: `변수 [이름]` (Number reporter)
  - **🔢 연산** 카테고리 추가:
    - `wc_random`: `[a] 부터 [b] 사이 랜덤` (Number reporter)
    - `wc_add`, `wc_sub`, `wc_mul`, `wc_div`: 사칙연산 (Number reporter)
    - `wc_gt`, `wc_lt`, `wc_eq`: 비교 (Boolean reporter)
  - **👀 감지** 카테고리에 추가:
    - `wc_mouse_x`: `마우스 x 좌표` (Number reporter)
    - `wc_mouse_y`: `마우스 y 좌표` (Number reporter)
    - `wc_set_x_to_mouse`: `x 좌표를 마우스 위치로 설정` (명령 블록)
  - `TOOLBOX_CONFIG` 업데이트
- **검증**: `npx playwright test e2e/editor.spec.ts`

---

### Task 7 — F2b: 새 블록 런타임 구현 (4분)

- **파일**: `src/pages/EditorPage/spriteRuntime.ts`
- **구현**:
  - `SpriteRuntime`에 `variables: Map<string, number>` 추가
  - `SpriteRuntime`에 `mouseX: number`, `mouseY: number` + mousemove 리스너 추가
  - `attachKeyListeners()`: mousemove 리스너도 같이 attach/detach
  - `executeBlock()` 케이스 추가:
    - `wc_var_set`, `wc_var_change`
    - `wc_set_x_to_mouse`
  - `evalNumber(block)` 메서드 추가:
    - `wc_var_get`, `wc_random`, `wc_add`, `wc_sub`, `wc_mul`, `wc_div`, `wc_mouse_x`, `wc_mouse_y`
    - `field_number` 기본값 fallback
  - `evalBool()` 케이스 추가: `wc_gt`, `wc_lt`, `wc_eq`
  - 기존 `field_number` 값 읽는 블록들도 `evalNumber()` 활용하도록 리팩터
- **검증**: `npx playwright test e2e/editor.spec.ts`

---

## 요약

| Task | 내용 | 예상 시간 |
|------|------|-----------|
| 1 | B1: CSS 텍스트 오버플로 | 2분 |
| 2 | B2: 캐릭터 기본 위치 | 2분 |
| 3 | B3: Flyout 닫힘 방지 | 3분 |
| 4 | F1a: 스프라이트 SVG 라이브러리 + 런타임 | 5분 |
| 5 | F1b+B4: 스프라이트 패널 UI | 4분 |
| 6 | F2a: 새 블록 정의 | 4분 |
| 7 | F2b: 새 블록 런타임 | 4분 |
| **합계** | | **약 24분** |
