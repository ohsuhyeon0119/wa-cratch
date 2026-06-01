import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as Blockly from 'blockly'
import s from './PlayPage.module.css'
import { useToast } from '../../hooks/useToast'
import Toast from '../../components/Toast/Toast'
import ShareModal from '../../components/ShareModal/ShareModal'
import { getProject, getProjects, type Project } from '../../api/projects'
import { useAuth } from '../../context/AuthContext'
import { SpriteRuntime, defaultSpriteState, renderStage, getSpriteImageExport } from '../EditorPage/spriteRuntime'
import { registerBlocks } from '../EditorPage/blockDefs'

registerBlocks()

export default function PlayPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { toastVisible, toastMessage, toastType } = useToast()

  const [project, setProject] = useState<Project | null>(null)
  const [authorProjects, setAuthorProjects] = useState<Project[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [shareOpen, setShareOpen] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const workspaceDivRef = useRef<HTMLDivElement>(null)
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null)
  const runtimeRef = useRef<SpriteRuntime | null>(null)
  const detachKeysRef = useRef<(() => void) | null>(null)

  // 초기 캔버스 렌더
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    getSpriteImageExport().then(img => {
      renderStage(canvas, defaultSpriteState(), img)
    })
  }, [])

  // 프로젝트 로드 + Blockly 워크스페이스 생성
  useEffect(() => {
    if (!id) return
    getProject(id).then((data) => {
      setProject(data)
      setLikeCount(data.likes)

      // 같은 작성자 다른 공개 프로젝트
      getProjects().then((all) => {
        setAuthorProjects(all.filter(p => p.authorId === data.authorId && p.id !== data.id))
      }).catch(() => {})

      // 숨김 Blockly 워크스페이스에 blocks_json 로드
      const div = workspaceDivRef.current
      if (!div) return
      const ws = Blockly.inject(div, { readOnly: true })
      workspaceRef.current = ws
      if (data.blocks_json && Object.keys(data.blocks_json).length > 0) {
        Blockly.serialization.workspaces.load(data.blocks_json, ws)
      }
    }).catch(() => {})

    return () => {
      workspaceRef.current?.dispose()
      workspaceRef.current = null
    }
  }, [id])

  const handlePlay = useCallback(() => {
    const canvas = canvasRef.current
    const ws = workspaceRef.current
    if (!canvas || !ws) return

    runtimeRef.current?.stop()
    detachKeysRef.current?.()

    const initial = defaultSpriteState()
    const runtime = new SpriteRuntime(canvas, initial)
    runtimeRef.current = runtime
    detachKeysRef.current = runtime.attachKeyListeners()
    setIsRunning(true)

    runtime.run(ws).finally(() => {
      setIsRunning(false)
    })
  }, [])

  const handleStop = useCallback(() => {
    runtimeRef.current?.stop()
    detachKeysRef.current?.()
    detachKeysRef.current = null
    setIsRunning(false)
    // 초기 상태로 재렌더
    const canvas = canvasRef.current
    if (canvas) {
      getSpriteImageExport().then(img => renderStage(canvas, defaultSpriteState(), img))
    }
  }, [])

  useEffect(() => {
    return () => {
      runtimeRef.current?.stop()
      detachKeysRef.current?.()
    }
  }, [])

  return (
    <>
      <nav className={s.nav}>
        <Link to="/explore" className={s.navBack}>← 탐색으로</Link>
        <div className={s.navDiv}/>
        <Link to="/" className={s.navLogo}>
          <div className={s.navLogoIcon}>🧇</div>
          <span className={s.navLogoText}>Wa<em>Cratch</em></span>
        </Link>
        <div className={s.navDiv}/>
        <div>
          <div className={s.navProjectTitle}>{project?.title || ''}</div>
          <div className={s.navAuthor}>by {project?.author || ''}</div>
        </div>
        <div className={s.navSpacer}/>
        {user ? (
          <Link to="/dashboard" className={`${s.btn} ${s.btnGhost}`} style={{ fontSize: 13 }}>{user.avatar} {user.nickname}</Link>
        ) : (
          <Link to="/login" className={`${s.btn} ${s.btnGhost}`} style={{ fontSize: 13 }}>로그인</Link>
        )}
        <Link to={user ? '/editor/new' : '/login'} className={`${s.btn} ${s.btnPrimary}`} style={{ fontSize: 13 }}>+ 만들기</Link>
      </nav>

      {/* 숨김 Blockly 워크스페이스 */}
      <div ref={workspaceDivRef} style={{ position: 'fixed', left: -9999, top: -9999, width: 1, height: 1, overflow: 'hidden', pointerEvents: 'none' }} />

      <div className={s.main}>
        {/* LEFT: Stage + Info */}
        <div>
          <div className={s.stageWrapper}>
            <canvas
              ref={canvasRef}
              width={480}
              height={360}
              style={{ display: 'block', width: '100%', height: 'auto' }}
            />
            {!isRunning && (
              <div className={s.playOverlay} onClick={handlePlay}>
                <div className={s.playBtn}>▶</div>
              </div>
            )}
            {isRunning && (
              <button
                onClick={handleStop}
                style={{
                  position: 'absolute', top: 10, right: 10,
                  background: 'rgba(255,255,255,0.9)', border: 'none',
                  borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
                  fontWeight: 800, fontSize: 13,
                }}
              >
                ⏹ 멈추기
              </button>
            )}
          </div>

          <div className={s.stageActions}>
            <button
              className={`${s.actionBtn} ${s.abLike} ${isLiked ? s.liked : ''}`}
              onClick={() => {
                setIsLiked(prev => !prev)
                setLikeCount(prev => isLiked ? prev - 1 : prev + 1)
              }}
            >
              {isLiked ? '❤️' : '🤍'} 좋아요 <span className={s.abCount}>{likeCount.toLocaleString()}</span>
            </button>
            <button className={`${s.actionBtn} ${s.abShare}`} onClick={() => setShareOpen(true)}>🔗 공유</button>
            <div className={s.actionSpacer}/>
            <button className={s.fullscreenBtn} title="전체화면">⛶</button>
          </div>

          <div className={s.infoCard}>
            <h1 className={s.infoTitle}>{project?.title || ''} {project?.emoji || ''}</h1>
            <div className={s.authorRow}>
              <div className={s.authorAvatar}>{project?.emoji || '🐱'}</div>
              <div>
                <div className={s.authorName}>{project?.author || ''}</div>
                <div className={s.authorSub}>2026년 5월 작성</div>
              </div>
            </div>
            <p className={s.infoDesc}>{project?.description || ''}</p>
            <div className={s.infoTags}>
              {project?.tags.map((tag, idx) => (
                <span key={idx} className={s.infoTag}>{tag}</span>
              ))}
            </div>
            <div className={s.infoStats}>
              <div className={s.infoStat}><span className={s.infoStatN}>{(project?.likes || 0).toLocaleString()}</span><span className={s.infoStatL}>❤️ 좋아요</span></div>
              <div className={s.infoStat}><span className={s.infoStatN}>{(project?.views || 0).toLocaleString()}</span><span className={s.infoStatL}>👁️ 조회</span></div>
            </div>
          </div>
        </div>

        {/* RIGHT: Side panel */}
        <div>
          <div className={s.card}>
            <div className={s.cardTitle}>📋 조작 방법</div>
            <div className={s.cardBody}>
              <span className={s.keyChip}>↑</span> 위로 이동<br/>
              <span className={s.keyChip}>↓</span> 아래로 이동<br/>
              <span className={s.keyChip}>←</span><span className={s.keyChip}>→</span> 좌우 이동<br/>
              <span className={s.keyChip}>Space</span> 점프!
            </div>
          </div>

          {project && (
            <div className={s.creatorCard}>
              <div className={s.creatorRow}>
                <div className={s.creatorAvatar}>{project.emoji}</div>
                <div>
                  <div className={s.creatorName}>{project.author}</div>
                  <div className={s.creatorSub}>작품 {authorProjects.length + 1}개</div>
                </div>
              </div>
              <div className={s.creatorStats}>
                <div className={s.cs}><span className={s.csN}>{authorProjects.length + 1}</span><span className={s.csL}>🎮 작품</span></div>
                <div className={s.cs}><span className={s.csN}>{(project.likes + authorProjects.reduce((acc, p) => acc + p.likes, 0)).toLocaleString()}</span><span className={s.csL}>❤️ 좋아요</span></div>
              </div>
            </div>
          )}

          {authorProjects.length > 0 && (
            <div className={s.card}>
              <div className={s.cardTitle}>🎨 이 친구의 다른 작품</div>
              <div className={s.miniGrid}>
                {authorProjects.slice(0, 4).map((p, i) => (
                  <Link key={p.id} to={`/play/${p.id}`} className={s.miniCard}>
                    <div className={`${s.miniThumb} ${[s.mt1, s.mt2, s.mt3, s.mt4][i % 4]}`}>{p.emoji}</div>
                    <div className={s.miniTitle}>{p.title}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Toast visible={toastVisible} message={toastMessage} type={toastType} />
      <ShareModal
        isOpen={shareOpen}
        projectId={project?.id || ''}
        projectTitle={project?.title || ''}
        onClose={() => setShareOpen(false)}
      />
    </>
  )
}
