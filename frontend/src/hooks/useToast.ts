import { useState, useCallback } from 'react'

export type ToastType = 'success' | 'info' | 'error'

interface UseToastReturn {
  toastVisible: boolean
  toastMessage: string
  toastType: ToastType
  showToast: (message: string, type?: ToastType) => void
}

export function useToast(): UseToastReturn {
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<ToastType>('success')

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setToastVisible(true)

    setTimeout(() => {
      setToastVisible(false)
    }, 2500)
  }, [])

  return {
    toastVisible,
    toastMessage,
    toastType,
    showToast,
  }
}
