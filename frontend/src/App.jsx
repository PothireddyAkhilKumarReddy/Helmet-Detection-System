import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import Analytics from './components/Analytics'
import LiveFeed from './components/LiveFeed'
import Settings from './components/Settings'
import Login from './components/Login'
import Signup from './components/Signup'
import Results from './components/Results'
import History from './components/History'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="live-feed" element={<LiveFeed />} />
          <Route path="settings" element={<Settings />} />
          <Route path="results" element={<Results />} />
          <Route path="history" element={<History />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
