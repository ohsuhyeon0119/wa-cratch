import { useState } from 'react'
import { Link } from 'react-router-dom'
import s from './ExplorePage.module.css'

type Sort = 'latest' | 'views' | 'likes'

const PROJECTS = [
  { id: 1, emoji: '🐱', title: '냥이 점프', author: '코딩고양이', likes: 234, views: '1.2k', thumb: s.pt1 },
  { id: 2, emoji: '🌊', title: '바다 탐험', author: '바다소녀', likes: 189, views: '876', thumb: s.pt2 },
  { id: 3, emoji: '🌟', title: '별 수집하기', author: '별동이', likes: 312, views: '2.1k', thumb: s.pt3 },
  { id: 4, emoji: '🦋', title: '나비 미로', author: '초등코더', likes: 156, views: '654', thumb: s.pt4 },
  { id: 5, emoji: '🐰', title: '토끼 달리기', author: '토끼야', likes: 201, views: '920', thumb: s.pt5 },
  { id: 6, emoji: '🌈', title: '무지개 그림판', author: '색깔왕', likes: 278, views: '1.5k', thumb: s.pt6 },
  { id: 7, emoji: '🚀', title: '우주 여행', author: '우주선장', likes: 344, views: '2.8k', thumb: s.pt7 },
  { id: 8, emoji: '🎵', title: '음악 연주', author: '피아노맨', likes: 198, views: '730', thumb: s.pt8 },
  { id: 9, emoji: '🎪', title: '서커스 쇼', author: '마술사', likes: 167, views: '610', thumb: s.pt9 },
  { id: 10, emoji: '🌿', title: '정원 가꾸기', author: '초록이', likes: 145, views: '523', thumb: s.pt10 },
]

export default function ExplorePage() {
  const [sort, setSort] = useState<Sort>('latest')

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
            <input type="text" placeholder="작품 이름, 작가 이름으로 검색..."/>
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
          모든 작품 <span className={s.titleBadge}>{PROJECTS.length}개</span>
        </div>

        <div className={s.projectsGrid}>
          {PROJECTS.map(p => (
            <Link key={p.id} to={`/play/${p.id}`} className={s.projCard}>
              <div className={`${s.projThumb} ${p.thumb}`}>
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
