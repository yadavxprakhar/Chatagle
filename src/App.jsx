import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar.jsx'
import LandingPage from './pages/LandingPage.jsx'
import AuthPage from './pages/AuthPage.jsx'
import MatchingPage from './pages/MatchingPage.jsx'
import ChatPage from './pages/ChatPage.jsx'

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing')
  const [user, setUser] = useState(null)
  
  // High-fidelity online user count that fluctuates organically
  const [onlineCount, setOnlineCount] = useState(23104)

  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount(prev => {
        const delta = Math.floor(Math.random() * 9) - 4 // Fluctuate between -4 and +4 users
        return Math.max(10000, prev + delta)
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Dynamic Page Rendering based on routing state
  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage setCurrentPage={setCurrentPage} user={user} />
      case 'login':
        return <AuthPage setCurrentPage={setCurrentPage} setUser={setUser} />
      case 'matching':
        return <MatchingPage setCurrentPage={setCurrentPage} user={user} onlineCount={onlineCount} />
      case 'chat':
        return <ChatPage setCurrentPage={setCurrentPage} user={user} onlineCount={onlineCount} />
      default:
        return <LandingPage setCurrentPage={setCurrentPage} user={user} />
    }
  }

  return (
    <div className="relative min-h-screen bg-[#0A0A0F] text-[#F9FAFB] flex flex-col font-body selection:bg-purple-600 selection:text-white">
      
      {/* Translucent Navbar (Only shown on Landing and Login views for immersive waiting/chat room layouts) */}
      {(currentPage === 'landing' || currentPage === 'login') && (
        <Navbar 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          user={user} 
          setUser={setUser}
          onlineCount={onlineCount}
        />
      )}

      {/* Main Page Area */}
      <main className="flex-1 w-full">
        {renderPage()}
      </main>

    </div>
  )
}
