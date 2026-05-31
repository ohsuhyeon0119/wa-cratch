import { useState } from 'react'
import { Link } from 'react-router-dom'
import s from './ExplorePage.module.css'
import { MOCK_PROJECTS, type Project } from '../../mock/projects'

type Sort = 'latest' | 'views' | 'likes'

const THUMB_CLASSES = [s.pt1, s.pt2, s.pt3, s.pt4, s.pt5, s.pt6, s.pt7, s.pt8, s.pt9, s.pt10]

export default function ExplorePage() {
  const [sort, setSort] = useState<Sort>('latest')
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = MOCK_PROJECTS.filter((p: Project) =>
    p.title.includes(searchQuery) || p.author.includes(searchQuery)
  )

  const sorted = [...filtered].sort((a: Project, b: Project) => {
    if (sort === 'views') return b.views - a.views
    if (sort === 'likes') return b.likes - a.likes
    return b.id - a.id  // 'latest': id 내림차순
  })

  return (
    <>
      <nav className={s.nav}>
        <Link to="/" className={s.navLogo}>
          <div className={s.navLogoIcon}>🧇</div>
          <span className={s.navLogoText}>Wa<em>Cratch</em></span>
        </Link>
        <ul className={s.navLinks}>
          <li><Link to="/explore" className={s.active}>🔍 탐색하기</Link></li>
        </ul>
        <div className={s.navActions}>
          <Link to="/login" className={`${s.btn} ${s.btnGhost}`}>로그인</Link>
          <Link to="/editor/new" className={`${s.btn} ${s.btnPrimary}`}>+ 만들기</Link>
        </div>
      </nav>

      <div className={s.pageHeader}>
        <div className={`${s.hdShape} ${s.hdS1}`}>
          <svg width="150" height="150" viewBox="0 0 150 150" fill="none">
            <circle cx="75" cy="75" r="75" fill="#FF85A1" opacity=".65"/>
          </svg>
        </div>
        <div className={`${s.hdShape} ${s.hdS2}`}>
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <polygon points="28,3 34,20 52,20 38,31 43,49 28,38 13,49 18,31 4,20 22,20" fill="#FFD23F"/>
          </svg>
        </div>
        <div className={`${s.hdShape} ${s.hdS3}`}>
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <rect width="80" height="80" rx="16" fill="#FF6B35" opacity=".75"/>
            <line x1="0" y1="27" x2="80" y2="27" stroke="rgba(255,255,255,.45)" strokeWidth="3"/>
            <line x1="0" y1="53" x2="80" y2="53" stroke="rgba(255,255,255,.45)" strokeWidth="3"/>
            <line x1="27" y1="0" x2="27" y2="80" stroke="rgba(255,255,255,.45)" strokeWidth="3"/>
            <line x1="53" y1="0" x2="53" y2="80" stroke="rgba(255,255,255,.45)" strokeWidth="3"/>
          </svg>
        </div>
        <div className={`${s.hdShape} ${s.hdS4}`}>
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
            <rect width="52" height="52" rx="16" fill="#2EC4B6" opacity=".8"/>
          </svg>
        </div>
        <div className={`${s.hdShape} ${s.hdS5}`}>
          <svg width="52" height="68" viewBox="0 0 52 68" fill="none">
            <rect x="0" y="0" width="14" height="68" rx="7" fill="#A855F7" opacity=".75"/>
            <rect x="0" y="54" width="52" height="14" rx="7" fill="#A855F7" opacity=".75"/>
          </svg>
        </div>
        <div className={`${s.hdShape} ${s.hdS6}`}>
          <svg width="76" height="32" viewBox="0 0 76 32" fill="none">
            <rect width="76" height="32" rx="16" fill="#86EFAC" opacity=".8"/>
          </svg>
        </div>

        <div className={s.headerInner}>
          <div className={s.phBadge}>🔍 작품 탐색</div>
          <h1 className={s.phTitle}>작품을 <span className={s.cOrange}>구경</span>해봐요!</h1>
          <p className={s.phSub}>다른 친구들이 만든 멋진 프로젝트들이에요 🧇</p>
          <div className={s.phSearch}>
            <input
              type="text"
              placeholder="작품 이름, 작가 이름으로 검색..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button className={s.phSearchBtn}>검색 🔍</button>
          </div>
        </div>
      </div>

      <div className={s.main}>
        <div className={s.sortBar}>
          <span className={s.sortLabel}>정렬:</span>
          <button className={`${s.sortTab} ${sort === 'latest' ? s.active : ''}`} onClick={() => setSort('latest')}>🆕 최신순</button>
          <button className={`${s.sortTab} ${sort === 'views'  ? s.active : ''}`} onClick={() => setSort('views')}>👁️ 조회순</button>
          <button className={`${s.sortTab} ${sort === 'likes'  ? s.active : ''}`} onClick={() => setSort('likes')}>❤️ 좋아요순</button>
        </div>

        <div className={s.sectionTitle}>
          모든 작품 <span className={s.titleBadge}>{sorted.length}개</span>
        </div>

        <div className={s.projectsGrid}>
          {sorted.map((p: Project, index: number) => (
            <Link key={p.id} to={`/play/${p.id}`} className={s.projCard}>
              <div className={`${s.projThumb} ${THUMB_CLASSES[index % THUMB_CLASSES.length]}`}>
                {p.emoji}
                <div className={s.projHover}><div className={s.projPlayBtn}>▶</div></div>
              </div>
              <div className={s.projInfo}>
                <div className={s.projTitle}>{p.title}</div>
                <div className={s.projAuthor}>by {p.author}</div>
                <div className={s.projStats}>
                  <span className={s.projStat}>❤️ {p.likes}</span>
                  <span className={s.projStat}>👁️ {p.views}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
