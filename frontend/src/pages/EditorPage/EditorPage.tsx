import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import * as Blockly from 'blockly'
import s from './EditorPage.module.css'
import { useToast } from '../../hooks/useToast'
import Toast from '../../components/Toast/Toast'
import StageCanvas from './StageCanvas'
import { useAuth } from '../../context/AuthContext'
import { registerBlocks, TOOLBOX_CONFIG, updateSpriteListForDropdown } from './blockDefs'
import {
  GameEngine,
  defaultSpriteEntity,
  migrateProjectData,
  renderStage,
  getSpriteImageExport,
  SPRITE_LIBRARY,
} from './spriteRuntime'
import type { SpriteEntity, Background } from './spriteRuntime'
import { getProject, createProject, updateProject } from '../../api/projects'
import axios from 'axios'
import TextAgent from '../../components/TextAgent/TextAgent'
import type { BlockAction } from '../../components/TextAgent/useTextAgent'

registerBlocks()

export default function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toastVisible, toastMessage, toastType, showToast } = useToast()
  const { user } = useAuth()

  const [entities, setEntities] = useState<SpriteEntity[]>(() => [defaultSpriteEntity()])
  const [activeEntityId, setActiveEntityId] = useState('sprite_1')
  const [selectedBg, setSelectedBg] = useState<Background>('sky')
  const [isRunning, setIsRunning] = useState(false)
  const [blockCount, setBlockCount] = useState(0)
  const [projectTitle, setProjectTitle] = useState('새 프로젝트')
  const [flyoutOpen, setFlyoutOpen] = useState(false)
  const [flyoutBtnLeft, setFlyoutBtnLeft] = useState(164)
  const [pendingBlockAction, setPendingBlockAction] = useState<BlockAction | null>(null)

  const workspaceDivRef = useRef<HTMLDivElement>(null)
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const engineRef = useRef<GameEngine | null>(null)
  const entitiesRef = useRef<SpriteEntity[]>(entities)
  const activeEntityIdRef = useRef<string>(activeEntityId)
  const selectedBgRef = useRef<Background>('sky')

  // refs를 state와 동기화
  useEffect(() => { entitiesRef.current = entities }, [entities])
  useEffect(() => { activeEntityIdRef.current = activeEntityId }, [activeEntityId])
  useEffect(() => { selectedBgRef.current = selectedBg }, [selectedBg])

  // 엔티티 변경 시 드롭다운 스프라이트 목록 갱신
  useEffect(() => {
    updateSpriteListForDropdown(entities.map((e) => ({ id: e.id, name: e.name })))
  }, [entities])

  // 미리보기 렌더링 헬퍼
  const previewRender = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const current = entitiesRef.current
    const ids = [...new Set(current.map((e) => e.state.spriteId))]
    Promise.all(ids.map((id) => getSpriteImageExport(id).then((img) => [id, img] as const)))
      .then((pairs) => {
        renderStage(canvas, current, new Map(pairs), selectedBgRef.current)
      })
  }, [])

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
            const { bg, sprites } = migrateProjectData(project.blocks_json)
            setSelectedBg(bg)
            setEntities(sprites)
            setActiveEntityId(sprites[0]?.id ?? 'sprite_1')
            // 첫 스프라이트의 워크스페이스 데이터 로드
            if (sprites[0] && Object.keys(sprites[0].workspaceData).length > 0) {
              Blockly.serialization.workspaces.load(sprites[0].workspaceData, workspace)
            }
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

  // 엔티티 / 배경 변경 시 미리보기 렌더링 (실행 중이 아닐 때만)
  useEffect(() => {
    if (!isRunning) previewRender()
  }, [entities, selectedBg, isRunning, previewRender])

  // 활성 엔티티 전환
  const switchEntity = useCallback((newId: string) => {
    if (newId === activeEntityIdRef.current) return
    // 현재 엔티티의 워크스페이스 데이터 저장
    const currentEntity = entitiesRef.current.find((e) => e.id === activeEntityIdRef.current)
    if (currentEntity && workspaceRef.current) {
      currentEntity.workspaceData = Blockly.serialization.workspaces.save(workspaceRef.current)
    }
    // 새 엔티티의 워크스페이스 데이터 로드
    const newEntity = entitiesRef.current.find((e) => e.id === newId)
    if (newEntity && workspaceRef.current) {
      Blockly.serialization.workspaces.load(newEntity.workspaceData, workspaceRef.current)
    }
    setActiveEntityId(newId)
  }, [])

  // 스프라이트 추가
  const handleAddSprite = useCallback((spriteId: string) => {
    // 현재 워크스페이스 저장
    const currentEntity = entitiesRef.current.find((e) => e.id === activeEntityIdRef.current)
    if (currentEntity && workspaceRef.current) {
      currentEntity.workspaceData = Blockly.serialization.workspaces.save(workspaceRef.current)
    }
    // 새 엔티티 생성
    const entry = SPRITE_LIBRARY[spriteId]
    const sameCount = entitiesRef.current.filter((e) => e.state.spriteId === spriteId).length
    const name = sameCount > 0 ? `${entry.name} ${sameCount + 1}` : entry.name
    const newId = `sprite_${Date.now()}`
    const newEntity = defaultSpriteEntity(newId, name, spriteId)
    newEntity.state.bg = selectedBgRef.current
    const newEntities = [...entitiesRef.current, newEntity]
    setEntities(newEntities)
    setActiveEntityId(newId)
    // 새 스프라이트용 빈 워크스페이스
    if (workspaceRef.current) workspaceRef.current.clear()
  }, [])

  // 스프라이트 삭제
  const handleDeleteEntity = useCallback((id: string) => {
    const current = entitiesRef.current
    if (current.length <= 1) return
    const newEntities = current.filter((e) => e.id !== id)
    // 활성 엔티티 삭제 시 첫 번째 남은 엔티티로 전환
    if (id === activeEntityIdRef.current && workspaceRef.current) {
      const fallback = newEntities[0]
      Blockly.serialization.workspaces.load(fallback.workspaceData, workspaceRef.current)
      setActiveEntityId(fallback.id)
    }
    setEntities(newEntities)
  }, [])

  // 스프라이트 이름 변경
  const handleRenameEntity = useCallback((id: string, name: string) => {
    setEntities((prev) => prev.map((e) => (e.id === id ? { ...e, name } : e)))
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

    const canvas = canvasRef.current
    const workspace = workspaceRef.current
    if (!canvas || !workspace) return

    // 활성 엔티티의 워크스페이스 데이터 저장
    const activeEntity = entitiesRef.current.find((e) => e.id === activeEntityIdRef.current)
    if (activeEntity) {
      activeEntity.workspaceData = Blockly.serialization.workspaces.save(workspace)
    }

    if (engineRef.current) engineRef.current.stop()

    // 모든 엔티티에 대한 헤드리스 워크스페이스 생성
    const workspaceMap = new Map<string, Blockly.WorkspaceSvg>()
    for (const entity of entitiesRef.current) {
      const ws = new Blockly.Workspace() as unknown as Blockly.WorkspaceSvg
      if (Object.keys(entity.workspaceData).length > 0) {
        Blockly.serialization.workspaces.load(entity.workspaceData, ws)
      }
      workspaceMap.set(entity.id, ws)
    }

    const engine = new GameEngine(canvas, [...entitiesRef.current], () => {
      // 실행 중 엔티티 변경(복제 등) — EditorPage state로 동기화하지 않음
      // GameEngine이 런타임 동안 자체 entities 배열을 관리
    })
    engineRef.current = engine

    const runStart = Date.now()
    engine.run(workspaceMap).finally(() => {
      const elapsed = Date.now() - runStart
      const delay = Math.max(0, 150 - elapsed)
      setTimeout(() => setIsRunning(false), delay)
      // 실행 후 미리보기 재렌더링
      previewRender()
    })
  // selectedBg는 실행 시 캡처되므로 의도적으로 제외
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning])

  const handleStop = useCallback(() => {
    engineRef.current?.stop()
    setIsRunning(false)
    previewRender()
  }, [previewRender])

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      engineRef.current?.stop()
    }
  }, [])

  const handleBgChange = useCallback((bg: Background) => {
    setSelectedBg(bg)
    setEntities((prev) => prev.map((e) => ({ ...e, state: { ...e.state, bg } })))
  }, [])

  const handleSave = useCallback(async () => {
    // 저장 전 활성 엔티티의 워크스페이스 저장
    const activeEntity = entitiesRef.current.find((e) => e.id === activeEntityIdRef.current)
    if (activeEntity && workspaceRef.current) {
      activeEntity.workspaceData = Blockly.serialization.workspaces.save(workspaceRef.current)
    }
    const blocks_json = {
      bg: selectedBgRef.current,
      sprites: entitiesRef.current,
    }
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

  // 5초마다 자동 저장 (기존 프로젝트만, /editor/new 제외)
  useEffect(() => {
    if (!id || id === 'new') return
    const timer = setInterval(async () => {
      const activeEntity = entitiesRef.current.find((e) => e.id === activeEntityIdRef.current)
      if (activeEntity && workspaceRef.current) {
        activeEntity.workspaceData = Blockly.serialization.workspaces.save(workspaceRef.current)
      }
      try {
        const blocks_json = {
          bg: selectedBgRef.current,
          sprites: entitiesRef.current,
        }
        await updateProject(id, { blocks_json, title: projectTitle || '새 프로젝트' })
      } catch {
        // 자동 저장 실패는 조용히 무시
      }
    }, 5000)
    return () => clearInterval(timer)
  }, [id, projectTitle])

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
          {/* AI 블록 적용 대기 중 블러 오버레이 */}
          {pendingBlockAction && <div className={s.workspaceOverlay} />}
        </div>

        {/* STAGE PANEL */}
        <StageCanvas
          entities={entities}
          activeEntityId={activeEntityId}
          selectedBg={selectedBg}
          canvasRef={canvasRef}
          onSelectEntity={switchEntity}
          onAddSprite={handleAddSprite}
          onDeleteEntity={handleDeleteEntity}
          onRenameEntity={handleRenameEntity}
          onBgChange={handleBgChange}
        />
      </div>

      {/* STATUS BAR */}
      <div className={s.statusBar}>
        <span>
          <span className={s.statusDot}/>
          {isRunning ? '▶ 실행 중...' : '준비됨'}
        </span>
        <span>스프라이트: {entities.length}개</span>
        <span>블록: {blockCount}개</span>
        <span style={{ marginLeft: 'auto' }}>WaCratch v1.0 🐾</span>
      </div>

      <TextAgent
        workspaceRef={workspaceRef}
        projectTitle={projectTitle}
        projectId={id ?? '__new__'}
        onPendingActionChange={setPendingBlockAction}
      />
      <Toast visible={toastVisible} message={toastMessage} type={toastType} />
    </div>
  )
}
