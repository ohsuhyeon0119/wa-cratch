import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import * as Blockly from 'blockly'
import s from './EditorPage.module.css'
import { useToast } from '../../hooks/useToast'
import Toast from '../../components/Toast/Toast'
import StageCanvas from './StageCanvas'
import { useAuth } from '../../context/AuthContext'
import { registerBlocks, TOOLBOX_CONFIG } from './blockDefs'
import { SpriteRuntime, defaultSpriteState, SPRITE_LIBRARY } from './spriteRuntime'
import type { SpriteState, Background } from './spriteRuntime'
import { getProject, createProject, updateProject } from '../../api/projects'
import axios from 'axios'
import VoiceAgent from '../../components/VoiceAgent/VoiceAgent'

registerBlocks()

export default function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toastVisible, toastMessage, toastType, showToast } = useToast()
  const { user } = useAuth()
  const [isRunning, setIsRunning] = useState(false)
  const [spriteState, setSpriteState] = useState<SpriteState>(defaultSpriteState())
  const [selectedBg, setSelectedBg] = useState<Background>('sky')
  const [blockCount, setBlockCount] = useState(0)
  const [projectTitle, setProjectTitle] = useState('새 프로젝트')
  const [flyoutOpen, setFlyoutOpen] = useState(false)
  const [flyoutBtnLeft, setFlyoutBtnLeft] = useState(164)

  const workspaceDivRef = useRef<HTMLDivElement>(null)
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const runtimeRef = useRef<SpriteRuntime | null>(null)
  const detachKeysRef = useRef<(() => void) | null>(null)

  // Blockly 워크스페이스 주입
  useEffect(() => {
    const div = workspaceDivRef.current
    if (!div) return

    const workspace = Blockly.inject(div, {
      toolbox: TOOLBOX_CONFIG,
      grid: { spacing: 24, length: 3, colour: 'rgba(255,107,53,0.08)', snap: true },
      zoom: { controls: true, wheel: true, startScale: 0.9, maxScale: 3, minScale: 0.3 },
      trashcan: true,
      scrollbars: true,
      renderer: 'zelos',
      theme: Blockly.Themes.Zelos,
      sounds: false,
    })
    workspaceRef.current = workspace

    // Flyout 자동 닫힘 방지
    const flyout = workspace.getFlyout()
    if (flyout) {
      flyout.autoClose = false

      // 카테고리 선택 시: 해당 카테고리 색상을 배경으로 적용 + flyout 상태 동기화
      workspace.addChangeListener((e: Blockly.Events.Abstract) => {
        if (e.type === Blockly.Events.TOOLBOX_ITEM_SELECT) {
          requestAnimationFrame(() => {
            // 모든 카테고리 배경 초기화
            div.querySelectorAll('.blocklyToolboxCategory').forEach((cat) => {
              ;(cat as HTMLElement).style.removeProperty('background-color')
            })
            // 선택된 카테고리에 자기 색상 적용
            const selected = div.querySelector(
              '.blocklyToolboxCategory.blocklyToolboxSelected'
            ) as HTMLElement | null
            if (selected) {
              const color = selected.style.borderLeftColor
              if (color) selected.style.setProperty('background-color', color, 'important')
            }
            const isVisible = flyout.isVisible()
            setFlyoutOpen(isVisible)
            if (isVisible) {
              const toolboxW = (div.querySelector('.blocklyToolbox') as HTMLElement | null)?.offsetWidth ?? 160
              const flyoutW = (flyout as unknown as { getWidth?: () => number }).getWidth?.() ?? 280
              // flyout 콘텐츠 우측 끝: 스크롤바(15px) + 버튼(20px) + 여백(6px) 제외
              setFlyoutBtnLeft(toolboxW + flyoutW - 15 - 20 - 6)
            }
          })
        }
      })
    }

    // 블록 수 업데이트
    const updateCount = () => {
      setBlockCount(workspace.getAllBlocks(false).length)
    }
    workspace.addChangeListener(updateCount)

    // 프로젝트 불러오기 (id가 'new'가 아닌 경우)
    if (id && id !== 'new') {
      getProject(id)
        .then((project) => {
          setProjectTitle(project.title)
          if (
            project.blocks_json &&
            Object.keys(project.blocks_json).length > 0
          ) {
            Blockly.serialization.workspaces.load(project.blocks_json, workspace)
          }
        })
        .catch(() => {})
    }

    return () => {
      workspace.removeChangeListener(updateCount)
      workspace.dispose()
      workspaceRef.current = null
    }
  // id는 마운트 시 한 번만 읽으면 되므로 의도적으로 제외
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 윈도우 리사이즈 시 Blockly 재조정
  useEffect(() => {
    const handleResize = () => {
      if (workspaceRef.current) {
        Blockly.svgResize(workspaceRef.current)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // isRunning이 true로 바뀐 후 useEffect에서 실행 → React가 렌더 완료 후 실행 보장
  const pendingRun = useRef(false)

  const handleRun = useCallback(() => {
    pendingRun.current = true
    setIsRunning(true)
  }, [])

  useEffect(() => {
    if (!isRunning || !pendingRun.current) return
    pendingRun.current = false

    if (!workspaceRef.current || !canvasRef.current) return
    const canvas = canvasRef.current

    if (runtimeRef.current) runtimeRef.current.stop()
    if (detachKeysRef.current) detachKeysRef.current()

    const initial = { ...defaultSpriteState(), bg: selectedBg }
    const runtime = new SpriteRuntime(canvas, initial, (state) => {
      setSpriteState({ ...state })
    })
    runtimeRef.current = runtime
    detachKeysRef.current = runtime.attachKeyListeners()
    setSpriteState(initial)

    const runStart = Date.now()
    runtime.run(workspaceRef.current).finally(() => {
      // 빈 워크스페이스에서도 "실행 중" 상태가 최소 150ms 이상 보이도록 보장
      const elapsed = Date.now() - runStart
      const delay = Math.max(0, 150 - elapsed)
      setTimeout(() => setIsRunning(false), delay)
    })
  // selectedBg는 실행 시 캡처되므로 의도적으로 제외
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning])

  const handleStop = useCallback(() => {
    runtimeRef.current?.stop()
    detachKeysRef.current?.()
    detachKeysRef.current = null
    setIsRunning(false)
  }, [])

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      runtimeRef.current?.stop()
      detachKeysRef.current?.()
    }
  }, [])

  const handleBgChange = useCallback((bg: Background) => {
    setSelectedBg(bg)
    setSpriteState((prev) => ({ ...prev, bg }))
    if (runtimeRef.current) {
      runtimeRef.current.state.bg = bg
      runtimeRef.current.render()
    }
  }, [])

  const handleSpriteChange = useCallback((spriteId: string) => {
    setSpriteState((prev) => ({ ...prev, spriteId }))
    if (runtimeRef.current) {
      runtimeRef.current.state.spriteId = spriteId
      runtimeRef.current.render()
    }
  }, [])

  const handleSave = useCallback(async () => {
    if (!workspaceRef.current) return
    const blocks_json = Blockly.serialization.workspaces.save(workspaceRef.current)
    try {
      if (!id || id === 'new') {
        const newProject = await createProject({ title: projectTitle || '새 프로젝트' })
        await updateProject(newProject.id, { blocks_json })
        showToast('저장됐어요! 💾', 'success')
        navigate(`/editor/${newProject.id}`)
      } else {
        await updateProject(id, { blocks_json, title: projectTitle || '새 프로젝트' })
        showToast('저장됐어요! 💾', 'success')
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        showToast('저장하려면 로그인이 필요해요 🔑', 'error')
        navigate('/login')
      } else {
        showToast('저장에 실패했어요 😢', 'error')
      }
    }
  }, [id, navigate, showToast, projectTitle])

  return (
    <div className={s.page}>
      {/* TOOLBAR */}
      <div className={s.toolbar}>
        <Link to="/" className={s.toolbarLogo}>
          <div className={s.tLogoIcon}>🧇</div>
          <span className={s.tLogoText}>Wa<em>Cratch</em></span>
        </Link>
        <div className={s.tDivider}/>
        <input
          className={s.tProjectName}
          value={projectTitle}
          onChange={e => setProjectTitle(e.target.value)}
          type="text"
          spellCheck={false}
        />
        <div className={s.tSpacer}/>
        <div className={s.runStop}>
          <button className={s.btnRun} onClick={handleRun}>▶ 실행하기</button>
          <button className={s.btnStop} onClick={handleStop}>⏹ 멈추기</button>
        </div>
        <div className={s.tDivider}/>
        <div className={s.tActions}>
          <button className={`${s.btnToolbar} ${s.btnSave}`} onClick={handleSave}>💾 저장</button>
        </div>
        <div className={s.tDivider}/>
        <Link to="/dashboard" className={s.tNavUser}>
          <span className={s.tNavUserName}>{user?.nickname ?? ''}</span>
          <div className={s.tNavUserAvatar}>{user?.avatar ?? '🐱'}</div>
        </Link>
      </div>

      {/* EDITOR BODY */}
      <div className={s.editorBody}>
        {/* BLOCKLY WORKSPACE — toolbox + workspace area */}
        <div className={s.workspace}>
          <div ref={workspaceDivRef} className={s.blocklyArea} />
          {flyoutOpen && (
            <button
              className={s.flyoutCloseBtn}
              style={{ left: flyoutBtnLeft }}
              title="블록 목록 닫기"
              onClick={() => {
                workspaceRef.current?.getFlyout()?.hide()
                setFlyoutOpen(false)
              }}
            >
              «
            </button>
          )}
        </div>

        {/* STAGE PANEL */}
        <StageCanvas
          state={{ ...spriteState, bg: selectedBg }}
          selectedBg={selectedBg}
          onBgChange={handleBgChange}
          onSpriteChange={handleSpriteChange}
          canvasRef={canvasRef}
        />
      </div>

      {/* STATUS BAR */}
      <div className={s.statusBar}>
        <span>
          <span className={s.statusDot}/>
          {isRunning ? '▶ 실행 중...' : '준비됨'}
        </span>
        <span>스프라이트: {SPRITE_LIBRARY[spriteState.spriteId]?.name ?? '와냥이'}</span>
        <span>블록: {blockCount}개</span>
        <span style={{ marginLeft: 'auto' }}>WaCratch v1.0 🐾</span>
      </div>

      <VoiceAgent workspaceRef={workspaceRef} projectTitle={projectTitle} />
      <Toast visible={toastVisible} message={toastMessage} type={toastType} />
    </div>
  )
}
