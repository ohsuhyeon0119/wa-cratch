import type * as BlocklyType from 'blockly'
import asteroidUrl from '../../assets/sprites/asteroid.svg?url'
import brickGoldUrl from '../../assets/sprites/brick_gold.svg?url'
import brickYellowUrl from '../../assets/sprites/brick_yellow.svg?url'
import bulletUrl from '../../assets/sprites/bullet.svg?url'
import coinUrl from '../../assets/sprites/coin.svg?url'
import enemyShipUrl from '../../assets/sprites/enemy_ship.svg?url'
import explosionUrl from '../../assets/sprites/explosion.svg?url'
import flagUrl from '../../assets/sprites/flag.svg?url'
import heartUrl from '../../assets/sprites/heart.svg?url'
import janggiByongBUrl from '../../assets/sprites/janggi_byong_b.svg?url'
import janggiChaBUrl from '../../assets/sprites/janggi_cha_b.svg?url'
import janggiChaRUrl from '../../assets/sprites/janggi_cha_r.svg?url'
import janggiHanBUrl from '../../assets/sprites/janggi_han_b.svg?url'
import janggiJangRUrl from '../../assets/sprites/janggi_jang_r.svg?url'
import janggiJolRUrl from '../../assets/sprites/janggi_jol_r.svg?url'
import janggiMaBUrl from '../../assets/sprites/janggi_ma_b.svg?url'
import janggiMaRUrl from '../../assets/sprites/janggi_ma_r.svg?url'
import janggiPoBUrl from '../../assets/sprites/janggi_po_b.svg?url'
import janggiPoRUrl from '../../assets/sprites/janggi_po_r.svg?url'
import janggiSaBUrl from '../../assets/sprites/janggi_sa_b.svg?url'
import janggiSaRUrl from '../../assets/sprites/janggi_sa_r.svg?url'
import janggiSangBUrl from '../../assets/sprites/janggi_sang_b.svg?url'
import janggiSangRUrl from '../../assets/sprites/janggi_sang_r.svg?url'
import platformUrl from '../../assets/sprites/platform.svg?url'
import platformStoneUrl from '../../assets/sprites/platform_stone.svg?url'
import slimeUrl from '../../assets/sprites/slime.svg?url'
import spaceshipUrl from '../../assets/sprites/spaceship.svg?url'
import spikeUrl from '../../assets/sprites/spike.svg?url'
import starUrl from '../../assets/sprites/star.svg?url'
import trophyUrl from '../../assets/sprites/trophy.svg?url'

export type Background = 'white' | 'sky' | 'night' | 'ocean' | 'space' | 'forest'

export interface SpriteState {
  x: number
  y: number
  direction: number
  visible: boolean
  size: number
  speech: string | null
  bg: Background
  spriteId: string
  vx: number
  vy: number
}

const STAGE_W = 480
const STAGE_H = 360

export function defaultSpriteState(): SpriteState {
  return { x: 0, y: -35, direction: 90, visible: true, size: 100, speech: null, bg: 'sky', spriteId: 'cat', vx: 0, vy: 0 }
}

export function defaultSpriteEntity(id = 'sprite_1', name = '와냥이', spriteId = 'cat'): SpriteEntity {
  const state = defaultSpriteState()
  state.spriteId = spriteId
  return { id, name, state, workspaceData: {} }
}

export function migrateProjectData(blocksJson: Record<string, unknown>): { bg: Background; sprites: SpriteEntity[] } {
  if (Array.isArray(blocksJson.sprites)) {
    return {
      bg: (blocksJson.bg as Background) ?? 'sky',
      sprites: (blocksJson.sprites as SpriteEntity[]).map(s => ({
        ...s,
        state: { ...defaultSpriteState(), ...s.state },
      })),
    }
  }
  // Old single-sprite format: blocksJson IS the Blockly workspace data
  const entity = defaultSpriteEntity('sprite_1', '와냥이', 'cat')
  entity.workspaceData = blocksJson
  return { bg: 'sky', sprites: [entity] }
}

// ── Canvas rendering ──────────────────────────────────────────────

export interface SpriteEntry {
  name: string
  category: 'basic' | 'breakout' | 'platformer' | 'shooter' | 'janggi' | 'common'
  svg?: string
  png?: string
  naturalW: number
  naturalH: number
}

export interface SpriteEntity {
  id: string
  name: string
  isClone?: boolean
  state: SpriteState
  workspaceData: Record<string, unknown>
}

