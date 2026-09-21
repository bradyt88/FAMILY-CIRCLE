import { useEffect, useRef, useState } from 'react'
import logoUrl from '../design/brand/family-circle-logo.png'
import Onboarding from './Onboarding'
import './batch15.css'

type ToolMode = 'emergency' | 'profile' | 'family' | 'games' | 'notifications' | 'settings' | 'map' | 'music' | 'musicCommunity' | 'familyCourt'
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
type FamilyMember = { id: string; label: string; initials: string; accent: string; phone: string; bio: string; status: StatusOption; locationLabel: string; lastUpdated: string; mapX: number; mapY: number; photo?: string | null; socials: Record<SocialName, string>; recognition?: MemberRecognition; coverPhoto?: string | null }
type ChatMessage = { id: string; memberId: string; name: string; initials: string; accent: string; time: string; text: string; image?: string; moneyRequestId?: string }
type Notification = { id: string; kind: 'Chat' | 'Task' | 'Calendar' | 'Emergency' | 'Profile' | 'Money'; title: string; detail: string; time: string; target?: 'familyCourt'; targetCaseId?: string; recipientMemberId?: string }
type NotificationPreferences = { Chat: boolean; Task: boolean; Calendar: boolean; Profile: boolean; Money: boolean; Emergency: true }
type FamilyPhoto = { id: string; src: string; name: string; time: string }
type FamilyEvent = { id: string; title: string; date: string; time: string; location: string }
type PersonalEvent = FamilyEvent
type FamilyTask = { id: string; title: string; dueDate: string; assignedTo: string; completed: boolean }
type FamilyCourtTrialData = { judgeId?: string; courtStarted?: boolean; courtStage?: 'opening-writing' | 'opening-reading-accuser' | 'opening-reading-accused' | 'evidence-upload' | 'evidence-review-accuser' | 'evidence-review-accused' | 'evidence-complete' | 'judge-question-writing' | 'answer-writing' | 'jury-vote' | 'verdict' | 'punishment' | 'case-closed'; courtStageStartedAt?: string; verdictAt?: string; openingStatements?: Record<string, string>; openingSubmittedBy?: string[]; evidence?: Record<string, string[]>; evidenceSubmittedBy?: string[]; judgeQuestions?: Record<string, string>; judgeQuestionsSubmitted?: boolean; answers?: Record<string, string>; answersSubmittedBy?: string[]; juryVotes?: Record<string, 'guilty' | 'not-guilty'>; verdict?: 'guilty' | 'not-guilty'; punishment?: string } 
type FamilyCourtAppeal = { id: string; appellantId: string; submittedAt: string; reason: string; explanation: string; newEvidence: string[]; status: 'pending' | 'approved' | 'denied' | 'closed'; familyVotes: Record<string, 'allow' | 'deny'>; votedAt?: string; approvedAt?: string; closedAt?: string; finalVerdict?: 'guilty' | 'not-guilty'; finalPunishment?: string }
type FamilyCourtCase = { id: string; title: string; accuserId: string; accusedId: string; status: 'scheduled' | 'summoned' | 'ready' | 'closed'; createdAt: string; scheduledDate?: string; scheduledTime?: string; acceptedMemberIds?: string[]; judgeId?: string; courtStarted?: boolean; courtStage?: FamilyCourtTrialData['courtStage']; courtStageStartedAt?: string; verdictAt?: string; openingStatements?: Record<string, string>; openingSubmittedBy?: string[]; evidence?: Record<string, string[]>; evidenceSubmittedBy?: string[]; judgeQuestions?: Record<string, string>; judgeQuestionsSubmitted?: boolean; answers?: Record<string, string>; answersSubmittedBy?: string[]; juryVotes?: Record<string, 'guilty' | 'not-guilty'>; verdict?: 'guilty' | 'not-guilty'; punishment?: string; originalTrial?: FamilyCourtTrialData; appeal?: FamilyCourtAppeal }
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

const DEMO_WEEKLY_RECOGNITION_ENABLED = true

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
  const weekKey = recognitionWeekKey()
  try {
    const saved = localStorage.getItem(key)
    const parsed = saved ? JSON.parse(saved) as Partial<WeeklyRecognition> : null
    if (parsed && parsed.weekKey === weekKey) return { ...emptyWeeklyRecognition(weekKey), ...parsed, famVotes: parsed.famVotes ?? {}, clownVotes: parsed.clownVotes ?? {}, famTie: parsed.famTie ?? null, clownTie: parsed.clownTie ?? null }
  } catch {}
  if (DEMO_WEEKLY_RECOGNITION_ENABLED) return { ...emptyWeeklyRecognition(weekKey), famVotes: { 'member-1': 'member-1', 'member-2': 'member-1', 'member-3': 'member-1' }, clownVotes: { 'member-1': 'member-2', 'member-2': 'member-2', 'member-3': 'member-2' }, famWinner: 'member-1', clownWinner: 'member-2', famAnnounced: true, clownAnnounced: true }
  return emptyWeeklyRecognition(weekKey)
}
function persistWeeklyRecognition(value: WeeklyRecognition) { localStorage.setItem('family-circle-weekly-recognition', JSON.stringify(value)) }

