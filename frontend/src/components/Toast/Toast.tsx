import { useEffect, useState } from 'react'
import type { ToastType } from '../../hooks/useToast'
import s from './Toast.module.css'

interface ToastProps {
  visible: boolean
  message: string
  type: ToastType
}

export default function Toast({ visible, message, type }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (visible) {
      setIsExiting(false)
    }
  }, [visible])

  if (!visible && !isExiting) {
    return null
  }

  const toastClass = (() => {
    switch (type) {
      case 'success':
        return s.toastSuccess
      case 'info':
        return s.toastInfo
      case 'error':
        return s.toastError
      default:
        return s.toastSuccess
    }
  })()

  return (
    <div className={`${s.toast} ${toastClass}`} data-testid="toast">
      {message}
    </div>
  )
}
