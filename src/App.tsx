import { useState } from 'react'
import logoUrl from '../design/brand/family-circle-logo.png'
import './batch1.css'
import './batch11.css'

type Screen = 'members' | 'home'
type HomeTab = 'home' | 'chat' | 'photos' | 'calendar' | 'tasks' | 'more'
type EventKind = 'standard' | 'birthday' | 'important'

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
  date: string
  icon: string
  title: string
  time: string
  location: string
  kind: EventKind
}

type FamilyTask = {
  id: string
  title: string
  dueDate: string
  assignedTo: string
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

function todayDate() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(date: Date, amount: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + amount)
  return result
}

function dateFromKey(key: string) {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatLongDate(key: string) {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(dateFromKey(key))
}

function formatShortDate(key: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
  }).format(dateFromKey(key))
}

function formatRelativeDate(key: string) {
  const today = todayDate()
  const date = dateFromKey(key)
  const diff = Math.round((date.getTime() - today.getTime()) / 86400000)

  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  return formatShortDate(key)
}

function eventIcon(kind: EventKind) {
  if (kind === 'birthday') return '🎂'
  if (kind === 'important') return '⭐'
  return '📅'
}

function isPastEvent(event: FamilyEvent) {
  const todayKey = toDateKey(todayDate())
  if (event.date < todayKey) return true
  if (event.date > todayKey) return false

  const [hours, minutes] = event.time.split(':').map(Number)
  const now = new Date()
  const eventTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes)
  return eventTime.getTime() < now.getTime()
}

function getDaysUntil(key: string) {
  const today = todayDate()
  const date = dateFromKey(key)
  return Math.round((date.getTime() - today.getTime()) / 86400000)
}

function reminderLabel(event: FamilyEvent) {
  const days = getDaysUntil(event.date)
  if (isPastEvent(event)) return 'Past event'
  if (days === 7) return '7-day reminder due today'
  if (days === 1) return '1-day reminder due today'
  return 'Reminders: 7 days + 1 day before'
}

function initialEvents(): FamilyEvent[] {
  const today = todayDate()
  return [
    { id: 'event-1', date: toDateKey(today), icon: '🎂', title: 'Family Dinner', time: '19:00', location: 'At Home', kind: 'standard' },
    { id: 'event-2', date: toDateKey(today), icon: '⚽', title: 'Football Training', time: '17:00', location: 'Leisure Centre', kind: 'standard' },
    { id: 'event-3', date: toDateKey(addDays(today, 1)), icon: '🛒', title: 'Weekly Food Shop', time: '18:00', location: 'Supermarket', kind: 'standard' },
    { id: 'event-4', date: toDateKey(addDays(today, 3)), icon: '🎬', title: 'Family Movie Night', time: '19:30', location: 'At Home', kind: 'standard' },
    { id: 'event-5', date: toDateKey(addDays(today, 7)), icon: '🎂', title: 'Family Birthday', time: '15:00', location: 'At Home', kind: 'birthday' },
  ]
}

function initialTasks(): FamilyTask[] {
  const today = todayDate()
  return [
    { id: 'task-1', title: 'Take bins out', dueDate: toDateKey(today), assignedTo: 'member-2', completed: false },
    { id: 'task-2', title: 'Tidy your room', dueDate: toDateKey(today), assignedTo: 'member-1', completed: false },
    { id: 'task-3', title: 'Feed the dog', dueDate: toDateKey(addDays(today, 1)), assignedTo: 'member-3', completed: false },
  ]
}

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

