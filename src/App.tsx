import { useEffect, useRef, useState } from 'react'
import logoUrl from '../design/brand/family-circle-logo.png'
import Onboarding from './Onboarding'
import './batch15.css'

type ToolMode = 'emergency' | 'profile' | 'family' | 'games' | 'notifications' | 'settings' | 'map' | 'music'
type HomeTab = 'home' | 'chat' | 'photos' | 'calendar' | 'tasks' | 'shopping'
type StatusOption = 'Home' | 'Work' | 'Partying' | 'Recovering' | 'Playing' | 'Gaming' | 'Toilet 😂' | 'Movies' | 'Sleeping' | 'Gym' | 'Travelling' | 'Holiday' | 'Out & About'
type SocialName = 'Facebook' | 'TikTok' | 'Snapchat' | 'YouTube'
type FamilyMember = { id: string; label: string; initials: string; accent: string; phone: string; bio: string; status: StatusOption; locationLabel: string; lastUpdated: string; mapX: number; mapY: number; photo?: string | null; socials: Record<SocialName, string> }
type ChatMessage = { id: string; memberId: string; name: string; initials: string; accent: string; time: string; text: string; image?: string; moneyRequestId?: string }
type Notification = { id: string; kind: 'Chat' | 'Task' | 'Calendar' | 'Emergency' | 'Profile' | 'Money'; title: string; detail: string; time: string }
type FamilyPhoto = { id: string; src: string; name: string; time: string }
type FamilyEvent = { id: string; title: string; date: string; time: string; location: string }
type FamilyTask = { id: string; title: string; dueDate: string; assignedTo: string; completed: boolean }
type MoneyRequest = { id: string; requesterId: string; amount: string; purpose: string; dueDate: string; status: 'Pending' | 'Accepted'; lenderId?: string; taskId?: string; calendarEventId?: string }
type MusicTrack = { id: string; title: string; artist: string; genre: string; audioSrc: string; artwork?: string; youtubeUrl?: string }

const musicLibrary: MusicTrack[] = []
const musicPlaylists = ['Chilled', 'Hip-Hop', 'R&B', 'Rock', 'Pop', 'Kids / Family']
type EmergencyPending = { title: string; description: string; tone: string; needsLocation: boolean; message?: string }

const statusOptions: StatusOption[] = ['Home', 'Work', 'Partying', 'Recovering', 'Playing', 'Gaming', 'Toilet 😂', 'Movies', 'Sleeping', 'Gym', 'Travelling', 'Holiday', 'Out & About']
const socialNames: SocialName[] = ['Facebook', 'TikTok', 'Snapchat', 'YouTube']
const socialIcons: Record<SocialName, string> = { Facebook: 'f', TikTok: '♪', Snapchat: '👻', YouTube: '▶' }

const memberSeeds: FamilyMember[] = [
  { id: 'member-1', label: 'Family Member 1', initials: 'FM', accent: 'member-accent-one', phone: '+44 7700 900001', bio: 'Keeping the family moving.', status: 'Work', locationLabel: 'Work', lastUpdated: '2 min ago', mapX: 25, mapY: 37, photo: null, socials: { Facebook: '', TikTok: '', Snapchat: '', YouTube: '' } },
  { id: 'member-2', label: 'Family Member 2', initials: 'FM', accent: 'member-accent-two', phone: '+44 7700 900002', bio: 'Home is wherever we are together.', status: 'Home', locationLabel: 'Home', lastUpdated: '4 min ago', mapX: 57, mapY: 61, photo: null, socials: { Facebook: '', TikTok: '', Snapchat: '', YouTube: '' } },
  { id: 'member-3', label: 'Family Member 3', initials: 'FM', accent: 'member-accent-three', phone: '+44 7700 900003', bio: 'Always part of the circle.', status: 'Playing', locationLabel: 'Out & About', lastUpdated: '8 min ago', mapX: 76, mapY: 24, photo: null, socials: { Facebook: '', TikTok: '', Snapchat: '', YouTube: '' } },
]

const initialMessages: ChatMessage[] = [
  { id: 'chat-1', memberId: 'member-1', name: 'Family Member 1', initials: 'FM', accent: 'member-accent-one', time: '19:42', text: "Who's up for takeaway tonight? 🍕" },
  { id: 'chat-2', memberId: 'member-2', name: 'Family Member 2', initials: 'FM', accent: 'member-accent-two', time: '17:15', text: "I'll be home around 6pm." },
  { id: 'chat-3', memberId: 'member-3', name: 'Family Member 3', initials: 'FM', accent: 'member-accent-three', time: '12:03', text: 'Check this out! 📷' },
]

const initialNotifications: Notification[] = [
  { id: 'notification-1', kind: 'Chat', title: 'Family Member 1 sent a message', detail: "Who's up for takeaway tonight? 🍕", time: '2 min ago' },
  { id: 'notification-2', kind: 'Task', title: 'Task update', detail: 'Take bins out is due today.', time: '1 hr ago' },
  { id: 'notification-3', kind: 'Calendar', title: 'Upcoming family event', detail: 'Family Dinner is today at 19:00.', time: 'Today' },
]

function loadMembers() {
  return memberSeeds.map((member) => {
    try {
      const saved = localStorage.getItem(`family-circle-member-${member.id}`)
      return saved ? { ...member, ...JSON.parse(saved) as Partial<FamilyMember> } : member
    } catch {
      return member
    }
  })
}


const familyQuotes = [
  'Family is not just who you live with, it’s who you do life with.',
  'The best moments are the ones we share together.',
  'Home is wherever the people you love are.',
  'Family turns ordinary days into memories.',
  'Together is our favourite place to be.',
  'A family that laughs together creates memories that last.',
  'Small moments with family become the big memories.',
  'Love makes a family, and time makes the memories.',
  'Family is the circle that keeps us connected.',
  'There is always room for one more memory at home.',
  'The greatest adventures are the ones we share.',
  'Family days are made of little moments.',
  'Where there is family, there is always a place to belong.',
  'Life is better when we share it with our family.',
  'Our family story is written one day at a time.',
]

function dailyFamilyQuote() {
  const now = new Date()
  const rollover = new Date(now)
  if (now.getHours() < 6) rollover.setDate(rollover.getDate() - 1)
  const key = Date.UTC(rollover.getFullYear(), rollover.getMonth(), rollover.getDate())
  return familyQuotes[Math.abs(Math.floor(key / 86400000)) % familyQuotes.length]
}

function todayKey() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function formatTime() {
  return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function formatLongDate(key: string) {
  const [year, month, day] = key.split('-').map(Number)
  return new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(year, month - 1, day))
}

function formatBannerDate(key: string) {
  const [year, month, day] = key.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const suffix = day % 100 >= 11 && day % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[day % 10] ?? 'th'
  return {
    weekday: new Intl.DateTimeFormat('en-GB', { weekday: 'long' }).format(date),
    dayMonth: `${day}${suffix} ${new Intl.DateTimeFormat('en-GB', { month: 'long' }).format(date)}`,
    year: String(year),
  }
}

function formatShortDate(key: string) {
  const [year, month, day] = key.split('-').map(Number)
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(year, month - 1, day))
}

function loadReadMessageIds(): Record<string, string[]> {
  try {
    const saved = localStorage.getItem('family-circle-read-messages')
    return saved ? JSON.parse(saved) as Record<string, string[]> : Object.fromEntries(memberSeeds.map((member) => [member.id, initialMessages.map((message) => message.id)]))
  } catch {
    return Object.fromEntries(memberSeeds.map((member) => [member.id, initialMessages.map((message) => message.id)]))
  }
}

function persistReadMessageIds(value: Record<string, string[]>) {
  localStorage.setItem('family-circle-read-messages', JSON.stringify(value))
}

function timeGreeting() {
  const hour = new Date().getHours()
  return hour < 12 ? 'Good morning,' : hour < 18 ? 'Good afternoon,' : 'Good evening,'
}

function AppAvatar({ member, className = '' }: { member: FamilyMember; className?: string }) {
  return member.photo ? <img className={`fc-avatar ${className}`} src={member.photo} alt={`${member.label} profile`} /> : <span className={`fc-avatar ${member.accent} ${className}`}>{member.initials}</span>
}

