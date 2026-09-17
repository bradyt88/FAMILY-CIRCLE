import { useState } from 'react'

type Screen = 'members' | 'home'

const demoMembers = [
  { id: 'member-1', label: 'Family Member 1', initials: 'FM' },
  { id: 'member-2', label: 'Family Member 2', initials: 'FM' },
  { id: 'member-3', label: 'Family Member 3', initials: 'FM' },
]

export default function App() {
  const [screen, setScreen] = useState<Screen>('members')
  const [selectedMember, setSelectedMember] = useState<string | null>(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  function openPin(memberId: string) {
    setSelectedMember(memberId)
    setPin('')
    setError('')
  }

  function closePin() {
    setSelectedMember(null)
    setPin('')
    setError('')
  }

  function submitPin() {
    if (pin.length !== 4) {
      setError('Enter the 4-digit PIN.')
      return
    }

    // Foundation-only behaviour. Real verification belongs behind the backend boundary.
    setScreen('home')
    closePin()
  }

  if (screen === 'home') {
    return (
      <main className="app-shell">
        <section className="panel">
          <p className="eyebrow">Family Circle</p>
          <h1>Family Home</h1>
          <p className="muted">The secure family space will be built here.</p>
          <button className="secondary-button" onClick={() => setScreen('members')}>
            Switch member
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <section className="panel">
        <p className="eyebrow">Family Circle</p>
        <h1>Who’s using Family Circle?</h1>
        <p className="muted">Choose your family profile to continue.</p>

        <div className="member-grid">
          {demoMembers.map((member) => (
            <button className="member-card" key={member.id} onClick={() => openPin(member.id)}>
              <span className="avatar">{member.initials}</span>
              <span>{member.label}</span>
            </button>
          ))}
        </div>
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
            <button className="close-button" aria-label="Close PIN entry" onClick={closePin}>
              ×
            </button>
            <h2 id="pin-title">Enter your PIN</h2>
            <p className="muted">Your PIN unlocks this family profile.</p>
            <input
              autoFocus
              inputMode="numeric"
              maxLength={4}
              pattern="[0-9]*"
              type="password"
              value={pin}
              onChange={(event) => {
                setPin(event.target.value.replace(/\D/g, ''))
                setError('')
              }}
              aria-label="4-digit PIN"
            />
            {error && <p className="error">{error}</p>}
            <button className="primary-button" onClick={submitPin}>
              Continue
            </button>
          </section>
        </div>
      )}
    </main>
  )
}
