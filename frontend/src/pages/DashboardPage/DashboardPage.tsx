import { Link } from 'react-router-dom'
import s from './DashboardPage.module.css'

const PROJECTS = [
  { id: 1, emoji: '🐱', title: '냥이의 대모험', date: '2일 전 수정', likes: 234, views: '1.2k', thumb: s.pt1, published: true },
  { id: 2, emoji: '🌊', title: '바다 탐험', date: '5일 전', likes: 89, views: '430', thumb: s.pt2, published: true },
  { id: 3, emoji: '🌟', title: '별 수집 게임 (작업중)', date: '어제', likes: 0, views: '0', thumb: s.pt3, published: false },
  { id: 4, emoji: '🦋', title: '나비 미로', date: '1주일 전', likes: 56, views: '234', thumb: s.pt4, published: true },
  { id: 5, emoji: '🐰', title: '토끼 달리기', date: '2주일 전', likes: 45, views: '189', thumb: s.pt5, published: true },
  { id: 6, emoji: '🌈', title: '무지개 그림판', date: '3주일 전', likes: 0, views: '0', thumb: s.pt6, published: false },
]

const ACTIVITY = [
  { type: 'like',  icon: '❤️', cls: s.actLike,  text: <><strong>별동이</strong>님이 &quot;냥이의 대모험&quot;을 좋아해요!</>, time: '10분 전' },
  { type: 'view',  icon: '👁️', cls: s.actView,  text: <><strong>바다소녀</strong>님이 &quot;바다 탐험&quot;을 봤어요</>, time: '1시간 전' },
  { type: 'remix', icon: '🔁', cls: s.actRemix, text: <><strong>초등코더</strong>님이 &quot;냥이의 대모험&quot;을 리믹스했어요!</>, time: '3시간 전' },
  { type: 'like',  icon: '❤️', cls: s.actLike,  text: <><strong>우주선장</strong>님이 &quot;나비 미로&quot;를 좋아해요!</>, time: '어제' },
]

export default function DashboardPage() {
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
        <span className={s.tnName}>코딩냥이</span>
        <div className={s.tnAvatar}>🧇</div>
      </div>

      {/* BODY */}
      <div className={s.bodyLayout}>
        {/* SIDEBAR */}
        <div className={s.sidebar}>
          <div className={s.sbAvatarBlock}>
            <div className={s.sbAvatar}>🧇</div>
            <div className={s.sbUsername}>코딩냥이</div>
          </div>
          <div className={s.sbSection}>
            <div className={s.sbSectionTitle}>나의 공간</div>
            <Link to="/dashboard" className={`${s.sbLink} ${s.active}`}>🏠 내 프로젝트</Link>
            <Link to="/explore"   className={s.sbLink}>🔍 탐색하기</Link>
            <a href="#"           className={s.sbLink}>❤️ 좋아요한 작품</a>
            <a href="#"           className={s.sbLink}>👥 팔로잉</a>
          </div>
          <div className={s.sbSection}>
            <div className={s.sbSectionTitle}>계정</div>
            <Link to="/" className={s.sbLink}>🚪 로그아웃</Link>
          </div>
          <Link to="/editor/new" className={s.sbNewBtn}>+ 새 프로젝트</Link>
        </div>

        {/* CONTENT */}
        <div className={s.content}>
          <div className={s.welcome}>
            <div>
              <div className={s.welcomeGreeting}>안녕, 코딩냥이! 🧇</div>
              <div className={s.welcomeSub}>오늘도 멋진 작품을 만들어볼까요?</div>
            </div>
            <div className={s.welcomeMascot}>🧇</div>
          </div>

          <div className={s.sectionHeader}>
            <h2 className={s.sectionTitle}>🎮 내 프로젝트</h2>
            <a href="#" className={s.seeAll}>전체 보기 →</a>
          </div>

          <div className={s.projGrid}>
            <Link to="/editor/new" className={s.projNew}>
              <div className={s.pnIcon}>+</div>
              <div className={s.pnText}>새 프로젝트 만들기</div>
            </Link>
            {PROJECTS.map(p => (
              <div key={p.id} className={s.projCard}>
                <div className={`${s.projThumb} ${p.thumb}`}>
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
                    <span className={s.projDate}>{p.date}</span>
                    <div className={s.projStats}>
                      <span className={s.projStat}>❤️ {p.likes}</span>
                      <span className={s.projStat}>👁️ {p.views}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={s.sectionHeader}>
            <h2 className={s.sectionTitle}>🔔 최근 활동</h2>
          </div>
          <div className={s.activityList}>
            {ACTIVITY.map((a, i) => (
              <div key={i} className={s.activityItem}>
                <div className={`${s.actIcon} ${a.cls}`}>{a.icon}</div>
                <div>
                  <div className={s.actText}>{a.text}</div>
                  <div className={s.actTime}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
