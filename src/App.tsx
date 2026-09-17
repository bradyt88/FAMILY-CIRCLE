import { useState } from 'react'

type Screen = 'members' | 'home'

type Member = {
  id: string
  label: string
  initials: string
  accent: string
}

const demoMembers: Member[] = [
  { id: 'member-1', label: 'Family Member 1', initials: 'FM', accent: 'member-accent-one' },
  { id: 'member-2', label: 'Family Member 2', initials: 'FM', accent: 'member-accent-two' },
  { id: 'member-3', label: 'Family Member 3', initials: 'FM', accent: 'member-accent-three' },
]

const quickActions = [
  { icon: '✓', title: 'Family tasks', text: 'Keep everyday jobs together.' },
  { icon: '◷', title: 'Family plans', text: 'See what is coming up.' },
  { icon: '✦', title: 'Family space', text: 'Your shared family hub.' },
]

export default function App() {
  const [screen, setScreen] = useState<Screen>('members')
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  const selectedMember = demoMembers.find((member) => member.id === selectedMemberId) ?? null

  function openPin(memberId: string) {
    setSelectedMemberId(memberId)
    setPin('')
    setError('')
  }

  function closePin() {
    setSelectedMemberId(null)
    setPin('')
    setError('')
  }

  function submitPin() {
    if (pin.length !== 4) {
      setError('Enter all 4 digits to continue.')
      return
    }

    // Foundation-only behaviour. Real PIN verification belongs behind the backend boundary.
    setScreen('home')
    closePin()
  }

  function addPinDigit(digit: string) {
    if (pin.length < 4) {
      setPin((current) => current + digit)
      setError('')
    }
  }

  function removePinDigit() {
    setPin((current) => current.slice(0, -1))
    setError('')
  }

  if (screen === 'home') {
    return (
      <main className="app-shell">
        <section className="home-shell">
          <header className="topbar">
            <div className="brand-lockup" aria-label="Family Circle">
              <span className="brand-mark">FC</span>
              <span className="brand-name">Family Circle</span>
            </div>
            <button className="profile-button" onClick={() => setScreen('members')} aria-label="Switch family member">
              <span className="mini-avatar">FM</span>
              <span>Switch</span>
            </button>
          </header>

          <section className="welcome-card">
            <div>
              <p className="eyebrow">Family Home</p>
              <h1>Welcome to your family space.</h1>
              <p className="muted">A simple place for the people, plans and everyday things that matter.</p>
            </div>
            <span className="welcome-symbol" aria-hidden="true">⌂</span>
          </section>

          <section className="section-block" aria-labelledby="quick-actions-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Your family</p>
                <h2 id="quick-actions-title">Quick access</h2>
              </div>
              <span className="status-pill">Foundation</span>
            </div>

            <div className="action-grid">
              {quickActions.map((action) => (
                <button className="action-card" key={action.title} type="button">
                  <span className="action-icon" aria-hidden="true">{action.icon}</span>
                  <span className="action-copy">
                    <strong>{action.title}</strong>
                    <small>{action.text}</small>
                  </span>
                  <span className="chevron" aria-hidden="true">›</span>
                </button>
              ))}
            </div>
          </section>

          <section className="coming-card">
            <div className="coming-icon" aria-hidden="true">♡</div>
            <div>
              <p className="eyebrow">Coming together</p>
              <h2>More family features are on the way.</h2>
              <p className="muted">This first build establishes the core experience. The family tools will be added around it.</p>
            </div>
          </section>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <section className="members-shell" aria-labelledby="member-title">
        <header className="brand-header">
          <div className="brand-lockup" aria-label="Family Circle">
            <span className="brand-mark">FC</span>
            <span className="brand-name">Family Circle</span>
          </div>
          <span className="secure-label"><span aria-hidden="true">●</span> Private family space</span>
        </header>

        <div className="member-intro">
          <p className="eyebrow">Welcome</p>
          <h1 id="member-title">Who’s using Family Circle?</h1>
          <p className="muted">Choose your family profile to continue.</p>
        </div>

        <div className="member-grid">
          {demoMembers.map((member) => (
            <button className="member-card" key={member.id} onClick={() => openPin(member.id)}>
              <span className={`avatar ${member.accent}`}>{member.initials}</span>
              <span className="member-name">{member.label}</span>
              <span className="member-action">Enter PIN <span aria-hidden="true">→</span></span>
            </button>
          ))}
        </div>

        <p className="privacy-note"><span aria-hidden="true">▣</span> Your family information stays private.</p>
      </section>

      {selectedMember && (
        <div className="modal-backdrop" role="presentation" onMouseDown={closePin}>
          <section
            className="pin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pin-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className="close-button" aria-label="Close PIN entry" onClick={closePin}>×</button>

            <div className="pin-member">
              <span className="avatar modal-avatar">{selectedMember.initials}</span>
              <div>
                <p className="eyebrow">Family profile</p>
                <strong>{selectedMember.label}</strong>
              </div>
            </div>

            <h2 id="pin-title">Enter your PIN</h2>
            <p className="muted pin-help">Enter your 4-digit PIN to unlock your family space.</p>

            <div className="pin-dots" aria-label={`${pin.length} of 4 PIN digits entered`}>
              {[0, 1, 2, 3].map((index) => (
                <span className={index < pin.length ? 'pin-dot filled' : 'pin-dot'} key={index} />
              ))}
            </div>

            {error && <p className="error" role="alert">{error}</p>}

            <div className="keypad" aria-label="PIN keypad">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button key={digit} type="button" className="keypad-button" onClick={() => addPinDigit(digit)}>
                  {digit}
                </button>
              ))}
              <button type="button" className="keypad-button keypad-muted" onClick={closePin}>Cancel</button>
              <button type="button" className="keypad-button" onClick={() => addPinDigit('0')}>0</button>
              <button type="button" className="keypad-button keypad-muted" onClick={removePinDigit} aria-label="Delete last digit">⌫</button>
            </div>

            <button className="primary-button" onClick={submitPin}>Continue</button>
          </section>
        </div>
      )}
    </main>
  )
}
