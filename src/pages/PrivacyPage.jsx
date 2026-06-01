import React, { useEffect } from 'react'

export default function PrivacyPage({ setCurrentPage }) {
  // Scroll to top on load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  return (
    <div className="relative w-full min-h-screen bg-bgBase overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.1),transparent_70%)]"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-24">
        {/* Header Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-semibold text-textMuted uppercase tracking-wider mb-4 animate-fade-up">
          <span 
            onClick={() => setCurrentPage('landing')} 
            className="hover:text-white cursor-pointer transition-colors"
          >
            Home
          </span>
          <span>/</span>
          <span className="text-accentSecondary">Privacy Policy</span>
        </div>

        {/* Hero title */}
        <div className="mb-12 text-left animate-fade-up">
          <h1 className="text-3xl md:text-4xl lg:text-[44px] font-bold font-display text-white leading-tight tracking-tight mb-4">
            Privacy <span className="text-gradient">Policy</span>
          </h1>
          <p className="text-base text-textMuted max-w-xl leading-relaxed">
            Your trust is our priority. Read how we protect your personal identity and handle your ephemeral video streams.
          </p>
        </div>

        {/* Content Board */}
        <div className="glass-panel p-8 md:p-10 bg-white/[0.02] border-white/5 shadow-2xl flex flex-col gap-8 animate-fade-up text-left">
          
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-2">
              1. Ephemeral Streams & Live Video
            </h2>
            <p className="text-sm text-textMuted leading-relaxed">
              At Chatagle, our live video matches are designed to be completely **ephemeral**. 
              We do **not** record, record-log, monitor, or store the video or audio feeds generated between you and your matching partners. Your live stream exists strictly in real-time and is transmitted directly (peer-to-peer) whenever possible.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-2">
              2. Data We Collect
            </h2>
            <p className="text-sm text-textMuted leading-relaxed mb-2">
              To provide a stable matching experience, we collect a minimal set of account information:
            </p>
            <ul className="list-disc pl-5 text-sm text-textMuted flex flex-col gap-2">
              <li>
                <strong className="text-white">Account Information</strong>: Your name, email, and password credentials provided during sign-up.
              </li>
              <li>
                <strong className="text-white">Profile Customizations</strong>: Your custom avatar configuration (Dicebear settings) and system nationality details.
              </li>
              <li>
                <strong className="text-white">Usage logs</strong>: Logs to track connection speeds, latency parameters, and reporting activities for safety audits.
              </li>
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-2">
              3. Encryption & Traversal Security
            </h2>
            <p className="text-sm text-textMuted leading-relaxed">
              All WebRTC streams utilize Secure Real-time Transport Protocol (SRTP) which ensures your live communication feeds are fully **encrypted** and secure from third-party interception. WebSockets communication to our matchmaking queues runs entirely over secure protocol channels (<code className="bg-white/5 px-1.5 py-0.5 rounded text-pink-400 font-mono text-xs">wss://</code>).
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-2">
              4. Third-Party Services & APIs
            </h2>
            <p className="text-sm text-textMuted leading-relaxed">
              We leverage premium third-party services to host infrastructure, traversing NAT setups via public STUN/TURN relays. These network relays transfer encrypted data packets exclusively without the ability to decrypt, read, or inspect your communication feeds.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-2">
              5. Your Rights & Data Controls
            </h2>
            <p className="text-sm text-textMuted leading-relaxed">
              You retain full control over your profile details. You can request complete deletion of your account and related profile metrics stored in our persistent Firestore database at any time by contacting support.
            </p>
          </section>

          {/* Policy footer */}
          <div className="border-t border-white/5 pt-8 mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-textMuted/60">
              Last updated: June 1, 2026
            </span>
            <button 
              onClick={() => setCurrentPage('landing')}
              className="px-6 py-2.5 rounded-full border border-white/15 hover:bg-white/5 text-sm font-semibold text-white active:scale-95 transition-all duration-200"
            >
              Back to Home
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
