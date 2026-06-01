import { useState, useEffect, type RefObject } from 'react'
import { renderStage, getSpriteImageExport, SPRITE_LIBRARY } from './spriteRuntime'
import type { SpriteState, Background } from './spriteRuntime'
import s from './StageCanvas.module.css'

interface Props {
  state: SpriteState
  selectedBg: Background
  onBgChange: (bg: Background) => void
  onSpriteChange: (id: string) => void
  canvasRef: RefObject<HTMLCanvasElement | null>
}

const BG_OPTIONS: { key: Background; label: string }[] = [
  { key: 'sky', label: '하늘' },
  { key: 'night', label: '밤' },
  { key: 'ocean', label: '바다' },
  { key: 'space', label: '우주' },
  { key: 'forest', label: '숲' },
]

export default function StageCanvas({ state, selectedBg, onBgChange, onSpriteChange, canvasRef }: Props) {
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [spriteImgUrls, setSpriteImgUrls] = useState<Record<string, string>>({})

  // 스프라이트 라이브러리 이미지 프리로드
  useEffect(() => {
    const entries = Object.keys(SPRITE_LIBRARY)
    Promise.all(
      entries.map((id) => getSpriteImageExport(id).then((img) => [id, img.src] as const))
    ).then((pairs) => {
      setSpriteImgUrls(Object.fromEntries(pairs))
    })
  }, [])

  // 캔버스 렌더링 — spriteId 포함하여 올바른 이미지 사용
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    getSpriteImageExport(state.spriteId).then((img) => {
      renderStage(canvas, { ...state, bg: selectedBg }, img)
    })
  }, [state, selectedBg, canvasRef])

  const activeEntry = SPRITE_LIBRARY[state.spriteId] ?? SPRITE_LIBRARY.cat

  return (
    <div className={s.stagePanel}>
      <div className={s.stageControls}>
        <span className={s.stageTitle}>🎬 스테이지</span>
        <div className={s.stageBtns}>
          <button className={s.sBtn} title="전체화면">⛶</button>
          <button className={s.sBtn} title="설정">⚙</button>
        </div>
      </div>

      <div className={s.stageCanvasWrap}>
        <canvas
          ref={canvasRef as RefObject<HTMLCanvasElement>}
          width={480}
          height={360}
          className={s.canvas}
        />
      </div>

      <div className={s.stageCoords}>
        <span className={s.coordChip}>x: {Math.round(state.x)}</span>
        <span className={s.coordChip}>y: {Math.round(state.y)}</span>
      </div>

      <div className={s.spriteSection}>
        <div className={s.spriteSectionHeader}>
          <span className={s.spriteSectionTitle}>🐾 스프라이트</span>
          <button className={s.addSprite} title="스프라이트 추가" onClick={() => setLibraryOpen(true)}>+</button>
        </div>
        <div className={s.spriteList}>
          <div className={`${s.spriteThumb} ${s.active}`}>
            {spriteImgUrls[state.spriteId]
              ? <img src={spriteImgUrls[state.spriteId]} className={s.sIcon} alt={activeEntry.name} />
              : <span className={s.sIcon}>🐾</span>
            }
            <span className={s.sName}>{activeEntry.name}</span>
          </div>
        </div>

        <div className={s.bgSectionHeader}>
          <span className={s.bgSectionTitle}>🖼 배경</span>
        </div>
        <div className={s.bgList}>
          {BG_OPTIONS.map(({ key, label }) => {
            const bgCls = `bg${key.charAt(0).toUpperCase() + key.slice(1)}` as keyof typeof s
            return (
              <div
                key={key}
                className={`${s.bgThumb} ${s[bgCls] ?? ''} ${selectedBg === key ? s.active : ''}`}
                title={label}
                onClick={() => onBgChange(key)}
              />
            )
          })}
        </div>
      </div>

      {/* 스프라이트 라이브러리 모달 */}
      {libraryOpen && (
        <div className={s.libraryOverlay} onClick={() => setLibraryOpen(false)}>
          <div className={s.libraryModal} onClick={(e) => e.stopPropagation()}>
            <div className={s.libraryHeader}>
              <span className={s.libraryTitle}>🎨 스프라이트 선택</span>
              <button className={s.libraryClose} onClick={() => setLibraryOpen(false)}>✕</button>
            </div>
            <div className={s.libraryGrid}>
              {Object.entries(SPRITE_LIBRARY).map(([id, entry]) => (
                <button
                  key={id}
                  className={`${s.libraryItem} ${state.spriteId === id ? s.libraryItemActive : ''}`}
                  onClick={() => { onSpriteChange(id); setLibraryOpen(false) }}
                >
                  {spriteImgUrls[id]
                    ? <img src={spriteImgUrls[id]} className={s.libraryImg} alt={entry.name} />
                    : <span className={s.libraryImgPlaceholder}>🐾</span>
                  }
                  <span className={s.libraryItemName}>{entry.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
