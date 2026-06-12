import React, { useState, useEffect, useRef } from 'react'
import { Particles } from '../components/magicui/Particles.jsx'
import { BorderBeam } from '../components/magicui/BorderBeam.jsx'
import { db } from '../firebase.js'
import {
  doc,
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  setDoc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore'

const configuration = {
  iceServers: [
    {
      urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302'
      ]
    }
  ],
  iceCandidatePoolSize: 10
}

const FILTERS = [
  { id: 'normal', name: 'Normal', class: '' },
  { id: 'grayscale', name: 'Noir', class: 'grayscale' },
  { id: 'sepia', name: 'Sepia', class: 'sepia' },
  { id: 'warm', name: 'Warm', class: 'saturate-150 contrast-125 brightness-105' },
  { id: 'cool', name: 'Cool', class: 'hue-rotate-30 contrast-110 saturate-125' },
  { id: 'vintage', name: 'Vintage', class: 'sepia contrast-115 brightness-95 saturate-125' }
]

export default function ChatPage({ 
  setCurrentPage, 
  user, 
  onlineCount, 
  matchRoomId, 
  matchRole, 
  setMatchRoomId, 
  setMatchRole 
}) {
  // Local WebRTC & Signaling States
  const [localStream, setLocalStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [connectionState, setConnectionState] = useState('new')
  const [isMicOn, setIsMicOn] = useState(true)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [cameraError, setCameraError] = useState(false)

  // Remote partner details
  const [partnerUid, setPartnerUid] = useState(null)
  const [partnerInfo, setPartnerInfo] = useState({
    name: 'Connecting...',
    flag: '🌍',
    city: 'Searching...',
    country: '',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Connecting'
  })

  // Timer
  const [timeConnected, setTimeConnected] = useState(0)

  // Chat Panel States
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [typedMessage, setTypedMessage] = useState('')

  // Report Modal States
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  // Enhancements States
  const [partnerMicOn, setPartnerMicOn] = useState(true)
  const [partnerCameraOn, setPartnerCameraOn] = useState(true)
  const [latency, setLatency] = useState(null)
  const [selectedFilter, setSelectedFilter] = useState('normal')

  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const peerConnectionRef = useRef(null)
  const chatBottomRef = useRef(null)
  const isDisconnecting = useRef(false)

  // 1. Initialize Local Camera Stream (Once on mount)
  useEffect(() => {
    let isMounted = true
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })
        if (!isMounted) {
          stream.getTracks().forEach(track => track.stop())
          return
        }

        // Apply initial media states
        stream.getAudioTracks().forEach(t => t.enabled = isMicOn)
        stream.getVideoTracks().forEach(t => t.enabled = isCameraOn)

        setLocalStream(stream)
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }
        setCameraError(false)
      } catch (err) {
        console.error('Camera access denied or unavailable', err)
        if (isMounted) {
          setCameraError(true)
        }
      }
    }

    startCamera()

    return () => {
      isMounted = false
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop())
      }
    }
  }, []) // Empty deps so it only runs once on mount

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

  // Handle Toggle Camera Video Track
  useEffect(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = isCameraOn
      })
    }
  }, [isCameraOn, localStream])

  // Sync local media states to Firestore room doc
  useEffect(() => {
    if (!matchRoomId || !matchRole || !user?.uid) return

    const roomRef = doc(db, 'rooms', matchRoomId)
    const updatePayload = {}
    
    if (matchRole === 'caller') {
      updatePayload.creatorMicOn = isMicOn
      updatePayload.creatorCameraOn = isCameraOn
    } else {
      updatePayload.peerMicOn = isMicOn
      updatePayload.peerCameraOn = isCameraOn
    }

    updateDoc(roomRef, updatePayload).catch(err => {
      console.error("Error updating room media state: ", err)
    })
  }, [isMicOn, isCameraOn, matchRoomId, matchRole])

  // WebRTC Stats / Latency monitor
  useEffect(() => {
    if (connectionState !== 'connected' || !peerConnectionRef.current) {
      setLatency(null)
      return
    }

    const interval = setInterval(async () => {
      if (peerConnectionRef.current && connectionState === 'connected') {
        try {
          const stats = await peerConnectionRef.current.getStats()
          let rtt = null
          stats.forEach(report => {
            if (report.type === 'candidate-pair' && report.state === 'succeeded') {
              rtt = report.currentRoundTripTime * 1000 // Convert seconds to ms
            }
          })
          if (rtt !== null) {
            setLatency(Math.round(rtt))
          }
        } catch (e) {
          console.error("Error reading WebRTC stats: ", e)
        }
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [connectionState])

  // 2. WebRTC PeerConnection & Firestore Signaling Flow
  useEffect(() => {
    if (!localStream || !matchRoomId || !matchRole) return

    let isMounted = true
    let unsubscribeRoom = null
    let unsubscribeIce = null
    let unsubscribeRoomOffer = null
    let unsubscribeAnswer = null

    const roomRef = doc(db, 'rooms', matchRoomId)
    const callerCandidatesCol = collection(roomRef, 'callerCandidates')
    const calleeCandidatesCol = collection(roomRef, 'calleeCandidates')

    const pc = new RTCPeerConnection(configuration)
    peerConnectionRef.current = pc

    // Add local tracks to peer connection
    localStream.getTracks().forEach(track => {
      pc.addTrack(track, localStream)
    })

    // Remote stream setup
    const rStream = new MediaStream()
    setRemoteStream(rStream)
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = rStream
    }

    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach(track => {
        rStream.addTrack(track)
      })
    }

    pc.onconnectionstatechange = () => {
      if (isMounted) {
        setConnectionState(pc.connectionState)
      }
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && isMounted) {
        const candidateData = event.candidate.toJSON()
        const targetCol = matchRole === 'caller' ? callerCandidatesCol : calleeCandidatesCol
        addDoc(targetCol, candidateData).catch(err => console.error("Error writing ICE candidate:", err))
      }
    }

    // Monitor room for partner metadata and disconnection
    unsubscribeRoom = onSnapshot(roomRef, (snapshot) => {
      if (!isMounted) return
      if (!snapshot.exists()) {
        handlePartnerDisconnected('Partner disconnected.')
        return
      }
      const data = snapshot.data()
      if (data.status === 'disconnected') {
        handlePartnerDisconnected('Partner skipped.')
        return
      }

      // Update remote partner details
      const matchedPeerUid = matchRole === 'caller' ? data.peerId : data.creatorId
      if (matchedPeerUid) {
        setPartnerUid(matchedPeerUid)
      }

      if (matchRole === 'caller') {
        if (data.peerId) {
          setPartnerInfo({
            name: data.peerName || 'Partner',
            avatar: data.peerAvatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Partner',
            flag: data.peerFlag || '🌍',
            city: data.peerInfo?.city || 'Unknown City',
            country: data.peerInfo?.country || ''
          })
        }
      } else {
        setPartnerInfo({
          name: data.creatorName || 'Partner',
          avatar: data.creatorAvatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Partner',
          flag: data.creatorFlag || '🌍',
          city: data.creatorInfo?.city || 'Unknown City',
          country: data.creatorInfo?.country || ''
        })
      }

      // Update partner media status flags
      const pMicOn = matchRole === 'caller' ? data.peerMicOn : data.creatorMicOn
      const pCameraOn = matchRole === 'caller' ? data.peerCameraOn : data.creatorCameraOn
      
      setPartnerMicOn(pMicOn !== false)
      setPartnerCameraOn(pCameraOn !== false)
    })

    // ICE Candidate listener
    const iceColToListen = matchRole === 'caller' ? calleeCandidatesCol : callerCandidatesCol
    unsubscribeIce = onSnapshot(iceColToListen, (snapshot) => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added' && isMounted) {
          const candidateData = change.doc.data()
          pc.addIceCandidate(new RTCIceCandidate(candidateData)).catch(err => console.warn("Error adding remote ICE candidate:", err))
        }
      })
    })

    // SDP Offer / Answer Exchange
    async function startSdpExchange() {
      try {
        if (matchRole === 'caller') {
          // Caller creates the offer
          const offerDescription = await pc.createOffer()
          await pc.setLocalDescription(offerDescription)

          await updateDoc(roomRef, {
            offer: {
              type: offerDescription.type,
              sdp: offerDescription.sdp
            }
          })

          // Listen for answer
          unsubscribeAnswer = onSnapshot(roomRef, (snapshot) => {
            if (!isMounted) return
            const data = snapshot.data()
            if (data && data.answer && !pc.currentRemoteDescription) {
              const answerDescription = new RTCSessionDescription(data.answer)
              pc.setRemoteDescription(answerDescription).catch(err => console.error("Error setting answer description:", err))
            }
          })
        } else {
          // Callee listens for the offer
          unsubscribeRoomOffer = onSnapshot(roomRef, async (snapshot) => {
            if (!isMounted) return
            const data = snapshot.data()
            if (data && data.offer && !pc.localDescription) {
              try {
                const offerDescription = new RTCSessionDescription(data.offer)
                await pc.setRemoteDescription(offerDescription)

                const answerDescription = await pc.createAnswer()
                await pc.setLocalDescription(answerDescription)

                await updateDoc(roomRef, {
                  answer: {
                    type: answerDescription.type,
                    sdp: answerDescription.sdp
                  }
                })
              } catch (sdpErr) {
                console.error("Error setting remote offer / answer:", sdpErr)
              }
            }
          })
        }
      } catch (err) {
        console.error("SDP exchange failed:", err)
      }
    }

    startSdpExchange()

    return () => {
      isMounted = false
      if (unsubscribeRoom) unsubscribeRoom()
      if (unsubscribeIce) unsubscribeIce()
      if (unsubscribeRoomOffer) unsubscribeRoomOffer()
      if (unsubscribeAnswer) unsubscribeAnswer()
      pc.close()
    }
  }, [localStream, matchRoomId, matchRole])

  // Partner Disconnect Handler
  const handlePartnerDisconnected = (message) => {
    if (isDisconnecting.current) return
    isDisconnecting.current = true

    cleanupWebRTC()
    setToastMessage(message || 'Partner skipped.')
    setTimeout(() => setToastMessage(''), 3000)

    // Reset parameters in App.jsx and redirect to matching
    setTimeout(() => {
      setMatchRoomId(null)
      setMatchRole(null)
      setCurrentPage('matching')
    }, 1500)
  }

  // 3. Incremental Live Connection Timer
  useEffect(() => {
    if (connectionState !== 'connected') {
      setTimeConnected(0)
      return
    }
    const interval = setInterval(() => {
      setTimeConnected(prev => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [connectionState])

  // 4. Real-time Message Collection Listener
  useEffect(() => {
    if (!matchRoomId) return

    const messagesCol = collection(db, 'rooms', matchRoomId, 'messages')
    const q = query(messagesCol, orderBy('createdAt', 'asc'))

    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const msgs = []
      snapshot.forEach(docSnap => {
        const data = docSnap.data()
        msgs.push({
          id: docSnap.id,
          sender: data.senderId === user?.uid ? 'user' : 'partner',
          name: data.senderName,
          text: data.text,
          time: data.createdAt ? data.createdAt.toDate() : new Date()
        })
      })
      setMessages(msgs)
    })

    return () => unsubscribeMessages()
  }, [matchRoomId, user])

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
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!typedMessage.trim() || !matchRoomId) return

    const messagesCol = collection(db, 'rooms', matchRoomId, 'messages')
    try {
      await addDoc(messagesCol, {
        senderId: user?.uid || 'guest_' + Math.random().toString(36).substring(7),
        senderName: user?.name || 'You',
        text: typedMessage,
        createdAt: serverTimestamp()
      })
      setTypedMessage('')
    } catch (err) {
      console.error("Error sending message:", err)
    }
  }

  // Skip / Next Match
  const handleNextMatch = async () => {
    if (isDisconnecting.current) return
    isDisconnecting.current = true

    if (matchRoomId) {
      try {
        const roomRef = doc(db, 'rooms', matchRoomId)
        await updateDoc(roomRef, { status: 'disconnected' })
      } catch (err) {
        console.error("Error setting disconnected status on next match:", err)
      }
    }

    cleanupWebRTC()
    setMatchRoomId(null)
    setMatchRole(null)
    setCurrentPage('matching')
  }

  // End Session
  const handleEndSession = async () => {
    if (isDisconnecting.current) return
    isDisconnecting.current = true

    if (matchRoomId) {
      try {
        const roomRef = doc(db, 'rooms', matchRoomId)
        await updateDoc(roomRef, { status: 'disconnected' })
      } catch (err) {
        console.error("Error setting disconnected status on end session:", err)
      }
    }

    cleanupWebRTC()
    setMatchRoomId(null)
    setMatchRole(null)
    setCurrentPage('landing')
  }

  const cleanupWebRTC = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }
    stopCamera()
    setRemoteStream(null)
  }

  // Submit Report
  const handleSendReport = async (e) => {
    e.preventDefault()
    if (!reportReason) return

    // Save block document: users/{myUid}/blocks/{partnerUid}
    if (user?.uid && partnerUid) {
      try {
        const blockRef = doc(db, 'users', user.uid, 'blocks', partnerUid)
        await setDoc(blockRef, {
          name: partnerInfo.name,
          avatar: partnerInfo.avatar,
          flag: partnerInfo.flag,
          reason: reportReason,
          createdAt: serverTimestamp()
        })
      } catch (err) {
        console.error("Error persisting block in Firestore:", err)
      }
    }

    setIsReportOpen(false)
    setReportReason('')
    
    // Show premium block notification
    setToastMessage(`Reported & blocked ${partnerInfo.name} successfully. Matching next...`)
    setTimeout(() => setToastMessage(''), 4000)

    // Mark room as disconnected and find next
    await handleNextMatch()
  }

  return (
    <div className="relative w-full h-screen bg-[#0A0A0F] overflow-hidden flex flex-col md:flex-row">
      
      {/* 1. Main Viewport Area (Takes full screen) */}
      <div className="relative flex-1 h-full flex flex-col">
        
        {/* Remote Video Feed */}
        <div className="absolute inset-0 z-0 bg-[#07070B] overflow-hidden">
          <video 
            ref={remoteVideoRef}
            autoPlay 
            playsInline
            className="w-full h-full object-cover scale-105"
          />

          {/* Partner Camera-off overlay */}
          {connectionState === 'connected' && !partnerCameraOn && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#07070B] z-10 gap-5 animate-fade-in">
              <Particles
                className="absolute inset-0 z-0"
                quantity={60}
                ease={50}
                color="#ec4899"
                refresh
              />
              <div className="relative z-10 w-24 h-24 rounded-full bg-purple-900/30 border-2 border-white/10 flex items-center justify-center overflow-hidden shadow-2xl animate-pulse">
                <img 
                  src={partnerInfo.avatar} 
                  alt={partnerInfo.name} 
                  className="w-16 h-16"
                />
              </div>
              <span className="text-sm font-semibold tracking-wider text-white/80 z-10 uppercase animate-pulse">
                {partnerInfo.name} turned off camera
              </span>
            </div>
          )}

          {/* Partner Mic muted indicator */}
          {connectionState === 'connected' && !partnerMicOn && (
            <div className="absolute top-20 right-6 z-10 bg-danger/20 border border-danger/40 backdrop-blur-md px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-danger animate-pulse"></span>
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">Partner Muted</span>
            </div>
          )}

          {/* Connection state overlay */}
          {connectionState !== 'connected' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#07070B]/90 z-10 gap-4">
              <Particles
                className="absolute inset-0 z-0"
                quantity={80}
                ease={60}
                color="#a855f7"
                refresh
              />
              <div className="w-12 h-12 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin z-10"></div>
              <span className="text-xs font-bold tracking-wider text-textMuted uppercase animate-pulse z-10">
                {connectionState === 'checking' || connectionState === 'connecting'
                  ? 'Connecting to peer...'
                  : 'Establishing media stream...'}
              </span>
            </div>
          )}

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
        <div className="absolute top-20 left-6 z-10 animate-fade-up flex items-center gap-3">
          <div className="glass-panel px-4 py-2.5 flex items-center gap-3 bg-black/45 border-white/5 shadow-lg">
            <span className="text-lg">{partnerInfo.flag}</span>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-white leading-tight">
                {partnerInfo.name}
              </span>
              <span className="text-[10px] text-textMuted font-medium leading-none mt-0.5">
                {partnerInfo.city}{partnerInfo.country ? `, ${partnerInfo.country}` : ''}
              </span>
            </div>
            <div className="h-6 w-[1px] bg-white/10 mx-1"></div>
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-accentSecondary">
              <span className="h-2 w-2 rounded-full bg-pink-500 animate-pulse"></span>
              {formatTime(timeConnected)}
            </div>
          </div>

          {/* Latency Indicator Badge */}
          {connectionState === 'connected' && (
            <div className="glass-panel px-3 py-2 flex items-center gap-2 bg-black/45 border-white/5 shadow-lg text-xs font-semibold animate-fade-in">
              <span className={`w-2 h-2 rounded-full ${
                latency === null ? 'bg-gray-500' :
                latency < 80 ? 'bg-green-500 animate-pulse' :
                latency < 180 ? 'bg-yellow-500 animate-pulse' :
                'bg-red-500 animate-pulse'
              }`}></span>
              <span className="text-[10px] uppercase font-bold text-white/90">
                {latency === null ? 'Syncing...' : `${latency}ms · ${
                  latency < 80 ? 'Excellent' :
                  latency < 180 ? 'Good' :
                  'Poor'
                }`}
              </span>
            </div>
          )}
        </div>

        {/* 4. Local Camera Feed (Floating Bottom-Right Card) */}
        <div className="absolute bottom-36 right-6 md:bottom-32 md:right-8 z-20 w-[140px] h-[105px] md:w-[200px] md:h-[150px] rounded-2xl overflow-hidden glass-panel border-2 border-white/15 shadow-2xl flex items-center justify-center bg-black/60 transition-all hover:scale-105 duration-200">
          <BorderBeam size={60} duration={4} colorFrom="#A855F7" colorTo="#06B6D4" />
          {isCameraOn && !cameraError ? (
            <video 
              ref={localVideoRef} 
              autoPlay 
              muted 
              playsInline 
              className={`w-full h-full object-cover rounded-xl transition-all duration-300 ${
                FILTERS.find(f => f.id === selectedFilter)?.class || ''
              }`}
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-1 text-center w-full h-full">
              <div className="w-10 h-10 rounded-full bg-purple-900/30 border border-white/10 flex items-center justify-center">
                <span className="text-sm">📸</span>
              </div>
              <span className="text-[9px] font-bold text-textMuted uppercase tracking-wider">Camera Off</span>
            </div>
          )}

          {/* Local Mic Muted Overlay */}
          {!isMicOn && (
            <div className="absolute top-2 right-2 bg-danger/80 backdrop-blur-sm p-1 rounded-full text-[9px] text-white">
              🎙️
            </div>
          )}

          {/* Tag */}
          <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-bold text-white border border-white/5">
            You
          </div>
        </div>

        {/* Visual Filters Selector Dock */}
        {connectionState === 'connected' && (
          <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 w-full max-w-xs px-2 flex justify-center animate-fade-in">
            <div className="glass-panel px-3 py-2 bg-black/60 border-white/5 shadow-2xl rounded-full flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-[280px]">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFilter(f.id)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-200 shrink-0 ${
                    selectedFilter === f.id
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 5. Center Bottom Controls Bar */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-full max-w-sm px-4">
          <div className="glass-panel px-5 py-4 flex items-center justify-between gap-4 bg-black/55 border-white/10 shadow-2xl rounded-full overflow-hidden relative">
            <BorderBeam size={100} duration={8} colorFrom="#A855F7" colorTo="#EC4899" />
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
              src={partnerInfo.avatar} 
              alt="Avatar" 
              className="w-8 h-8 rounded-full bg-purple-900 border border-white/20" 
            />
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold text-white leading-tight">{partnerInfo.name}</span>
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
            messages.map((msg) => (
              <div 
                key={msg.id} 
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
