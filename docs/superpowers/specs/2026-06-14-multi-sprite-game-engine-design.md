# #51 멀티 스프라이트 게임 엔진 설계

## 개요

벽돌깨기·플랫포머·슈팅·장기 4가지 장르의 게임을 블록으로 만들 수 있도록,
멀티 스프라이트 아키텍처 + 에셋 확장 + 게임 전용 블록 API를 한꺼번에 구현한다.

---

## 1. 데이터 모델

### SpriteState (변경)
```ts
interface SpriteState {
  x: number; y: number; direction: number
  visible: boolean; size: number; speech: string | null
  bg: Background; spriteId: string
  vx: number; vy: number   // 신규: 물리 블록용
}
```

### SpriteEntity (신규)
```ts
interface SpriteEntity {
  id: string           // 'sprite_1', 'sprite_2', ...
  name: string
  isClone?: boolean
  state: SpriteState
  workspaceXml: string
}
```

### SpriteEntry (변경)
```ts
interface SpriteEntry {
  name: string
  category: 'basic' | 'breakout' | 'platformer' | 'shooter' | 'janggi' | 'common'
  svg?: string         // 인라인 SVG
  png?: string         // Vite import URL (Kenney PNG)
  naturalW: number     // AABB 충돌 계산용
  naturalH: number
}
```

### 저장 포맷 (blocks_json 필드 재사용)
```json
{
  "bg": "sky",
  "sprites": [
    { "id": "sprite_1", "name": "와냥이", "state": { "x": 0, "y": -35, ... }, "workspaceXml": "<xml>...</xml>" }
  ]
}
```
로드 시 `sprites` 키가 없으면 기존 단일 포맷으로 간주 → `sprites[0]`으로 자동 마이그레이션.

---

## 2. GameEngine 클래스

`spriteRuntime.ts`에 추가. `SpriteRuntime`은 현재 구조 최대한 유지.

```ts
class GameEngine {
  entities: SpriteEntity[]
  private canvas: HTMLCanvasElement
  private runtimes: Map<string, SpriteRuntime>
  private onEntitiesChange: (e: SpriteEntity[]) => void
  private keysDown: Set<string>

  constructor(canvas, entities, onEntitiesChange)

  // 전체 실행
  async run(workspaces: Map<string, Blockly.WorkspaceSvg>): Promise<void>
    // 1. 각 entity → SpriteRuntime 생성
    // 2. Promise.allSettled로 동시 실행

  stop(): void   // 모든 runtimes stop()
  render(): void // entities 전체를 z-order(id 순)로 렌더링
  attachKeyListeners(): () => void

  // 클론 API
  cloneSprite(sourceId: string): void
    // entity 복사 → isClone:true, 새 id → entities에 push
    // 새 SpriteRuntime 생성 → wc_when_clone_start hat에서 시작

  deleteEntity(id: string): void
    // runtime stop → entities에서 제거 → render

  // 충돌 감지 (AABB)
  isTouchingSprite(aId: string, bName: string): boolean
    // visible:false인 스프라이트 무시

  getSpriteState(name: string): SpriteState | null
}
```

`SpriteRuntime`은 생성 시 `GameEngine` 참조를 받는다.
생성자 시그니처 변경:
```ts
constructor(canvas, entity, engine: GameEngine, onStateChange?)
```

---

## 3. 에셋 라이브러리

### PNG 번들링 방식
```ts
import platformPng from '../../assets/sprites/platform.png'
// Vite가 해시 포함 URL로 처리
```

### 추가 에셋 목록

**벽돌깨기 (SVG)**
| id | 이름 |
|---|---|
| `brick_yellow` | 노란 벽돌 |
| `brick_gold` | 황금 벽돌 |

**플랫포머 (Kenney Simplified Platformer Pack — PNG)**
| id | 이름 |
|---|---|
| `platform` | 풀밭 발판 |
| `platform_stone` | 돌 발판 |
| `coin` | 코인 |
| `star` | 별 |
| `slime` | 슬라임 |
| `spike` | 가시 |
| `flag` | 결승 깃발 |

**슈팅 (Kenney Space Shooter Redux — PNG)**
| id | 이름 |
|---|---|
| `spaceship` | 플레이어 우주선 |
| `enemy_ship` | 적 우주선 |
| `bullet` | 총알 |
| `asteroid` | 소행성 |

**공통 (PNG)**
| id | 이름 |
|---|---|
| `heart` | 하트 |
| `explosion` | 폭발 |
| `trophy` | 트로피 |

**장기 (SVG — 향후 장기 게임 구현 대비)**
| id | 이름 |
|---|---|
| `janggi_cha_r` / `janggi_cha_b` | 車 (빨강/파랑) |
| `janggi_ma_r` / `janggi_ma_b` | 馬 |
| `janggi_sang_r` / `janggi_sang_b` | 象 |
| `janggi_po_r` / `janggi_po_b` | 包 |
| `janggi_sa_r` / `janggi_sa_b` | 士 |
| `janggi_jang_r` / `janggi_han_b` | 將 / 漢 |
| `janggi_jol_r` / `janggi_byong_b` | 卒 / 兵 |

