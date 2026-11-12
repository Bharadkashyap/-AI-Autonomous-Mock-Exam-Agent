import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useTheme } from './context/ThemeContext'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './components/dashboard/Dashboard'
import ExamSetup from './components/exam/ExamSetup'
import ExamSession from './components/exam/ExamSession'
import CompletionSummary from './components/exam/CompletionSummary'

/**
 * Root App component.
 * Wraps the app in the theme, router, and global toast provider.
 */
function App() {
  const { theme } = useTheme()

  return (
    <div className="app-layout">
      <Header />
      <div className="app-body">
        <Sidebar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/exam/:id" element={<ExamSetup />} />
            <Route path="/exams" element={<ExamSetup />} />
            <Route path="/session/:id" element={<ExamSession />} />
            <Route path="/results/:id" element={<CompletionSummary />} />
          </Routes>
        </main>
      </div>

      {/* Global toast container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: theme === 'dark' ? '#1e1e2d' : '#ffffff',
            color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
            border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
            borderRadius: '10px',
            fontSize: '14px',
            boxShadow:
              theme === 'dark'
                ? '0 10px 25px rgba(0,0,0,0.5)'
                : '0 10px 25px rgba(0,0,0,0.1)',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#ffffff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#ffffff' },
          },
        }}
      />
    </div>
  )
}

export default App
