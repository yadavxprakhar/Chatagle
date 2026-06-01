import React, { useEffect } from 'react'

export default function TermsPage({ setCurrentPage }) {
  // Scroll to top on load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  return (
    <div className="relative w-full min-h-screen bg-bgBase overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(236,72,153,0.08),transparent_70%)]"></div>
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
          <span className="text-accentSecondary">Terms of Service</span>
        </div>

        {/* Hero title */}
        <div className="mb-12 text-left animate-fade-up">
          <h1 className="text-3xl md:text-4xl lg:text-[44px] font-bold font-display text-white leading-tight tracking-tight mb-4">
            Terms of <span className="text-gradient">Service</span>
          </h1>
          <p className="text-base text-textMuted max-w-xl leading-relaxed">
            Please read these terms carefully before entering active matchmaking queues. By using Chatagle, you agree to these guidelines.
          </p>
        </div>

        {/* Content Board */}
        <div className="glass-panel p-8 md:p-10 bg-white/[0.02] border-white/5 shadow-2xl flex flex-col gap-8 animate-fade-up text-left">
          
          {/* Strict Conduct Alert */}
          <div className="w-full bg-dangerRed/10 border border-dangerRed/20 text-dangerRed p-5 rounded-2xl text-xs sm:text-sm font-semibold flex flex-col gap-2">
            <span className="flex items-center gap-2 text-base font-bold">
              ⚠️ Strict Conduct Enforcement Policy
            </span>
            <p className="leading-relaxed opacity-90 font-medium">
              Chatagle enforces a ZERO-TOLERANCE policy for inappropriate streams, sexual content, nudity, bullying, and harassment. Violation of these terms will result in immediate, permanent device-level and account ban restrictions without warning.
            </p>
          </div>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-2">
              1. Age & Eligibility Requirements
            </h2>
            <p className="text-sm text-textMuted leading-relaxed">
              You must be at least **18 years of age** to access or match on Chatagle. By registering an account or initiating a matching queue, you represent and warrant that you are 18+ and have the capacity to bind to this agreement. Underage usage is strictly prohibited.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-2">
              2. User Code of Conduct
            </h2>
            <p className="text-sm text-textMuted leading-relaxed mb-2">
              To keep our community safe, you agree to adhere strictly to the following conduct mandates:
            </p>
            <ul className="list-disc pl-5 text-sm text-textMuted flex flex-col gap-2">
              <li>
                <strong className="text-white">Respect Others</strong>: Treat all matched peers with courtesy and dignity. No hate speech, racism, threats, or harassment.
              </li>
              <li>
                <strong className="text-white">Appropriate Broadcasts</strong>: Keep your camera feed clean. No nudity, explicit profiles, or graphic/violent streams.
              </li>
              <li>
                <strong className="text-white">No Spam or Bot Activities</strong>: Do not run automated broadcast feeds, pre-recorded visual loops, or advertisements.
              </li>
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-2">
              3. Account Termination & Banishment
            </h2>
            <p className="text-sm text-textMuted leading-relaxed">
              We reserve the right to suspend or ban your account permanently at our sole discretion, immediately and without notice, if we receive report audits indicating a breach of our Code of Conduct or if we determine your behavior negatively affects safety.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-2">
              4. Disclaimers & Limitation of Liability
            </h2>
            <p className="text-sm text-textMuted leading-relaxed">
              Chatagle connects you directly with random third-party users. We are not responsible for the actions, language, or content shared by other users during live video matches. The application is provided "as is" without warranty of any kind.
            </p>
          </section>

          {/* Terms footer */}
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
