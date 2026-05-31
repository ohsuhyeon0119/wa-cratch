import { useEffect, useState } from 'react'
import s from './ShareModal.module.css'

type Props = {
  isOpen: boolean
  projectId: string | number
  projectTitle: string
  onClose: () => void
}

export default function ShareModal({
  isOpen,
  projectId,
  projectTitle,
  onClose
}: Props) {
  const [copied, setCopied] = useState(false)

  const shareUrl = `${window.location.origin}/play/${projectId}`

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  // Handle copy button
  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 1500)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Handle overlay click
  const handleOverlayClick = () => {
    onClose()
  }

  // Prevent event propagation on modal click
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className={s.overlay} onClick={handleOverlayClick}>
      <div className={s.shareModal} onClick={handleModalClick}>
        <button className={s.closeBtn} onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        <h2 className={s.title}>'{projectTitle}' 공유하기</h2>

        <div className={s.urlContainer}>
          <div className={s.shareUrl}>{shareUrl}</div>
        </div>

        <button
          className={s.copyBtn}
          onClick={handleCopyClick}
          disabled={copied}
        >
          {copied ? '✅ 복사됨!' : '링크 복사'}
        </button>
      </div>
    </div>
  )
}
