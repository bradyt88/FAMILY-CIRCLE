import { useState } from 'react'
import logoUrl from '../design/brand/family-circle-logo.png'

type Screen = 'members' | 'home'
type HomeTab = 'home' | 'chat' | 'photos' | 'calendar' | 'tasks' | 'more'

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

const messages = [
  { initials: 'FM', time: '19:42', name: 'Family Member 1', text: "Who's up for takeaway tonight? 🍕", accent: 'member-accent-one' },
  { initials: 'FM', time: '17:15', name: 'Family Member 2', text: "I'll be home around 6pm.", accent: 'member-accent-two' },
  { initials: 'FM', time: '12:03', name: 'Family Member 3', text: 'Check this out! 📷', accent: 'member-accent-three' },
]

const events = [
  { icon: '🎂', title: 'Family Dinner', time: '19:00 – 20:00', location: 'At Home' },
  { icon: '⚽', title: 'Football Training', time: '17:00 – 18:00', location: 'Leisure Centre' },
  { icon: '▦', title: 'No more events today', time: 'Enjoy your evening', location: '' },
]

const tasks = [
  { title: 'Take bins out', due: 'Due today' },
  { title: 'Tidy your room', due: 'Due today' },
  { title: 'Feed the dog', due: 'Due tomorrow' },
]

const quickTiles: { tab: HomeTab; title: string; subtitle: string; icon: string; tone: string }[] = [
  { tab: 'chat', title: 'Chat', subtitle: 'Message the family', icon: '◌', tone: 'tile-cyan' },
  { tab: 'photos', title: 'Photos', subtitle: 'Our memories together', icon: '▧', tone: 'tile-purple' },
  { tab: 'more', title: 'Emergency', subtitle: 'Get help quickly', icon: '!', tone: 'tile-pink' },
  { tab: 'tasks', title: 'Tasks', subtitle: 'Jobs & responsibilities', icon: '✓', tone: 'tile-green' },
  { tab: 'calendar', title: 'Calendar', subtitle: 'Events & plans', icon: '▦', tone: 'tile-magenta' },
]

const navItems: { tab: HomeTab; label: string; icon: string }[] = [
  { tab: 'home', label: 'Home', icon: '⌂' },
  { tab: 'chat', label: 'Chat', icon: '◌' },
  { tab: 'photos', label: 'Photos', icon: '▧' },
  { tab: 'calendar', label: 'Calendar', icon: '▦' },
  { tab: 'tasks', label: 'Tasks', icon: '✓' },
  { tab: 'more', label: 'More', icon: '•••' },
]

function Logo() {
  return (
    <div className="brand-lockup" aria-label="Family Circle">
      <img className="brand-logo" src={logoUrl} alt="Family Circle" />
      <span className="brand-name">Family Circle</span>
    </div>
  )
}

function Greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning,'
  if (hour < 18) return 'Good afternoon,'
  return 'Good evening,'
}

function CurrentDate() {
  const parts = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).formatToParts(new Date())
  const weekday = parts.find((part) => part.type === 'weekday')?.value ?? ''
  const day = parts.find((part) => part.type === 'day')?.value ?? ''
  const month = parts.find((part) => part.type === 'month')?.value ?? ''

  return (
    <span className="date-stack">
      <strong>{weekday}</strong>
      <span>{day} {month}</span>
    </span>
  )
}

