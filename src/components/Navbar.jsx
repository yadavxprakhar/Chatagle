import React, { useState, useEffect } from 'react'

export default function Navbar({ currentPage, setCurrentPage, user, setUser, onlineCount }) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    setUser(null)
    setCurrentPage('landing')
  }

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-bgBase/80 backdrop-blur-md border-b border-white/5 py-4' 
        : 'bg-transparent py-6'
    }`}>
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => setCurrentPage('landing')} 
          className="flex items-center gap-2 cursor-pointer group"
        >
          <svg className="w-8 h-8 transition-transform group-hover:scale-110 duration-300" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="chatagle-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A855F7" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>
            <path d="M16 2C8.268 2 2 7.373 2 14c0 2.766 1.09 5.3 2.907 7.293L3 27l6.213-2.071C11.378 25.56 13.626 26 16 26c7.732 0 14-5.373 14-12S23.732 2 16 2z" fill="url(#chatagle-grad)" opacity="0.15" />
            <path d="M16 4C9.373 4 4 8.477 4 14c0 2.296.936 4.397 2.475 6.02L5 25l4.836-1.612A11.897 11.897 0 0016 24c6.627 0 12-4.477 12-10S22.627 4 16 4z" stroke="url(#chatagle-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M11 15s2.5-3 5-3 5 3 5 3-1-4-5-4-5 4-5 4z" fill="url(#chatagle-grad)" />
            <path d="M16 11l-2 3h4l-2-3z" fill="url(#chatagle-grad)" />
            <path d="M12 16.5c2 0 3.5-1 4-2.5.5 1.5 2 2.5 4 2.5v1c-2 0-3.5-1-4-2.5-.5 1.5-2 2.5-4 2.5v-1z" fill="url(#chatagle-grad)" />
          </svg>
          <span className="text-xl font-bold font-display text-white tracking-tight">
            Chat<span className="text-gradient">agle</span>
          </span>
        </div>

        {/* Center / Right Content */}
        <div className="flex items-center gap-6">
          {/* Online badge */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-xs font-medium tracking-wide">
            <span className="relative flex h-2 w-2">
              <span className="animate-online-dot absolute inline-flex h-full w-full rounded-full bg-onlineGreen opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-onlineGreen"></span>
            </span>
            <span className="text-white/90">
              {onlineCount.toLocaleString()} online now
            </span>
          </div>

          {/* Action button */}
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 pr-3 pl-1.5 py-1 rounded-full">
                <img 
                  src={user.avatarUrl} 
                  alt="avatar" 
                  className="w-7 h-7 rounded-full bg-purple-900 border border-white/20" 
                />
                <span className="text-sm font-semibold text-white/90">{user.name.split(' ')[0]}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="text-xs font-semibold text-textMuted hover:text-white transition-colors duration-200 uppercase tracking-wider"
              >
                Logout
              </button>
            </div>
          ) : (
            currentPage !== 'login' && (
              <button 
                onClick={() => setCurrentPage('login')}
                className="px-6 py-2 rounded-full border border-white/15 text-sm font-semibold text-white hover:bg-white/5 hover:border-white/25 active:scale-95 transition-all duration-200"
              >
                Login
              </button>
            )
          )}
        </div>
      </div>
    </nav>
  )
}