### 스프라이트 피커 모달 — 카테고리 탭
전체 / 기본 / 벽돌깨기 / 플랫포머 / 슈팅 / 장기 / 공통

---

## 4. UI — 스프라이트 패널

`StageCanvas` 하단의 기존 스프라이트 목록 영역을 확장한다.

- 썸네일 가로 스크롤 목록 (클릭 → 해당 워크스페이스로 전환 + 파란 테두리 하이라이트)
- 이름 더블클릭 → `<input>` 인라인 편집
- 삭제 버튼: 스프라이트가 2개 이상일 때만 표시
- `+` 버튼 → 스프라이트 피커 모달 (카테고리 탭 포함)
- 선택된 스프라이트의 x/y 좌표 표시

EditorPage에서:
- `activeEntityId: string` — 현재 선택된 스프라이트 id
- `workspaces: Map<string, Blockly.WorkspaceSvg>` — 스프라이트별 워크스페이스

스프라이트 전환 시: 현재 워크스페이스 XML 저장 → 새 워크스페이스 XML 로드 → Blockly 재렌더.

---

## 5. 블록 API

### 5-1. 감지 카테고리 추가

| 블록 | type | 설명 |
|---|---|---|
| `[스프라이트▼] 에 닿았는가?` | `wc_touching_sprite` | Boolean, AABB |
| `[스프라이트▼] 의 x 좌표` | `wc_sprite_x_of` | Number |
| `[스프라이트▼] 의 y 좌표` | `wc_sprite_y_of` | Number |

드롭다운: `blockDefs.ts`의 모듈 변수 `spriteListForDropdown: [string,string][]`를 EditorPage에서 갱신.

### 5-2. 클론 카테고리 (신규)

| 블록 | type | 설명 |
|---|---|---|
| `🔴 복제되었을 때` | `wc_when_clone_start` | Hat |
| `나 자신 복제하기` | `wc_clone_self` | Statement |
| `이 복제본 삭제` | `wc_delete_clone` | Statement, isClone일 때만 동작 |

### 5-3. 모양 카테고리 추가

| 블록 | type | 설명 |
|---|---|---|
| `이 스프라이트 삭제` | `wc_delete_sprite` | Statement, 원본/클론 모두 삭제 가능 |

### 5-4. 물리 카테고리 (신규)

| 블록 | type | 설명 |
|---|---|---|
| `x 속도를 N으로 설정` | `wc_set_vx` | |
| `y 속도를 N으로 설정` | `wc_set_vy` | |
| `x 속도를 N만큼 바꾸기` | `wc_change_vx` | |
| `y 속도를 N만큼 바꾸기` | `wc_change_vy` | |
| `속도대로 이동하기` | `wc_apply_velocity` | x+=vx, y+=vy + clampToWall |
| `중력 가속 적용 (중력: N)` | `wc_apply_gravity` | vy -= gravity |
| `바닥에 닿았는가?` | `wc_on_floor` | Boolean: 하단 벽 OR platform 스프라이트 위 |
| `x 속도` | `wc_get_vx` | Number |
| `y 속도` | `wc_get_vy` | Number |

---

## 6. 렌더링

```ts
// 변경 후 renderStage 시그니처
renderStage(canvas, entities: SpriteEntity[], images: Map<string, HTMLImageElement>, bg: Background)
```

entities를 id 순(z-order)으로 그린다. visible:false인 엔티티는 건너뜀.
말풍선은 각 스프라이트 위에 개별 렌더.

---

## 7. PlayPage 업데이트

- `blocks_json` 로드 시 새 포맷(`sprites` 배열) 파싱
- 기존 단일 포맷 호환 마이그레이션
- `GameEngine`으로 전체 스프라이트 동시 실행
- 스프라이트 패널 UI는 추가하지 않음 (플레이 전용)

---

## 8. 완료 조건 (이슈 기준)

- 스테이지에 스프라이트 2개 이상 동시 렌더링
- 각 스프라이트 독립 블록 워크스페이스 보유 및 전환
- 스프라이트 추가(피커 모달) / 삭제 / 이름 편집 UI
- 실행 버튼으로 모든 스프라이트 블록 동시 실행 / 정지
- 프로젝트 저장/불러오기 (기존 단일 포맷 호환)
- 위 에셋 전부 카테고리별 표시
- `wc_touching_sprite` AABB 충돌 동작 (숨긴 스프라이트 무시)
- 드롭다운이 현재 스프라이트 목록 동적 반영
- 클론 생성 → `wc_when_clone_start` 독립 실행 → 삭제
- `wc_delete_sprite` 엔티티 즉시 제거
- 중력 + 속도 블록으로 점프 구현 가능
- `wc_on_floor` — 하단 벽 및 platform 스프라이트 착지 감지
