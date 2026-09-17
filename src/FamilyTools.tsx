import { useMemo, useState } from 'react'

type Coordinates = { latitude: number; longitude: number } | null

export type ToolMode = 'emergency' | 'profile' | 'notifications' | 'settings' | 'map'

export type FamilyMember = {
  id: string
  label: string
  initials: string
  accent: string
  phone: string
  bio: string
  locationLabel: string
  lastUpdated: string
  mapX: number
  mapY: number
}

export type FamilyNotification = {
  id: string
  kind: 'Chat' | 'Task' | 'Calendar' | 'Emergency'
  title: string
  detail: string
  time: string
}

export type EmergencyReason = {
  id: string
  title: string
  description: string
  needsLocation: boolean
  tone: string
  message?: string
}

const storageKey = (memberId: string, field: string) => `family-circle-${field}-${memberId}`

const statusOptions = ['Home', 'Work', 'Partying', 'Recovering', 'Playing', 'Gaming', 'Toilet 😂', 'Movies', 'Sleeping', 'Gym', 'Travelling', 'Holiday', 'Out & About']

const baseReasons: EmergencyReason[] = [
  { id: 'unsafe', title: "I'm Not Safe", description: 'Instantly alert everyone and share your current location.', needsLocation: true, tone: 'danger' },
  { id: 'lift', title: 'I Need a Lift', description: 'Ask the family for help getting somewhere safely.', needsLocation: true, tone: 'lift' },
  { id: 'lost', title: "I'm Lost / Need Help", description: 'Alert the family and share your current location.', needsLocation: true, tone: 'lost' },
  { id: 'other', title: 'Something Else / Urgent Help', description: 'Tell your family what is happening and get help.', needsLocation: true, tone: 'other' },
]

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

function ToolBottomNav({ activeTab, mode, onNavigate, onMap }: { activeTab: string; mode: ToolMode; onNavigate: (tab: 'home' | 'chat' | 'photos' | 'calendar' | 'tasks') => void; onMap: () => void }) {
  const items = [
    ['home', 'Home', '⌂'] as const,
    ['chat', 'Chat', '◌'] as const,
    ['photos', 'Photos', '▧'] as const,
    ['calendar', 'Calendar', '▦'] as const,
    ['tasks', 'Tasks', '✓'] as const,
  ]

  return (
    <nav className="bottom-nav" aria-label="Family Circle navigation">
      {items.map(([tab, label, icon]) => (
        <button className={mode === 'map' ? 'nav-item' : activeTab === tab ? 'nav-item active' : 'nav-item'} key={tab} type="button" onClick={() => onNavigate(tab)}>
          <span aria-hidden="true">{icon}</span>
          <small>{label}</small>
        </button>
      ))}
      <button className={mode === 'map' ? 'nav-item nav-item-wide active' : 'nav-item nav-item-wide'} type="button" onClick={onMap}>
        <span aria-hidden="true">📍</span>
        <small>Where Is Everyone?</small>
      </button>
    </nav>
  )
}

