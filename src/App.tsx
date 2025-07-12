import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AuthPage } from './components/Auth/AuthPage'
import { TodoList } from './components/Todo/TodoList'
import Dashboard from './components/Dashboard/Dashboard'
import TodoCalendar from './components/Todo/TodoCalendar'
import AnalyticsPage from './components/Analytics/AnalyticsPage'
import Sidebar from './components/Layout/Sidebar'
import Header from './components/Layout/Header'
import SettingsModal from './components/Settings/SettingsModal'
import WelcomeMessage from './components/Layout/WelcomeMessage'

const AppContent: React.FC = () => {
  const { user, loading, logout, setUser } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    if (user) {
      setShowWelcome(true)
    }
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return <AuthPage />

  const getPageInfo = () => {
    switch (activeTab) {
      case 'dashboard':
        return { title: 'Dashboard', subtitle: 'Overview of your tasks and productivity' }
      case 'todos':
        return { title: 'Todo List', subtitle: 'Manage your tasks and stay organized' }
      case 'analytics':
        return { title: 'Analytics', subtitle: 'Detailed insights and productivity metrics' }
      case 'calendar':
        return { title: 'Calendar', subtitle: 'View your tasks by date and schedule' }
      default:
        return { title: 'Dashboard', subtitle: 'Overview of your tasks and productivity' }
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'todos':
        return <TodoList />
      case 'analytics':
        return <AnalyticsPage />
      case 'calendar':
        return <TodoCalendar />
      default:
        return <Dashboard />
    }
  }

  const pageInfo = getPageInfo()

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        logout={logout}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      
      <div className="flex-1 flex flex-col lg:ml-0">
        <Header 
          title={pageInfo.title} 
          subtitle={pageInfo.subtitle} 
          onSettingsClick={() => setSettingsOpen(true)}
        />
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
      
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        user={user}
        onUserUpdate={(updatedUser) => {
          setUser(updatedUser);
        }}
      />
      
      {showWelcome && (
        <WelcomeMessage userName={user?.name || user?.email || 'User'} />
      )}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App