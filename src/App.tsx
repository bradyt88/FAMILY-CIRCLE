import { useState } from 'react'
import logoUrl from '../design/brand/family-circle-logo.png'
import './batch1.css'

type Screen = 'members' | 'home'
type HomeTab = 'home' | 'chat' | 'photos' | 'calendar' | 'tasks' | 'more'

type Member = {
  id: string
  label: string
  initials: string
  accent: string
}

type ChatMessage = {
  initials: string
  time: string
  name: string
  text: string
  accent: string
  outgoing?: boolean
}

type FamilyEvent = {
  id: string
  day: string
  icon: string
  title: string
  time: string
  location: string
}

type FamilyTask = {
  id: string
  title: string
  due: string
  completed: boolean
}

const demoMembers: Member[] = [
  { id: 'member-1', label: 'Family Member 1', initials: 'FM', accent: 'member-accent-one' },
  { id: 'member-2', label: 'Family Member 2', initials: 'FM', accent: 'member-accent-two' },
  { id: 'member-3', label: 'Family Member 3', initials: 'FM', accent: 'member-accent-three' },
]

const initialMessages: ChatMessage[] = [
  { initials: 'FM', time: '19:42', name: 'Family Member 1', text: "Who's up for takeaway tonight? 🍕", accent: 'member-accent-one' },
  { initials: 'FM', time: '17:15', name: 'Family Member 2', text: "I'll be home around 6pm.", accent: 'member-accent-two' },
  { initials: 'FM', time: '12:03', name: 'Family Member 3', text: 'Check this out! 📷', accent: 'member-accent-three' },
]

const initialEvents: FamilyEvent[] = [
  { id: 'event-1', day: 'today', icon: '🎂', title: 'Family Dinner', time: '19:00 – 20:00', location: 'At Home' },
  { id: 'event-2', day: 'today', icon: '⚽', title: 'Football Training', time: '17:00 – 18:00', location: 'Leisure Centre' },
  { id: 'event-3', day: 'tomorrow', icon: '🛒', title: 'Weekly Food Shop', time: '18:00 – 19:00', location: 'Supermarket' },
  { id: 'event-4', day: 'weekend', icon: '🎬', title: 'Family Movie Night', time: '19:30 – 21:30', location: 'At Home' },
]

