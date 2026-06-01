import React, { useState, useEffect, useRef } from 'react'

const SIMULATED_PARTNERS = [
  {
    name: 'Chloe',
    age: 22,
    city: 'Paris',
    country: 'France',
    flag: '🇫🇷',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Chloe',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-smiling-39889-large.mp4',
    chatSequence: [
      { delay: 1000, message: 'Hey there! 👋' },
      { delay: 3500, message: "I'm Chloe, visiting from Paris! What's your name?" },
      { delay: 7000, message: "This app is so fast tonight! What time is it over there? 🌌" }
    ]
  },
  {
    name: 'Carlos',
    age: 24,
    city: 'Rio de Janeiro',
    country: 'Brazil',
    flag: '🇧🇷',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Carlos',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-smiling-in-a-nightclub-40013-large.mp4',
    chatSequence: [
      { delay: 1000, message: 'Hey bro! 🤙' },
      { delay: 3200, message: 'Carlos here from Rio! What are you up to today?' },
      { delay: 6500, message: 'Awesome, love meeting people from around the world!' }
    ]
  },
  {
    name: 'Yuki',
    age: 23,
    city: 'Kyoto',
    country: 'Japan',
    flag: '🇯🇵',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Yuki',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-with-neon-makeup-smiling-39906-large.mp4',
    chatSequence: [
      { delay: 1000, message: 'Konnichiwa! 🌸' },
      { delay: 3000, message: "I'm Yuki. I'm studying design in Kyoto. Where are you?" },
      { delay: 6000, message: 'I love your vibe! Let’s follow each other!' }
    ]
  },
  {
    name: 'Sarah',
    age: 21,
    city: 'Brooklyn, NY',
    country: 'United States',
    flag: '🇺🇸',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sarah',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-with-neon-makeup-looking-at-camera-39907-large.mp4',
    chatSequence: [
      { delay: 1000, message: 'Hello! 😊' },
      { delay: 3500, message: "Sarah here from NYC! How are you doing today?" },
      { delay: 7000, message: 'Such a cool app, matching people instantly.' }
    ]
  }
]

