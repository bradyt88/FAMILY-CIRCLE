import { useEffect, useRef, useState } from 'react'
import logoUrl from '../design/brand/family-circle-logo.png'
import Onboarding from './Onboarding'
import './batch15.css'

type ToolMode = 'emergency' | 'profile' | 'family' | 'games' | 'notifications' | 'settings' | 'map' | 'music' | 'musicCommunity'
type HomeTab = 'home' | 'chat' | 'photos' | 'calendar' | 'tasks' | 'shopping'
type AccountType = 'adult' | 'child'
type Plan = 'free' | 'plus' | 'premium'
type SubscriptionState = { plan: Plan; monthlyPublishAllowance: number; monthlyPublishedTracks: number }

const SUBSCRIPTION_CONFIG: Record<Plan, { monthlyPublishAllowance: number }> = {
  free: { monthlyPublishAllowance: 0 },
  plus: { monthlyPublishAllowance: 0 },
  premium: { monthlyPublishAllowance: 10 },
}

function loadSubscriptionState(): SubscriptionState {
  try {
    const saved = localStorage.getItem('family-circle-subscription')
    const parsed = saved ? JSON.parse(saved) as Partial<SubscriptionState> : {}
    const plan: Plan = parsed.plan === 'plus' || parsed.plan === 'premium' ? parsed.plan : 'free'
    return {
      plan,
      monthlyPublishAllowance: SUBSCRIPTION_CONFIG[plan].monthlyPublishAllowance,
      monthlyPublishedTracks: typeof parsed.monthlyPublishedTracks === 'number' && parsed.monthlyPublishedTracks >= 0 ? parsed.monthlyPublishedTracks : 0,
    }
  } catch {
    return { plan: 'free', monthlyPublishAllowance: SUBSCRIPTION_CONFIG.free.monthlyPublishAllowance, monthlyPublishedTracks: 0 }
  }
}
type ChildPermissionKey = 'chat' | 'tasks' | 'photos' | 'games' | 'music' | 'youtube' | 'globalMultiplayer' | 'location'
type ChildPermissions = Record<ChildPermissionKey, boolean>

type StatusOption = 'Home' | 'Work' | 'Partying' | 'Recovering' | 'Playing' | 'Gaming' | 'Toilet 😂' | 'Movies' | 'Sleeping' | 'Gym' | 'Travelling' | 'Holiday' | 'Out & About'
type SocialName = 'Facebook' | 'TikTok' | 'Snapchat' | 'YouTube'
type MemberRecognition = { famOfWeekWins: number; clownOfWeekWins: number; weeklyAwards: Array<{ weekKey: string; type: 'fam' | 'clown' }> }
type RecognitionTie = { candidates: string[]; votes: Record<string, string>; statements: Record<string, string> }
type WeeklyRecognition = { weekKey: string; famVotes: Record<string, string>; clownVotes: Record<string, string>; famWinner: string | null; clownWinner: string | null; famTie: RecognitionTie | null; clownTie: RecognitionTie | null; famAnnounced: boolean; clownAnnounced: boolean }
type FamilyMember = { id: string; label: string; initials: string; accent: string; phone: string; bio: string; status: StatusOption; locationLabel: string; lastUpdated: string; mapX: number; mapY: number; photo?: string | null; socials: Record<SocialName, string>; recognition?: MemberRecognition }
type ChatMessage = { id: string; memberId: string; name: string; initials: string; accent: string; time: string; text: string; image?: string; moneyRequestId?: string }
type Notification = { id: string; kind: 'Chat' | 'Task' | 'Calendar' | 'Emergency' | 'Profile' | 'Money'; title: string; detail: string; time: string }
type NotificationPreferences = { Chat: boolean; Task: boolean; Calendar: boolean; Profile: boolean; Money: boolean; Emergency: true }
type FamilyPhoto = { id: string; src: string; name: string; time: string }
type FamilyEvent = { id: string; title: string; date: string; time: string; location: string }
type FamilyTask = { id: string; title: string; dueDate: string; assignedTo: string; completed: boolean }
type MoneyRequest = { id: string; requesterId: string; amount: string; purpose: string; dueDate: string; status: 'Pending' | 'Accepted'; lenderId?: string; taskId?: string; calendarEventId?: string }
type MusicTrack = { id: string; title: string; artist: string; genres: string[]; audioSrc: string; artwork?: string; youtubeUrl?: string; explicit: boolean; kidsAllowed: boolean; visualStyle: 1 | 2 | 3 | 4 | 5 }
type MusicCommunityProfile = {
  displayName: string
  handle: string
  bio: string
  photo?: string | null
  profileSongId?: string | null
  visibility: { bio: boolean; likedMusic: boolean; savedMusic: boolean; followers: boolean; allowFollowers: boolean }
}

const musicLibrary: MusicTrack[] = [
  { id: 'late-night-ghosts', title: 'Late Night Ghosts', artist: 'Coreykt', genres: ['Chilled', 'R&B', 'Hip-Hop'], audioSrc: `${import.meta.env.BASE_URL}music/audio/Late Night Ghosts.mp3`, youtubeUrl: 'https://youtu.be/t6L480nXQ9M?is=RNp81PJPqzK_f4wm', explicit: true, kidsAllowed: false, visualStyle: 3 },
  { id: 'unread-at-3am', title: 'Unread at 3am', artist: 'bradyxai', genres: ['R&B'], audioSrc: `${import.meta.env.BASE_URL}music/audio/Unread at 3am.mp3`, artwork: `${import.meta.env.BASE_URL}music/artwork/Unread-at-3am-artwork.jpg`, youtubeUrl: 'https://youtu.be/H4r-CAamr_A?si=xD65AIvIZgxhgAPC', explicit: true, kidsAllowed: false, visualStyle: 4 },
  { id: 'six-seven', title: 'Six seven', artist: 'bradyxai', genres: ['Kids / Family'], audioSrc: `${import.meta.env.BASE_URL}music/audio/Six seven.mp3`, artwork: `${import.meta.env.BASE_URL}music/artwork/ChatGPT Image Sep 19, 2026, 06_25_58 PM.png`, explicit: false, kidsAllowed: true, visualStyle: 5 },
]

const musicPlaylists = ['Chilled', 'Hip-Hop', 'R&B', 'Rock', 'Pop', 'Kids / Family']

const musicCommunityDemoTracks: MusicTrack[] = [
  { id: 'demo-community-nova-01', title: 'Neon Afterglow', artist: 'novaray', genres: ['R&B', 'AI Music'], audioSrc: '', explicit: false, kidsAllowed: true, visualStyle: 2 },
  { id: 'demo-community-jax-01', title: 'Midnight Motion', artist: 'jaxmonroe', genres: ['Hip-Hop', 'Electronic'], audioSrc: '', explicit: false, kidsAllowed: true, visualStyle: 4 },
  { id: 'demo-community-luna-01', title: 'Moonlight Static', artist: 'lunav', genres: ['Pop', 'Electronic'], audioSrc: '', explicit: false, kidsAllowed: true, visualStyle: 5 },
  { id: 'demo-community-room-01', title: 'The Midnight Room', artist: 'midnightroom', genres: ['Instrumental', 'R&B'], audioSrc: '', explicit: false, kidsAllowed: true, visualStyle: 1 },
]

const musicCommunityDemoProfiles: Array<MusicCommunityProfile & { demoFollowers: number; demoFollowing: number }> = [
  { displayName: 'Nova Ray', handle: 'novaray', bio: 'Late-night R&B, glowing synths and after-hours energy.', photo: null, profileSongId: 'demo-community-nova-01', visibility: { bio: true, likedMusic: true, savedMusic: false, followers: true, allowFollowers: true }, demoFollowers: 1280, demoFollowing: 86 },
  { displayName: 'Jax Monroe', handle: 'jaxmonroe', bio: 'Hip-hop, electronic textures and beats made after dark.', photo: null, profileSongId: 'demo-community-jax-01', visibility: { bio: true, likedMusic: true, savedMusic: false, followers: true, allowFollowers: true }, demoFollowers: 742, demoFollowing: 41 },
  { displayName: 'Luna V', handle: 'lunav', bio: 'Dreamy pop and electronic sounds from the late-night side.', photo: null, profileSongId: 'demo-community-luna-01', visibility: { bio: true, likedMusic: true, savedMusic: false, followers: true, allowFollowers: true }, demoFollowers: 2140, demoFollowing: 103 },
  { displayName: 'The Midnight Room', handle: 'midnightroom', bio: 'Instrumentals, atmospheric loops and music for creators.', photo: null, profileSongId: 'demo-community-room-01', visibility: { bio: true, likedMusic: true, savedMusic: false, followers: true, allowFollowers: true }, demoFollowers: 519, demoFollowing: 27 },
]


function normaliseMusicCommunityProfile(value: Partial<MusicCommunityProfile>): MusicCommunityProfile | null {
  if (typeof value.displayName !== 'string' || typeof value.handle !== 'string') return null
  return { displayName: value.displayName.slice(0,40), handle: value.handle.replace(/^@+/,'').replace(/\s+/g,'').slice(0,24), bio: typeof value.bio === 'string' ? value.bio.slice(0,160) : '', photo: typeof value.photo === 'string' ? value.photo : null, profileSongId: typeof value.profileSongId === 'string' ? value.profileSongId : null, visibility: { bio: value.visibility?.bio ?? true, likedMusic: value.visibility?.likedMusic ?? true, savedMusic: value.visibility?.savedMusic ?? false, followers: value.visibility?.followers ?? true, allowFollowers: value.visibility?.allowFollowers ?? true } }
}
function loadMusicCommunityProfiles(): Record<string, MusicCommunityProfile> {
  try {
    const saved = localStorage.getItem('family-circle-music-community-profiles')
    if (saved) {
      const parsed = JSON.parse(saved) as Record<string, Partial<MusicCommunityProfile>>
      return Object.fromEntries(Object.entries(parsed).flatMap(([id,value]) => { const profile=normaliseMusicCommunityProfile(value); return profile ? [[id,profile]] : [] }))
    }
    const legacy=localStorage.getItem('family-circle-music-community-profile')
    if (!legacy) return {}
    const profile=normaliseMusicCommunityProfile(JSON.parse(legacy) as Partial<MusicCommunityProfile>)
    return profile ? { 'member-1': profile } : {}
  } catch { return {} }
}
type EmergencyPending = { title: string; description: string; tone: string; needsLocation: boolean; message?: string }

const statusOptions: StatusOption[] = ['Home', 'Work', 'Partying', 'Recovering', 'Playing', 'Gaming', 'Toilet 😂', 'Movies', 'Sleeping', 'Gym', 'Travelling', 'Holiday', 'Out & About']
const socialNames: SocialName[] = ['Facebook', 'TikTok', 'Snapchat', 'YouTube']
const socialIcons: Record<SocialName, string> = { Facebook: 'f', TikTok: '♪', Snapchat: '👻', YouTube: '▶' }

