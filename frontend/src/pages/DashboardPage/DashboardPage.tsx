import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import s from './DashboardPage.module.css'
import { getMyProjects, deleteProject, getLikedProjects } from '../../api/projects'
import type { Project } from '../../api/projects'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../hooks/useToast'
import Toast from '../../components/Toast/Toast'

const THUMB_CLASSES = [s.pt1, s.pt2, s.pt3, s.pt4, s.pt5, s.pt6]

type Tab = 'projects' | 'liked'

export default function DashboardPage() {
  const { toastVisible, toastMessage, toastType, showToast } = useToast()
  const { user, logout } = useAuth()

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('projects')
  const [searchQuery, setSearchQuery] = useState('')
  const [likedProjects, setLikedProjects] = useState<Project[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    getMyProjects()
      .then(setProjects)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (tab === 'liked') {
      getLikedProjects().then(setLikedProjects).catch(() => {})
    }
  }, [tab])

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id)
      setProjects(prev => prev.filter(p => p.id !== id))
      showToast('프로젝트를 삭제했어요 🗑️', 'info')
    } catch {
      showToast('삭제에 실패했어요 😢', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const nickname = user?.nickname ?? '...'
  const avatar = user?.avatar ?? '🐱'

  return (
    <div className={s.page}>
      {/* TOP NAV */}
      <div className={s.topnav}>
        <Link to="/" className={s.tnLogo}>
          <div className={s.tnLogoIcon}>🧇</div>
          <span className={s.tnLogoText}>Wa<em>Cratch</em></span>
        </Link>
        <div className={s.tnSpacer}/>
      </div>

      {/* BODY */}
      <div className={s.bodyLayout}>
        {/* SIDEBAR */}
        <div className={s.sidebar}>
          <div className={s.sbAvatarBlock}>
            <div className={s.sbAvatar}>{avatar}</div>
            <div className={s.sbUsername}>{nickname}</div>
          </div>
          <div className={s.sbSection}>
            <div className={s.sbSectionTitle}>나의 공간</div>
            <Link to="/dashboard" className={`${s.sbLink} ${tab === 'projects' ? s.active : ''}`} onClick={() => setTab('projects')}>🏠 내 프로젝트</Link>
            <Link to="/editor/new" className={s.sbLink}>✏️ 프로젝트 만들기</Link>
            <a href="#" className={`${s.sbLink} ${tab === 'liked' ? s.active : ''}`} onClick={(e) => { e.preventDefault(); setTab('liked') }}>❤️ 좋아요한 작품</a>
          </div>
          <div className={s.sbSection}>
            <div className={s.sbSectionTitle}>계정</div>
            <Link to="/" className={s.sbLink} onClick={() => { logout(); showToast('로그아웃 됐어요 👋', 'info') }}>🚪 로그아웃</Link>
          </div>
        </div>

        {/* CONTENT */}
        <div className={s.content}>
          {tab === 'projects' && (
            <>
              <div className={s.sectionHeader}>
                <h2 className={s.sectionTitle}>🎮 내 프로젝트</h2>
                <div className={s.sectionSearch}>
                  <input
                    type="text"
                    placeholder="내 프로젝트 검색..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className={s.projGrid}>
                {loading ? null : projects.filter(p =>
                  p.title.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((p, index) => (
                  <div key={p.id} className={s.projCard}>
                    <div className={`${s.projThumb} ${THUMB_CLASSES[index % 6]}`}>
                      {p.emoji}
                      {deletingId === p.id ? (
                        <div className={`${s.projHover} ${s.deleteConfirm}`}>
                          <span className={s.deleteConfirmText}>삭제할까요?</span>
                          <button className={`${s.phBtn} ${s.deleteYes}`} onClick={() => handleDelete(p.id)}>✓ 네</button>
                          <button className={`${s.phBtn} ${s.deleteNo}`} onClick={() => setDeletingId(null)}>✗ 아니요</button>
                        </div>
                      ) : (
                        <div className={s.projHover}>
                          <Link to={`/editor/${p.id}`} className={`${s.phBtn} ${s.edit}`}>✏️ 편집</Link>
                          <Link to={`/play/${p.id}`}   className={s.phBtn}>▶ 실행</Link>
                          <button className={`${s.phBtn} ${s.delete}`} onClick={() => setDeletingId(p.id)}>삭제</button>
                        </div>
                      )}
                    </div>
                    <div className={s.projInfo}>
                      <div className={s.projTitle}>{p.title}</div>
                      <div className={s.projMeta}>
                        <div className={s.projStats}>
                          <span className={s.projStat}>❤️ {p.likes}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'liked' && (
            <>
              <div className={s.sectionHeader}>
                <h2 className={s.sectionTitle}>❤️ 좋아요한 작품</h2>
              </div>
              <div className={s.projGrid}>
                {likedProjects.length === 0 ? (
                  <div style={{ color: 'var(--color-text-muted, #888)', padding: '2rem' }}>
                    아직 좋아요한 작품이 없어요 🐾
                  </div>
                ) : likedProjects.map((p, index) => (
                  <div key={p.id} className={s.projCard}>
                    <div className={`${s.projThumb} ${THUMB_CLASSES[index % 6]}`}>
                      {p.emoji}
                      <div className={s.projHover}>
                        <Link to={`/play/${p.id}`} className={s.phBtn}>▶ 실행</Link>
                      </div>
                    </div>
                    <div className={s.projInfo}>
                      <div className={s.projTitle}>{p.title}</div>
                      <div className={s.projMeta}>
                        <span className={s.projDate}>{p.author}</span>
                        <div className={s.projStats}>
                          <span className={s.projStat}>❤️ {p.likes}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      </div>

      <Toast visible={toastVisible} message={toastMessage} type={toastType} />
    </div>
  )
}
