import React, { useState, useEffect } from 'react'
import { db } from '../firebase.js'
import {
  doc,
  updateDoc,
  collection,
  onSnapshot,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore'
import { Particles } from '../components/magicui/Particles.jsx'
import { BorderBeam } from '../components/magicui/BorderBeam.jsx'
import { AnimatedShinyText } from '../components/magicui/AnimatedShinyText.jsx'
import { 
  ArrowLeft, 
  User, 
  Shuffle, 
  Save, 
  Unlock, 
  AlertCircle, 
  UserMinus, 
  Globe 
} from 'lucide-react'

export default function ProfilePage({ setCurrentPage, user, setUser }) {
  const [displayName, setDisplayName] = useState(user?.name || '')
  
  // Extract seed from existing URL if possible
  const getInitialSeed = () => {
    if (!user?.avatarUrl) return Math.random().toString(36).substring(7)
    const match = user.avatarUrl.match(/seed=([^&]+)/)
    return match ? decodeURIComponent(match[1]) : Math.random().toString(36).substring(7)
  }
  
  const [avatarSeed, setAvatarSeed] = useState(getInitialSeed())
  const [isSaving, setIsSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [blockedUsers, setBlockedUsers] = useState([])
  const [blocksLoading, setBlocksLoading] = useState(true)

  // Real-time listener for blocked users
  useEffect(() => {
    if (!user?.uid) return

    setBlocksLoading(true)
    const blocksColRef = collection(db, 'users', user.uid, 'blocks')
    
    const unsubscribe = onSnapshot(blocksColRef, (snapshot) => {
      const list = []
      snapshot.forEach((doc) => {
        list.push({
          uid: doc.id,
          ...doc.data()
        })
      })
      setBlockedUsers(list)
      setBlocksLoading(false)
    }, (error) => {
      console.error("Error loading blocked users list: ", error)
      setBlocksLoading(false)
    })

    return () => unsubscribe()
  }, [user?.uid])

  // Randomize Avatar Seed
  const handleRandomizeAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(2, 9)
    setAvatarSeed(randomSeed)
  }

  // Save changes to Firestore
  const handleSaveChanges = async (e) => {
    e.preventDefault()
    if (!displayName.trim()) {
      showToast('Display name cannot be empty')
      return
    }

    setIsSaving(true)
    try {
      const userRef = doc(db, 'users', user.uid)
      const newAvatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(avatarSeed)}`
      
      const updateData = {
        name: displayName.trim(),
        avatarUrl: newAvatarUrl,
        updatedAt: serverTimestamp()
      }

      await updateDoc(userRef, updateData)
      
      // Update global context state
      setUser((prev) => ({
        ...prev,
        name: displayName.trim(),
        avatarUrl: newAvatarUrl
      }))

      showToast('Profile updated successfully!')
    } catch (err) {
      console.error("Error updating profile in Firestore: ", err)
      showToast('Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  // Unblock a user
  const handleUnblockUser = async (blockedUid, blockedName) => {
    if (!user?.uid) return
    try {
      const blockDocRef = doc(db, 'users', user.uid, 'blocks', blockedUid)
      await deleteDoc(blockDocRef)
      showToast(`Unblocked ${blockedName} successfully.`)
    } catch (err) {
      console.error("Error deleting block document: ", err)
      showToast('Failed to unblock user. Please try again.')
    }
  }

  // Toast Trigger Helper
  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 4000)
  }

  // Format timestamp helper
  const formatBlockDate = (timestamp) => {
    if (!timestamp) return 'Just now'
    const date = timestamp.toDate()
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const currentPreviewUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(avatarSeed)}`

  return (
    <div className="relative min-h-screen w-full bg-[#0A0A0F] pt-28 pb-16 px-6 overflow-hidden flex flex-col items-center">
      
      {/* Background radial gradients */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.1),transparent_70%)]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(236,72,153,0.08),transparent_70%)]"></div>
      </div>

      <Particles
        className="absolute inset-0 z-0"
        quantity={120}
        ease={70}
        color="#a855f7"
        refresh
      />

      {/* Floating toast notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="glass-panel px-6 py-3 bg-purple-950/80 border-purple-500/30 text-white rounded-full flex items-center gap-2.5 shadow-2xl text-sm font-semibold">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping"></span>
            {toastMessage}
          </div>
        </div>
      )}

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-4xl animate-fade-up">
        {/* Back Link */}
        <button 
          onClick={() => setCurrentPage('matching')}
          className="group flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-textMuted hover:text-white mb-6 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 duration-200" />
          Back to Matching
        </button>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-display text-white tracking-tight mb-2">
              Profile <span className="text-gradient">Settings</span>
            </h1>
            <p className="text-sm text-textMuted">
              Manage your display identity, customize your avatar, and manage block lists.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-pink-500/30 bg-pink-500/5 select-none self-start md:self-auto">
            <AnimatedShinyText className="text-[10px] font-bold uppercase tracking-wider">
              ⚙️ Account Operations
            </AnimatedShinyText>
          </div>
        </div>

        {/* Columns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Column Left: Edit Profile (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="glass-panel p-6 md:p-8 bg-white/[0.02] border-white/10 shadow-2xl rounded-3xl overflow-hidden relative">
              <BorderBeam size={160} duration={8} colorFrom="#A855F7" colorTo="#EC4899" />
              
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
                <User className="w-5 h-5 text-purple-400" />
                Identity Customizer
              </h2>

              <form onSubmit={handleSaveChanges} className="flex flex-col gap-6">
                
                {/* Avatar Preview & Editing Controls */}
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  
                  {/* Live SVG Preview Box */}
                  <div className="relative w-28 h-28 rounded-2xl bg-gradient-to-tr from-purple-950/40 to-pink-950/40 border-2 border-white/15 shadow-2xl flex items-center justify-center overflow-hidden shrink-0 group">
                    <img 
                      src={currentPreviewUrl} 
                      alt="Avatar Live Preview" 
                      className="w-20 h-20 transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                      <span className="text-[10px] font-bold tracking-wider text-white uppercase">Preview</span>
                    </div>
                  </div>

                  {/* Seed Input Controls */}
                  <div className="flex-1 flex flex-col gap-2 w-full">
                    <label className="text-[10px] font-bold text-textMuted uppercase tracking-wider text-left">
                      Avatar Custom Seed
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={avatarSeed}
                        onChange={(e) => setAvatarSeed(e.target.value)}
                        placeholder="Type something to change avatar..."
                        className="flex-1 bg-[#1A1A2E] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-500 transition-colors duration-200"
                      />
                      <button
                        type="button"
                        onClick={handleRandomizeAvatar}
                        className="px-4 py-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/20 active:scale-95 transition-all duration-200 flex items-center gap-1.5"
                        title="Randomize Avatar Seed"
                      >
                        <Shuffle className="w-4 h-4" />
                        <span className="hidden sm:inline text-xs font-semibold">Shuffle</span>
                      </button>
                    </div>
                    <span className="text-[10px] text-textMuted text-left mt-0.5">
                      We render a dynamic, beautiful avatar instantly using DiceBear Adventurer.
                    </span>
                  </div>
                </div>

                {/* Display Name Input */}
                <div className="flex flex-col gap-2 text-left">
                  <label className="text-[10px] font-bold text-textMuted uppercase tracking-wider">
                    Display Name
                  </label>
                  <input 
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name..."
                    required
                    maxLength={20}
                    className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-500 transition-colors duration-200"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full btn-gradient py-3.5 px-6 rounded-full text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:shadow-purple-500/20 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isSaving ? 'Saving Changes...' : 'Save Profile Details'}
                </button>

              </form>
            </div>
          </div>

          {/* Column Right: Block Management (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="glass-panel p-6 bg-white/[0.02] border-white/10 shadow-2xl rounded-3xl min-h-[380px] flex flex-col">
              
              <h2 className="text-sm font-bold text-white mb-5 flex items-center gap-2 border-b border-white/5 pb-4">
                <AlertCircle className="w-4.5 h-4.5 text-danger" />
                Blocked Users ({blockedUsers.length})
              </h2>

              {/* Block List Content */}
              <div className="flex-1 flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
                {blocksLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-2 text-textMuted py-8">
                    <div className="w-6 h-6 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin"></div>
                    <span className="text-xs uppercase tracking-wider font-semibold animate-pulse">Loading blocks...</span>
                  </div>
                ) : blockedUsers.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[#131322]/30 border border-white/5 rounded-2xl py-12">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3">
                      <Unlock className="w-5 h-5 text-textMuted" />
                    </div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider mb-1">Block List Empty</span>
                    <p className="text-[11px] text-textMuted max-w-[200px]">
                      Users you report or block will be displayed here for management.
                    </p>
                  </div>
                ) : (
                  blockedUsers.map((item) => (
                    <div 
                      key={item.uid}
                      className="glass-panel px-4 py-3 bg-white/[0.01] hover:bg-white/[0.03] border-white/5 rounded-2xl flex items-center justify-between gap-3 transition-colors duration-200"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-xl bg-purple-900/30 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                          <img 
                            src={item.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${item.name}`} 
                            alt={item.name} 
                            className="w-7 h-7"
                          />
                        </div>
                        
                        {/* Info */}
                        <div className="text-left min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white truncate max-w-[100px]">{item.name}</span>
                            <span className="text-[10px] select-none" title="Location Flag">{item.flag || '🌍'}</span>
                          </div>
                          <div className="text-[9px] text-textMuted truncate max-w-[120px]" title={`Reason: ${item.reason || 'Reported'}`}>
                            Reason: {item.reason || 'N/A'}
                          </div>
                          <div className="text-[8px] text-textMuted/60 mt-0.5">
                            Blocked on {formatBlockDate(item.createdAt)}
                          </div>
                        </div>
                      </div>

                      {/* Action */}
                      <button
                        onClick={() => handleUnblockUser(item.uid, item.name)}
                        className="px-2.5 py-1.5 bg-danger/10 hover:bg-danger/20 hover:border-danger/30 text-danger rounded-lg border border-danger/15 text-[10px] font-bold uppercase tracking-wider active:scale-95 transition-all duration-200 flex items-center gap-1"
                        title="Unblock User"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                        <span>Unblock</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