function getCalendarCells(cursor: Date) {
  const firstDay = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()
  const startOffset = (firstDay.getDay() + 6) % 7
  return Array.from({ length: 42 }, (_, index) => {
    const dayNumber = index - startOffset + 1
    return dayNumber >= 1 && dayNumber <= daysInMonth ? dayNumber : null
  })
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
  const [tasks, setTasks] = useState<FamilyTask[]>(initialTasks)
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(toDateKey(todayDate()))
  const [calendarCursor, setCalendarCursor] = useState(() => {
    const now = todayDate()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [calendarForm, setCalendarForm] = useState({
    title: '',
    date: toDateKey(todayDate()),
    time: '',
    location: '',
    kind: 'standard' as EventKind,
  })
  const [calendarError, setCalendarError] = useState('')
  const [taskForm, setTaskForm] = useState({
    title: '',
    dueDate: toDateKey(todayDate()),
    assignedTo: '',
  })
  const [taskError, setTaskError] = useState('')

  const selectedMember = demoMembers.find((member) => member.id === selectedMemberId) ?? demoMembers[0]
  const todayKey = toDateKey(todayDate())
  const todaysEvents = events.filter((event) => event.date === todayKey).sort((a, b) => a.time.localeCompare(b.time))
  const completedTasks = tasks.filter((task) => task.completed).length
  const calendarCells = getCalendarCells(calendarCursor)
  const monthLabel = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(calendarCursor)

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
    const title = calendarForm.title.trim()
    if (!title || !calendarForm.date || !calendarForm.time) {
      setCalendarError('Event name, date and time are required.')
      return
    }

    const newEvent: FamilyEvent = {
      id: `event-${Date.now()}`,
      date: calendarForm.date,
      icon: eventIcon(calendarForm.kind),
      title,
      time: calendarForm.time,
      location: calendarForm.location.trim(),
      kind: calendarForm.kind,
    }

    setEvents((current) => [...current, newEvent])
    setSelectedCalendarDate(calendarForm.date)
    const date = dateFromKey(calendarForm.date)
    setCalendarCursor(new Date(date.getFullYear(), date.getMonth(), 1))
    setCalendarForm({
      title: '',
      date: calendarForm.date,
      time: '',
      location: '',
      kind: 'standard',
    })
    setCalendarError('')
  }

  function addTask() {
    const title = taskForm.title.trim()
    if (!title || !taskForm.dueDate || !taskForm.assignedTo) {
      setTaskError('Task name, due date and family member are required.')
      return
    }

    setTasks((current) => [
      ...current,
      {
        id: `task-${Date.now()}`,
        title,
        dueDate: taskForm.dueDate,
        assignedTo: taskForm.assignedTo,
        completed: false,
      },
    ])
    setTaskForm((current) => ({ ...current, title: '' }))
    setTaskError('')
  }

  function toggleTask(taskId: string) {
    setTasks((current) => current.map((task) => task.id === taskId ? { ...task, completed: !task.completed } : task))
  }

  function selectCalendarDate(dateKey: string) {
    setSelectedCalendarDate(dateKey)
  }

  function shiftMonth(amount: number) {
    const next = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + amount, 1)
    setCalendarCursor(next)
    setSelectedCalendarDate(toDateKey(new Date(next.getFullYear(), next.getMonth(), 1)))
  }

  function jumpToToday() {
    const today = todayDate()
    setCalendarCursor(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelectedCalendarDate(toDateKey(today))
  }

  function getTaskAssignee(task: FamilyTask) {
    return demoMembers.find((member) => member.id === task.assignedTo) ?? demoMembers[0]
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
                todaysEvents.slice(0, 3).map((event) => (
                  <div className={isPastEvent(event) ? 'event-row event-past' : 'event-row'} key={event.id}>
                    <span className="event-icon" aria-hidden="true">{event.icon}</span>
                    <div className="event-copy">
                      <strong>{event.title}</strong>
                      <span>{event.time} {isPastEvent(event) ? '· Completed' : ''}</span>
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
              {tasks.slice(0, 3).map((task) => {
                const assignee = getTaskAssignee(task)
                return (
                  <button className="task-row" type="button" key={task.id} onClick={() => toggleTask(task.id)}>
                    <span className={task.completed ? 'task-check completed' : 'task-check'} aria-hidden="true">{task.completed ? '✓' : ''}</span>
                    <span className={task.completed ? 'task-copy task-completed' : 'task-copy'}>
                      <strong>{task.title}</strong>
                      <small>{formatRelativeDate(task.dueDate)} · {assignee.label}</small>
                    </span>
                  </button>
                )
              })}
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
    const visibleEvents = events.filter((event) => event.date === selectedCalendarDate).sort((a, b) => a.time.localeCompare(b.time))

    return (
      <section className="feature-view" aria-label="Family calendar">
        <FeatureHeader title="Family Calendar" description="Keep plans, appointments and family events visible in one place." onHome={() => setActiveTab('home')} />

        <div className="feature-card calendar-main-card">
          <div className="calendar-toolbar">
            <button className="calendar-nav-button" type="button" onClick={() => shiftMonth(-1)} aria-label="Previous month">‹</button>
            <div className="calendar-month-heading">
              <h2>{monthLabel}</h2>
              <button className="today-button" type="button" onClick={jumpToToday}>Today</button>
            </div>
            <button className="calendar-nav-button" type="button" onClick={() => shiftMonth(1)} aria-label="Next month">›</button>
          </div>

          <div className="calendar-weekdays" aria-hidden="true">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <span key={day}>{day}</span>)}
          </div>

          <div className="month-grid">
            {calendarCells.map((dayNumber, index) => {
              if (dayNumber === null) {
                return <div className="calendar-cell calendar-cell-empty" key={`empty-${index}`} aria-hidden="true" />
              }

              const date = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth(), dayNumber)
              const key = toDateKey(date)
              const dayEvents = events.filter((event) => event.date === key)
              const isToday = key === todayKey
              const isSelected = key === selectedCalendarDate
              const isPast = key < todayKey
              const hasImportant = dayEvents.some((event) => event.kind === 'important')
              const hasBirthday = dayEvents.some((event) => event.kind === 'birthday')

              const className = [
                'calendar-cell',
                isToday ? 'is-today' : '',
                isSelected ? 'is-selected' : '',
                isPast ? 'is-past' : '',
                hasImportant ? 'has-important' : '',
                hasBirthday ? 'has-birthday' : '',
              ].filter(Boolean).join(' ')

              return (
                <button className={className} type="button" key={key} onClick={() => selectCalendarDate(key)} aria-label={`${formatLongDate(key)}${dayEvents.length ? `, ${dayEvents.length} event${dayEvents.length === 1 ? '' : 's'}` : ''}`}>
                  <span className="calendar-cell-day">{dayNumber}</span>
                  {dayEvents.length > 0 && (
                    <span className="calendar-marker-row" aria-hidden="true">
                      {dayEvents.slice(0, 3).map((event) => <span key={event.id} className={`calendar-marker marker-${event.kind}`} />)}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <div className="calendar-key">
            <span><i className="key-dot key-today" /> Today</span>
            <span><i className="key-dot key-birthday" /> Birthday</span>
            <span><i className="key-dot key-important" /> Important</span>
            <span><i className="key-dot key-event" /> Event</span>
          </div>
        </div>

        <div className="calendar-selected-card">
          <div className="feature-heading-row">
            <div>
              <p className="feature-kicker">Selected day</p>
              <h2>{formatLongDate(selectedCalendarDate)}</h2>
            </div>
            <span className="feature-badge">{visibleEvents.length} event{visibleEvents.length === 1 ? '' : 's'}</span>
          </div>

          <div className="calendar-events">
            {visibleEvents.length === 0 ? (
              <div className="calendar-empty-state">
                <span>♡</span>
                <div>
                  <strong>No family events on this date.</strong>
                  <p className="muted">Use the form below to add one.</p>
                </div>
              </div>
            ) : (
              visibleEvents.map((event) => (
                <div className={isPastEvent(event) ? 'calendar-event event-past' : 'calendar-event'} key={event.id}>
                  <span className={`calendar-event-icon event-kind-${event.kind}`}>{event.icon}</span>
                  <div className="calendar-event-copy">
                    <strong>{event.title}</strong>
                    <span>{event.time} · {formatRelativeDate(event.date)}</span>
                    {event.location && <small>⌖ {event.location}</small>}
                    <em>{reminderLabel(event)}</em>
                  </div>
                  {isPastEvent(event) && <span className="calendar-complete">✓</span>}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="feature-card event-form-card">
          <div className="feature-heading-row">
            <div>
              <p className="feature-kicker">Add to family calendar</p>
              <h2>New family event</h2>
            </div>
            <span className="feature-badge">7d + 1d reminders</span>
          </div>
          <p className="muted">Events are added to the calendar and the Home dashboard from the same family event record.</p>

          <div className="form-grid">
            <label className="form-field form-field-wide">
              <span>Event name *</span>
              <input value={calendarForm.title} onChange={(event) => setCalendarForm((current) => ({ ...current, title: event.target.value }))} placeholder="Family dinner" />
            </label>

            <label className="form-field">
              <span>Date *</span>
              <input type="date" min={todayKey} value={calendarForm.date} onChange={(event) => setCalendarForm((current) => ({ ...current, date: event.target.value }))} />
            </label>

            <label className="form-field">
              <span>Time *</span>
              <input type="time" value={calendarForm.time} onChange={(event) => setCalendarForm((current) => ({ ...current, time: event.target.value }))} />
            </label>

            <label className="form-field">
              <span>Location</span>
              <input value={calendarForm.location} onChange={(event) => setCalendarForm((current) => ({ ...current, location: event.target.value }))} placeholder="At home" />
            </label>

            <label className="form-field">
              <span>Event type</span>
              <select value={calendarForm.kind} onChange={(event) => setCalendarForm((current) => ({ ...current, kind: event.target.value as EventKind }))}>
                <option value="standard">Family event</option>
                <option value="birthday">Birthday</option>
                <option value="important">Important occasion</option>
              </select>
            </label>
          </div>

          {calendarError && <p className="form-error" role="alert">{calendarError}</p>}

          <div className="form-actions">
            <button type="button" className="primary-form-button" onClick={addCalendarEvent}>Add Family Event</button>
          </div>

          <p className="form-note">Notification delivery will be connected to the family backend later. The reminder schedule is already represented as 7 days and 1 day before the event.</p>
        </div>

        {renderBottomNav()}
      </section>
    )
  }

  function renderTasks() {
    const sortedTasks = [...tasks].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      return a.dueDate.localeCompare(b.dueDate)
    })

    return (
      <section className="feature-view" aria-label="Family tasks">
        <FeatureHeader title="Family Tasks" description="Share jobs and responsibilities so everyone knows what needs doing." onHome={() => setActiveTab('home')} />

        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-heading-row">
              <div>
                <p className="feature-kicker">Shared responsibilities</p>
                <h2>Everyone's tasks</h2>
              </div>
              <span className="feature-badge">{completedTasks}/{tasks.length} done</span>
            </div>

            <div className="tasks-summary">
              <strong>{tasks.length - completedTasks} tasks remaining</strong>
              <span>Assigned and dated.</span>
            </div>

            <div className="task-detail-list">
              {sortedTasks.map((task) => {
                const assignee = getTaskAssignee(task)
                return (
                  <button className={task.completed ? 'task-detail done' : 'task-detail'} type="button" key={task.id} onClick={() => toggleTask(task.id)}>
                    <span className="task-detail-check" aria-hidden="true">{task.completed ? '✓' : ''}</span>
                    <span className="task-detail-copy">
                      <strong>{task.title}</strong>
                      <small>Due {formatLongDate(task.dueDate)} · {assignee.label}</small>
                    </span>
                    <span className="assigned-avatar">{assignee.initials}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-heading-row">
              <div>
                <p className="feature-kicker">Create responsibility</p>
                <h2>Add a task</h2>
              </div>
              <span className="feature-badge">Required details</span>
            </div>

            <p className="muted">Every task needs a due date and a family member before it can be added.</p>

            <div className="form-grid">
              <label className="form-field form-field-wide">
                <span>Task name *</span>
                <input value={taskForm.title} onChange={(event) => setTaskForm((current) => ({ ...current, title: event.target.value }))} placeholder="Take bins out" />
              </label>

              <label className="form-field">
                <span>Due date *</span>
                <input type="date" min={todayKey} value={taskForm.dueDate} onChange={(event) => setTaskForm((current) => ({ ...current, dueDate: event.target.value }))} />
              </label>

              <label className="form-field">
                <span>Assign to *</span>
                <select value={taskForm.assignedTo} onChange={(event) => setTaskForm((current) => ({ ...current, assignedTo: event.target.value }))}>
                  <option value="">Choose family member</option>
                  {demoMembers.map((member) => <option value={member.id} key={member.id}>{member.label}</option>)}
                </select>
              </label>
            </div>

            {taskError && <p className="form-error" role="alert">{taskError}</p>}

            <div className="form-actions">
              <button type="button" className="primary-form-button" onClick={addTask}>Add Family Task</button>
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
