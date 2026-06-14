import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createProject } from '../../api/projects'

export default function NewProjectPage() {
  const navigate = useNavigate()

  useEffect(() => {
    createProject({ title: '새 프로젝트' })
      .then(p => navigate(`/editor/${p.id}`, { replace: true }))
      .catch(() => navigate('/dashboard', { replace: true }))
  }, [navigate])

  return null
}