const initialTasks: FamilyTask[] = [
  { id: 'task-1', title: 'Take bins out', due: 'Due today', completed: false },
  { id: 'task-2', title: 'Tidy your room', due: 'Due today', completed: false },
  { id: 'task-3', title: 'Feed the dog', due: 'Due tomorrow', completed: false },
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

function FeatureHeader({ title, description, onHome }: { title: string; description: string; onHome: () => void }) {
  return (
    <div className="feature-topbar">
      <div>
        <p className="feature-kicker">Family Circle</p>
        <h1>{title}</h1>
        <p className="muted">{description}</p>
      </div>
      <button className="back-button" type="button" onClick={onHome}>← Home</button>
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
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [chatDraft, setChatDraft] = useState('')
  const [events, setEvents] = useState<FamilyEvent[]>(initialEvents)
  const [selectedCalendarDay, setSelectedCalendarDay] = useState('today')
  const [calendarDraft, setCalendarDraft] = useState('')
  const [tasks, setTasks] = useState<FamilyTask[]>(initialTasks)
  const [taskDraft, setTaskDraft] = useState('')

  const selectedMember = demoMembers.find((member) => member.id === selectedMemberId) ?? demoMembers[0]
  const todaysEvents = events.filter((event) => event.day === 'today')
  const selectedEvents = events.filter((event) => event.day === selectedCalendarDay)
  const completedTasks = tasks.filter((task) => task.completed).length

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

  function goToTab(tab: HomeTab) {
    if (tab === 'photos' || tab === 'more') return
    setActiveTab(tab)
  }

  function sendMessage() {
    const text = chatDraft.trim()
    if (!text) return

    const now = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    const newMessage: ChatMessage = {
      initials: selectedMember.initials,
      time: now,
      name: selectedMember.label,
      text,
      accent: selectedMember.accent,
      outgoing: true,
    }
    setMessages((current) => [newMessage, ...current])
    setChatDraft('')
  }

  function addCalendarEvent() {
    const title = calendarDraft.trim()
    if (!title) return

    const dayLabels: Record<string, string> = {
      today: 'today',
      tomorrow: 'tomorrow',
      weekend: 'weekend',
      all: 'family calendar',
    }
    const newEvent: FamilyEvent = {
      id: `event-${Date.now()}`,
      day: selectedCalendarDay === 'all' ? 'today' : selectedCalendarDay,
      icon: selectedCalendarDay === 'weekend' ? '🎉' : '📅',
      title,
      time: 'Time to be added',
      location: dayLabels[selectedCalendarDay],
    }
    setEvents((current) => [...current, newEvent])
    setCalendarDraft('')
  }

  function addTask() {
    const title = taskDraft.trim()
    if (!title) return

    setTasks((current) => [
      ...current,
      { id: `task-${Date.now()}`, title, due: 'Added just now', completed: false },
    ])
    setTaskDraft('')
  }

  function toggleTask(taskId: string) {
    setTasks((current) => current.map((task) => task.id === taskId ? { ...task, completed: !task.completed } : task))
  }

  function renderBottomNav() {
    return (
      <nav className="bottom-nav" aria-label="Family Circle navigation">
        {navItems.map((item) => (
          <button className={activeTab === item.tab ? 'nav-item active' : 'nav-item'} key={item.tab} type="button" onClick={() => goToTab(item.tab)}>
            <span aria-hidden="true">{item.icon}</span>
            <small>{item.label}</small>
          </button>
        ))}
      </nav>
    )
  }

  function renderHomeDashboard() {
    return (
      <>
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
            <SectionHeader icon="◌" title="Family Chat" tone="tone-cyan" onAction={() => goToTab('chat')} actionLabel="View all messages" />
            <div className="message-list">
              {messages.slice(0, 3).map((message) => (
                <div className="message-row" key={`${message.time}-${message.name}-${message.text}`}>
                  <span className={`row-avatar ${message.accent}`}>{message.initials}</span>
                  <div className="message-copy">
                    <div className="row-meta"><strong>{message.name}</strong><time>{message.time}</time></div>
                    <span>{message.text}</span>
                  </div>
                  <span className="unread-dot" aria-hidden="true" />
                </div>
              ))}
            </div>
            <button className="outline-action" type="button" onClick={() => goToTab('chat')}>View All Messages <span>›</span></button>
          </article>

          <article className="dashboard-card card-events">
            <SectionHeader icon="▦" title="Today's Events" tone="tone-pink" onAction={() => goToTab('calendar')} actionLabel="Open calendar" />
            <div className="event-list">
              {todaysEvents.length === 0 ? (
                <div className="event-row"><span className="event-icon" aria-hidden="true">✓</span><div className="event-copy"><strong>No more events today</strong><span>Enjoy your evening</span></div></div>
              ) : (
                todaysEvents.map((event) => (
                  <div className="event-row" key={event.id}>
                    <span className="event-icon" aria-hidden="true">{event.icon}</span>
                    <div className="event-copy">
                      <strong>{event.title}</strong>
                      <span>{event.time}</span>
                      {event.location && <small>⌖ {event.location}</small>}
                    </div>
                  </div>
                ))
              )}
            </div>
            <button className="outline-action pink-action" type="button" onClick={() => goToTab('calendar')}>View Full Calendar <span>›</span></button>
          </article>

          <article className="dashboard-card card-photo">
            <SectionHeader icon="▧" title="Latest Photo" tone="tone-purple" actionLabel="Open photos" />
            <button className="memory-frame" type="button" onClick={() => goToTab('photos')} aria-label="Open family memories">
              <div className="memory-scene" aria-hidden="true"><span /></div>
              <div className="memory-caption">
                <strong>Family memories</strong>
                <span>Moments that matter ♡</span>
              </div>
              <div className="memory-dots" aria-hidden="true"><span className="active" /><span /><span /><span /></div>
            </button>
          </article>

          <article className="dashboard-card card-tasks">
            <SectionHeader icon="✓" title="Your Tasks" tone="tone-cyan" onAction={() => goToTab('tasks')} actionLabel="Open tasks" />
            <div className="task-list">
              {tasks.slice(0, 3).map((task) => (
                <button className="task-row" type="button" key={task.id} onClick={() => toggleTask(task.id)}>
                  <span className={task.completed ? 'task-check completed' : 'task-check'} aria-hidden="true">{task.completed ? '✓' : ''}</span>
                  <span className={task.completed ? 'task-copy task-completed' : 'task-copy'}><strong>{task.title}</strong><small>{task.due}</small></span>
                </button>
              ))}
            </div>
            <button className="outline-action cyan-action" type="button" onClick={() => goToTab('tasks')}>View All Tasks <span>›</span></button>
          </article>
        </section>

        <section className="quick-tile-grid" aria-label="Family shortcuts">
          {quickTiles.map((tile) => (
            <button className={`quick-tile ${tile.tone}`} type="button" key={tile.title} onClick={() => goToTab(tile.tab)}>
              <span className="quick-tile-icon" aria-hidden="true">{tile.icon}</span>
              <strong>{tile.title}</strong>
              <span>{tile.subtitle}</span>
            </button>
          ))}
        </section>

        {renderBottomNav()}

        <div className="home-footer-actions">
          <button type="button" onClick={switchMember}>Switch family member</button>
          <span>Foundation build</span>
        </div>
      </>
    )
  }

  function renderChat() {
    return (
      <section className="feature-view" aria-label="Family chat">
        <FeatureHeader title="Family Chat" description="Keep the family conversation together in one private space." onHome={() => setActiveTab('home')} />
        <div className="feature-card">
          <div className="feature-heading-row">
            <h2>Family conversation</h2>
            <span className="feature-badge">Live demo</span>
          </div>
          <div className="chat-list">
            {messages.map((message) => (
              <div className={message.outgoing ? 'chat-row outgoing' : 'chat-row'} key={`${message.time}-${message.name}-${message.text}`}>
                <span className={`chat-avatar ${message.accent}`}>{message.initials}</span>
                <div className="chat-bubble">
                  <div className="chat-meta"><strong>{message.name}</strong><time>{message.time}</time></div>
                  <p>{message.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="chat-composer">
            <input value={chatDraft} onChange={(event) => setChatDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') sendMessage() }} placeholder="Write a family message…" aria-label="Write a family message" />
            <button type="button" onClick={sendMessage}>Send</button>
          </div>
        </div>
        {renderBottomNav()}
      </section>
    )
  }

  function renderCalendar() {
    const dayLabels = [
      { key: 'today', label: 'Today' },
      { key: 'tomorrow', label: 'Tomorrow' },
      { key: 'weekend', label: 'Weekend' },
      { key: 'all', label: 'All' },
    ]
    const visibleEvents = selectedCalendarDay === 'all' ? events : selectedEvents

    return (
      <section className="feature-view" aria-label="Family calendar">
        <FeatureHeader title="Family Calendar" description="Keep plans, appointments and family events visible in one place." onHome={() => setActiveTab('home')} />
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-heading-row">
              <h2>Upcoming plans</h2>
              <span className="feature-badge">Foundation</span>
            </div>
            <div className="calendar-days">
              {dayLabels.map((day) => (
                <button className={selectedCalendarDay === day.key ? 'calendar-day active' : 'calendar-day'} type="button" key={day.key} onClick={() => setSelectedCalendarDay(day.key)}>{day.label}</button>
              ))}
            </div>
            <div className="calendar-events">
              {visibleEvents.length === 0 ? (
                <div className="calendar-event"><span className="calendar-event-icon">✓</span><div className="calendar-event-copy"><strong>No events yet</strong><span>Add the next family plan below.</span></div></div>
              ) : (
                visibleEvents.map((event) => (
                  <div className="calendar-event" key={event.id}>
                    <span className="calendar-event-icon">{event.icon}</span>
                    <div className="calendar-event-copy"><strong>{event.title}</strong><span>{event.time}</span><small>{event.location}</small></div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-heading-row"><h2>Add a family event</h2><span className="feature-badge">Demo</span></div>
            <p className="muted">Add a quick placeholder event to test the calendar flow.</p>
            <div className="inline-form">
              <input value={calendarDraft} onChange={(event) => setCalendarDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') addCalendarEvent() }} placeholder="Event name" aria-label="New event name" />
              <button type="button" onClick={addCalendarEvent}>Add</button>
            </div>
          </div>
        </div>
        {renderBottomNav()}
      </section>
    )
  }

  function renderTasks() {
    return (
      <section className="feature-view" aria-label="Family tasks">
        <FeatureHeader title="Family Tasks" description="Share jobs and responsibilities so everyone knows what needs doing." onHome={() => setActiveTab('home')} />
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-heading-row"><h2>Everyone's tasks</h2><span className="feature-badge">{completedTasks}/{tasks.length} done</span></div>
            <div className="tasks-summary"><strong>{tasks.length - completedTasks} tasks remaining</strong><span>Keep the family moving together.</span></div>
            <div className="task-detail-list">
              {tasks.map((task) => (
                <button className={task.completed ? 'task-detail done' : 'task-detail'} type="button" key={task.id} onClick={() => toggleTask(task.id)}>
                  <span className="task-detail-check" aria-hidden="true">{task.completed ? '✓' : ''}</span>
                  <span className="task-detail-copy"><strong>{task.title}</strong><small>{task.due}</small></span>
                </button>
              ))}
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-heading-row"><h2>Add a task</h2><span className="feature-badge">Demo</span></div>
            <p className="muted">Create a quick task here. Assignment and real due dates come later.</p>
            <div className="inline-form">
              <input value={taskDraft} onChange={(event) => setTaskDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') addTask() }} placeholder="Task name" aria-label="New task name" />
              <button type="button" onClick={addTask}>Add</button>
            </div>
          </div>
        </div>
        {renderBottomNav()}
      </section>
    )
  }

  function renderActiveHomeTab() {
    if (activeTab === 'chat') return renderChat()
    if (activeTab === 'calendar') return renderCalendar()
    if (activeTab === 'tasks') return renderTasks()
    return renderHomeDashboard()
  }

  if (screen === 'home') {
    return (
      <main className="app-shell home-app-shell">
        <section className="home-shell">
          {renderActiveHomeTab()}
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
          <section className="pin-modal" role="dialog" aria-modal="true" aria-labelledby="pin-title" onMouseDown={(event) => event.stopPropagation()}>
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
              {[0, 1, 2, 3].map((index) => <span className={index < pin.length ? 'pin-dot filled' : 'pin-dot'} key={index} />)}
            </div>
            {error && <p className="error" role="alert">{error}</p>}
            <div className="keypad" aria-label="PIN keypad">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => <button key={digit} type="button" className="keypad-button" onClick={() => addPinDigit(digit)}>{digit}</button>)}
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