const memberSeeds: FamilyMember[] = [
  { id: 'member-1', label: 'Family Member 1', initials: 'FM', accent: 'member-accent-one', phone: '+44 7700 900001', bio: 'Keeping the family moving.', status: 'Work', locationLabel: 'Work', lastUpdated: '2 min ago', mapX: 25, mapY: 37, photo: null, socials: { Facebook: '', TikTok: '', Snapchat: '', YouTube: '' }, recognition: { famOfWeekWins: 0, clownOfWeekWins: 0, weeklyAwards: [] } },
  { id: 'member-2', label: 'Family Member 2', initials: 'FM', accent: 'member-accent-two', phone: '+44 7700 900002', bio: 'Home is wherever we are together.', status: 'Home', locationLabel: 'Home', lastUpdated: '4 min ago', mapX: 57, mapY: 61, photo: null, socials: { Facebook: '', TikTok: '', Snapchat: '', YouTube: '' }, recognition: { famOfWeekWins: 0, clownOfWeekWins: 0, weeklyAwards: [] } },
  { id: 'member-3', label: 'Family Member 3', initials: 'FM', accent: 'member-accent-three', phone: '+44 7700 900003', bio: 'Always part of the circle.', status: 'Playing', locationLabel: 'Out & About', lastUpdated: '8 min ago', mapX: 76, mapY: 24, photo: null, socials: { Facebook: '', TikTok: '', Snapchat: '', YouTube: '' }, recognition: { famOfWeekWins: 0, clownOfWeekWins: 0, weeklyAwards: [] } },
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

function loadNotificationPreferences(): NotificationPreferences {
  try {
    const saved = localStorage.getItem('family-circle-notification-preferences')
    const parsed = saved ? JSON.parse(saved) as Partial<NotificationPreferences> : {}
    return {
      Chat: parsed.Chat ?? true,
      Task: parsed.Task ?? true,
      Calendar: parsed.Calendar ?? true,
      Profile: parsed.Profile ?? true,
      Money: parsed.Money ?? true,
      Emergency: true,
    }
  } catch {
    return { Chat: true, Task: true, Calendar: true, Profile: true, Money: true, Emergency: true }
  }
}

function persistNotificationPreferences(value: NotificationPreferences) {
  localStorage.setItem('family-circle-notification-preferences', JSON.stringify(value))
}

function recognitionWeekKey(now = new Date()) {
  const date = new Date(now)
  const day = date.getDay()
  const beforeSundayVote = day !== 0 || date.getHours() < 17
  const daysUntilSunday = (7 - day) % 7
  if (beforeSundayVote) date.setDate(date.getDate() + (daysUntilSunday || 7))
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
function isRecognitionVotingOpen(now = new Date()) { return now.getDay() === 0 && now.getHours() >= 17 && now.getHours() < 20 }
function isRecognitionTieBreakOpen(now = new Date()) { return now.getDay() === 0 && now.getHours() >= 20 && now.getHours() < 21 }
function emptyWeeklyRecognition(weekKey: string): WeeklyRecognition { return { weekKey, famVotes: {}, clownVotes: {}, famWinner: null, clownWinner: null, famTie: null, clownTie: null, famAnnounced: false, clownAnnounced: false } }
function loadWeeklyRecognition(): WeeklyRecognition {
  const key = 'family-circle-weekly-recognition'
  try {
    const saved = localStorage.getItem(key)
    const parsed = saved ? JSON.parse(saved) as Partial<WeeklyRecognition> : null
    const weekKey = recognitionWeekKey()
    if (!parsed || parsed.weekKey !== weekKey) return emptyWeeklyRecognition(weekKey)
    return { ...emptyWeeklyRecognition(weekKey), ...parsed, famVotes: parsed.famVotes ?? {}, clownVotes: parsed.clownVotes ?? {}, famTie: parsed.famTie ?? null, clownTie: parsed.clownTie ?? null }
  } catch { return emptyWeeklyRecognition(recognitionWeekKey()) }
}
function persistWeeklyRecognition(value: WeeklyRecognition) { localStorage.setItem('family-circle-weekly-recognition', JSON.stringify(value)) }

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

function recognitionStatus(member: FamilyMember) {
  const wins = memberRecognitionSafe(member).famOfWeekWins
  if (wins >= 20) return 'Royalty'
  if (wins >= 10) return 'Family Legend'
  if (wins >= 5) return 'Family Ace'
  if (wins >= 2) return 'Fan Favourite'
  return 'Family Member'
}
function memberRecognitionSafe(member: FamilyMember): MemberRecognition { return member.recognition ?? { famOfWeekWins: 0, clownOfWeekWins: 0, weeklyAwards: [] } }
function RecognitionProfile({ member }: { member: FamilyMember; members: FamilyMember[] }) {
  const recognition=memberRecognitionSafe(member), stars=Math.min(20,recognition.famOfWeekWins)
  return <section className="fc-recognition-panel"><div className="fc-recognition-head"><div><p className="fc-kicker">Weekly recognition</p><h2>⭐ My Family Star Chart</h2></div><span className="fc-recognition-status">{recognitionStatus(member)}</span></div><div className="fc-star-chart" aria-label={`${recognition.famOfWeekWins} Fam of the Week wins`}>{Array.from({length:20},(_,i)=><span key={i} className={i<stars?'earned':''}>★</span>)}</div><div className="fc-recognition-stats"><span>⭐ <b>{recognition.famOfWeekWins}</b> Fam wins</span><span>🤡 <b>{recognition.clownOfWeekWins}</b> Clown wins</span></div><small>20 Fam of the Week wins unlocks Royalty.</small></section>
}

function FeatureHeader({ title, description, onHome }: { title: string; description: string; onHome: () => void }) {
  const accent = title.includes('Emergency') ? 'emergency' : title.includes('Shopping') || title.includes('Weekly Shop') ? 'shopping' : title.includes('Chat') ? 'pink' : title.includes('Calendar') ? 'purple' : title.includes('Tasks') ? 'green' : title.includes('Photos') ? 'cyan' : title.includes('Where Is') ? 'cyan' : title.includes('Family Members') ? 'purple' : 'purple'
  return <div className={`fc-feature-header ${accent}`}><div><p className="fc-kicker">Family Circle</p><h1>{title}</h1><p className="fc-muted">{description}</p></div><button className="fc-ghost-button" type="button" onClick={onHome}>← Home</button></div>
}

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [onboardingView, setOnboardingView] = useState<'splash' | 'families'>('splash')
  const [accountType, setAccountType] = useState<AccountType>('adult')
  const [subscription, setSubscription] = useState<SubscriptionState>(() => loadSubscriptionState())
  const [childPermissions, setChildPermissions] = useState<ChildPermissions>({ chat: true, tasks: true, photos: true, games: true, music: true, youtube: false, globalMultiplayer: false, location: true })
  const [accessNotice, setAccessNotice] = useState<{ title: string; message: string; action: 'restriction' | 'upgrade' | 'child' } | null>(null)
  const [screen, setScreen] = useState<'members' | 'home'>('members')
  const [selectedMemberId, setSelectedMemberId] = useState<string>(memberSeeds[0].id)
  const [members, setMembers] = useState<FamilyMember[]>(loadMembers)
  const [pinOpen, setPinOpen] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [activeTab, setActiveTab] = useState<HomeTab>('home')
  const [toolMode, setToolMode] = useState<ToolMode | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [weeklyRecognition, setWeeklyRecognition] = useState<WeeklyRecognition>(() => loadWeeklyRecognition())
  const [tieStatementDrafts, setTieStatementDrafts] = useState<Record<string, string>>({})
  const [photos, setPhotos] = useState<FamilyPhoto[]>([])
  const [pendingChatPhoto, setPendingChatPhoto] = useState<string | null>(null)
  const [chatDraft, setChatDraft] = useState('')
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(() => loadNotificationPreferences())
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
  const [demoLocation, setDemoLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [profileTargetId, setProfileTargetId] = useState<string>(memberSeeds[0].id)
  const [profileBio, setProfileBio] = useState('')
  const [profileStatus, setProfileStatus] = useState<StatusOption>('Home')
  const [profileSocials, setProfileSocials] = useState<Record<SocialName, string>>({ Facebook: '', TikTok: '', Snapchat: '', YouTube: '' })
  const [profileMessage, setProfileMessage] = useState('')
  const [profileSavedView, setProfileSavedView] = useState(false)
  const [profilePhotoViewer, setProfilePhotoViewer] = useState<string | null>(null)
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
  const homeEntryAudioRef = useRef<HTMLAudioElement | null>(null)
  const [musicCurrentTrack, setMusicCurrentTrack] = useState<MusicTrack | null>(null)
  const [musicPlaying, setMusicPlaying] = useState(false)
  const [musicCurrentTime, setMusicCurrentTime] = useState(0)
  const [musicDuration, setMusicDuration] = useState(0)
  const [musicPlaylist, setMusicPlaylist] = useState<string | null>(null)
  const [musicRecentlyPlayed, setMusicRecentlyPlayed] = useState<string[]>([])
  const [musicChildMode, setMusicChildMode] = useState(false)
  const [musicChildYouTubeAllowed, setMusicChildYouTubeAllowed] = useState(false)
  const [musicVolume, setMusicVolume] = useState(() => { const saved = Number(localStorage.getItem('family-circle-music-volume')); return Number.isFinite(saved) ? Math.min(1, Math.max(0, saved)) : 0.7 })
  const [musicCommunityProfiles, setMusicCommunityProfiles] = useState<Record<string, MusicCommunityProfile>>(() => loadMusicCommunityProfiles())
  const [musicCommunityDisplayName, setMusicCommunityDisplayName] = useState('')
  const [musicCommunityHandle, setMusicCommunityHandle] = useState('')
  const [musicCommunityBio, setMusicCommunityBio] = useState('')
  const [musicCommunityPhoto, setMusicCommunityPhoto] = useState<string | null>(null)
  const [musicCommunityProfileSongId, setMusicCommunityProfileSongId] = useState<string | null>(null)
  const [musicCommunityVisibility, setMusicCommunityVisibility] = useState({ bio:true, likedMusic:true, savedMusic:false, followers:true, allowFollowers:true })
  const [musicCommunityProfileError, setMusicCommunityProfileError] = useState('')
  const [musicCommunityEditing, setMusicCommunityEditing] = useState(false)
  const [musicCommunityProfileView, setMusicCommunityProfileView] = useState(false)
  const [musicCommunityViewedProfile, setMusicCommunityViewedProfile] = useState<MusicCommunityProfile | null>(null)
  const [musicMiniPlayerVisible, setMusicMiniPlayerVisible] = useState(false)
  const [musicCommunitySettingsOpen, setMusicCommunitySettingsOpen] = useState(false)
  const [musicCommunitySafetyMode, setMusicCommunitySafetyMode] = useState<'block' | 'block-report' | null>(null)
  const [musicCommunitySafetyHandle, setMusicCommunitySafetyHandle] = useState('')
  const [musicCommunitySafetyReason, setMusicCommunitySafetyReason] = useState('Spam or unwanted contact')
  const [musicCommunitySafetyMessage, setMusicCommunitySafetyMessage] = useState('')

  useEffect(() => {
    localStorage.setItem('family-circle-subscription', JSON.stringify(subscription))
  }, [subscription])

  useEffect(() => { persistWeeklyRecognition(weeklyRecognition) }, [weeklyRecognition])
  useEffect(() => {
    const refreshRecognition = () => {
      const key = recognitionWeekKey()
      if (key !== weeklyRecognition.weekKey) setWeeklyRecognition(emptyWeeklyRecognition(key))
      finaliseWeeklyRecognition()
    }
    refreshRecognition()
    const timer = window.setInterval(refreshRecognition, 30000)
    return () => window.clearInterval(timer)
  }, [weeklyRecognition])

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

  useEffect(() => {
    const audio = musicAudioRef.current
    if (audio) audio.volume = musicVolume
  }, [musicVolume])

  useEffect(() => {
    if (musicChildMode && musicCurrentTrack && !musicCurrentTrack.kidsAllowed) {
      musicAudioRef.current?.pause()
      setMusicCurrentTrack(null)
      setMusicPlaying(false)
      setMusicCurrentTime(0)
    }
  }, [musicChildMode, musicCurrentTrack])

  function openMusic() {
    if (musicCurrentTrack?.id.startsWith('demo-community-')) {
      musicAudioRef.current?.pause()
      setMusicCurrentTrack(null)
      setMusicPlaying(false)
      setMusicCurrentTime(0)
      setMusicDuration(0)
      setMusicMiniPlayerVisible(false)
    }
    if (!requireAccess('music', 'Family Circle Music')) return
    setToolMode('music')
    setActiveTab('home')
  }

  function openMusicCommunity() {
    if (!requireAccess('music', 'Music Community')) return
    setMusicCommunityProfileError(''); setMusicCommunityEditing(false); setMusicCommunitySettingsOpen(false); setMusicCommunitySafetyMode(null); setMusicCommunitySafetyMessage(''); setMusicCommunityProfileView(false); setMusicCommunityViewedProfile(null)
    const profile=musicCommunityProfiles[selectedMemberId]
    setMusicCommunityDisplayName(profile?.displayName ?? ''); setMusicCommunityHandle(profile?.handle ?? ''); setMusicCommunityBio(profile?.bio ?? ''); setMusicCommunityPhoto(profile?.photo ?? null); setMusicCommunityProfileSongId(profile?.profileSongId ?? null); setMusicCommunityVisibility(profile?.visibility ?? { bio:true, likedMusic:true, savedMusic:false, followers:true, allowFollowers:true })
    setToolMode('musicCommunity'); setActiveTab('home')
  }
  function persistMusicCommunityProfiles(next: Record<string, MusicCommunityProfile>) {
    setMusicCommunityProfiles(next); localStorage.setItem('family-circle-music-community-profiles',JSON.stringify(next)); localStorage.removeItem('family-circle-music-community-profile')
  }
  function createMusicCommunityProfile() {
    const displayName=musicCommunityDisplayName.trim().slice(0,40), handle=musicCommunityHandle.trim().replace(/^@+/,'').replace(/\s+/g,'').slice(0,24), bio=musicCommunityBio.trim().slice(0,160)
    if (!displayName || !handle) { setMusicCommunityProfileError('Add a public display name and @handle to continue.'); return }
    persistMusicCommunityProfiles({ ...musicCommunityProfiles, [selectedMemberId]: { displayName,handle,bio,photo:musicCommunityPhoto,profileSongId:musicCommunityProfileSongId,visibility:musicCommunityVisibility } }); setMusicCommunityProfileError('')
  }
  function saveMusicCommunityProfile() {
    const displayName=musicCommunityDisplayName.trim().slice(0,40), handle=musicCommunityHandle.trim().replace(/^@+/,'').replace(/\s+/g,'').slice(0,24), bio=musicCommunityBio.trim().slice(0,160)
    if (!displayName || !handle) { setMusicCommunityProfileError('Add a public display name and @handle to continue.'); return }
    persistMusicCommunityProfiles({ ...musicCommunityProfiles, [selectedMemberId]: { displayName,handle,bio,photo:musicCommunityPhoto,profileSongId:musicCommunityProfileSongId,visibility:musicCommunityVisibility } }); setMusicCommunityEditing(false); setMusicCommunitySettingsOpen(false); setMusicCommunityProfileError('')
  }
  function handleMusicCommunityPhoto(file: File) {
    if (!file.type.startsWith('image/')) return
    const reader=new FileReader(); reader.onload=()=>{ const photo=typeof reader.result==='string'?reader.result:null; if(photo) setMusicCommunityPhoto(photo) }; reader.readAsDataURL(file)
  }
  function submitMusicCommunitySafety() {
    const handle=musicCommunitySafetyHandle.trim().replace(/^@+/,'').replace(/\s+/g,''); if(!handle) return
    const key='family-circle-music-community-blocked', existing=JSON.parse(localStorage.getItem(key)||'[]') as string[]
    localStorage.setItem(key,JSON.stringify(Array.from(new Set([...existing,handle])))); setMusicCommunitySafetyMessage(musicCommunitySafetyMode==='block-report'?'Creator blocked and report recorded for this demo.':'Creator blocked for this demo.'); setMusicCommunitySafetyHandle(''); setMusicCommunitySafetyMode(null)
  }
  function setMusicVolumeLevel(value: number) {
    const next = Math.min(1, Math.max(0, value))
    setMusicVolume(next)
    localStorage.setItem('family-circle-music-volume', String(next))
    if (musicAudioRef.current) musicAudioRef.current.volume = next
  }

  function toggleMusicPlayback() {
    const audio = musicAudioRef.current
    if (musicCurrentTrack && !musicCurrentTrack.audioSrc) { setMusicPlaying((current) => !current); return }
    if (!musicCurrentTrack?.audioSrc || !audio) return
    if (audio.paused) void audio.play().then(() => setMusicPlaying(true)).catch(() => setMusicPlaying(false))
    else { audio.pause(); setMusicPlaying(false) }
  }

  function handleMusicEnded() {
    setMusicPlaying(false)
    setMusicCurrentTime(0)
    const next = musicLibrary.find((track) => track.id !== musicCurrentTrack?.id && (!musicPlaylist || track.genres.includes(musicPlaylist)) && (!musicChildMode || track.kidsAllowed))
    if (next) selectMusicTrack(next)
  }

  function selectMusicTrack(track: MusicTrack) {
    if (accountType === 'child' && !childPermissions.music) return
    if (musicChildMode && !track.kidsAllowed) return
    setMusicCurrentTrack(track)
    setMusicCurrentTime(0)
    setMusicMiniPlayerVisible(true)
    setMusicPlaying(Boolean(track.audioSrc))
    setMusicRecentlyPlayed((current) => [track.id, ...current.filter((id) => id !== track.id)].slice(0, 8))
  }

  function selectMusicPlaylist(playlist: string) {
    if (!requireAccess('music', 'Family Circle Music')) return
    setMusicPlaylist(playlist)
  }

  function musicVisibleTracks() {
    return musicLibrary.filter((track) => (!musicPlaylist || track.genres.includes(musicPlaylist)) && (!musicChildMode || track.kidsAllowed))
  }


  const selectedMember = members.find((member) => member.id === selectedMemberId) ?? members[0]
  const profileTarget = members.find((member) => member.id === profileTargetId) ?? selectedMember
  const sharedMembers = members.filter((member) => locationSharing[member.id])
  const todaysEvents = events.filter((event) => event.date === todayKey()).sort((a, b) => a.time.localeCompare(b.time))
  const openTasks = tasks.filter((task) => !task.completed)
  const pendingMoney = moneyRequests.filter((request) => request.status === 'Pending')
  const unreadMessageCount = messages.filter((message) => message.memberId !== selectedMember.id && !readMessageIdsByMember[selectedMember.id]?.includes(message.id)).length

  function completeOnboarding(_family: { id: string; name: string }, setup: { accountType: AccountType; plan: Plan; childPermissions: ChildPermissions }) {
    setAccountType(setup.accountType)
    setSubscription({ plan: setup.plan, monthlyPublishAllowance: SUBSCRIPTION_CONFIG[setup.plan].monthlyPublishAllowance, monthlyPublishedTracks: 0 })
    setChildPermissions(setup.childPermissions)
    setShowOnboarding(false)
    setOnboardingView('families')
    setScreen('members')
  }

  function hasChildAccess(key: ChildPermissionKey) {
    return accountType !== 'child' || childPermissions[key]
  }

  function requireAccess(key: ChildPermissionKey, featureName: string) {
    if (accountType !== 'child') return true
    if (childPermissions[key]) return true
    setAccessNotice({
      title: featureName + ' is restricted',
      message: 'Your Family Moderator has restricted access to this feature.',
      action: 'restriction',
    })
    return false
  }


  function switchFamily() {
    setOnboardingView('families')
    setShowOnboarding(true)
  }

  function persistMember(updated: FamilyMember) {
    setMembers((current) => current.map((member) => member.id === updated.id ? updated : member))
    localStorage.setItem(`family-circle-member-${updated.id}`, JSON.stringify(updated))
  }

  function memberRecognition(member: FamilyMember): MemberRecognition { return member.recognition ?? { famOfWeekWins: 0, clownOfWeekWins: 0, weeklyAwards: [] } }
  function castWeeklyVote(type: 'fam' | 'clown', candidateId: string) {
    if (!isRecognitionVotingOpen() || !members.some((member) => member.id === candidateId)) return
    setWeeklyRecognition((current) => current.weekKey === recognitionWeekKey() ? { ...current, [type === 'fam' ? 'famVotes' : 'clownVotes']: { ...(type === 'fam' ? current.famVotes : current.clownVotes), [selectedMember.id]: candidateId } } : current)
  }
  function submitTieStatement(type: 'fam' | 'clown', candidateId: string) {
    const tie = type === 'fam' ? weeklyRecognition.famTie : weeklyRecognition.clownTie
    if (!tie?.candidates.includes(candidateId) || selectedMember.id !== candidateId) return
    const statement = (tieStatementDrafts[candidateId] ?? '').trim().slice(0, 240)
    if (!statement) return
    setWeeklyRecognition((current) => { const target = type === 'fam' ? current.famTie : current.clownTie; if (!target) return current; const nextTie = { ...target, statements: { ...target.statements, [candidateId]: statement } }; return { ...current, [type === 'fam' ? 'famTie' : 'clownTie']: nextTie } })
    setTieStatementDrafts((current) => ({ ...current, [candidateId]: '' }))
  }
  function castTieBreakVote(type: 'fam' | 'clown', candidateId: string) {
    if (!isRecognitionTieBreakOpen()) return
    const tie = type === 'fam' ? weeklyRecognition.famTie : weeklyRecognition.clownTie
    if (!tie?.candidates.includes(candidateId)) return
    setWeeklyRecognition((current) => { const target = type === 'fam' ? current.famTie : current.clownTie; if (!target) return current; const nextTie = { ...target, votes: { ...target.votes, [selectedMember.id]: candidateId } }; return { ...current, [type === 'fam' ? 'famTie' : 'clownTie']: nextTie } })
  }
  function finaliseWeeklyRecognition() {
    const now = new Date()
    if (weeklyRecognition.weekKey !== recognitionWeekKey()) return
    if (now.getDay() !== 0 || now.getHours() < 20) return
    let next = weeklyRecognition
    const tally = (votes: Record<string,string>, candidates: string[]) => {
      const counts = new Map<string, number>(); candidates.forEach((id) => counts.set(id, 0)); Object.values(votes).forEach((id) => counts.set(id, (counts.get(id) ?? 0) + 1)); const max = Math.max(0, ...counts.values()); const leaders = [...counts.entries()].filter(([,count]) => count === max && max > 0).map(([id]) => id); return { leaders, counts }
    }
    const candidates = members.map((member) => member.id)
    if (now.getHours() >= 20 && !next.famWinner && !next.famTie && !next.famAnnounced) {
      const result=tally(next.famVotes,candidates)
      if (result.leaders.length === 1) next={...next,famWinner:result.leaders[0],famAnnounced:true}
      else if (result.leaders.length > 1) next={...next,famTie:{candidates:result.leaders,votes:{},statements:{}},famAnnounced:false}
      else next={...next,famAnnounced:true}
    }
    if (now.getHours() >= 20 && !next.clownWinner && !next.clownTie && !next.clownAnnounced) {
      const result=tally(next.clownVotes,candidates)
      if (result.leaders.length === 1) next={...next,clownWinner:result.leaders[0],clownAnnounced:true}
      else if (result.leaders.length > 1) next={...next,clownTie:{candidates:result.leaders,votes:{},statements:{}},clownAnnounced:false}
      else next={...next,clownAnnounced:true}
    }
    if (isRecognitionTieBreakOpen()) {
      (['fam','clown'] as const).forEach((type) => { const tie=type==='fam'?next.famTie:next.clownTie; if (!tie || (type==='fam'&&next.famWinner) || (type==='clown'&&next.clownWinner)) return; const result=tally(tie.votes,tie.candidates); if(result.leaders.length===1){ next={...next,[type==='fam'?'famWinner':'clownWinner']:result.leaders[0],[type==='fam'?'famTie':'clownTie']:null,[type==='fam'?'famAnnounced':'clownAnnounced']:true} } })
    }
    const awardsToApply: Array<{type:'fam'|'clown'; winner:string|null}> = [{type:'fam',winner:next.famWinner},{type:'clown',winner:next.clownWinner}]
    if (next.famWinner && !weeklyRecognition.famWinner) applyRecognitionAward(next.famWinner,'fam',next.weekKey)
    if (next.clownWinner && !weeklyRecognition.clownWinner) applyRecognitionAward(next.clownWinner,'clown',next.weekKey)
    if (next.famWinner || next.famAnnounced || next.famTie) {
      const winnerName=next.famWinner?members.find(m=>m.id===next.famWinner)?.label:null
      if (winnerName && !messages.some(m=>m.id===`recognition-fam-${next.weekKey}`)) setMessages(current=>[{id:`recognition-fam-${next.weekKey}`,memberId:next.famWinner!,name:'Family Circle',initials:'FC',accent:'member-accent-one',time:'20:00',text:`🏆 Fam of the Week: ${winnerName}! ⭐`},...current])
      else if (!winnerName && next.famAnnounced && !messages.some(m=>m.id===`recognition-fam-none-${next.weekKey}`)) setMessages(current=>[{id:`recognition-fam-none-${next.weekKey}`,memberId:selectedMember.id,name:'Family Circle',initials:'FC',accent:selectedMember.accent,time:'20:00',text:'🏆 Fam of the Week: No votes were received this week.'},...current])
    }
    if (next.clownWinner && !messages.some(m=>m.id===`recognition-clown-${next.weekKey}`)) { const winnerName=members.find(m=>m.id===next.clownWinner)?.label; if(winnerName) setMessages(current=>[{id:`recognition-clown-${next.weekKey}`,memberId:next.clownWinner!,name:'Family Circle',initials:'FC',accent:'member-accent-three',time:'20:00',text:`🤡 Clown of the Week: ${winnerName}! 🤡`},...current]) }
    if (next.famWinner!==weeklyRecognition.famWinner || next.clownWinner!==weeklyRecognition.clownWinner || next.famTie!==weeklyRecognition.famTie || next.clownTie!==weeklyRecognition.clownTie || next.famAnnounced!==weeklyRecognition.famAnnounced || next.clownAnnounced!==weeklyRecognition.clownAnnounced) setWeeklyRecognition(next)
  }
  function applyRecognitionAward(winnerId:string,type:'fam'|'clown',weekKey:string) {
    setMembers(current=>current.map(member=>{ if(member.id!==winnerId) return member; const recognition=memberRecognition(member); if(recognition.weeklyAwards.some(a=>a.weekKey===weekKey&&a.type===type)) return member; const updatedRecognition={...recognition, famOfWeekWins:recognition.famOfWeekWins+(type==='fam'?1:0), clownOfWeekWins:recognition.clownOfWeekWins+(type==='clown'?1:0), weeklyAwards:[...recognition.weeklyAwards,{weekKey,type}]}; const updated={...member,recognition:updatedRecognition}; localStorage.setItem(`family-circle-member-${member.id}`,JSON.stringify(updated)); return updated}))
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
    if (!homeEntryAudioRef.current) {
      homeEntryAudioRef.current = new Audio(`${import.meta.env.BASE_URL}audio/welcome-to-family-circle.mp3`)
      homeEntryAudioRef.current.preload = 'auto'
    }
    homeEntryAudioRef.current.volume = 0.88
    void homeEntryAudioRef.current.play().catch(() => {})
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
    if (tab === 'home' && toolMode === 'musicCommunity') {
      musicAudioRef.current?.pause()
      setMusicCurrentTrack(null)
      setMusicPlaying(false)
      setMusicCurrentTime(0)
      setMusicDuration(0)
      setMusicMiniPlayerVisible(false)
      setMusicCommunityProfileView(false)
      setMusicCommunityViewedProfile(null)
    }
    const accessKey: Partial<Record<HomeTab, ChildPermissionKey>> = { chat: 'chat', photos: 'photos', calendar: 'tasks', tasks: 'tasks' }
    const key = accessKey[tab]
    if (key && !requireAccess(key, tab === 'chat' ? 'Family Chat' : tab === 'photos' ? 'Family Photos & Videos' : tab === 'calendar' ? 'Calendar' : 'Family Tasks')) return
    setActiveTab(tab)
    setToolMode(null)
    if (tab === 'chat') markMessagesRead(selectedMember.id)
  }

  function openTool(mode: ToolMode) {
    const accessKey: Partial<Record<ToolMode, ChildPermissionKey>> = { games: 'games', music: 'music', map: 'location' }
    const key = accessKey[mode]
    if (key && !requireAccess(key, mode === 'games' ? 'Family Games' : mode === 'music' ? 'Family Circle Music' : 'Location Sharing')) return
    setToolMode(mode)
    setActiveTab('home')
    if (mode === 'map') requestBrowserLocation((coordinates) => setDemoLocation(coordinates))
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
    setProfileSavedView(false)
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
    setProfileSavedView(true)
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

      <section className="fc-home-emergency-feature">
        <button className="fc-home-emergency-card" type="button" onClick={() => openTool('emergency')}>
          <span className="fc-home-emergency-icon">🚨</span>
          <span className="fc-home-emergency-copy"><strong>Family Emergency</strong><small>Get family help quickly</small></span>
          <b>→</b>
        </button>
      </section>

      <section className="fc-home-music-community">
        <button className="fc-home-music-community-card" type="button" onClick={openMusicCommunity}>
          <div className="fc-home-music-community-art" aria-hidden="true">
            {musicCurrentTrack?.artwork ? <img src={musicCurrentTrack.artwork} alt="" /> : <div className="fc-home-music-equalizer">{Array.from({ length: 13 }, (_, index) => <i key={index} style={{ animationDelay: `${index * -0.08}s` }} />)}</div>}
          </div>
          <div className="fc-home-music-community-copy">
            <span className="fc-home-music-community-kicker">🎵 Family Circle Music</span>
            <strong>Music Community</strong>
            <p>Discover music created by Family Circle members around the world.</p>
            <span className="fc-home-music-community-action">Enter Music Community →</span>
          </div>
          <div className="fc-home-music-community-status">
            <span>{musicCurrentTrack ? 'Now playing' : 'Discover'}</span>
            <strong>{musicCurrentTrack ? musicCurrentTrack.title : 'New music'}</strong>
          </div>
        </button>
      </section>

      <section className="fc-home-court-feature">
        <button className="fc-home-court-card" type="button" onClick={() => openTool('games')}>
          <span className="fc-home-court-icon">⚖️</span>
          <span className="fc-home-court-copy"><small>Settle it in the circle</small><strong>Family Court</strong><em>Bring your family case before the jury.</em></span>
          <b>→</b>
        </button>
      </section>

      <section className="fc-dashboard-grid">
        <article className="fc-dashboard-card cyan"><div className="fc-card-head"><div><small>Family Chat</small><h2>Latest conversation</h2></div><div className="fc-card-head-actions">{unreadMessageCount > 0 && <span className="fc-unread-count">{unreadMessageCount} new</span>}<button type="button" onClick={() => goToTab('chat')}>→</button></div></div>{firstThreeMessages.map((message) => <div className={isMessageUnread(message.id) ? "fc-mini-row fc-unread-row" : "fc-mini-row"} key={message.id}><AppAvatar member={members.find((m) => m.id === message.memberId) ?? selectedMember} /><div><strong>{message.name}</strong><span>{message.text}</span></div><time>{message.time}</time></div>)}<button className="fc-outline-button" type="button" onClick={() => goToTab('chat')}>View All Messages →</button></article>
        <article className="fc-dashboard-card pink"><div className="fc-card-head"><div><small>Today's Events</small><h2>Family plans</h2></div><button type="button" onClick={() => goToTab('calendar')}>→</button></div>{todaysEvents.length ? todaysEvents.slice(0, 3).map((event) => <div className="fc-mini-row" key={event.id}><span className="fc-event-icon">📅</span><div><strong>{event.title}</strong><span>{event.time} · {event.location}</span></div></div>) : <p className="fc-muted">No more events today.</p>}<button className="fc-outline-button pink" type="button" onClick={() => goToTab('calendar')}>View Calendar →</button></article>
        <article className="fc-dashboard-card purple"><div className="fc-card-head"><div><small>Family Memories</small><h2>Latest photo</h2></div><button type="button" onClick={() => goToTab('photos')}>→</button></div>{photos[0] ? <img className="fc-latest-photo" src={photos[0].src} alt="Latest family" /> : <div className="fc-photo-placeholder"><span>▧</span><strong>Moments that matter ♡</strong><small>Send a photo in Family Chat.</small></div>}<button className="fc-outline-button purple" type="button" onClick={() => goToTab('photos')}>Open Photos →</button></article>
        <article className="fc-dashboard-card green"><div className="fc-card-head"><div><small>Family Tasks · {openTasks.length} open</small><h2>Your responsibilities</h2></div><button type="button" onClick={() => goToTab('tasks')}>→</button></div>{firstThreeTasks.map((task) => { const assigned = members.find((m) => m.id === task.assignedTo) ?? selectedMember; return <button className="fc-task-row" type="button" key={task.id} onClick={() => toggleTask(task.id)}><span className={task.completed ? 'fc-check done' : 'fc-check'}>{task.completed ? '✓' : ''}</span><span><strong>{task.title}</strong><small>{task.completed ? 'Completed' : `Due ${formatShortDate(task.dueDate)} · ${assigned.label}`}</small></span></button> })}<button className="fc-outline-button green" type="button" onClick={() => goToTab('tasks')}>View All Tasks →</button></article>
      </section>

      <section className="fc-feature-grid">
        <button className={`fc-feature-card map-card${!hasChildAccess('location') ? ' fc-feature-card-locked' : ''}`} type="button" onClick={() => openTool('map')}><span className="fc-feature-icon">📍</span><div><small>Family location</small><strong>Where Is Everyone?</strong><span>{sharedMembers.length} family member{sharedMembers.length === 1 ? '' : 's'} sharing location</span></div><b>→</b></button>
        <button className="fc-feature-card members-card" type="button" onClick={() => openTool('family')}><span className="fc-feature-icon">👨‍👩‍👧‍👦</span><div><small>Your family</small><strong>Family Members</strong><span>View the family tree and profiles.</span></div><b>→</b></button>
        <button className={`fc-feature-card games-card${!hasChildAccess('games') ? ' fc-feature-card-locked' : ''}`} type="button" onClick={() => openTool('games')}><span className="fc-feature-icon">🎮</span><div><small>Fun together</small><strong>Challenge a Family Member</strong><span>Games hub coming soon.</span></div><b>→</b></button>
        <button className={`fc-feature-card music-card${!hasChildAccess('music') ? ' fc-feature-card-locked' : ''}`} type="button" onClick={openMusic}><span className="fc-feature-icon">♫</span><div><small>Family Circle Music</small><strong>Music for the family</strong><span>Original music, playlists and more.</span></div><b>→</b></button>
        <button className="fc-feature-card shopping-feature-card" type="button" onClick={() => goToTab('shopping')}><span className="fc-feature-icon">🛒</span><div><small>Family shopping</small><strong>Weekly Shop</strong><span>Keep the family shopping list together.</span></div><b>→</b></button>
        <button className="fc-feature-card court-feature-card" type="button" onClick={() => openTool('games')}><span className="fc-feature-icon">⚖️</span><div><small>Family jury</small><strong>Family Court</strong><span>Bring a family dispute before the circle.</span></div><b>→</b></button>
      </section>

      {renderBottomNav()}
      <div className="fc-footer"><div className="fc-footer-actions"><button type="button" onClick={() => setScreen('members')}>Switch family member</button><button type="button" onClick={switchFamily}>Switch family</button></div><span>Foundation build</span></div>
    </div>
  }

  function renderChat() {
    return <div className="fc-page"><FeatureHeader title="Family Chat" description="Keep the family conversation together in one private space." onHome={() => goToTab('home')} /><div className="fc-feature-shell">
      <section className="fc-weekly-awards-panel">
        <div className="fc-weekly-awards-head"><div><p className="fc-kicker">Every Sunday</p><h2>⭐ Weekly Family Awards</h2></div><span className={isRecognitionVotingOpen() ? 'fc-vote-status open' : 'fc-vote-status'}>{isRecognitionVotingOpen() ? 'Voting open · 5–8 PM' : weeklyRecognition.famTie || weeklyRecognition.clownTie ? 'Tie-breaker in Chat' : 'Voting closed'}</span></div>
        {isRecognitionVotingOpen() ? <div className="fc-award-vote-grid">
          <div className="fc-award-vote-card fam"><span>⭐</span><strong>Fam of the Week</strong><small>Choose your family favourite.</small><div className="fc-award-candidates">{members.map(member=><button key={member.id} type="button" className={weeklyRecognition.famVotes[selectedMember.id]===member.id?'selected':''} onClick={()=>castWeeklyVote('fam',member.id)}><AppAvatar member={member}/><span>{member.label}</span>{weeklyRecognition.famVotes[selectedMember.id]===member.id&&<b>✓</b>}</button>)}</div></div>
          <div className="fc-award-vote-card clown"><span>🤡</span><strong>Clown of the Week</strong><small>Choose this week's chaos champion.</small><div className="fc-award-candidates">{members.map(member=><button key={member.id} type="button" className={weeklyRecognition.clownVotes[selectedMember.id]===member.id?'selected':''} onClick={()=>castWeeklyVote('clown',member.id)}><AppAvatar member={member}/><span>{member.label}</span>{weeklyRecognition.clownVotes[selectedMember.id]===member.id&&<b>✓</b>}</button>)}</div></div>
        </div> : <div className="fc-award-closed">
          <div><strong>🔒 The weekly vote is closed.</strong><span>Votes are only counted between 5:00 PM and 8:00 PM on Sunday.</span></div>
          {weeklyRecognition.famWinner && <div className="fc-award-result fam"><span>⭐</span><div><small>Fam of the Week</small><strong>{members.find(m=>m.id===weeklyRecognition.famWinner)?.label}</strong></div></div>}
          {weeklyRecognition.clownWinner && <div className="fc-award-result clown"><span>🤡</span><div><small>Clown of the Week</small><strong>{members.find(m=>m.id===weeklyRecognition.clownWinner)?.label}</strong></div></div>}
          {weeklyRecognition.famTie && <div className="fc-tie-break"><strong>⭐ Fam tie-breaker</strong><p>Make your family case in Chat, then vote for the winner.</p>{weeklyRecognition.famTie.candidates.map(id=>{const member=members.find(m=>m.id===id)!; return <div className="fc-tie-candidate" key={id}><AppAvatar member={member}/><div><strong>{member.label}</strong>{weeklyRecognition.famTie?.statements[id]&&<p>“{weeklyRecognition.famTie.statements[id]}”</p>}{selectedMember.id===id&&<><textarea value={tieStatementDrafts[id]??''} maxLength={240} rows={2} onChange={e=>setTieStatementDrafts(c=>({...c,[id]:e.target.value}))} placeholder="Explain your Family Moment of the Week…" /><button className="fc-outline-button" type="button" onClick={()=>submitTieStatement('fam',id)}>Post my case</button></>}{isRecognitionTieBreakOpen()&&<button className="fc-outline-button" type="button" onClick={()=>castTieBreakVote('fam',id)}>Vote for {member.label}</button>}</div></div>})}</div>}
          {weeklyRecognition.clownTie && <div className="fc-tie-break"><strong>🤡 Clown tie-breaker</strong><p>Explain your Clown Moment of the Week, then let the family decide.</p>{weeklyRecognition.clownTie.candidates.map(id=>{const member=members.find(m=>m.id===id)!; return <div className="fc-tie-candidate" key={id}><AppAvatar member={member}/><div><strong>{member.label}</strong>{weeklyRecognition.clownTie?.statements[id]&&<p>“{weeklyRecognition.clownTie.statements[id]}”</p>}{selectedMember.id===id&&<><textarea value={tieStatementDrafts[id]??''} maxLength={240} rows={2} onChange={e=>setTieStatementDrafts(c=>({...c,[id]:e.target.value}))} placeholder="Explain your Clown Moment of the Week…" /><button className="fc-outline-button" type="button" onClick={()=>submitTieStatement('clown',id)}>Post my case</button></>}{isRecognitionTieBreakOpen()&&<button className="fc-outline-button" type="button" onClick={()=>castTieBreakVote('clown',id)}>Vote for {member.label}</button>}</div></div>})}</div>}
        </div>}
      </section><div className="fc-panel"><div className="fc-panel-head"><div><small>Family conversation</small><h2>Chat</h2></div><span className="fc-pill">Private family space</span></div><div className="fc-chat-list">{messages.map((message, index) => { const linkedMoneyRequest = message.moneyRequestId ? moneyRequests.find((request) => request.id === message.moneyRequestId) : null; const requester = linkedMoneyRequest ? members.find((member) => member.id === linkedMoneyRequest.requesterId) ?? selectedMember : null; const lender = linkedMoneyRequest?.lenderId ? members.find((member) => member.id === linkedMoneyRequest.lenderId) : null; const unread = isMessageUnread(message.id); const outgoing = message.memberId === selectedMember.id; const previous = messages[index - 1]; const grouped = Boolean(previous && previous.memberId === message.memberId); return <div className={outgoing ? (unread ? "fc-chat-row fc-chat-row-outgoing fc-unread-row" : "fc-chat-row fc-chat-row-outgoing") : (unread ? "fc-chat-row fc-chat-row-incoming fc-unread-row" : "fc-chat-row fc-chat-row-incoming")} key={message.id}><AppAvatar member={members.find((m) => m.id === message.memberId) ?? selectedMember} className={grouped ? "fc-chat-avatar fc-chat-avatar-grouped" : "fc-chat-avatar"} /><div className="fc-chat-bubble"><div className="fc-chat-meta">{!grouped && <strong>{outgoing ? "You" : message.name}</strong>}{unread && <span className="fc-unread-label">NEW</span>}<time>{message.time}</time></div>{linkedMoneyRequest ? <div className="fc-money-chat-card"><div className="fc-money-chat-head"><strong>💷 Money Request</strong><span className={linkedMoneyRequest.status === 'Accepted' ? 'fc-money-chat-status accepted' : 'fc-money-chat-status'}>{linkedMoneyRequest.status === 'Accepted' ? 'Accepted' : 'Awaiting acceptance'}</span></div><strong className="fc-money-chat-amount">£{linkedMoneyRequest.amount}</strong><p>{linkedMoneyRequest.purpose}</p><small>Requested by {requester?.label ?? message.name} · Repayment due {formatLongDate(linkedMoneyRequest.dueDate)}</small>{linkedMoneyRequest.status === 'Accepted' && <small className="fc-money-chat-accepted">✓ Accepted by {lender?.label ?? 'family member'} · Repayment task and calendar event created.</small>}{linkedMoneyRequest.status === 'Pending' && linkedMoneyRequest.requesterId !== selectedMember.id && <button className="fc-money-chat-accept" type="button" onClick={() => acceptMoneyRequest(linkedMoneyRequest.id)}>Accept Request</button>}{linkedMoneyRequest.status === 'Pending' && linkedMoneyRequest.requesterId === selectedMember.id && <small className="fc-money-chat-waiting">Waiting for another family member to accept.</small>}</div> : <><p>{message.text}</p>{message.image && <img src={message.image} alt="Family shared" />}</>}</div></div> })}</div>{pendingChatPhoto && <div className="fc-pending-photo"><img src={pendingChatPhoto} alt="Ready to send" /><button type="button" onClick={() => setPendingChatPhoto(null)}>×</button></div>}<div className="fc-composer"><label className="fc-attach"><input className="fc-hidden" type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) stageChatPhoto(file); event.currentTarget.value = '' }} />＋ Photo</label><input value={chatDraft} onChange={(event) => setChatDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') sendChatMessage() }} placeholder="Write a family message…" /><button type="button" onClick={sendChatMessage}>Send</button></div></div></div>{renderBottomNav()}</div>
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
    const mapEmbedUrl = demoLocation
      ? (() => {
          const lat = demoLocation.latitude
          const lon = demoLocation.longitude
          const latDelta = 0.008
          const lonDelta = 0.012 / Math.max(Math.cos((lat * Math.PI) / 180), 0.2)
          const bbox = [lon - lonDelta, lat - latDelta, lon + lonDelta, lat + latDelta].map((value) => value.toFixed(6)).join(',')
          return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat.toFixed(6)},${lon.toFixed(6)}`
        })()
      : ''

    return <div className="fc-page">
      <FeatureHeader title="Where Is Everyone?" description="For this demo, the map uses the location of the person currently using the app." onHome={() => goToTab('home')} />
      <div className="fc-map-layout">
        <div className="fc-map-shell">
          {demoLocation ? <iframe className="fc-map-frame" title="Your current location map" src={mapEmbedUrl} loading="lazy" /> : <div className="fc-map-state"><span>{locationPermission === 'denied' ? '📍' : '⌖'}</span><strong>{locationPermission === 'denied' ? 'Location permission is needed' : 'Finding your location…'}</strong><p>{locationPermission === 'denied' ? 'Allow location access in your browser, then try again.' : 'Family Circle is asking your browser for your current location.'}</p>{locationPermission === 'denied' && <button className="fc-primary-button" type="button" onClick={() => requestBrowserLocation((coordinates) => setDemoLocation(coordinates))}>Try Again</button>}</div>}
          <div className="fc-map-overlay"><span>📍</span><strong>{demoLocation ? 'You are here' : 'Your location'}</strong></div>
        </div>
        <div className="fc-map-sidebar">
          <div className="fc-panel-head"><div><small>Demo location</small><h2>Your location</h2></div><span className={locationPermission === 'granted' ? 'fc-pill' : 'fc-pill danger'}>{locationPermission === 'granted' ? 'Sharing' : locationPermission === 'denied' ? 'Blocked' : 'Checking'}</span></div>
          <div className="fc-location-row"><AppAvatar member={selectedMember} /><span><strong>{selectedMember.label} · You</strong><small>{demoLocation ? 'Current device location' : 'Waiting for browser permission'}</small></span><span className="fc-location-live">{demoLocation ? '● Live' : '—'}</span></div>
          <div className="fc-map-actions">
            <button className="fc-ghost-button" type="button" onClick={() => requestBrowserLocation((coordinates) => setDemoLocation(coordinates))}>Update my location</button>
            {demoLocation && <a className="fc-ghost-button" href={`https://www.openstreetmap.org/?mlat=${demoLocation.latitude}&mlon=${demoLocation.longitude}#map=16/${demoLocation.latitude}/${demoLocation.longitude}`} target="_blank" rel="noreferrer">Open larger map ↗</a>}
          </div>
          <div className="fc-map-demo-note"><strong>Demo behaviour</strong><span>Send the GitHub Pages link to a tester and their own browser location is used after they grant location permission. This demo does not save the location to the family account.</span></div>
        </div>
      </div>
      {renderBottomNav()}
    </div>
  }

  function renderProfile() {
    const isOwn = profileTarget.id === selectedMember.id
    return <div className="fc-page">
      <FeatureHeader title={isOwn ? 'My Profile' : profileTarget.label} description={isOwn ? 'Your Family Circle identity, ready to share with the people who matter.' : 'Family profile details.'} onHome={() => goToTab('home')} />
      {isOwn && profileSavedView ? <section className="fc-profile-saved-shell">
        <div className="fc-profile-saved-hero">
          <div className="fc-profile-saved-photo-wrap">
            <button className="fc-profile-photo-view-button" type="button" onClick={() => profileTarget.photo && setProfilePhotoViewer(profileTarget.photo)} aria-label="View profile photo"><AppAvatar member={profileTarget} className="fc-profile-saved-photo" />{profileTarget.photo && <span>View photo</span>}</button>
            <span className="fc-profile-saved-status">● {profileTarget.status}</span>
          </div>
          <div className="fc-profile-saved-copy">
            <p className="fc-kicker">Family Circle profile</p>
            <h2>{profileTarget.label}</h2>
            <p className="fc-profile-saved-bio">{profileTarget.bio || 'No bio yet.'}</p>
            <div className="fc-profile-saved-links">
              <a className="fc-phone-link" href={`tel:${profileTarget.phone}`}>☎ {profileTarget.phone}</a>
              {socialNames.filter((name) => profileTarget.socials[name]).map((name) => <a key={name} href={profileTarget.socials[name]} target="_blank" rel="noreferrer">{socialIcons[name]} {name}</a>)}
            </div>
            <div className="fc-profile-saved-actions">
              <button className="fc-primary-button" type="button" onClick={() => setProfileSavedView(false)}>✎ Edit Profile</button>
              <button className="fc-ghost-button" type="button" onClick={() => goToTab('home')}>← Back Home</button>
            </div>
          </div>
        </div>
        <div className="fc-profile-saved-strip">
          <span>✓ Profile saved</span>
          <small>Your profile is now shown as a full profile view.</small>
        </div>
                <RecognitionProfile member={profileTarget} members={members} />
      </section> : <div className="fc-profile-layout">
        <div className="fc-panel fc-profile-hero">
          <div className="fc-profile-photo-wrap">{isOwn ? <label className="fc-profile-photo-button"><AppAvatar member={{ ...profileTarget, photo: profileTarget.photo }} className="fc-profile-photo" /><span>Change photo</span><input className="fc-hidden" type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) uploadProfilePhoto(file); event.currentTarget.value = '' }} /></label> : <AppAvatar member={profileTarget} className="fc-profile-photo" />} {isOwn && profileTarget.photo && <div className="fc-profile-photo-actions"><button className="fc-profile-photo-view-link" type="button" onClick={() => setProfilePhotoViewer(profileTarget.photo!)}>View photo</button><button className="fc-remove-photo" type="button" onClick={removeProfilePhoto}>Remove photo</button></div>}</div>
          <h2>{profileTarget.label}</h2>
          <p className="fc-status-chip">My Status · {profileTarget.status}</p>
          <p className="fc-muted">{profileTarget.bio || 'No bio yet.'}</p>
          <a className="fc-phone-link" href={`tel:${profileTarget.phone}`}>☎ {profileTarget.phone}</a>
        </div>
        <div className="fc-panel">
          <div className="fc-panel-head"><div><small>Profile details</small><h2>{isOwn ? 'Edit your details' : 'About this family member'}</h2></div></div>
          {isOwn ? <><label className="fc-textarea-label"><span>Short bio · {profileBio.length}/100</span><textarea maxLength={100} rows={4} value={profileBio} onChange={(event) => setProfileBio(event.target.value)} placeholder="A short line about you…" /></label><label className="fc-form-field"><span>My Status</span><select value={profileStatus} onChange={(event) => { setProfileStatus(event.target.value as StatusOption); changeStatus(event.target.value as StatusOption) }}>{statusOptions.map((status) => <option value={status} key={status}>{status}</option>)}</select></label><div className="fc-social-block"><strong>Social links</strong><p>Paste a real profile link. Active links show green.</p>{socialNames.map((name) => <label key={name}><span>{socialIcons[name]} {name}</span><input value={profileSocials[name]} onChange={(event) => setProfileSocials((current) => ({ ...current, [name]: event.target.value }))} placeholder={`https://${name.toLowerCase()}.com/...`} /><b className={profileSocials[name] ? 'active' : ''}>{profileSocials[name] ? 'Active' : 'Blank'}</b></label>)}</div>{profileMessage && <p className="fc-save-note">{profileMessage}</p>}<button className="fc-primary-button fc-profile-save-button" type="button" onClick={saveProfile}>Save Profile</button></> : <div className="fc-read-profile"><div><strong>My Status</strong><span>{profileTarget.status}</span></div><div><strong>Bio</strong><span>{profileTarget.bio || 'No bio yet.'}</span></div><div><strong>Phone</strong><a href={`tel:${profileTarget.phone}`}>{profileTarget.phone}</a></div><div><strong>Location sharing</strong><span>{locationSharing[profileTarget.id] ? 'On' : 'Off'}</span></div><div><strong>Social links</strong><span>{socialNames.some((name) => profileTarget.socials[name]) ? socialNames.filter((name) => profileTarget.socials[name]).map((name) => <a key={name} href={profileTarget.socials[name]} target="_blank" rel="noreferrer">{socialIcons[name]} {name}</a>) : 'None added yet.'}</span></div></div>}
        </div>
      </div>}
      {renderBottomNav()}
    </div>
  }
  function renderNotifications() {
    return <div className="fc-page"><FeatureHeader title="Notifications" description="Keep up with family chat, tasks, calendar and emergency requests." onHome={() => goToTab('home')} /><div className="fc-panel"><div className="fc-panel-head"><div><small>Family updates</small><h2>Notifications</h2></div><button className="fc-ghost-button" type="button" onClick={() => setNotifications([])}>Clear all</button></div>{notifications.length === 0 ? <div className="fc-empty"><span>✓</span><strong>You're all caught up.</strong><p>No new family notifications.</p></div> : <div className="fc-notification-list">{notifications.map((item) => <article key={item.id}><span className="fc-notification-icon">{item.kind === 'Emergency' ? '🚨' : item.kind === 'Money' ? '💷' : '•'}</span><div><strong>{item.title}</strong><p>{item.detail}</p><small>{item.time}</small></div></article>)}</div>}</div>{renderBottomNav()}</div>
  }

  function updateNotificationPreference(kind: keyof Omit<NotificationPreferences, 'Emergency'>, enabled: boolean) {
    const next = { ...notificationPreferences, [kind]: enabled, Emergency: true } as NotificationPreferences
    setNotificationPreferences(next)
    persistNotificationPreferences(next)
  }

  function renderSettings() {
    return <div className="fc-page">
      <FeatureHeader title="Settings" description="Family Circle preferences, permissions and family controls." onHome={() => goToTab('home')} />
      <div className="fc-panel fc-settings-list">
        <div className="fc-settings-section"><p className="fc-kicker">Notifications</p><h2>Family updates</h2><p className="fc-muted">Choose which family activity can send phone notifications. Emergency alerts are always on.</p></div>
        <div className="fc-setting-row"><span><strong>🚨 Emergency alerts</strong><small>Always on. Family safety alerts cannot be switched off.</small></span><span className="fc-setting-lock">🔒 Always On</span></div>
        <label className="fc-setting-row"><span><strong>💬 Chat messages</strong><small>Notify me when a family member sends a new message or shares a photo in Family Chat.</small></span><input type="checkbox" checked={notificationPreferences.Chat} onChange={(event) => updateNotificationPreference('Chat', event.target.checked)} /></label>
        <label className="fc-setting-row"><span><strong>✓ Task updates</strong><small>Notify me when family tasks are added, changed or completed.</small></span><input type="checkbox" checked={notificationPreferences.Task} onChange={(event) => updateNotificationPreference('Task', event.target.checked)} /></label>
        <label className="fc-setting-row"><span><strong>▦ Calendar updates</strong><small>Notify me when family events are added or changed.</small></span><input type="checkbox" checked={notificationPreferences.Calendar} onChange={(event) => updateNotificationPreference('Calendar', event.target.checked)} /></label>
        <label className="fc-setting-row"><span><strong>👤 Family/profile updates</strong><small>Notify me when a family member updates their status or profile.</small></span><input type="checkbox" checked={notificationPreferences.Profile} onChange={(event) => updateNotificationPreference('Profile', event.target.checked)} /></label>
        <label className="fc-setting-row"><span><strong>💷 Money updates</strong><small>Notify me about family money requests and accepted requests.</small></span><input type="checkbox" checked={notificationPreferences.Money} onChange={(event) => updateNotificationPreference('Money', event.target.checked)} /></label>
        <div className="fc-setting-note"><strong>Phone notifications foundation</strong><span>These preferences are now stored per device. The production push service will use the same rules when real accounts and device registration are connected.</span></div>
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


  function renderMusicCommunityProfilePage(profile: MusicCommunityProfile, demoStats?: { followers: number; following: number }) {
    const profileSong = profile.profileSongId ? musicCommunityDemoTracks.find((track) => track.id === profile.profileSongId) ?? null : null
    const creatorTracks = musicCommunityDemoTracks.filter((track) => {
      const artist = track.artist.toLowerCase().replace(/\s+/g, '')
      const handle = profile.handle.toLowerCase().replace(/\s+/g, '')
      const displayName = profile.displayName.toLowerCase().replace(/\s+/g, '')
      return track.id === profile.profileSongId || artist === handle || artist === displayName
    })
    const visibleTracks = creatorTracks.length > 0 ? creatorTracks : profileSong ? [profileSong] : []
    const playProfileSong = () => {
      if (!profileSong) return
      if (musicCurrentTrack?.id === profileSong.id) toggleMusicPlayback()
      else selectMusicTrack(profileSong)
    }
    return <div className="fc-page fc-music-community-profile-page">
      <header className="fc-music-community-profile-header">
        <button className="fc-ghost-button" type="button" onClick={() => setMusicCommunityProfileView(false)}>← Music Community</button>
        <span>Public Music Profile</span>
      </header>
      <section className="fc-music-creator-hero">
        <div className="fc-music-creator-hero-glow" aria-hidden="true" />
        <div className="fc-music-creator-avatar">{profile.photo ? <img src={profile.photo} alt="" /> : '♫'}</div>
        <span className="fc-music-community-badge">🎵 Music Creator</span>
        <h1>{profile.displayName}</h1>
        <p className="fc-music-creator-handle">@{profile.handle}</p>
        {profile.visibility.bio && profile.bio && <p className="fc-music-creator-bio">{profile.bio}</p>}
        <div className="fc-music-creator-stats">
          {profile.visibility.followers && <span><strong>{demoStats?.followers ?? 0}</strong> Followers</span>}
          {profile.visibility.followers && <span><strong>{demoStats?.following ?? 0}</strong> Following</span>}
          <span><strong>{visibleTracks.length}</strong> Releases</span>
        </div>
        <div className="fc-music-creator-actions">
          {profile.visibility.allowFollowers && <button className="fc-primary-button" type="button" onClick={() => {}}>＋ Follow</button>}
          {profileSong && <button className="fc-ghost-button" type="button" onClick={playProfileSong}>{musicCurrentTrack?.id === profileSong.id && musicPlaying ? 'Ⅱ Pause Profile Song' : '▶ Play Profile Song'}</button>}
        </div>
      </section>
      {profileSong && <section className="fc-music-creator-feature">
        <button className={'fc-music-creator-record'+(musicCurrentTrack?.id === profileSong.id && musicPlaying ? ' playing' : '')} type="button" onClick={playProfileSong} aria-label="Play profile song">
          <span>{profileSong.artwork ? <img src={profileSong.artwork} alt="" /> : '♫'}</span>
        </button>
        <div><small>FEATURED PROFILE SONG</small><h2>{profileSong.title}</h2><p>{profileSong.artist} · Tap to play</p></div>
      </section>}
      <section className="fc-music-creator-releases">
        <div className="fc-music-community-section-head"><div><small>Music</small><h2>Releases</h2></div><span>{visibleTracks.length} track{visibleTracks.length === 1 ? '' : 's'}</span></div>
        {visibleTracks.length > 0 ? <div className="fc-music-creator-release-list">{visibleTracks.map((track) => <article className="fc-music-creator-release" key={track.id}>
          <button className="fc-music-creator-release-art" type="button" onClick={() => selectMusicTrack(track)}>{track.artwork ? <img src={track.artwork} alt="" /> : <span>♫</span>}<b>{musicCurrentTrack?.id === track.id && musicPlaying ? 'Ⅱ' : '▶'}</b></button>
          <div><small>{track.genres.join(' · ')}</small><strong>{track.title}</strong><span>{track.artist}</span></div>
        </article>)}</div> : <div className="fc-music-creator-empty">This creator hasn't published any releases yet.</div>}
      </section>
      {profile.visibility.likedMusic && <section className="fc-music-creator-placeholder"><span>♡</span><div><strong>Liked Music</strong><small>Liked tracks will appear here when this creator has music to share.</small></div></section>}
      <button className="fc-music-community-exit" type="button" onClick={() => setMusicCommunityProfileView(false)}>← Back to Music Community</button>
    </div>
  }

  function renderMusicCommunity() {
    const musicCommunityProfile=musicCommunityProfiles[selectedMemberId] ?? null
    const setupComplete=Boolean(musicCommunityProfile), communityTracks=musicCommunityDemoTracks, current=musicCurrentTrack
    const viewedDemoStats = musicCommunityViewedProfile ? musicCommunityDemoProfiles.find((profile) => profile.handle === musicCommunityViewedProfile.handle) : undefined
    const viewedProfile = musicCommunityViewedProfile ?? musicCommunityProfile
    if (musicCommunityProfileView && viewedProfile) return renderMusicCommunityProfilePage(viewedProfile, viewedDemoStats ? { followers: viewedDemoStats.demoFollowers, following: viewedDemoStats.demoFollowing } : undefined)
    const profileSong=musicCommunityProfile?.profileSongId ? musicLibrary.find((track)=>track.id===musicCommunityProfile.profileSongId) ?? null : null
    const uploadsRemaining=Math.max(0,subscription.monthlyPublishAllowance-subscription.monthlyPublishedTracks)
    const toggleProfileSong=()=>{if(!profileSong)return;if(current?.id===profileSong.id){toggleMusicPlayback();return}selectMusicTrack(profileSong)}
    return <div className="fc-page">
      <header className="fc-music-community-header"><div><p className="fc-kicker">Family Circle Music</p><h1>Music Community</h1><p className="fc-muted">A public music space inside the Family Circle universe.</p></div><button className="fc-ghost-button" type="button" onClick={()=>goToTab('home')}>← Home</button></header>
      {!setupComplete ? <section className="fc-music-community-setup"><div className="fc-music-community-setup-icon">🎵</div><span className="fc-music-community-badge">Separate public music identity</span><h2>Create your Music Profile</h2><p>Choose how you want to appear in the Music Community. This profile is separate from your private Family Circle identity and family information.</p><div className="fc-music-community-form">
        <label><span>Profile picture</span><input className="fc-music-community-file" type="file" accept="image/*" onChange={(event)=>{const file=event.target.files?.[0];if(file)handleMusicCommunityPhoto(file)}}/></label>
        {musicCommunityPhoto&&<div className="fc-music-community-photo-preview"><img src={musicCommunityPhoto} alt="Music profile preview"/><button className="fc-ghost-button" type="button" onClick={()=>setMusicCommunityPhoto(null)}>Remove picture</button></div>}
        <label><span>Public display name *</span><input value={musicCommunityDisplayName} onChange={(event)=>setMusicCommunityDisplayName(event.target.value)} placeholder="e.g. BradyXAi" maxLength={40}/></label><label><span>@Handle *</span><input value={musicCommunityHandle} onChange={(event)=>setMusicCommunityHandle(event.target.value.replace(/\s/g,''))} placeholder="e.g. bradyxai" maxLength={24}/></label><label><span>Short bio</span><textarea value={musicCommunityBio} onChange={(event)=>setMusicCommunityBio(event.target.value)} placeholder="Tell listeners what you make." maxLength={160} rows={3}/></label>
      </div>{musicCommunityProfileError&&<p className="fc-error">{musicCommunityProfileError}</p>}<button className="fc-primary-button fc-music-community-create" type="button" onClick={createMusicCommunityProfile}>Create Music Profile →</button><small className="fc-music-community-privacy">Your Family Circle name, family members, location and private family details are not shown here.</small></section> : <>
        <section className="fc-music-community-profile-shell">
          <button className="fc-music-community-profile-hero-card" type="button" onClick={() => { setMusicCommunityViewedProfile(musicCommunityProfile); setMusicCommunityProfileView(true) }}>
            <div className="fc-music-community-profile-hero-art"><div className="fc-music-community-avatar">{musicCommunityProfile?.photo?<img src={musicCommunityProfile.photo} alt=""/>:'♫'}</div></div>
            <div className="fc-music-community-profile-hero-copy"><span>🎵 MUSIC CREATOR</span><strong>{musicCommunityProfile?.displayName}</strong><small>@{musicCommunityProfile?.handle}</small>{musicCommunityProfile?.visibility.bio&&musicCommunityProfile?.bio&&<p>{musicCommunityProfile.bio}</p>}<b>View Music Profile →</b></div>
          </button>
          <div className="fc-music-community-profile-actions"><button className="fc-ghost-button" type="button" onClick={()=>{setMusicCommunityEditing(true);setMusicCommunitySettingsOpen(false)}}>Edit Profile</button><button className="fc-ghost-button" type="button" onClick={()=>{setMusicCommunitySettingsOpen(true);setMusicCommunityEditing(false)}}>⚙ Profile Settings</button></div>          {musicCommunityEditing&&<section className="fc-music-community-editor"><div className="fc-music-community-subhead"><div><small>Music Profile</small><h2>Edit Profile</h2></div><button className="fc-ghost-button" type="button" onClick={()=>setMusicCommunityEditing(false)}>← Back to profile</button></div><div className="fc-music-community-form"><label><span>Profile picture</span><input className="fc-music-community-file" type="file" accept="image/*" onChange={(event)=>{const file=event.target.files?.[0];if(file)handleMusicCommunityPhoto(file)}}/></label>{musicCommunityPhoto&&<div className="fc-music-community-photo-preview"><img src={musicCommunityPhoto} alt="Music profile preview"/><button className="fc-ghost-button" type="button" onClick={()=>setMusicCommunityPhoto(null)}>Remove picture</button></div>}<label><span>Public display name *</span><input value={musicCommunityDisplayName} onChange={(event)=>setMusicCommunityDisplayName(event.target.value)} maxLength={40}/></label><label><span>@Handle *</span><input value={musicCommunityHandle} onChange={(event)=>setMusicCommunityHandle(event.target.value.replace(/\s/g,''))} maxLength={24}/></label><label><span>Short bio</span><textarea value={musicCommunityBio} onChange={(event)=>setMusicCommunityBio(event.target.value)} maxLength={160} rows={3}/></label></div>{musicCommunityProfileError&&<p className="fc-error">{musicCommunityProfileError}</p>}<button className="fc-primary-button" type="button" onClick={saveMusicCommunityProfile}>Save Profile</button></section>}
          {musicCommunitySettingsOpen&&<section className="fc-music-community-settings"><div className="fc-music-community-subhead"><div><small>Music Profile</small><h2>Profile Settings</h2></div><button className="fc-ghost-button" type="button" onClick={()=>setMusicCommunitySettingsOpen(false)}>← Back to profile</button></div><div className="fc-music-community-settings-grid">
            <div className="fc-music-community-setting-card"><div><span>🎵 Profile Song</span><strong>Choose the song shown on your profile</strong><small>It never autoplays. Tap the record on your profile whenever you want to listen.</small></div><select value={musicCommunityProfileSongId??''} onChange={(event)=>setMusicCommunityProfileSongId(event.target.value||null)}><option value="">No profile song</option>{communityTracks.map((track)=><option value={track.id} key={track.id}>{track.title} · {track.artist}</option>)}</select></div>
            <div className="fc-music-community-setting-card"><div><span>👁 Visibility</span><strong>Choose what other people can see</strong></div>{(['bio','likedMusic','savedMusic','followers','allowFollowers'] as const).map((key)=><label className="fc-music-community-toggle" key={key}><input type="checkbox" checked={musicCommunityVisibility[key]} onChange={(event)=>setMusicCommunityVisibility((value)=>({...value,[key]:event.target.checked}))}/><span>{key==='bio'?'Show my bio':key==='likedMusic'?'Show liked music':key==='savedMusic'?'Show saved music':key==='followers'?'Show followers/following':'Allow people to follow me'}</span></label>)}</div>
            <div className="fc-music-community-setting-card fc-music-community-safety"><div><span>🔒 Safety</span><strong>Block or report creators</strong><small>Use these controls if someone is unwanted or breaks the Community rules.</small></div><div className="fc-music-community-safety-actions"><button className="fc-ghost-button" type="button" onClick={()=>setMusicCommunitySafetyMode('block')}>Block Creator</button><button className="fc-ghost-button danger-outline" type="button" onClick={()=>setMusicCommunitySafetyMode('block-report')}>Block &amp; Report</button></div>{musicCommunitySafetyMode&&<div className="fc-music-community-safety-form"><input value={musicCommunitySafetyHandle} onChange={(event)=>setMusicCommunitySafetyHandle(event.target.value)} placeholder="@creator handle" maxLength={24}/>{musicCommunitySafetyMode==='block-report'&&<select value={musicCommunitySafetyReason} onChange={(event)=>setMusicCommunitySafetyReason(event.target.value)}><option>Spam or unwanted contact</option><option>Inappropriate content</option><option>Harassment</option><option>Other</option></select>}<div><button className="fc-primary-button" type="button" onClick={submitMusicCommunitySafety}>{musicCommunitySafetyMode==='block-report'?'Block &amp; Report':'Block Creator'}</button><button className="fc-ghost-button" type="button" onClick={()=>setMusicCommunitySafetyMode(null)}>Cancel</button></div></div>}{musicCommunitySafetyMessage&&<small className="fc-music-community-safety-message">{musicCommunitySafetyMessage}</small>}</div>
          </div><button className="fc-primary-button" type="button" onClick={saveMusicCommunityProfile}>Save Settings</button></section>}
          {!musicCommunityEditing&&!musicCommunitySettingsOpen&&<>{profileSong&&<section className="fc-music-community-profile-song"><button className={'fc-music-community-record'+(current?.id===profileSong.id&&musicPlaying?' playing':'')} type="button" onClick={toggleProfileSong} aria-label={current?.id===profileSong.id&&musicPlaying?'Stop profile song':'Play profile song'}><span className="fc-music-community-record-label">{profileSong.artwork?<img src={profileSong.artwork} alt=""/>:<span>♫</span>}</span></button><div><small>🎵 Profile Song</small><strong>{profileSong.title}</strong><span>{profileSong.artist} · Tap the record to play</span></div></section>}<section className="fc-music-community-publish"><div><span>⭐ Your Music</span><strong>{subscription.plan==='premium'?uploadsRemaining+' uploads remaining':'Publish your music'}</strong><small>{subscription.plan==='premium'?'Publish a new track when you are ready.':'Premium is required to publish music to the Music Community.'}</small></div><button className="fc-primary-button" type="button" onClick={()=>{if(subscription.plan!=='premium')setAccessNotice({title:'Premium required',message:'Upgrade to Premium to publish music to the Music Community.',action:'upgrade'})}} disabled={subscription.plan==='premium'}>{subscription.plan==='premium'?'Publish New Track':'Upgrade to Premium'}</button></section></>}
          <section className="fc-music-community-demo-creators">
            <div className="fc-music-community-section-head"><div><small>Community preview</small><h2>Meet Music Creators</h2></div><span>Demo profiles</span></div>
            <div className="fc-music-community-demo-grid">{musicCommunityDemoProfiles.map((profile) => {
              const track = musicCommunityDemoTracks.find((item) => item.id === profile.profileSongId)
              return <button className="fc-music-community-demo-card" type="button" key={profile.handle} onClick={() => { setMusicCommunityViewedProfile(profile); setMusicCommunityProfileView(true) }}>
                <span className="fc-music-community-demo-avatar">♫</span>
                <span className="fc-music-community-demo-copy"><small>🎵 Music Creator</small><strong>{profile.displayName}</strong><em>@{profile.handle}</em><span>{profile.bio}</span><b>{track?.title ?? 'View creator'} →</b></span>
              </button>
            })}</div>
          </section>
        </section>
        <nav className="fc-music-community-tabs" aria-label="Music Community sections"><button className="active" type="button">✨ Discover</button><button type="button">🆕 New Releases</button><button type="button">♡ Following</button><button type="button">🎹 Instrumentals</button></nav>
        <section className="fc-music-community-filters">{['All','R&B','Hip-Hop','Pop','Rock','Electronic','AI Music','Instrumental','Other'].map((genre)=><button type="button" key={genre} className={genre==='All'?'active':''}>{genre}</button>)}</section>
        <section className="fc-music-community-featured"><div className="fc-music-community-section-head"><div><small>Discover New Music</small><h2>Made inside the Family Circle universe</h2></div><span>{communityTracks.length} demo releases</span></div><div className="fc-music-community-track-grid">{communityTracks.map((track)=><article className={'fc-community-track-card'+(current?.id===track.id?' active':'')} key={track.id}><button className="fc-community-track-art" type="button" onClick={()=>selectMusicTrack(track)} aria-label={'Play '+track.title}>{track.artwork?<img src={track.artwork} alt=""/>:<div className={'fc-home-music-equalizer style-'+track.visualStyle}>{Array.from({length:9},(_,index)=><i key={index}/>)}</div>}<span>{current?.id===track.id&&musicPlaying?'Ⅱ':'▶'}</span></button><div className="fc-community-track-copy"><small>{track.genres.join(' · ')}</small><strong>{track.title}</strong><span>{track.artist}</span></div><div className="fc-community-track-actions"><button type="button" aria-label="Like">♡</button><button type="button" aria-label="Comments">💬</button><button type="button" aria-label="Save">＋</button><button type="button" aria-label="Share">↗</button></div></article>)}</div></section>
      </>}
    </div>
  }
  function renderMusic() {
    const current = musicCurrentTrack
    const visibleTracks = musicVisibleTracks()
    const recentlyPlayed = musicRecentlyPlayed.map((id) => musicLibrary.find((track) => track.id === id)).filter((track): track is MusicTrack => Boolean(track)).filter((track) => !musicChildMode || track.kidsAllowed)
    const progress = musicDuration > 0 ? Math.min(100, (musicCurrentTime / musicDuration) * 100) : 0
    const youtubeAvailable = Boolean(current?.youtubeUrl) && (!musicChildMode || musicChildYouTubeAllowed)
    return <div className="fc-page">
      <FeatureHeader title="Family Circle Music" description="Original music, playlists and background listening for the family." onHome={() => goToTab('home')} />
      <div className="fc-music-layout">
        <section className="fc-panel fc-music-player">
          <div className="fc-music-player-top"><div><small>Now Playing</small><h2>{current ? current.title : 'Ready when you are'}</h2></div><span className="fc-pill">{musicChildMode ? 'Kids Music' : 'Family Circle Music'}</span></div>
          <div className="fc-music-artwork fc-music-visual">{current ? current.artwork ? <img src={current.artwork} alt={current.title + ' artwork'} /> : <div className={`fc-music-equalizer style-${current.visualStyle} ${musicPlaying ? 'playing' : ''}`} aria-label="Music visualizer">{Array.from({ length: 16 }, (_, index) => <i key={index} style={{ animationDelay: `${index * -0.09}s` }} />)}</div> : <div className="fc-music-artwork-placeholder"><span>♫</span><strong>Family Circle Music</strong><small>Select a track to start listening.</small></div>}</div>
          <div className="fc-music-track-meta"><strong>{current ? current.title : 'No track loaded yet'}</strong><span>{current ? current.artist + ' · ' + current.genres.join(' · ') : 'Choose a playlist or track to begin.'}</span></div>
          <div className="fc-music-progress-wrap"><div className="fc-music-progress"><span style={{ width: String(progress) + '%' }} /><input className="fc-music-seek" type="range" min="0" max={musicDuration || 0} step="0.1" value={musicDuration > 0 ? Math.min(musicCurrentTime, musicDuration) : 0} disabled={!current || musicDuration <= 0} aria-label="Seek through song" onChange={(event) => { const nextTime = Number(event.currentTarget.value); setMusicCurrentTime(nextTime); if (musicAudioRef.current) musicAudioRef.current.currentTime = nextTime }} /></div><div className="fc-music-time"><span>{current ? formatMusicTime(musicCurrentTime) : '0:00'}</span><span>{current ? formatMusicTime(musicDuration) : '0:00'}</span></div></div>
          <div className="fc-music-volume"><span aria-hidden="true">{musicVolume === 0 ? '🔇' : musicVolume < 0.5 ? '🔉' : '🔊'}</span><input type="range" min="0" max="1" step="0.01" value={musicVolume} aria-label="Music volume" onChange={(event) => setMusicVolumeLevel(Number(event.currentTarget.value))} /><span>{Math.round(musicVolume * 100)}%</span></div>
          <div className="fc-music-controls">
            <button type="button" disabled={!current} aria-label="Shuffle">↝</button>
            <button type="button" disabled={!current} aria-label="Previous track" onClick={() => { const list = visibleTracks; const index = list.findIndex((track) => track.id === current?.id); if (index >= 0 && list.length > 1) selectMusicTrack(list[(index - 1 + list.length) % list.length]) }}>◀</button>
            <button className="fc-music-play-button" type="button" disabled={!current?.audioSrc} onClick={toggleMusicPlayback} aria-label={musicPlaying ? 'Pause music' : 'Play music'}>{musicPlaying ? 'Ⅱ' : '▶'}</button>
            <button type="button" disabled={!current} aria-label="Next track" onClick={() => { const list = visibleTracks; const index = list.findIndex((track) => track.id === current?.id); if (index >= 0 && list.length > 1) selectMusicTrack(list[(index + 1) % list.length]) }}>▶</button>
            <button type="button" disabled={!current} aria-label="Repeat">↻</button>
          </div>
          <div className="fc-music-actions"><button className={youtubeAvailable ? '' : 'disabled'} type="button" disabled={!youtubeAvailable} onClick={() => { if (youtubeAvailable && current?.youtubeUrl) window.open(current.youtubeUrl, '_blank', 'noopener,noreferrer') }}>▶ Watch on YouTube{musicChildMode && !musicChildYouTubeAllowed ? ' 🔒' : ''}</button><button type="button" disabled={!current} onClick={() => { if (!current) return; setChatDraft('🎵 Check out ' + current.title + ' by ' + current.artist + ' on Family Circle Music.'); goToTab('chat') }}>💬 Share to Family Chat</button></div>
        </section>
        <section className="fc-panel fc-music-library">
          <div className="fc-panel-head"><div><small>{musicPlaylist ? `Playlist · ${musicPlaylist}` : 'Your music'}</small><h2>Playlists</h2></div><span className="fc-pill">{visibleTracks.length} tracks</span></div>
          <div className="fc-music-playlists">{musicPlaylists.map((playlist) => { const available = musicLibrary.some((track) => track.genres.includes(playlist) && (!musicChildMode || track.kidsAllowed)); return <button type="button" className={`fc-music-playlist${musicPlaylist === playlist ? ' selected' : ''}`} key={playlist} disabled={!available} onClick={() => selectMusicPlaylist(playlist)}><span>♫</span><strong>{playlist}</strong><small>{available ? 'Open playlist' : 'No available tracks'}</small></button> })}</div>
          {musicPlaylist && <button className="fc-music-clear-playlist" type="button" onClick={() => setMusicPlaylist(null)}>← All Music</button>}
          {visibleTracks.length > 0 ? <div className="fc-music-track-list">{visibleTracks.map((track) => <button type="button" className={`fc-music-track-item${musicCurrentTrack?.id === track.id ? ' active' : ''}`} key={track.id} onClick={() => selectMusicTrack(track)}>{track.artwork ? <span className="fc-music-track-art"><img src={track.artwork} alt="" /></span> : <span className={`fc-music-track-visual style-${track.visualStyle}`}><i /><i /><i /><i /></span>}<strong>{track.title}</strong><small>{track.artist} · {track.genres.join(' · ')}{track.explicit ? ' · Explicit' : ''}</small></button>)}</div> : <div className="fc-music-empty"><span>♫</span><strong>No tracks in this view yet.</strong><p>Add music to this playlist or adjust the family music permissions.</p></div>}
          {recentlyPlayed.length > 0 && <div className="fc-music-recent"><div className="fc-panel-head"><div><small>Listening history</small><h2>Recently Played</h2></div></div><div className="fc-music-track-list">{recentlyPlayed.map((track) => <button type="button" className="fc-music-track-item" key={track.id} onClick={() => selectMusicTrack(track)}>{track.artwork ? <span className="fc-music-track-art"><img src={track.artwork} alt="" /></span> : <span className={`fc-music-track-visual style-${track.visualStyle}`}><i /><i /><i /><i /></span>}<strong>{track.title}</strong><small>{track.artist}</small></button>)}</div></div>}
          <div className="fc-music-permissions"><div><small>Demo permission controls</small><strong>Child music mode</strong><span>Shows how a child account can be restricted to approved kids' music.</span></div><label><input type="checkbox" checked={musicChildMode} onChange={(event) => { setMusicChildMode(event.target.checked); setMusicPlaylist(null); }} /> Child account</label><label><input type="checkbox" checked={musicChildYouTubeAllowed} onChange={(event) => setMusicChildYouTubeAllowed(event.target.checked)} /> Allow YouTube</label></div>
        </section>
      </div>
      {renderBottomNav()}
    </div>
  }

  function renderTool() {
    if (toolMode === 'musicCommunity') return renderMusicCommunity()
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

  {accessNotice && <div className="fc-modal-backdrop" onMouseDown={() => setAccessNotice(null)}><section className="fc-access-modal" onMouseDown={(event) => event.stopPropagation()}><button className="fc-modal-close" type="button" onClick={() => setAccessNotice(null)}>×</button><div className="fc-access-modal-icon">{accessNotice.action === 'upgrade' ? '⭐' : accessNotice.action === 'child' ? '😄' : '🔒'}</div><p className="fc-kicker">Family Circle</p><h2>{accessNotice.title}</h2><p className="fc-muted">{accessNotice.message}</p>{accessNotice.action === 'restriction' && <p className="fc-access-modal-note">Ask your Family Moderator to remove the restriction.</p>}{accessNotice.action === 'upgrade' && <p className="fc-access-modal-note">Upgrade your account to unlock this feature.</p>}{accessNotice.action === 'child' && <p className="fc-access-modal-note">Not quite — this one is keeping the grown-ups out. 😄</p>}<button className="fc-primary-button" type="button" onClick={() => setAccessNotice(null)}>{accessNotice.action === 'upgrade' ? 'View Plans' : 'Got it'}</button></section></div>}

  return <main className="fc-app-shell fc-home-screen"><div className="fc-home-shell"><audio ref={musicAudioRef} onTimeUpdate={(event) => setMusicCurrentTime(event.currentTarget.currentTime)} onLoadedMetadata={(event) => setMusicDuration(event.currentTarget.duration)} onPlay={() => setMusicPlaying(true)} onPause={() => setMusicPlaying(false)} onEnded={handleMusicEnded} preload="metadata" />{renderActive()}{musicCurrentTrack && musicMiniPlayerVisible && <div className="fc-music-mini-player">
        <div className={"fc-music-mini-art" + (musicCurrentTrack.artwork ? " fc-music-mini-artwork" : " fc-music-mini-visual style-" + musicCurrentTrack.visualStyle)}>{musicCurrentTrack.artwork ? <img src={musicCurrentTrack.artwork} alt="" /> : [0,1,2,3,4].map((index) => <i key={index} />)}</div>
        <div className="fc-music-mini-copy"><strong>{musicCurrentTrack.title}</strong><small>{musicCurrentTrack.artist}</small></div>
        <button className="fc-music-mini-control" type="button" onClick={() => { const list = toolMode === 'musicCommunity' ? musicCommunityDemoTracks : musicVisibleTracks(); const index = list.findIndex((track) => track.id === musicCurrentTrack.id); if (index >= 0 && list.length > 1) selectMusicTrack(list[(index - 1 + list.length) % list.length]) }} aria-label="Previous track">◀</button>
        <button className="fc-music-mini-control fc-music-mini-play" type="button" onClick={toggleMusicPlayback} aria-label={musicPlaying ? "Pause music" : "Play music"}>{musicPlaying ? "Ⅱ" : "▶"}</button>
        <button className="fc-music-mini-control" type="button" onClick={() => { const list = toolMode === 'musicCommunity' ? musicCommunityDemoTracks : musicVisibleTracks(); const index = list.findIndex((track) => track.id === musicCurrentTrack.id); if (index >= 0 && list.length > 1) selectMusicTrack(list[(index + 1) % list.length]) }} aria-label="Next track">▶</button>
        <button className="fc-music-mini-close" type="button" onClick={() => setMusicMiniPlayerVisible(false)} aria-label="Dismiss music player">×</button>
      </div>}
      {profilePhotoViewer && <div className="fc-photo-viewer" role="dialog" aria-modal="true" aria-label="Profile photo viewer" onMouseDown={() => setProfilePhotoViewer(null)}>
        <section className="fc-photo-viewer-panel" onMouseDown={(event) => event.stopPropagation()}>
          <button className="fc-photo-viewer-close" type="button" onClick={() => setProfilePhotoViewer(null)} aria-label="Close photo viewer">×</button>
          <div className="fc-photo-viewer-image-wrap"><img src={profilePhotoViewer} alt="Profile photo enlarged" /></div>
          <span>Profile photo</span>
        </section>
      </div>}
    </div></main>
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