export function FamilyTools({
  mode,
  selectedMember,
  members,
  notifications,
  locationSharing,
  locationPermission,
  activeTab,
  onHome,
  onNavigate,
  onOpenMap,
  onEmergencyAlert,
  onClearNotifications,
  onToggleLocationSharing,
  onLocationPermission,
}: {
  mode: ToolMode
  selectedMember: FamilyMember
  members: FamilyMember[]
  notifications: FamilyNotification[]
  locationSharing: Record<string, boolean>
  locationPermission: 'unknown' | 'granted' | 'denied'
  activeTab: string
  onHome: () => void
  onNavigate: (tab: 'home' | 'chat' | 'photos' | 'calendar' | 'tasks') => void
  onOpenMap: () => void
  onEmergencyAlert: (reason: EmergencyReason, coordinates: Coordinates) => void
  onClearNotifications: () => void
  onToggleLocationSharing: (memberId: string, enabled: boolean) => void
  onLocationPermission: (status: 'granted' | 'denied') => void
}) {
  const [selectedMapMember, setSelectedMapMember] = useState(selectedMember.id)
  const [settingsNotice, setSettingsNotice] = useState('')
  const [alertSent, setAlertSent] = useState<{ reason: EmergencyReason; coordinates: Coordinates } | null>(null)
  const [locationBusy, setLocationBusy] = useState(false)
  const [emergencyFlow, setEmergencyFlow] = useState<'none' | 'medical' | 'child' | 'other'>('none')
  const [confirmAlert, setConfirmAlert] = useState<EmergencyReason | null>(null)
  const [messageText, setMessageText] = useState('')
  const [profilePhoto, setProfilePhoto] = useState<string | null>(() => localStorage.getItem(storageKey(selectedMember.id, 'profile-photo')))
  const [profileBio, setProfileBio] = useState(() => localStorage.getItem(storageKey(selectedMember.id, 'bio')) ?? selectedMember.bio)
  const [profileStatus, setProfileStatus] = useState(() => localStorage.getItem(storageKey(selectedMember.id, 'status')) ?? selectedMember.locationLabel)
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem(storageKey(selectedMember.id, 'social-links'))
    return saved ? JSON.parse(saved) as Record<string, string> : { Facebook: '', TikTok: '', Snapchat: '', YouTube: '' }
  })

  const selectedMap = useMemo(() => members.find((member) => member.id === selectedMapMember) ?? selectedMember, [members, selectedMapMember, selectedMember])

  function requestLocation() {
    if (!navigator.geolocation) {
      onLocationPermission('denied')
      setSettingsNotice('Location services are not available in this browser.')
      return
    }

    setLocationBusy(true)
    navigator.geolocation.getCurrentPosition(
      () => {
        onLocationPermission('granted')
        setSettingsNotice('Location permission granted. Family Circle can use your location when an alert needs it.')
        setLocationBusy(false)
      },
      () => {
        onLocationPermission('denied')
        setSettingsNotice('Location permission was not granted. Emergency alerts can still be sent, but the current location may be unavailable.')
        setLocationBusy(false)
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 },
    )
  }

  function sendAlertNow(reason: EmergencyReason) {
    if (!navigator.geolocation) {
      onLocationPermission('denied')
      onEmergencyAlert(reason, null)
      setAlertSent({ reason, coordinates: null })
      return
    }

    setLocationBusy(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = { latitude: position.coords.latitude, longitude: position.coords.longitude }
        onLocationPermission('granted')
        onEmergencyAlert(reason, coordinates)
        setAlertSent({ reason, coordinates })
        setLocationBusy(false)
      },
      () => {
        onLocationPermission('denied')
        onEmergencyAlert(reason, null)
        setAlertSent({ reason, coordinates: null })
        setLocationBusy(false)
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 },
    )
  }

  function queueConfirm(reason: EmergencyReason) {
    setConfirmAlert(reason)
    setEmergencyFlow('none')
    setMessageText('')
  }

  function saveProfile() {
    localStorage.setItem(storageKey(selectedMember.id, 'bio'), profileBio.trim().slice(0, 100))
    localStorage.setItem(storageKey(selectedMember.id, 'status'), profileStatus)
    localStorage.setItem(storageKey(selectedMember.id, 'social-links'), JSON.stringify(socialLinks))
    setSettingsNotice('Profile saved for this family member.')
  }

  function uploadProfilePhoto(file: File) {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      const value = typeof reader.result === 'string' ? reader.result : null
      if (!value) return
      setProfilePhoto(value)
      localStorage.setItem(storageKey(selectedMember.id, 'profile-photo'), value)
      setSettingsNotice('Profile photo updated.')
    }
    reader.readAsDataURL(file)
  }

  function removeProfilePhoto() {
    setProfilePhoto(null)
    localStorage.removeItem(storageKey(selectedMember.id, 'profile-photo'))
    setSettingsNotice('Profile photo removed.')
  }

  function renderCallFamily() {
    return (
      <div className="feature-card emergency-call-card">
        <div className="feature-heading-row">
          <div>
            <p className="feature-kicker">Call family</p>
            <h2>Call a family member</h2>
          </div>
          <span className="feature-badge">Tap to call</span>
        </div>
        <div className="contact-grid">
          {members.map((member) => (
            <a className="emergency-contact" href={`tel:${member.phone}`} key={member.id}>
              <span className={`contact-avatar ${member.accent}`}>{member.initials}</span>
              <span>
                <strong>{member.label}</strong>
                <small>{member.phone}</small>
              </span>
              <b aria-hidden="true">☎</b>
            </a>
          ))}
        </div>
      </div>
    )
  }

  function renderEmergency() {
    if (alertSent) {
      return (
        <section className="feature-view emergency-view" aria-label="Family emergency alert sent">
          <FeatureHeader title="Alert Sent" description="Your Family Circle has been alerted." onHome={onHome} />
          <div className="feature-card emergency-success-card">
            <div className="success-icon">✓</div>
            <p className="feature-kicker">Family Emergency</p>
            <h2>{alertSent.reason.title}</h2>
            {alertSent.reason.message && <p className="emergency-message-preview">“{alertSent.reason.message}”</p>}
            <p className="muted">Every family member has been alerted and a message has been posted into Family Chat.</p>
            <div className="emergency-status-list">
              <span>✓ Family alert sent</span>
              <span>✓ Family Chat updated</span>
              <span>{alertSent.coordinates ? '✓ Current location shared' : '• Location unavailable'}</span>
              <span>✓ Notifications created</span>
            </div>
            <div className="tool-actions">
              <button className="primary-form-button" type="button" onClick={() => onNavigate('chat')}>Open Family Chat</button>
              <button className="secondary-action" type="button" onClick={() => setAlertSent(null)}>Back to Family Emergency</button>
            </div>
          </div>
          <ToolBottomNav activeTab={activeTab} mode={mode} onNavigate={onNavigate} onMap={onOpenMap} />
        </section>
      )
    }

    if (confirmAlert) {
      return (
        <section className="feature-view emergency-view" aria-label="Confirm family alert">
          <FeatureHeader title="Confirm Family Alert" description="Check the request before it is sent to everyone." onHome={() => setConfirmAlert(null)} />
          <div className="feature-card emergency-confirm-card">
            <div className="confirm-symbol">?</div>
            <p className="feature-kicker">Family Circle</p>
            <h2>{confirmAlert.title}</h2>
            {confirmAlert.message && <p className="emergency-message-preview">“{confirmAlert.message}”</p>}
            <p className="muted">This will notify every family member and share your current location.</p>
            <div className="tool-actions">
              <button className="primary-form-button" type="button" disabled={locationBusy} onClick={() => { setConfirmAlert(null); sendAlertNow(confirmAlert) }}>{locationBusy ? 'Getting location…' : 'Send Family Alert'}</button>
              <button className="secondary-action" type="button" onClick={() => setConfirmAlert(null)}>Cancel</button>
            </div>
          </div>
          <ToolBottomNav activeTab={activeTab} mode={mode} onNavigate={onNavigate} onMap={onOpenMap} />
        </section>
      )
    }

    if (emergencyFlow === 'medical') {
      return (
        <section className="feature-view emergency-view" aria-label="Medical help">
          <FeatureHeader title="Medical Help" description="Choose the level of help your family member needs." onHome={() => setEmergencyFlow('none')} />
          <div className="emergency-subgrid">
            <button className="emergency-sub-option emergency-danger" type="button" onClick={() => queueConfirm({ id: 'urgent-medical', title: 'Urgent Medical Assistance', description: 'Send an urgent medical alert to the whole family.', needsLocation: true, tone: 'danger' })}>
              <strong>Urgent Medical Assistance</strong>
              <small>Accident, serious injury, fall, suddenly unwell or needs urgent family help.</small>
            </button>
            <button className="emergency-sub-option emergency-medical" type="button" onClick={() => setMessageText('')}>
              <strong>Medical Help</strong>
              <small>Ask the family for help or advice about a medical problem.</small>
            </button>
          </div>
          <div className="feature-card message-request-card">
            <p className="feature-kicker">Medical Help</p>
            <h2>What do you need help with?</h2>
            <textarea value={messageText} onChange={(event) => setMessageText(event.target.value.slice(0, 240))} maxLength={240} placeholder="Tell your family what is happening…" />
            <div className="form-actions"><button className="primary-form-button" type="button" disabled={!messageText.trim() || locationBusy} onClick={() => queueConfirm({ id: 'medical-help', title: 'Medical Help', description: 'Share your medical help request with the family.', needsLocation: true, tone: 'medical', message: messageText.trim() })}>Send Medical Help Request</button></div>
            <p className="form-note">Family Circle is a family communication tool, not a medical advice service.</p>
          </div>
          <ToolBottomNav activeTab={activeTab} mode={mode} onNavigate={onNavigate} onMap={onOpenMap} />
        </section>
      )
    }

    if (emergencyFlow === 'child') {
      const childOptions = [
        ['Homework Help', 'I need help with homework.'],
        ['I Need Mum/Dad', 'I need Mum or Dad.'],
        ["I'm Upset", "I'm upset and need my family."],
        ["I Don't Know What To Do", "I don't know what to do and need help."],
        ['Call Family', 'Call a family member.'],
        ['Something Else', 'I need help with something else.'],
      ]
      return (
        <section className="feature-view emergency-view" aria-label="Child needs help">
          <FeatureHeader title="Child Needs Help" description="Simple choices for children who need a family member." onHome={() => setEmergencyFlow('none')} />
          <div className="emergency-subgrid child-subgrid">
            {childOptions.map(([title, message]) => (
              <button className="emergency-sub-option emergency-child" type="button" key={title} onClick={() => title === 'Call Family' ? undefined : queueConfirm({ id: `child-${title.toLowerCase().replaceAll(' ', '-')}`, title: `Child Needs Help — ${title}`, description: message, needsLocation: true, tone: 'child', message })}>
                <strong>{title}</strong>
                <small>{message}</small>
              </button>
            ))}
          </div>
          <div className="feature-card child-call-card">
            <p className="feature-kicker">Call family</p>
            <h2>Who should they call?</h2>
            <div className="contact-grid">{members.map((member) => <a className="emergency-contact" href={`tel:${member.phone}`} key={member.id}><span className={`contact-avatar ${member.accent}`}>{member.initials}</span><span><strong>{member.label}</strong><small>{member.phone}</small></span><b aria-hidden="true">☎</b></a>)}</div>
          </div>
          <ToolBottomNav activeTab={activeTab} mode={mode} onNavigate={onNavigate} onMap={onOpenMap} />
        </section>
      )
    }

    if (emergencyFlow === 'other') {
      return (
        <section className="feature-view emergency-view" aria-label="Other urgent help">
          <FeatureHeader title="Something Else / Urgent Help" description="Tell your family what is happening and send an urgent request." onHome={() => setEmergencyFlow('none')} />
          <div className="feature-card message-request-card">
            <p className="feature-kicker">Urgent family help</p>
            <h2>What's happening?</h2>
            <textarea value={messageText} onChange={(event) => setMessageText(event.target.value.slice(0, 300))} maxLength={300} placeholder="Tell your family what you need…" />
            <div className="character-count">{messageText.length}/300</div>
            <div className="form-actions"><button className="primary-form-button" type="button" disabled={!messageText.trim() || locationBusy} onClick={() => queueConfirm({ id: 'other-help', title: 'Something Else / Urgent Help', description: 'Send an urgent family-help request.', needsLocation: true, tone: 'other', message: messageText.trim() })}>Send Urgent Help</button></div>
          </div>
          <ToolBottomNav activeTab={activeTab} mode={mode} onNavigate={onNavigate} onMap={onOpenMap} />
        </section>
      )
    }

    return (
      <section className="feature-view emergency-view" aria-label="Family Emergency">
        <FeatureHeader title="Family Emergency" description="Fast family help when someone needs the people they trust." onHome={onHome} />
        {renderCallFamily()}
        <div className="emergency-alert-intro">
          <div>
            <p className="feature-kicker">Alert everyone</p>
            <h2>Family help, when it matters</h2>
          </div>
          <p>Only “I’m Not Safe” is instant. Other requests give you a clear send step first.</p>
        </div>
        <button className="emergency-unsafe-hero" type="button" disabled={locationBusy} onClick={() => sendAlertNow(baseReasons[0])}>
          <span className="unsafe-icon">!</span>
          <span><strong>I'M NOT SAFE</strong><small>Instant alert · no confirmation · share current location</small></span>
          <b>→</b>
        </button>
        <div className="emergency-grid">
          <button className="emergency-option emergency-medical" type="button" onClick={() => setEmergencyFlow('medical')}><span className="emergency-option-icon">✚</span><span><strong>Medical Help</strong><small>Urgent assistance or ask the family for help.</small></span><b>→</b></button>
          <button className="emergency-option emergency-lift" type="button" onClick={() => queueConfirm(baseReasons[1])}><span className="emergency-option-icon">🚗</span><span><strong>I Need a Lift</strong><small>Send a family request with your current location.</small></span><b>→</b></button>
          <button className="emergency-option emergency-child" type="button" onClick={() => setEmergencyFlow('child')}><span className="emergency-option-icon">♡</span><span><strong>Child Needs Help</strong><small>Homework, upset, Mum/Dad, or something else.</small></span><b>→</b></button>
          <button className="emergency-option emergency-lost" type="button" onClick={() => queueConfirm(baseReasons[2])}><span className="emergency-option-icon">⌖</span><span><strong>I'm Lost / Need Help</strong><small>Ask the family for help and share your location.</small></span><b>→</b></button>
          <button className="emergency-option emergency-other" type="button" onClick={() => { setEmergencyFlow('other'); setMessageText('') }}><span className="emergency-option-icon">✉</span><span><strong>Something Else / Urgent Help</strong><small>Type what is happening and send it to the family.</small></span><b>→</b></button>
        </div>
        {locationBusy && <p className="inline-location-status">Getting your current location…</p>}
        <p className="form-note emergency-note">Family Circle does not place emergency-services calls. The Emergency feature is built to contact your family first.</p>
        <ToolBottomNav activeTab={activeTab} mode={mode} onNavigate={onNavigate} onMap={onOpenMap} />
      </section>
    )
  }

  function renderProfile() {
    return (
      <section className="feature-view" aria-label="My Profile">
        <FeatureHeader title="My Profile" description="Your family profile and the details you choose to share." onHome={onHome} />
        <div className="feature-card profile-card profile-editor-card">
          <div className="profile-hero profile-editor-hero">
            <label className="profile-photo-picker" title="Upload profile photo">
              {profilePhoto ? <img src={profilePhoto} alt="Your profile" /> : <span className={`profile-avatar ${selectedMember.accent}`}>{selectedMember.initials}</span>}
              <input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) uploadProfilePhoto(file); event.currentTarget.value = '' }} />
              <span className="profile-photo-overlay">📷 Change</span>
            </label>
            <div className="profile-editor-head">
              <p className="feature-kicker">Family profile</p>
              <h2>{selectedMember.label}</h2>
              <p className="muted">Tap your profile photo to upload a new picture.</p>
            </div>
          </div>

          <div className="profile-editor-grid">
            <label className="form-field form-field-wide"><span>Short bio · 100 characters</span><textarea value={profileBio} maxLength={100} onChange={(event) => setProfileBio(event.target.value)} placeholder="Tell your family a little about yourself…" /><small className="character-count">{profileBio.length}/100</small></label>
            <div className="profile-detail-static"><span>Phone</span><strong>{selectedMember.phone}</strong></div>
            <label className="form-field"><span>My Status</span><select value={profileStatus} onChange={(event) => setProfileStatus(event.target.value)}>{statusOptions.map((status) => <option key={status}>{status}</option>)}</select></label>
          </div>

          <div className="profile-social-editor">
            <div className="feature-heading-row"><div><p className="feature-kicker">Optional</p><h2>Social links</h2></div><span className="feature-badge">Green = link added</span></div>
            {Object.keys(socialLinks).map((social) => (
              <div className="social-editor-row" key={social}>
                <input value={socialLinks[social]} onChange={(event) => setSocialLinks((current) => ({ ...current, [social]: event.target.value }))} placeholder={`Paste ${social} link`} />
                <a className={socialLinks[social] ? 'social-link-button active' : 'social-link-button'} href={socialLinks[social] || undefined} target="_blank" rel="noreferrer" onClick={(event) => { if (!socialLinks[social]) event.preventDefault() }}>{social}</a>
              </div>
            ))}
          </div>

          <div className="profile-actions">
            {profilePhoto && <button className="secondary-action" type="button" onClick={removeProfilePhoto}>Remove Photo</button>}
            <button className="primary-form-button" type="button" onClick={saveProfile}>Save Profile</button>
          </div>
          {settingsNotice && <div className="settings-notice" role="status">{settingsNotice}</div>}
        </div>
        <ToolBottomNav activeTab={activeTab} mode={mode} onNavigate={onNavigate} onMap={onOpenMap} />
      </section>
    )
  }

  function renderNotifications() {
    return (
      <section className="feature-view" aria-label="Notifications">
        <FeatureHeader title="Notifications" description="Your personal Family Circle inbox for messages, tasks, calendar activity and family alerts." onHome={onHome} />
        <div className="feature-card">
          <div className="feature-heading-row"><div><p className="feature-kicker">Personal inbox</p><h2>Recent notifications</h2></div><button className="secondary-action" type="button" onClick={onClearNotifications} disabled={!notifications.length}>Mark all read</button></div>
          <div className="notification-list">
            {notifications.length === 0 ? <div className="notification-empty"><strong>You're all caught up.</strong><span>No new family notifications.</span></div> : notifications.map((notification) => <article className={`notification-row notification-${notification.kind.toLowerCase()}`} key={notification.id}><span className="notification-kind">{notification.kind === 'Emergency' ? '!' : notification.kind === 'Chat' ? '◌' : notification.kind === 'Task' ? '✓' : '▦'}</span><div><strong>{notification.title}</strong><p>{notification.detail}</p><small>{notification.time}</small></div></article>)}
          </div>
        </div>
        <ToolBottomNav activeTab={activeTab} mode={mode} onNavigate={onNavigate} onMap={onOpenMap} />
      </section>
    )
  }

  function renderSettings() {
    const shareEnabled = Boolean(locationSharing[selectedMember.id])
    return (
      <section className="feature-view" aria-label="Settings">
        <FeatureHeader title="Settings" description="The main control centre for your Family Circle account and family space." onHome={onHome} />
        <div className="settings-grid">
          <div className="feature-card settings-card">
            <div className="feature-heading-row"><div><p className="feature-kicker">Your account</p><h2>Profile & security</h2></div></div>
            <button className="settings-row" type="button" onClick={() => setSettingsNotice('Family Members: manage who belongs to this family space and their emergency contact details.')}><span>👥</span><span><strong>Family Members</strong><small>Profiles and family access</small></span><b>›</b></button>
            <button className="settings-row" type="button" onClick={() => setSettingsNotice('Family Settings: control the family name, shared preferences and future family-wide options.')}><span>⚙</span><span><strong>Family Settings</strong><small>Shared family controls</small></span><b>›</b></button>
            <button className="settings-row" type="button" onClick={() => setSettingsNotice('PIN & Security: change your personal PIN and review security options.')}><span>⌘</span><span><strong>PIN & Security</strong><small>Change PIN and security</small></span><b>›</b></button>
            <button className="settings-row" type="button" onClick={() => setSettingsNotice('Emergency Contacts: these are the family contacts shown in Family Emergency.')}><span>☎</span><span><strong>Emergency Contacts</strong><small>Family members you can call</small></span><b>›</b></button>
          </div>

          <div className="feature-card settings-card">
            <div className="feature-heading-row"><div><p className="feature-kicker">Location</p><h2>Family location sharing</h2></div><span className="feature-badge">{shareEnabled ? 'On' : 'Off'}</span></div>
            <div className="location-permission-box"><strong>Location permission</strong><span>{locationPermission === 'granted' ? 'Allowed on this device' : locationPermission === 'denied' ? 'Not granted' : 'Not requested yet'}</span><button className="secondary-action" type="button" onClick={requestLocation} disabled={locationBusy}>{locationBusy ? 'Checking…' : locationPermission === 'granted' ? 'Check again' : 'Allow location access'}</button></div>
            <div className="location-toggle-row"><div><strong>Share my location with family</strong><small>Appear on Where Is Everyone? when sharing is on.</small></div><button className={shareEnabled ? 'toggle-button on' : 'toggle-button'} type="button" role="switch" aria-checked={shareEnabled} onClick={() => onToggleLocationSharing(selectedMember.id, !shareEnabled)}><span /></button></div>
            <p className="form-note">Emergency alerts can request your current location even when normal family location sharing is turned off.</p>
          </div>

          <div className="feature-card settings-card">
            <div className="feature-heading-row"><div><p className="feature-kicker">Support</p><h2>Help & legal</h2></div></div>
            <button className="settings-row" type="button" onClick={() => setSettingsNotice('Help & Support: one family support contact can be kept here for the whole app.')}><span>?</span><span><strong>Help & Support</strong><small>Family Circle support</small></span><b>›</b></button>
            <button className="settings-row" type="button" onClick={() => setSettingsNotice('Terms & Privacy: legal documents will live here before production release.')}><span>▤</span><span><strong>Terms & Privacy</strong><small>Terms and privacy information</small></span><b>›</b></button>
            <button className="settings-row" type="button" onClick={() => setSettingsNotice('App Information: Family Circle foundation build.')}><span>ⓘ</span><span><strong>App Information</strong><small>Version and build details</small></span><b>›</b></button>
          </div>
        </div>
        {settingsNotice && <div className="settings-notice" role="status">{settingsNotice}</div>}
        <ToolBottomNav activeTab={activeTab} mode={mode} onNavigate={onNavigate} onMap={onOpenMap} />
      </section>
    )
  }

  function renderMap() {
    const sharingMembers = members.filter((member) => locationSharing[member.id])
    return (
      <section className="feature-view" aria-label="Where Is Everyone?">
        <FeatureHeader title="Where Is Everyone?" description="See family members who have chosen to share their location." onHome={onHome} />
        <div className="feature-card map-card">
          <div className="feature-heading-row"><div><p className="feature-kicker">Family Circle</p><h2>{sharingMembers.length} of {members.length} sharing location</h2></div><span className="feature-badge">Family Map</span></div>
          <div className="family-map-canvas" aria-label="Family location map preview">
            <span className="map-road road-one" /><span className="map-road road-two" /><span className="map-road road-three" /><span className="map-water" />
            {sharingMembers.map((member) => <button className="map-marker" key={member.id} type="button" style={{ left: `${member.mapX}%`, top: `${member.mapY}%` }} onClick={() => setSelectedMapMember(member.id)} aria-label={`Show ${member.label}`}><span className="map-avatar ${member.accent}">{member.initials}</span><small>{member.label}</small></button>)}
            {members.some((member) => !locationSharing[member.id]) && <div className="map-off-note">Some family members have location sharing turned off.</div>}
          </div>
          <div className="map-member-card"><span className={`profile-avatar small ${selectedMap.accent}`}>{selectedMap.initials}</span><div><strong>{selectedMap.label}</strong><span>{locationSharing[selectedMap.id] ? `${selectedMap.locationLabel} · Updated ${selectedMap.lastUpdated}` : 'Location sharing is off'}</span></div><span className="map-status-dot" aria-label={locationSharing[selectedMap.id] ? 'Location sharing on' : 'Location sharing off'} /></div>
          <p className="form-note">Where Is Everyone? is opt-in. Emergency alerts can still send a one-off current location when someone asks the family for help.</p>
        </div>
        <ToolBottomNav activeTab={activeTab} mode={mode} onNavigate={onNavigate} onMap={onOpenMap} />
      </section>
    )
  }

  if (mode === 'emergency') return renderEmergency()
  if (mode === 'profile') return renderProfile()
  if (mode === 'notifications') return renderNotifications()
  if (mode === 'settings') return renderSettings()
  return renderMap()
}
