import { Link } from 'react-router-dom'
import s from './NotFoundPage.module.css'

export default function NotFoundPage() {
  return (
    <div className={s.container}>
      <div className={s.code}>404</div>
      <p className={s.message}>앗! 페이지를 찾을 수 없어요 😿</p>
      <Link to="/" className={s.homeLink}>홈으로 돌아가기 →</Link>
    </div>
  )
}
