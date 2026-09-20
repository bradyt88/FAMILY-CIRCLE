import { useEffect, useMemo, useState } from 'react'
import logoUrl from '../design/brand/family-circle-logo.png'
import './onboarding.css'

type EntryView = 'splash' | 'welcome' | 'signin' | 'signup' | 'account-type' | 'plan' | 'payment' | 'child-access' | 'family-choice' | 'create-family' | 'join-family' | 'families'
type Plan = 'free' | 'plus' | 'premium'
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
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [marketingOptIn, setMarketingOptIn] = useState(false)
  const [accountType, setAccountType] = useState<'adult' | 'child' | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [error, setError] = useState('')
  const [splashDone, setSplashDone] = useState(initialView !== 'splash')

  useEffect(() => {
    if (initialView !== 'splash') return

    const timer = window.setTimeout(() => {
      setSplashDone(true)
      setView('welcome')
    }, 6800)

    return () => {
      window.clearTimeout(timer)
    }
  }, [initialView])

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
    if (!firstName.trim() || !lastName.trim() || !email.trim() || password.length < 4 || confirmPassword.length < 4) {
      setError('Enter your name, email and both password fields.')
      return
    }
    if (password !== confirmPassword) {
      setError('Your passwords do not match.')
      return
    }
    if (!termsAccepted) {
      setError('Accept the Terms and Privacy Policy to create your account.')
      return
    }
    go('account-type')
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
    </main>
  }

  if (view === 'welcome') {
    return <main className="fc-onboarding-shell"><section className="fc-onboarding-card fc-welcome-card"><img className="fc-onboarding-logo" src={logoUrl} alt="Family Circle" /><p className="fc-kicker">Welcome to</p><h1>Family Circle</h1><p className="fc-onboarding-copy">A private place for your family.</p><div className="fc-entry-actions fc-welcome-actions"><button className="fc-primary-button" type="button" onClick={() => go('signup')}>Create Account</button><button className="fc-secondary-button" type="button" onClick={() => go('signin')}>Log In</button><button className="fc-text-button fc-explore-button" type="button" onClick={() => go('families')}>Explore Family Circle <span>↗</span></button></div><p className="fc-welcome-pricing">Free to join · Plus £2.49/month · Premium £4.99/month</p></section><p className="fc-onboarding-footnote">Private family space · built with privacy in mind</p></main>
  }

  if (view === 'signin' || view === 'signup') {
    const signUp = view === 'signup'
    return <main className="fc-onboarding-shell"><section className="fc-onboarding-card fc-auth-card"><button className="fc-back-link" type="button" onClick={() => go('welcome')}>← Back</button><img className="fc-auth-logo" src={logoUrl} alt="Family Circle" /><p className="fc-kicker">{signUp ? 'New account' : 'Welcome back'}</p><h1>{signUp ? 'Create your Family Circle account' : 'Sign in to Family Circle'}</h1><p className="fc-onboarding-copy">{signUp ? 'Create your personal account first. You’ll choose your family and plan next.' : 'Sign in once, then choose which family space you want to enter.'}</p><div className="fc-onboarding-form">{signUp && <div className="fc-name-grid"><label><span>First name</span><input value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder="First name" autoComplete="given-name" /></label><label><span>Last name</span><input value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder="Last name" autoComplete="family-name" /></label></div>}<label><span>Email address</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" /></label><label><span>Password</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" autoComplete={signUp ? 'new-password' : 'current-password'} /></label>{signUp && <label><span>Confirm password</span><input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repeat your password" autoComplete="new-password" /></label>}{signUp && <div className="fc-consent-stack"><label className="fc-check-row"><input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} /><span>I agree to the Terms and Privacy Policy.</span></label><label className="fc-check-row"><input type="checkbox" checked={marketingOptIn} onChange={(event) => setMarketingOptIn(event.target.checked)} /><span>Send me Family Circle news, feature updates and offers by email. <small>Optional</small></span></label></div>}{error && <p className="fc-entry-error">{error}</p>}<button className="fc-primary-button" type="button" onClick={signUp ? submitSignUp : submitSignIn}>{signUp ? 'Create Account' : 'Continue'}</button></div>{!signUp && <button className="fc-text-button" type="button" onClick={() => setError('Password reset will be connected to your account in the backend stage.')}>Forgot password?</button>}</section></main>
  }

  if (view === 'account-type') {
    return <main className="fc-onboarding-shell"><section className="fc-onboarding-card fc-account-type-card"><button className="fc-back-link" type="button" onClick={() => go('signup')}>← Back</button><p className="fc-kicker">Account setup · Step 2</p><h1>Who are you setting this account up for?</h1><p className="fc-onboarding-copy">Choose whether this account is for you or for your child. Family and plan settings come next.</p><div className="fc-account-type-grid"><button className={accountType === 'adult' ? 'fc-account-type-option selected' : 'fc-account-type-option'} type="button" onClick={() => setAccountType('adult')} aria-pressed={accountType === 'adult'}><span className="fc-account-type-icon">👤</span><span><strong>Myself</strong><small>Set up your own Family Circle account.</small></span><b>{accountType === 'adult' ? '✓' : '→'}</b></button><button className={accountType === 'child' ? 'fc-account-type-option selected' : 'fc-account-type-option'} type="button" onClick={() => setAccountType('child')} aria-pressed={accountType === 'child'}><span className="fc-account-type-icon">🧒</span><span><strong>My Child</strong><small>Set up an account for your child with family safety controls.</small></span><b>{accountType === 'child' ? '✓' : '→'}</b></button></div>{error && <p className="fc-entry-error">{error}</p>}<button className="fc-primary-button fc-account-type-continue" type="button" disabled={!accountType} onClick={() => go('plan')}>Continue</button><p className="fc-account-type-note">Free, Plus and Premium are available for both. Child accounts have additional family safety controls.</p></section></main>
  }

  if (view === 'plan') {
    const plans: Array<{ id: Plan; name: string; price: string; features: string[] }> = [
      { id: 'free', name: 'Free', price: '£0', features: ['Join 1 Family Circle', 'Core Family Circle experience', 'Core family safety and privacy'] },
      { id: 'plus', name: 'Plus', price: '£2.49/month', features: ['Everything in Free', 'Join up to 3 Family Circles', 'Selected games and family multiplayer'] },
      { id: 'premium', name: 'Premium', price: '£4.99/month', features: ['Everything in Plus', 'Join more Family Circles', 'All games, future games and expanded features'] },
    ]

    return <main className="fc-onboarding-shell"><section className="fc-onboarding-card fc-plan-card"><button className="fc-back-link" type="button" onClick={() => go('account-type')}>← Back</button><p className="fc-kicker">Account setup · Step 3</p><h1>Choose your Family Circle plan</h1><p className="fc-onboarding-copy">{accountType === 'child' ? 'Choose the plan for your child’s account. Child accounts include family safety controls.' : 'Choose the plan for this account. You can change your plan later.'}</p><div className="fc-plan-grid">{plans.map((plan) => <button key={plan.id} className={selectedPlan === plan.id ? 'fc-plan-option selected' : 'fc-plan-option'} type="button" onClick={() => setSelectedPlan(plan.id)} aria-pressed={selectedPlan === plan.id}><div className="fc-plan-option-head"><span><strong>{plan.name}</strong><small>{plan.price}</small></span><b>{selectedPlan === plan.id ? '✓' : '→'}</b></div><ul>{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul></button>)}</div>{error && <p className="fc-entry-error">{error}</p>}<button className="fc-primary-button fc-plan-continue" type="button" disabled={!selectedPlan} onClick={() => selectedPlan === 'free' ? (accountType === 'child' ? go('child-access') : go('family-choice')) : go('payment')}>Continue</button><p className="fc-plan-note">{selectedPlan === 'free' ? 'Free has no payment step.' : selectedPlan ? 'You’ll review payment details next.' : 'Select a plan to continue.'}</p></section></main>
  }

  if (view === 'payment') {
    const planName = selectedPlan === 'premium' ? 'Premium' : 'Plus'
    const planPrice = selectedPlan === 'premium' ? '£4.99/month' : '£2.49/month'
    const [testCardFilled, setTestCardFilled] = useState(false)
    return <main className="fc-onboarding-shell"><section className="fc-onboarding-card fc-payment-card"><button className="fc-back-link" type="button" onClick={() => go('plan')}>← Back</button><p className="fc-kicker">Account setup · Payment</p><h1>Complete your subscription</h1><p className="fc-onboarding-copy">You’ve selected {planName} at {planPrice}. This is a demo checkout. No real payment is taken or card information is stored.</p><div className="fc-payment-summary"><div><span>Selected plan</span><strong>{planName}</strong></div><div><span>Price</span><strong>{planPrice}</strong></div></div><div className="fc-payment-demo-head"><div><small>Demo checkout</small><strong>Test payment details</strong></div><button className="fc-secondary-button fc-test-card-button" type="button" onClick={() => setTestCardFilled(true)}>Use test card</button></div><div className="fc-payment-fields"><label><span>Cardholder name</span><input value={testCardFilled ? 'Family Circle Test' : ''} readOnly placeholder="Cardholder name" /></label><label><span>Card number</span><input value={testCardFilled ? '4242 4242 4242 4242' : ''} readOnly placeholder="1234 5678 9012 3456" inputMode="numeric" /></label><div className="fc-payment-field-row"><label><span>Expiry</span><input value={testCardFilled ? '12/30' : ''} readOnly placeholder="MM/YY" inputMode="numeric" /></label><label><span>CVC</span><input value={testCardFilled ? '123' : ''} readOnly placeholder="123" inputMode="numeric" /></label></div></div><p className="fc-payment-demo-note">🔒 Test mode only · These details are fictional and are not sent anywhere.</p><button className="fc-primary-button fc-payment-continue" type="button" disabled={!testCardFilled} onClick={() => go(accountType === 'child' ? 'child-access' : 'family-choice')}>Confirm subscription — {planPrice}</button></section></main>
  }

  if (view === 'child-access') {
    const childControls = [
      { name: 'Family Chat', description: 'Talk with approved family members.', locked: false, defaultOn: true },
      { name: 'Family Tasks & Calendar', description: 'See family tasks, plans and events.', locked: false, defaultOn: true },
      { name: 'Family Photos & Videos', description: 'View and share family memories.', locked: false, defaultOn: true },
      { name: 'Games', description: 'Play Family Circle games available on this plan.', locked: false, defaultOn: true },
      { name: 'Family Music', description: 'Listen to Family Circle music.', locked: false, defaultOn: true },
      { name: 'YouTube', description: 'External video content.', locked: false, defaultOn: false },
      { name: 'Global Multiplayer', description: 'Play with people outside your Family Circle.', locked: false, defaultOn: false },
      { name: 'Music Community', description: 'Community music and interaction with other users.', locked: true, defaultOn: false },
    ]

    return <main className="fc-onboarding-shell"><section className="fc-onboarding-card fc-child-access-card"><button className="fc-back-link" type="button" onClick={() => selectedPlan === 'free' ? go('plan') : go('payment')}>← Back</button><p className="fc-kicker">Child account · Step 4</p><h1>Set your child's access</h1><p className="fc-onboarding-copy">Choose the features your child can use. You can change these permissions later from Family Moderator settings.</p><div className="fc-managed-note"><span>🔒</span><span><strong>Managed by the Family Moderator</strong><small>Child safety restrictions stay in place even when a feature is included in the selected plan.</small></span></div><div className="fc-child-access-list">{childControls.map((control) => <div className={control.locked ? 'fc-child-access-row locked' : 'fc-child-access-row'} key={control.name}><div><strong>{control.name}</strong><small>{control.description}</small></div>{control.locked ? <span className="fc-access-lock">Locked</span> : <label className="fc-access-switch"><input type="checkbox" defaultChecked={control.defaultOn} disabled={control.locked} /><span>Allow</span></label>}</div>)}</div><div className="fc-emergency-note"><strong>🚨 Emergency access stays on</strong><span>Safety-critical emergency features cannot be turned off.</span></div><button className="fc-primary-button fc-child-access-continue" type="button" onClick={() => go('family-choice')}>Continue</button></section></main>
  }

  if (view === 'family-choice') {
    return <main className="fc-onboarding-shell"><section className="fc-onboarding-card"><button className="fc-back-link" type="button" onClick={() => go('plan')}>← Back</button><p className="fc-kicker">Your families</p><h1>What would you like to do?</h1><p className="fc-onboarding-copy">You can create a new family or join a family you've been invited to.</p><div className="fc-family-choice-grid"><button className="fc-choice-panel" type="button" onClick={() => go('create-family')}><span>＋</span><strong>Create a Family</strong><small>Start a new family space and receive a Family ID.</small></button><button className="fc-choice-panel" type="button" onClick={() => go('join-family')}><span>↗</span><strong>Join a Family</strong><small>Enter a Family ID you've been given.</small></button></div></section></main>
  }

  if (view === 'create-family') {
    return <main className="fc-onboarding-shell"><section className="fc-onboarding-card"><button className="fc-back-link" type="button" onClick={() => go('family-choice')}>← Back</button><p className="fc-kicker">Create family</p><h1>Give your family a name</h1><p className="fc-onboarding-copy">Once created, Family Circle gives you a unique Family ID to share with people you trust.</p><div className="fc-onboarding-form"><label><span>Family name</span><input value={familyName} onChange={(event) => setFamilyName(event.target.value)} placeholder="The Smith Family" /></label>{error && <p className="fc-entry-error">{error}</p>}<button className="fc-primary-button" type="button" onClick={createFamily}>Create Family</button></div><div className="fc-security-note"><strong>🔐 Family ID</strong><span>Your Family ID connects an account to the correct family. Each member still uses their own private Member PIN.</span></div></section></main>
  }

  if (view === 'join-family') {
    return <main className="fc-onboarding-shell"><section className="fc-onboarding-card"><button className="fc-back-link" type="button" onClick={() => go('family-choice')}>← Back</button><p className="fc-kicker">Join family</p><h1>Enter your Family ID</h1><p className="fc-onboarding-copy">You only need to enter this once to connect your account to that family.</p><div className="fc-onboarding-form"><label><span>Family ID</span><input value={familyId} onChange={(event) => setFamilyId(event.target.value.toUpperCase())} placeholder="FC-7K4P9" autoCapitalize="characters" /></label>{error && <p className="fc-entry-error">{error}</p>}<button className="fc-primary-button" type="button" onClick={findFamily}>Find Family</button></div>{foundFamily && <div className="fc-found-family"><div><span>Family found</span><strong>{foundFamily.name}</strong><small>{foundFamily.id}</small></div><button className="fc-primary-button" type="button" onClick={joinFamily}>Join Family</button></div>}</section></main>
  }

  return <main className="fc-onboarding-shell"><section className="fc-onboarding-card fc-family-list-card"><div className="fc-family-list-head"><div><p className="fc-kicker">Connected families</p><h1>Choose a Family</h1><p className="fc-onboarding-copy">Select the family space you want to enter. Your account can belong to more than one.</p></div><img className="fc-family-list-logo" src={logoUrl} alt="Family Circle" /></div>{families.map((family) => <button className={selectedFamily?.id === family.id ? 'fc-family-list-item selected' : 'fc-family-list-item'} type="button" key={family.id} onClick={() => chooseFamily(family)}><span className="fc-family-list-icon">👨‍👩‍👧‍👦</span><span><strong>{family.name}</strong><small>Family ID · {family.id}</small></span><b>→</b></button>)}<div className="fc-family-list-actions"><button className="fc-secondary-button" type="button" onClick={() => go('join-family')}>+ Join Another Family</button><button className="fc-secondary-button" type="button" onClick={() => go('create-family')}>+ Create a Family</button></div><p className="fc-onboarding-footnote">Family ID connects the family. Member PIN protects the member profile.</p></section></main>
}
