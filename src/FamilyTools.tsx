import { useState } from 'react'

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
}

const reasons: EmergencyReason[] = [
  { id: 'unsafe', title: "I'm Not Safe", description: 'Alert everyone immediately and share your current location.', needsLocation: true, tone: 'danger' },
  { id: 'medical', title: 'Medical Emergency', description: 'Tell the family there is a medical emergency and share your location.', needsLocation: true, tone: 'medical' },
  { id: 'lift', title: 'I Need a Lift', description: 'Let the family know you need help getting somewhere safely.', needsLocation: true, tone: 'lift' },
  { id: 'child', title: 'Child Needs Help', description: 'One simple family alert for a child who needs someone right now.', needsLocation: true, tone: 'child' },
  { id: 'lost', title: "I'm Lost / Need Help", description: 'Alert everyone and send your current location.', needsLocation: true, tone: 'lost' },
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

function ToolBottomNav({ activeTab, onNavigate }: { activeTab: string; onNavigate: (tab: 'home' | 'chat' | 'photos' | 'calendar' | 'tasks') => void }) {
  const items = [
    ['home', 'Home', '⌂'],
    ['chat', 'Chat', '◌'],
    ['photos', 'Photos', '▧'],
    ['calendar', 'Calendar', '▦'],
    ['tasks', 'Tasks', '✓'],
  ] as const

  return (
    <nav className="bottom-nav" aria-label="Family Circle navigation">
      {items.map(([tab, label, icon]) => (
        <button className={activeTab === tab ? 'nav-item active' : 'nav-item'} key={tab} type="button" onClick={() => onNavigate(tab)}>
          <span aria-hidden="true">{icon}</span>
          <small>{label}</small>
        </button>
      ))}
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
  onEmergencyAlert: (reason: EmergencyReason, coordinates: Coordinates) => void
  onClearNotifications: () => void
  onToggleLocationSharing: (memberId: string, enabled: boolean) => void
  onLocationPermission: (status: 'granted' | 'denied') => void
}) {
  const [selectedMapMember, setSelectedMapMember] = useState(selectedMember.id)
  const [settingsNotice, setSettingsNotice] = useState('')
  const [alertSent, setAlertSent] = useState<{ reason: EmergencyReason; coordinates: Coordinates } | null>(null)
  const [locationBusy, setLocationBusy] = useState(false)

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

  function sendEmergency(reason: EmergencyReason) {
    if (!reason.needsLocation) {
      const next = null
      onEmergencyAlert(reason, next)
      setAlertSent({ reason, coordinates: next })
      return
    }

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

  function renderEmergency() {
    if (alertSent) {
      return (
        <section className="feature-view emergency-view" aria-label="Family emergency alert sent">
          <FeatureHeader title="Alert Sent" description="Your Family Circle has been alerted." onHome={onHome} />
          <div className="feature-card emergency-success-card">
            <div className="success-icon">✓</div>
            <p className="feature-kicker">Family Emergency</p>
            <h2>{alertSent.reason.title}</h2>
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
          <ToolBottomNav activeTab={activeTab} onNavigate={onNavigate} />
        </section>
      )
    }

    return (
      <section className="feature-view emergency-view" aria-label="Family Emergency">
        <FeatureHeader title="Family Emergency" description="Fast family help when someone needs the people they trust." onHome={onHome} />

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

        <div className="emergency-alert-intro">
          <div>
            <p className="feature-kicker">Alert everyone</p>
            <h2>Choose what you need</h2>
          </div>
          <p>Emergency alerts notify every family member, add a message to Family Chat and share your location when available.</p>
        </div>

        <div className="emergency-grid">
          {reasons.map((reason) => (
            <button className={`emergency-option emergency-${reason.tone}`} type="button" key={reason.id} onClick={() => sendEmergency(reason)} disabled={locationBusy}>
              <span className="emergency-option-icon" aria-hidden="true">{reason.id === 'unsafe' ? '!' : reason.id === 'medical' ? '✚' : reason.id === 'lift' ? '↗' : reason.id === 'child' ? '♡' : '⌖'}</span>
              <span>
                <strong>{reason.title}</strong>
                <small>{reason.description}</small>
              </span>
              <b aria-hidden="true">→</b>
            </button>
          ))}
        </div>
        {locationBusy && <p className="inline-location-status">Getting your current location…</p>}
        <p className="form-note emergency-note">There is no emergency-services button in Family Circle. The Emergency feature is designed to contact your family first.</p>
        <ToolBottomNav activeTab={activeTab} onNavigate={onNavigate} />
      </section>
    )
  }

  function renderProfile() {
    return (
      <section className="feature-view" aria-label="My Profile">
        <FeatureHeader title="My Profile" description="Your family profile and the details you choose to share." onHome={onHome} />
        <div className="profile-card feature-card">
          <div className="profile-hero">
            <span className={`profile-avatar ${selectedMember.accent}`}>{selectedMember.initials}</span>
            <div>
              <p className="feature-kicker">Family profile</p>
              <h2>{selectedMember.label}</h2>
              <p className="muted">{selectedMember.bio}</p>
            </div>
          </div>
          <div className="profile-details">
            <div><span>Phone</span><strong>{selectedMember.phone}</strong></div>
            <div><span>Location sharing</span><strong>{locationSharing[selectedMember.id] ? 'On' : 'Off'}</strong></div>
            <div><span>Current place</span><strong>{selectedMember.locationLabel}</strong></div>
          </div>
          <div className="social-links">
            {['Facebook', 'TikTok', 'Snapchat', 'YouTube'].map((social) => <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" key={social}>{social}</a>)}
          </div>
        </div>
        <ToolBottomNav activeTab={activeTab} onNavigate={onNavigate} />
      </section>
    )
  }

  function renderNotifications() {
    return (
      <section className="feature-view" aria-label="Notifications">
        <FeatureHeader title="Notifications" description="Your personal Family Circle inbox for messages, tasks, calendar activity and family alerts." onHome={onHome} />
        <div className="feature-card">
          <div className="feature-heading-row">
            <div>
              <p className="feature-kicker">Personal inbox</p>
              <h2>Recent notifications</h2>
            </div>
            <button className="secondary-action" type="button" onClick={onClearNotifications} disabled={!notifications.length}>Mark all read</button>
          </div>
          <div className="notification-list">
            {notifications.length === 0 ? <div className="notification-empty"><strong>You're all caught up.</strong><span>No new family notifications.</span></div> : notifications.map((notification) => (
              <article className={`notification-row notification-${notification.kind.toLowerCase()}`} key={notification.id}>
                <span className="notification-kind">{notification.kind === 'Emergency' ? '!' : notification.kind === 'Chat' ? '◌' : notification.kind === 'Task' ? '✓' : '▦'}</span>
                <div><strong>{notification.title}</strong><p>{notification.detail}</p><small>{notification.time}</small></div>
              </article>
            ))}
          </div>
        </div>
        <ToolBottomNav activeTab={activeTab} onNavigate={onNavigate} />
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
            <div className="location-permission-box">
              <strong>Location permission</strong>
              <span>{locationPermission === 'granted' ? 'Allowed on this device' : locationPermission === 'denied' ? 'Not granted' : 'Not requested yet'}</span>
              <button className="secondary-action" type="button" onClick={requestLocation} disabled={locationBusy}>{locationBusy ? 'Checking…' : locationPermission === 'granted' ? 'Check again' : 'Allow location access'}</button>
            </div>
            <div className="location-toggle-row">
              <div><strong>Share my location with family</strong><small>Appear on the Family Map when sharing is on.</small></div>
              <button className={shareEnabled ? 'toggle-button on' : 'toggle-button'} type="button" role="switch" aria-checked={shareEnabled} onClick={() => onToggleLocationSharing(selectedMember.id, !shareEnabled)}><span /></button>
            </div>
            <p className="form-note">Emergency alerts can request your current location even when normal Family Map sharing is turned off.</p>
          </div>

          <div className="feature-card settings-card">
            <div className="feature-heading-row"><div><p className="feature-kicker">Support</p><h2>Help & legal</h2></div></div>
            <button className="settings-row" type="button" onClick={() => setSettingsNotice('Help & Support: one family support contact can be kept here for the whole app.')}><span>?</span><span><strong>Help & Support</strong><small>Family Circle support</small></span><b>›</b></button>
            <button className="settings-row" type="button" onClick={() => setSettingsNotice('Terms & Privacy: legal documents will live here before production release.')}><span>▤</span><span><strong>Terms & Privacy</strong><small>Terms and privacy information</small></span><b>›</b></button>
            <button className="settings-row" type="button" onClick={() => setSettingsNotice('App Information: Family Circle foundation build.')}><span>ⓘ</span><span><strong>App Information</strong><small>Version and build details</small></span><b>›</b></button>
          </div>
        </div>
        {settingsNotice && <div className="settings-notice" role="status">{settingsNotice}</div>}
        <ToolBottomNav activeTab={activeTab} onNavigate={onNavigate} />
      </section>
    )
  }

  function renderMap() {
    const sharingMembers = members.filter((member) => locationSharing[member.id])
    const currentMapMember = members.find((member) => member.id === selectedMapMember) ?? selectedMember
    return (
      <section className="feature-view" aria-label="Family Map">
        <FeatureHeader title="Where's Everyone?" description="See family members who have chosen to share their location." onHome={onHome} />
        <div className="feature-card map-card">
          <div className="feature-heading-row"><div><p className="feature-kicker">Family Map</p><h2>{sharingMembers.length} of {members.length} sharing location</h2></div><span className="feature-badge">Demo map</span></div>
          <div className="family-map-canvas" aria-label="Family map preview">
            <span className="map-road road-one" /><span className="map-road road-two" /><span className="map-road road-three" />
            <span className="map-water" />
            {members.filter((member) => locationSharing[member.id]).map((member) => (
              <button className="map-marker" key={member.id} type="button" style={{ left: `${member.mapX}%`, top: `${member.mapY}%` }} onClick={() => setSelectedMapMember(member.id)} aria-label={`Show ${member.label}`}>
                <span className={`map-avatar ${member.accent}`}>{member.initials}</span>
                <small>{member.label}</small>
              </button>
            ))}
            {members.filter((member) => !locationSharing[member.id]).length > 0 && <div className="map-off-note">Some family members have location sharing turned off.</div>}
          </div>
          <div className="map-member-card">
            <span className={`profile-avatar small ${currentMapMember.accent}`}>{currentMapMember.initials}</span>
            <div><strong>{currentMapMember.label}</strong><span>{locationSharing[currentMapMember.id] ? `${currentMapMember.locationLabel} · Updated ${currentMapMember.lastUpdated}` : 'Location sharing is off'}</span></div>
            <span className="map-status-dot" aria-label={locationSharing[currentMapMember.id] ? 'Location sharing on' : 'Location sharing off'} />
          </div>
          <p className="form-note">Family Map is opt-in. Emergency alerts can still send a one-off current location when someone asks the family for help.</p>
        </div>
        <ToolBottomNav activeTab={activeTab} onNavigate={onNavigate} />
      </section>
    )
  }

  if (mode === 'emergency') return renderEmergency()
  if (mode === 'profile') return renderProfile()
  if (mode === 'notifications') return renderNotifications()
  if (mode === 'settings') return renderSettings()
  return renderMap()
}
