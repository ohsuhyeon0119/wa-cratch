import { useState } from 'react'
import { Link } from 'react-router-dom'
import s from './EditorPage.module.css'
import { useToast } from '../../hooks/useToast'
import Toast from '../../components/Toast/Toast'
import ShareModal from '../../components/ShareModal/ShareModal'

type Category = 'motion' | 'sensing' | 'speech' | 'looks' | 'control' | 'sound'

const BLOCKS: Record<Category, { cls: string; label: string }[]> = {
  motion: [
    { cls: s.bOrange, label: '10 만큼 이동하기' },
    { cls: s.bOrange, label: '오른쪽으로 이동' },
    { cls: s.bOrange, label: '왼쪽으로 이동' },
    { cls: s.bOrange, label: '위쪽으로 이동' },
    { cls: s.bOrange, label: '아래쪽으로 이동' },
    { cls: s.bOrange, label: 'x: 0, y: 0 로 이동' },
    { cls: s.bOrange, label: '15도 회전하기' },
    { cls: s.bOrange, label: '처음 위치로 가기' },
  ],
  sensing: [
    { cls: s.bTeal, label: '↑ 위 키 눌렸을 때' },
    { cls: s.bTeal, label: '↓ 아래 키 눌렸을 때' },
    { cls: s.bTeal, label: '← 왼쪽 키 눌렸을 때' },
    { cls: s.bTeal, label: '→ 오른쪽 키 눌렸을 때' },
    { cls: s.bTeal, label: '스페이스 눌렸을 때' },
    { cls: s.bTeal, label: '벽에 닿았을 때' },
    { cls: s.bTeal, label: '마우스를 클릭했을 때' },
  ],
  speech: [
    { cls: s.bPink, label: '"안녕!" 이라고 말하기' },
    { cls: s.bPink, label: '2초 동안 말하기' },
    { cls: s.bPink, label: '말풍선 지우기' },
  ],
  looks: [
    { cls: s.bPurple, label: '보이기' },
    { cls: s.bPurple, label: '숨기기' },
    { cls: s.bPurple, label: '크기를 100%로 설정' },
    { cls: s.bPurple, label: '크기를 10 키우기' },
  ],
  control: [
    { cls: s.bYellow, label: '🚀 시작했을 때' },
    { cls: s.bYellow, label: '10번 반복하기' },
    { cls: s.bYellow, label: '계속 반복하기' },
    { cls: s.bYellow, label: '만약 ~ 이라면' },
    { cls: s.bYellow, label: '1초 기다리기' },
  ],
  sound: [
    { cls: s.bBlue, label: '야옹 소리 재생' },
    { cls: s.bBlue, label: '효과음 재생하기' },
    { cls: s.bBlue, label: '소리 멈추기' },
  ],
}

const CAT_BTNS: { key: Category; cls: string; label: string }[] = [
  { key: 'motion',  cls: s.catMotion,  label: '🏃 움직임' },
  { key: 'sensing', cls: s.catSensing, label: '👀 감지' },
  { key: 'speech',  cls: s.catSpeech,  label: '💬 말풍선' },
  { key: 'looks',   cls: s.catLooks,   label: '✨ 모양' },
  { key: 'control', cls: s.catControl, label: '🔄 제어' },
  { key: 'sound',   cls: s.catSound,   label: '🎵 소리' },
]

