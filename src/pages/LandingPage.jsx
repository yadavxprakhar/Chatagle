import React from 'react'

export default function LandingPage({ setCurrentPage, user }) {
  const handleStartChat = () => {
    if (user) {
      setCurrentPage('matching')
    } else {
      setCurrentPage('login')
    }
  }

  return (
    <div className="relative w-full min-h-screen bg-bgBase overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.15),transparent_70%)]"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-24 md:pt-40 md:pb-32 min-h-screen flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 flex flex-col items-start text-left animate-fade-up">
            <h1 className="text-4xl md:text-5xl lg:text-[56px] font-bold font-display text-white leading-tight tracking-tight mb-6">
              Meet Someone New.<br />
              <span className="text-gradient">Right Now.</span>
            </h1>
            <p className="text-base md:text-lg text-textMuted max-w-lg mb-8 leading-relaxed">
              Connect with real people around the world via live video. No filters. No algorithms. Just humans.
            </p>

            {/* CTA Button */}
            <button 
              onClick={handleStartChat}
              className="btn-gradient px-8 py-4 rounded-full text-white font-semibold text-base tracking-wide uppercase active:scale-95 transition-all duration-300"
            >
              Start Chatting — It's Free 🦅
            </button>

            <span className="text-xs text-textMuted/60 mt-4 tracking-wider">
              No download needed · Works in your browser · 18+ only
            </span>
          </div>

          {/* Hero Right: Diagonal Floating Video Preview Cards */}
          <div className="lg:col-span-5 relative h-[360px] md:h-[440px] flex items-center justify-center">
            {/* Card 1 (Left Offset) */}
            <div className="absolute left-4 md:left-8 -rotate-6 scale-90 md:scale-95 glass-panel p-3 w-[160px] md:w-[190px] h-[220px] md:h-[260px] shadow-2xl transition-transform hover:-rotate-12 duration-300 hover:scale-105">
              <div className="w-full h-[80%] rounded-xl bg-gradient-to-tr from-purple-900 to-indigo-950 overflow-hidden relative border border-white/5">
                <img 
                  src="https://api.dicebear.com/7.x/adventurer/svg?seed=Chloe" 
                  alt="Chloe" 
                  className="w-full h-full object-cover scale-90"
                />
                <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-onlineGreen"></span>
                  <span className="text-[10px] font-semibold text-white">LIVE</span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-white/90">Chloe, 21</span>
                <span className="text-xs">🇫🇷</span>
              </div>
            </div>

            {/* Card 2 (Center) */}
            <div className="absolute z-20 rotate-0 glass-panel p-3.5 w-[180px] md:w-[210px] h-[240px] md:h-[280px] shadow-2xl transition-transform hover:scale-105 duration-300">
              <div className="w-full h-[80%] rounded-xl bg-gradient-to-tr from-rose-950 to-pink-900 overflow-hidden relative border border-white/5">
                <img 
                  src="https://api.dicebear.com/7.x/adventurer/svg?seed=Alex" 
                  alt="Alex" 
                  className="w-full h-full object-cover scale-90"
                />
                <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="animate-pulse h-1.5 w-1.5 rounded-full bg-onlineGreen"></span>
                  <span className="text-[10px] font-semibold text-white animate-pulse">MATCH</span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-bold text-white">Alex, 24</span>
                <span className="text-xs">🇺🇸</span>
              </div>
            </div>

            {/* Card 3 (Right Offset) */}
            <div className="absolute right-4 md:right-8 rotate-6 scale-90 md:scale-95 glass-panel p-3 w-[160px] md:w-[190px] h-[220px] md:h-[260px] shadow-2xl transition-transform hover:rotate-12 duration-300 hover:scale-105">
              <div className="w-full h-[80%] rounded-xl bg-gradient-to-tr from-cyan-950 to-teal-900 overflow-hidden relative border border-white/5">
                <img 
                  src="https://api.dicebear.com/7.x/adventurer/svg?seed=Yuki" 
                  alt="Yuki" 
                  className="w-full h-full object-cover scale-90"
                />
                <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-onlineGreen"></span>
                  <span className="text-[10px] font-semibold text-white">LIVE</span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-white/90">Yuki, 23</span>
                <span className="text-xs">🇯🇵</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <div className="glass-panel grid grid-cols-1 md:grid-cols-3 gap-8 py-10 px-8 text-center bg-white/[0.02]">
          <div className="flex flex-col items-center">
            <span className="text-3xl md:text-4xl font-extrabold text-gradient mb-2">50M+</span>
            <span className="text-sm font-semibold tracking-wider text-textMuted uppercase">Conversations Started</span>
          </div>
          <div className="flex flex-col items-center border-y border-white/5 md:border-y-0 md:border-x md:py-0 py-6">
            <span className="text-3xl md:text-4xl font-extrabold text-gradient mb-2">190+</span>
            <span className="text-sm font-semibold tracking-wider text-textMuted uppercase">Countries Connected</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl md:text-4xl font-extrabold text-gradient mb-2">Real-Time</span>
            <span className="text-sm font-semibold tracking-wider text-textMuted uppercase">Zero Delay Matching</span>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-32 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-16 tracking-tight">
          Three Steps to Connect
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="glass-panel p-8 relative flex flex-col items-center text-center bg-white/[0.01] border-white/5 transition-transform hover:-translate-y-1 duration-300">
            <div className="absolute -top-5 bg-gradient-to-r from-accentPrimary to-accentSecondary text-white text-sm font-bold w-10 h-10 rounded-full flex items-center justify-center border border-white/10 shadow-lg">
              1
            </div>
            <div className="w-14 h-14 rounded-full bg-purple-950/40 border border-purple-500/20 flex items-center justify-center text-2xl text-purple-400 mb-6">
              👤
            </div>
            <h3 className="text-lg font-bold text-white mb-3">Create Account</h3>
            <p className="text-sm text-textMuted leading-relaxed">
              Sign up quickly using Email or Facebook. Set up your minimal profile details.
            </p>
          </div>

          {/* Step 2 */}
          <div className="glass-panel p-8 relative flex flex-col items-center text-center bg-white/[0.01] border-white/5 transition-transform hover:-translate-y-1 duration-300">
            <div className="absolute -top-5 bg-gradient-to-r from-accentPrimary to-accentSecondary text-white text-sm font-bold w-10 h-10 rounded-full flex items-center justify-center border border-white/10 shadow-lg">
              2
            </div>
            <div className="w-14 h-14 rounded-full bg-pink-950/40 border border-pink-500/20 flex items-center justify-center text-2xl text-pink-400 mb-6">
              📹
            </div>
            <h3 className="text-lg font-bold text-white mb-3">Go Online</h3>
            <p className="text-sm text-textMuted leading-relaxed">
              Grant standard browser camera access and get ready to match instantly.
            </p>
          </div>

          {/* Step 3 */}
          <div className="glass-panel p-8 relative flex flex-col items-center text-center bg-white/[0.01] border-white/5 transition-transform hover:-translate-y-1 duration-300">
            <div className="absolute -top-5 bg-gradient-to-r from-accentPrimary to-accentSecondary text-white text-sm font-bold w-10 h-10 rounded-full flex items-center justify-center border border-white/10 shadow-lg">
              3
            </div>
            <div className="w-14 h-14 rounded-full bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center text-2xl text-cyan-400 mb-6">
              🦅
            </div>
            <h3 className="text-lg font-bold text-white mb-3">Instant Match</h3>
            <p className="text-sm text-textMuted leading-relaxed">
              Get matched instantly with random strangers. Swipe, skip, and find companions.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.04] bg-bgSecondary/60 backdrop-blur-md py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="chatagle-footer-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A855F7" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
              <path d="M16 2C8.268 2 2 7.373 2 14c0 2.766 1.09 5.3 2.907 7.293L3 27l6.213-2.071C11.378 25.56 13.626 26 16 26c7.732 0 14-5.373 14-12S23.732 2 16 2z" fill="url(#chatagle-footer-grad)" opacity="0.15" />
              <path d="M16 4C9.373 4 4 8.477 4 14c0 2.296.936 4.397 2.475 6.02L5 25l4.836-1.612A11.897 11.897 0 0016 24c6.627 0 12-4.477 12-10S22.627 4 16 4z" stroke="url(#chatagle-footer-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M11 15s2.5-3 5-3 5 3 5 3-1-4-5-4-5 4-5 4z" fill="url(#chatagle-footer-grad)" />
              <path d="M16 11l-2 3h4l-2-3z" fill="url(#chatagle-footer-grad)" />
              <path d="M12 16.5c2 0 3.5-1 4-2.5.5 1.5 2 2.5 4 2.5v1c-2 0-3.5-1-4-2.5-.5 1.5-2 2.5-4 2.5v-1z" fill="url(#chatagle-footer-grad)" />
            </svg>
            <span className="text-lg font-bold text-white tracking-tight">Chatagle</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-8 text-sm font-medium text-textMuted">
            <a href="#privacy" className="hover:text-white transition-colors duration-200">Privacy Policy</a>
            <a href="#terms" className="hover:text-white transition-colors duration-200">Terms of Service</a>
            <a href="#safety" className="hover:text-white transition-colors duration-200">Safety Center</a>
          </div>

          {/* Copyright */}
          <span className="text-xs text-textMuted/50">
            &copy; {new Date().getFullYear()} Chatagle. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  )
}