function loadMembers() {
  const demoRecognition: Record<string, MemberRecognition> = {
    'member-1': { famOfWeekWins: 2, clownOfWeekWins: 0, weeklyAwards: [{ weekKey: 'demo-1', type: 'fam' }, { weekKey: 'demo-current', type: 'fam' }] },
    'member-2': { famOfWeekWins: 2, clownOfWeekWins: 2, weeklyAwards: [{ weekKey: 'demo-2', type: 'fam' }, { weekKey: 'demo-4', type: 'fam' }, { weekKey: 'demo-current', type: 'clown' }, { weekKey: 'demo-3', type: 'clown' }] },
    'member-3': { famOfWeekWins: 2, clownOfWeekWins: 0, weeklyAwards: [{ weekKey: 'demo-5', type: 'fam' }, { weekKey: 'demo-6', type: 'fam' }] },
  }
  return memberSeeds.map((member) => {
    try {
      const saved = localStorage.getItem(`family-circle-member-${member.id}`)
      if (!saved) return DEMO_WEEKLY_RECOGNITION_ENABLED ? { ...member, recognition: demoRecognition[member.id] ?? member.recognition } : member
      return { ...member, ...JSON.parse(saved) as Partial<FamilyMember> }
    } catch {
      return DEMO_WEEKLY_RECOGNITION_ENABLED ? { ...member, recognition: demoRecognition[member.id] ?? member.recognition } : member
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
function RecognitionProfile({ member, members }: { member: FamilyMember; members: FamilyMember[] }) {
  const recognition = memberRecognitionSafe(member)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [selectedWeek, setSelectedWeek] = useState('')
  const [noteDraft, setNoteDraft] = useState('')
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem(`family-circle-star-notes-${member.id}`) || '{}') as Record<string, string> } catch { return {} }
  })
  const stars = Math.min(20, recognition.famOfWeekWins)
  const today = new Date()
  const currentSunday = new Date(today)
  currentSunday.setDate(today.getDate() - today.getDay())
  const weeks = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(currentSunday)
    date.setDate(currentSunday.getDate() - (5 - index) * 7)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  })
  const demoResults: Record<string, { fam?: string; clown?: string }> = {
    [weeks[0]]: { fam: 'member-2' }, [weeks[1]]: { fam: 'member-3' },
    [weeks[2]]: { fam: 'member-1', clown: 'member-2' }, [weeks[3]]: { fam: 'member-3', clown: 'member-1' },
    [weeks[4]]: { fam: 'member-2', clown: 'member-3' }, [weeks[5]]: { fam: 'member-1', clown: 'member-2' },
  }
  const memberName = (id?: string) => members.find((item) => item.id === id)?.label ?? 'Family member'
  const weekLabel = (week: string) => {
    const [year, month, day] = week.split('-').map(Number)
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(year, month - 1, day))
  }
  const openWeek = (week: string) => { setSelectedWeek(week); setNoteDraft(notes[week] ?? ''); setCalendarOpen(true) }
  const saveNotes = (next: Record<string, string>) => { setNotes(next); localStorage.setItem(`family-circle-star-notes-${member.id}`, JSON.stringify(next)) }
  const saveWeekNote = () => {
    if (!selectedWeek) return
    const next = { ...notes }
    if (noteDraft.trim()) next[selectedWeek] = noteDraft.trim().slice(0, 180)
    else delete next[selectedWeek]
    saveNotes(next)
  }
  const clearWeekNote = () => {
    if (!selectedWeek) return
    const next = { ...notes }; delete next[selectedWeek]; saveNotes(next); setNoteDraft('')
  }
  return <section className="fc-recognition-panel">
    <div className="fc-recognition-head"><div><p className="fc-kicker">Personal space</p><h2>⭐ My Family Star Chart</h2><small>Weekly family recognition, with your own private notes.</small></div><span className="fc-recognition-status">{recognitionStatus(member)}</span></div>
    <button className="fc-star-chart-preview" type="button" onClick={() => openWeek(weeks[5])} aria-label="Open your family star chart">
      <div className="fc-star-chart-grid">{weeks.map((week) => { const result = demoResults[week] ?? {}; const earned = result.fam === member.id; return <span className={`fc-star-week ${earned ? 'earned' : ''}`} key={week}><small>{weekLabel(week)}</small><b>{earned ? '★' : result.fam ? '☆' : '·'}</b>{result.clown === member.id && <i>🤡</i>}{notes[week] && <em>note</em>}</span> })}</div>
      <span className="fc-star-chart-open">Open personal calendar →</span>
    </button>
    <div className="fc-recognition-stats"><span>⭐ <b>{recognition.famOfWeekWins}</b> Fam wins</span><span>🤡 <b>{recognition.clownOfWeekWins}</b> Clown wins</span></div>
    <div className="fc-recognition-progress"><span style={{ width: `${Math.min(100, stars / 20 * 100)}%` }} /></div>
    <small>20 Fam of the Week wins unlocks Royalty.</small>
    {calendarOpen && <div className="fc-star-calendar-backdrop" role="dialog" aria-modal="true" aria-label="Personal star chart calendar" onMouseDown={() => setCalendarOpen(false)}>
      <section className="fc-star-calendar-modal" onMouseDown={(event) => event.stopPropagation()}>
        <button className="fc-star-calendar-close" type="button" onClick={() => setCalendarOpen(false)} aria-label="Close star chart">×</button>
        <div className="fc-star-calendar-head"><div><p className="fc-kicker">Personal calendar</p><h2>⭐ My Family Star Chart</h2><p>Family awards are shared. Your notes are private to you.</p></div><span>{recognition.famOfWeekWins} ⭐</span></div>
        <div className="fc-star-calendar-grid">{weeks.map((week) => { const result = demoResults[week] ?? {}; return <button type="button" className={`fc-star-calendar-cell${result.fam === member.id ? ' fam-earned' : ''}${result.clown === member.id ? ' clown-earned' : ''}`} key={week} onClick={() => openWeek(week)}><small>Sunday · {weekLabel(week)}</small><strong>{result.fam === member.id ? '⭐ Fam of the Day' : result.fam ? `⭐ ${memberName(result.fam)}` : 'No award yet'}</strong>{result.clown && <span>🤡 {result.clown === member.id ? 'Clown of the Day' : memberName(result.clown)}</span>}{notes[week] && <em>📝 {notes[week]}</em>}</button> })}</div>
        <div className="fc-star-note-editor"><div><small>Private note</small><strong>{selectedWeek ? `Notes for Sunday · ${weekLabel(selectedWeek)}` : 'Choose a week above'}</strong></div><textarea value={noteDraft} maxLength={180} rows={3} onChange={(event) => setNoteDraft(event.target.value)} placeholder="e.g. Great week with the family…" /><div className="fc-star-note-actions"><span>{noteDraft.length}/180 · only you can see this</span><button className="fc-primary-button" type="button" onClick={saveWeekNote} disabled={!selectedWeek}>Save note</button><button className="fc-ghost-button" type="button" onClick={clearWeekNote} disabled={!selectedWeek}>Delete note</button></div></div>
      </section>
    </div>}
  </section>
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
  const [familyCourtCases, setFamilyCourtCases] = useState<FamilyCourtCase[]>(() => {
    try {
      const saved = localStorage.getItem('family-circle-court-cases')
      return saved ? JSON.parse(saved) as FamilyCourtCase[] : []
    } catch { return [] }
  })
  const [familyCourtCaseTitle, setFamilyCourtCaseTitle] = useState('')
  const [familyCourtAccusedId, setFamilyCourtAccusedId] = useState('')
  const [familyCourtTiming, setFamilyCourtTiming] = useState<'now' | 'scheduled'>('now')
  const [familyCourtDate, setFamilyCourtDate] = useState(todayKey())
  const [familyCourtTime, setFamilyCourtTime] = useState('19:00')
  const [familyCourtSetupView, setFamilyCourtSetupView] = useState<'hub' | 'form' | 'review' | 'opened' | 'courtroom' | 'reviewCases' | 'reviewCase' | 'upcomingCases' | 'upcomingCase' | 'appeal'>('hub')
  const [familyCourtOpenedCaseId, setFamilyCourtOpenedCaseId] = useState<string | null>(null)
  const [familyCourtReviewCaseId, setFamilyCourtReviewCaseId] = useState<string | null>(null)
  const [familyCourtAppealReason, setFamilyCourtAppealReason] = useState('New evidence')
  const [familyCourtAppealExplanation, setFamilyCourtAppealExplanation] = useState('')
  const [familyCourtAppealEvidence, setFamilyCourtAppealEvidence] = useState<string[]>([])
  const [familyCourtUpcomingCaseId, setFamilyCourtUpcomingCaseId] = useState<string | null>(null)
  const [familyCourtClock, setFamilyCourtClock] = useState(Date.now())
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [weeklyRecognition, setWeeklyRecognition] = useState<WeeklyRecognition>(() => loadWeeklyRecognition())
  const [photos, setPhotos] = useState<FamilyPhoto[]>([])
  const [pendingChatPhoto, setPendingChatPhoto] = useState<string | null>(null)
  const [chatDraft, setChatDraft] = useState('')
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const saved = localStorage.getItem('family-circle-notifications')
      return saved ? JSON.parse(saved) as Notification[] : initialNotifications
    } catch { return initialNotifications }
  })
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(() => loadNotificationPreferences())
  const [events, setEvents] = useState<FamilyEvent[]>([
    { id: 'event-1', title: 'Family Dinner', date: todayKey(), time: '19:00', location: 'At Home' },
    { id: 'event-2', title: 'Football Training', date: todayKey(), time: '17:00', location: 'Leisure Centre' },
    { id: 'event-3', title: 'Weekly Food Shop', date: (() => { const d = new Date(); d.setDate(d.getDate() + 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` })(), time: '18:00', location: 'Supermarket' },
  ])
  const [personalEventsByMember, setPersonalEventsByMember] = useState<Record<string, PersonalEvent[]>>(() => {
    try {
      const saved = localStorage.getItem('family-circle-personal-events-by-member')
      if (saved) return JSON.parse(saved) as Record<string, PersonalEvent[]>
      const legacy = localStorage.getItem('family-circle-personal-events')
      return legacy ? { [memberSeeds[0].id]: JSON.parse(legacy) as PersonalEvent[] } : {}
    } catch { return {} }
  })
  const [activeStatusSharing, setActiveStatusSharing] = useState(() => localStorage.getItem('family-circle-active-status') !== 'false')
  const [appVisible, setAppVisible] = useState(true)
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
    const now = Date.now()
    const retentionMs = 5 * 24 * 60 * 60 * 1000
    const retained = familyCourtCases.filter((item) => {
      if (item.status !== 'closed') return true
      const closedAt = item.appeal?.closedAt ?? item.courtStageStartedAt ?? item.createdAt
      return now - new Date(closedAt).getTime() < retentionMs
    })
    if (retained.length !== familyCourtCases.length) {
      setFamilyCourtCases(retained)
      return
    }
    localStorage.setItem('family-circle-court-cases', JSON.stringify(familyCourtCases))
  }, [familyCourtCases])
  useEffect(() => { localStorage.setItem('family-circle-notifications', JSON.stringify(notifications)) }, [notifications])
  useEffect(() => {
    if (familyCourtSetupView !== 'courtroom') return
    const timer = window.setInterval(() => setFamilyCourtClock(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [familyCourtSetupView])

  useEffect(() => {
    if (familyCourtSetupView !== 'courtroom' || !familyCourtOpenedCaseId) return
    setFamilyCourtCases((current) => current.map((item) => {
      if (item.id !== familyCourtOpenedCaseId || !item.courtStarted) return item
      if (!item.courtStage || !item.courtStageStartedAt) {
        return { ...item, courtStage: 'opening-writing', courtStageStartedAt: new Date().toISOString(), openingStatements: item.openingStatements ?? {}, openingSubmittedBy: item.openingSubmittedBy ?? [], evidence: item.evidence ?? {}, evidenceSubmittedBy: item.evidenceSubmittedBy ?? [] }
      }
      const elapsed = (familyCourtClock - new Date(item.courtStageStartedAt).getTime()) / 1000
      const parties = [item.accuserId, item.accusedId]
      if (item.courtStage === 'opening-writing' && (elapsed >= 60 || parties.every((id) => (item.openingSubmittedBy ?? []).includes(id)))) {
        return { ...item, courtStage: 'opening-reading-accuser', courtStageStartedAt: new Date(familyCourtClock).toISOString(), openingSubmittedBy: parties }
      }
      if (item.courtStage === 'opening-reading-accuser' && elapsed >= 30) {
        return { ...item, courtStage: 'opening-reading-accused', courtStageStartedAt: new Date(familyCourtClock).toISOString() }
      }
      if (item.courtStage === 'opening-reading-accused' && elapsed >= 30) {
        return { ...item, courtStage: 'evidence-upload', courtStageStartedAt: new Date(familyCourtClock).toISOString(), evidence: item.evidence ?? {}, evidenceSubmittedBy: [] }
      }
      if (item.courtStage === 'evidence-upload' && (elapsed >= 60 || parties.every((id) => (item.evidenceSubmittedBy ?? []).includes(id)))) {
        return { ...item, courtStage: 'evidence-review-accuser', courtStageStartedAt: new Date(familyCourtClock).toISOString(), evidenceSubmittedBy: parties }
      }
      if (item.courtStage === 'evidence-review-accuser' && elapsed >= 30) {
        return { ...item, courtStage: 'evidence-review-accused', courtStageStartedAt: new Date(familyCourtClock).toISOString() }
      }
      if (item.courtStage === 'evidence-review-accused' && elapsed >= 30) {
        return { ...item, courtStage: 'judge-question-writing', courtStageStartedAt: new Date(familyCourtClock).toISOString(), judgeQuestions: item.judgeQuestions ?? {} }
      }
      if (item.courtStage === 'judge-question-writing' && (elapsed >= 60 || item.judgeQuestionsSubmitted)) {
        return { ...item, courtStage: 'answer-writing', courtStageStartedAt: new Date(familyCourtClock).toISOString(), answers: item.answers ?? {}, answersSubmittedBy: [] }
      }
      if (item.courtStage === 'answer-writing' && (elapsed >= 20 || parties.every((id) => (item.answersSubmittedBy ?? []).includes(id)))) {
        const juryIds = members.filter((member) => !parties.includes(member.id) && member.id !== item.judgeId).map((member) => member.id)
        return { ...item, courtStage: juryIds.length > 0 ? 'jury-vote' : 'verdict', courtStageStartedAt: new Date(familyCourtClock).toISOString(), answersSubmittedBy: parties, juryVotes: item.juryVotes ?? {} }
      }
      if (item.courtStage === 'verdict' && elapsed >= 1 && item.verdict) {
          return { ...item, courtStage: item.verdict === 'guilty' ? 'punishment' : 'case-closed', courtStageStartedAt: new Date(familyCourtClock).toISOString() }
        }
        if (item.courtStage === 'jury-vote' && elapsed >= 30) {
        const juryIds = members.filter((member) => !parties.includes(member.id) && member.id !== item.judgeId).map((member) => member.id)
        const votes = juryIds.map((id) => (item.juryVotes ?? {})[id]).filter(Boolean) as Array<'guilty' | 'not-guilty'>
        const guilty = votes.filter((vote) => vote === 'guilty').length
        const notGuilty = votes.filter((vote) => vote === 'not-guilty').length
        return { ...item, courtStage: 'verdict', courtStageStartedAt: new Date(familyCourtClock).toISOString(), verdict: guilty > notGuilty ? 'guilty' : 'not-guilty' }
      }
      return item
    }))
  }, [familyCourtClock, familyCourtOpenedCaseId, familyCourtSetupView])
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


  useEffect(() => {
    const syncVisibility = () => setAppVisible(document.visibilityState === 'visible')
    syncVisibility()
    document.addEventListener('visibilitychange', syncVisibility)
    return () => document.removeEventListener('visibilitychange', syncVisibility)
  }, [])

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
    if (isRecognitionTieBreakOpen() || now.getHours() >= 21) {
      (['fam','clown'] as const).forEach((type) => {
        const tie=type==='fam'?next.famTie:next.clownTie
        if (!tie || (type==='fam'&&next.famWinner) || (type==='clown'&&next.clownWinner)) return
        const result=tally(tie.votes,tie.candidates)
        const winnerKey=type==='fam'?'famWinner':'clownWinner'
        const tieKey=type==='fam'?'famTie':'clownTie'
        const announcedKey=type==='fam'?'famAnnounced':'clownAnnounced'
        if(result.leaders.length===1){ next={...next,[winnerKey]:result.leaders[0],[tieKey]:null,[announcedKey]:true} }
        else if(now.getHours() >= 21){ next={...next,[tieKey]:null,[announcedKey]:true} }
      })
    }
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
    setProfileSavedView(memberId === selectedMember.id)
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
    const latest = members.find((member) => member.id === profileTarget.id) ?? profileTarget
    const updated = { ...latest, bio, status: profileStatus }
    persistMember(updated)
    setProfileTargetId(updated.id)
    setProfileBio(updated.bio)
    setProfileStatus(updated.status)
    setProfileSocials(updated.socials)
    setProfileMessage('Profile details saved.')
    setProfileSavedView(true)
  }

  function saveProfileSettings() {
    const latest = members.find((member) => member.id === selectedMember.id) ?? selectedMember
    const updated = { ...latest, socials: { ...profileSocials } }
    persistMember(updated)
    setProfileTargetId(updated.id)
    setProfileSocials(updated.socials)
    setProfileMessage('Profile links saved.')
  }

  function uploadProfileCover(file: File) {
    if (!file.type.startsWith('image/') || profileTarget.id !== selectedMember.id) return
    const reader = new FileReader()
    reader.onload = () => {
      const coverPhoto = typeof reader.result === 'string' ? reader.result : ''
      if (!coverPhoto) return
      persistMember({ ...selectedMember, coverPhoto })
      setProfileMessage('Cover photo updated.')
    }
    reader.readAsDataURL(file)
  }

  function removeProfileCover() {
    if (profileTarget.id !== selectedMember.id) return
    persistMember({ ...selectedMember, coverPhoto: null })
    setProfileMessage('Cover photo removed.')
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

  function addPersonalEvent(title: string, date: string, time: string, location: string) {
    if (!title.trim() || !date || !time) return
    const memberEvents = personalEventsByMember[selectedMember.id] ?? []
    const next = [...memberEvents, { id: `personal-event-${Date.now()}`, title: title.trim(), date, time, location: location.trim() }]
    const nextByMember = { ...personalEventsByMember, [selectedMember.id]: next }
    setPersonalEventsByMember(nextByMember)
    localStorage.setItem('family-circle-personal-events-by-member', JSON.stringify(nextByMember))
  }

  function saveActiveStatusPreference(enabled: boolean) {
    setActiveStatusSharing(enabled)
    localStorage.setItem('family-circle-active-status', String(enabled))
  }

  function memberIsOnline(memberId: string) {
    return activeStatusSharing && appVisible && memberId === selectedMember.id
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
    const readyCourtCase = familyCourtCases.find((item) => item.status === 'ready')
    const firstThreeMessages = messages.slice(0, 3)
    const firstThreeTasks = tasks.slice(0, 3)
    return <div className="fc-page">
      <header className="fc-home-topbar">
        <button className="fc-home-profile fc-home-profile-hero" type="button" onClick={() => openProfile(selectedMember.id)} style={selectedMember.coverPhoto ? { backgroundImage: `linear-gradient(90deg,rgba(7,10,27,.95) 0%,rgba(7,10,27,.78) 42%,rgba(7,10,27,.45) 100%),url("${selectedMember.coverPhoto}")` } : undefined}>
          <AppAvatar member={selectedMember} className="fc-home-avatar" />
          <span className="fc-home-profile-copy"><small>{timeGreeting()}</small><strong>{selectedMember.label}</strong><em>{selectedMember.bio || 'Keeping the family moving.'}</em><span><i className={`fc-online-dot${memberIsOnline(selectedMember.id) ? ' online' : ''}`} /> {memberIsOnline(selectedMember.id) ? 'Online' : 'Offline'} · {selectedMember.status}</span></span>
          <b className="fc-home-profile-arrow">→</b>
        </button>
        <div className="fc-home-brand-row">
          <div className="fc-home-logo"><img src={logoUrl} alt="Family Circle" /></div>
          <div className="fc-home-actions"><button className="fc-round-button" type="button" onClick={() => openTool('notifications')} aria-label="Notifications">🔔{notifications.filter((item) => !item.recipientMemberId || item.recipientMemberId === selectedMember.id).length > 0 && <b>{notifications.filter((item) => !item.recipientMemberId || item.recipientMemberId === selectedMember.id).length}</b>}</button><button className="fc-round-button" type="button" onClick={() => openTool('settings')} aria-label="Settings">⚙️</button></div>
        </div>
      </header>

      <section className="fc-banner">
        <span className="fc-banner-heart">♡</span>
        <div className="fc-banner-quote"><strong className="fc-quote-text">{dailyQuote}</strong><span>Family Circle · Today</span></div>
        <time className="fc-banner-date">{(() => { const date = formatBannerDate(todayKey()); return <><strong>{date.weekday}</strong><span>{date.dayMonth}</span><small>{date.year}</small><b>{formatTime()}</b></> })()}</time>
      </section>

      {readyCourtCase && <section className="fc-home-courtroom-alert"><button type="button" onClick={() => enterFamilyCourtroom(readyCourtCase.id)}><span className="fc-home-courtroom-alert-icon">⚖️</span><span><small>FAMILY COURT</small><strong>ENTER COURTROOM</strong><em>{readyCourtCase.title} · Everyone has accepted</em></span><b>→</b></button></section>}

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

      <section className="fc-home-family-court">
        <button className="fc-home-family-court-card" type="button" onClick={() => openTool('familyCourt')}>
          <div className="fc-home-family-court-emblem" aria-hidden="true"><span>⚖️</span><i>🔨</i></div>
          <div className="fc-home-family-court-copy">
            <span className="fc-home-family-court-kicker">⚖️ Family Circle</span>
            <strong>FAMILY COURT</strong>
            <p>Bring it to court. Let the family decide.</p>
            <span className="fc-home-family-court-action">Enter Family Court →</span>
          </div>
          <div className="fc-home-family-court-badge"><span>New</span><strong>⚖️</strong></div>
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
      </section>

      {renderBottomNav()}
      <div className="fc-footer"><div className="fc-footer-actions"><button type="button" onClick={() => setScreen('members')}>Switch family member</button><button type="button" onClick={switchFamily}>Switch family</button></div><span>Foundation build</span></div>
    </div>
  }

  function renderChat() {
    return <div className="fc-page fc-chat-page">
      <FeatureHeader title="Family Chat" description="Keep the family conversation together in one private space." onHome={() => goToTab('home')} />
      <section className="fc-chat-vote-slot"><details className="fc-weekly-vote-collapsed">
        <summary><span><small>Sunday · 5:00–8:00 PM</small><strong>⭐ Family Circle Weekly Vote</strong></span><b>{isRecognitionVotingOpen() ? 'Voting open' : weeklyRecognition.famWinner || weeklyRecognition.clownWinner ? 'Results available' : 'Closed'} <i>⌄</i></b></summary>
        <div className="fc-weekly-vote-expanded">{isRecognitionVotingOpen() ? <div className="fc-award-vote-grid">
          <div className="fc-award-vote-card fam"><span>⭐</span><strong>Fam of the Week</strong><small>Choose your family favourite.</small><div className="fc-award-candidates">{members.map(member=><button key={member.id} type="button" className={weeklyRecognition.famVotes[selectedMember.id]===member.id?'selected':''} onClick={()=>castWeeklyVote('fam',member.id)}><AppAvatar member={member}/><span>{member.label}</span>{weeklyRecognition.famVotes[selectedMember.id]===member.id&&<b>✓</b>}</button>)}</div></div>
          <div className="fc-award-vote-card clown"><span>🤡</span><strong>Clown of the Week</strong><small>Choose this week's chaos champion.</small><div className="fc-award-candidates">{members.map(member=><button key={member.id} type="button" className={weeklyRecognition.clownVotes[selectedMember.id]===member.id?'selected':''} onClick={()=>castWeeklyVote('clown',member.id)}><AppAvatar member={member}/><span>{member.label}</span>{weeklyRecognition.clownVotes[selectedMember.id]===member.id&&<b>✓</b>}</button>)}</div></div>
        </div> : <div className="fc-award-closed"><div><strong>🔒 The weekly vote is closed.</strong><span>Votes are counted between 5:00 PM and 8:00 PM on Sunday.</span></div>{weeklyRecognition.famWinner&&<div className="fc-award-result fam"><span>⭐</span><div><small>Fam of the Week</small><strong>{members.find(m=>m.id===weeklyRecognition.famWinner)?.label}</strong></div></div>}{weeklyRecognition.clownWinner&&<div className="fc-award-result clown"><span>🤡</span><div><small>Clown of the Week</small><strong>{members.find(m=>m.id===weeklyRecognition.clownWinner)?.label}</strong></div></div>}</div>}</div>
      </details></section>
      <section className="fc-chat-main-panel">
        <div className="fc-panel-head"><div><small>Family conversation</small><h2>Chat</h2></div><span className="fc-pill">Private family space</span></div>
        <div className="fc-chat-list">{messages.map((message, index) => { const linkedMoneyRequest = message.moneyRequestId ? moneyRequests.find((request) => request.id === message.moneyRequestId) : null; const requester = linkedMoneyRequest ? members.find((member) => member.id === linkedMoneyRequest.requesterId) ?? selectedMember : null; const lender = linkedMoneyRequest?.lenderId ? members.find((member) => member.id === linkedMoneyRequest.lenderId) : null; const unread = isMessageUnread(message.id); const outgoing = message.memberId === selectedMember.id; const previous = messages[index - 1]; const grouped = Boolean(previous && previous.memberId === message.memberId); return <div className={outgoing ? (unread ? "fc-chat-row fc-chat-row-outgoing fc-unread-row" : "fc-chat-row fc-chat-row-outgoing") : (unread ? "fc-chat-row fc-chat-row-incoming fc-unread-row" : "fc-chat-row fc-chat-row-incoming")} key={message.id}><AppAvatar member={members.find((m) => m.id === message.memberId) ?? selectedMember} className={grouped ? "fc-chat-avatar fc-chat-avatar-grouped" : "fc-chat-avatar"} /><div className="fc-chat-bubble"><div className="fc-chat-meta">{!grouped && <strong>{outgoing ? "You" : message.name}</strong>}{unread && <span className="fc-unread-label">NEW</span>}<time>{message.time}</time></div>{linkedMoneyRequest ? <div className="fc-money-chat-card"><div className="fc-money-chat-head"><strong>💷 Money Request</strong><span className={linkedMoneyRequest.status === 'Accepted' ? 'fc-money-chat-status accepted' : 'fc-money-chat-status'}>{linkedMoneyRequest.status === 'Accepted' ? 'Accepted' : 'Awaiting acceptance'}</span></div><strong className="fc-money-chat-amount">£{linkedMoneyRequest.amount}</strong><p>{linkedMoneyRequest.purpose}</p><small>Requested by {requester?.label ?? message.name} · Repayment due {formatLongDate(linkedMoneyRequest.dueDate)}</small>{linkedMoneyRequest.status === 'Accepted' && <small className="fc-money-chat-accepted">✓ Accepted by {lender?.label ?? 'family member'} · Repayment task and calendar event created.</small>}{linkedMoneyRequest.status === 'Pending' && linkedMoneyRequest.requesterId !== selectedMember.id && <button className="fc-money-chat-accept" type="button" onClick={() => acceptMoneyRequest(linkedMoneyRequest.id)}>Accept Request</button>}{linkedMoneyRequest.status === 'Pending' && linkedMoneyRequest.requesterId === selectedMember.id && <small className="fc-money-chat-waiting">Waiting for another family member to accept.</small>}</div> : <><p>{message.text}</p>{message.image&&<img src={message.image} alt="Family shared" />}</>}</div></div> })}</div>
        {pendingChatPhoto&&<div className="fc-pending-photo"><img src={pendingChatPhoto} alt="Ready to send" /><button type="button" onClick={()=>setPendingChatPhoto(null)}>×</button></div>}
        <div className="fc-composer"><label className="fc-attach"><input className="fc-hidden" type="file" accept="image/*" onChange={(event)=>{const file=event.target.files?.[0];if(file)stageChatPhoto(file);event.currentTarget.value=''}}/>＋ Photo</label><input value={chatDraft} onChange={event=>setChatDraft(event.target.value)} onKeyDown={event=>{if(event.key==='Enter')sendChatMessage()}} placeholder="Write a family message…" /><button type="button" onClick={sendChatMessage}>Send</button></div>
      </section>
      {renderBottomNav()}
    </div>
  }
  function renderPhotos() {
    return <div className="fc-page"><FeatureHeader title="Recent Photos" description="Photos shared in Family Chat appear here as family memories." onHome={() => goToTab('home')} /><div className="fc-panel"><div className="fc-panel-head"><div><small>Family memories</small><h2>Recent Photos</h2></div><span className="fc-pill">{photos.length} shared</span></div>{photos.length === 0 ? <div className="fc-empty"><span>▧</span><strong>No recent photos yet.</strong><p>Send a photo from Family Chat and it will appear here automatically.</p><button className="fc-primary-button" type="button" onClick={() => goToTab('chat')}>Open Family Chat</button></div> : <div className="fc-photo-grid">{photos.map((photo) => <article key={photo.id}><img src={photo.src} alt={photo.name} /><div><strong>{photo.name}</strong><span>Shared in Family Chat · {photo.time}</span></div></article>)}</div>}</div>{renderBottomNav()}</div>
  }

  function renderCalendar() {
    return <CalendarPanel events={events} onAdd={addEvent} onBack={() => goToTab('home')} onNav={renderBottomNav} mode="family" />
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
    return <div className="fc-page"><FeatureHeader title="Family Members" description="Your family tree is about connection, not complicated relationship rules." onHome={() => goToTab('home')} /><div className="fc-panel fc-tree-panel"><div className="fc-panel-head"><div><small>Your family</small><h2>Family Circle Tree</h2></div><span className="fc-pill">3 profiles</span></div><div className="fc-tree"><div className="fc-tree-top"><button className="fc-tree-node current" type="button" onClick={() => openProfile(selectedMember.id)}><AppAvatar member={selectedMember} /><strong>{selectedMember.label}</strong><span><i className={`fc-online-dot${memberIsOnline(selectedMember.id) ? ' online' : ''}`} /> {memberIsOnline(selectedMember.id) ? 'Online' : 'Offline'} · {selectedMember.status}</span></button></div><div className="fc-tree-connector" /><div className="fc-tree-branches">{members.filter((member) => member.id !== selectedMember.id).map((member) => <button className="fc-tree-node" type="button" key={member.id} onClick={() => openProfile(member.id)}><AppAvatar member={member} /><strong>{member.label}</strong><span><i className={`fc-online-dot${memberIsOnline(member.id) ? ' online' : ''}`} /> {memberIsOnline(member.id) ? 'Online' : 'Offline'} · {member.status}</span><small>View profile →</small></button>)}</div></div></div>{renderBottomNav()}</div>
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
        <div className="fc-profile-saved-hero" style={profileTarget.coverPhoto ? { backgroundImage: `linear-gradient(115deg,rgba(8,11,28,.94),rgba(12,15,36,.76) 48%,rgba(12,9,30,.58)),url("${profileTarget.coverPhoto}")` } : undefined}>
          <div className="fc-profile-cover-tools">
            <label className="fc-profile-cover-upload"><span>▧ Cover photo</span><input className="fc-hidden" type="file" accept="image/*" onChange={(event) => { const file=event.target.files?.[0]; if(file) uploadProfileCover(file); event.currentTarget.value='' }} /></label>
            {profileTarget.coverPhoto && <button type="button" onClick={removeProfileCover}>Remove cover</button>}
          </div>
          <div className="fc-profile-saved-photo-wrap">
            <button className="fc-profile-photo-view-button" type="button" onClick={() => profileTarget.photo && setProfilePhotoViewer(profileTarget.photo)} aria-label="View profile photo"><AppAvatar member={profileTarget} className="fc-profile-saved-photo" />{profileTarget.photo && <span>View photo</span>}</button>
            <span className="fc-profile-saved-status"><i className={`fc-online-dot${memberIsOnline(profileTarget.id) ? ' online' : ''}`} /> {memberIsOnline(profileTarget.id) ? 'Online' : 'Offline'} · {profileTarget.status}</span>
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
        <section className="fc-personal-calendar-wrap"><CalendarPanel events={events} personalEvents={personalEventsByMember[selectedMember.id] ?? []} onAdd={addEvent} onAddPersonal={addPersonalEvent} onBack={() => {}} onNav={() => <></>} mode="personal" /></section>
                <RecognitionProfile member={profileTarget} members={members} />
      </section> : <div className="fc-profile-layout">
        <div className="fc-panel fc-profile-hero" style={profileTarget.coverPhoto ? { backgroundImage: `linear-gradient(135deg,rgba(10,13,32,.96),rgba(10,13,32,.78)),url("${profileTarget.coverPhoto}")` } : undefined}>
          <div className="fc-profile-cover-edit-row"><label className="fc-profile-cover-upload"><span>▧ Add cover photo</span><input className="fc-hidden" type="file" accept="image/*" onChange={(event) => { const file=event.target.files?.[0]; if(file) uploadProfileCover(file); event.currentTarget.value='' }} /></label>{profileTarget.coverPhoto && <button type="button" onClick={removeProfileCover}>Remove cover</button>}</div>
          <div className="fc-profile-photo-wrap">{isOwn ? <label className="fc-profile-photo-button"><AppAvatar member={{ ...profileTarget, photo: profileTarget.photo }} className="fc-profile-photo" /><span>Change photo</span><input className="fc-hidden" type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) uploadProfilePhoto(file); event.currentTarget.value = '' }} /></label> : <AppAvatar member={profileTarget} className="fc-profile-photo" />} {isOwn && profileTarget.photo && <div className="fc-profile-photo-actions"><button className="fc-profile-photo-view-link" type="button" onClick={() => setProfilePhotoViewer(profileTarget.photo!)}>View photo</button><button className="fc-remove-photo" type="button" onClick={removeProfilePhoto}>Remove photo</button></div>}</div>
          <h2>{profileTarget.label}</h2>
          <p className="fc-status-chip"><i className={`fc-online-dot${memberIsOnline(profileTarget.id) ? ' online' : ''}`} /> {memberIsOnline(profileTarget.id) ? 'Online' : 'Offline'} · {profileTarget.status}</p>
          <p className="fc-muted">{profileTarget.bio || 'No bio yet.'}</p>
          <a className="fc-phone-link" href={`tel:${profileTarget.phone}`}>☎ {profileTarget.phone}</a>
        </div>
        <div className="fc-panel">
          <div className="fc-panel-head"><div><small>Profile details</small><h2>{isOwn ? 'Edit your details' : 'About this family member'}</h2></div></div>
          {isOwn ? <><label className="fc-textarea-label"><span>Short bio · {profileBio.length}/100</span><textarea maxLength={100} rows={4} value={profileBio} onChange={(event) => setProfileBio(event.target.value)} placeholder="A short line about you…" /></label><label className="fc-form-field"><span>My Status</span><select value={profileStatus} onChange={(event) => { setProfileStatus(event.target.value as StatusOption); changeStatus(event.target.value as StatusOption) }}>{statusOptions.map((status) => <option value={status} key={status}>{status}</option>)}</select></label>{profileMessage && <p className="fc-save-note">{profileMessage}</p>}<button className="fc-primary-button fc-profile-save-button" type="button" onClick={saveProfile}>Save Profile</button></> : <div className="fc-read-profile"><div><strong>Active status</strong><span>{memberIsOnline(profileTarget.id) ? '🟢 Online' : '⚫ Offline'}</span></div><div><strong>My Status</strong><span>{profileTarget.status}</span></div><div><strong>Bio</strong><span>{profileTarget.bio || 'No bio yet.'}</span></div><div><strong>Phone</strong><a href={`tel:${profileTarget.phone}`}>{profileTarget.phone}</a></div><div><strong>Location sharing</strong><span>{locationSharing[profileTarget.id] ? 'On' : 'Off'}</span></div><div><strong>Social links</strong><span>{socialNames.some((name) => profileTarget.socials[name]) ? socialNames.filter((name) => profileTarget.socials[name]).map((name) => <a key={name} href={profileTarget.socials[name]} target="_blank" rel="noreferrer">{socialIcons[name]} {name}</a>) : 'None added yet.'}</span></div></div>}
        </div>
      </div>}
      {isOwn && !profileSavedView && <RecognitionProfile member={profileTarget} members={members} />}
      {renderBottomNav()}
    </div>
  }
  function handleNotificationClick(item: Notification) {
    if (item.target === 'familyCourt') {
      const courtCaseId = item.id.match(/^court-(?:summons|jury)-(.+?)(?:-member-[^-]+)?$/)?.[1] ?? item.id.match(/^court-accepted-(.+?)-member-[^-]+$/)?.[1]
      const targetCase = (courtCaseId && familyCourtCases.find((courtCase) => courtCase.id === courtCaseId)) ?? familyCourtCases.find((courtCase) => courtCase.status === 'summoned' || courtCase.status === 'ready')
      if (targetCase) {
        setFamilyCourtOpenedCaseId(targetCase.id)
        setFamilyCourtCaseTitle(targetCase.title)
        setFamilyCourtAccusedId(targetCase.accusedId)
        setFamilyCourtSetupView('hub')
      }
      setToolMode('familyCourt')
      setActiveTab('home')
    }
    setNotifications((current) => current.filter((notification) => notification.id !== item.id))
  }

  function renderNotifications() {
    return <div className="fc-page"><FeatureHeader title="Notifications" description="Keep up with family chat, tasks, calendar and emergency requests." onHome={() => goToTab('home')} /><div className="fc-panel"><div className="fc-panel-head"><div><small>Family updates</small><h2>Notifications</h2></div><button className="fc-ghost-button" type="button" onClick={() => setNotifications([])}>Clear all</button></div>{notifications.length === 0 ? <div className="fc-empty"><span>✓</span><strong>You're all caught up.</strong><p>No new family notifications.</p></div> : <div className="fc-notification-list">{notifications.map((item) => <button className="fc-notification-item" key={item.id} type="button" onClick={() => handleNotificationClick(item)}><span className="fc-notification-icon">{item.kind === 'Emergency' ? '🚨' : item.kind === 'Money' ? '💷' : item.target === 'familyCourt' ? '⚖️' : '•'}</span><div><strong>{item.title}</strong><p>{item.detail}</p><small>{item.time}</small></div><b>→</b></button>)}</div>}</div>{renderBottomNav()}</div>
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
        <div className="fc-settings-section"><p className="fc-kicker">Profile presence</p><h2>How you appear</h2><p className="fc-muted">Your active status is separate from your chosen profile status.</p></div>
        <label className="fc-setting-row"><span><strong>🟢 Show Active Status</strong><small>Show family members when you're currently using Family Circle.</small></span><input type="checkbox" checked={activeStatusSharing} onChange={(event) => saveActiveStatusPreference(event.target.checked)} /></label>
        <div className="fc-settings-section"><p className="fc-kicker">Profile links</p><h2>Social links</h2><p className="fc-muted">Add your social links here. They appear automatically on your profile.</p></div>
        <div className="fc-profile-settings-socials">{socialNames.map((name) => <label key={name}><span>{socialIcons[name]} {name}</span><input value={profileSocials[name]} onChange={(event) => setProfileSocials((current) => ({ ...current, [name]: event.target.value }))} placeholder={`https://${name.toLowerCase()}.com/...`} /><b className={profileSocials[name] ? 'active' : ''}>{profileSocials[name] ? 'Active' : 'Blank'}</b></label>)}<button className="fc-primary-button" type="button" onClick={saveProfileSettings}>Save Profile Links</button></div>
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

  function acceptFamilyCourtCase(caseId: string) {
    setFamilyCourtCases((current) => current.map((item) => {
      if (item.id !== caseId) return item
      const acceptedMemberIds = Array.from(new Set([...(item.acceptedMemberIds ?? []), selectedMember.id]))
      const allAccepted = members.every((member) => acceptedMemberIds.includes(member.id))
      return { ...item, acceptedMemberIds, status: allAccepted ? 'ready' : item.status }
    }))
    setNotifications((current) => { const targetCase = familyCourtCases.find((item) => item.id === caseId); return [{ id: 'court-accepted-' + caseId + '-' + selectedMember.id, kind: 'Calendar' as const, title: selectedMember.label + ' accepted the Family Court summons', detail: 'The courtroom will open when everyone has accepted.', time: 'Just now', target: 'familyCourt' as const, targetCaseId: caseId, recipientMemberId: targetCase?.accuserId }, ...current.filter((notification) => !(notification.target === 'familyCourt' && notification.targetCaseId === caseId && notification.recipientMemberId === selectedMember.id))] })
  }

  function enterFamilyCourtroom(caseId: string) {
    const targetCase = familyCourtCases.find((item) => item.id === caseId)
    if (!targetCase) return
    const eligibleJudges = members.filter((member) => member.id !== targetCase.accuserId && member.id !== targetCase.accusedId)
    const automaticJudgeId = eligibleJudges.length === 1 ? eligibleJudges[0].id : targetCase.judgeId
    setFamilyCourtCases((current) => current.map((item) => item.id === caseId ? { ...item, judgeId: automaticJudgeId } : item))
    setFamilyCourtOpenedCaseId(caseId)
    setFamilyCourtSetupView('courtroom')
    setToolMode('familyCourt')
    setActiveTab('home')
  }

  function beginFamilyCourt(caseId: string) {
    setFamilyCourtCases((current) => current.map((item) => item.id === caseId ? {
      ...item,
      courtStarted: true,
      courtStage: 'opening-writing',
      courtStageStartedAt: new Date().toISOString(),
      openingStatements: {},
    } : item))
  }

  function saveOpeningStatement(caseId: string, text: string) {
    setFamilyCourtCases((current) => current.map((item) => {
      if (item.id !== caseId) return item
      return { ...item, openingStatements: { ...(item.openingStatements ?? {}), [selectedMember.id]: text } }
    }))
  }

  function submitOpeningStatement(caseId: string) {
    setFamilyCourtCases((current) => current.map((item) => item.id === caseId ? { ...item, openingSubmittedBy: Array.from(new Set([...(item.openingSubmittedBy ?? []), selectedMember.id])) } : item))
  }

  function addCourtEvidence(caseId: string, file: File) {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      const src = typeof reader.result === 'string' ? reader.result : ''
      if (!src) return
      setFamilyCourtCases((current) => current.map((item) => {
        if (item.id !== caseId) return item
        const existing = item.evidence?.[selectedMember.id] ?? []
        if (existing.length >= 4) return item
        return { ...item, evidence: { ...(item.evidence ?? {}), [selectedMember.id]: [...existing, src] } }
      }))
    }
    reader.readAsDataURL(file)
  }

  function submitCourtEvidence(caseId: string) {
    setFamilyCourtCases((current) => current.map((item) => item.id === caseId ? { ...item, evidenceSubmittedBy: Array.from(new Set([...(item.evidenceSubmittedBy ?? []), selectedMember.id])) } : item))
  }

  function saveJudgeQuestion(caseId: string, memberId: string, text: string) {
    setFamilyCourtCases((current) => current.map((item) => item.id === caseId ? { ...item, judgeQuestions: { ...(item.judgeQuestions ?? {}), [memberId]: text } } : item))
  }

  function submitJudgeQuestions(caseId: string) {
    setFamilyCourtCases((current) => current.map((item) => item.id === caseId ? { ...item, judgeQuestionsSubmitted: true } : item))
  }

  function saveCourtAnswer(caseId: string, text: string) {
    setFamilyCourtCases((current) => current.map((item) => item.id === caseId ? { ...item, answers: { ...(item.answers ?? {}), [selectedMember.id]: text } } : item))
  }

  function submitCourtAnswer(caseId: string) {
    setFamilyCourtCases((current) => current.map((item) => item.id === caseId ? { ...item, answersSubmittedBy: Array.from(new Set([...(item.answersSubmittedBy ?? []), selectedMember.id])) } : item))
  }

  function castJuryVote(caseId: string, vote: 'guilty' | 'not-guilty') {
    setFamilyCourtCases((current) => current.map((item) => item.id === caseId ? { ...item, juryVotes: { ...(item.juryVotes ?? {}), [selectedMember.id]: vote } } : item))
  }

  function judgeSetVerdict(caseId: string, verdict: 'guilty' | 'not-guilty') {
    const now = new Date().toISOString()
    setFamilyCourtCases((current) => current.map((item) => item.id === caseId ? { ...item, verdict, verdictAt: now, courtStage: 'verdict', courtStageStartedAt: now } : item))
  }

  function closeFamilyCourtCase(caseId: string) {
    const now = new Date().toISOString()
    setFamilyCourtCases((current) => current.map((item) => {
      if (item.id !== caseId) return item
      const appeal = item.appeal?.status === 'approved'
        ? { ...item.appeal, status: 'closed' as const, closedAt: now, finalVerdict: item.verdict, finalPunishment: item.punishment }
        : item.appeal
      return { ...item, status: 'closed', appeal, courtStage: 'case-closed', courtStageStartedAt: now }
    }))
    setFamilyCourtOpenedCaseId(null)
    setFamilyCourtSetupView('hub')
  }

  function judgeSetPunishment(caseId: string, punishment: string) {
    const value = punishment.trim()
    if (!value) return
    setFamilyCourtCases((current) => current.map((item) => item.id === caseId ? { ...item, status: 'closed', punishment: value, courtStage: 'case-closed', courtStageStartedAt: new Date().toISOString() } : item))
  }

  function appealWindow(caseItem: FamilyCourtCase) {
    if (caseItem.verdict !== 'guilty') return 0
    const started = new Date(caseItem.verdictAt ?? caseItem.courtStageStartedAt ?? caseItem.createdAt).getTime()
    return Math.max(0, (started + 5 * 24 * 60 * 60 * 1000) - Date.now())
  }

  function appealWindowLabel(caseItem: FamilyCourtCase) {
    const remaining = appealWindow(caseItem)
    if (remaining <= 0) return 'Appeal period expired'
    const days = Math.floor(remaining / 86400000)
    const hours = Math.floor((remaining % 86400000) / 3600000)
    return days > 0 ? days + ' day' + (days === 1 ? '' : 's') + ' remaining' : hours + ' hour' + (hours === 1 ? '' : 's') + ' remaining'
  }

  function openFamilyCourtUpcomingCases() {
    setFamilyCourtUpcomingCaseId(null)
    setFamilyCourtSetupView('upcomingCases')
  }

  function openFamilyCourtUpcomingCase(caseId: string) {
    setFamilyCourtUpcomingCaseId(caseId)
    setFamilyCourtSetupView('upcomingCase')
  }

  function openFamilyCourtReview(caseId: string) {
    setFamilyCourtReviewCaseId(caseId)
    setFamilyCourtSetupView('reviewCase')
  }

  function openFamilyCourtReviews() {
    setFamilyCourtReviewCaseId(null)
    setFamilyCourtSetupView('reviewCases')
  }

  function startFamilyCourtAppeal(caseId: string) {
    const caseItem = familyCourtCases.find((item) => item.id === caseId)
    if (!caseItem || caseItem.verdict !== 'guilty' || caseItem.accusedId !== selectedMember.id || caseItem.appeal || appealWindow(caseItem) <= 0) return
    setFamilyCourtReviewCaseId(caseId)
    setFamilyCourtAppealReason('New evidence')
    setFamilyCourtAppealExplanation('')
    setFamilyCourtAppealEvidence([])
    setFamilyCourtSetupView('appeal')
  }

  function addFamilyCourtAppealEvidence(file: File) {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      const src = typeof reader.result === 'string' ? reader.result : ''
      if (!src) return
      setFamilyCourtAppealEvidence((current) => current.length >= 4 ? current : [...current, src])
    }
    reader.readAsDataURL(file)
  }

  function submitFamilyCourtAppeal(caseId: string) {
    const caseItem = familyCourtCases.find((item) => item.id === caseId)
    if (!caseItem || caseItem.accusedId !== selectedMember.id || caseItem.verdict !== 'guilty' || caseItem.appeal || appealWindow(caseItem) <= 0) return
    const appeal: FamilyCourtAppeal = {
      id: 'appeal-' + Date.now().toString(36),
      appellantId: selectedMember.id,
      submittedAt: new Date().toISOString(),
      reason: familyCourtAppealReason,
      explanation: familyCourtAppealExplanation.trim(),
      newEvidence: familyCourtAppealEvidence,
      status: 'pending',
      familyVotes: {},
    }
    setFamilyCourtCases((current) => current.map((item) => item.id === caseId ? { ...item, appeal } : item))
    setNotifications((current) => [
      { id: 'court-appeal-' + caseId, kind: 'Calendar' as const, title: 'Family Court appeal submitted', detail: selectedMember.label + ' has appealed ' + caseItem.title + '. The family can now vote on the appeal.', time: 'Just now', target: 'familyCourt' as const, targetCaseId: caseId },
      ...current,
    ])
    setMessages((current) => [
      { id: 'chat-appeal-' + caseId, memberId: selectedMember.id, name: selectedMember.label, initials: selectedMember.initials, accent: selectedMember.accent, time: formatTime(), text: '⚖️ I have appealed the Family Court case “' + caseItem.title + '”. The appeal is ready for the family vote.' },
      ...current,
    ])
    setFamilyCourtSetupView('reviewCase')
  }

  function castFamilyCourtAppealVote(caseId: string, vote: 'allow' | 'deny') {
    const caseItem = familyCourtCases.find((item) => item.id === caseId)
    if (!caseItem?.appeal || caseItem.appeal.status !== 'pending' || caseItem.appeal.appellantId === selectedMember.id) return
    const eligibleVoters = members.filter((member) => member.id !== caseItem.appeal!.appellantId)
    const votes = { ...caseItem.appeal.familyVotes, [selectedMember.id]: vote }
    const allVoted = eligibleVoters.every((member) => votes[member.id])
    const allowCount = eligibleVoters.filter((member) => votes[member.id] === 'allow').length
    const denyCount = eligibleVoters.filter((member) => votes[member.id] === 'deny').length
    const decided = allVoted
    const approved = decided && allowCount > denyCount
    const appealStatus: FamilyCourtAppeal['status'] = decided ? (approved ? 'approved' : 'denied') : 'pending'
    const now = new Date().toISOString()
    setFamilyCourtCases((current) => current.map((item) => {
      if (item.id !== caseId || !item.appeal) return item
      if (appealStatus === 'approved') {
        const originalTrial: FamilyCourtTrialData = {
          judgeId: item.judgeId, courtStarted: item.courtStarted, courtStage: item.courtStage, courtStageStartedAt: item.courtStageStartedAt, verdictAt: item.verdictAt,
          openingStatements: item.openingStatements, openingSubmittedBy: item.openingSubmittedBy, evidence: item.evidence, evidenceSubmittedBy: item.evidenceSubmittedBy,
          judgeQuestions: item.judgeQuestions, judgeQuestionsSubmitted: item.judgeQuestionsSubmitted, answers: item.answers, answersSubmittedBy: item.answersSubmittedBy,
          juryVotes: item.juryVotes, verdict: item.verdict, punishment: item.punishment,
        }
        return {
          ...item, originalTrial, appeal: { ...item.appeal, familyVotes: votes, status: 'approved', votedAt: now, approvedAt: now },
          status: 'summoned', acceptedMemberIds: [item.appeal.appellantId], judgeId: undefined, courtStarted: false, courtStage: undefined, courtStageStartedAt: undefined,
          verdictAt: undefined, openingStatements: {}, openingSubmittedBy: [], evidence: {}, evidenceSubmittedBy: [], judgeQuestions: {}, judgeQuestionsSubmitted: false,
          answers: {}, answersSubmittedBy: [], juryVotes: {}, verdict: undefined, punishment: undefined,
        }
      }
      return { ...item, appeal: { ...item.appeal, familyVotes: votes, status: 'denied', votedAt: now, closedAt: now }, status: 'closed', courtStage: 'case-closed', courtStageStartedAt: now }
    }))
    if (decided) {
      setNotifications((current) => [{ id: 'court-appeal-decision-' + caseId + '-' + Date.now().toString(36), kind: 'Calendar' as const, title: approved ? 'Family Court appeal approved' : 'Family Court appeal denied', detail: approved ? 'The case has been reopened for a new Family Court trial.' : 'The original verdict is now final and cannot be appealed again.', time: 'Just now', target: 'familyCourt' as const, targetCaseId: caseId }, ...current])
    }
  }

  function resetFamilyCourtCaseSetup(view: 'hub' | 'form' = 'hub') {
    setFamilyCourtCaseTitle('')
    setFamilyCourtAccusedId('')
    setFamilyCourtTiming('now')
    setFamilyCourtDate(todayKey())
    setFamilyCourtTime('19:00')
    setFamilyCourtSetupView(view)
    setFamilyCourtOpenedCaseId(null)
    setFamilyCourtReviewCaseId(null)
    setFamilyCourtUpcomingCaseId(null)
    setFamilyCourtAppealReason('New evidence')
    setFamilyCourtAppealExplanation('')
    setFamilyCourtAppealEvidence([])
  }

  function openFamilyCourtCase() {
    const title = familyCourtCaseTitle.trim()
    if (!title || !familyCourtAccusedId || familyCourtAccusedId === selectedMember.id) return
    if (familyCourtTiming === 'scheduled' && (!familyCourtDate || !familyCourtTime)) return
    const id = 'court-' + Date.now().toString(36)
    const newCase: FamilyCourtCase = {
      id,
      title,
      accuserId: selectedMember.id,
      accusedId: familyCourtAccusedId,
      status: familyCourtTiming === 'scheduled' ? 'scheduled' : 'summoned',
      createdAt: new Date().toISOString(),
      acceptedMemberIds: [selectedMember.id],
      ...(familyCourtTiming === 'scheduled' ? { scheduledDate: familyCourtDate, scheduledTime: familyCourtTime } : {}),
    }
    setFamilyCourtCases((current) => [newCase, ...current])
    const accused = members.find((member) => member.id === familyCourtAccusedId)
    const accusedName = accused?.label ?? 'a family member'
    const familyNotifications: Notification[] = members
      .filter((member) => member.id !== selectedMember.id)
      .map((member) => member.id === familyCourtAccusedId
        ? { id: 'court-summons-' + id, kind: 'Calendar' as const, title: 'You have been summoned to Family Court', detail: selectedMember.label + ' has opened a case against you: ' + title, time: 'Just now', target: 'familyCourt' }
        : { id: 'court-jury-' + id + '-' + member.id, kind: 'Calendar' as const, title: 'A Family Court case has been opened', detail: selectedMember.label + ' has brought ' + accusedName + ' before Family Court: ' + title, time: 'Just now', target: 'familyCourt' })
    setNotifications((current) => [...familyNotifications, ...current])
    setFamilyCourtOpenedCaseId(id)
    setFamilyCourtSetupView('opened')
  }

  function renderTool() {
    if (toolMode === 'musicCommunity') return renderMusicCommunity()
    if (toolMode === 'familyCourt') {
      const openedCase = familyCourtCases.find((item) => item.id === familyCourtOpenedCaseId)
      const activeCourtCase = [...familyCourtCases].find((item) => item.status === 'ready' || item.status === 'summoned')
      const readyCourtCase = activeCourtCase?.status === 'ready' ? activeCourtCase : null
      const currentCourtCase = openedCase ?? activeCourtCase
      const currentMemberAccepted = currentCourtCase?.acceptedMemberIds?.includes(selectedMember.id) ?? false
      const acceptedCount = currentCourtCase?.acceptedMemberIds?.length ?? 0
      const accused = members.find((member) => member.id === (openedCase?.accusedId ?? familyCourtAccusedId))
      const scheduledLabel = familyCourtDate && familyCourtTime ? formatLongDate(familyCourtDate) + ' at ' + familyCourtTime : 'Not scheduled'
      return <div className="fc-page">
        <FeatureHeader title="Family Court" description="Settle family disputes in a fun, private courtroom." onHome={() => goToTab('home')} />
        {familyCourtSetupView === 'hub' ? <>
          <section className="fc-court-lobby-hero"><div className="fc-court-lobby-emblem">⚖️<i>🔨</i></div><div><span className="fc-kicker">Family Circle · Private courtroom</span><h2>Welcome to Family Court</h2><p>Bring it to court, choose when the hearing happens, and let the family decide.</p></div></section>
          {activeCourtCase && <section className={readyCourtCase ? 'fc-court-entry-ready' : 'fc-court-entry-waiting'}>
            <div className="fc-court-entry-icon">{readyCourtCase ? '⚖️' : '⏳'}</div>
            <div><span>{readyCourtCase ? 'EVERYONE HAS ACCEPTED' : 'COURT SUMMONS'}</span><strong>{readyCourtCase ? 'ENTER COURTROOM' : currentMemberAccepted ? 'WAITING FOR THE FAMILY' : 'ACCEPT YOUR SUMMONS'}</strong><p>{readyCourtCase ? readyCourtCase.title + ' is ready. The family is waiting in the courtroom.' : acceptedCount + ' of ' + members.length + ' family members have accepted this case.'}</p></div>
            {readyCourtCase ? <button className="fc-court-entry-button" type="button" onClick={() => enterFamilyCourtroom(readyCourtCase.id)}>⚖️ ENTER COURTROOM →</button> : !currentMemberAccepted ? <button className="fc-court-entry-button" type="button" onClick={() => acceptFamilyCourtCase(currentCourtCase!.id)}>✓ ACCEPT &amp; JOIN</button> : <span className="fc-court-entry-pending">✓ Accepted</span>}
          </section>}
          <section className="fc-court-lobby-grid fc-court-lobby-grid-refined">
            <button className="fc-court-lobby-card primary fc-court-start-card" type="button" onClick={() => setFamilyCourtSetupView('form')}><span>⚖️</span><div><small>Start here</small><strong>Start a New Case</strong><p>Bring a family member before the family court.</p></div><b>→</b></button>
            <button className="fc-court-lobby-card fc-court-review-card" type="button" onClick={openFamilyCourtReviews}><span>📂</span><div><small>Case history</small><strong>Review Previous Cases</strong><p>Review closed cases and available appeals.</p></div><b>→</b></button>
            <button className="fc-court-lobby-card fc-court-upcoming-card" type="button" onClick={openFamilyCourtUpcomingCases}><span>🗓️</span><div><small>Upcoming</small><strong>Upcoming Courts</strong><p>See scheduled hearings and when the family needs to attend.</p></div><b>→</b></button>
          </section>
        </> : familyCourtSetupView === 'upcomingCases' ? <section className="fc-court-review-panel">
          <div className="fc-court-review-heading"><div className="fc-court-review-icon">🗓️</div><div><span className="fc-kicker">Upcoming</span><h2>Upcoming Courts</h2><p>Scheduled hearings are listed here. The same date and time are already part of the Family Calendar.</p></div></div>
          <div className="fc-court-review-list">
            {familyCourtCases.filter((item) => item.status === 'scheduled' && item.scheduledDate && item.scheduledTime).sort((a,b) => ((a.scheduledDate ?? '') + (a.scheduledTime ?? '')).localeCompare((b.scheduledDate ?? '') + (b.scheduledTime ?? ''))).map((item) => {
              const accuser = members.find((member) => member.id === item.accuserId)?.label ?? 'Family member'
              const accused = members.find((member) => member.id === item.accusedId)?.label ?? 'Family member'
              return <button className="fc-court-review-row fc-court-upcoming-row" type="button" key={item.id} onClick={() => openFamilyCourtUpcomingCase(item.id)}><div className="fc-court-review-row-icon">⚖️</div><div><small>{new Date(item.scheduledDate + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</small><strong>{item.title}</strong><span>{item.scheduledTime} · {accuser} vs {accused}</span></div><b>→</b></button>
            })}
            {familyCourtCases.filter((item) => item.status === 'scheduled' && item.scheduledDate && item.scheduledTime).length === 0 && <div className="fc-court-review-empty"><span>🗓️</span><strong>No upcoming courts.</strong><small>Scheduled hearings will appear here automatically.</small></div>}
          </div>
          <button className="fc-ghost-button" type="button" onClick={() => setFamilyCourtSetupView('hub')}>← Back to Family Court</button>
        </section> : familyCourtSetupView === 'upcomingCase' && familyCourtUpcomingCaseId ? (() => {
          const upcomingCase = familyCourtCases.find((item) => item.id === familyCourtUpcomingCaseId)
          if (!upcomingCase) return <section className="fc-court-review-panel"><strong>This scheduled case is no longer available.</strong></section>
          const accuser = members.find((member) => member.id === upcomingCase.accuserId)?.label ?? 'Family member'
          const accused = members.find((member) => member.id === upcomingCase.accusedId)?.label ?? 'Family member'
          return <section className="fc-court-review-panel">
            <div className="fc-court-review-heading"><div className="fc-court-review-icon">⚖️</div><div><span className="fc-kicker">Scheduled hearing</span><h2>{upcomingCase.title}</h2><p>This hearing is already listed in the Family Calendar.</p></div></div>
            <div className="fc-court-review-summary"><div><small>DATE</small><strong>{upcomingCase.scheduledDate ? new Date(upcomingCase.scheduledDate + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Not set'}</strong></div><div><small>TIME</small><strong>{upcomingCase.scheduledTime ?? 'Not set'}</strong></div><div><small>PARTIES</small><strong>{accuser} vs {accused}</strong></div></div>
            <div className="fc-court-review-section"><span className="fc-kicker">Case information</span><p>{upcomingCase.title}</p><div className="fc-court-file-tags"><span>⚖️ Family Court</span><span>🗓️ Added to Family Calendar</span></div></div>
            <div className="fc-court-form-actions"><button className="fc-ghost-button" type="button" onClick={openFamilyCourtUpcomingCases}>← Upcoming Courts</button><button className="fc-primary-button" type="button" onClick={() => setFamilyCourtSetupView('hub')}>Back to Family Court</button></div>
          </section>
        })() : familyCourtSetupView === 'reviewCases' ? <section className="fc-court-review-panel">
          <div className="fc-court-review-heading"><div className="fc-court-review-icon">📂</div><div><span className="fc-kicker">Case history</span><h2>Review Previous Cases</h2><p>Review closed cases and manage any appeal still within the five-day window.</p></div></div>
          <div className="fc-court-review-list">
            {familyCourtCases.filter((item) => item.status === 'closed').length === 0 ? <div className="fc-court-review-empty"><span>⚖️</span><strong>No previous cases yet.</strong><small>Completed Family Court cases will appear here for five days.</small></div> : familyCourtCases.filter((item) => item.status === 'closed').map((item) => {
              const verdictLabel = item.appeal?.finalVerdict ?? item.verdict
              const appealLabel = item.appeal?.status === 'approved' ? 'Appeal approved' : item.appeal?.status === 'denied' ? 'Appeal denied' : item.appeal?.status === 'closed' ? 'Appeal closed' : item.appeal?.status === 'pending' ? 'Appeal pending' : ''
              return <button className="fc-court-review-row" type="button" key={item.id} onClick={() => openFamilyCourtReview(item.id)}>
                <div className="fc-court-review-row-icon">{verdictLabel === 'guilty' ? '⚠️' : '🕊️'}</div>
                <div><small>{new Date(item.createdAt).toLocaleDateString('en-GB')}</small><strong>{item.title}</strong><span>Original verdict: {item.verdict === 'guilty' ? 'GUILTY' : item.verdict === 'not-guilty' ? 'NOT GUILTY' : 'Pending'}</span>{appealLabel && <em>{appealLabel}</em>}</div>
                <b>→</b>
              </button>
            })}
          </div>
          <button className="fc-ghost-button" type="button" onClick={() => setFamilyCourtSetupView('hub')}>← Back to Family Court</button>
        </section> : familyCourtSetupView === 'reviewCase' && familyCourtReviewCaseId ? (() => {
          const reviewCase = familyCourtCases.find((item) => item.id === familyCourtReviewCaseId)
          if (!reviewCase) return <section className="fc-court-review-panel"><strong>Case no longer available.</strong></section>
          const canAppeal = reviewCase.status === 'closed' && reviewCase.verdict === 'guilty' && reviewCase.accusedId === selectedMember.id && !reviewCase.appeal && appealWindow(reviewCase) > 0
          const appealRemaining = appealWindowLabel(reviewCase)
          const originalTrial = reviewCase.originalTrial
          return <section className="fc-court-review-panel">
            <div className="fc-court-review-heading"><div className="fc-court-review-icon">⚖️</div><div><span className="fc-kicker">Case file</span><h2>{reviewCase.title}</h2><p>Original trial and any linked appeal remain preserved separately.</p></div></div>
            <div className="fc-court-review-summary">
              <div><small>ORIGINAL VERDICT</small><strong>{reviewCase.verdict === 'guilty' ? 'GUILTY' : 'NOT GUILTY'}</strong></div>
              <div><small>PUNISHMENT</small><strong>{reviewCase.punishment ?? 'None'}</strong></div>
              <div><small>APPEAL STATUS</small><strong>{reviewCase.appeal ? reviewCase.appeal.status.toUpperCase() : 'NONE'}</strong></div>
            </div>
            <div className="fc-court-review-section"><span className="fc-kicker">Original trial</span><p>{reviewCase.openingStatements ? 'Opening statements recorded.' : 'Original trial record available.'}</p>{reviewCase.evidence && <p>{Object.values(reviewCase.evidence).flat().length} original evidence item(s).</p>}<div className="fc-court-file-tags"><span>Original verdict: {reviewCase.verdict?.toUpperCase()}</span><span>{reviewCase.punishment ? 'Punishment recorded' : 'No punishment'}</span></div></div>
            {originalTrial && <div className="fc-court-review-section"><span className="fc-kicker">Original trial archive</span><p>The original hearing has been preserved while the appeal trial is recorded separately.</p><div className="fc-court-file-tags"><span>Original judge recorded</span><span>Original evidence preserved</span></div></div>}
            {reviewCase.appeal && <div className="fc-court-appeal-pack"><div><span className="fc-kicker">Appeal pack</span><h3>{reviewCase.appeal.reason}</h3><p>{reviewCase.appeal.explanation || 'No additional explanation provided.'}</p></div><div className="fc-court-file-tags"><span>{reviewCase.appeal.newEvidence.length} new evidence item(s)</span><span>{Object.keys(reviewCase.appeal.familyVotes).length} family vote(s)</span></div></div>}
            {reviewCase.appeal?.status === 'pending' && reviewCase.appeal.appellantId !== selectedMember.id && <div className="fc-court-appeal-vote"><span className="fc-kicker">Family vote</span><h3>Allow this appeal?</h3><p>Your vote is private until the family vote is complete.</p><div className="fc-court-form-actions"><button className="fc-ghost-button" type="button" onClick={() => castFamilyCourtAppealVote(reviewCase.id,'deny')}>DENY APPEAL</button><button className="fc-primary-button" type="button" onClick={() => castFamilyCourtAppealVote(reviewCase.id,'allow')}>ALLOW APPEAL</button></div></div>}
            {canAppeal && <div className="fc-court-appeal-action"><span>⏳ {appealRemaining}</span><button className="fc-primary-button" type="button" onClick={() => startFamilyCourtAppeal(reviewCase.id)}>⚖️ APPEAL THIS CASE</button></div>}
            {reviewCase.appeal?.status === 'approved' && <div className="fc-court-appeal-ready"><strong>⚖️ APPEAL APPROVED</strong><p>The original case is preserved. The appeal is now a brand-new trial using the same courtroom flow.</p></div>}
            {reviewCase.appeal?.status === 'denied' && <div className="fc-court-appeal-final"><strong>🔒 APPEAL DENIED — CASE FINAL</strong><p>This case cannot be appealed again.</p></div>}
            {reviewCase.appeal?.status === 'closed' && <div className="fc-court-appeal-final"><strong>🔒 APPEAL CLOSED — NO FURTHER APPEAL</strong><p>The original and appeal trials remain connected in the case history.</p></div>}
            <div className="fc-court-form-actions"><button className="fc-ghost-button" type="button" onClick={openFamilyCourtReviews}>← Review Previous Cases</button></div>
          </section>
        })() : familyCourtSetupView === 'appeal' && familyCourtReviewCaseId ? (() => {
          const appealCase = familyCourtCases.find((item) => item.id === familyCourtReviewCaseId)
          if (!appealCase) return <section className="fc-court-review-panel"><strong>Case no longer available.</strong></section>
          const appealDraft = appealCase.appeal
          return <section className="fc-court-review-panel">
            <div className="fc-court-review-heading"><div className="fc-court-review-icon">⚖️</div><div><span className="fc-kicker">Appeal request</span><h2>Appeal {appealCase.title}</h2><p>Your original case stays untouched. This creates a linked appeal trial.</p></div></div>
            <div className="fc-court-appeal-form">
              <label><span>Why do you want to appeal?</span><select value={familyCourtAppealReason} onChange={(event) => setFamilyCourtAppealReason(event.target.value)}><option>New evidence</option><option>Evidence misunderstood</option><option>Unfair procedure</option><option>Other</option></select></label>
              <label><span>Tell the family why you are appealing</span><textarea value={familyCourtAppealExplanation} onChange={(event) => setFamilyCourtAppealExplanation(event.target.value)} maxLength={600} placeholder="Explain what you want the family to reconsider." /></label>
              <div className="fc-court-appeal-upload"><div><span className="fc-kicker">New evidence</span><strong>Upload up to 4 images</strong><small>Photos, screenshots or pictures only.</small></div><label className="fc-primary-button">+ Add Evidence<input type="file" accept="image/*" multiple hidden onChange={(event) => Array.from(event.target.files ?? []).slice(0,4 - familyCourtAppealEvidence.length).forEach((file) => addFamilyCourtAppealEvidence(file))} /></label>{appealDraft?.newEvidence?.length ? <div className="fc-court-evidence-grid">{appealDraft.newEvidence.map((src,index) => <img key={src.slice(0,40)+index} src={src} alt={'Appeal evidence '+String.fromCharCode(65+index)} />)}</div> : <small>No new evidence added yet.</small>}</div>
              <div className="fc-court-appeal-pack-preview"><span className="fc-kicker">Appeal pack</span><strong>Original case + appeal reason + explanation + new evidence</strong><small>The original case will remain preserved and the family will receive the appeal for a vote.</small></div>
              <div className="fc-court-form-actions"><button className="fc-ghost-button" type="button" onClick={() => setFamilyCourtSetupView('reviewCase')}>Cancel</button><button className="fc-primary-button" type="button" disabled={!familyCourtAppealExplanation.trim()} onClick={() => submitFamilyCourtAppeal(appealCase.id)}>⚖️ SUBMIT APPEAL</button></div>
            </div>
          </section>
        })() : familyCourtSetupView === 'courtroom' && currentCourtCase ? <section className="fc-courtroom-shell">
          {(() => {
            const judgeId = currentCourtCase.judgeId ?? members.find((member) => member.id !== currentCourtCase.accuserId && member.id !== currentCourtCase.accusedId)?.id
            const judge = members.find((member) => member.id === judgeId)
            const accuserMember = members.find((member) => member.id === currentCourtCase.accuserId) ?? selectedMember
            const accusedMember = members.find((member) => member.id === currentCourtCase.accusedId) ?? selectedMember
            const juryMembers = members.filter((member) => member.id !== currentCourtCase.accuserId && member.id !== currentCourtCase.accusedId && member.id !== judgeId)
            return <>
              <div className="fc-courtroom-top">
                <div><span className="fc-kicker">Family Circle · Private courtroom</span><h2>{currentCourtCase.courtStarted ? '⚖️ Court is now in session' : '⚖️ Courtroom ready'}</h2><p>{currentCourtCase.title}</p></div>
                <span className="fc-courtroom-status">{currentCourtCase.courtStarted ? 'IN SESSION' : 'READY'}</span>
              </div>

              {!currentCourtCase.courtStarted && <section className="fc-court-role-banner">
                <div><span>ROLES CONFIRMED</span><strong>Everyone is in position.</strong><p>The judge has been assigned automatically because this family has three members.</p></div>
                <div className="fc-court-role-strip">
                  <span>ACCUSER <b>{accuserMember.label}</b></span>
                  <span>JUDGE <b>{judge?.label ?? 'Selecting…'}</b></span>
                  <span>ACCUSED <b>{accusedMember.label}</b></span>
                </div>
              </section>}

              <div className="fc-courtroom-stage">
                <div className="fc-courtroom-wall"><div className="fc-courtroom-columns"><i/><i/><i/><i/><i/></div><div className="fc-courtroom-banner left"><span>HEAR</span><span>RESPECT</span><span>DECIDE</span><b>⚖️</b></div><div className="fc-courtroom-banner right"><span>DIFFERENT</span><span>VIEWS</span><span>ONE FAMILY</span><b>⚖️</b></div><div className="fc-courtroom-wall-sign"><img src={logoUrl} alt="Family Circle" /><strong>FAMILY COURT</strong><small>Justice starts with the family.</small></div></div>
                <div className="fc-courtroom-floor">
                  <div className="fc-courtroom-floor-line one"/><div className="fc-courtroom-floor-line two"/><div className="fc-courtroom-floor-line three"/>
                  <div className="fc-courtroom-aisle-mark">FAMILY COURT</div>
                </div>

                <div className="fc-courtroom-bench">
                  <div className="fc-judge-chair" aria-label="Judge's chair">
                    <div className="fc-judge-chair-back"/>
                    <div className="fc-judge-avatar-wrap">
                      <AppAvatar member={judge ?? accuserMember}/>
                    </div>
                  </div>
                  <span className="fc-courtroom-bench-scale">⚖️</span>
                  <div className="fc-courtroom-bench-judge"><div><strong>JUDGE'S BENCH</strong><small>{judge?.label ?? 'Judge'}</small></div></div>
                </div>

                <div className="fc-courtroom-people">
                  <article className="fc-courtroom-seat accuser">
                    <div className="fc-court-person-label"><span>ACCUSER</span><small>Bringing the case</small></div>
                    <div className="fc-courtroom-desk"><strong>{accuserMember.label}</strong><span>ACCUSER'S TABLE</span></div>
                    <div className="fc-court-person-avatar"><AppAvatar member={accuserMember}/></div>
                  </article>
                  <article className="fc-courtroom-seat accused">
                    <div className="fc-court-person-label"><span>ACCUSED</span><small>Answering the case</small></div>
                    <div className="fc-courtroom-dock"><div className="fc-dock-rail left"/><div className="fc-dock-rail right"/><div className="fc-dock-front"><strong>{accusedMember.label}</strong><span>ACCUSED'S DOCK</span></div></div>
                    <div className="fc-court-person-avatar"><AppAvatar member={accusedMember}/></div>
                  </article>
                </div>

                <div className="fc-courtroom-jury">
                  <div className="fc-courtroom-jury-heading"><span>THE JURY BENCH</span><strong>{juryMembers.length > 0 ? 'Family members ready to hear the case' : 'No jury — the judge will decide the verdict'}</strong></div>
                  {juryMembers.length > 0 && <div className="fc-courtroom-jury-grid">{juryMembers.map((member) => <div className="fc-courtroom-juror" key={member.id}><AppAvatar member={member}/><span>{member.label}</span><small>✓ Ready</small></div>)}
                  </div>}
                </div>
              </div>

              {!currentCourtCase.courtStarted ? <button className="fc-primary-button fc-court-begin-button" type="button" disabled={!judge} onClick={() => beginFamilyCourt(currentCourtCase.id)}>🔨 BEGIN COURT</button> : (() => {
                const stage = currentCourtCase.courtStage ?? 'opening-writing'
                const stageStartedAt = currentCourtCase.courtStageStartedAt ? new Date(currentCourtCase.courtStageStartedAt).getTime() : familyCourtClock
                const stageLimit = stage === 'opening-writing' || stage === 'evidence-upload' || stage === 'judge-question-writing' ? 60 : stage === 'opening-reading-accuser' || stage === 'opening-reading-accused' || stage === 'evidence-review-accuser' || stage === 'evidence-review-accused' ? 30 : stage === 'answer-writing' ? 20 : stage === 'jury-vote' ? 30 : 0
                const stageRemaining = stageLimit ? Math.max(0, stageLimit - Math.floor((familyCourtClock - stageStartedAt) / 1000)) : 0
                const isParty = selectedMember.id === currentCourtCase.accuserId || selectedMember.id === currentCourtCase.accusedId
                const currentDraft = currentCourtCase.openingStatements?.[selectedMember.id] ?? ''
                const openingSubmitted = currentCourtCase.openingSubmittedBy?.includes(selectedMember.id) ?? false
                const currentEvidence = currentCourtCase.evidence?.[selectedMember.id] ?? []
                const evidenceSubmitted = currentCourtCase.evidenceSubmittedBy?.includes(selectedMember.id) ?? false
                const currentAnswer = currentCourtCase.answers?.[selectedMember.id] ?? ''
                const answerSubmitted = currentCourtCase.answersSubmittedBy?.includes(selectedMember.id) ?? false
                const currentQuestions = currentCourtCase.judgeQuestions ?? {}
                const questionsSubmitted = currentCourtCase.judgeQuestionsSubmitted ?? false
                const currentJuryVote = currentCourtCase.juryVotes?.[selectedMember.id]
                const accuserStatement = currentCourtCase.openingStatements?.[currentCourtCase.accuserId] ?? ''
                const accusedStatement = currentCourtCase.openingStatements?.[currentCourtCase.accusedId] ?? ''
                const readingStatement = stage === 'opening-reading-accuser' ? accuserStatement : accusedStatement
                const readingMember = stage === 'opening-reading-accuser' || stage === 'evidence-review-accuser' ? accuserMember : accusedMember
                const readingEvidence = stage === 'evidence-review-accuser' ? (currentCourtCase.evidence?.[currentCourtCase.accuserId] ?? []) : (currentCourtCase.evidence?.[currentCourtCase.accusedId] ?? [])
                return <section className="fc-court-hearing-stage">
                  {stage === 'opening-writing' && <div className="fc-opening-writing">
                    <div className="fc-opening-kicker"><span>COURT IS NOW IN SESSION</span><strong>OPENING STATEMENTS</strong></div>
                    <div className="fc-opening-timer"><span>{stageRemaining}</span><small>SECONDS</small></div>
                    {isParty ? <div className="fc-opening-private">
                      <span>PRIVATE TO THE COURT</span>
                      <h3>Prepare your opening statement.</h3>
                      <p>Your statement is private while you write. The other side cannot see it.</p>
                      <textarea value={currentDraft} onChange={(event) => saveOpeningStatement(currentCourtCase.id, event.target.value)} maxLength={1500} placeholder="Write your opening statement..." aria-label="Opening statement" disabled={openingSubmitted} />
                      <small>{currentDraft.length}/1500</small>
                      {openingSubmitted ? <strong>✓ Submitted — waiting for the other side.</strong> : <button className="fc-primary-button" type="button" onClick={() => submitOpeningStatement(currentCourtCase.id)}>Submit Opening Statement</button>}
                    </div> : <div className="fc-opening-waiting"><span>⚖️</span><strong>The parties are preparing their opening statements.</strong><p>The jury will see each statement when its reading stage begins.</p></div>}
                  </div>}
                  {stage === 'opening-reading-accuser' && <div className="fc-opening-reading">
                    <span className="fc-opening-kicker">ACCUSER'S OPENING STATEMENT</span>
                    <div className="fc-opening-reading-header"><div><small>30 SECOND READING</small><strong>{readingMember.label}</strong></div><span>{stageRemaining}s</span></div>
                    <article>{readingStatement || <em>No statement was submitted.</em>}</article>
                  </div>}
                  {stage === 'opening-reading-accused' && <div className="fc-opening-reading accused-reading">
                    <span className="fc-opening-kicker">ACCUSED'S OPENING STATEMENT</span>
                    <div className="fc-opening-reading-header"><div><small>30 SECOND READING</small><strong>{readingMember.label}</strong></div><span>{stageRemaining}s</span></div>
                    <article>{readingStatement || <em>No statement was submitted.</em>}</article>
                  </div>}
                  {stage === 'evidence-upload' && <div className="fc-opening-writing">
                    <div className="fc-opening-kicker"><span>OPENING STATEMENTS COMPLETE</span><strong>EVIDENCE</strong></div>
                    <div className="fc-opening-timer"><span>{stageRemaining}</span><small>SECONDS</small></div>
                    {isParty ? <div className="fc-opening-private">
                      <span>PRIVATE TO THE COURT</span>
                      <h3>Upload your evidence.</h3>
                      <p>Both sides upload at the same time. Add up to 4 photos, screenshots or pictures, then submit when finished.</p>
                      <label className="fc-primary-button">＋ Add Evidence<input className="fc-hidden" type="file" accept="image/*" disabled={evidenceSubmitted || currentEvidence.length >= 4} onChange={(event) => { const file = event.target.files?.[0]; if (file) addCourtEvidence(currentCourtCase.id, file); event.currentTarget.value = '' }} /></label>
                      {currentEvidence.length > 0 && <div><strong>{currentEvidence.length}/4 exhibits added</strong>{currentEvidence.map((src, index) => <img key={index} src={src} alt={'Exhibit ' + String.fromCharCode(65 + index)} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 10, margin: 4 }} />)}</div>}
                      {evidenceSubmitted ? <strong>✓ Submitted — waiting for the other side.</strong> : <button className="fc-primary-button" type="button" onClick={() => submitCourtEvidence(currentCourtCase.id)}>Submit Evidence</button>}
                    </div> : <div className="fc-opening-waiting"><span>⚖️</span><strong>The parties are uploading evidence.</strong><p>Both sides have up to 60 seconds. The court will review each side separately.</p></div>}
                  </div>}
                  {stage === 'evidence-review-accuser' && <div className="fc-opening-reading">
                    <span className="fc-opening-kicker">ACCUSER'S EVIDENCE</span>
                    <div className="fc-opening-reading-header"><div><small>30 SECOND REVIEW</small><strong>{readingMember.label}</strong></div><span>{stageRemaining}s</span></div>
                    {readingEvidence.length > 0 ? <div>{readingEvidence.map((src, index) => <figure key={index}><img src={src} alt={'Exhibit ' + String.fromCharCode(65 + index)} style={{ maxWidth: '100%', maxHeight: 280, objectFit: 'contain', borderRadius: 12, margin: 6 }} /><figcaption>Exhibit {String.fromCharCode(65 + index)}</figcaption></figure>)}</div> : <article><em>No evidence submitted.</em></article>}
                  </div>}
                  {stage === 'evidence-review-accused' && <div className="fc-opening-reading accused-reading">
                    <span className="fc-opening-kicker">ACCUSED'S EVIDENCE</span>
                    <div className="fc-opening-reading-header"><div><small>30 SECOND REVIEW</small><strong>{readingMember.label}</strong></div><span>{stageRemaining}s</span></div>
                    {readingEvidence.length > 0 ? <div>{readingEvidence.map((src, index) => <figure key={index}><img src={src} alt={'Exhibit ' + String.fromCharCode(65 + index)} style={{ maxWidth: '100%', maxHeight: 280, objectFit: 'contain', borderRadius: 12, margin: 6 }} /><figcaption>Exhibit {String.fromCharCode(65 + index)}</figcaption></figure>)}</div> : <article><em>No evidence submitted.</em></article>}
                  </div>}
                  {stage === 'evidence-complete' && <div className="fc-opening-complete"><span>⚖️</span><small>EVIDENCE COMPLETE</small><h3>The court has reviewed both sides' evidence.</h3><p>The next stage is the Judge's Question.</p></div>}
                  {stage === 'judge-question-writing' && <div className="fc-opening-writing"><div className="fc-opening-kicker"><span>BACK TO THE JUDGE</span><strong>JUDGE'S QUESTIONS</strong></div><div className="fc-opening-timer"><span>{stageRemaining}</span><small>SECONDS</small></div>{selectedMember.id === currentCourtCase.judgeId ? <div className="fc-opening-private"><span>JUDGE ONLY</span><h3>Write one question for each side.</h3><p>Your questions stay private until you submit both.</p>{[currentCourtCase.accuserId,currentCourtCase.accusedId].map((id) => <label key={id}><strong>{id === currentCourtCase.accuserId ? 'Question for the Accuser' : 'Question for the Accused'}</strong><textarea value={currentQuestions[id] ?? ''} onChange={(event) => saveJudgeQuestion(currentCourtCase.id,id,event.target.value)} maxLength={500} disabled={questionsSubmitted} placeholder="Write your question..." /></label>)}{questionsSubmitted ? <strong>✓ Questions submitted — waiting for answers.</strong> : <button className="fc-primary-button" type="button" onClick={() => submitJudgeQuestions(currentCourtCase.id)}>Submit Both Questions</button>}</div> : <div className="fc-opening-waiting"><span>⚖️</span><strong>The judge is preparing two questions.</strong><p>The questions will appear when the answer stage begins.</p></div>}</div>}
                  {stage === 'answer-writing' && <div className="fc-opening-writing"><div className="fc-opening-kicker"><span>THE COURT ASKS</span><strong>ANSWERS</strong></div><div className="fc-opening-timer"><span>{stageRemaining}</span><small>SECONDS</small></div>{isParty ? <div className="fc-opening-private"><span>PRIVATE ANSWER</span><h3>{selectedMember.id === currentCourtCase.accuserId ? 'Answer the judge.' : 'Answer the judge.'}</h3><p>{currentCourtCase.judgeQuestions?.[selectedMember.id] || 'The judge has not submitted a question.'}</p><textarea value={currentAnswer} onChange={(event) => saveCourtAnswer(currentCourtCase.id,event.target.value)} maxLength={1000} disabled={answerSubmitted} placeholder="Write your answer..." />{answerSubmitted ? <strong>✓ Answer submitted — waiting for the other side.</strong> : <button className="fc-primary-button" type="button" onClick={() => submitCourtAnswer(currentCourtCase.id)}>Submit Answer</button>}</div> : <div className="fc-opening-waiting"><span>⚖️</span><strong>The parties are answering the judge.</strong><p>Both answers will be shown to everyone when the answer stage ends.</p></div>}</div>}
                  {stage === 'jury-vote' && <div className="fc-opening-writing"><div className="fc-opening-kicker"><span>ANSWERS HEARD</span><strong>JURY DECISION</strong></div><div className="fc-opening-timer"><span>{stageRemaining}</span><small>SECONDS</small></div><article className="fc-opening-reading"><strong>Both answers are now before the court.</strong><p><b>{accuserMember.label}:</b> {currentCourtCase.answers?.[currentCourtCase.accuserId] || 'No answer submitted.'}</p><p><b>{accusedMember.label}:</b> {currentCourtCase.answers?.[currentCourtCase.accusedId] || 'No answer submitted.'}</p></article>{juryMembers.length > 0 && <div className="fc-court-form-actions">{juryMembers.some((member) => member.id === selectedMember.id) ? <><button className="fc-primary-button" type="button" onClick={() => castJuryVote(currentCourtCase.id,'guilty')}>{currentJuryVote === 'guilty' ? '✓ GUILTY' : 'GUILTY'}</button><button className="fc-ghost-button" type="button" onClick={() => castJuryVote(currentCourtCase.id,'not-guilty')}>{currentJuryVote === 'not-guilty' ? '✓ NOT GUILTY' : 'NOT GUILTY'}</button></> : <span className="fc-court-entry-pending">Jury is voting.</span>}</div>}</div>}
                  {stage === 'verdict' && <div className="fc-opening-complete fc-verdict-stage"><span className={'fc-verdict-gavel' + (currentCourtCase.verdict === 'guilty' ? ' strike' : '')}>🔨</span><small>VERDICT</small>{currentCourtCase.verdict ? <h3>{currentCourtCase.verdict === 'guilty' ? 'GUILTY' : 'NOT GUILTY'}</h3> : <h3>JUDGE'S DECISION</h3>}<p>{currentCourtCase.verdict ? (juryMembers.length > 0 ? 'The jury has delivered its decision.' : 'The judge has delivered the decision.') : 'Choose the verdict below.'}</p>{juryMembers.length === 0 && !currentCourtCase.verdict && selectedMember.id === currentCourtCase.judgeId && <div className="fc-court-form-actions fc-verdict-buttons"><button className="fc-primary-button" type="button" onClick={() => judgeSetVerdict(currentCourtCase.id,'guilty')}>GUILTY</button><button className="fc-ghost-button" type="button" onClick={() => judgeSetVerdict(currentCourtCase.id,'not-guilty')}>NOT GUILTY</button></div>}</div>}
                  {stage === 'punishment' && <div className="fc-opening-writing">{selectedMember.id === currentCourtCase.judgeId ? <><div className="fc-opening-kicker"><span>GUILTY VERDICT</span><strong>JUDGE'S PUNISHMENT</strong></div><h3>Choose the punishment.</h3><div className="fc-court-punishments">{['Make everyone a cup of tea.','Do the family washing up.','Take the bins out for three days.','Choose the next family film.'].map((punishment) => <button key={punishment} type="button" onClick={() => judgeSetPunishment(currentCourtCase.id,punishment)}>{punishment}</button>)}</div><label className="fc-court-case-input"><span>Or write your own</span><input id="court-punishment" defaultValue="" placeholder="Write a punishment..." /></label><button className="fc-primary-button" type="button" onClick={() => { const input=document.getElementById('court-punishment') as HTMLInputElement | null; if(input) judgeSetPunishment(currentCourtCase.id,input.value) }}>Give Punishment</button></> : <div className="fc-opening-waiting"><span>⚖️</span><strong>The judge is deciding the punishment.</strong><p>The result will be shown to everyone when the judge has finished.</p></div>}</div>}
                  {stage === 'case-closed' && <div className="fc-opening-complete"><span>{currentCourtCase.verdict === 'guilty' ? '⚖️' : '🕊️'}</span><small>CASE CLOSED</small><h3>{currentCourtCase.verdict === 'guilty' ? 'FOUND GUILTY' : 'NOT GUILTY'}</h3>{currentCourtCase.verdict === 'guilty' && <p>{accusedMember.label} has been found guilty. Punishment: {currentCourtCase.punishment}</p>}{currentCourtCase.verdict === 'not-guilty' && <p>The case is closed. No punishment was given.</p>}<button className="fc-primary-button" type="button" onClick={() => closeFamilyCourtCase(currentCourtCase.id)}>Close Case</button></div>}
                </section>
              })()}
            </>
          })()}
        </section> : familyCourtSetupView === 'opened' && openedCase ? <section className="fc-court-case-opened">
          <div className="fc-court-success-icon">⚖️</div>
          <span className="fc-kicker">{openedCase.status === 'scheduled' ? 'COURT SCHEDULED' : 'SUMMONS SENT'}</span>
          <h2>{openedCase.status === 'scheduled' ? 'Family Court has been scheduled.' : 'Family Court is ready to begin.'}</h2>
          <p>{openedCase.status === 'scheduled' ? 'The case has been created and the family has been notified of the planned hearing.' : 'Your case has been opened and the family has been notified.'}</p>
          <div className="fc-court-notice-grid">
            <div><small>Case</small><strong>{openedCase.title}</strong></div>
            <div><small>Accused</small><strong>{members.find((member) => member.id === openedCase.accusedId)?.label}</strong></div>
            <div><small>Hearing</small><strong>{openedCase.status === 'scheduled' ? (openedCase.scheduledDate ? formatLongDate(openedCase.scheduledDate) : '') + ' · ' + (openedCase.scheduledTime ?? '') : 'Start Now'}</strong></div>
          </div>
          <div className="fc-court-notice-cards">
            <article><span>🚨</span><div><small>{openedCase.status === 'scheduled' ? 'SUMMONS & INVITES' : 'SUMMONS SENT'}</small><strong>{accused?.label} has been notified.</strong><p>{openedCase.status === 'scheduled' ? 'The accused has been told when the court is scheduled. The family has also been invited.' : 'They have been notified that a Family Court case has been opened against them.'}</p></div></article>
            <article><span>👨‍👩‍👧‍👦</span><div><small>JURY NOTIFIED</small><strong>The rest of the family has been invited.</strong><p>The family can attend as the jury when the court takes place.</p></div></article>
          </div>
          <button className="fc-primary-button fc-court-wide-button" type="button" onClick={() => resetFamilyCourtCaseSetup('hub')}>Return to Family Court</button>
        </section> : familyCourtSetupView === 'review' ? <section className="fc-court-setup-panel">
          <div className="fc-court-step"><span>STEP 2 OF 2</span><strong>Review &amp; send summons</strong></div>
          <div className="fc-court-review-icon">⚖️</div>
          <h2>Ready to bring this case to court?</h2>
          <p className="fc-muted">Check the details before the summons and family invitations are sent.</p>
          <div className="fc-court-review-list">
            <div><small>Bringing the case</small><strong>{selectedMember.label}</strong></div>
            <div><small>Accused</small><strong>{accused?.label}</strong></div>
            <div><small>Case</small><strong>{familyCourtCaseTitle.trim()}</strong></div>
            <div><small>Hearing</small><strong>{familyCourtTiming === 'now' ? 'Start Now' : scheduledLabel}</strong></div>
          </div>
          <div className="fc-court-review-warning">🚨 {familyCourtTiming === 'now' ? 'Opening the case will summon the accused and notify the rest of the family jury.' : 'Scheduling the case will send the summons and add the planned hearing to the family court schedule.'}</div>
          <div className="fc-court-form-actions"><button className="fc-ghost-button" type="button" onClick={() => setFamilyCourtSetupView('form')}>← Edit Case</button><button className="fc-primary-button" type="button" onClick={openFamilyCourtCase}>⚖️ {familyCourtTiming === 'now' ? 'OPEN FAMILY COURT CASE' : 'SCHEDULE FAMILY COURT'}</button></div>
        </section> : <section className="fc-court-setup-panel">
          <div className="fc-court-step"><span>STEP 1 OF 2</span><strong>Start a new case</strong></div>
          <div className="fc-court-setup-heading"><div className="fc-court-setup-icon">⚖️</div><div><span className="fc-kicker">Private family courtroom</span><h2>Who are you bringing to court?</h2><p>Choose a family member, give the case a short title, then decide when the court should happen.</p></div></div>
          <div className="fc-court-member-grid">{members.filter((member) => member.id !== selectedMember.id).map((member) => <button className={'fc-court-member-choice' + (familyCourtAccusedId === member.id ? ' selected' : '')} type="button" key={member.id} onClick={() => setFamilyCourtAccusedId(member.id)}><AppAvatar member={member}/><span><strong>{member.label}</strong><small>{familyCourtAccusedId === member.id ? 'Selected as accused' : 'Select this family member'}</small></span><b>{familyCourtAccusedId === member.id ? '✓' : '○'}</b></button>)}</div>
          <label className="fc-court-case-input"><span>What is this case about?</span><input value={familyCourtCaseTitle} maxLength={80} onChange={(event) => setFamilyCourtCaseTitle(event.target.value)} placeholder="e.g. Who ate the last slice?" /><small>{familyCourtCaseTitle.length}/80</small></label>
          <div className="fc-court-timing"><span className="fc-court-section-label">When should the court happen?</span><div className="fc-court-timing-options"><button className={familyCourtTiming === 'now' ? 'selected' : ''} type="button" onClick={() => setFamilyCourtTiming('now')}><strong>🟢 Start Now</strong><small>Begin the court as soon as everyone is ready.</small></button><button className={familyCourtTiming === 'scheduled' ? 'selected' : ''} type="button" onClick={() => setFamilyCourtTiming('scheduled')}><strong>📅 Schedule Court</strong><small>Choose a date and time for the hearing.</small></button></div>{familyCourtTiming === 'scheduled' && <div className="fc-court-date-time"><label><span>Date</span><input type="date" min={todayKey()} value={familyCourtDate} onChange={(event) => setFamilyCourtDate(event.target.value)} /></label><label><span>Time</span><input type="time" value={familyCourtTime} onChange={(event) => setFamilyCourtTime(event.target.value)} /></label></div>}</div>
          <div className="fc-court-form-actions"><button className="fc-ghost-button" type="button" onClick={() => resetFamilyCourtCaseSetup('hub')}>Cancel</button><button className="fc-primary-button" type="button" disabled={!familyCourtAccusedId || !familyCourtCaseTitle.trim() || (familyCourtTiming === 'scheduled' && (!familyCourtDate || !familyCourtTime))} onClick={() => setFamilyCourtSetupView('review')}>Review Case →</button></div>
        </section>}
        {familyCourtSetupView !== 'hub' && familyCourtSetupView !== 'opened' && <div className="fc-court-lobby-back"><button type="button" onClick={() => resetFamilyCourtCaseSetup('hub')}>← Back to Family Court</button></div>}
        {renderBottomNav()}
      </div>
    }
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

  if (screen === 'members') return <main className="fc-app-shell fc-members-screen"><header className="fc-brand-header"><div className="fc-brand-lockup"><img src={logoUrl} alt="Family Circle" /><strong>Family Circle</strong></div><span>● Private family space</span></header><section className="fc-members-intro"><p className="fc-kicker">Welcome</p><h1>Who's using Family Circle?</h1><p className="fc-muted">Choose your family profile to continue.</p></section><section className="fc-member-grid">{members.map((member) => <button className="fc-member-card" key={member.id} type="button" onClick={() => chooseMember(member.id)}><AppAvatar member={member} className="fc-member-avatar" /><strong>{member.label}</strong><span><i className={`fc-online-dot${memberIsOnline(member.id) ? ' online' : ''}`} /> {memberIsOnline(member.id) ? 'Online' : 'Offline'} · {member.status}</span><small>Enter PIN →</small></button>)}</section><p className="fc-private-note">▣ Your family information stays private.</p><button className="fc-switch-family-link" type="button" onClick={switchFamily}>Switch family</button>{pinOpen && <div className="fc-modal-backdrop" onMouseDown={() => setPinOpen(false)}><section className="fc-pin-modal" onMouseDown={(event) => event.stopPropagation()}><button className="fc-modal-close" type="button" onClick={() => setPinOpen(false)}>×</button><div className="fc-pin-profile"><AppAvatar member={selectedMember} /><div><p className="fc-kicker">Family profile</p><strong>{selectedMember.label}</strong></div></div><h2>Enter your PIN</h2><p className="fc-muted">Enter your 4-digit PIN to unlock your family space.</p><div className="fc-pin-dots">{[0, 1, 2, 3].map((index) => <span className={index < pin.length ? 'filled' : ''} key={index} />)}</div>{pinError && <p className="fc-error">{pinError}</p>}<div className="fc-keypad">{['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => <button type="button" key={digit} onClick={() => setPin((current) => current.length < 4 ? current + digit : current)}>{digit}</button>)}<button type="button" onClick={() => { setPin(''); setPinOpen(false) }}>Cancel</button><button type="button" onClick={() => setPin((current) => current.length < 4 ? current + '0' : current)}>0</button><button type="button" onClick={() => setPin((current) => current.slice(0, -1))}>⌫</button></div><button className="fc-primary-button" type="button" onClick={submitPin}>Continue</button></section></div>}</main>

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

function CalendarPanel({ events, personalEvents = [], onAdd, onAddPersonal, onBack, onNav, mode = 'family' }: { events: FamilyEvent[]; personalEvents?: PersonalEvent[]; onAdd: (title: string, date: string, time: string, location: string) => void; onAddPersonal?: (title: string, date: string, time: string, location: string) => void; onBack: () => void; onNav: () => JSX.Element; mode?: 'family' | 'personal' }) {
  const today=todayKey()
  const [selectedDate,setSelectedDate]=useState(today)
  const [cursor,setCursor]=useState(()=>{const now=new Date();return new Date(now.getFullYear(),now.getMonth(),1)})
  const [title,setTitle]=useState('')
  const [date,setDate]=useState(today)
  const [time,setTime]=useState('19:00')
  const [location,setLocation]=useState('At Home')
  const cells=getCalendarCells(cursor)
  const monthLabel=new Intl.DateTimeFormat('en-GB',{month:'long',year:'numeric'}).format(cursor)
  const familySelected=events.filter(e=>e.date===selectedDate).sort((a,b)=>a.time.localeCompare(b.time))
  const personalSelected=personalEvents.filter(e=>e.date===selectedDate).sort((a,b)=>a.time.localeCompare(b.time))
  const selectedCount=familySelected.length+personalSelected.length
  function changeMonth(amount:number){const next=new Date(cursor.getFullYear(),cursor.getMonth()+amount,1);setCursor(next);const now=new Date();const nextSelected=next.getFullYear()===now.getFullYear()&&next.getMonth()===now.getMonth()?todayKey():`${next.getFullYear()}-${String(next.getMonth()+1).padStart(2,'0')}-01`;setSelectedDate(nextSelected);setDate(nextSelected)}
  function jumpToToday(){const now=new Date();setCursor(new Date(now.getFullYear(),now.getMonth(),1));setSelectedDate(today);setDate(today)}
  function addEvent(){if(!title.trim()||!date||!time)return;if(mode==='personal'&&onAddPersonal)onAddPersonal(title.trim(),date,time,location.trim());else onAdd(title.trim(),date,time,location.trim());setSelectedDate(date);const added=new Date(`${date}T00:00:00`);setCursor(new Date(added.getFullYear(),added.getMonth(),1));setTitle('')}
  const allForCell=(key:string)=>[...events.filter(e=>e.date===key).map(e=>({...e,kind:'family' as const})),...personalEvents.filter(e=>e.date===key).map(e=>({...e,kind:'personal' as const}))].sort((a,b)=>a.time.localeCompare(b.time))
  return <div className="fc-page">
    <FeatureHeader title={mode==='personal'?'My Calendar':'Family Calendar'} description={mode==='personal'?'Your personal plans alongside the family events that matter to you.':'Keep plans, appointments and family events visible in one place.'} onHome={onBack}/>
    <div className="fc-calendar-layout"><div className="fc-panel fc-calendar-main">
      <div className="fc-calendar-toolbar"><button className="fc-calendar-nav" type="button" onClick={()=>changeMonth(-1)}>‹</button><div><small>{mode==='personal'?'Personal space':'Family plans'}</small><h2>{monthLabel}</h2></div><div className="fc-calendar-toolbar-actions"><button className="fc-today-button" type="button" onClick={jumpToToday}>Today</button><button className="fc-calendar-nav" type="button" onClick={()=>changeMonth(1)}>›</button></div></div>
      <div className="fc-calendar-weekdays">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day=><span key={day}>{day}</span>)}</div>
      <div className="fc-calendar-grid">{cells.map((dayNumber,index)=>{if(dayNumber===null)return <div className="fc-calendar-cell empty" key={`empty-${index}`}/>;const cellDate=new Date(cursor.getFullYear(),cursor.getMonth(),dayNumber);const key=`${cellDate.getFullYear()}-${String(cellDate.getMonth()+1).padStart(2,'0')}-${String(cellDate.getDate()).padStart(2,'0')}`;const dayEvents=allForCell(key);return <button className={`fc-calendar-cell${key===today?' today':''}${key===selectedDate?' selected':''}${key<today?' past':''}`} type="button" key={key} onClick={()=>{setSelectedDate(key);setDate(key)}} aria-label={`${formatLongDate(key)}${dayEvents.length?`, ${dayEvents.length} event${dayEvents.length===1?'':'s'}`:''}`}><span className="fc-calendar-day-number">{dayNumber}</span>{dayEvents.length>0&&<span className="fc-calendar-markers">{dayEvents.slice(0,3).map(event=><i className={event.kind} key={event.id}/>)}</span>}</button>})}</div>
      <div className="fc-calendar-key"><span><i className="today-key"/> Today</span><span><i className="event-key"/> Family event</span>{mode==='personal'&&<span><i className="personal-key"/> Personal</span>}<span><i className="selected-key"/> Selected</span></div>
    </div><div className="fc-calendar-side">
      <div className="fc-panel"><div className="fc-panel-head"><div><small>Selected day</small><h2>{formatLongDate(selectedDate)}</h2></div><span className="fc-pill">{selectedCount} item{selectedCount===1?'':'s'}</span></div>{selectedCount===0?<div className="fc-calendar-empty"><span>♡</span><strong>{mode==='personal'?'Nothing planned for this day.':'No family events on this date.'}</strong><small>{mode==='personal'?'Add something personal below.':'Choose another date or add an event below.'}</small></div>:<div className="fc-calendar-events">{familySelected.map(event=><div className="fc-calendar-event family-event" key={event.id}><span>📅</span><div><strong>{event.title}</strong><small>{event.time}{event.location?` · ${event.location}`:''}</small></div><b>Family</b></div>)}{personalSelected.map(event=><div className="fc-calendar-event personal-event" key={event.id}><span>✦</span><div><strong>{event.title}</strong><small>{event.time}{event.location?` · ${event.location}`:''}</small></div><b>Personal</b></div>)}</div>}</div>
      <div className="fc-panel"><div className="fc-panel-head"><div><small>{mode==='personal'?'Your private plans':'Add to family calendar'}</small><h2>{mode==='personal'?'Add personal event':'New family event'}</h2></div></div><div className="fc-form-grid"><label><span>Event name *</span><input value={title} onChange={event=>setTitle(event.target.value)} placeholder={mode==='personal'?'Dentist appointment':'Family dinner'}/></label><label><span>Date *</span><input type="date" min={today} value={date} onChange={event=>{setDate(event.target.value);setSelectedDate(event.target.value)}}/></label><label><span>Time *</span><input type="time" value={time} onChange={event=>setTime(event.target.value)}/></label><label><span>Location</span><input value={location} onChange={event=>setLocation(event.target.value)} placeholder={mode==='personal'?'Optional':'At Home'}/></label><button className="fc-primary-button" type="button" onClick={addEvent}>{mode==='personal'?'Add Personal Event':'Add Family Event'}</button></div></div>
    </div></div>{onNav()}
  </div>
}
