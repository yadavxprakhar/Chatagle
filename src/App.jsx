import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar.jsx'
import LandingPage from './pages/LandingPage.jsx'
import AuthPage from './pages/AuthPage.jsx'
import MatchingPage from './pages/MatchingPage.jsx'
import ChatPage from './pages/ChatPage.jsx'
import PrivacyPage from './pages/PrivacyPage.jsx'
import TermsPage from './pages/TermsPage.jsx'
import SafetyPage from './pages/SafetyPage.jsx'
import { auth, db } from './firebase.js'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [matchRoomId, setMatchRoomId] = useState(null)
  const [matchRole, setMatchRole] = useState(null)
  
  // High-fidelity online user count that fluctuates organically
  const [onlineCount, setOnlineCount] = useState(23104)

  // Firebase session observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true)
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid)
          const userDoc = await getDoc(userDocRef)
          if (userDoc.exists()) {
            setUser({
              uid: firebaseUser.uid,
              ...userDoc.data()
            })
          } else {
            setUser({
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              email: firebaseUser.email,
              avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(firebaseUser.email)}`
            })
          }
        } catch (err) {
          console.error("Error loading user profile:", err)
          setUser({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            email: firebaseUser.email,
            avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(firebaseUser.email)}`
          })
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

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
        return (
          <MatchingPage 
            setCurrentPage={setCurrentPage} 
            user={user} 
            onlineCount={onlineCount} 
            setMatchRoomId={setMatchRoomId}
            setMatchRole={setMatchRole}
          />
        )
      case 'chat':
        return (
          <ChatPage 
            setCurrentPage={setCurrentPage} 
            user={user} 
            onlineCount={onlineCount} 
            matchRoomId={matchRoomId}
            matchRole={matchRole}
            setMatchRoomId={setMatchRoomId}
            setMatchRole={setMatchRole}
          />
        )
      case 'privacy':
        return <PrivacyPage setCurrentPage={setCurrentPage} />
      case 'terms':
        return <TermsPage setCurrentPage={setCurrentPage} />
      case 'safety':
        return <SafetyPage setCurrentPage={setCurrentPage} />
      default:
        return <LandingPage setCurrentPage={setCurrentPage} user={user} />
    }
  }

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-fade-up">
          <div className="w-12 h-12 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin"></div>
          <span className="text-xs font-bold tracking-wider text-textMuted uppercase animate-pulse">Loading Chatagle...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-[#0A0A0F] text-[#F9FAFB] flex flex-col font-body selection:bg-purple-600 selection:text-white">
      
      {/* Translucent Navbar (Shown on Landing, Login, and Policies pages) */}
      {(currentPage === 'landing' || currentPage === 'login' || currentPage === 'privacy' || currentPage === 'terms' || currentPage === 'safety') && (
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