function FeatureHeader({ title, description, onHome }: { title: string; description: string; onHome: () => void }) {
  const accent = title.includes('Emergency') ? 'emergency' : title.includes('Shopping') || title.includes('Weekly Shop') ? 'shopping' : title.includes('Chat') ? 'pink' : title.includes('Calendar') ? 'purple' : title.includes('Tasks') ? 'green' : title.includes('Photos') ? 'cyan' : title.includes('Where Is') ? 'cyan' : title.includes('Family Members') ? 'purple' : 'purple'
  return <div className={`fc-feature-header ${accent}`}><div><p className="fc-kicker">Family Circle</p><h1>{title}</h1><p className="fc-muted">{description}</p></div><button className="fc-ghost-button" type="button" onClick={onHome}>← Home</button></div>
}

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [onboardingView, setOnboardingView] = useState<'splash' | 'families'>('splash')
  const [screen, setScreen] = useState<'members' | 'home'>('members')
  const [selectedMemberId, setSelectedMemberId] = useState<string>(memberSeeds[0].id)
  const [members, setMembers] = useState<FamilyMember[]>(loadMembers)
  const [pinOpen, setPinOpen] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [activeTab, setActiveTab] = useState<HomeTab>('home')
  const [toolMode, setToolMode] = useState<ToolMode | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [photos, setPhotos] = useState<FamilyPhoto[]>([])
  const [pendingChatPhoto, setPendingChatPhoto] = useState<string | null>(null)
  const [chatDraft, setChatDraft] = useState('')
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [events, setEvents] = useState<FamilyEvent[]>([
    { id: 'event-1', title: 'Family Dinner', date: todayKey(), time: '19:00', location: 'At Home' },
    { id: 'event-2', title: 'Football Training', date: todayKey(), time: '17:00', location: 'Leisure Centre' },
    { id: 'event-3', title: 'Weekly Food Shop', date: (() => { const d = new Date(); d.setDate(d.getDate() + 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` })(), time: '18:00', location: 'Supermarket' },
  ])
  const [tasks, setTasks] = useState<FamilyTask[]>([
    { id: 'task-1', title: 'Take bins out', dueDate: todayKey(), assignedTo: 'member-2', completed: false },
    { id: 'task-2', title: 'Tidy your room', dueDate: todayKey(), assignedTo: 'member-1', completed: false },
    { id: 'task-3', title: 'Feed the dog', dueDate: (() => { const d = new Date(); d.setDate(d.getDate() + 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` })(), assignedTo: 'member-3', completed: false },
  ])
  const [locationSharing, setLocationSharing] = useState<Record<string, boolean>>({ 'member-1': true, 'member-2': true, 'member-3': false })
  const [locationPermission, setLocationPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown')
  const [profileTargetId, setProfileTargetId] = useState<string>(memberSeeds[0].id)
  const [profileBio, setProfileBio] = useState('')
  const [profileStatus, setProfileStatus] = useState<StatusOption>('Home')
  const [profileSocials, setProfileSocials] = useState<Record<SocialName, string>>({ Facebook: '', TikTok: '', Snapchat: '', YouTube: '' })
  const [profileMessage, setProfileMessage] = useState('')
  const [moneyRequests, setMoneyRequests] = useState<MoneyRequest[]>([])
  const [shoppingItems, setShoppingItems] = useState<string[]>([])
  const [shoppingInput, setShoppingInput] = useState('')
  const [familyShopperIds, setFamilyShopperIds] = useState<string[]>([memberSeeds[0].id, memberSeeds[1].id])
  const [readMessageIdsByMember, setReadMessageIdsByMember] = useState<Record<string, string[]>>(() => loadReadMessageIds())
  const [emergencyView, setEmergencyView] = useState<'main' | 'medical' | 'child' | 'confirm' | 'message' | 'money' | 'sent'>('main')
  const [emergencyPending, setEmergencyPending] = useState<EmergencyPending | null>(null)
  const [emergencyText, setEmergencyText] = useState('')
  const [moneyForm, setMoneyForm] = useState({ amount: '', purpose: '', dueDate: '' })
  const [sentEmergency, setSentEmergency] = useState<{ title: string; coordinates: { latitude: number; longitude: number } | null } | null>(null)
  const [dailyQuote, setDailyQuote] = useState(dailyFamilyQuote)
  const musicAudioRef = useRef<HTMLAudioElement | null>(null)
  const [musicCurrentTrack, setMusicCurrentTrack] = useState<MusicTrack | null>(null)
  const [musicPlaying, setMusicPlaying] = useState(false)
  const [musicCurrentTime, setMusicCurrentTime] = useState(0)
  const [musicDuration, setMusicDuration] = useState(0)

  useEffect(() => {
    const refreshQuote = () => setDailyQuote(dailyFamilyQuote())
    const timer = window.setInterval(refreshQuote, 60 * 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const audio = musicAudioRef.current
    if (!audio || !musicCurrentTrack?.audioSrc) return
    audio.src = musicCurrentTrack.audioSrc
    audio.load()
    if (musicPlaying) void audio.play().catch(() => setMusicPlaying(false))
  }, [musicCurrentTrack])

  function openMusic() {
    setToolMode('music')
    setActiveTab('home')
  }

  function toggleMusicPlayback() {
    const audio = musicAudioRef.current
    if (!musicCurrentTrack?.audioSrc || !audio) return
    if (audio.paused) void audio.play().then(() => setMusicPlaying(true)).catch(() => setMusicPlaying(false))
    else { audio.pause(); setMusicPlaying(false) }
  }

  function selectMusicTrack(track: MusicTrack) {
    setMusicCurrentTrack(track)
    setMusicCurrentTime(0)
    setMusicPlaying(Boolean(track.audioSrc))
  }

  function handleMusicEnded() {
    setMusicPlaying(false)
    setMusicCurrentTime(0)
  }


  const selectedMember = members.find((member) => member.id === selectedMemberId) ?? members[0]
  const profileTarget = members.find((member) => member.id === profileTargetId) ?? selectedMember
  const sharedMembers = members.filter((member) => locationSharing[member.id])
  const todaysEvents = events.filter((event) => event.date === todayKey()).sort((a, b) => a.time.localeCompare(b.time))
  const openTasks = tasks.filter((task) => !task.completed)
  const pendingMoney = moneyRequests.filter((request) => request.status === 'Pending')
  const unreadMessageCount = messages.filter((message) => message.memberId !== selectedMember.id && !readMessageIdsByMember[selectedMember.id]?.includes(message.id)).length

  function completeOnboarding() {
    setShowOnboarding(false)
    setOnboardingView('families')
    setScreen('members')
  }

  function switchFamily() {
    setOnboardingView('families')
    setShowOnboarding(true)
  }

  function persistMember(updated: FamilyMember) {
    setMembers((current) => current.map((member) => member.id === updated.id ? updated : member))
    localStorage.setItem(`family-circle-member-${updated.id}`, JSON.stringify(updated))
  }

  function chooseMember(memberId: string) {
    setSelectedMemberId(memberId)
    setProfileTargetId(memberId)
    setPin('')
    setPinError('')
    setPinOpen(true)
  }

  function submitPin() {
    if (pin.length !== 4) {
      setPinError('Enter all 4 digits to continue.')
      return
    }
    setScreen('home')
    setActiveTab('home')
    setToolMode(null)
    setPinOpen(false)
    setPin('')
  }

  function markMessagesRead(memberId: string) {
    const next = { ...readMessageIdsByMember, [memberId]: messages.map((message) => message.id) }
    setReadMessageIdsByMember(next)
    persistReadMessageIds(next)
  }

  function isMessageUnread(messageId: string, memberId = selectedMember.id) {
    return messages.some((message) => message.id === messageId && message.memberId !== memberId) && !readMessageIdsByMember[memberId]?.includes(messageId)
  }

  function goToTab(tab: HomeTab) {
    setActiveTab(tab)
    setToolMode(null)
    if (tab === 'chat') markMessagesRead(selectedMember.id)
  }

  function openTool(mode: ToolMode) {
    setToolMode(mode)
    setActiveTab('home')
    if (mode === 'profile') openProfile(selectedMember.id)
    if (mode === 'emergency') {
      setEmergencyView('main')
      setEmergencyPending(null)
      setEmergencyText('')
      setSentEmergency(null)
    }
  }

  function openProfile(memberId: string) {
    const target = members.find((member) => member.id === memberId) ?? selectedMember
    setProfileTargetId(target.id)
    setProfileBio(target.bio)
    setProfileStatus(target.status)
    setProfileSocials(target.socials)
    setProfileMessage('')
    setToolMode('profile')
    setActiveTab('home')
  }

  function changeStatus(nextStatus: StatusOption) {
    if (nextStatus === selectedMember.status) return
    const updated = { ...selectedMember, status: nextStatus, locationLabel: nextStatus, lastUpdated: 'just now' }
    persistMember(updated)
    setProfileStatus(nextStatus)
    const now = formatTime()
    setMessages((current) => [{ id: `chat-${Date.now()}`, memberId: updated.id, name: updated.label, initials: updated.initials, accent: updated.accent, time: now, text: `${updated.label} changed their status — 🎬 ${nextStatus}.` }, ...current])
    setNotifications((current) => [{ id: `notification-${Date.now()}`, kind: 'Profile', title: `${updated.label} changed their status`, detail: `Status: ${nextStatus}`, time: 'Now' }, ...current])
  }

  function saveProfile() {
    const bio = profileBio.trim().slice(0, 100)
    const updated = { ...profileTarget, bio, socials: profileSocials }
    persistMember(updated)
    setProfileMessage('Profile details saved.')
  }

  function uploadProfilePhoto(file: File) {
    if (!file.type.startsWith('image/') || profileTarget.id !== selectedMember.id) return
    const reader = new FileReader()
    reader.onload = () => {
      const photo = typeof reader.result === 'string' ? reader.result : ''
      if (!photo) return
      persistMember({ ...selectedMember, photo })
      setProfileMessage('Profile photo updated.')
    }
    reader.readAsDataURL(file)
  }

  function removeProfilePhoto() {
    if (profileTarget.id !== selectedMember.id) return
    persistMember({ ...selectedMember, photo: null })
    setProfileMessage('Profile photo removed.')
  }

  function requestBrowserLocation(callback: (coords: { latitude: number; longitude: number } | null) => void) {
    if (!navigator.geolocation) {
      setLocationPermission('denied')
      callback(null)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationPermission('granted')
        callback({ latitude: position.coords.latitude, longitude: position.coords.longitude })
      },
      () => {
        setLocationPermission('denied')
        callback(null)
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 },
    )
  }

  function postEmergency(pending: EmergencyPending, extraText = '') {
    requestBrowserLocation((coordinates) => {
      const now = formatTime()
      const locationText = coordinates ? ' 📍 Current location shared with the family.' : ' Location unavailable.'
      const combined = `${pending.title}.${extraText ? ` ${extraText}` : ''}${locationText}`
      setMessages((current) => [{ id: `chat-${Date.now()}`, memberId: selectedMember.id, name: selectedMember.label, initials: selectedMember.initials, accent: selectedMember.accent, time: now, text: `🚨 ${combined}` }, ...current])
      setNotifications((current) => [{ id: `notification-${Date.now()}`, kind: 'Emergency', title: `${selectedMember.label}: ${pending.title}`, detail: extraText || pending.description, time: 'Now' }, ...current])
      setSentEmergency({ title: pending.title, coordinates })
      setEmergencyView('sent')
    })
  }

  function triggerEmergency(pending: EmergencyPending, instant = false) {
    setEmergencyPending(pending)
    setEmergencyText('')
    if (instant) postEmergency(pending)
    else setEmergencyView('confirm')
  }

  function sendEmergencyMessage() {
    if (!emergencyText.trim() || !emergencyPending) return
    postEmergency(emergencyPending, emergencyText.trim())
  }

  function submitMoneyRequest() {
    if (!moneyForm.amount.trim() || !moneyForm.purpose.trim() || !moneyForm.dueDate) return
    const request: MoneyRequest = { id: `money-${Date.now()}`, requesterId: selectedMember.id, amount: moneyForm.amount.trim(), purpose: moneyForm.purpose.trim(), dueDate: moneyForm.dueDate, status: 'Pending' }
    setMoneyRequests((current) => [request, ...current])
    setMessages((current) => [{ id: `chat-${Date.now()}`, memberId: selectedMember.id, name: selectedMember.label, initials: selectedMember.initials, accent: selectedMember.accent, time: formatTime(), text: `💷 ${selectedMember.label} needs £${request.amount} for ${request.purpose} until ${formatShortDate(request.dueDate)}.`, moneyRequestId: request.id }, ...current])
    setNotifications((current) => [{ id: `notification-${Date.now()}`, kind: 'Money', title: 'New money request', detail: `${selectedMember.label} requested £${request.amount} for ${request.purpose}.`, time: 'Now' }, ...current])
    setMoneyForm({ amount: '', purpose: '', dueDate: '' })
    setEmergencyView('sent')
    setSentEmergency({ title: 'I Need Money', coordinates: null })
  }

  function addShoppingItem() {
    const item = shoppingInput.trim()
    if (!item) return
    setShoppingItems((current) => [...current, item])
    setShoppingInput('')
  }

  function completeShoppingList() {
    if (!familyShopperIds.includes(selectedMember.id) || shoppingItems.length === 0) return
    setShoppingItems([])
    setNotifications((current) => [{ id: `notification-shopping-${Date.now()}`, kind: 'Task', title: 'Weekly shopping completed', detail: `${selectedMember.label} marked the family shopping list complete.`, time: 'Now' }, ...current])
  }

  function toggleFamilyShopper(memberId: string) {
    setFamilyShopperIds((current) => current.includes(memberId) ? current.filter((id) => id !== memberId) : [...current, memberId])
  }

  function logoutDemo() {
    setShowOnboarding(true)
    setOnboardingView('splash')
    setScreen('members')
    setToolMode(null)
  }

  function leaveFamilyDemo() {
    setShowOnboarding(true)
    setOnboardingView('families')
    setScreen('members')
    setToolMode(null)
  }

  function deleteProfileDemo() {
    if (!window.confirm('Delete this demo family profile from this device?')) return
    localStorage.removeItem(`family-circle-member-${selectedMember.id}`)
    setMembers((current) => current.map((member) => member.id === selectedMember.id ? { ...member, bio: '', photo: null, socials: {} as Record<SocialName, string> } : member))
    logoutDemo()
  }

  function acceptMoneyRequest(id: string) {
    const request = moneyRequests.find((item) => item.id === id)
    if (!request || request.status !== 'Pending' || request.requesterId === selectedMember.id) return

    const lender = selectedMember
    const taskId = `task-money-${Date.now()}`
    const calendarEventId = `event-money-${Date.now()}`
    const requester = members.find((member) => member.id === request.requesterId) ?? selectedMember
    const taskTitle = `Repay £${request.amount} to ${lender.label}`

    setMoneyRequests((current) => current.map((item) => item.id === id ? { ...item, status: 'Accepted', lenderId: lender.id, taskId, calendarEventId } : item))
    setTasks((current) => [{ id: taskId, title: taskTitle, dueDate: request.dueDate, assignedTo: request.requesterId, completed: false }, ...current])
    setEvents((current) => [{ id: calendarEventId, title: `💷 ${taskTitle}`, date: request.dueDate, time: '09:00', location: 'Money repayment' }, ...current])
    setMessages((current) => [{ id: `chat-money-accepted-${Date.now()}`, memberId: lender.id, name: lender.label, initials: lender.initials, accent: lender.accent, time: formatTime(), text: `💷 ${lender.label} accepted the family money request for £${request.amount}. Repayment due ${formatShortDate(request.dueDate)}.` }, ...current])
    setNotifications((current) => [{ id: `notification-money-accepted-${Date.now()}`, kind: 'Money', title: 'Money request accepted', detail: `${lender.label} will cover £${request.amount} for ${request.purpose}. ${requester.label} now has a repayment task due ${formatShortDate(request.dueDate)}.`, time: 'Now' }, ...current])
  }
  function sendChatMessage() {
    if (!chatDraft.trim() && !pendingChatPhoto) return
    const now = formatTime()
    const image = pendingChatPhoto ?? undefined
    const message: ChatMessage = { id: `chat-${Date.now()}`, memberId: selectedMember.id, name: selectedMember.label, initials: selectedMember.initials, accent: selectedMember.accent, time: now, text: chatDraft.trim() || 'Shared a photo', image }
    setMessages((current) => [message, ...current])
    if (image) setPhotos((current) => [{ id: `photo-${Date.now()}`, src: image, name: 'Family photo', time: now }, ...current])
    setChatDraft('')
    setPendingChatPhoto(null)
  }

  function stageChatPhoto(file: File) {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => setPendingChatPhoto(typeof reader.result === 'string' ? reader.result : null)
    reader.readAsDataURL(file)
  }

  function addEvent(title: string, date: string, time: string, location: string) {
    if (!title.trim() || !date || !time) return
    setEvents((current) => [...current, { id: `event-${Date.now()}`, title: title.trim(), date, time, location: location.trim() }])
  }

  function toggleTask(id: string) {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, completed: !task.completed } : task))
  }

  function renderBottomNav() {
    const items: { label: string; icon: string; tab?: HomeTab; tool?: ToolMode; emergency?: boolean }[] = [
      { label: 'Home', icon: '⌂', tab: 'home' },
      { label: 'Chat', icon: '◌', tab: 'chat' },
      { label: 'Photos', icon: '▧', tab: 'photos' },
      { label: 'Emergency', icon: '🚨', tool: 'emergency', emergency: true },
      { label: 'Calendar', icon: '▦', tab: 'calendar' },
      { label: 'Tasks', icon: '✓', tab: 'tasks' },
      { label: 'Where Is Everyone?', icon: '📍', tool: 'map' },
    ]
    return <nav className="fc-bottom-nav" aria-label="Family Circle navigation">{items.map((item) => { const active = item.tool ? toolMode === item.tool : toolMode === null && activeTab === item.tab; return <button className={`fc-nav-item${active ? ' active' : ''}${item.emergency ? ' emergency-nav' : ''}`} type="button" key={item.label} onClick={() => item.tool ? openTool(item.tool) : item.tab && goToTab(item.tab)}><span aria-hidden="true" className="fc-nav-icon">{item.icon}{item.tab === 'chat' && unreadMessageCount > 0 && <b className="fc-nav-unread-dot">{unreadMessageCount > 9 ? '9+' : unreadMessageCount}</b>}</span><small>{item.label}</small></button> })}</nav>
  }

  function renderHome() {
    const firstThreeMessages = messages.slice(0, 3)
    const firstThreeTasks = tasks.slice(0, 3)
    return <div className="fc-page">
      <header className="fc-home-topbar">
        <button className="fc-home-profile" type="button" onClick={() => openProfile(selectedMember.id)}>
          <AppAvatar member={selectedMember} className="fc-home-avatar" />
          <span className="fc-home-profile-copy"><small>{timeGreeting()}</small><strong>{selectedMember.label}</strong><em>{selectedMember.bio || 'No bio yet.'}</em><span>My Status · {selectedMember.status}</span></span>
        </button>
        <div className="fc-home-logo"><img src={logoUrl} alt="Family Circle" /></div>
        <div className="fc-home-actions"><button className="fc-round-button" type="button" onClick={() => openTool('notifications')} aria-label="Notifications">🔔{notifications.length > 0 && <b>{notifications.length}</b>}</button><button className="fc-round-button" type="button" onClick={() => openTool('settings')} aria-label="Settings">⚙️</button></div>
      </header>

      <section className="fc-banner">
        <span className="fc-banner-heart">♡</span>
        <div className="fc-banner-quote"><strong className="fc-quote-text">{dailyQuote}</strong><span>Family Circle · Today</span></div>
        <time className="fc-banner-date">{(() => { const date = formatBannerDate(todayKey()); return <><strong>{date.weekday}</strong><span>{date.dayMonth}</span><small>{date.year}</small></> })()}</time>
      </section>

      <section className="fc-dashboard-grid">
        <article className="fc-dashboard-card cyan"><div className="fc-card-head"><div><small>Family Chat</small><h2>Latest conversation</h2></div><div className="fc-card-head-actions">{unreadMessageCount > 0 && <span className="fc-unread-count">{unreadMessageCount} new</span>}<button type="button" onClick={() => goToTab('chat')}>→</button></div></div>{firstThreeMessages.map((message) => <div className={isMessageUnread(message.id) ? "fc-mini-row fc-unread-row" : "fc-mini-row"} key={message.id}><AppAvatar member={members.find((m) => m.id === message.memberId) ?? selectedMember} /><div><strong>{message.name}</strong><span>{message.text}</span></div><time>{message.time}</time></div>)}<button className="fc-outline-button" type="button" onClick={() => goToTab('chat')}>View All Messages →</button></article>
        <article className="fc-dashboard-card pink"><div className="fc-card-head"><div><small>Today's Events</small><h2>Family plans</h2></div><button type="button" onClick={() => goToTab('calendar')}>→</button></div>{todaysEvents.length ? todaysEvents.slice(0, 3).map((event) => <div className="fc-mini-row" key={event.id}><span className="fc-event-icon">📅</span><div><strong>{event.title}</strong><span>{event.time} · {event.location}</span></div></div>) : <p className="fc-muted">No more events today.</p>}<button className="fc-outline-button pink" type="button" onClick={() => goToTab('calendar')}>View Calendar →</button></article>
        <article className="fc-dashboard-card purple"><div className="fc-card-head"><div><small>Family Memories</small><h2>Latest photo</h2></div><button type="button" onClick={() => goToTab('photos')}>→</button></div>{photos[0] ? <img className="fc-latest-photo" src={photos[0].src} alt="Latest family" /> : <div className="fc-photo-placeholder"><span>▧</span><strong>Moments that matter ♡</strong><small>Send a photo in Family Chat.</small></div>}<button className="fc-outline-button purple" type="button" onClick={() => goToTab('photos')}>Open Photos →</button></article>
        <article className="fc-dashboard-card green"><div className="fc-card-head"><div><small>Family Tasks · {openTasks.length} open</small><h2>Your responsibilities</h2></div><button type="button" onClick={() => goToTab('tasks')}>→</button></div>{firstThreeTasks.map((task) => { const assigned = members.find((m) => m.id === task.assignedTo) ?? selectedMember; return <button className="fc-task-row" type="button" key={task.id} onClick={() => toggleTask(task.id)}><span className={task.completed ? 'fc-check done' : 'fc-check'}>{task.completed ? '✓' : ''}</span><span><strong>{task.title}</strong><small>{task.completed ? 'Completed' : `Due ${formatShortDate(task.dueDate)} · ${assigned.label}`}</small></span></button> })}<button className="fc-outline-button green" type="button" onClick={() => goToTab('tasks')}>View All Tasks →</button></article>
      </section>

      <section className="fc-shopping-dashboard-card">
        <div className="fc-shopping-dashboard-head"><div><small>Family organisation</small><h2>Weekly Shopping List</h2></div><button type="button" onClick={() => goToTab('shopping')}>Open →</button></div>
        <div className="fc-shopping-dashboard-paper">{shoppingItems.length ? shoppingItems.slice(0, 5).map((item, index) => <div className="fc-shopping-dashboard-item" key={`${item}-${index}`}><span>□</span><strong>{item}</strong></div>) : <div className="fc-shopping-dashboard-empty">The list is empty — add something the family needs. 🛒</div>}</div>
        <button className="fc-outline-button shopping" type="button" onClick={() => goToTab('shopping')}>Add to Weekly Shopping List →</button>
      </section>

      <section className="fc-quick-grid" aria-label="Family shortcuts">{[
        { label: 'Chat', desc: 'Message the family', icon: '◌', tone: 'cyan', action: () => goToTab('chat') },
        { label: 'Photos', desc: 'Our memories together', icon: '▧', tone: 'purple', action: () => goToTab('photos') },
        { label: 'Family Emergency', desc: 'Get family help quickly', icon: '!', tone: 'emergency', action: () => openTool('emergency') },
        { label: 'Weekly Shop', desc: 'Add items to the family shop', icon: '🛒', tone: 'shopping', action: () => goToTab('shopping') },
        { label: 'Tasks', desc: 'Jobs & responsibilities', icon: '✓', tone: 'green', action: () => goToTab('tasks') },
        { label: 'Calendar', desc: 'Events & plans', icon: '▦', tone: 'magenta', action: () => goToTab('calendar') },
      ].map((item) => <button className={`fc-quick-tile ${item.tone}`} type="button" key={item.label} onClick={item.action}><span>{item.icon}</span><strong>{item.label}</strong><small>{item.desc}</small></button>)}</section>

      <section className="fc-feature-grid">
        <button className="fc-feature-card map-card" type="button" onClick={() => openTool('map')}><span className="fc-feature-icon">📍</span><div><small>Family location</small><strong>Where Is Everyone?</strong><span>{sharedMembers.length} family member{sharedMembers.length === 1 ? '' : 's'} sharing location</span></div><b>→</b></button>
        <button className="fc-feature-card members-card" type="button" onClick={() => openTool('family')}><span className="fc-feature-icon">👨‍👩‍👧‍👦</span><div><small>Your family</small><strong>Family Members</strong><span>View the family tree and profiles.</span></div><b>→</b></button>
        <button className="fc-feature-card games-card" type="button" onClick={() => openTool('games')}><span className="fc-feature-icon">🎮</span><div><small>Fun together</small><strong>Challenge a Family Member</strong><span>Games hub coming soon.</span></div><b>→</b></button>
        <button className="fc-feature-card music-card" type="button" onClick={openMusic}><span className="fc-feature-icon">♫</span><div><small>Family Circle Music</small><strong>Music for the family</strong><span>Original music, playlists and more.</span></div><b>→</b></button>
      </section>

      {renderBottomNav()}
      <div className="fc-footer"><div className="fc-footer-actions"><button type="button" onClick={() => setScreen('members')}>Switch family member</button><button type="button" onClick={switchFamily}>Switch family</button></div><span>Foundation build</span></div>
    </div>
  }

  function renderChat() {
    return <div className="fc-page"><FeatureHeader title="Family Chat" description="Keep the family conversation together in one private space." onHome={() => goToTab('home')} /><div className="fc-feature-shell"><div className="fc-panel"><div className="fc-panel-head"><div><small>Family conversation</small><h2>Chat</h2></div><span className="fc-pill">Private family space</span></div><div className="fc-chat-list">{messages.map((message) => { const linkedMoneyRequest = message.moneyRequestId ? moneyRequests.find((request) => request.id === message.moneyRequestId) : null; const requester = linkedMoneyRequest ? members.find((member) => member.id === linkedMoneyRequest.requesterId) ?? selectedMember : null; const lender = linkedMoneyRequest?.lenderId ? members.find((member) => member.id === linkedMoneyRequest.lenderId) : null; const unread = isMessageUnread(message.id); return <div className={unread ? "fc-chat-row fc-unread-row" : "fc-chat-row"} key={message.id}><AppAvatar member={members.find((m) => m.id === message.memberId) ?? selectedMember} className="fc-chat-avatar" /><div className="fc-chat-bubble"><div><strong>{message.name}</strong>{unread && <span className="fc-unread-label">NEW</span>}<time>{message.time}</time></div>{linkedMoneyRequest ? <div className="fc-money-chat-card"><div className="fc-money-chat-head"><strong>💷 Money Request</strong><span className={linkedMoneyRequest.status === 'Accepted' ? 'fc-money-chat-status accepted' : 'fc-money-chat-status'}>{linkedMoneyRequest.status === 'Accepted' ? 'Accepted' : 'Awaiting acceptance'}</span></div><strong className="fc-money-chat-amount">£{linkedMoneyRequest.amount}</strong><p>{linkedMoneyRequest.purpose}</p><small>Requested by {requester?.label ?? message.name} · Repayment due {formatLongDate(linkedMoneyRequest.dueDate)}</small>{linkedMoneyRequest.status === 'Accepted' && <small className="fc-money-chat-accepted">✓ Accepted by {lender?.label ?? 'family member'} · Repayment task and calendar event created.</small>}{linkedMoneyRequest.status === 'Pending' && linkedMoneyRequest.requesterId !== selectedMember.id && <button className="fc-money-chat-accept" type="button" onClick={() => acceptMoneyRequest(linkedMoneyRequest.id)}>Accept Request</button>}{linkedMoneyRequest.status === 'Pending' && linkedMoneyRequest.requesterId === selectedMember.id && <small className="fc-money-chat-waiting">Waiting for another family member to accept.</small>}</div> : <><p>{message.text}</p>{message.image && <img src={message.image} alt="Family shared" />}</>}</div></div> })}</div>{pendingChatPhoto && <div className="fc-pending-photo"><img src={pendingChatPhoto} alt="Ready to send" /><button type="button" onClick={() => setPendingChatPhoto(null)}>×</button></div>}<div className="fc-composer"><label className="fc-attach"><input className="fc-hidden" type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) stageChatPhoto(file); event.currentTarget.value = '' }} />＋ Photo</label><input value={chatDraft} onChange={(event) => setChatDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') sendChatMessage() }} placeholder="Write a family message…" /><button type="button" onClick={sendChatMessage}>Send</button></div></div></div>{renderBottomNav()}</div>
  }
  function renderPhotos() {
    return <div className="fc-page"><FeatureHeader title="Recent Photos" description="Photos shared in Family Chat appear here as family memories." onHome={() => goToTab('home')} /><div className="fc-panel"><div className="fc-panel-head"><div><small>Family memories</small><h2>Recent Photos</h2></div><span className="fc-pill">{photos.length} shared</span></div>{photos.length === 0 ? <div className="fc-empty"><span>▧</span><strong>No recent photos yet.</strong><p>Send a photo from Family Chat and it will appear here automatically.</p><button className="fc-primary-button" type="button" onClick={() => goToTab('chat')}>Open Family Chat</button></div> : <div className="fc-photo-grid">{photos.map((photo) => <article key={photo.id}><img src={photo.src} alt={photo.name} /><div><strong>{photo.name}</strong><span>Shared in Family Chat · {photo.time}</span></div></article>)}</div>}</div>{renderBottomNav()}</div>
  }

  function renderCalendar() {
    return <CalendarPanel events={events} onAdd={addEvent} onBack={() => goToTab('home')} onNav={renderBottomNav} />
  }

  function renderTasks() {
    return <div className="fc-page"><FeatureHeader title="Family Tasks" description="Share jobs and responsibilities so everyone knows what needs doing." onHome={() => goToTab('home')} /><div className="fc-two-col"><div className="fc-panel"><div className="fc-panel-head"><div><small>Shared responsibilities</small><h2>Everyone's tasks</h2></div><span className="fc-pill">{tasks.filter((task) => task.completed).length}/{tasks.length} done</span></div><div className="fc-task-detail-list">{tasks.map((task) => { const assigned = members.find((m) => m.id === task.assignedTo) ?? selectedMember; return <button className={task.completed ? 'fc-task-detail done' : 'fc-task-detail'} type="button" key={task.id} onClick={() => toggleTask(task.id)}><span className={task.completed ? 'fc-check done' : 'fc-check'}>{task.completed ? '✓' : ''}</span><div><strong>{task.title}</strong><small>Due {formatLongDate(task.dueDate)} · {assigned.label}</small></div></button> })}</div></div><div className="fc-panel"><div className="fc-panel-head"><div><small>Create responsibility</small><h2>Add a task</h2></div></div><TaskForm members={members} onAdd={(title, dueDate, assignedTo) => setTasks((current) => [...current, { id: `task-${Date.now()}`, title, dueDate, assignedTo, completed: false }])} /><div className="fc-money-box"><div className="fc-panel-head"><div><small>Money requests</small><h2>Who owes who?</h2></div></div>{moneyRequests.length === 0 ? <p className="fc-muted">No family money requests yet.</p> : moneyRequests.map((request) => { const requester = members.find((m) => m.id === request.requesterId) ?? selectedMember; const lender = request.lenderId ? members.find((m) => m.id === request.lenderId) : null; return <div className="fc-money-row" key={request.id}><div><strong>£{request.amount}</strong><span>{request.purpose}</span><small>{request.status === 'Accepted' ? `${requester.label} owes ${lender?.label ?? 'family member'} · due ${formatShortDate(request.dueDate)}` : `${requester.label} requested money · due ${formatShortDate(request.dueDate)}`}</small><small>{request.status === 'Pending' ? 'Awaiting a family member to accept in Family Chat.' : `Repayment task created · due ${formatShortDate(request.dueDate)} · assigned to ${requester.label}.`}</small></div><span className="fc-money-row-status">{request.status}</span></div> })}</div></div></div>{renderBottomNav()}</div>
  }
  function renderEmergency() {
    if (emergencyView === 'sent' && sentEmergency) return <div className="fc-page"><FeatureHeader title="Request Sent" description="Your Family Circle has been updated." onHome={() => openTool('emergency')} /><div className="fc-panel fc-success"><div className="fc-success-icon">✓</div><p className="fc-kicker">Family Emergency</p><h2>{sentEmergency.title}</h2><p className="fc-muted">Your family has been alerted and the request was posted into Family Chat.</p><div className="fc-status-list"><span>✓ Family Chat updated</span><span>✓ Notifications created</span><span>{sentEmergency.coordinates ? '✓ Current location shared' : '• Location unavailable'}</span></div><button className="fc-primary-button" type="button" onClick={() => goToTab('chat')}>Open Family Chat</button></div>{renderBottomNav()}</div>

    if (emergencyView === 'medical') return <div className="fc-page"><FeatureHeader title="Medical Help" description="Choose the type of help you need." onHome={() => openTool('emergency')} /><div className="fc-choice-grid"><button className="fc-choice-card urgent" type="button" onClick={() => triggerEmergency({ title: 'Urgent Medical Assistance', description: 'Accident, fall, injury or suddenly unwell.', tone: 'danger', needsLocation: true })}><strong>Urgent Medical Assistance</strong><span>Accident, fall, injury, hurt leg or suddenly unwell.</span></button><button className="fc-choice-card" type="button" onClick={() => { setEmergencyPending({ title: 'Medical Help', description: 'Non-urgent family medical help request.', tone: 'medical', needsLocation: false }); setEmergencyText(''); setEmergencyView('message') }}><strong>Medical Help</strong><span>Ask the family for non-urgent help or advice.</span></button></div>{renderBottomNav()}</div>

    if (emergencyView === 'child') return <div className="fc-page"><FeatureHeader title="Child Needs Help" description="Choose what your child needs right now." onHome={() => openTool('emergency')} /><div className="fc-choice-grid child-grid">{[
      ['Homework Help', '📚', false], ['I Need Mum/Dad', '👨‍👩‍👧', false], ['I’m Upset', '💗', false], ['I Don’t Know What To Do', '❓', false], ['I’m Bored', '🎮', true], ['Something Else / Urgent Help', '🚨', 'message'],
    ].map(([label, icon, action]) => <button className="fc-choice-card" type="button" key={String(label)} onClick={() => action === 'message' ? (setEmergencyPending({ title: String(label), description: 'Child needs family help.', tone: 'other', needsLocation: true }), setEmergencyText(''), setEmergencyView('message')) : triggerEmergency({ title: String(label), description: 'Child requested family help.', tone: 'child', needsLocation: true, message: action ? 'Are you bored?' : undefined })}><span className="fc-choice-icon">{String(icon)}</span><strong>{String(label)}</strong><span>{label === 'I’m Bored' ? 'Ask the family to come and entertain you. 😄' : 'Send a family help request.'}</span></button>)}</div>{renderBottomNav()}</div>

    if (emergencyView === 'money') return <div className="fc-page"><FeatureHeader title="I Need Money" description="Send a cheeky family request with an amount, reason and repayment date." onHome={() => openTool('emergency')} /><div className="fc-panel"><div className="fc-form-grid"><label><span>How much? *</span><input value={moneyForm.amount} onChange={(event) => setMoneyForm((current) => ({ ...current, amount: event.target.value }))} placeholder="20" inputMode="decimal" /></label><label><span>What is it for? *</span><input value={moneyForm.purpose} onChange={(event) => setMoneyForm((current) => ({ ...current, purpose: event.target.value }))} placeholder="Petrol / food / school trip" /></label><label><span>Till when? *</span><input type="date" min={todayKey()} value={moneyForm.dueDate} onChange={(event) => setMoneyForm((current) => ({ ...current, dueDate: event.target.value }))} /></label></div><button className="fc-primary-button" type="button" onClick={submitMoneyRequest}>Send Money Request</button><p className="fc-form-note">Accepted requests will create a repayment record showing who owes whom and the due date.</p></div>{renderBottomNav()}</div>

    if (emergencyView === 'message') return <div className="fc-page"><FeatureHeader title={emergencyPending?.title ?? 'Family Help'} description="Tell your family what is happening." onHome={() => openTool('emergency')} /><div className="fc-panel"><label className="fc-textarea-label"><span>What do you need help with?</span><textarea rows={6} value={emergencyText} onChange={(event) => setEmergencyText(event.target.value)} placeholder="Tell your family what is happening…" /></label><button className="fc-primary-button" type="button" onClick={emergencyPending?.needsLocation ? sendEmergencyMessage : () => { if (emergencyPending && emergencyText.trim()) { const now = formatTime(); setMessages((current) => [{ id: `chat-${Date.now()}`, memberId: selectedMember.id, name: selectedMember.label, initials: selectedMember.initials, accent: selectedMember.accent, time: now, text: `🩺 ${emergencyPending.title}: ${emergencyText.trim()}` }, ...current]); setNotifications((current) => [{ id: `notification-${Date.now()}`, kind: 'Emergency', title: `${selectedMember.label}: ${emergencyPending.title}`, detail: emergencyText.trim(), time: 'Now' }, ...current]); setSentEmergency({ title: emergencyPending.title, coordinates: null }); setEmergencyView('sent') } }}>{emergencyPending?.needsLocation ? 'Send Family Alert' : 'Send Family Request'}</button></div>{renderBottomNav()}</div>

    if (emergencyView === 'confirm' && emergencyPending) return <div className="fc-page"><FeatureHeader title="Confirm Request" description="Make sure you want to send this family alert." onHome={() => openTool('emergency')} /><div className="fc-panel fc-confirm"><div className="fc-confirm-icon">{emergencyPending.tone === 'danger' ? '🚨' : '📣'}</div><h2>{emergencyPending.title}</h2><p className="fc-muted">{emergencyPending.description}</p>{emergencyPending.message && <p className="fc-muted">{emergencyPending.message}</p>}<p className="fc-muted">Your current location will be requested once you confirm.</p><div className="fc-action-row"><button className="fc-ghost-button" type="button" onClick={() => setEmergencyView('main')}>Cancel</button><button className="fc-primary-button" type="button" onClick={() => postEmergency(emergencyPending)}>Confirm & Send</button></div></div>{renderBottomNav()}</div>

    const openOtherEmergency = () => {
      setEmergencyPending({ title: 'Something Else / Urgent Help', description: 'Tell your family what is happening and send an urgent request.', tone: 'other', needsLocation: true })
      setEmergencyText('')
      setEmergencyView('message')
    }

    const emergencyButtons = [
      ['Medical Help', '🩺', 'Urgent or non-urgent family medical help.', () => setEmergencyView('medical'), 'medical'],
      ['I Need a Lift', '🚗', 'Ask the family for help getting somewhere.', () => triggerEmergency({ title: 'I Need a Lift', description: 'Family lift request.', tone: 'lift', needsLocation: true }), 'lift'],
      ['Child Needs Help', '🧒', 'Choose a child-friendly help request.', () => setEmergencyView('child'), 'child'],
      ['I’m Lost / Need Help', '📍', 'Alert the family and share your current location.', () => triggerEmergency({ title: 'I’m Lost / Need Help', description: 'Family help request.', tone: 'lost', needsLocation: true }), 'lost'],
      ['I Need Money', '💷', 'Ask the family for a specific amount and repayment date.', () => setEmergencyView('money'), 'money'],
      ['Something Else / Urgent Help', '!', 'Tell your family what is happening and send an urgent request.', openOtherEmergency, 'other'],
    ] as const

    return <div className="fc-page"><FeatureHeader title="Family Emergency" description="Family help without the clutter. Call someone or send a family alert." onHome={() => goToTab('home')} /><div className="fc-panel fc-call-family"><div className="fc-panel-head"><div><small>Call family</small><h2>Call a family member</h2></div><span className="fc-pill">Tap to call</span></div><div className="fc-contact-grid">{members.map((member) => <a key={member.id} className="fc-contact" href={`tel:${member.phone}`}><AppAvatar member={member} /><span><strong>{member.label}</strong><small>{member.phone}</small></span><b>☎</b></a>)}</div></div><button className="fc-emergency-unsafe" type="button" onClick={() => triggerEmergency({ title: 'I’m Not Safe', description: 'Immediate family alert.', tone: 'danger', needsLocation: true }, true)}><span className="fc-emergency-unsafe-icon">🚨</span><span><strong>I’m Not Safe</strong><small>Instantly alert everyone and share your current location.</small></span><b>→</b></button><div className="fc-panel"><div className="fc-panel-head"><div><small>Family Emergency</small><h2>What do you need?</h2></div><span className="fc-pill danger">Family-focused help</span></div><div className="fc-emergency-grid">{emergencyButtons.map(([label, icon, desc, action, tone]) => <button key={String(label)} className={`fc-emergency-button ${tone}`} type="button" onClick={action}><span>{icon}</span><strong>{label}</strong><small>{desc}</small></button>)}</div>{pendingMoney.length > 0 && <div className="fc-money-summary"><strong>Money requests</strong>{pendingMoney.slice(0, 3).map((request) => { const requester = members.find((m) => m.id === request.requesterId) ?? selectedMember; return <span key={request.id}>£{request.amount} — {requester.label} · {request.purpose}</span> })}</div>}</div>{renderBottomNav()}</div>
  }

  function renderFamily() {
    return <div className="fc-page"><FeatureHeader title="Family Members" description="Your family tree is about connection, not complicated relationship rules." onHome={() => goToTab('home')} /><div className="fc-panel fc-tree-panel"><div className="fc-panel-head"><div><small>Your family</small><h2>Family Circle Tree</h2></div><span className="fc-pill">3 profiles</span></div><div className="fc-tree"><div className="fc-tree-top"><button className="fc-tree-node current" type="button" onClick={() => openProfile(selectedMember.id)}><AppAvatar member={selectedMember} /><strong>{selectedMember.label}</strong><span>{selectedMember.status}</span></button></div><div className="fc-tree-connector" /><div className="fc-tree-branches">{members.filter((member) => member.id !== selectedMember.id).map((member) => <button className="fc-tree-node" type="button" key={member.id} onClick={() => openProfile(member.id)}><AppAvatar member={member} /><strong>{member.label}</strong><span>{member.status}</span><small>View profile →</small></button>)}</div></div></div>{renderBottomNav()}</div>
  }

  function renderGames() {
    return <div className="fc-page"><FeatureHeader title="Family Games" description="Play, challenge and have fun together." onHome={() => goToTab('home')} /><div className="fc-panel fc-games-hub"><div className="fc-games-grid">
      <a className="fc-game-card active" href="https://bradyt88.github.io/FCcardgame/" target="_blank" rel="noopener noreferrer" aria-label="Open Family Circle Card Game">
        <div className="fc-game-card-logo"><img src={logoUrl} alt="Family Circle" /></div>
        <p className="fc-kicker">Family Circle</p>
        <h2>Card Game</h2>
        <p className="fc-muted">Challenge a family member.</p>
        <span className="fc-game-card-action">Play Game <b>→</b></span>
      </a>
      <div className="fc-game-card coming">
        <div className="fc-game-card-icon">❓</div>
        <p className="fc-kicker">Coming Soon</p>
        <h2>Family Quiz</h2>
        <p className="fc-muted">Test your family knowledge.</p>
        <span className="fc-game-card-status">Coming Soon</span>
      </div>
      <div className="fc-game-card coming">
        <div className="fc-game-card-icon">🎮</div>
        <p className="fc-kicker">Coming Soon</p>
        <h2>More Games</h2>
        <p className="fc-muted">More family games to follow.</p>
        <span className="fc-game-card-status">Coming Soon</span>
      </div>
    </div></div>{renderBottomNav()}</div>
  }

  function renderShoppingList() {
    const canComplete = familyShopperIds.includes(selectedMember.id)
    return <div className="fc-page">
      <FeatureHeader title="Weekly Shopping List" description="Everyone can add. Family shoppers complete the list when the shop is done." onHome={() => goToTab('home')} />
      <div className="fc-shopping-layout">
        <section className="fc-panel fc-shopping-panel">
          <div className="fc-shopping-paper">
            <div className="fc-shopping-paper-top"><div><p className="fc-kicker">Family Circle</p><h2>Weekly Shop</h2></div><span>🛒</span></div>
            <div className="fc-shopping-add"><input value={shoppingInput} onChange={(event) => setShoppingInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') addShoppingItem() }} placeholder="Add food, sweets, chocolate..." aria-label="Add shopping item" /><button className="fc-primary-button" type="button" onClick={addShoppingItem}>Add</button></div>
            <div className="fc-shopping-list" aria-label="Weekly shopping list">{shoppingItems.length === 0 ? <div className="fc-shopping-empty"><span>📝</span><strong>Nothing on the list yet.</strong><small>Anyone in the family can add something for this week's shop.</small></div> : shoppingItems.map((item, index) => <div className="fc-shopping-item" key={`${item}-${index}`}><span className="fc-shopping-line-number">{index + 1}</span><strong>{item}</strong></div>)}</div>
            <div className="fc-shopping-complete"><div><strong>Shopping complete?</strong><small>Only a designated family shopper can start the next list.</small></div><button className="fc-shopping-complete-button" type="button" disabled={!canComplete || shoppingItems.length === 0} onClick={completeShoppingList}>{canComplete ? '✓ Shopping List Complete' : '🔒 Shopper Only'}</button></div>
          </div>
        </section>
        <aside className="fc-panel fc-shopping-info"><div className="fc-panel-head"><div><small>Family rules</small><h2>Who can do what?</h2></div></div>
          <div className="fc-shopping-rule"><span>➕</span><div><strong>Everyone can add</strong><small>Parents, adults and kids can put items on the list.</small></div></div>
          <div className="fc-shopping-rule"><span>🛒</span><div><strong>Family shoppers complete</strong><small>Designated shoppers tick off the whole weekly list once the shop is finished.</small></div></div>
          <div className="fc-shopping-rule"><span>🔄</span><div><strong>New list starts automatically</strong><small>Completing the list clears it ready for the next weekly shop.</small></div></div>
        </aside>
      </div>
      {renderBottomNav()}
    </div>
  }

  function renderMap() {
    return <div className="fc-page"><FeatureHeader title="Where Is Everyone?" description="Only family members who have chosen to share their location appear here." onHome={() => goToTab('home')} /><div className="fc-map-layout"><div className="fc-map" aria-label="Family location preview">{sharedMembers.map((member) => <button className="fc-map-pin" style={{ left: `${member.mapX}%`, top: `${member.mapY}%` }} key={member.id} type="button" onClick={() => openProfile(member.id)}><AppAvatar member={member} /><span>{member.label}</span></button>)}<div className="fc-map-road road-one" /><div className="fc-map-road road-two" /><div className="fc-map-road road-three" /></div><div className="fc-map-sidebar"><div className="fc-panel-head"><div><small>Live sharing</small><h2>Family on the map</h2></div><span className="fc-pill">{sharedMembers.length} sharing</span></div>{members.map((member) => <label className="fc-location-row" key={member.id}><AppAvatar member={member} /><span><strong>{member.label}</strong><small>{member.status} · {member.lastUpdated}</small></span><input type="checkbox" checked={Boolean(locationSharing[member.id])} onChange={(event) => setLocationSharing((current) => ({ ...current, [member.id]: event.target.checked }))} /></label>)}</div></div>{renderBottomNav()}</div>
  }

  function renderProfile() {
    const isOwn = profileTarget.id === selectedMember.id
    return <div className="fc-page"><FeatureHeader title={isOwn ? 'My Profile' : profileTarget.label} description={isOwn ? 'Control your photo, bio, status and social links.' : 'Family profile details.'} onHome={() => goToTab('home')} /><div className="fc-profile-layout"><div className="fc-panel fc-profile-hero"><div className="fc-profile-photo-wrap">{isOwn ? <label className="fc-profile-photo-button"><AppAvatar member={{ ...profileTarget, photo: profileTarget.photo }} className="fc-profile-photo" /><span>Change photo</span><input className="fc-hidden" type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) uploadProfilePhoto(file); event.currentTarget.value = '' }} /></label> : <AppAvatar member={profileTarget} className="fc-profile-photo" />} {isOwn && profileTarget.photo && <button className="fc-remove-photo" type="button" onClick={removeProfilePhoto}>Remove photo</button>}</div><h2>{profileTarget.label}</h2><p className="fc-status-chip">My Status · {profileTarget.status}</p><p className="fc-muted">{profileTarget.bio || 'No bio yet.'}</p><a className="fc-phone-link" href={`tel:${profileTarget.phone}`}>☎ {profileTarget.phone}</a></div><div className="fc-panel"><div className="fc-panel-head"><div><small>Profile details</small><h2>{isOwn ? 'Edit your details' : 'About this family member'}</h2></div></div>{isOwn ? <><label className="fc-textarea-label"><span>Short bio · {profileBio.length}/100</span><textarea maxLength={100} rows={4} value={profileBio} onChange={(event) => setProfileBio(event.target.value)} placeholder="A short line about you…" /></label><label className="fc-form-field"><span>My Status</span><select value={profileStatus} onChange={(event) => { setProfileStatus(event.target.value as StatusOption); changeStatus(event.target.value as StatusOption) }}>{statusOptions.map((status) => <option value={status} key={status}>{status}</option>)}</select></label><div className="fc-social-block"><strong>Social links</strong><p>Paste a real profile link. Active links show green.</p>{socialNames.map((name) => <label key={name}><span>{socialIcons[name]} {name}</span><input value={profileSocials[name]} onChange={(event) => setProfileSocials((current) => ({ ...current, [name]: event.target.value }))} placeholder={`https://${name.toLowerCase()}.com/...`} /><b className={profileSocials[name] ? 'active' : ''}>{profileSocials[name] ? 'Active' : 'Blank'}</b></label>)}</div>{profileMessage && <p className="fc-save-note">{profileMessage}</p>}<button className="fc-primary-button" type="button" onClick={saveProfile}>Save Profile</button></> : <div className="fc-read-profile"><div><strong>My Status</strong><span>{profileTarget.status}</span></div><div><strong>Bio</strong><span>{profileTarget.bio || 'No bio yet.'}</span></div><div><strong>Phone</strong><a href={`tel:${profileTarget.phone}`}>{profileTarget.phone}</a></div><div><strong>Location sharing</strong><span>{locationSharing[profileTarget.id] ? 'On' : 'Off'}</span></div><div><strong>Social links</strong><span>{socialNames.some((name) => profileTarget.socials[name]) ? socialNames.filter((name) => profileTarget.socials[name]).map((name) => <a key={name} href={profileTarget.socials[name]} target="_blank" rel="noreferrer">{socialIcons[name]} {name}</a>) : 'None added yet.'}</span></div></div>}</div></div>{renderBottomNav()}</div>
  }

  function renderNotifications() {
    return <div className="fc-page"><FeatureHeader title="Notifications" description="Keep up with family chat, tasks, calendar and emergency requests." onHome={() => goToTab('home')} /><div className="fc-panel"><div className="fc-panel-head"><div><small>Family updates</small><h2>Notifications</h2></div><button className="fc-ghost-button" type="button" onClick={() => setNotifications([])}>Clear all</button></div>{notifications.length === 0 ? <div className="fc-empty"><span>✓</span><strong>You're all caught up.</strong><p>No new family notifications.</p></div> : <div className="fc-notification-list">{notifications.map((item) => <article key={item.id}><span className="fc-notification-icon">{item.kind === 'Emergency' ? '🚨' : item.kind === 'Money' ? '💷' : '•'}</span><div><strong>{item.title}</strong><p>{item.detail}</p><small>{item.time}</small></div></article>)}</div>}</div>{renderBottomNav()}</div>
  }

  function renderSettings() {
    return <div className="fc-page">
      <FeatureHeader title="Settings" description="Family Circle preferences, permissions and family controls." onHome={() => goToTab('home')} />
      <div className="fc-panel fc-settings-list">
        <div className="fc-settings-section"><p className="fc-kicker">Location & safety</p></div>
        <div className="fc-setting-row"><span><strong>Share my location with family</strong><small>Shows you on Where Is Everyone?</small></span><input type="checkbox" checked={Boolean(locationSharing[selectedMember.id])} onChange={(event) => setLocationSharing((current) => ({ ...current, [selectedMember.id]: event.target.checked }))} /></div>
        <div className="fc-setting-row"><span><strong>Location permission</strong><small>{locationPermission === 'granted' ? 'Granted' : locationPermission === 'denied' ? 'Denied' : 'Not checked'}</small></span><button className="fc-ghost-button" type="button" onClick={() => requestBrowserLocation(() => undefined)}>Check permission</button></div>
        <div className="fc-setting-row"><span><strong>Emergency contacts</strong><small>Family members are available from Family Emergency.</small></span><button className="fc-ghost-button" type="button" onClick={() => openTool('emergency')}>Open</button></div>
        <div className="fc-settings-section"><p className="fc-kicker">Family organisation</p><h2>Weekly Shopping List</h2><p className="fc-muted">Everyone can add items. Designated family shoppers can complete the full list.</p></div>
        {members.map((member) => <label className="fc-setting-row" key={member.id}><span><strong>{member.label}</strong><small>Family shopper</small></span><input type="checkbox" checked={familyShopperIds.includes(member.id)} onChange={() => toggleFamilyShopper(member.id)} /></label>)}
        <div className="fc-setting-row"><span><strong>Weekly Shopping List</strong><small>Open the shared family shopping list.</small></span><button className="fc-ghost-button" type="button" onClick={() => goToTab('shopping')}>Open</button></div>
        <div className="fc-settings-section"><p className="fc-kicker">Account & family</p></div>
        <div className="fc-setting-row"><span><strong>Switch family</strong><small>Choose another connected family.</small></span><button className="fc-ghost-button" type="button" onClick={switchFamily}>Switch</button></div>
        <div className="fc-setting-row"><span><strong>Leave family</strong><small>Leave this family on this device.</small></span><button className="fc-ghost-button danger-outline" type="button" onClick={leaveFamilyDemo}>Leave Family</button></div>
        <div className="fc-setting-row"><span><strong>Log out</strong><small>Return to the Family Circle welcome screen.</small></span><button className="fc-ghost-button" type="button" onClick={logoutDemo}>Log Out</button></div>
        <div className="fc-setting-row danger-setting"><span><strong>Delete profile</strong><small>Remove this demo profile from this device.</small></span><button className="fc-ghost-button danger-outline" type="button" onClick={deleteProfileDemo}>Delete Profile</button></div>
        <div className="fc-setting-row"><span><strong>Help & Support</strong><small>Family Circle foundation help.</small></span><span className="fc-setting-badge">Available</span></div>
        <div className="fc-setting-row"><span><strong>Terms & Privacy</strong><small>Your family space stays private.</small></span><span className="fc-setting-badge">Foundation</span></div>
        <div className="fc-setting-row"><span><strong>App Information</strong><small>Family Circle foundation build.</small></span><span className="fc-setting-badge">Phase 0</span></div>
      </div>
      {renderBottomNav()}
    </div>
  }


  function renderMusic() {
    const current = musicCurrentTrack
    const progress = musicDuration > 0 ? Math.min(100, (musicCurrentTime / musicDuration) * 100) : 0
    return <div className="fc-page">
      <FeatureHeader title="Family Circle Music" description="Original music, playlists and background listening for the family." onHome={() => goToTab('home')} />
      <div className="fc-music-layout">
        <section className="fc-panel fc-music-player">
          <div className="fc-music-player-top"><div><small>Now Playing</small><h2>{current ? current.title : 'Ready when you are'}</h2></div><span className="fc-pill">Family Circle Music</span></div>
          <div className="fc-music-artwork">{current?.artwork ? <img src={current.artwork} alt="" /> : <div className="fc-music-artwork-placeholder"><span>♫</span><strong>Family Circle</strong><small>Your music library starts here.</small></div>}</div>
          <div className="fc-music-track-meta"><strong>{current ? current.title : 'No track loaded yet'}</strong><span>{current ? current.artist + ' · ' + current.genre : 'Add your first original track to begin listening.'}</span></div>
          <div className="fc-music-progress-wrap"><div className="fc-music-progress"><span style={{ width: String(progress) + '%' }} /></div><div className="fc-music-time"><span>{current ? formatMusicTime(musicCurrentTime) : '0:00'}</span><span>{current ? formatMusicTime(musicDuration) : '0:00'}</span></div></div>
          <div className="fc-music-controls">
            <button type="button" disabled={!current} aria-label="Shuffle">↝</button><button type="button" disabled={!current} aria-label="Previous track">◀</button><button className="fc-music-play-button" type="button" disabled={!current?.audioSrc} onClick={toggleMusicPlayback} aria-label={musicPlaying ? 'Pause music' : 'Play music'}>{musicPlaying ? 'Ⅱ' : '▶'}</button><button type="button" disabled={!current} aria-label="Next track">▶</button><button type="button" disabled={!current} aria-label="Repeat">↻</button>
          </div>
          <div className="fc-music-actions">{current?.youtubeUrl && <a href={current.youtubeUrl} target="_blank" rel="noreferrer">▶ Watch on YouTube</a>}<button type="button" disabled={!current} onClick={() => { if (!current) return; setChatDraft('🎵 Check out ' + current.title + ' by ' + current.artist + ' on Family Circle Music.'); goToTab('chat') }}>💬 Share to Family Chat</button></div>
        </section>
        <section className="fc-panel fc-music-library">
          <div className="fc-panel-head"><div><small>Your music</small><h2>Playlists</h2></div><span className="fc-pill">{musicLibrary.length} tracks</span></div>
          <div className="fc-music-playlists">{musicPlaylists.map((playlist) => <button type="button" className="fc-music-playlist" key={playlist} disabled><span>♫</span><strong>{playlist}</strong><small>Ready for tracks</small></button>)}</div>
          <div className="fc-music-empty"><span>♫</span><strong>Your music library is ready.</strong><p>When your original tracks are added, they will appear here with their artwork, genre, playlists and playback controls.</p></div>
        </section>
      </div>
      {renderBottomNav()}
    </div>
  }

  function renderTool() {
    if (toolMode === 'music') return renderMusic()
    if (toolMode === 'profile') return renderProfile()
    if (toolMode === 'family') return renderFamily()
    if (toolMode === 'games') return renderGames()
    if (toolMode === 'notifications') return renderNotifications()
    if (toolMode === 'settings') return renderSettings()
    if (toolMode === 'map') return renderMap()
    if (toolMode === 'emergency') return renderEmergency()
    return null
  }

  function renderActive() {
    if (toolMode) return renderTool()
    if (activeTab === 'chat') return renderChat()
    if (activeTab === 'photos') return renderPhotos()
    if (activeTab === 'calendar') return renderCalendar()
    if (activeTab === 'tasks') return renderTasks()
    if (activeTab === 'shopping') return renderShoppingList()
    return renderHome()
  }

  if (showOnboarding) {
    return <Onboarding initialView={onboardingView} onComplete={completeOnboarding} />
  }

  if (screen === 'members') return <main className="fc-app-shell fc-members-screen"><header className="fc-brand-header"><div className="fc-brand-lockup"><img src={logoUrl} alt="Family Circle" /><strong>Family Circle</strong></div><span>● Private family space</span></header><section className="fc-members-intro"><p className="fc-kicker">Welcome</p><h1>Who's using Family Circle?</h1><p className="fc-muted">Choose your family profile to continue.</p></section><section className="fc-member-grid">{members.map((member) => <button className="fc-member-card" key={member.id} type="button" onClick={() => chooseMember(member.id)}><AppAvatar member={member} className="fc-member-avatar" /><strong>{member.label}</strong><span>{member.status}</span><small>Enter PIN →</small></button>)}</section><p className="fc-private-note">▣ Your family information stays private.</p><button className="fc-switch-family-link" type="button" onClick={switchFamily}>Switch family</button>{pinOpen && <div className="fc-modal-backdrop" onMouseDown={() => setPinOpen(false)}><section className="fc-pin-modal" onMouseDown={(event) => event.stopPropagation()}><button className="fc-modal-close" type="button" onClick={() => setPinOpen(false)}>×</button><div className="fc-pin-profile"><AppAvatar member={selectedMember} /><div><p className="fc-kicker">Family profile</p><strong>{selectedMember.label}</strong></div></div><h2>Enter your PIN</h2><p className="fc-muted">Enter your 4-digit PIN to unlock your family space.</p><div className="fc-pin-dots">{[0, 1, 2, 3].map((index) => <span className={index < pin.length ? 'filled' : ''} key={index} />)}</div>{pinError && <p className="fc-error">{pinError}</p>}<div className="fc-keypad">{['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => <button type="button" key={digit} onClick={() => setPin((current) => current.length < 4 ? current + digit : current)}>{digit}</button>)}<button type="button" onClick={() => { setPin(''); setPinOpen(false) }}>Cancel</button><button type="button" onClick={() => setPin((current) => current.length < 4 ? current + '0' : current)}>0</button><button type="button" onClick={() => setPin((current) => current.slice(0, -1))}>⌫</button></div><button className="fc-primary-button" type="button" onClick={submitPin}>Continue</button></section></div>}</main>

  return <main className="fc-app-shell fc-home-screen"><div className="fc-home-shell"><audio ref={musicAudioRef} onTimeUpdate={(event) => setMusicCurrentTime(event.currentTarget.currentTime)} onLoadedMetadata={(event) => setMusicDuration(event.currentTarget.duration)} onPlay={() => setMusicPlaying(true)} onPause={() => setMusicPlaying(false)} onEnded={handleMusicEnded} preload="metadata" />{renderActive()}{musicCurrentTrack && <button className="fc-music-mini-player" type="button" onClick={openMusic}><span className="fc-music-mini-art">{musicCurrentTrack.artwork ? <img src={musicCurrentTrack.artwork} alt="" /> : '♫'}</span><span className="fc-music-mini-copy"><strong>{musicCurrentTrack.title}</strong><small>{musicCurrentTrack.artist}</small></span><span className="fc-music-mini-play">{musicPlaying ? 'Ⅱ' : '▶'}</span><span className="fc-music-mini-chevron">⌃</span></button>}</div></main>
}

function formatMusicTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0')
  return minutes + ':' + secs
}

function TaskForm({ members, onAdd }: { members: FamilyMember[]; onAdd: (title: string, dueDate: string, assignedTo: string) => void }) {
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState(todayKey())
  const [assignedTo, setAssignedTo] = useState(members[0]?.id ?? '')
  return <div className="fc-form-grid"><label><span>Task name *</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Take bins out" /></label><label><span>Due date *</span><input type="date" min={todayKey()} value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></label><label><span>Assign to *</span><select value={assignedTo} onChange={(event) => setAssignedTo(event.target.value)}>{members.map((member) => <option key={member.id} value={member.id}>{member.label}</option>)}</select></label><button className="fc-primary-button" type="button" onClick={() => { if (!title.trim()) return; onAdd(title.trim(), dueDate, assignedTo); setTitle('') }}>Add Family Task</button></div>
}

function getCalendarCells(cursor: Date) {
  const firstDay = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()
  const startOffset = (firstDay.getDay() + 6) % 7
  return Array.from({ length: 42 }, (_, index) => {
    const dayNumber = index - startOffset + 1
    return dayNumber >= 1 && dayNumber <= daysInMonth ? dayNumber : null
  })
}

function CalendarPanel({ events, onAdd, onBack, onNav }: { events: FamilyEvent[]; todaysEvents?: FamilyEvent[]; onAdd: (title: string, date: string, time: string, location: string) => void; onBack: () => void; onNav: () => JSX.Element }) {
  const today = todayKey()
  const [selectedDate, setSelectedDate] = useState(today)
  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(today)
  const [time, setTime] = useState('19:00')
  const [location, setLocation] = useState('At Home')

  const cells = getCalendarCells(cursor)
  const monthLabel = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(cursor)
  const selectedEvents = events.filter((event) => event.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time))

  function changeMonth(amount: number) {
    const next = new Date(cursor.getFullYear(), cursor.getMonth() + amount, 1)
    setCursor(next)
    const now = new Date()
    const nextSelected = next.getFullYear() === now.getFullYear() && next.getMonth() === now.getMonth() ? todayKey() : `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-01`
    setSelectedDate(nextSelected)
    setDate(nextSelected)
  }

  function jumpToToday() {
    const now = new Date()
    setCursor(new Date(now.getFullYear(), now.getMonth(), 1))
    setSelectedDate(today)
    setDate(today)
  }

  function addEvent() {
    if (!title.trim() || !date || !time) return
    onAdd(title.trim(), date, time, location.trim())
    setSelectedDate(date)
    const added = new Date(`${date}T00:00:00`)
    setCursor(new Date(added.getFullYear(), added.getMonth(), 1))
    setTitle('')
  }

  function isPast(event: FamilyEvent) {
    if (event.date < today) return true
    if (event.date > today) return false
    const [hours, minutes] = event.time.split(':').map(Number)
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes).getTime() < now.getTime()
  }

  return <div className="fc-page"><FeatureHeader title="Family Calendar" description="Keep plans, appointments and family events visible in one place." onHome={onBack} /><div className="fc-calendar-layout"><div className="fc-panel fc-calendar-main"><div className="fc-calendar-toolbar"><button className="fc-calendar-nav" type="button" onClick={() => changeMonth(-1)} aria-label="Previous month">‹</button><div><small>Family plans</small><h2>{monthLabel}</h2></div><div className="fc-calendar-toolbar-actions"><button className="fc-today-button" type="button" onClick={jumpToToday}>Today</button><button className="fc-calendar-nav" type="button" onClick={() => changeMonth(1)} aria-label="Next month">›</button></div></div><div className="fc-calendar-weekdays">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day) => <span key={day}>{day}</span>)}</div><div className="fc-calendar-grid">{cells.map((dayNumber, index) => { if (dayNumber === null) return <div className="fc-calendar-cell empty" key={`empty-${index}`} />; const cellDate = new Date(cursor.getFullYear(), cursor.getMonth(), dayNumber); const key = `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, '0')}-${String(cellDate.getDate()).padStart(2, '0')}`; const dayEvents = events.filter((event) => event.date === key); const isToday = key === today; const isSelected = key === selectedDate; return <button className={`fc-calendar-cell${isToday ? ' today' : ''}${isSelected ? ' selected' : ''}${key < today ? ' past' : ''}`} type="button" key={key} onClick={() => { setSelectedDate(key); setDate(key) }} aria-label={`${formatLongDate(key)}${dayEvents.length ? `, ${dayEvents.length} event${dayEvents.length === 1 ? '' : 's'}` : ''}`}><span className="fc-calendar-day-number">{dayNumber}</span>{dayEvents.length > 0 && <span className="fc-calendar-markers">{dayEvents.slice(0, 3).map((event) => <i key={event.id} />)}</span>}</button> })}</div><div className="fc-calendar-key"><span><i className="today-key" /> Today</span><span><i className="event-key" /> Family event</span><span><i className="selected-key" /> Selected</span></div></div><div className="fc-calendar-side"><div className="fc-panel"><div className="fc-panel-head"><div><small>Selected day</small><h2>{formatLongDate(selectedDate)}</h2></div><span className="fc-pill">{selectedEvents.length} event{selectedEvents.length === 1 ? '' : 's'}</span></div>{selectedEvents.length === 0 ? <div className="fc-calendar-empty"><span>♡</span><strong>No family events on this date.</strong><small>Choose another date or add an event below.</small></div> : <div className="fc-calendar-events">{selectedEvents.map((event) => <div className={isPast(event) ? 'fc-calendar-event past' : 'fc-calendar-event'} key={event.id}><span>📅</span><div><strong>{event.title}</strong><small>{event.time}{event.location ? ` · ${event.location}` : ''}</small></div>{isPast(event) && <b>✓</b>}</div>)}</div>}</div><div className="fc-panel"><div className="fc-panel-head"><div><small>Add to family calendar</small><h2>New family event</h2></div></div><div className="fc-form-grid"><label><span>Event name *</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Family dinner" /></label><label><span>Date *</span><input type="date" min={today} value={date} onChange={(event) => { setDate(event.target.value); setSelectedDate(event.target.value) }} /></label><label><span>Time *</span><input type="time" value={time} onChange={(event) => setTime(event.target.value)} /></label><label><span>Location</span><input value={location} onChange={(event) => setLocation(event.target.value)} /></label><button className="fc-primary-button" type="button" onClick={addEvent}>Add Family Event</button></div></div></div></div>{onNav()}</div>
}