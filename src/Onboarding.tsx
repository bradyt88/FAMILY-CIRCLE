import { useEffect, useMemo, useRef, useState } from 'react'
import logoUrl from '../design/brand/family-circle-logo.png'
import './onboarding.css'

type EntryView = 'splash' | 'welcome' | 'signin' | 'signup' | 'family-choice' | 'create-family' | 'join-family' | 'families'
type FamilyConnection = { id: string; name: string }

const familyStorageKey = 'family-circle-families'

function loadFamilies(): FamilyConnection[] {
  try {
    const saved = localStorage.getItem(familyStorageKey)
    if (saved) return JSON.parse(saved) as FamilyConnection[]
  } catch {
    // Fall back to the foundation demo family.
  }
  return [{ id: 'FC-7K4P9', name: 'My Family' }]
}

function saveFamilies(families: FamilyConnection[]) {
  localStorage.setItem(familyStorageKey, JSON.stringify(families))
}

function makeFamilyId() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const suffix = Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('')
  return 'FC-' + suffix
}

export default function Onboarding({ onComplete, initialView = 'splash' }: { onComplete: (family: FamilyConnection) => void; initialView?: EntryView }) {
  const [view, setView] = useState<EntryView>(initialView)
  const [families, setFamilies] = useState<FamilyConnection[]>(loadFamilies)
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(families[0]?.id ?? null)
  const [familyName, setFamilyName] = useState('')
  const [familyId, setFamilyId] = useState('')
  const [foundFamily, setFoundFamily] = useState<FamilyConnection | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [splashDone, setSplashDone] = useState(initialView !== 'splash')
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [audioBlocked, setAudioBlocked] = useState(false)
  const splashAudioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (initialView !== 'splash') return

    const audio = splashAudioRef.current
    if (!audio) return

    audio.volume = 0.88

    const timer = window.setTimeout(() => {
      setSplashDone(true)
      setView('welcome')
    }, 6800)

    const handleEnded = () => setAudioPlaying(false)
    audio.addEventListener('ended', handleEnded)

    return () => {
      window.clearTimeout(timer)
      audio.removeEventListener('ended', handleEnded)
      audio.pause()
      audio.currentTime = 0
      splashAudioRef.current = null
    }
  }, [initialView])

  function playSplashAudio() {
    const audio = splashAudioRef.current
    if (!audio) return

    audio.volume = 0.88
    void audio.play().then(() => {
      setAudioPlaying(true)
      setAudioBlocked(false)
    }).catch(() => {
      setAudioPlaying(false)
      setAudioBlocked(true)
    })
  }

  const selectedFamily = useMemo(() => families.find((family) => family.id === selectedFamilyId) ?? families[0] ?? null, [families, selectedFamilyId])

  function go(next: EntryView) {
    setError('')
    setView(next)
  }

  function submitSignIn() {
    if (!email.trim() || password.length < 4) {
      setError('Enter your email and password to continue.')
      return
    }
    go('families')
  }

  function submitSignUp() {
    if (!email.trim() || password.length < 4 || confirmPassword.length < 4) {
      setError('Enter your email and both password fields.')
      return
    }
    if (password !== confirmPassword) {
      setError('Your passwords do not match.')
      return
    }
    go('family-choice')
  }

  function createFamily() {
    if (!familyName.trim()) {
      setError('Enter a family name.')
      return
    }
    const family = { id: makeFamilyId(), name: familyName.trim() }
    const next = [...families, family]
    setFamilies(next)
    saveFamilies(next)
    setSelectedFamilyId(family.id)
    setFamilyName('')
    setError('')
    go('families')
  }

  function findFamily() {
    const entered = familyId.trim().toUpperCase()
    if (!entered) {
      setError('Enter your Family ID.')
      return
    }
    const existing = families.find((family) => family.id === entered)
    setFoundFamily(existing ?? { id: entered, name: 'Family Circle' })
    setError('')
  }

  function joinFamily() {
    if (!foundFamily) return
    const next = families.some((family) => family.id === foundFamily.id) ? families : [...families, foundFamily]
    setFamilies(next)
    saveFamilies(next)
    setSelectedFamilyId(foundFamily.id)
    setFoundFamily(null)
    setFamilyId('')
    setError('')
    go('families')
  }

  function chooseFamily(family: FamilyConnection) {
    setSelectedFamilyId(family.id)
    onComplete(family)
  }

  if (view === 'splash' && !splashDone) {
    return <main className="fc-onboarding-shell fc-splash-screen">
      <div className="fc-splash-logo"><img src={logoUrl} alt="Family Circle" /></div>
      <button
        className={`fc-splash-play${audioPlaying ? ' playing' : ''}`}
        type="button"
        onClick={playSplashAudio}
        aria-label={audioPlaying ? 'Splash audio playing' : 'Play splash audio'}
        aria-pressed={audioPlaying}
      >
        <span aria-hidden="true">{audioPlaying ? '▶' : '▶'}</span>
      </button>
      <audio
        ref={splashAudioRef}
        src={`${import.meta.env.BASE_URL}audio/welcome-to-family-circle.mp3`}
        preload="auto"
        playsInline
      />
    </main>
  }

  if (view === 'welcome') {
    return <main className="fc-onboarding-shell"><section className="fc-onboarding-card fc-welcome-card"><img className="fc-onboarding-logo" src={logoUrl} alt="Family Circle" /><p className="fc-kicker">Welcome to</p><h1>Family Circle</h1><p className="fc-onboarding-copy">One private space for the people who matter.</p><div className="fc-entry-actions"><button className="fc-primary-button" type="button" onClick={() => go('signin')}>Sign In</button><button className="fc-secondary-button" type="button" onClick={() => go('signup')}>Create Account</button></div></section><p className="fc-onboarding-footnote">Private family space · built with privacy in mind</p></main>
  }

  if (view === 'signin' || view === 'signup') {
    const signUp = view === 'signup'
    return <main className="fc-onboarding-shell"><section className="fc-onboarding-card fc-auth-card"><button className="fc-back-link" type="button" onClick={() => go('welcome')}>← Back</button><img className="fc-auth-logo" src={logoUrl} alt="Family Circle" /><p className="fc-kicker">{signUp ? 'New account' : 'Welcome back'}</p><h1>{signUp ? 'Create your account' : 'Sign in to Family Circle'}</h1><p className="fc-onboarding-copy">{signUp ? 'Create your personal account first. Your families are connected after that.' : 'Sign in once, then choose which family space you want to enter.'}</p><div className="fc-onboarding-form"><label><span>Email address</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" /></label><label><span>Password</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" autoComplete={signUp ? 'new-password' : 'current-password'} /></label>{signUp && <label><span>Confirm password</span><input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repeat your password" autoComplete="new-password" /></label>}{error && <p className="fc-entry-error">{error}</p>}<button className="fc-primary-button" type="button" onClick={signUp ? submitSignUp : submitSignIn}>{signUp ? 'Create Account' : 'Continue'}</button></div>{!signUp && <button className="fc-text-button" type="button" onClick={() => setError('Password reset will be connected to your account in the backend stage.')}>Forgot password?</button>}</section></main>
  }

  if (view === 'family-choice') {
    return <main className="fc-onboarding-shell"><section className="fc-onboarding-card"><button className="fc-back-link" type="button" onClick={() => go('signup')}>← Back</button><p className="fc-kicker">Your families</p><h1>What would you like to do?</h1><p className="fc-onboarding-copy">You can create a new family or join a family you've been invited to.</p><div className="fc-family-choice-grid"><button className="fc-choice-panel" type="button" onClick={() => go('create-family')}><span>＋</span><strong>Create a Family</strong><small>Start a new family space and receive a Family ID.</small></button><button className="fc-choice-panel" type="button" onClick={() => go('join-family')}><span>↗</span><strong>Join a Family</strong><small>Enter a Family ID you've been given.</small></button></div></section></main>
  }

  if (view === 'create-family') {
    return <main className="fc-onboarding-shell"><section className="fc-onboarding-card"><button className="fc-back-link" type="button" onClick={() => go('family-choice')}>← Back</button><p className="fc-kicker">Create family</p><h1>Give your family a name</h1><p className="fc-onboarding-copy">Once created, Family Circle gives you a unique Family ID to share with people you trust.</p><div className="fc-onboarding-form"><label><span>Family name</span><input value={familyName} onChange={(event) => setFamilyName(event.target.value)} placeholder="The Smith Family" /></label>{error && <p className="fc-entry-error">{error}</p>}<button className="fc-primary-button" type="button" onClick={createFamily}>Create Family</button></div><div className="fc-security-note"><strong>🔐 Family ID</strong><span>Your Family ID connects an account to the correct family. Each member still uses their own private Member PIN.</span></div></section></main>
  }

  if (view === 'join-family') {
    return <main className="fc-onboarding-shell"><section className="fc-onboarding-card"><button className="fc-back-link" type="button" onClick={() => go('family-choice')}>← Back</button><p className="fc-kicker">Join family</p><h1>Enter your Family ID</h1><p className="fc-onboarding-copy">You only need to enter this once to connect your account to that family.</p><div className="fc-onboarding-form"><label><span>Family ID</span><input value={familyId} onChange={(event) => setFamilyId(event.target.value.toUpperCase())} placeholder="FC-7K4P9" autoCapitalize="characters" /></label>{error && <p className="fc-entry-error">{error}</p>}<button className="fc-primary-button" type="button" onClick={findFamily}>Find Family</button></div>{foundFamily && <div className="fc-found-family"><div><span>Family found</span><strong>{foundFamily.name}</strong><small>{foundFamily.id}</small></div><button className="fc-primary-button" type="button" onClick={joinFamily}>Join Family</button></div>}</section></main>
  }

  return <main className="fc-onboarding-shell"><section className="fc-onboarding-card fc-family-list-card"><div className="fc-family-list-head"><div><p className="fc-kicker">Connected families</p><h1>Choose a Family</h1><p className="fc-onboarding-copy">Select the family space you want to enter. Your account can belong to more than one.</p></div><img className="fc-family-list-logo" src={logoUrl} alt="Family Circle" /></div>{families.map((family) => <button className={selectedFamily?.id === family.id ? 'fc-family-list-item selected' : 'fc-family-list-item'} type="button" key={family.id} onClick={() => chooseFamily(family)}><span className="fc-family-list-icon">👨‍👩‍👧‍👦</span><span><strong>{family.name}</strong><small>Family ID · {family.id}</small></span><b>→</b></button>)}<div className="fc-family-list-actions"><button className="fc-secondary-button" type="button" onClick={() => go('join-family')}>+ Join Another Family</button><button className="fc-secondary-button" type="button" onClick={() => go('create-family')}>+ Create a Family</button></div><p className="fc-onboarding-footnote">Family ID connects the family. Member PIN protects the member profile.</p></section></main>
}
