import React, { useState, useEffect, useRef } from 'react'
import { Particles } from '../components/magicui/Particles.jsx'
import { BorderBeam } from '../components/magicui/BorderBeam.jsx'
import { db } from '../firebase.js'
import { 
  collection, 
  query, 
  where, 
  limit, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  serverTimestamp,
  runTransaction
} from 'firebase/firestore'

const CITIES = [
  { city: 'Tokyo', country: 'Japan', flag: '🇯🇵' },
  { city: 'London', country: 'United Kingdom', flag: '🇬🇧' },
  { city: 'Paris', country: 'France', flag: '🇫🇷' },
  { city: 'New York', country: 'United States', flag: '🇺🇸' },
  { city: 'Berlin', country: 'Germany', flag: '🇩🇪' },
  { city: 'Sydney', country: 'Australia', flag: '🇦🇺' },
  { city: 'Rio de Janeiro', country: 'Brazil', flag: '🇧🇷' },
  { city: 'Toronto', country: 'Canada', flag: '🇨🇦' },
  { city: 'Mumbai', country: 'India', flag: '🇮🇳' },
  { city: 'Cape Town', country: 'South Africa', flag: '🇿🇦' }
]

const getMockLocation = (seed) => {
  let hash = 0
  const str = seed || 'guest'
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const idx = Math.abs(hash) % CITIES.length
  return CITIES[idx]
}

