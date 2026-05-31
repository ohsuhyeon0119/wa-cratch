import { Link } from 'react-router-dom'
import s from './DashboardPage.module.css'
import { MY_PROJECTS } from '../../mock/projects'
import { MOCK_ACTIVITY } from '../../mock/activity'
import { useToast } from '../../hooks/useToast'
import Toast from '../../components/Toast/Toast'

const THUMB_CLASSES = [s.pt1, s.pt2, s.pt3, s.pt4, s.pt5, s.pt6]

const ACT_CLS: Record<string, string> = {
  like: s.actLike,
  view: s.actView,
  remix: s.actRemix,
}

export default function DashboardPage() {
  const { toastVisible, toastMessage, toastType, showToast } = useToast()

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
            <Link to="/" className={s.sbLink} onClick={() => showToast('로그아웃 됐어요 👋', 'info')}>🚪 로그아웃</Link>
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
            {MY_PROJECTS.map((p, index) => (
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

          <div className={s.sectionHeader}>
            <h2 className={s.sectionTitle}>🔔 최근 활동</h2>
          </div>
          <div className={s.activityList}>
            {MOCK_ACTIVITY.map((a, i) => (
              <div key={i} className={s.activityItem}>
                <div className={`${s.actIcon} ${ACT_CLS[a.type] ?? ''}`}>{a.icon}</div>
                <div>
                  <div className={s.actText}>{a.text}</div>
                  <div className={s.actTime}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Toast visible={toastVisible} message={toastMessage} type={toastType} />
    </div>
  )
}
