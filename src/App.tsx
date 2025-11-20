import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AuthProvider from './contexts/AuthContext'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { Toaster } from './components/ui/toaster'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Chat } from './pages/Chat'
import { RankPredictor } from './pages/RankPredictor'
import { Colleges } from './pages/Colleges'
import { Exams } from './pages/Exams'
import { AdminDashboard } from './pages/AdminDashboard'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/rank-predictor" element={<RankPredictor />} />
              <Route path="/colleges" element={<Colleges />} />
              <Route path="/exams" element={<Exams />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>
          <Footer />
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App 