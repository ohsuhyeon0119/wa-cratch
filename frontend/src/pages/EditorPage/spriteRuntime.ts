import type * as BlocklyType from 'blockly'

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
}

const STAGE_W = 480
const STAGE_H = 360

export function defaultSpriteState(): SpriteState {
  return { x: 0, y: -35, direction: 90, visible: true, size: 100, speech: null, bg: 'white', spriteId: 'cat' }
}

// ── Canvas rendering ──────────────────────────────────────────────

export interface SpriteEntry { name: string; svg: string }

export const SPRITE_LIBRARY: Record<string, SpriteEntry> = {
  cat: {
    name: '와냥이',
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
    svg: `<svg viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="10" width="192" height="42" rx="21" fill="#CC3A0A"/>
  <rect x="2" y="6" width="192" height="42" rx="21" fill="#FF6B35"/>
  <rect x="10" y="10" width="120" height="16" rx="8" fill="rgba(255,255,255,0.28)"/>
  <rect x="10" y="10" width="45" height="8" rx="4" fill="rgba(255,255,255,0.18)"/>
</svg>`,
  },
  brick_red: {
    name: '빨간 벽돌',
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
    const blob = new Blob([entry.svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      spriteImageCache.set(id, img)
      resolve(img)
    }
    img.src = url
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

export function renderStage(canvas: HTMLCanvasElement, state: SpriteState, img?: HTMLImageElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // background
  BG_DRAWS[state.bg](ctx)

  if (!state.visible) return

  const spriteW = 72 * (state.size / 100)
  const spriteH = 88 * (state.size / 100)
  const cx = STAGE_W / 2 + state.x
  const cy = STAGE_H / 2 - state.y

  if (img) {
    ctx.save()
    ctx.translate(cx, cy)
    if (state.direction > 180) ctx.scale(-1, 1)
    ctx.drawImage(img, -spriteW / 2, -spriteH / 2, spriteW, spriteH)
    ctx.restore()
  }

  // speech bubble
  if (state.speech) {
    ctx.save()
    ctx.font = 'bold 13px Nunito, sans-serif'
    const padding = 10
    const tw = ctx.measureText(state.speech).width
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
    ctx.fillText(state.speech, bx + padding, by + bh / 2 + 5)
    ctx.restore()
  }

  // coordinate display
  ctx.save()
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.font = '11px monospace'
  ctx.fillText(`x: ${Math.round(state.x)}  y: ${Math.round(state.y)}`, 8, STAGE_H - 6)
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
  private canvas: HTMLCanvasElement
  private img: HTMLImageElement | null = null
  private keysDown: Set<string> = new Set()
  private stopFlag = false
  private mouseClickHandlers: (() => void)[] = []
  private onStateChange?: (s: SpriteState) => void
  private animRaf: number | null = null
  private variables: Map<string, number> = new Map()
  private mouseX = 0
  private mouseY = 0
  private detachMouse: (() => void) | null = null

  constructor(canvas: HTMLCanvasElement, initialState: SpriteState, onStateChange?: (s: SpriteState) => void) {
    this.state = { ...initialState }
    this.canvas = canvas
    this.onStateChange = onStateChange
    getSpriteImage(this.state.spriteId).then((img) => {
      this.img = img
      this.render()
    })
  }

  render() {
    const cached = spriteImageCache.get(this.state.spriteId)
    if (cached && cached !== this.img) this.img = cached
    renderStage(this.canvas, this.state, this.img ?? undefined)
    this.onStateChange?.({ ...this.state })
  }

  // track keyboard + mouse position
  attachKeyListeners() {
    const kd = (e: KeyboardEvent) => this.keysDown.add(e.key)
    const ku = (e: KeyboardEvent) => this.keysDown.delete(e.key)
    document.addEventListener('keydown', kd)
    document.addEventListener('keyup', ku)

    const rect = this.canvas.getBoundingClientRect()
    const mm = (e: MouseEvent) => {
      const scaleX = STAGE_W / rect.width
      const scaleY = STAGE_H / rect.height
      this.mouseX = (e.clientX - rect.left) * scaleX - STAGE_W / 2
      this.mouseY = -(((e.clientY - rect.top) * scaleY) - STAGE_H / 2)
    }
    this.canvas.addEventListener('mousemove', mm)
    this.detachMouse = () => this.canvas.removeEventListener('mousemove', mm)

    return () => {
      document.removeEventListener('keydown', kd)
      document.removeEventListener('keyup', ku)
      this.detachMouse?.()
      this.detachMouse = null
    }
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
        this.state.direction = Number(block.getFieldValue('DIR'))
        this.render()
        await sleep(16)
        break
      }
      case 'wc_bounce_wall': {
        const maxX = STAGE_W / 2 - 36
        const maxY = STAGE_H / 2 - 44
        if (Math.abs(this.state.x) >= maxX) {
          this.state.direction = 180 - this.state.direction
        }
        if (Math.abs(this.state.y) >= maxY) {
          this.state.direction = -this.state.direction
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

      // ── MOUSE SENSING ──
      case 'wc_set_x_to_mouse': {
        this.state.x = Math.max(-(STAGE_W / 2 - 36), Math.min(STAGE_W / 2 - 36, this.mouseX))
        this.render()
        await sleep(16)
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
      default:
        return false
    }
  }

  private isTouchingWall(): boolean {
    const spriteW = 36 * (this.state.size / 100)
    const spriteH = 44 * (this.state.size / 100)
    return (
      this.state.x - spriteW < -STAGE_W / 2 ||
      this.state.x + spriteW > STAGE_W / 2 ||
      this.state.y - spriteH < -STAGE_H / 2 ||
      this.state.y + spriteH > STAGE_H / 2
    )
  }

  private clampToWall() {
    const maxX = STAGE_W / 2 - 36
    const maxY = STAGE_H / 2 - 44
    this.state.x = Math.max(-maxX, Math.min(maxX, this.state.x))
    this.state.y = Math.max(-maxY, Math.min(maxY, this.state.y))
  }
}
