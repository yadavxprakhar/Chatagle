import React, { useState } from 'react'
import { auth, db } from '../firebase.js'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'

export default function AuthPage({ setCurrentPage, setUser }) {
  const [isRegister, setIsRegister] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  const handleOAuthLogin = async () => {
    try {
      setError('')
      setAuthLoading(true)
      
      // Dynamic simulated OAuth credential pairing
      const randomSeed = Math.random().toString(36).substring(7)
      const mockUid = `oauth_fb_${randomSeed}`
      const profileData = {
        name: 'John Doe',
        email: `john.doe_${randomSeed}@facebook.com`,
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${randomSeed}`,
        onlineStatus: 'online',
        createdAt: new Date().toISOString()
      }
      
      // Persist in Firestore to behave like a production account
      await setDoc(doc(db, 'users', mockUid), profileData)
      
      setUser({
        uid: mockUid,
        ...profileData
      })
      setCurrentPage('matching')
    } catch (err) {
      console.error('OAuth Simulation Error:', err)
      setError(err.message || 'Simulated OAuth registration failed.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password || (isRegister && !fullName)) {
      setError('Please fill in all fields.')
      return
    }
    setError('')
    setAuthLoading(true)

    try {
      if (isRegister) {
        // 1. Create authenticated account in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const firebaseUser = userCredential.user

        // 2. Generate and store user details inside Cloud Firestore
        const seed = encodeURIComponent(fullName)
        const profileData = {
          name: fullName,
          email: email,
          avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`,
          onlineStatus: 'online',
          createdAt: new Date().toISOString()
        }

        await setDoc(doc(db, 'users', firebaseUser.uid), profileData)
        
        setUser({
          uid: firebaseUser.uid,
          ...profileData
        })
      } else {
        // 1. Sign in via Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        // User session observer in App.jsx handles state retrieval and navigation triggers!
      }
      
      setCurrentPage('matching')
    } catch (err) {
      console.error('Authentication error:', err)
      
      // User-friendly error messaging formatting
      let userMsg = err.message
      if (err.code === 'auth/email-already-in-use') {
        userMsg = 'This email address is already registered.'
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        userMsg = 'Incorrect email or password combination.'
      } else if (err.code === 'auth/weak-password') {
        userMsg = 'Password should be at least 6 characters.'
      } else if (err.code === 'auth/invalid-email') {
        userMsg = 'Please enter a valid email address.'
      }
      
      setError(userMsg)
    } finally {
      setAuthLoading(false)
    }
  }

  return (
    <div className="relative w-full min-h-screen bg-bgBase flex items-center justify-center px-4 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.12),transparent_70%)]"></div>
      </div>

      <div className="relative z-10 w-full max-w-[440px] animate-fade-up">
        {/* Glass Card */}
        <div className="glass-panel p-8 md:p-10 w-full bg-white/[0.03] border-white/10 shadow-2xl flex flex-col items-center">
          
          {/* Logo Header */}
          <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => setCurrentPage('landing')}>
            <svg className="w-8 h-8 transition-transform group-hover:scale-110 duration-300" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="chatagle-auth-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A855F7" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
              <path d="M16 2C8.268 2 2 7.373 2 14c0 2.766 1.09 5.3 2.907 7.293L3 27l6.213-2.071C11.378 25.56 13.626 26 16 26c7.732 0 14-5.373 14-12S23.732 2 16 2z" fill="url(#chatagle-auth-grad)" opacity="0.15" />
              <path d="M16 4C9.373 4 4 8.477 4 14c0 2.296.936 4.397 2.475 6.02L5 25l4.836-1.612A11.897 11.897 0 0016 24c6.627 0 12-4.477 12-10S22.627 4 16 4z" stroke="url(#chatagle-auth-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M11 15s2.5-3 5-3 5 3 5 3-1-4-5-4-5 4-5 4z" fill="url(#chatagle-auth-grad)" />
              <path d="M16 11l-2 3h4l-2-3z" fill="url(#chatagle-auth-grad)" />
              <path d="M12 16.5c2 0 3.5-1 4-2.5.5 1.5 2 2.5 4 2.5v1c-2 0-3.5-1-4-2.5-.5 1.5-2 2.5-4 2.5v-1z" fill="url(#chatagle-auth-grad)" />
            </svg>
            <span className="text-xl font-bold font-display text-white tracking-tight">Chatagle</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2 text-center">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-sm text-textMuted mb-8 text-center">
            {isRegister ? 'Sign up to start meeting new people' : 'Login to start meeting people'}
          </p>

          {/* Error Message */}
          {error && (
            <div className="w-full bg-dangerRed/10 border border-dangerRed/20 text-dangerRed px-4 py-2.5 rounded-xl text-xs font-semibold mb-6">
              ⚠️ {error}
            </div>
          )}

          {/* Facebook OAuth Button */}
          <button 
            type="button"
            onClick={handleOAuthLogin}
            disabled={authLoading}
            className="w-full py-3 px-6 rounded-full bg-[#1877F2] hover:bg-[#166FE5] text-white text-sm font-semibold flex items-center justify-center gap-3 transition-colors duration-200 active:scale-95 shadow-md mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {authLoading ? (
              <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
            ) : (
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            )}
            {authLoading ? 'Verifying...' : 'Continue with Facebook'}
          </button>

          {/* Divider */}
          <div className="w-full flex items-center justify-center gap-4 mb-6">
            <div className="h-[1px] flex-1 bg-white/10"></div>
            <span className="text-xs text-textMuted uppercase tracking-wider">or</span>
            <div className="h-[1px] flex-1 bg-white/10"></div>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
            {isRegister && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-textMuted uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={authLoading}
                  placeholder="Alex Mercer"
                  className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-textMuted/40 focus:outline-none focus:border-accentPrimary focus:ring-4 focus:ring-accentPrimary/15 transition-all duration-200 disabled:opacity-50"
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-textMuted uppercase tracking-wider">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={authLoading}
                placeholder="your@email.com"
                className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-textMuted/40 focus:outline-none focus:border-accentPrimary focus:ring-4 focus:ring-accentPrimary/15 transition-all duration-200 disabled:opacity-50"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-textMuted uppercase tracking-wider">Password</label>
                {!isRegister && (
                  <a href="#forgot" className="text-xs text-textMuted/70 hover:text-white transition-colors">
                    Forgot?
                  </a>
                )}
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={authLoading}
                  placeholder="••••••••"
                  className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder-textMuted/40 focus:outline-none focus:border-accentPrimary focus:ring-4 focus:ring-accentPrimary/15 transition-all duration-200 disabled:opacity-50"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={authLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted hover:text-white transition-colors disabled:opacity-30"
                >
                  {showPassword ? (
                    // Eye off SVG
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.815 7.815 3 3m-3-3-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    // Eye on SVG
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Login / Create Account Button */}
            <button 
              type="submit"
              disabled={authLoading}
              className="w-full btn-gradient py-3.5 px-6 rounded-full text-white text-sm font-semibold tracking-wide uppercase mt-2 shadow-lg active:scale-95 duration-200 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {authLoading && (
                <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
              )}
              {authLoading ? 'Processing...' : (isRegister ? 'Create Account' : 'Login')}
            </button>
          </form>

          {/* Toggle state */}
          <div className="mt-8 text-center text-sm text-textMuted">
            <span>
              {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            </span>
            <button 
              onClick={() => {
                setIsRegister(!isRegister)
                setError('')
              }}
              disabled={authLoading}
              className="font-semibold text-accentSecondary hover:underline disabled:opacity-50"
            >
              {isRegister ? 'Login' : 'Sign Up'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