export default function ChatPage({ setCurrentPage, user, onlineCount }) {
  // Cycle through simulated users
  const [partnerIndex, setPartnerIndex] = useState(0)
  const partner = SIMULATED_PARTNERS[partnerIndex]

  // Local WebRTC States
  const [localStream, setLocalStream] = useState(null)
  const [isMicOn, setIsMicOn] = useState(true)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [cameraError, setCameraError] = useState(false)

  // Remote connection timer
  const [timeConnected, setTimeConnected] = useState(0)

  // Chat Panel States
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [typedMessage, setTypedMessage] = useState('')

  // Report Modal States
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  const localVideoRef = useRef(null)
  const chatBottomRef = useRef(null)

  // 1. Initialise Local Camera Stream
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })
        setLocalStream(stream)
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }
        setCameraError(false)
      } catch (err) {
        console.error('Camera access denied or unavailable', err)
        setCameraError(true)
      }
    }

    if (isCameraOn) {
      startCamera()
    } else {
      stopCamera()
    }

    return () => stopCamera()
  }, [isCameraOn])

  const stopCamera = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
      setLocalStream(null)
    }
  }

  // Handle Mute Mic
  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = isMicOn
      })
    }
  }, [isMicOn, localStream])

  // 2. Incremental connection timer & chat sequence simulation
  useEffect(() => {
    setTimeConnected(0)
    setMessages([])
    
    // Live elapsed timer
    const interval = setInterval(() => {
      setTimeConnected(prev => prev + 1)
    }, 1000)

    // Schedule chatbot responses
    const chatTimers = partner.chatSequence.map(seq => {
      return setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { sender: 'partner', name: partner.name, text: seq.message, time: new Date() }
        ])
      }, seq.delay)
    })

    return () => {
      clearInterval(interval)
      chatTimers.forEach(clearTimeout)
    }
  }, [partnerIndex])

  // Scroll to chat bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isChatOpen])

  // Format Elapsed Time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  // Handle sending a message
  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!typedMessage.trim()) return

    const newMsg = {
      sender: 'user',
      name: user?.name || 'You',
      text: typedMessage,
      time: new Date()
    }

    setMessages(prev => [...prev, newMsg])
    setTypedMessage('')

    // Simple simulated responder
    setTimeout(() => {
      const responses = [
        "That's so cool!",
        "Awesome! Love it.",
        "Haha totally!",
        "Nice, I agree!",
        "What do you like to do in your free time?",
        "Really? That's awesome."
      ]
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      setMessages(prev => [
        ...prev,
        { sender: 'partner', name: partner.name, text: randomResponse, time: new Date() }
      ])
    }, 1500)
  }

  // Skip / Next Match
  const handleNextMatch = () => {
    // Show a quick loader, then cycle index
    setCurrentPage('matching')
    setTimeout(() => {
      setPartnerIndex(prev => (prev + 1) % SIMULATED_PARTNERS.length)
    }, 50)
  }

  // End Session
  const handleEndSession = () => {
    stopCamera()
    setCurrentPage('landing')
  }

  // Submit Report
  const handleSendReport = (e) => {
    e.preventDefault()
    if (!reportReason) return

    setIsReportOpen(false)
    setReportReason('')
    
    // Show premium toast
    setToastMessage(`Reported & blocked ${partner.name} successfully. Matching next...`)
    setTimeout(() => setToastMessage(''), 4000)

    // Automatically skip to the next person after reporting
    handleNextMatch()
  }

  return (
    <div className="relative w-full h-screen bg-[#0A0A0F] overflow-hidden flex flex-col md:flex-row">
      
      {/* 1. Main Viewport Area (Takes full screen) */}
      <div className="relative flex-1 h-full flex flex-col">
        
        {/* Remote Video Feed (Full-screen background loop) */}
        <div className="absolute inset-0 z-0 bg-[#07070B] overflow-hidden">
          <video 
            key={partner.videoUrl}
            src={partner.videoUrl} 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover scale-105"
          />
          {/* Subtle Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/60 pointer-events-none"></div>
        </div>

        {/* 2. Top Floating Navigation Bar */}
        <div className="relative z-10 w-full flex items-center justify-between px-6 py-5">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleEndSession}>
            <svg className="w-6 h-6 transition-transform group-hover:scale-110 duration-300" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="chatagle-chat-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A855F7" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
              <path d="M16 2C8.268 2 2 7.373 2 14c0 2.766 1.09 5.3 2.907 7.293L3 27l6.213-2.071C11.378 25.56 13.626 26 16 26c7.732 0 14-5.373 14-12S23.732 2 16 2z" fill="url(#chatagle-chat-grad)" opacity="0.15" />
              <path d="M16 4C9.373 4 4 8.477 4 14c0 2.296.936 4.397 2.475 6.02L5 25l4.836-1.612A11.897 11.897 0 0016 24c6.627 0 12-4.477 12-10S22.627 4 16 4z" stroke="url(#chatagle-chat-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M11 15s2.5-3 5-3 5 3 5 3-1-4-5-4-5 4-5 4z" fill="url(#chatagle-chat-grad)" />
              <path d="M16 11l-2 3h4l-2-3z" fill="url(#chatagle-chat-grad)" />
              <path d="M12 16.5c2 0 3.5-1 4-2.5.5 1.5 2 2.5 4 2.5v1c-2 0-3.5-1-4-2.5-.5 1.5-2 2.5-4 2.5v-1z" fill="url(#chatagle-chat-grad)" />
            </svg>
            <span className="text-lg font-bold font-display text-white tracking-tight">Chatagle</span>
          </div>

          {/* Right Control (Report button) */}
          <button 
            onClick={() => setIsReportOpen(true)}
            className="bg-dangerRed/10 border border-dangerRed/30 hover:bg-dangerRed/20 hover:border-dangerRed/50 text-dangerRed px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all active:scale-95 duration-200"
          >
            <span>🚩</span> Report
          </button>
        </div>

        {/* 3. Match Info Chip (Top-left) */}
        <div className="absolute top-20 left-6 z-10 animate-fade-up">
          <div className="glass-panel px-4 py-2.5 flex items-center gap-3 bg-black/45 border-white/5 shadow-lg">
            <span className="text-lg">{partner.flag}</span>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-white leading-tight">
                {partner.name}, {partner.age}
              </span>
              <span className="text-[10px] text-textMuted font-medium leading-none mt-0.5">
                {partner.city}, {partner.country}
              </span>
            </div>
            <div className="h-6 w-[1px] bg-white/10 mx-1"></div>
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-accentSecondary">
              <span className="h-2 w-2 rounded-full bg-pink-500 animate-pulse"></span>
              {formatTime(timeConnected)}
            </div>
          </div>
        </div>

        {/* 4. Local Camera Feed (Floating Bottom-Right Card) */}
        <div className="absolute bottom-28 right-6 md:bottom-32 md:right-8 z-20 w-[140px] h-[105px] md:w-[200px] md:h-[150px] rounded-2xl overflow-hidden glass-panel border-2 border-white/15 shadow-2xl flex items-center justify-center bg-black/60 transition-all hover:scale-105 duration-200">
          {isCameraOn && !cameraError ? (
            <video 
              ref={localVideoRef} 
              autoPlay 
              muted 
              playsInline 
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-1 text-center p-2">
              <span className="text-xl md:text-2xl text-dangerRed animate-pulse">📹</span>
              <span className="text-[9px] md:text-[11px] font-bold text-white/90">Camera Off</span>
            </div>
          )}
          {/* Tag */}
          <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-bold text-white border border-white/5">
            You
          </div>
        </div>

        {/* 5. Center Bottom Controls Bar */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-full max-w-sm px-4">
          <div className="glass-panel px-5 py-4 flex items-center justify-between gap-4 bg-black/55 border-white/10 shadow-2xl rounded-full">
            {/* Mic Toggle */}
            <button 
              onClick={() => setIsMicOn(!isMicOn)}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-lg transition-all duration-200 active:scale-90 ${
                isMicOn 
                  ? 'bg-white/5 border border-white/10 hover:bg-white/10 text-white' 
                  : 'bg-dangerRed/25 border border-dangerRed/40 text-dangerRed shadow-lg shadow-dangerRed/10'
              }`}
              title={isMicOn ? 'Mute Mic' : 'Unmute Mic'}
            >
              {isMicOn ? '🎤' : '🎙️'}
            </button>

            {/* Camera Toggle */}
            <button 
              onClick={() => setIsCameraOn(!isCameraOn)}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-lg transition-all duration-200 active:scale-90 ${
                isCameraOn && !cameraError
                  ? 'bg-white/5 border border-white/10 hover:bg-white/10 text-white' 
                  : 'bg-dangerRed/25 border border-dangerRed/40 text-dangerRed shadow-lg shadow-dangerRed/10'
              }`}
              title={isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
            >
              {isCameraOn ? '📹' : '📸'}
            </button>

            {/* Next Person Button */}
            <button 
              onClick={handleNextMatch}
              className="btn-gradient flex-1 py-3 px-6 rounded-full text-white text-xs font-bold tracking-wider uppercase active:scale-95 duration-200 flex items-center justify-center gap-1 shadow-lg"
            >
              Next Person ⏭
            </button>

            {/* Chat Toggle Button */}
            <button 
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-lg transition-all duration-200 active:scale-90 ${
                isChatOpen 
                  ? 'bg-purple-600/35 border border-purple-500/50 text-purple-300' 
                  : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white'
              }`}
              title="Toggle Text Chat"
            >
              💬
            </button>

            {/* End Button */}
            <button 
              onClick={handleEndSession}
              className="w-12 h-12 rounded-full bg-dangerRed hover:bg-red-600 border border-white/5 text-white flex items-center justify-center text-lg transition-all duration-200 active:scale-90 shadow-lg shadow-red-900/20"
              title="End Chat"
            >
              🔴
            </button>
          </div>
        </div>

      </div>

      {/* 6. Text Chat Sidebar (Right Sliding Panel) */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[340px] z-30 transition-transform duration-300 ease-in-out transform border-l border-white/5 flex flex-col bg-bgSecondary/95 backdrop-blur-xl ${
        isChatOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Chat Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={partner.avatar} 
              alt="Avatar" 
              className="w-8 h-8 rounded-full bg-purple-900 border border-white/20" 
            />
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold text-white leading-tight">{partner.name}</span>
              <span className="text-[10px] text-onlineGreen flex items-center gap-1 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-onlineGreen"></span> Active Chat
              </span>
            </div>
          </div>
          <button 
            onClick={() => setIsChatOpen(false)}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-textMuted hover:text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Chat History Panel */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-textMuted/40">
              <span className="text-4xl mb-3">💬</span>
              <p className="text-xs font-semibold uppercase tracking-wider">No messages yet</p>
              <p className="text-[11px] mt-1">Start typing below to say hello!</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex flex-col max-w-[85%] ${
                  msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                }`}
              >
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-accentPrimary to-accentSecondary text-white rounded-tr-none'
                    : 'bg-white/5 border border-white/10 text-white/95 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
                <span className="text-[9px] text-textMuted/60 mt-1 uppercase font-semibold tracking-wider font-mono">
                  {msg.name} · {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
          <div ref={chatBottomRef}></div>
        </div>

        {/* Chat Input form */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 flex gap-2">
          <input 
            type="text" 
            value={typedMessage}
            onChange={(e) => setTypedMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-[#1A1A2E] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-textMuted/40 focus:outline-none focus:border-accentPrimary"
          />
          <button 
            type="submit"
            className="px-4 bg-accentPrimary hover:bg-purple-600 rounded-xl text-white font-bold transition-all active:scale-95"
          >
            Send
          </button>
        </form>
      </div>

      {/* 7. Premium Action Notification Toast */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#1E1B4B] border border-purple-500/40 text-purple-200 px-6 py-3 rounded-full text-xs font-bold shadow-2xl flex items-center gap-3 animate-fade-up">
          <span className="h-2 w-2 rounded-full bg-pink-500 animate-ping"></span>
          {toastMessage}
        </div>
      )}

      {/* 8. Gorgeous Glassmorphic Report Modal */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-up">
          <div className="glass-panel max-w-sm w-full p-6 bg-bgSecondary border-white/10 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              🚩 Report matched user?
            </h3>
            <p className="text-xs text-textMuted mb-5 leading-relaxed">
              Reporting this user will immediately block them and ensure you are never matched again.
            </p>

            <form onSubmit={handleSendReport} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-textMuted uppercase tracking-wider">Reason for report</label>
                <select 
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  required
                  className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-dangerRed"
                >
                  <option value="">Select a reason...</option>
                  <option value="inappropriate">Inappropriate behavior/video</option>
                  <option value="harassment">Harassment or bullying</option>
                  <option value="spam">Spam / Advertising / Bot</option>
                  <option value="underage">Underage user</option>
                  <option value="other">Other reason</option>
                </select>
              </div>

              <div className="flex items-center gap-3 mt-2">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsReportOpen(false)
                    setReportReason('')
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-textMuted hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-dangerRed hover:bg-red-600 text-white text-xs font-bold"
                >
                  Report & Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