export default function EditorPage() {
  const [cat, setCat] = useState<Category>('motion')
  const { toastVisible, toastMessage, toastType, showToast } = useToast()
  const [isRunning, setIsRunning] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  return (
    <div className={s.page}>
      {/* TOOLBAR */}
      <div className={s.toolbar}>
        <Link to="/" className={s.toolbarLogo}>
          <div className={s.tLogoIcon}>🧇</div>
          <span className={s.tLogoText}>Wa<em>Cratch</em></span>
        </Link>
        <div className={s.tDivider}/>
        <input className={s.tProjectName} defaultValue="와냥이의 첫 번째 모험" type="text" spellCheck={false}/>
        <div className={s.tSpacer}/>
        <div className={s.runStop}>
          <button className={s.btnRun} onClick={() => setIsRunning(true)}>▶ 실행하기</button>
          <button className={s.btnStop} onClick={() => setIsRunning(false)}>⏹ 멈추기</button>
        </div>
        <div className={s.tDivider}/>
        <div className={s.tActions}>
          <button className={`${s.btnToolbar} ${s.btnSave}`} onClick={() => showToast('저장됐어요! 💾', 'success')}>💾 저장</button>
          <button className={`${s.btnToolbar} ${s.btnShare}`} onClick={() => setShareOpen(true)}>🔗 공유하기</button>
        </div>
        <div className={s.tDivider}/>
        <div className={s.tAvatar}>🧇</div>
      </div>

      {/* EDITOR BODY */}
      <div className={s.editorBody}>
        {/* TOOLBOX */}
        <div className={s.toolbox}>
          <div className={s.toolboxHeader}>🧩 블록 선택</div>
          <div className={s.categoryList}>
            {CAT_BTNS.map(c => (
              <button
                key={c.key}
                className={`${s.catBtn} ${c.cls} ${cat === c.key ? s.active : ''}`}
                onClick={() => setCat(c.key)}
              >
                <span className={s.catDot}/>
                {c.label}
              </button>
            ))}
          </div>
          <div className={s.blockList}>
            {BLOCKS[cat].map((b, i) => (
              <div key={i} className={`${s.blockItem} ${b.cls}`}>
                <span className={s.blockNotch}/>
                {b.label}
              </div>
            ))}
          </div>
        </div>

        {/* WORKSPACE */}
        <div className={s.workspace}>
          <div className={s.wsBlocks}>
            <div className={s.wsBlock} style={{ background: '#FFD23F', color: '#2C1810' }}>🚀 시작했을 때</div>
            <div className={s.wsBlock} style={{ background: '#2EC4B6', color: '#fff' }}>↑ 위 키 눌렸을 때</div>
            <div className={s.wsBlock} style={{ background: '#FF6B35', color: '#fff' }}>위쪽으로 <input className={s.wsInput} defaultValue="10"/> 이동</div>
            <div className={s.wsBlock} style={{ background: '#FF85A1', color: '#fff' }}>💬 &quot;야옹!&quot; 이라고 말하기</div>
            <div className={s.wsBlock} style={{ background: '#2EC4B6', color: '#fff' }}>↓ 아래 키 눌렸을 때</div>
            <div className={s.wsBlock} style={{ background: '#FF6B35', color: '#fff' }}>아래쪽으로 <input className={s.wsInput} defaultValue="10"/> 이동</div>
          </div>
          <div className={s.wsBlocks2}>
            <div className={s.wsBlock} style={{ background: '#FFD23F', color: '#2C1810' }}>🔄 계속 반복하기</div>
            <div className={`${s.wsBlock} ${s.wsIndent}`} style={{ background: '#26B0A3', color: '#fff' }}>벽에 닿았을 때</div>
            <div className={`${s.wsBlock} ${s.wsIndent}`} style={{ background: '#E55A1E', color: '#fff' }}>처음 위치로 가기</div>
          </div>
          <div className={s.wsHint}>💡 블록을 왼쪽에서 드래그해 조립하세요!</div>
          <div className={s.wsZoom}>
            <button className={s.zoomBtn}>−</button>
            <span className={s.zoomVal}>100%</span>
            <button className={s.zoomBtn}>+</button>
          </div>
        </div>

        {/* STAGE PANEL */}
        <div className={s.stagePanel}>
          <div className={s.stageControls}>
            <span className={s.stageTitle}>🎬 스테이지</span>
            <div className={s.stageBtns}>
              <button className={s.sBtn} title="전체화면">⛶</button>
              <button className={s.sBtn} title="설정">⚙</button>
            </div>
          </div>
          <div className={s.stageCanvas}>
            <div className={s.canvasSky}>
              <div className={`${s.cloud} ${s.c1}`}/>
              <div className={`${s.cloud} ${s.c2}`}/>
              <div className={`${s.cloud} ${s.c3}`}/>
              <div className={s.ground}/>
              <div className={s.spriteCat}>
                <svg viewBox="-18 -18 306 378" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 72, height: 88 }}>
                  <path d="M198 258 Q248 228 244 186 Q240 152 222 163" stroke="#E8A818" strokeWidth="26" fill="none" strokeLinecap="round"/>
                  <path d="M198 258 Q248 228 244 186 Q240 152 222 163" stroke="#FFC947" strokeWidth="16" fill="none" strokeLinecap="round"/>
                  <circle cx="222" cy="161" r="16" fill="#FFE090"/><circle cx="222" cy="161" r="9" fill="rgba(255,255,255,.6)"/>
                  <ellipse cx="22" cy="222" rx="22" ry="28" fill="#E8A818" transform="rotate(-12 22 222)"/>
                  <ellipse cx="22" cy="222" rx="16" ry="21" fill="#FFC947" transform="rotate(-12 22 222)"/>
                  <circle cx="16" cy="246" r="14" fill="#E8A818"/><circle cx="16" cy="246" r="10" fill="#FFC947"/>
                  <ellipse cx="240" cy="222" rx="22" ry="28" fill="#E8A818" transform="rotate(12 240 222)"/>
                  <ellipse cx="240" cy="222" rx="16" ry="21" fill="#FFC947" transform="rotate(12 240 222)"/>
                  <circle cx="246" cy="246" r="14" fill="#E8A818"/><circle cx="246" cy="246" r="10" fill="#FFC947"/>
                  <rect x="16" y="60" width="228" height="224" rx="68" fill="#FFC947"/>
                  <line x1="16" y1="130" x2="244" y2="130" stroke="#C88010" strokeWidth="12" strokeLinecap="round" opacity=".56"/>
                  <line x1="16" y1="200" x2="244" y2="200" stroke="#C88010" strokeWidth="12" strokeLinecap="round" opacity=".56"/>
                  <line x1="88"  y1="60"  x2="88"  y2="284" stroke="#C88010" strokeWidth="12" strokeLinecap="round" opacity=".56"/>
                  <line x1="172" y1="60"  x2="172" y2="284" stroke="#C88010" strokeWidth="12" strokeLinecap="round" opacity=".56"/>
                  <rect x="26"  y="70"  width="53" height="51" rx="14" fill="rgba(255,255,255,.22)"/>
                  <rect x="97"  y="70"  width="66" height="51" rx="14" fill="rgba(255,255,255,.22)"/>
                  <rect x="181" y="70"  width="53" height="51" rx="14" fill="rgba(255,255,255,.22)"/>
                  <path d="M52,78 C36,52 30,16 64,8 C86,3 108,50 104,68 Z" fill="#E8A818"/>
                  <path d="M60,74 C48,54 44,30 64,20 C78,14 98,52 96,68 Z" fill="#FFCB8A" opacity=".9"/>
                  <path d="M208,78 C224,52 230,16 196,8 C174,3 152,50 156,68 Z" fill="#E8A818"/>
                  <path d="M200,74 C212,54 216,30 196,20 C182,14 162,52 164,68 Z" fill="#FFCB8A" opacity=".9"/>
                  <circle cx="90"  cy="156" r="11" fill="#1A0A00"/><circle cx="90"  cy="156" r="8.5" fill="#2C1208"/>
                  <circle cx="170" cy="156" r="11" fill="#1A0A00"/><circle cx="170" cy="156" r="8.5" fill="#2C1208"/>
                  <circle cx="130" cy="182" r="9" fill="#D4882A"/><circle cx="133" cy="179" r="3" fill="white" opacity=".6"/>
                  <path d="M117 194 Q124 202 130 194 Q136 202 143 194" stroke="#1A0A00" strokeWidth="2.8" fill="none" strokeLinecap="round"/>
                  <ellipse cx="90"  cy="302" rx="40" ry="23" fill="#E8A818"/><ellipse cx="90"  cy="297" rx="34" ry="19" fill="#FFC947"/>
                  <circle cx="79"  cy="303" r="6.5" fill="#FFCB8A" opacity=".9"/><circle cx="90"  cy="306" r="6.5" fill="#FFCB8A" opacity=".9"/><circle cx="101" cy="303" r="6.5" fill="#FFCB8A" opacity=".9"/>
                  <ellipse cx="170" cy="302" rx="40" ry="23" fill="#E8A818"/><ellipse cx="170" cy="297" rx="34" ry="19" fill="#FFC947"/>
                  <circle cx="159" cy="303" r="6.5" fill="#FFCB8A" opacity=".9"/><circle cx="170" cy="306" r="6.5" fill="#FFCB8A" opacity=".9"/><circle cx="181" cy="303" r="6.5" fill="#FFCB8A" opacity=".9"/>
                </svg>
              </div>
            </div>
          </div>
          <div className={s.stageCoords}>
            <span className={s.coordChip}>x: 0</span>
            <span className={s.coordChip}>y: 0</span>
          </div>
          <div className={s.spriteSection}>
            <div className={s.spriteSectionHeader}>
              <span className={s.spriteSectionTitle}>🐾 스프라이트</span>
              <button className={s.addSprite} title="스프라이트 추가">+</button>
            </div>
            <div className={s.spriteList}>
              <div className={`${s.spriteThumb} ${s.active}`}>
                <span className={s.sIcon}>🧇</span>
                <span className={s.sName}>와냥이</span>
              </div>
            </div>
            <div className={s.bgSectionHeader}>
              <span className={s.bgSectionTitle}>🖼 배경</span>
            </div>
            <div className={s.bgList}>
              <div className={`${s.bgThumb} ${s.bgSky} ${s.active}`} title="하늘"/>
              <div className={`${s.bgThumb} ${s.bgNight}`}  title="밤"/>
              <div className={`${s.bgThumb} ${s.bgOcean}`}  title="바다"/>
              <div className={`${s.bgThumb} ${s.bgSpace}`}  title="우주"/>
              <div className={`${s.bgThumb} ${s.bgForest}`} title="숲"/>
            </div>
          </div>
        </div>
      </div>

      {/* STATUS BAR */}
      <div className={s.statusBar}>
        <span>
          <span className={s.statusDot}/>
          {isRunning ? '▶ 실행 중...' : '준비됨'}
        </span>
        <span>스프라이트: 와냥이</span>
        <span>블록: 6개</span>
        <span style={{ marginLeft: 'auto' }}>WaCratch v1.0 🐾</span>
      </div>

      <Toast visible={toastVisible} message={toastMessage} type={toastType} />
      <ShareModal
        isOpen={shareOpen}
        projectId="test"
        projectTitle="와냥이의 첫 번째 모험"
        onClose={() => setShareOpen(false)}
      />
    </div>
  )
}
