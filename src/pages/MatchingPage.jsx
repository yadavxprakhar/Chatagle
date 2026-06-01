import React, { useState, useEffect } from 'react'

export default function MatchingPage({ setCurrentPage, user, onlineCount }) {
  const [statusText, setStatusText] = useState('Finding your match...')
  const [subText, setSubText] = useState('Connecting you to someone new · Usually under 3 seconds')

  const logs = [
    { text: 'Connecting to matchmaker server...', sub: 'Initializing encrypted peer handshake...' },
    { text: 'Filtering active online users...', sub: 'Selecting optimal latency connection...' },
    { text: 'Match found! Handshaking WebRTC...', sub: 'Streaming local video feed...' }
  ]

  useEffect(() => {
    // Staggered status logs to feel extremely high fidelity and real!
    const timer1 = setTimeout(() => {
      setStatusText(logs[0].text)
      setSubText(logs[0].sub)
    }, 800)

    const timer2 = setTimeout(() => {
      setStatusText(logs[1].text)
      setSubText(logs[1].sub)
    }, 1700)

    const timer3 = setTimeout(() => {
      setStatusText(logs[2].text)
      setSubText(logs[2].sub)
    }, 2500)

    // Redirect after 3.2s
    const redirectTimer = setTimeout(() => {
      setCurrentPage('chat')
    }, 3200)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(redirectTimer)
    }
  }, [setCurrentPage])

  const handleCancel = () => {
    setCurrentPage('landing')
  }

  return (
    <div className="relative w-full min-h-screen bg-bgBase flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(236,72,153,0.06),transparent_70%)]"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-md w-full text-center">
        
        {/* Concentric Pulsing Ring Container */}
        <div className="relative w-44 h-44 mb-12 flex items-center justify-center">
          {/* Concentric waves */}
          <div className="absolute inset-0 rounded-full bg-purple-500/10 border border-purple-500/30 animate-pulse-ring-1"></div>
          <div className="absolute inset-0 rounded-full bg-pink-500/10 border border-pink-500/30 animate-pulse-ring-2"></div>
          <div className="absolute inset-0 rounded-full bg-cyan-500/10 border border-cyan-500/30 animate-pulse-ring-3"></div>

          {/* User Profile Avatar at Center */}
          <div className="relative z-10 w-24 h-24 rounded-full bg-bgSecondary border-4 border-white/10 shadow-2xl overflow-hidden flex items-center justify-center p-1">
            <img 
              src={user?.avatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Guest'} 
              alt="avatar" 
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>

        {/* Dynamic Status Text */}
        <h2 className="text-2xl font-bold font-display text-white tracking-tight mb-3 min-h-[32px] transition-all duration-300">
          {statusText}
        </h2>

        {/* Dynamic Subtext */}
        <p className="text-sm text-textMuted max-w-xs min-h-[40px] leading-relaxed mb-8 transition-all duration-300">
          {subText}
        </p>

        {/* Animated Progress Dots */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <span className="w-2.5 h-2.5 rounded-full bg-accentPrimary animate-dot-bounce-1"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-accentSecondary animate-dot-bounce-2"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-accentHot animate-dot-bounce-3"></span>
        </div>

        {/* Online Indicator Muted */}
        <div className="flex items-center gap-2 mb-8 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-xs font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="animate-online-dot absolute inline-flex h-full w-full rounded-full bg-onlineGreen opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-onlineGreen"></span>
          </span>
          <span className="text-white/80">{onlineCount.toLocaleString()} partners online now</span>
        </div>

        {/* Cancel button */}
        <button 
          onClick={handleCancel}
          className="px-8 py-3 rounded-full border border-white/15 text-sm font-bold text-white hover:bg-white/5 hover:border-white/25 active:scale-95 transition-all duration-200"
        >
          Cancel Match
        </button>

      </div>
    </div>
  )
}