export default function MatchingPage({ setCurrentPage, user, onlineCount, setMatchRoomId, setMatchRole }) {
  // Matching Preferences States
  const [isQueueing, setIsQueueing] = useState(false)
  const [prefCountry, setPrefCountry] = useState('any')
  const [prefLanguage, setPrefLanguage] = useState('any')
  const [strictMatching, setStrictMatching] = useState(false)
  const [selectedTags, setSelectedTags] = useState([])

  // Queue Status States
  const [statusText, setStatusText] = useState('Connecting to matchmaker server...')
  const [subText, setSubText] = useState('Initializing encrypted peer handshake...')
  
  const activeRoomRef = useRef(null)
  const isMatchSuccessful = useRef(false)

  useEffect(() => {
    if (!isQueueing) return

    let isMounted = true
    let unsubscribeSnapshot = null

    async function startMatchmaking() {
      try {
        if (!isMounted) return

        // Step 1: Connecting phase delay for stabilization
        setStatusText('Connecting to matchmaker server...')
        setSubText('Initializing encrypted peer handshake...')
        await new Promise(resolve => setTimeout(resolve, 800))
        if (!isMounted) return

        setStatusText('Filtering active online users...')
        setSubText('Selecting optimal latency connection...')
        await new Promise(resolve => setTimeout(resolve, 600))
        if (!isMounted) return

        // Get user profile location
        const myLoc = getMockLocation(user?.email || user?.uid || 'guest')

        // Fetch list of blocked users
        const blocksCol = collection(db, 'users', user?.uid || 'guest', 'blocks')
        const blocksSnapshot = await getDocs(blocksCol)
        const blockedUids = []
        blocksSnapshot.forEach(docSnap => {
          blockedUids.push(docSnap.id)
        })

        // Step 2: Query for waiting rooms created by other users
        let q = query(
          collection(db, 'rooms'),
          where('status', '==', 'waiting')
        )

        // Strict query filters
        if (prefLanguage !== 'any') {
          q = query(q, where('creatorLanguage', '==', prefLanguage))
        }
        if (prefCountry !== 'any') {
          q = query(q, where('creatorCountry', '==', prefCountry))
        }

        const querySnapshot = await getDocs(q)
        if (!isMounted) return

        const candidates = []
        for (const roomDoc of querySnapshot.docs) {
          const roomData = roomDoc.data()
          
          // Filter 1: Check block list (ensure we haven't blocked the creator)
          if (blockedUids.includes(roomData.creatorId)) continue
          
          // Filter 2: Shared interests matching
          const creatorTags = roomData.creatorInterests || []
          const intersection = selectedTags.filter(tag => creatorTags.includes(tag))
          
          // If strict interest tags are selected, skip if zero overlap
          if (strictMatching && selectedTags.length > 0 && intersection.length === 0) {
            continue
          }

          candidates.push({
            id: roomDoc.id,
            ref: roomDoc.ref,
            score: intersection.length, // Overlap count for ranking
            creatorId: roomData.creatorId
          })
        }

        // Rank candidate rooms by number of matching interests (descending)
        candidates.sort((a, b) => b.score - a.score)

        let matchedRoomId = null

        // Try to join rooms in prioritised order
        for (const candidate of candidates) {
          const roomRef = doc(db, 'rooms', candidate.id)
          try {
            const joined = await runTransaction(db, async (transaction) => {
              const freshDoc = await transaction.get(roomRef)
              if (!freshDoc.exists()) return false
              
              const roomData = freshDoc.data()
              if (roomData.status !== 'waiting') return false

              // Safety check: Check if creator blocked callee (us)
              const creatorBlockRef = doc(db, 'users', roomData.creatorId, 'blocks', user?.uid || 'guest')
              const creatorBlockSnap = await transaction.get(creatorBlockRef)
              if (creatorBlockSnap.exists()) {
                return false // Abandon join - creator has blocked callee
              }

              transaction.update(roomRef, {
                peerId: user?.uid || 'guest_' + Math.random().toString(36).substring(7),
                peerName: user?.name || 'Guest',
                peerAvatar: user?.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=Guest_${Math.random()}`,
                peerFlag: myLoc.flag,
                peerInfo: { city: myLoc.city, country: myLoc.country },
                peerMicOn: true,
                peerCameraOn: true,
                status: 'connected'
              })
              return true
            })

            if (joined) {
              matchedRoomId = candidate.id
              break
            }
          } catch (txErr) {
            console.warn('Transaction failed for room', candidate.id, txErr)
          }
        }

        if (!isMounted) return

        if (matchedRoomId) {
          // Joined as Callee!
          isMatchSuccessful.current = true
          setMatchRoomId(matchedRoomId)
          setMatchRole('callee')
          
          setStatusText('Match found! Handshaking WebRTC...')
          setSubText('Establishing direct peer stream connection...')
          await new Promise(resolve => setTimeout(resolve, 600))
          
          if (isMounted) {
            setCurrentPage('chat')
          }
        } else {
          // No suitable room found, create one as Caller
          const newRoomRef = doc(collection(db, 'rooms'))
          activeRoomRef.current = newRoomRef

          await setDoc(newRoomRef, {
            status: 'waiting',
            creatorId: user?.uid || 'guest_' + Math.random().toString(36).substring(7),
            creatorName: user?.name || 'Guest',
            creatorAvatar: user?.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=Guest_${Math.random()}`,
            creatorFlag: myLoc.flag,
            creatorInfo: { city: myLoc.city, country: myLoc.country },
            creatorLanguage: prefLanguage,
            creatorCountry: prefCountry,
            creatorInterests: selectedTags,
            creatorMicOn: true,
            creatorCameraOn: true,
            createdAt: serverTimestamp()
          })

          if (!isMounted) {
            await deleteDoc(newRoomRef)
            return
          }

          setMatchRoomId(newRoomRef.id)
          setMatchRole('caller')
          setStatusText('Waiting for a partner...')
          setSubText('Creating secure room queue · Usually under 10 seconds')

          // Listen for a peer to join
          unsubscribeSnapshot = onSnapshot(newRoomRef, async (snapshot) => {
            if (snapshot.exists() && isMounted) {
              const data = snapshot.data()
              if (data.status === 'connected' && data.peerId) {
                isMatchSuccessful.current = true
                setStatusText('Match found! Handshaking WebRTC...')
                setSubText(`Connecting to peer in ${data.peerInfo?.city || 'another city'}...`)
                
                await new Promise(resolve => setTimeout(resolve, 600))
                if (isMounted) {
                  setCurrentPage('chat')
                }
              }
            }
          })
        }
      } catch (err) {
        console.error('Matchmaking error:', err)
        setStatusText('Matchmaking failed')
        setSubText(err.message || 'An unexpected database error occurred.')
      }
    }

    startMatchmaking()

    return () => {
      isMounted = false
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot()
      }
      // Clean up waiting room if matching is interrupted
      if (!isMatchSuccessful.current && activeRoomRef.current) {
        deleteDoc(activeRoomRef.current).catch(err => {
          console.error('Failed to delete stale room on cleanup:', err)
        })
      }
    }
  }, [isQueueing, setCurrentPage, user, setMatchRoomId, setMatchRole, prefCountry, prefLanguage, strictMatching, selectedTags])

  const handleCancel = () => {
    setIsQueueing(false)
  }

  // Preferences UI (if not matching/queueing yet)
  if (!isQueueing) {
    return (
      <div className="relative w-full min-h-screen bg-bgBase flex flex-col items-center justify-center px-4 py-20 overflow-y-auto">
        {/* Background Radial Glow */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.08),transparent_70%)]"></div>
        </div>

        <Particles
          className="absolute inset-0 z-0"
          quantity={120}
          ease={70}
          color="#a855f7"
          refresh
        />

        <div className="relative z-10 w-full max-w-lg animate-fade-up">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2 font-display">
              Match <span className="text-gradient">Preferences</span>
            </h1>
            <p className="text-sm text-textMuted max-w-sm mx-auto leading-relaxed">
              Filter who you connect with by region, language, and shared interests.
            </p>
          </div>

          {/* Preferences Card */}
          <div className="glass-panel p-6 md:p-8 bg-white/[0.03] border-white/10 shadow-2xl flex flex-col gap-6 overflow-hidden relative">
            <BorderBeam size={150} duration={10} colorFrom="#A855F7" colorTo="#EC4899" />
            
            {/* Country/Region Filter */}
            <div className="flex flex-col gap-2.5 text-left">
              <label className="text-xs font-bold text-textMuted uppercase tracking-wider">Region / Country</label>
              <select 
                value={prefCountry}
                onChange={(e) => setPrefCountry(e.target.value)}
                className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accentPrimary"
              >
                <option value="any">🌍 Any Country (Global)</option>
                <option value="US">🇺🇸 United States</option>
                <option value="JP">🇯🇵 Japan</option>
                <option value="GB">🇬🇧 United Kingdom</option>
                <option value="FR">🇫🇷 France</option>
                <option value="BR">🇧🇷 Brazil</option>
                <option value="IN">🇮🇳 India</option>
              </select>
            </div>

            {/* Language Filter */}
            <div className="flex flex-col gap-2.5 text-left">
              <label className="text-xs font-bold text-textMuted uppercase tracking-wider">Preferred Language</label>
              <select 
                value={prefLanguage}
                onChange={(e) => setPrefLanguage(e.target.value)}
                className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accentPrimary"
              >
                <option value="any">💬 Any Language</option>
                <option value="en">🇺🇸 English</option>
                <option value="es">🇪🇸 Spanish</option>
                <option value="ja">🇯🇵 Japanese</option>
                <option value="fr">🇫🇷 French</option>
                <option value="pt">🇧🇷 Portuguese</option>
              </select>
            </div>

            {/* Interest Tags */}
            <div className="flex flex-col gap-2.5 text-left">
              <label className="text-xs font-bold text-textMuted uppercase tracking-wider">Match by Interests</label>
              <div className="flex flex-wrap gap-2">
                {['Gaming', 'Music', 'Art', 'Coding', 'Movies', 'Sports', 'Travel', 'Food'].map(tag => {
                  const isSelected = selectedTags.includes(tag)
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedTags(prev => prev.filter(t => t !== tag))
                        } else {
                          setSelectedTags(prev => [...prev, tag])
                        }
                      }}
                      className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all active:scale-95 ${
                        isSelected 
                          ? 'bg-gradient-to-r from-accentPrimary to-accentSecondary border-transparent text-white shadow-md' 
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {tag}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Strict tag matching toggle */}
            {selectedTags.length > 0 && (
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-white">Strict Interest Matching</span>
                  <span className="text-[10px] text-textMuted leading-tight mt-0.5">Only connect with partners who share at least one tag.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStrictMatching(!strictMatching)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    strictMatching ? 'bg-accentPrimary' : 'bg-white/10'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      strictMatching ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            )}

            {/* Start Chatting Button */}
            <button
              onClick={() => setIsQueueing(true)}
              className="w-full btn-gradient py-3.5 px-6 rounded-full text-white text-sm font-semibold tracking-wide uppercase mt-4 shadow-lg active:scale-95 duration-200 flex items-center justify-center gap-2"
            >
              Start Matching ⏭
            </button>

            {/* Back Button */}
            <button
              onClick={() => setCurrentPage('landing')}
              className="text-xs font-semibold text-textMuted hover:text-white transition-colors duration-200 mt-2"
            >
              Back to Home
            </button>

          </div>
        </div>
      </div>
    )
  }

  // Matching Queue/Loader UI (if isQueueing is true)
  return (
    <div className="relative w-full min-h-screen bg-bgBase flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(236,72,153,0.06),transparent_70%)]"></div>
      </div>

      <Particles
        className="absolute inset-0 z-0"
        quantity={150}
        ease={50}
        color="#ec4899"
        refresh
      />

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

        {/* Online Indicator */}
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
