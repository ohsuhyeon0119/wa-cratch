import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage/LandingPage'
import LoginPage from './pages/LoginPage/LoginPage'
import ExplorePage from './pages/ExplorePage/ExplorePage'
import DashboardPage from './pages/DashboardPage/DashboardPage'
import EditorPage from './pages/EditorPage/EditorPage'
import PlayPage from './pages/PlayPage/PlayPage'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import NotFoundPage from './pages/NotFoundPage/NotFoundPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/explore" element={<ExplorePage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/editor/new"
        element={
          <ProtectedRoute>
            <EditorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/editor/:id"
        element={
          <ProtectedRoute>
            <EditorPage />
          </ProtectedRoute>
        }
      />
      <Route path="/play/:id" element={<PlayPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
