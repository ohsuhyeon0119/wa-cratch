import { Link } from 'react-router-dom'
import s from './PlayPage.module.css'

export default function PlayPage() {
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
          <div className={s.navProjectTitle}>와피냥의 대모험</div>
          <div className={s.navAuthor}>by 코딩고양이</div>
        </div>
        <div className={s.navSpacer}/>
        <Link to="/login"      className={`${s.btn} ${s.btnGhost}`}   style={{ fontSize: 13 }}>로그인</Link>
        <Link to="/editor/new" className={`${s.btn} ${s.btnPrimary}`} style={{ fontSize: 13 }}>+ 만들기</Link>
      </nav>

      <div className={s.main}>
        {/* LEFT: Stage + Info */}
        <div>
          <div className={s.stageWrapper}>
            <div className={s.stageCanvas}>
              <div className={`${s.cloud} ${s.c1}`}/>
              <div className={`${s.cloud} ${s.c2}`}/>
              <div className={`${s.cloud} ${s.c3}`}/>
              <div className={s.ground}/>
              <div className={s.sprite}>🧇</div>
              <div className={s.speech}>안녕냥~ 🧇</div>
            </div>
            <div className={s.playOverlay}>
              <div className={s.playBtn}>▶</div>
            </div>
          </div>

          <div className={s.stageActions}>
            <button className={`${s.actionBtn} ${s.abLike}`}>❤️ 좋아요 <span className={s.abCount}>1,234</span></button>
            <button className={`${s.actionBtn} ${s.abShare}`}>🔗 공유</button>
            <Link to="/editor/1" className={`${s.actionBtn} ${s.abRemix}`}>🔁 리믹스</Link>
            <div className={s.actionSpacer}/>
            <button className={s.fullscreenBtn} title="전체화면">⛶</button>
          </div>

          <div className={s.infoCard}>
            <h1 className={s.infoTitle}>냥이의 대모험 🐾</h1>
            <div className={s.authorRow}>
              <div className={s.authorAvatar}>🐱</div>
              <div>
                <div className={s.authorName}>코딩고양이</div>
                <div className={s.authorSub}>2026년 5월 작성</div>
              </div>
            </div>
            <p className={s.infoDesc}>
              냥이와 함께 장애물을 피하며 골인 지점까지 달려가 보세요!<br/>
              방향키를 사용해서 냥이를 움직일 수 있어요.<br/>
              얼마나 멀리 갈 수 있는지 도전해봐요! 🌟
            </p>
            <div className={s.infoTags}>
              <span className={s.infoTag}>🎮 게임</span>
              <span className={s.infoTag}>🐱 냥이</span>
              <span className={s.infoTag}>🏃 달리기</span>
            </div>
            <div className={s.infoStats}>
              <div className={s.infoStat}><span className={s.infoStatN}>1,234</span><span className={s.infoStatL}>❤️ 좋아요</span></div>
              <div className={s.infoStat}><span className={s.infoStatN}>8,412</span><span className={s.infoStatL}>👁️ 조회</span></div>
              <div className={s.infoStat}><span className={s.infoStatN}>340</span><span className={s.infoStatL}>🔁 리믹스</span></div>
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

          <div className={s.creatorCard}>
            <div className={s.creatorRow}>
              <div className={s.creatorAvatar}>🐱</div>
              <div>
                <div className={s.creatorName}>코딩고양이</div>
                <div className={s.creatorSub}>작품 12개 · 팔로워 234명</div>
              </div>
            </div>
            <div className={s.creatorStats}>
              <div className={s.cs}><span className={s.csN}>12</span><span className={s.csL}>🎮 작품</span></div>
              <div className={s.cs}><span className={s.csN}>234</span><span className={s.csL}>👥 팔로워</span></div>
              <div className={s.cs}><span className={s.csN}>3.4k</span><span className={s.csL}>❤️ 좋아요</span></div>
            </div>
            <button className={s.followBtn}>+ 팔로우하기</button>
          </div>

          <div className={s.card}>
            <div className={s.cardTitle}>🎨 이 친구의 다른 작품</div>
            <div className={s.miniGrid}>
              <Link to="/play/2" className={s.miniCard}>
                <div className={`${s.miniThumb} ${s.mt1}`}>🌊</div>
                <div className={s.miniTitle}>바다 탐험</div>
              </Link>
              <Link to="/play/3" className={s.miniCard}>
                <div className={`${s.miniThumb} ${s.mt2}`}>🌟</div>
                <div className={s.miniTitle}>별 수집</div>
              </Link>
              <Link to="/play/4" className={s.miniCard}>
                <div className={`${s.miniThumb} ${s.mt3}`}>🦋</div>
                <div className={s.miniTitle}>나비 미로</div>
              </Link>
              <Link to="/play/5" className={s.miniCard}>
                <div className={`${s.miniThumb} ${s.mt4}`}>🎵</div>
                <div className={s.miniTitle}>음악 연주</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
