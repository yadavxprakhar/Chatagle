import React, { useEffect } from 'react'

export default function SafetyPage({ setCurrentPage }) {
  // Scroll to top on load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  return (
    <div className="relative w-full min-h-screen bg-bgBase overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.08),transparent_70%)]"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-24 text-left">
        {/* Header Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-semibold text-textMuted uppercase tracking-wider mb-4 animate-fade-up">
          <span 
            onClick={() => setCurrentPage('landing')} 
            className="hover:text-white cursor-pointer transition-colors"
          >
            Home
          </span>
          <span>/</span>
          <span className="text-accentSecondary">Safety Center</span>
        </div>

        {/* Hero Title */}
        <div className="mb-12 animate-fade-up">
          <h1 className="text-3xl md:text-4xl lg:text-[44px] font-bold font-display text-white leading-tight tracking-tight mb-4">
            Safety <span className="text-gradient">Center</span>
          </h1>
          <p className="text-base text-textMuted max-w-xl leading-relaxed">
            Your physical and digital safety is our primary focus. Discover the tools and guidelines designed to keep your video matches clean, positive, and secure.
          </p>
        </div>

        {/* Main Content Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-up">
          
          {/* Left Column: Actionable Safety Guidelines (8-span) */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Core Pillars */}
            <div className="glass-panel p-8 bg-white/[0.02] border-white/5 shadow-2xl flex flex-col gap-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                🛡️ Three Pillars of Chatagle Safety
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                <div className="flex flex-col gap-2 p-4 rounded-xl bg-white/[0.01] border border-white/5">
                  <span className="text-2xl mb-1">🔒</span>
                  <h3 className="text-sm font-bold text-white">Full Privacy</h3>
                  <p className="text-xs text-textMuted leading-relaxed">
                    Streams are strictly real-time and peer-to-peer. We do not record or save your matches.
                  </p>
                </div>
                <div className="flex flex-col gap-2 p-4 rounded-xl bg-white/[0.01] border border-white/5">
                  <span className="text-2xl mb-1">🚩</span>
                  <h3 className="text-sm font-bold text-white">Instant Reporting</h3>
                  <p className="text-xs text-textMuted leading-relaxed">
                    The report button is always visible. Flags block the user and skip them immediately.
                  </p>
                </div>
                <div className="flex flex-col gap-2 p-4 rounded-xl bg-white/[0.01] border border-white/5">
                  <span className="text-2xl mb-1">🚫</span>
                  <h3 className="text-sm font-bold text-white">Strict Moderation</h3>
                  <p className="text-xs text-textMuted leading-relaxed">
                    Report audits trigger immediate, hardware-level permanent bans to keep loops clean.
                  </p>
                </div>
              </div>
            </div>

            {/* Smart User Safety Guidelines Card */}
            <div className="glass-panel p-8 bg-white/[0.02] border-white/5 shadow-2xl flex flex-col gap-5">
              <h2 className="text-xl font-bold text-white border-b border-white/10 pb-3">
                💡 Tips for Safe Chatting
              </h2>
              
              <ul className="flex flex-col gap-4 text-sm text-textMuted">
                <li className="flex items-start gap-3">
                  <span className="bg-purple-950/40 text-purple-400 p-1.5 rounded-lg flex items-center justify-center font-bold h-6 w-6 text-xs">1</span>
                  <div>
                    <strong className="text-white">Protect Personal Information:</strong>
                    <p className="text-xs text-textMuted mt-1 leading-relaxed">
                      Never share your real address, full name, social handles, phone number, or banking details with strangers.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-purple-950/40 text-purple-400 p-1.5 rounded-lg flex items-center justify-center font-bold h-6 w-6 text-xs">2</span>
                  <div>
                    <strong className="text-white">Do Not Feel Pressured:</strong>
                    <p className="text-xs text-textMuted mt-1 leading-relaxed">
                      If a matching partner makes you uncomfortable, immediately click the <strong className="text-white">Next Person (⏭)</strong> or <strong className="text-white">Report (🚩)</strong> controls. You are in full control of your session.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-purple-950/40 text-purple-400 p-1.5 rounded-lg flex items-center justify-center font-bold h-6 w-6 text-xs">3</span>
                  <div>
                    <strong className="text-white">Report Violations Proactively:</strong>
                    <p className="text-xs text-textMuted mt-1 leading-relaxed">
                      Reporting helps clean up the environment for the entire community. Reporting immediately blocks their uid in our match database.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

          </div>

          {/* Right Column: Dynamic Sidebar Widgets (4-span) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Instant Help Widget */}
            <div className="glass-panel p-6 bg-white/[0.03] border-white/10 shadow-2xl flex flex-col gap-4">
              <span className="text-3xl text-left">🆘</span>
              <h3 className="text-base font-bold text-white text-left">Need Direct Assistance?</h3>
              <p className="text-xs text-textMuted text-left leading-relaxed">
                If you encountered a user who violated safety terms and you wish to file a manual security review ticket, you can reach out directly.
              </p>
              <a 
                href="mailto:support@chatagle.com" 
                className="w-full text-center py-2.5 rounded-full bg-accentPrimary hover:bg-purple-600 text-white font-semibold text-xs uppercase tracking-wider transition-all duration-200"
              >
                Contact Support
              </a>
            </div>

            {/* Fast Summary Info box */}
            <div className="glass-panel p-6 bg-white/[0.01] border-white/5 shadow-lg flex flex-col gap-4 text-xs leading-relaxed text-textMuted">
              <h4 className="font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Community Stats</h4>
              <div className="flex items-center justify-between font-semibold border-b border-white/5 pb-2">
                <span>Auto-Moderated Bans</span>
                <span className="text-pink-400">99.8%</span>
              </div>
              <div className="flex items-center justify-between font-semibold border-b border-white/5 pb-2">
                <span>Encrypted Connections</span>
                <span className="text-green-400">100% SRTP</span>
              </div>
              <div className="flex items-center justify-between font-semibold">
                <span>Average Response Time</span>
                <span className="text-purple-400">&lt; 15 mins</span>
              </div>
            </div>

          </div>

        </div>

        {/* Back Button */}
        <div className="mt-12 text-center">
          <button 
            onClick={() => setCurrentPage('landing')}
            className="px-8 py-3 rounded-full border border-white/15 hover:bg-white/5 text-sm font-semibold text-white active:scale-95 transition-all duration-200 shadow-md"
          >
            Return to Homepage
          </button>
        </div>

      </div>
    </div>
  )
}
