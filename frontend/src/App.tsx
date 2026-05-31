import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage/LandingPage'
import LoginPage from './pages/LoginPage/LoginPage'
import ExplorePage from './pages/ExplorePage/ExplorePage'
import DashboardPage from './pages/DashboardPage/DashboardPage'
import EditorPage from './pages/EditorPage/EditorPage'
import PlayPage from './pages/PlayPage/PlayPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/explore" element={<ExplorePage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/editor/:id" element={<EditorPage />} />
      <Route path="/play/:id" element={<PlayPage />} />
    </Routes>
  )
}

export default App