export const SPRITE_LIBRARY: Record<string, SpriteEntry> = {
  cat: {
    name: '와냥이',
    category: 'basic',
    naturalW: 270,
    naturalH: 342,
    svg: `<svg viewBox="-18 -18 306 378" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M198 258 Q248 228 244 186 Q240 152 222 163" stroke="#E8A818" stroke-width="26" fill="none" stroke-linecap="round"/>
  <path d="M198 258 Q248 228 244 186 Q240 152 222 163" stroke="#FFC947" stroke-width="16" fill="none" stroke-linecap="round"/>
  <circle cx="222" cy="161" r="16" fill="#FFE090"/><circle cx="222" cy="161" r="9" fill="rgba(255,255,255,.6)"/>
  <ellipse cx="22" cy="222" rx="22" ry="28" fill="#E8A818" transform="rotate(-12 22 222)"/>
  <ellipse cx="22" cy="222" rx="16" ry="21" fill="#FFC947" transform="rotate(-12 22 222)"/>
  <circle cx="16" cy="246" r="14" fill="#E8A818"/><circle cx="16" cy="246" r="10" fill="#FFC947"/>
  <ellipse cx="240" cy="222" rx="22" ry="28" fill="#E8A818" transform="rotate(12 240 222)"/>
  <ellipse cx="240" cy="222" rx="16" ry="21" fill="#FFC947" transform="rotate(12 240 222)"/>
  <circle cx="246" cy="246" r="14" fill="#E8A818"/><circle cx="246" cy="246" r="10" fill="#FFC947"/>
  <rect x="16" y="60" width="228" height="224" rx="68" fill="#FFC947"/>
  <line x1="16" y1="130" x2="244" y2="130" stroke="#C88010" stroke-width="12" stroke-linecap="round" opacity=".56"/>
  <line x1="16" y1="200" x2="244" y2="200" stroke="#C88010" stroke-width="12" stroke-linecap="round" opacity=".56"/>
  <line x1="88" y1="60" x2="88" y2="284" stroke="#C88010" stroke-width="12" stroke-linecap="round" opacity=".56"/>
  <line x1="172" y1="60" x2="172" y2="284" stroke="#C88010" stroke-width="12" stroke-linecap="round" opacity=".56"/>
  <rect x="26" y="70" width="53" height="51" rx="14" fill="rgba(255,255,255,.22)"/>
  <rect x="97" y="70" width="66" height="51" rx="14" fill="rgba(255,255,255,.22)"/>
  <rect x="181" y="70" width="53" height="51" rx="14" fill="rgba(255,255,255,.22)"/>
  <path d="M52,78 C36,52 30,16 64,8 C86,3 108,50 104,68 Z" fill="#E8A818"/>
  <path d="M60,74 C48,54 44,30 64,20 C78,14 98,52 96,68 Z" fill="#FFCB8A" opacity=".9"/>
  <path d="M208,78 C224,52 230,16 196,8 C174,3 152,50 156,68 Z" fill="#E8A818"/>
  <path d="M200,74 C212,54 216,30 196,20 C182,14 162,52 164,68 Z" fill="#FFCB8A" opacity=".9"/>
  <circle cx="90" cy="156" r="11" fill="#1A0A00"/><circle cx="90" cy="156" r="8.5" fill="#2C1208"/>
  <circle cx="170" cy="156" r="11" fill="#1A0A00"/><circle cx="170" cy="156" r="8.5" fill="#2C1208"/>
  <circle cx="130" cy="182" r="9" fill="#D4882A"/><circle cx="133" cy="179" r="3" fill="white" opacity=".6"/>
  <path d="M117 194 Q124 202 130 194 Q136 202 143 194" stroke="#1A0A00" stroke-width="2.8" fill="none" stroke-linecap="round"/>
  <ellipse cx="90" cy="302" rx="40" ry="23" fill="#E8A818"/><ellipse cx="90" cy="297" rx="34" ry="19" fill="#FFC947"/>
  <circle cx="79" cy="303" r="6.5" fill="#FFCB8A" opacity=".9"/><circle cx="90" cy="306" r="6.5" fill="#FFCB8A" opacity=".9"/><circle cx="101" cy="303" r="6.5" fill="#FFCB8A" opacity=".9"/>
  <ellipse cx="170" cy="302" rx="40" ry="23" fill="#E8A818"/><ellipse cx="170" cy="297" rx="34" ry="19" fill="#FFC947"/>
  <circle cx="159" cy="303" r="6.5" fill="#FFCB8A" opacity=".9"/><circle cx="170" cy="306" r="6.5" fill="#FFCB8A" opacity=".9"/><circle cx="181" cy="303" r="6.5" fill="#FFCB8A" opacity=".9"/>
</svg>`,
  },
  ball: {
    name: '공',
    category: 'breakout',
    naturalW: 100,
    naturalH: 100,
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="ballGrad" cx="38%" cy="32%" r="62%">
      <stop offset="0%" stop-color="#FFD580"/>
      <stop offset="55%" stop-color="#FF6B35"/>
      <stop offset="100%" stop-color="#CC3A0A"/>
    </radialGradient>
  </defs>
  <circle cx="50" cy="50" r="46" fill="#CC3A0A"/>
  <circle cx="50" cy="50" r="44" fill="url(#ballGrad)"/>
  <ellipse cx="36" cy="32" rx="11" ry="6" fill="rgba(255,255,255,0.55)" transform="rotate(-35 36 32)"/>
  <ellipse cx="30" cy="28" rx="4" ry="2.5" fill="rgba(255,255,255,0.75)" transform="rotate(-35 30 28)"/>
</svg>`,
  },
  paddle: {
    name: '패들',
    category: 'breakout',
    naturalW: 200,
    naturalH: 60,
    svg: `<svg viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="10" width="192" height="42" rx="21" fill="#CC3A0A"/>
  <rect x="2" y="6" width="192" height="42" rx="21" fill="#FF6B35"/>
  <rect x="10" y="10" width="120" height="16" rx="8" fill="rgba(255,255,255,0.28)"/>
  <rect x="10" y="10" width="45" height="8" rx="4" fill="rgba(255,255,255,0.18)"/>
</svg>`,
  },
  brick_red: {
    name: '빨간 벽돌',
    category: 'breakout',
    naturalW: 120,
    naturalH: 52,
    svg: `<svg viewBox="0 0 120 52" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="6" width="116" height="42" rx="7" fill="#991B1B"/>
  <rect x="2" y="2" width="116" height="42" rx="7" fill="#EF4444"/>
  <line x1="2" y1="15" x2="118" y2="15" stroke="rgba(0,0,0,0.18)" stroke-width="1.5"/>
  <line x1="2" y1="29" x2="118" y2="29" stroke="rgba(0,0,0,0.18)" stroke-width="1.5"/>
  <line x1="41" y1="2" x2="41" y2="44" stroke="rgba(0,0,0,0.18)" stroke-width="1.5"/>
  <line x1="82" y1="2" x2="82" y2="44" stroke="rgba(0,0,0,0.18)" stroke-width="1.5"/>
  <rect x="7" y="5" width="28" height="8" rx="3" fill="rgba(255,255,255,0.18)"/>
  <rect x="48" y="5" width="28" height="8" rx="3" fill="rgba(255,255,255,0.18)"/>
  <rect x="88" y="5" width="26" height="8" rx="3" fill="rgba(255,255,255,0.18)"/>
</svg>`,
  },
  brick_blue: {
    name: '파란 벽돌',
    category: 'breakout',
    naturalW: 120,
    naturalH: 52,
    svg: `<svg viewBox="0 0 120 52" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="6" width="116" height="42" rx="7" fill="#1D4ED8"/>
  <rect x="2" y="2" width="116" height="42" rx="7" fill="#3B82F6"/>
  <line x1="2" y1="15" x2="118" y2="15" stroke="rgba(0,0,0,0.18)" stroke-width="1.5"/>
  <line x1="2" y1="29" x2="118" y2="29" stroke="rgba(0,0,0,0.18)" stroke-width="1.5"/>
  <line x1="41" y1="2" x2="41" y2="44" stroke="rgba(0,0,0,0.18)" stroke-width="1.5"/>
  <line x1="82" y1="2" x2="82" y2="44" stroke="rgba(0,0,0,0.18)" stroke-width="1.5"/>
  <rect x="7" y="5" width="28" height="8" rx="3" fill="rgba(255,255,255,0.18)"/>
  <rect x="48" y="5" width="28" height="8" rx="3" fill="rgba(255,255,255,0.18)"/>
  <rect x="88" y="5" width="26" height="8" rx="3" fill="rgba(255,255,255,0.18)"/>
</svg>`,
  },
  brick_green: {
    name: '초록 벽돌',
    category: 'breakout',
    naturalW: 120,
    naturalH: 52,
    svg: `<svg viewBox="0 0 120 52" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="6" width="116" height="42" rx="7" fill="#15803D"/>
  <rect x="2" y="2" width="116" height="42" rx="7" fill="#22C55E"/>
  <line x1="2" y1="15" x2="118" y2="15" stroke="rgba(0,0,0,0.18)" stroke-width="1.5"/>
  <line x1="2" y1="29" x2="118" y2="29" stroke="rgba(0,0,0,0.18)" stroke-width="1.5"/>
  <line x1="41" y1="2" x2="41" y2="44" stroke="rgba(0,0,0,0.18)" stroke-width="1.5"/>
  <line x1="82" y1="2" x2="82" y2="44" stroke="rgba(0,0,0,0.18)" stroke-width="1.5"/>
  <rect x="7" y="5" width="28" height="8" rx="3" fill="rgba(255,255,255,0.18)"/>
  <rect x="48" y="5" width="28" height="8" rx="3" fill="rgba(255,255,255,0.18)"/>
  <rect x="88" y="5" width="26" height="8" rx="3" fill="rgba(255,255,255,0.18)"/>
</svg>`,
  },
  brick_yellow: { name: '노란 벽돌', category: 'breakout', naturalW: 120, naturalH: 52, png: brickYellowUrl },
  brick_gold: { name: '황금 벽돌', category: 'breakout', naturalW: 120, naturalH: 52, png: brickGoldUrl },
  platform: { name: '풀밭 발판', category: 'platformer', naturalW: 200, naturalH: 40, png: platformUrl },
  platform_stone: { name: '돌 발판', category: 'platformer', naturalW: 200, naturalH: 40, png: platformStoneUrl },
  coin: { name: '코인', category: 'platformer', naturalW: 60, naturalH: 60, png: coinUrl },
  star: { name: '별', category: 'platformer', naturalW: 60, naturalH: 60, png: starUrl },
  slime: { name: '슬라임', category: 'platformer', naturalW: 80, naturalH: 64, png: slimeUrl },
  spike: { name: '가시', category: 'platformer', naturalW: 60, naturalH: 40, png: spikeUrl },
  flag: { name: '결승 깃발', category: 'platformer', naturalW: 60, naturalH: 100, png: flagUrl },
  spaceship: { name: '우주선', category: 'shooter', naturalW: 80, naturalH: 100, png: spaceshipUrl },
  enemy_ship: { name: '적 우주선', category: 'shooter', naturalW: 80, naturalH: 80, png: enemyShipUrl },
  bullet: { name: '총알', category: 'shooter', naturalW: 20, naturalH: 40, png: bulletUrl },
  asteroid: { name: '소행성', category: 'shooter', naturalW: 80, naturalH: 80, png: asteroidUrl },
  heart: { name: '하트', category: 'common', naturalW: 60, naturalH: 54, png: heartUrl },
  explosion: { name: '폭발', category: 'common', naturalW: 80, naturalH: 80, png: explosionUrl },
  trophy: { name: '트로피', category: 'common', naturalW: 80, naturalH: 100, png: trophyUrl },
  janggi_cha_r: { name: '車(빨강)', category: 'janggi', naturalW: 72, naturalH: 72, png: janggiChaRUrl },
  janggi_ma_r: { name: '馬(빨강)', category: 'janggi', naturalW: 72, naturalH: 72, png: janggiMaRUrl },
  janggi_sang_r: { name: '象(빨강)', category: 'janggi', naturalW: 72, naturalH: 72, png: janggiSangRUrl },
  janggi_po_r: { name: '包(빨강)', category: 'janggi', naturalW: 72, naturalH: 72, png: janggiPoRUrl },
  janggi_sa_r: { name: '士(빨강)', category: 'janggi', naturalW: 72, naturalH: 72, png: janggiSaRUrl },
  janggi_jang_r: { name: '將(빨강)', category: 'janggi', naturalW: 72, naturalH: 72, png: janggiJangRUrl },
  janggi_jol_r: { name: '卒(빨강)', category: 'janggi', naturalW: 72, naturalH: 72, png: janggiJolRUrl },
  janggi_cha_b: { name: '車(파랑)', category: 'janggi', naturalW: 72, naturalH: 72, png: janggiChaBUrl },
  janggi_ma_b: { name: '馬(파랑)', category: 'janggi', naturalW: 72, naturalH: 72, png: janggiMaBUrl },
  janggi_sang_b: { name: '象(파랑)', category: 'janggi', naturalW: 72, naturalH: 72, png: janggiSangBUrl },
  janggi_po_b: { name: '包(파랑)', category: 'janggi', naturalW: 72, naturalH: 72, png: janggiPoBUrl },
  janggi_sa_b: { name: '士(파랑)', category: 'janggi', naturalW: 72, naturalH: 72, png: janggiSaBUrl },
  janggi_han_b: { name: '漢(파랑)', category: 'janggi', naturalW: 72, naturalH: 72, png: janggiHanBUrl },
  janggi_byong_b: { name: '兵(파랑)', category: 'janggi', naturalW: 72, naturalH: 72, png: janggiByongBUrl },
}

const spriteImageCache = new Map<string, HTMLImageElement>()

export function getSpriteImageExport(id = 'cat'): Promise<HTMLImageElement> {
  return getSpriteImage(id)
}

function getSpriteImage(id = 'cat'): Promise<HTMLImageElement> {
  const cached = spriteImageCache.get(id)
  if (cached) return Promise.resolve(cached)
  const entry = SPRITE_LIBRARY[id] ?? SPRITE_LIBRARY.cat
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      spriteImageCache.set(id, img)
      resolve(img)
    }
    if (entry.png) {
      img.src = entry.png
    } else if (entry.svg) {
      const blob = new Blob([entry.svg], { type: 'image/svg+xml' })
      img.src = URL.createObjectURL(blob)
    }
  })
}

const BG_DRAWS: Record<Background, (ctx: CanvasRenderingContext2D) => void> = {
  white: (ctx) => {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, STAGE_W, STAGE_H)
  },
  sky: (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, STAGE_H)
    g.addColorStop(0, '#87CEEB')
    g.addColorStop(0.6, '#B0E0F8')
    g.addColorStop(0.8, '#98D8C4')
    g.addColorStop(1, '#7BC8A0')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, STAGE_W, STAGE_H)
    // ground
    const gg = ctx.createLinearGradient(0, STAGE_H * 0.72, 0, STAGE_H)
    gg.addColorStop(0, '#7BC8A0')
    gg.addColorStop(1, '#5DAF84')
    ctx.fillStyle = gg
    ctx.fillRect(0, STAGE_H * 0.72, STAGE_W, STAGE_H)
    // clouds
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    drawCloud(ctx, 80, 65, 80, 28)
    drawCloud(ctx, 350, 45, 60, 22)
    drawCloud(ctx, 260, 100, 50, 18)
  },
  night: (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, STAGE_H)
    g.addColorStop(0, '#1a1a2e')
    g.addColorStop(1, '#16213e')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, STAGE_W, STAGE_H)
    // stars
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    for (let i = 0; i < 40; i++) {
      const sx = ((i * 137) % STAGE_W)
      const sy = ((i * 97) % (STAGE_H * 0.7))
      const r = i % 3 === 0 ? 2 : 1
      ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.fill()
    }
  },
  ocean: (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, STAGE_H)
    g.addColorStop(0, '#0077B6')
    g.addColorStop(0.5, '#00B4D8')
    g.addColorStop(1, '#90E0EF')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, STAGE_W, STAGE_H)
  },
  space: (ctx) => {
    const g = ctx.createRadialGradient(STAGE_W * 0.3, STAGE_H * 0.4, 0, STAGE_W * 0.5, STAGE_H * 0.5, STAGE_W)
    g.addColorStop(0, '#2d1b69')
    g.addColorStop(1, '#000000')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, STAGE_W, STAGE_H)
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    for (let i = 0; i < 60; i++) {
      const sx = ((i * 173) % STAGE_W)
      const sy = ((i * 113) % STAGE_H)
      ctx.beginPath(); ctx.arc(sx, sy, 1, 0, Math.PI * 2); ctx.fill()
    }
  },
  forest: (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, STAGE_H)
    g.addColorStop(0, '#87CEEB')
    g.addColorStop(0.5, '#228B22')
    g.addColorStop(1, '#006400')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, STAGE_W, STAGE_H)
  },
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.beginPath()
  ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2)
  ctx.fill()
}

export function renderStage(
  canvas: HTMLCanvasElement,
  entities: SpriteEntity[],
  images: Map<string, HTMLImageElement>,
  bg: Background,
  score?: number,
  lives?: number,
): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // background
  BG_DRAWS[bg](ctx)

  // draw entities in z-order (index 0 = bottom, last = top)
  for (const entity of entities) {
    if (!entity.state.visible) continue

    const entry = SPRITE_LIBRARY[entity.state.spriteId] ?? SPRITE_LIBRARY.cat
    const img = images.get(entity.state.spriteId)

    const baseW = entry.naturalW
    const baseH = entry.naturalH
    const spriteW = baseW * (entity.state.size / 100)
    const spriteH = baseH * (entity.state.size / 100)
    const cx = STAGE_W / 2 + entity.state.x
    const cy = STAGE_H / 2 - entity.state.y

    if (img) {
      ctx.save()
      ctx.translate(cx, cy)
      if (entity.state.direction > 180) ctx.scale(-1, 1)
      ctx.drawImage(img, -spriteW / 2, -spriteH / 2, spriteW, spriteH)
      ctx.restore()
    }

    // speech bubble
    if (entity.state.speech) {
      ctx.save()
      ctx.font = 'bold 13px Nunito, sans-serif'
      const padding = 10
      const tw = ctx.measureText(entity.state.speech).width
      const bw = tw + padding * 2
      const bh = 30
      const bx = cx - bw / 2
      const by = cy - spriteH / 2 - bh - 10
      ctx.fillStyle = '#fff'
      ctx.strokeStyle = '#FFE0D6'
      ctx.lineWidth = 2.5
      roundRect(ctx, bx, by, bw, bh, 10)
      ctx.fill()
      ctx.stroke()
      // tail
      ctx.beginPath()
      ctx.moveTo(cx - 8, by + bh)
      ctx.lineTo(cx + 4, by + bh)
      ctx.lineTo(cx - 4, by + bh + 8)
      ctx.closePath()
      ctx.fillStyle = '#fff'
      ctx.fill()
      ctx.fillStyle = '#2C1810'
      ctx.fillText(entity.state.speech, bx + padding, by + bh / 2 + 5)
      ctx.restore()
    }
  }

  // coordinate display for first entity
  if (entities.length > 0) {
    const first = entities[0]
    ctx.save()
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.font = '11px monospace'
    ctx.fillText(`x: ${Math.round(first.state.x)}  y: ${Math.round(first.state.y)}`, 8, STAGE_H - 6)
    ctx.restore()
  }

  // HUD: score (top-right) + lives (top-left)
  ctx.save()
  ctx.font = 'bold 18px Nunito, sans-serif'
  ctx.shadowColor = 'rgba(0,0,0,0.6)'
  ctx.shadowBlur = 4
  if (score !== undefined) {
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'right'
    ctx.fillText(`점수: ${score}`, STAGE_W - 10, 28)
  }
  if (lives !== undefined) {
    ctx.fillStyle = '#FF4444'
    ctx.textAlign = 'left'
    ctx.fillText('♥'.repeat(Math.max(0, lives)), 10, 28)
  }
  ctx.restore()
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

// ── Execution engine ─────────────────────────────────────────────

type Block = BlocklyType.Block

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms))
}

export class SpriteRuntime {
  state: SpriteState
  private entity: SpriteEntity
  private engine: GameEngine
  private canvas: HTMLCanvasElement
  private stopFlag = false
  private mouseClickHandlers: (() => void)[] = []
  private onStateChange?: (s: SpriteState) => void
  private animRaf: number | null = null
  private variables: Map<string, number> = new Map()
  private mouseX = 0
  private mouseY = 0
  private detachMouse: (() => void) | null = null

  private get keysDown() { return this.engine.keysDown }

  constructor(
    canvas: HTMLCanvasElement,
    entity: SpriteEntity,
    engine: GameEngine,
    onStateChange?: (s: SpriteState) => void,
  ) {
    this.entity = entity
    this.state = entity.state  // SHARED reference
    this.engine = engine
    this.canvas = canvas
    this.onStateChange = onStateChange
  }

  render() {
    this.engine.render()
    this.onStateChange?.({ ...this.state })
  }

  stop() {
    this.stopFlag = true
    if (this.animRaf !== null) {
      cancelAnimationFrame(this.animRaf)
      this.animRaf = null
    }
    this.mouseClickHandlers.forEach((h) => document.removeEventListener('click', h))
    this.mouseClickHandlers = []
    this.detachMouse?.()
    this.detachMouse = null
  }

  async run(workspace: BlocklyType.WorkspaceSvg) {
    this.stopFlag = false
    const topBlocks = workspace.getTopBlocks(true) as Block[]

    // attach canvas mousemove listener for mouse sensing
    const rect = this.canvas.getBoundingClientRect()
    const mm = (e: MouseEvent) => {
      const scaleX = STAGE_W / rect.width
      const scaleY = STAGE_H / rect.height
      this.mouseX = (e.clientX - rect.left) * scaleX - STAGE_W / 2
      this.mouseY = -(((e.clientY - rect.top) * scaleY) - STAGE_H / 2)
    }
    this.canvas.addEventListener('mousemove', mm)
    this.detachMouse = () => this.canvas.removeEventListener('mousemove', mm)

    const promises: Promise<void>[] = []

    const KEY_HAT_MAP: Record<string, string> = {
      wc_key_hat_up: 'ArrowUp',
      wc_key_hat_down: 'ArrowDown',
      wc_key_hat_left: 'ArrowLeft',
      wc_key_hat_right: 'ArrowRight',
      wc_key_hat_space: ' ',
    }

    for (const block of topBlocks) {
      if (block.type === 'wc_start') {
        promises.push(this.executeStack(block.getNextBlock()))
      } else if (block.type in KEY_HAT_MAP) {
        promises.push(this.runKeyHat(KEY_HAT_MAP[block.type], block.getNextBlock()))
      } else if (block.type === 'wc_mouse_click_hat') {
        promises.push(this.runMouseHat(block.getNextBlock()))
      }
      // wc_when_clone_start is intentionally skipped here — handled by runFromClone()
    }

    await Promise.allSettled(promises)
  }

  async runFromClone(workspace: BlocklyType.WorkspaceSvg): Promise<void> {
    this.stopFlag = false
    const topBlocks = workspace.getTopBlocks(true) as Block[]
    const promises: Promise<void>[] = []
    for (const block of topBlocks) {
      if (block.type === 'wc_when_clone_start') {
        promises.push(this.executeStack(block.getNextBlock()))
      }
    }
    await Promise.allSettled(promises)
  }

  private async runKeyHat(key: string, firstBlock: Block | null) {
    return new Promise<void>((resolve) => {
      const handler = async (e: KeyboardEvent) => {
        if (e.key === key && !this.stopFlag) {
          document.removeEventListener('keydown', handler)
          await this.executeStack(firstBlock)
          resolve()
        }
      }
      if (this.stopFlag) { resolve(); return }
      document.addEventListener('keydown', handler)
    })
  }

  private async runMouseHat(firstBlock: Block | null) {
    return new Promise<void>((resolve) => {
      const handler = async () => {
        if (!this.stopFlag) {
          this.canvas.removeEventListener('click', handler)
          await this.executeStack(firstBlock)
          resolve()
        }
      }
      if (this.stopFlag) { resolve(); return }
      this.canvas.addEventListener('click', handler)
    })
  }

  private async executeStack(block: Block | null) {
    let cur: Block | null = block
    while (cur && !this.stopFlag) {
      await this.executeBlock(cur)
      cur = cur.getNextBlock() as Block | null
    }
  }

  private async executeBlock(block: Block) {
    if (this.stopFlag) return
    switch (block.type) {
      // ── CONTROL ──
      case 'wc_wait': {
        const secs = Number(block.getFieldValue('SECS'))
        await sleep(secs * 1000)
        break
      }
      case 'wc_repeat': {
        const times = Number(block.getFieldValue('TIMES'))
        const inner = block.getInputTargetBlock('DO') as Block | null
        for (let i = 0; i < times && !this.stopFlag; i++) {
          await this.executeStack(inner)
        }
        break
      }
      case 'wc_repeat_until': {
        const inner = block.getInputTargetBlock('DO') as Block | null
        const condBlock = block.getInputTargetBlock('COND') as Block | null
        while (!this.stopFlag) {
          const cond = condBlock ? await this.evalBool(condBlock) : false
          if (cond) break
          await this.executeStack(inner)
          await sleep(0)
        }
        break
      }
      case 'wc_forever': {
        const inner = block.getInputTargetBlock('DO') as Block | null
        while (!this.stopFlag) {
          await this.executeStack(inner)
          await sleep(0)
        }
        break
      }
      case 'wc_if': {
        const condBlock = block.getInputTargetBlock('COND') as Block | null
        const cond = condBlock ? await this.evalBool(condBlock) : false
        if (cond) {
          const inner = block.getInputTargetBlock('DO') as Block | null
          await this.executeStack(inner)
        }
        break
      }
      case 'wc_if_else': {
        const condBlock = block.getInputTargetBlock('COND') as Block | null
        const cond = condBlock ? await this.evalBool(condBlock) : false
        if (cond) {
          await this.executeStack(block.getInputTargetBlock('DO') as Block | null)
        } else {
          await this.executeStack(block.getInputTargetBlock('ELSE') as Block | null)
        }
        break
      }
      case 'wc_stop_all':
        this.stopFlag = true
        break

      // ── MOTION ──
      case 'wc_move_steps': {
        const steps = Number(block.getFieldValue('STEPS'))
        const rad = ((this.state.direction - 90) * Math.PI) / 180
        this.state.x += steps * Math.cos(rad)
        this.state.y += steps * Math.sin(rad)
        this.clampToWall()
        this.render()
        await sleep(16)
        break
      }
      case 'wc_move_dir': {
        const dir = block.getFieldValue('DIR') as string
        const steps = Number(block.getFieldValue('STEPS'))
        const delta: Record<string, [number, number]> = {
          UP: [0, steps], DOWN: [0, -steps], RIGHT: [steps, 0], LEFT: [-steps, 0],
        }
        const [dx, dy] = delta[dir] ?? [0, 0]
        this.state.x += dx
        this.state.y += dy
        this.clampToWall()
        this.render()
        await sleep(16)
        break
      }
      case 'wc_go_to': {
        this.state.x = Number(block.getFieldValue('X'))
        this.state.y = Number(block.getFieldValue('Y'))
        this.clampToWall()
        this.render()
        await sleep(16)
        break
      }
      case 'wc_rotate': {
        this.state.direction = (this.state.direction + Number(block.getFieldValue('DEGREES'))) % 360
        this.render()
        await sleep(16)
        break
      }
      case 'wc_reset_pos': {
        this.state.x = 0
        this.state.y = 0
        this.state.direction = 90
        this.render()
        await sleep(16)
        break
      }
      case 'wc_change_x': {
        this.state.x += Number(block.getFieldValue('DX'))
        this.clampToWall()
        this.render()
        await sleep(16)
        break
      }
      case 'wc_change_y': {
        this.state.y += Number(block.getFieldValue('DY'))
        this.clampToWall()
        this.render()
        await sleep(16)
        break
      }
      case 'wc_set_direction': {
        const valBlock = block.getInputTargetBlock('VALUE') as Block | null
        this.state.direction = ((valBlock ? await this.evalNumber(valBlock) : 90) % 360 + 360) % 360
        this.render()
        await sleep(16)
        break
      }
      case 'wc_bounce_wall': {
        const bwEntry = SPRITE_LIBRARY[this.state.spriteId] ?? SPRITE_LIBRARY.cat
        const bwHW = (bwEntry.naturalW / 2) * (this.state.size / 100)
        const bwHH = (bwEntry.naturalH / 2) * (this.state.size / 100)
        if (Math.abs(this.state.x) + bwHW >= STAGE_W / 2) {
          this.state.direction = 360 - this.state.direction
        }
        if (Math.abs(this.state.y) + bwHH >= STAGE_H / 2) {
          this.state.direction = 180 - this.state.direction
        }
        this.state.direction = ((this.state.direction % 360) + 360) % 360
        this.render()
        await sleep(16)
        break
      }
      case 'wc_glide_to': {
        const secs = Number(block.getFieldValue('SECS'))
        const targetX = Number(block.getFieldValue('X'))
        const targetY = Number(block.getFieldValue('Y'))
        const startX = this.state.x
        const startY = this.state.y
        const frames = Math.max(1, Math.round(secs * 30))
        for (let i = 1; i <= frames && !this.stopFlag; i++) {
          const t = i / frames
          this.state.x = startX + (targetX - startX) * t
          this.state.y = startY + (targetY - startY) * t
          this.render()
          await sleep(1000 / 30)
        }
        break
      }

      // ── SPEECH ──
      case 'wc_say': {
        this.state.speech = block.getFieldValue('TEXT')
        this.render()
        break
      }
      case 'wc_say_for': {
        this.state.speech = block.getFieldValue('TEXT')
        this.render()
        const secs = Number(block.getFieldValue('SECS'))
        await sleep(secs * 1000)
        this.state.speech = null
        this.render()
        break
      }
      case 'wc_clear_speech': {
        this.state.speech = null
        this.render()
        break
      }

      // ── LOOKS ──
      case 'wc_show':
        this.state.visible = true
        this.render()
        break
      case 'wc_hide':
        this.state.visible = false
        this.render()
        break
      case 'wc_set_size':
        this.state.size = Number(block.getFieldValue('SIZE'))
        this.render()
        break
      case 'wc_change_size':
        this.state.size = Math.max(10, this.state.size + Number(block.getFieldValue('DELTA')))
        this.render()
        break

      // ── SOUND (no-op) ──
      case 'wc_play_sound':
      case 'wc_stop_sound':
        break

      // ── VARIABLES ──
      case 'wc_var_set': {
        const name = block.getFieldValue('NAME') as string
        const valBlock = block.getInputTargetBlock('VALUE') as Block | null
        const val = valBlock ? await this.evalNumber(valBlock) : 0
        this.variables.set(name, val)
        break
      }
      case 'wc_var_change': {
        const name = block.getFieldValue('NAME') as string
        const valBlock = block.getInputTargetBlock('VALUE') as Block | null
        const delta = valBlock ? await this.evalNumber(valBlock) : 0
        this.variables.set(name, (this.variables.get(name) ?? 0) + delta)
        break
      }

      // ── BOUNCE SIDES ONLY (no bottom) ──
      case 'wc_bounce_sides': {
        const bsEntry = SPRITE_LIBRARY[this.state.spriteId] ?? SPRITE_LIBRARY.cat
        const bsHW = (bsEntry.naturalW / 2) * (this.state.size / 100)
        const bsHH = (bsEntry.naturalH / 2) * (this.state.size / 100)
        if (this.state.x - bsHW < -STAGE_W / 2 || this.state.x + bsHW > STAGE_W / 2) {
          this.state.direction = 360 - this.state.direction
          this.state.x = Math.max(-STAGE_W / 2 + bsHW, Math.min(STAGE_W / 2 - bsHW, this.state.x))
        }
        if (this.state.y + bsHH > STAGE_H / 2) {
          this.state.direction = 180 - this.state.direction
          this.state.y = Math.min(STAGE_H / 2 - bsHH, this.state.y)
        }
        this.render()
        await sleep(16)
        break
      }

      // ── SCORE ──
      case 'wc_score_add': {
        const valBlock = block.getInputTargetBlock('VALUE') as Block | null
        this.engine.score += valBlock ? await this.evalNumber(valBlock) : 1
        this.render()
        break
      }
      case 'wc_score_reset':
        this.engine.score = 0
        this.render()
        break
      case 'wc_lives_set':
        this.engine.lives = Number(block.getFieldValue('VALUE') ?? 3)
        this.render()
        break
      case 'wc_lives_change':
        this.engine.lives += Number(block.getFieldValue('DELTA') ?? -1)
        this.render()
        break

      // ── MOUSE SENSING ──
      case 'wc_set_x_to_mouse': {
        this.state.x = Math.max(-(STAGE_W / 2 - 36), Math.min(STAGE_W / 2 - 36, this.mouseX))
        this.render()
        await sleep(16)
        break
      }

      // ── PHYSICS ──
      case 'wc_set_vx': {
        const valBlock = block.getInputTargetBlock('VALUE') as Block | null
        this.state.vx = valBlock ? await this.evalNumber(valBlock) : 0
        break
      }
      case 'wc_set_vy': {
        const valBlock = block.getInputTargetBlock('VALUE') as Block | null
        this.state.vy = valBlock ? await this.evalNumber(valBlock) : 0
        break
      }
      case 'wc_change_vx': {
        const valBlock = block.getInputTargetBlock('VALUE') as Block | null
        this.state.vx += valBlock ? await this.evalNumber(valBlock) : 0
        break
      }
      case 'wc_change_vy': {
        const valBlock = block.getInputTargetBlock('VALUE') as Block | null
        this.state.vy += valBlock ? await this.evalNumber(valBlock) : 0
        break
      }
      case 'wc_apply_velocity': {
        this.state.x += this.state.vx
        this.state.y += this.state.vy
        this.clampToWall()
        this.render()
        await sleep(16)
        break
      }
      case 'wc_apply_gravity': {
        const gravBlock = block.getInputTargetBlock('GRAVITY') as Block | null
        const grav = gravBlock ? await this.evalNumber(gravBlock) : 1
        this.state.vy -= grav
        break
      }

      // ── CLONE ──
      case 'wc_clone_self': {
        this.engine.cloneSprite(this.entity.id)
        await sleep(0)
        break
      }
      case 'wc_delete_clone': {
        if (this.entity.isClone) {
          this.engine.deleteEntity(this.entity.id)
          this.stopFlag = true
        }
        break
      }

      // ── LOOKS (delete) ──
      case 'wc_delete_sprite': {
        this.engine.deleteEntity(this.entity.id)
        this.stopFlag = true
        break
      }
    }
  }

  private async evalNumber(block: Block): Promise<number> {
    switch (block.type) {
      case 'wc_num_literal':
        return Number(block.getFieldValue('NUM'))
      case 'wc_var_get':
        return this.variables.get(block.getFieldValue('NAME') as string) ?? 0
      case 'wc_mouse_x':
        return this.mouseX
      case 'wc_mouse_y':
        return this.mouseY
      case 'wc_random': {
        const fromB = block.getInputTargetBlock('FROM') as Block | null
        const toB = block.getInputTargetBlock('TO') as Block | null
        const from = fromB ? await this.evalNumber(fromB) : 1
        const to = toB ? await this.evalNumber(toB) : 10
        return Math.floor(Math.random() * (to - from + 1)) + from
      }
      case 'wc_add': {
        const a = block.getInputTargetBlock('A') as Block | null
        const b = block.getInputTargetBlock('B') as Block | null
        return (a ? await this.evalNumber(a) : 0) + (b ? await this.evalNumber(b) : 0)
      }
      case 'wc_sub': {
        const a = block.getInputTargetBlock('A') as Block | null
        const b = block.getInputTargetBlock('B') as Block | null
        return (a ? await this.evalNumber(a) : 0) - (b ? await this.evalNumber(b) : 0)
      }
      case 'wc_mul': {
        const a = block.getInputTargetBlock('A') as Block | null
        const b = block.getInputTargetBlock('B') as Block | null
        return (a ? await this.evalNumber(a) : 0) * (b ? await this.evalNumber(b) : 1)
      }
      case 'wc_div': {
        const a = block.getInputTargetBlock('A') as Block | null
        const b = block.getInputTargetBlock('B') as Block | null
        const divisor = b ? await this.evalNumber(b) : 1
        return divisor !== 0 ? (a ? await this.evalNumber(a) : 0) / divisor : 0
      }
      case 'wc_get_vx':
        return this.state.vx
      case 'wc_get_vy':
        return this.state.vy
      case 'wc_get_direction':
        return this.state.direction
      case 'wc_lives_get':
        return this.engine.lives
      case 'wc_sprite_x_of': {
        const name = block.getFieldValue('SPRITE') as string
        return this.engine.getSpriteState(name)?.x ?? 0
      }
      case 'wc_sprite_y_of': {
        const name = block.getFieldValue('SPRITE') as string
        return this.engine.getSpriteState(name)?.y ?? 0
      }
      default:
        return Number(block.getFieldValue('NUM') ?? block.getFieldValue('VALUE') ?? 0)
    }
  }

  private async evalBool(block: Block): Promise<boolean> {
    switch (block.type) {
      case 'wc_wall_touching':
        return this.isTouchingWall()
      case 'wc_key_pressed':
        return this.keysDown.has(block.getFieldValue('KEY') as string)
      case 'wc_gt': {
        const a = block.getInputTargetBlock('A') as Block | null
        const b = block.getInputTargetBlock('B') as Block | null
        return (a ? await this.evalNumber(a) : 0) > (b ? await this.evalNumber(b) : 0)
      }
      case 'wc_lt': {
        const a = block.getInputTargetBlock('A') as Block | null
        const b = block.getInputTargetBlock('B') as Block | null
        return (a ? await this.evalNumber(a) : 0) < (b ? await this.evalNumber(b) : 0)
      }
      case 'wc_eq': {
        const a = block.getInputTargetBlock('A') as Block | null
        const b = block.getInputTargetBlock('B') as Block | null
        return (a ? await this.evalNumber(a) : 0) === (b ? await this.evalNumber(b) : 0)
      }
      case 'wc_touching_sprite': {
        const targetName = block.getFieldValue('SPRITE') as string
        return this.engine.isTouchingSprite(this.entity.id, targetName)
      }
      case 'wc_on_floor': {
        // true if sprite is near the bottom wall
        const entry = SPRITE_LIBRARY[this.state.spriteId] ?? SPRITE_LIBRARY.cat
        const hh = (entry.naturalH / 2) * (this.state.size / 100)
        return this.state.y - hh <= -STAGE_H / 2 + 2
      }
      default:
        return false
    }
  }

  private isTouchingWall(): boolean {
    const entry = SPRITE_LIBRARY[this.state.spriteId] ?? SPRITE_LIBRARY.cat
    const hw = (entry.naturalW / 2) * (this.state.size / 100)
    const hh = (entry.naturalH / 2) * (this.state.size / 100)
    return (
      this.state.x - hw < -STAGE_W / 2 ||
      this.state.x + hw > STAGE_W / 2 ||
      this.state.y - hh < -STAGE_H / 2 ||
      this.state.y + hh > STAGE_H / 2
    )
  }

  private clampToWall() {
    const entry = SPRITE_LIBRARY[this.state.spriteId] ?? SPRITE_LIBRARY.cat
    const hw = (entry.naturalW / 2) * (this.state.size / 100)
    const hh = (entry.naturalH / 2) * (this.state.size / 100)
    this.state.x = Math.max(-STAGE_W / 2 + hw, Math.min(STAGE_W / 2 - hw, this.state.x))
    this.state.y = Math.max(-STAGE_H / 2 + hh, Math.min(STAGE_H / 2 - hh, this.state.y))
  }
}

export class GameEngine {
  entities: SpriteEntity[]
  keysDown: Set<string>  // public so SpriteRuntime can read it
  score = 0
  lives = 3
  private canvas: HTMLCanvasElement
  private runtimes: Map<string, SpriteRuntime>
  private onEntitiesChange: (e: SpriteEntity[]) => void
  images: Map<string, HTMLImageElement>  // public for renderStage
  private detachKeys: (() => void) | null = null
  private cloneCounter = 0

  constructor(
    canvas: HTMLCanvasElement,
    entities: SpriteEntity[],
    onEntitiesChange: (e: SpriteEntity[]) => void,
  ) {
    this.canvas = canvas
    this.entities = entities
    this.onEntitiesChange = onEntitiesChange
    this.runtimes = new Map()
    this.keysDown = new Set()
    this.images = new Map()
  }

  async loadImages(): Promise<void> {
    // load images for all unique spriteIds in entities
    const ids = [...new Set(this.entities.map(e => e.state.spriteId))]
    await Promise.all(ids.map(id => getSpriteImageExport(id).then(img => this.images.set(id, img))))
  }

  async run(workspaces: Map<string, BlocklyType.WorkspaceSvg>): Promise<void> {
    await this.loadImages()
    this.attachKeyListeners()
    this.render()

    // create SpriteRuntime for each entity (only non-clone entities have workspaces)
    const promises: Promise<void>[] = []
    for (const entity of this.entities) {
      const ws = workspaces.get(entity.id)
      if (!ws) continue
      const rt = new SpriteRuntime(this.canvas, entity, this)
      this.runtimes.set(entity.id, rt)
      promises.push(rt.run(ws))
    }
    await Promise.allSettled(promises)
  }

  stop(): void {
    for (const rt of this.runtimes.values()) rt.stop()
    this.runtimes.clear()
    this.detachKeys?.()
    this.detachKeys = null
  }

  render(): void {
    const bg = this.entities[0]?.state.bg ?? 'sky'
    renderStage(this.canvas, this.entities, this.images, bg, this.score, this.lives)
  }

  attachKeyListeners(): () => void {
    const kd = (e: KeyboardEvent) => this.keysDown.add(e.key)
    const ku = (e: KeyboardEvent) => this.keysDown.delete(e.key)
    document.addEventListener('keydown', kd)
    document.addEventListener('keyup', ku)
    const detach = () => {
      document.removeEventListener('keydown', kd)
      document.removeEventListener('keyup', ku)
    }
    this.detachKeys = detach
    return detach
  }

  cloneSprite(sourceId: string): void {
    const source = this.entities.find(e => e.id === sourceId)
    if (!source) return
    this.cloneCounter++
    const cloneId = `${sourceId}_clone_${this.cloneCounter}`
    const cloneEntity: SpriteEntity = {
      id: cloneId,
      name: source.name,
      isClone: true,
      state: { ...source.state },
      workspaceData: source.workspaceData,
    }
    this.entities.push(cloneEntity)
    this.onEntitiesChange([...this.entities])

    // load clone's image if not already loaded
    const spriteId = cloneEntity.state.spriteId
    if (!this.images.has(spriteId)) {
      getSpriteImageExport(spriteId).then(img => this.images.set(spriteId, img))
    }

    // run clone's blocks from wc_when_clone_start using dynamic Blockly import
    // create a headless workspace and load the clone's workspaceData
    void (async () => {
      try {
        const Blockly = await import('blockly')
        const ws = new Blockly.Workspace() as unknown as BlocklyType.WorkspaceSvg
        Blockly.serialization.workspaces.load(cloneEntity.workspaceData as Parameters<typeof Blockly.serialization.workspaces.load>[0], ws)
        const rt = new SpriteRuntime(this.canvas, cloneEntity, this)
        this.runtimes.set(cloneId, rt)
        await rt.runFromClone(ws)
      } catch {
        // clone execution failed, clean up
        this.deleteEntity(cloneId)
      }
    })()
  }

  deleteEntity(id: string): void {
    const rt = this.runtimes.get(id)
    if (rt) { rt.stop(); this.runtimes.delete(id) }
    this.entities = this.entities.filter(e => e.id !== id)
    this.onEntitiesChange([...this.entities])
    this.render()
  }

  isTouchingSprite(aId: string, bName: string): boolean {
    const a = this.entities.find(e => e.id === aId)
    const b = this.entities.find(e => e.name === bName && e.id !== aId)
    if (!a || !b) return false
    if (!a.state.visible || !b.state.visible) return false

    const aEntry = SPRITE_LIBRARY[a.state.spriteId] ?? SPRITE_LIBRARY.cat
    const bEntry = SPRITE_LIBRARY[b.state.spriteId] ?? SPRITE_LIBRARY.cat
    const aHW = (aEntry.naturalW / 2) * (a.state.size / 100)
    const aHH = (aEntry.naturalH / 2) * (a.state.size / 100)
    const bHW = (bEntry.naturalW / 2) * (b.state.size / 100)
    const bHH = (bEntry.naturalH / 2) * (b.state.size / 100)

    return (
      Math.abs(a.state.x - b.state.x) < aHW + bHW &&
      Math.abs(a.state.y - b.state.y) < aHH + bHH
    )
  }

  getSpriteState(name: string): SpriteState | null {
    return this.entities.find(e => e.name === name)?.state ?? null
  }
}