function SectionHeader({ icon, title, tone, onAction, actionLabel }: { icon: string; title: string; tone: string; onAction?: () => void; actionLabel?: string }) {
  return (
    <div className={`dashboard-heading ${tone}`}>
      <div className="dashboard-title">
        <span className="heading-icon" aria-hidden="true">{icon}</span>
        <h2>{title}</h2>
      </div>
      {onAction && (
        <button className="heading-action" type="button" onClick={onAction} aria-label={actionLabel ?? `Open ${title}`}>
          →
        </button>
      )}
    </div>
  )
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('members')
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const [pinOpen, setPinOpen] = useState(false)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<HomeTab>('home')

  const selectedMember = demoMembers.find((member) => member.id === selectedMemberId) ?? demoMembers[0]

  function openPin(memberId: string) {
    setSelectedMemberId(memberId)
    setPin('')
    setError('')
    setPinOpen(true)
  }

  function closePin() {
    setPinOpen(false)
    setPin('')
    setError('')
  }

  function submitPin() {
    if (pin.length !== 4) {
      setError('Enter all 4 digits to continue.')
      return
    }

    setScreen('home')
    setActiveTab('home')
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

  function switchMember() {
    setScreen('members')
    setActiveTab('home')
  }

  if (screen === 'home') {
    return (
      <main className="app-shell home-app-shell">
        <section className="home-shell">
          <header className="home-topbar">
            <div className="home-profile">
              <span className={`home-avatar ${selectedMember.accent}`}>{selectedMember.initials}</span>
              <div>
                <p className="greeting"><Greeting /></p>
                <strong>{selectedMember.label}</strong>
                <span>The Family Circle</span>
              </div>
            </div>

            <div className="hero-brand" aria-label="Family Circle">
              <img className="hero-logo" src={logoUrl} alt="Family Circle" />
            </div>

            <div className="home-tools">
              <button className="icon-button notification-button" type="button" aria-label="Notifications">
                <span aria-hidden="true">♟</span>
                <b>3</b>
              </button>
              <button className="icon-button" type="button" aria-label="Settings">⚙</button>
            </div>
          </header>

          <div className="home-motto">Different places. Same circle. ♡</div>

          <section className="family-banner" aria-label="Family message">
            <div className="family-banner-icon" aria-hidden="true">♟</div>
            <div className="family-banner-copy">
              <strong>Family isn't just who you live with,</strong>
              <span>it's who you do life with. ♡</span>
            </div>
            <CurrentDate />
          </section>

          <section className="dashboard-grid" aria-label="Family dashboard">
            <article className="dashboard-card card-chat">
              <SectionHeader icon="◌" title="Family Chat" tone="tone-cyan" onAction={() => setActiveTab('chat')} actionLabel="View all messages" />
              <div className="message-list">
                {messages.map((message) => (
                  <div className="message-row" key={`${message.time}-${message.name}`}>
                    <span className={`row-avatar ${message.accent}`}>{message.initials}</span>
                    <div className="message-copy">
                      <div className="row-meta"><strong>{message.name}</strong><time>{message.time}</time></div>
                      <span>{message.text}</span>
                    </div>
                    <span className="unread-dot" aria-hidden="true" />
                  </div>
                ))}
              </div>
              <button className="outline-action" type="button" onClick={() => setActiveTab('chat')}>View All Messages <span>›</span></button>
            </article>

            <article className="dashboard-card card-events">
              <SectionHeader icon="▦" title="Today's Events" tone="tone-pink" onAction={() => setActiveTab('calendar')} actionLabel="Open calendar" />
              <div className="event-list">
                {events.map((event) => (
                  <div className="event-row" key={event.title}>
                    <span className="event-icon" aria-hidden="true">{event.icon}</span>
                    <div className="event-copy">
                      <strong>{event.title}</strong>
                      <span>{event.time}</span>
                      {event.location && <small>⌖ {event.location}</small>}
                    </div>
                  </div>
                ))}
              </div>
              <button className="outline-action pink-action" type="button" onClick={() => setActiveTab('calendar')}>View Full Calendar <span>›</span></button>
            </article>

            <article className="dashboard-card card-photo">
              <SectionHeader icon="▧" title="Latest Photo" tone="tone-purple" onAction={() => setActiveTab('photos')} actionLabel="Open photos" />
              <button className="memory-frame" type="button" onClick={() => setActiveTab('photos')} aria-label="Open family memories">
                <div className="memory-scene" aria-hidden="true"><span /></div>
                <div className="memory-caption">
                  <strong>Family memories</strong>
                  <span>Moments that matter ♡</span>
                </div>
                <div className="memory-dots" aria-hidden="true"><span className="active" /><span /><span /><span /></div>
              </button>
            </article>

            <article className="dashboard-card card-tasks">
              <SectionHeader icon="✓" title="Your Tasks" tone="tone-cyan" onAction={() => setActiveTab('tasks')} actionLabel="Open tasks" />
              <div className="task-list">
                {tasks.map((task) => (
                  <button className="task-row" type="button" key={task.title} onClick={() => setActiveTab('tasks')}>
                    <span className="task-check" aria-hidden="true" />
                    <span className="task-copy"><strong>{task.title}</strong><small>{task.due}</small></span>
                  </button>
                ))}
              </div>
              <button className="outline-action cyan-action" type="button" onClick={() => setActiveTab('tasks')}>View All Tasks <span>›</span></button>
            </article>
          </section>

          <section className="quick-tile-grid" aria-label="Family shortcuts">
            {quickTiles.map((tile) => (
              <button className={`quick-tile ${tile.tone}`} type="button" key={tile.title} onClick={() => setActiveTab(tile.tab)}>
                <span className="quick-tile-icon" aria-hidden="true">{tile.icon}</span>
                <strong>{tile.title}</strong>
                <span>{tile.subtitle}</span>
              </button>
            ))}
          </section>

          <nav className="bottom-nav" aria-label="Family Circle navigation">
            {navItems.map((item) => (
              <button className={activeTab === item.tab ? 'nav-item active' : 'nav-item'} key={item.tab} type="button" onClick={() => setActiveTab(item.tab)}>
                <span aria-hidden="true">{item.icon}</span>
                <small>{item.label}</small>
              </button>
            ))}
          </nav>

          <div className="home-footer-actions">
            <button type="button" onClick={switchMember}>Switch family member</button>
            <span>Foundation build</span>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <section className="members-shell" aria-labelledby="member-title">
        <header className="brand-header">
          <Logo />
          <span className="secure-label"><span aria-hidden="true">●</span> Private family space</span>
        </header>

        <div className="member-intro">
          <p className="eyebrow">Welcome</p>
          <h1 id="member-title">Who's using Family Circle?</h1>
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

      {pinOpen && (
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
