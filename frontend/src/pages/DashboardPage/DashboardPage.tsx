import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import s from './DashboardPage.module.css'
import { getMyProjects } from '../../api/projects'
import type { Project } from '../../api/projects'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../hooks/useToast'
import Toast from '../../components/Toast/Toast'
import { getFollowing, getLikedProjects, type FollowingUser } from '../../api/follows'

const THUMB_CLASSES = [s.pt1, s.pt2, s.pt3, s.pt4, s.pt5, s.pt6]

type Tab = 'projects' | 'liked' | 'following'

export default function DashboardPage() {
  const { toastVisible, toastMessage, toastType, showToast } = useToast()
  const { user, logout } = useAuth()

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('projects')
  const [likedProjects, setLikedProjects] = useState<Project[]>([])
  const [followingUsers, setFollowingUsers] = useState<FollowingUser[]>([])

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
    } else if (tab === 'following') {
      getFollowing().then(setFollowingUsers).catch(() => {})
    }
  }, [tab])

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
        <div className={s.tnSearch}><input type="text" placeholder="내 프로젝트 검색..."/></div>
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
            <Link to="/explore"   className={s.sbLink}>🔍 탐색하기</Link>
            <a href="#" className={`${s.sbLink} ${tab === 'liked' ? s.active : ''}`} onClick={(e) => { e.preventDefault(); setTab('liked') }}>❤️ 좋아요한 작품</a>
            <a href="#" className={`${s.sbLink} ${tab === 'following' ? s.active : ''}`} onClick={(e) => { e.preventDefault(); setTab('following') }}>👥 팔로잉</a>
          </div>
          <div className={s.sbSection}>
            <div className={s.sbSectionTitle}>계정</div>
            <Link to="/" className={s.sbLink} onClick={() => { logout(); showToast('로그아웃 됐어요 👋', 'info') }}>🚪 로그아웃</Link>
          </div>
          <Link to="/editor/new" className={s.sbNewBtn}>+ 새 프로젝트</Link>
        </div>

        {/* CONTENT */}
        <div className={s.content}>
          <div className={s.welcome}>
            <div>
              <div className={s.welcomeGreeting}>안녕, {nickname}! {avatar}</div>
              <div className={s.welcomeSub}>오늘도 멋진 작품을 만들어볼까요?</div>
            </div>
            <div className={s.welcomeMascot}>{avatar}</div>
          </div>

          {tab === 'projects' && (
            <>
              <div className={s.sectionHeader}>
                <h2 className={s.sectionTitle}>🎮 내 프로젝트</h2>
              </div>
              <div className={s.projGrid}>
                <Link to="/editor/new" className={s.projNew}>
                  <div className={s.pnIcon}>+</div>
                  <div className={s.pnText}>새 프로젝트 만들기</div>
                </Link>
                {loading ? null : projects.map((p, index) => (
                  <div key={p.id} className={s.projCard}>
                    <div className={`${s.projThumb} ${THUMB_CLASSES[index % 6]}`}>
                      {p.emoji}
                      <div className={s.projHover}>
                        <Link to={`/editor/${p.id}`} className={`${s.phBtn} ${s.edit}`}>✏️ 편집</Link>
                        <Link to={`/play/${p.id}`}   className={s.phBtn}>▶ 실행</Link>
                      </div>
                    </div>
                    <span className={`${s.statusBadge} ${p.published ? s.sbPublished : s.sbDraft}`}>
                      {p.published ? '공개' : '비공개'}
                    </span>
                    <div className={s.projInfo}>
                      <div className={s.projTitle}>{p.title}</div>
                      <div className={s.projMeta}>
                        <span className={s.projDate}>{p.views > 0 ? `${p.views} views` : '비공개'}</span>
                        <div className={s.projStats}>
                          <span className={s.projStat}>❤️ {p.likes}</span>
                          <span className={s.projStat}>👁️ {p.views}</span>
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

          {tab === 'following' && (
            <>
              <div className={s.sectionHeader}>
                <h2 className={s.sectionTitle}>👥 팔로잉</h2>
              </div>
              <div className={s.projGrid}>
                {followingUsers.length === 0 ? (
                  <div style={{ color: 'var(--color-text-muted, #888)', padding: '2rem' }}>
                    아직 팔로우한 유저가 없어요 🐱
                  </div>
                ) : followingUsers.map((u) => (
                  <div key={u.id} className={s.projCard}>
                    <div className={`${s.projThumb} ${THUMB_CLASSES[0]}`} style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {u.avatar}
                    </div>
                    <div className={s.projInfo}>
                      <div className={s.projTitle}>{u.nickname}</div>
                      <div className={s.projMeta}>
                        <span className={s.projDate}>작품 {u.projectCount}개</span>
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
