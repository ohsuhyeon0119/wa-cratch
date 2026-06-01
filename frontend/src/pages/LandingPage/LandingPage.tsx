import { Link } from 'react-router-dom'
import s from './LandingPage.module.css'
import { useAuth } from '../../context/AuthContext'

export default function LandingPage() {
  const { user } = useAuth()
  return (
    <>
      {/* ── NAV ── */}
      <nav className={s.nav}>
        <Link to="/" className={s.navLogo}>
          <div className={s.navLogoIcon}>🧇</div>
          <span className={s.navLogoText}>Wa<em>Cratch</em></span>
        </Link>
        <ul className={s.navLinks}>
          <li><Link to="/explore">🔍 탐색하기</Link></li>
        </ul>
        <div className={s.navActions}>
          {user ? (
            <Link to="/dashboard" className={`${s.btn} ${s.btnPrimary}`}>{user.avatar} {user.nickname}</Link>
          ) : (
            <>
              <Link to="/login" className={`${s.btn} ${s.btnGhost}`}>로그인</Link>
              <Link to="/login" className={`${s.btn} ${s.btnPrimary}`}>가입하기 🧇</Link>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className={s.hero}>
        <div className={`${s.blob} ${s.blobA}`}></div>
        <div className={`${s.blob} ${s.blobB}`}></div>
        <div className={`${s.blob} ${s.blobC}`}></div>

        {/* 히어로 장식 도형들 */}
        <div className={s.shape} style={{right:'4%',top:'5%',animation:'fadeInShape .5s .3s ease-out both, float 6s .8s ease-in-out infinite'}}>
          <svg width="170" height="170" viewBox="0 0 170 170" fill="none">
            <circle cx="85" cy="85" r="85" fill="#FF85A1" opacity=".72"/>
          </svg>
        </div>
        <div className={s.shape} style={{right:'38%',top:'6%',animation:'fadeInShape .5s .42s ease-out both, float 4.2s .92s ease-in-out infinite'}}>
          <svg width="120" height="50" viewBox="0 0 120 50" fill="none">
            <rect width="120" height="50" rx="14" fill="#2EC4B6"/>
            <circle cx="24" cy="25" r="9" fill="rgba(255,255,255,.45)"/>
            <rect x="40" y="17" width="60" height="8" rx="4" fill="rgba(255,255,255,.55)"/>
            <rect x="40" y="30" width="40" height="7" rx="3.5" fill="rgba(255,255,255,.35)"/>
          </svg>
        </div>
        <div className={s.shape} style={{right:'52%',bottom:'14%',animation:'fadeInShape .5s .55s ease-out both, wobble 5s 1.05s ease-in-out infinite'}}>
          <svg width="90" height="90" viewBox="0 0 90 90" fill="none">
            <rect x="13" y="13" width="64" height="64" rx="10" fill="#A855F7" transform="rotate(45 45 45)"/>
          </svg>
        </div>
        <div className={s.shape} style={{right:'40%',bottom:'6%',animation:'fadeInShape .5s .48s ease-out both, float 5.5s .98s ease-in-out infinite'}}>
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <rect width="80" height="80" rx="16" fill="#FF6B35"/>
            <line x1="0" y1="27" x2="80" y2="27" stroke="rgba(255,255,255,.45)" strokeWidth="3.5"/>
            <line x1="0" y1="53" x2="80" y2="53" stroke="rgba(255,255,255,.45)" strokeWidth="3.5"/>
            <line x1="27" y1="0" x2="27" y2="80" stroke="rgba(255,255,255,.45)" strokeWidth="3.5"/>
            <line x1="53" y1="0" x2="53" y2="80" stroke="rgba(255,255,255,.45)" strokeWidth="3.5"/>
          </svg>
        </div>
        <div className={s.shape} style={{right:'28%',top:'14%',animation:'fadeInShape .5s .36s ease-out both, spin-slow 22s .86s linear infinite'}}>
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
            <polygon points="30,3 36,21 55,21 40,33 46,51 30,40 14,51 20,33 5,21 24,21" fill="#FFD23F"/>
          </svg>
        </div>
        <div className={s.shape} style={{left:'-2%',top:'4%',animation:'fadeInShape .6s .6s ease-out both, float 7s 1.2s ease-in-out infinite'}}>
          <svg width="140" height="120" viewBox="0 0 140 120" fill="none">
            <path d="M70 8 C105 2 138 22 132 60 C126 95 94 118 58 112 C22 106 2 82 8 48 C14 14 35 14 70 8Z" fill="#86EFAC" opacity=".8"/>
          </svg>
        </div>
        <div className={s.shape} style={{left:'3%',bottom:'8%',animation:'fadeInShape .5s .7s ease-out both, wobble 7s 1.2s ease-in-out infinite'}}>
          <svg width="52" height="68" viewBox="0 0 52 68" fill="none">
            <rect x="0" y="0" width="14" height="68" rx="7" fill="#2EC4B6" opacity=".85"/>
            <rect x="0" y="54" width="52" height="14" rx="7" fill="#2EC4B6" opacity=".85"/>
          </svg>
        </div>
        <div className={s.shape} style={{right:'22%',bottom:'26%',animation:'fadeInShape .4s .4s ease-out both, float 3.8s .8s ease-in-out infinite'}}>
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <rect width="56" height="56" rx="18" fill="#FF85A1" opacity=".8"/>
          </svg>
        </div>
        <div className={s.shape} style={{right:'1%',top:'62%',animation:'fadeInShape .5s .52s ease-out both, drift 5.5s 1.02s ease-in-out infinite'}}>
          <svg width="110" height="32" viewBox="0 0 110 32" fill="none">
            <rect width="110" height="32" rx="16" fill="#FF6B35" opacity=".75"/>
          </svg>
        </div>
        <div className={s.shape} style={{right:'34%',top:'52%',animation:'fadeInShape .4s .65s ease-out both, float 4.8s 1.05s ease-in-out infinite'}}>
          <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
            <circle cx="21" cy="21" r="21" fill="#A855F7" opacity=".65"/>
          </svg>
        </div>
        <div className={s.shape} style={{right:'14%',bottom:'12%',animation:'fadeInShape .5s .75s ease-out both, float 5.2s 1.25s ease-in-out infinite'}}>
          <svg width="90" height="38" viewBox="0 0 90 38" fill="none">
            <rect width="90" height="38" rx="10" fill="#FFD23F"/>
            <circle cx="19" cy="19" r="7" fill="rgba(44,24,16,.2)"/>
            <rect x="32" y="12" width="44" height="7" rx="3.5" fill="rgba(44,24,16,.15)"/>
            <rect x="32" y="23" width="30" height="6" rx="3" fill="rgba(44,24,16,.12)"/>
          </svg>
        </div>
        <div className={s.shape} style={{right:'18%',top:'8%',animation:'fadeInShape .4s .44s ease-out both, spin-rev 18s .84s linear infinite'}}>
          <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
            <circle cx="19" cy="19" r="19" fill="#2EC4B6" opacity=".7"/>
          </svg>
        </div>

        <div className={s.heroContent}>
          <div className={s.heroBadge}>🧇 무료 어린이 코딩 플랫폼</div>
          <h1 className={s.heroTitle}>
            <span className={`${s.underline} ${s.cOrange}`}>와냥이</span>와<br/>
            함께 <span className={s.cTeal}>코딩</span>을<br/>
            배워봐요!
          </h1>
          <p className={s.heroSub}>
            블록을 조립하면 와냥이가 움직여요! 🧇<br/>
            쉽고 재미있게 프로그래밍을 시작해 보세요.
          </p>
          <div className={s.heroCta}>
            <Link to={user ? '/editor/new' : '/login'} className={`${s.btn} ${s.btnPrimary}`}>지금 만들어보기 →</Link>
            <Link to="/explore" className={`${s.btn} ${s.btnTeal}`}>탐색하기 🔍</Link>
          </div>
        </div>

        {/* 와냥이 mascot */}
        <div className={s.heroMascot}>
          <svg viewBox="-18 -18 306 378" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:'380px',height:'470px'}}>
            <ellipse cx="130" cy="192" r="148" fill="#FFF3C8" opacity=".5"/>
            {/* TAIL */}
            <path d="M198 258 Q248 228 244 186 Q240 152 222 163" stroke="#E8A818" strokeWidth="26" fill="none" strokeLinecap="round"/>
            <path d="M198 258 Q248 228 244 186 Q240 152 222 163" stroke="#FFC947" strokeWidth="16" fill="none" strokeLinecap="round"/>
            <circle cx="222" cy="161" r="24" fill="#FFE090"/>
            <circle cx="222" cy="161" r="16" fill="#FFF8C0"/>
            <circle cx="222" cy="161" r="8"  fill="rgba(255,255,255,.7)"/>
            {/* LEFT ARM */}
            <ellipse cx="22" cy="222" rx="22" ry="28" fill="#E8A818" transform="rotate(-12 22 222)"/>
            <ellipse cx="22" cy="222" rx="16" ry="21" fill="#FFC947" transform="rotate(-12 22 222)"/>
            <circle cx="16" cy="246" r="14" fill="#E8A818"/>
            <circle cx="16" cy="246" r="10" fill="#FFC947"/>
            {/* RIGHT ARM raised waving */}
            <path d="M236 174 Q256 135 250 108 Q247 90 236 98" stroke="#E8A818" strokeWidth="26" fill="none" strokeLinecap="round"/>
            <path d="M236 174 Q256 135 250 108 Q247 90 236 98" stroke="#FFC947" strokeWidth="16" fill="none" strokeLinecap="round"/>
            <circle cx="238" cy="98" r="18" fill="#E8A818"/>
            <circle cx="238" cy="98" r="13" fill="#FFC947"/>
            {/* WAFFLE BODY */}
            <rect x="16" y="60" width="228" height="224" rx="68" fill="#FFC947"/>
            <line x1="16"  y1="130" x2="244" y2="130" stroke="#C88010" strokeWidth="12" strokeLinecap="round" opacity=".56"/>
            <line x1="16"  y1="200" x2="244" y2="200" stroke="#C88010" strokeWidth="12" strokeLinecap="round" opacity=".56"/>
            <line x1="88"  y1="60"  x2="88"  y2="284" stroke="#C88010" strokeWidth="12" strokeLinecap="round" opacity=".56"/>
            <line x1="172" y1="60"  x2="172" y2="284" stroke="#C88010" strokeWidth="12" strokeLinecap="round" opacity=".56"/>
            <rect x="26"  y="70"  width="53" height="51" rx="14" fill="rgba(255,255,255,.24)"/>
            <rect x="97"  y="70"  width="66" height="51" rx="14" fill="rgba(255,255,255,.24)"/>
            <rect x="181" y="70"  width="53" height="51" rx="14" fill="rgba(255,255,255,.24)"/>
            <rect x="26"  y="140" width="53" height="51" rx="14" fill="rgba(255,255,255,.18)"/>
            <rect x="97"  y="140" width="66" height="51" rx="14" fill="rgba(255,255,255,.18)"/>
            <rect x="181" y="140" width="53" height="51" rx="14" fill="rgba(255,255,255,.18)"/>
            <rect x="26"  y="210" width="53" height="44" rx="14" fill="rgba(255,255,255,.15)"/>
            <rect x="97"  y="210" width="66" height="44" rx="14" fill="rgba(255,255,255,.15)"/>
            <rect x="181" y="210" width="53" height="44" rx="14" fill="rgba(255,255,255,.15)"/>
            <ellipse cx="130" cy="88" rx="72" ry="18" fill="rgba(255,255,255,.18)"/>
            {/* EARS */}
            <path d="M52,78 C36,52 30,16 64,8 C86,3 108,50 104,68 Z" fill="#E8A818"/>
            <path d="M60,74 C48,54 44,30 64,20 C78,14 98,52 96,68 Z" fill="#FFCB8A" opacity=".9"/>
            <path d="M208,78 C224,52 230,16 196,8 C174,3 152,50 156,68 Z" fill="#E8A818"/>
            <path d="M200,74 C212,54 216,30 196,20 C182,14 162,52 164,68 Z" fill="#FFCB8A" opacity=".9"/>
            {/* EYES */}
            <circle cx="90"  cy="156" r="11" fill="#1A0A00"/>
            <circle cx="90"  cy="156" r="8.5" fill="#2C1208"/>
            <circle cx="170" cy="156" r="11" fill="#1A0A00"/>
            <circle cx="170" cy="156" r="8.5" fill="#2C1208"/>
            {/* NOSE */}
            <circle cx="130" cy="182" r="9"  fill="#D4882A"/>
            <circle cx="133" cy="179" r="3"  fill="white" opacity=".65"/>
            {/* MOUTH */}
            <path d="M117 194 Q124 202 130 194 Q136 202 143 194" stroke="#1A0A00" strokeWidth="2.8" fill="none" strokeLinecap="round"/>
            {/* WHISKERS */}
            <line x1="104" y1="182" x2="58"  y2="173" stroke="#1A0A00" strokeWidth="1.8" strokeLinecap="round" opacity=".52"/>
            <line x1="104" y1="190" x2="56"  y2="190" stroke="#1A0A00" strokeWidth="1.8" strokeLinecap="round" opacity=".52"/>
            <line x1="156" y1="182" x2="202" y2="173" stroke="#1A0A00" strokeWidth="1.8" strokeLinecap="round" opacity=".52"/>
            <line x1="156" y1="190" x2="204" y2="190" stroke="#1A0A00" strokeWidth="1.8" strokeLinecap="round" opacity=".52"/>
            {/* LEFT FOOT */}
            <ellipse cx="90"  cy="302" rx="40" ry="23" fill="#E8A818"/>
            <ellipse cx="90"  cy="297" rx="34" ry="19" fill="#FFC947"/>
            <circle cx="79"  cy="303" r="6.5" fill="#FFCB8A" opacity=".9"/>
            <circle cx="90"  cy="306" r="6.5" fill="#FFCB8A" opacity=".9"/>
            <circle cx="101" cy="303" r="6.5" fill="#FFCB8A" opacity=".9"/>
            {/* RIGHT FOOT */}
            <ellipse cx="170" cy="302" rx="40" ry="23" fill="#E8A818"/>
            <ellipse cx="170" cy="297" rx="34" ry="19" fill="#FFC947"/>
            <circle cx="159" cy="303" r="6.5" fill="#FFCB8A" opacity=".9"/>
            <circle cx="170" cy="306" r="6.5" fill="#FFCB8A" opacity=".9"/>
            <circle cx="181" cy="303" r="6.5" fill="#FFCB8A" opacity=".9"/>
          </svg>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className={`${s.section} ${s.howBg}`}>
        <div className={s.secHead}>
          <h2 className={s.secTitle}>어떻게 사용하나요? 🤔</h2>
          <p className={s.secSub}>세 단계만 따라하면 나만의 게임이 완성돼요!</p>
        </div>
        <div className={s.steps}>
          <div className={s.step}>
            <span className={s.stepBadge}>1단계</span>
            <span className={s.stepIcon}>🧩</span>
            <h3 className={s.stepTitle}>블록 고르기</h3>
            <p className={s.stepDesc}>색깔별 블록을 드래그해서 조립해요.<br/>퍼즐처럼 쉬워요!</p>
          </div>
          <div className={s.step}>
            <span className={s.stepBadge}>2단계</span>
            <span className={s.stepIcon}>▶️</span>
            <h3 className={s.stepTitle}>실행하기</h3>
            <p className={s.stepDesc}>초록 버튼을 누르면<br/>와냥이가 블록대로 움직여요!</p>
          </div>
          <div className={s.step}>
            <span className={s.stepBadge}>3단계</span>
            <span className={s.stepIcon}>🌍</span>
            <h3 className={s.stepTitle}>친구와 공유</h3>
            <p className={s.stepDesc}>완성된 작품을 링크로<br/>친구에게 공유해요!</p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={s.ctaBg}>
        <h2 className={s.ctaTitle}>와냥이와 시작해요! 🧇</h2>
        <p className={s.ctaSub}>무료로 가입하고, 와냥이와 첫 번째 작품을 만들어봐요!</p>
        <Link to="/login" className={s.btnWhite}>무료로 시작하기 🚀</Link>
      </section>

      {/* ── FOOTER ── */}
      <footer className={s.footer}>
        <div className={s.footerTop}>
          <div className={s.footerBrand}>
            <div className={s.logoRow}>
              <div className={s.logoIcon}>🧇</div>
              <span className={s.logoName}>Wa<em>Cratch</em></span>
            </div>
            <p className={s.footerTagline}>어린이를 위한 블록 코딩 플랫폼.<br/>와냥이와 함께 코딩의 세계로! 🧇</p>
          </div>
          <div className={s.footerCol}>
            <div className={s.footerColTitle}>서비스</div>
            <ul>
              <li><Link to="/explore">탐색하기</Link></li>
              <li><Link to="/login">만들기</Link></li>
            </ul>
          </div>
          <div className={s.footerCol}>
            <div className={s.footerColTitle}>계정</div>
            <ul>
              <li><Link to="/login">로그인</Link></li>
              <li><Link to="/login">회원가입</Link></li>
              <li><Link to="/dashboard">내 프로젝트</Link></li>
            </ul>
          </div>
        </div>
        <div className={s.footerBottom}>
          <span>© 2026 WaCratch. 어린이 코딩을 <span className={s.footerHeart}>♥</span>으로.</span>
          <span>🐾 Made with love in Seoul</span>
        </div>
      </footer>
    </>
  )
}
