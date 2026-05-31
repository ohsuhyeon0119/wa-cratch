import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import s from './LoginPage.module.css'

type Tab = 'login' | 'signup'

function calcScore(val: string): number {
  let score = 0
  if (val.length >= 8) score++
  if (/[A-Z]/.test(val) || /[0-9]/.test(val)) score++
  if (/[^A-Za-z0-9]/.test(val)) score++
  return score
}

const PW_LABELS = ['약함', '약함', '보통', '강함']
const FILL_CLASSES = [s.fill1, s.fill1, s.fill2, s.fill3]

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>('login')
  const [pw, setPw] = useState('')
  const navigate = useNavigate()
  const score = calcScore(pw)

  return (
    <div className={s.page}>
      {/* LEFT PANEL */}
      <div className={s.left}>
        <span className={`${s.pawFloat} ${s.pf1}`}>🧇</span>
        <span className={`${s.pawFloat} ${s.pf2}`}>⭐</span>
        <span className={`${s.pawFloat} ${s.pf3}`}>✨</span>
        <span className={`${s.pawFloat} ${s.pf4}`}>🧇</span>
        <span className={`${s.pawFloat} ${s.pf5}`}>💫</span>
        <div className={s.leftInner}>
          <div className={s.mascotWrap}>
            <svg viewBox="-18 -18 306 378" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 240, height: 296 }}>
              <ellipse cx="130" cy="192" r="140" fill="rgba(255,255,255,.22)" opacity=".6"/>
              <path d="M198 258 Q248 228 244 186 Q240 152 222 163" stroke="#C88010" strokeWidth="26" fill="none" strokeLinecap="round"/>
              <path d="M198 258 Q248 228 244 186 Q240 152 222 163" stroke="#E8A818" strokeWidth="16" fill="none" strokeLinecap="round"/>
              <circle cx="222" cy="161" r="20" fill="rgba(255,255,255,.6)"/>
              <ellipse cx="22" cy="222" rx="22" ry="28" fill="#C88010" transform="rotate(-12 22 222)"/>
              <ellipse cx="22" cy="222" rx="16" ry="21" fill="#E8A818" transform="rotate(-12 22 222)"/>
              <circle cx="16" cy="246" r="14" fill="#C88010"/>
              <circle cx="16" cy="246" r="10" fill="#E8A818"/>
              <path d="M236 174 Q256 135 250 108 Q247 90 236 98" stroke="#C88010" strokeWidth="26" fill="none" strokeLinecap="round"/>
              <path d="M236 174 Q256 135 250 108 Q247 90 236 98" stroke="#E8A818" strokeWidth="16" fill="none" strokeLinecap="round"/>
              <circle cx="238" cy="98" r="18" fill="#C88010"/>
              <circle cx="238" cy="98" r="13" fill="#E8A818"/>
              <rect x="16" y="60" width="228" height="224" rx="68" fill="#E8A818"/>
              <line x1="16" y1="130" x2="244" y2="130" stroke="#A86C00" strokeWidth="12" strokeLinecap="round" opacity=".5"/>
              <line x1="16" y1="200" x2="244" y2="200" stroke="#A86C00" strokeWidth="12" strokeLinecap="round" opacity=".5"/>
              <line x1="88"  y1="60"  x2="88"  y2="284" stroke="#A86C00" strokeWidth="12" strokeLinecap="round" opacity=".5"/>
              <line x1="172" y1="60"  x2="172" y2="284" stroke="#A86C00" strokeWidth="12" strokeLinecap="round" opacity=".5"/>
              <rect x="26"  y="70"  width="53" height="51" rx="14" fill="rgba(255,255,255,.22)"/>
              <rect x="97"  y="70"  width="66" height="51" rx="14" fill="rgba(255,255,255,.22)"/>
              <rect x="181" y="70"  width="53" height="51" rx="14" fill="rgba(255,255,255,.22)"/>
              <rect x="26"  y="140" width="53" height="51" rx="14" fill="rgba(255,255,255,.16)"/>
              <rect x="97"  y="140" width="66" height="51" rx="14" fill="rgba(255,255,255,.16)"/>
              <rect x="181" y="140" width="53" height="51" rx="14" fill="rgba(255,255,255,.16)"/>
              <ellipse cx="130" cy="88" rx="72" ry="18" fill="rgba(255,255,255,.18)"/>
              <path d="M52,78 C36,52 30,16 64,8 C86,3 108,50 104,68 Z" fill="#C88010"/>
              <path d="M60,74 C48,54 44,30 64,20 C78,14 98,52 96,68 Z" fill="rgba(255,255,255,.35)" opacity=".9"/>
              <path d="M208,78 C224,52 230,16 196,8 C174,3 152,50 156,68 Z" fill="#C88010"/>
              <path d="M200,74 C212,54 216,30 196,20 C182,14 162,52 164,68 Z" fill="rgba(255,255,255,.35)" opacity=".9"/>
              <circle cx="90"  cy="156" r="11" fill="#1A0A00"/>
              <circle cx="90"  cy="156" r="8.5" fill="#2C1208"/>
              <circle cx="170" cy="156" r="11" fill="#1A0A00"/>
              <circle cx="170" cy="156" r="8.5" fill="#2C1208"/>
              <circle cx="130" cy="182" r="9" fill="#8B4A00"/>
              <path d="M117 194 Q124 202 130 194 Q136 202 143 194" stroke="#1A0A00" strokeWidth="2.8" fill="none" strokeLinecap="round"/>
              <line x1="104" y1="182" x2="58"  y2="173" stroke="#1A0A00" strokeWidth="1.8" strokeLinecap="round" opacity=".45"/>
              <line x1="104" y1="190" x2="56"  y2="190" stroke="#1A0A00" strokeWidth="1.8" strokeLinecap="round" opacity=".45"/>
              <line x1="156" y1="182" x2="202" y2="173" stroke="#1A0A00" strokeWidth="1.8" strokeLinecap="round" opacity=".45"/>
              <line x1="156" y1="190" x2="204" y2="190" stroke="#1A0A00" strokeWidth="1.8" strokeLinecap="round" opacity=".45"/>
              <ellipse cx="90"  cy="302" rx="40" ry="23" fill="#C88010"/>
              <ellipse cx="90"  cy="297" rx="34" ry="19" fill="#E8A818"/>
              <ellipse cx="170" cy="302" rx="40" ry="23" fill="#C88010"/>
              <ellipse cx="170" cy="297" rx="34" ry="19" fill="#E8A818"/>
            </svg>
          </div>
          <h2 className={s.leftTitle}>와피냥과 함께<br/>코딩해요! 🧇</h2>
          <p className={s.leftSub}>블록을 조립하면<br/>나만의 게임이 완성돼요!</p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className={s.right}>
        <div className={s.formCard}>
          <Link to="/" className={s.backLink}>← 홈으로 돌아가기</Link>

          <div className={s.tabs}>
            <button className={`${s.tab} ${tab === 'login' ? s.active : ''}`} onClick={() => setTab('login')}>
              🔑 로그인
            </button>
            <button className={`${s.tab} ${tab === 'signup' ? s.active : ''}`} onClick={() => setTab('signup')}>
              🐣 회원가입
            </button>
          </div>

          {tab === 'login' ? (
            <div>
              <h2 className={s.formTitle}>다시 만났어요! 😺</h2>
              <p className={s.formSub}>아이디와 비밀번호를 입력해 주세요.</p>
              <div className={s.field}>
                <label htmlFor="l-id">아이디</label>
                <div className={s.fieldWrap}>
                  <span className={s.fieldIcon}>🐾</span>
                  <input className={s.fieldInput} type="text" id="l-id" placeholder="아이디를 입력하세요"/>
                </div>
              </div>
              <div className={s.field}>
                <label htmlFor="l-pw">비밀번호</label>
                <div className={s.fieldWrap}>
                  <span className={s.fieldIcon}>🔒</span>
                  <input className={s.fieldInput} type="password" id="l-pw" placeholder="비밀번호를 입력하세요"/>
                </div>
              </div>
              <div className={s.rememberRow}>
                <div className={s.rememberLeft}>
                  <input type="checkbox" id="remember"/>
                  <label htmlFor="remember">로그인 상태 유지</label>
                </div>
                <a href="#" className={s.forgot}>비밀번호 찾기</a>
              </div>
              <button className={s.btnSubmit} onClick={() => navigate('/dashboard')}>로그인하기 →</button>
              <p className={s.switchHint}>
                아직 계정이 없나요? <a onClick={() => setTab('signup')}>회원가입하기</a>
              </p>
            </div>
          ) : (
            <div>
              <h2 className={s.formTitle}>와피냥 친구 되기! 🧇</h2>
              <p className={s.formSub}>정보를 입력하고 코딩 세계로 입장해요!</p>
              <div className={s.field}>
                <label htmlFor="s-nickname">닉네임</label>
                <div className={s.fieldWrap}>
                  <span className={s.fieldIcon}>🐾</span>
                  <input className={s.fieldInput} type="text" id="s-nickname" placeholder="사용할 닉네임 (예: 코딩냥이)"/>
                </div>
              </div>
              <div className={s.field}>
                <label htmlFor="s-id">아이디</label>
                <div className={s.fieldWrap}>
                  <span className={s.fieldIcon}>😺</span>
                  <input className={s.fieldInput} type="text" id="s-id" placeholder="영문, 숫자 조합 (4~16자)"/>
                </div>
              </div>
              <div className={s.field}>
                <label htmlFor="s-pw">비밀번호</label>
                <div className={s.fieldWrap}>
                  <span className={s.fieldIcon}>🔒</span>
                  <input
                    className={s.fieldInput}
                    type="password"
                    id="s-pw"
                    placeholder="8자 이상 입력해 주세요"
                    value={pw}
                    onChange={e => setPw(e.target.value)}
                  />
                </div>
                {pw.length > 0 && (
                  <div className={s.pwStrength}>
                    <div className={`${s.pwBar} ${score >= 1 ? FILL_CLASSES[score] : ''}`}/>
                    <div className={`${s.pwBar} ${score >= 2 ? FILL_CLASSES[score] : ''}`}/>
                    <div className={`${s.pwBar} ${score >= 3 ? FILL_CLASSES[score] : ''}`}/>
                    <span className={s.pwLabel}>{PW_LABELS[score]}</span>
                  </div>
                )}
              </div>
              <button className={`${s.btnSubmit} ${s.btnSubmitTeal}`} onClick={() => navigate('/dashboard')}>
                가입하기 🧇
              </button>
              <p className={s.switchHint}>
                이미 계정이 있나요? <a onClick={() => setTab('login')}>로그인하기</a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
