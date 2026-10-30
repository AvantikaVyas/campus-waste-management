
import React, { useEffect, useState } from 'react';
import {
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate
} from 'react-router-dom';
import { api, token } from './api';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup
} from 'react-leaflet';
import {
  LayoutDashboard,
  Map as MapIcon,
  Trash2,
  ClipboardList,
  LogOut,
  Plus,
  RefreshCw,
  Leaf,
  AlertTriangle,
  CheckCircle2,
  Boxes,
  Users,
  GraduationCap,
  ShieldCheck
} from 'lucide-react';

// ==========================================
// PORTAL SELECTION PAGE
// ==========================================

function PortalChoice() {
  return (
    <div className="auth-shell">
      <div className="auth-card portal-choice">
        <div className="brand-mark">
          <Leaf />
        </div>

        <p className="eyebrow">CAMPUS SUSTAINABILITY</p>

        <h1>Welcome to CampusCare</h1>

        <p className="muted">
          Choose your portal to continue.
        </p>

        <div className="portal-options">

          <Link to="/student-login" className="portal-option">
            <div className="portal-icon student-icon">
              <GraduationCap size={27} />
            </div>

            <h3>Student Login</h3>

            <p>
              Report waste issues and track your submissions.
            </p>

            <span>Continue as Student →</span>
          </Link>

          <Link to="/staff-login" className="portal-option">
            <div className="portal-icon staff-icon">
              <ShieldCheck size={27} />
            </div>

            <h3>Staff Login</h3>

            <p>
              Manage campus reports and waste operations.
            </p>

            <span>Continue as Staff →</span>
          </Link>

        </div>

        <p className="tiny muted">
          CampusCare · Keeping our campus clean.
        </p>
      </div>
    </div>
  );
}

// ==========================================
// STUDENT LOGIN AND SIGNUP
// ==========================================

function Auth({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError('');

    try {
      const data = await api(
        mode === 'login'
          ? '/api/v1/auth/login'
          : '/api/v1/auth/register',
        {
          method: 'POST',
          body: JSON.stringify(
            mode === 'login'
              ? { email, password }
              : { name, email, password }
          )
        }
      );

      if (
        (mode === 'register' && data.user.role === 'student') ||
        (mode === 'login' && data.user.role === 'student')
      ) {
        localStorage.setItem('cwm_token', data.access_token);
        onLogin(data.user);
        nav('/');
      } else {
        setError('This is a staff account. Please use Staff Login.');
      }
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">

        <div className="brand-mark">
          <Leaf />
        </div>

        <p className="eyebrow">CAMPUS SUSTAINABILITY</p>

        <h1>
          {mode === 'login' ? 'Welcome back' : 'Create student account'}
        </h1>

        <p className="muted">
          A cleaner campus starts with one report.
        </p>

        <div className="tabs">
          <button
            className={mode === 'login' ? 'active' : ''}
            onClick={() => setMode('login')}
          >
            Login
          </button>

          <button
            className={mode === 'register' ? 'active' : ''}
            onClick={() => setMode('register')}
          >
            Student signup
          </button>
        </div>

        <form onSubmit={submit}>

          {mode === 'register' && (
            <label>
              Full name
              <input
                required
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              minLength="8"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </label>

          {error && <p className="error">{error}</p>}

          <button className="primary full">
            {mode === 'login' ? 'Login' : 'Create account'}
          </button>

        </form>

        <p className="tiny muted">
          Staff accounts are provisioned by the campus administrator.
        </p>

        <p className="tiny">
          <Link to="/login">← Back to portal selection</Link>
        </p>

      </div>
    </div>
  );
}

// ==========================================
// STAFF LOGIN
// ==========================================


function StaffLogin({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError('');

    try {
      const d = await api(
        mode === 'login'
          ? '/api/v1/auth/login'
          : '/api/v1/auth/register-staff',
        {
          method: 'POST',
          body: JSON.stringify(
            mode === 'login'
              ? { email, password }
              : { name, email, password }
          )
        }
      );

      if (d.user.role !== 'staff') {
        throw Error('This account does not have staff access.');
      }

      localStorage.setItem('cwm_token', d.access_token);
      onLogin(d.user);
      nav('/');
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">

        <div className="brand-mark staff-mark">
          <Users />
        </div>

        <p className="eyebrow">OPERATIONS PORTAL</p>

        <h1>
          {mode === 'login' ? 'Staff sign in' : 'Create staff account'}
        </h1>

        <p className="muted">
          Manage campus waste operations.
        </p>

        <div className="tabs">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => {
              setMode('login');
              setError('');
            }}
          >
            Login
          </button>

          <button
            type="button"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => {
              setMode('register');
              setError('');
            }}
          >
            Staff signup
          </button>
        </div>

        <form onSubmit={submit}>

          {mode === 'register' && (
            <label>
              Full name
              <input
                required
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </label>
          )}

          <label>
            Staff email
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              minLength="8"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </label>

          {error && <p className="error">{error}</p>}

          <button className="primary full">
            {mode === 'login'
              ? 'Sign in to staff portal'
              : 'Create staff account'}
          </button>

        </form>

        <p className="tiny">
          <Link to="/login">← Back to portal selection</Link>
        </p>

      </div>
    </div>
  );
}

// ==========================================
// MAIN APP AND ROUTES
// ==========================================

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token()) {
      api('/api/v1/auth/me')
        .then(setUser)
        .catch(() => localStorage.removeItem('cwm_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="loading">Loading campus workspace…</div>;
  }

  return (
    <Routes>

      <Route
        path="/login"
        element={user ? <Navigate to="/" /> : <PortalChoice />}
      />

      <Route
        path="/student-login"
        element={user ? <Navigate to="/" /> : <Auth onLogin={setUser} />}
      />

      <Route
        path="/staff-login"
        element={user ? <Navigate to="/" /> : <StaffLogin onLogin={setUser} />}
      />

      <Route
        path="/*"
        element={
          user
            ? (
              <Dashboard
                user={user}
                onLogout={() => {
                  localStorage.removeItem('cwm_token');
                  setUser(null);
                }}
              />
            )
            : <Navigate to="/login" />
        }
      />

    </Routes>
  );
}

// ==========================================
// DASHBOARD
// ==========================================

function Dashboard({ user, onLogout }) {
  const [page, setPage] = useState('overview');

  const nav = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    {
      id: 'reports',
      label: user.role === 'staff' ? 'Issue queue' : 'My reports',
      icon: ClipboardList
    },
    { id: 'bins', label: 'Dustbins', icon: Trash2 },
    { id: 'map', label: 'Hotspot map', icon: MapIcon }
  ];

  if (user.role === 'staff') {
    nav.push({ id: 'manage', label: 'Manage bins', icon: Boxes });
  }

  return (
    <div className="app-shell">

      <aside className="sidebar">

        <div className="side-brand">
          <div className="brand-mark small">
            <Leaf />
          </div>

          <div>
            <b>CampusCare</b>
            <span>Waste management</span>
          </div>
        </div>

        <div className="side-label">WORKSPACE</div>

        {nav.map(n => (
          <button
            key={n.id}
            onClick={() => setPage(n.id)}
            className={'nav-item ' + (page === n.id ? 'selected' : '')}
          >
            <n.icon size={18} />
            {n.label}
          </button>
        ))}

        <div className="sidebar-bottom">

          <div className="user-chip">
            <div className="avatar">
              {user.name?.[0]?.toUpperCase()}
            </div>

            <div>
              <b>{user.name}</b>
              <span>{user.role}</span>
            </div>
          </div>

          <button className="nav-item" onClick={onLogout}>
            <LogOut size={18} />
            Sign out
          </button>

        </div>
      </aside>

      <main className="main">

        <header className="topbar">
          <div>
            <span className="eyebrow">CAMPUS OPERATIONS</span>
            <h2>{nav.find(n => n.id === page)?.label}</h2>
          </div>

          <div className="top-right">
            <span className="status-dot"></span>
            <span>Live workspace</span>
            <span className="role-pill">{user.role}</span>
          </div>
        </header>

        <section className="content">
          {page === 'overview'
            ? <Overview user={user} setPage={setPage} />
            : page === 'reports'
              ? <Reports user={user} />
              : page === 'bins'
                ? <Bins />
                : page === 'map'
                  ? <HotspotMap />
                  : <ManageBins />}
        </section>

      </main>
    </div>
  );
}

// ==========================================
// STATISTICS CARD
// ==========================================

function Stat({ label, value, sub, icon: Icon, tone = 'green' }) {
  return (
    <div className="stat-card">
      <div className={'stat-icon ' + tone}>
        <Icon size={19} />
      </div>

      <div>
        <span className="muted">{label}</span>
        <strong>{value ?? '—'}</strong>
        <small>{sub}</small>
      </div>
    </div>
  );
}

// ==========================================
// OVERVIEW
// ==========================================

function Overview({ user, setPage }) {
  const [reports, setReports] = useState([]);
  const [bins, setBins] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [locations, setLocations] = useState([]);

  const [issue, setIssue] = useState({
    location_id: '',
    issue_type: 'Overflowing',
    description: '',
    image_url: ''
  });

  const [message, setMessage] = useState('');

  async function load() {
    const [r, b, h, l] = await Promise.all([
      api('/api/v1/reports'),
      api('/api/v1/bins'),
      api('/api/v1/hotspots'),
      api('/api/v1/locations')
    ]);

    setReports(r);
    setBins(b);
    setHotspots(h);
    setLocations(l);

    if (user.role === 'staff') {
      setAnalytics(await api('/api/v1/analytics'));
    }
  }

  useEffect(() => {
    load().catch(e => setMessage(e.message));
  }, []);

  async function submit(e) {
    e.preventDefault();

    try {
      await api('/api/v1/reports', {
        method: 'POST',
        body: JSON.stringify({
          ...issue,
          location_id: Number(issue.location_id),
          bin_id: null,
          waste_type: 'Not specified',
          bin_type: 'Not applicable'
        })
      });

      setMessage('Your report has been submitted. Thank you!');

      setIssue({
        location_id: '',
        issue_type: 'Overflowing',
        description: '',
        image_url: ''
      });

      load();
    } catch (e) {
      setMessage(e.message);
    }
  }

  const count = s => reports.filter(r => r.status === s).length;

  return (
    <>

      <div className="welcome-row">
        <div>
          <h1>
            {user.role === 'staff'
              ? 'Good day, operations team'
              : 'Hello, ' + user.name.split(' ')[0]}
          </h1>

          <p className="muted">
            {user.role === 'staff'
              ? 'Here is the current campus waste overview.'
              : 'Help keep your campus clean by reporting issues you notice.'}
          </p>
        </div>

        <button className="outline" onClick={() => setPage('map')}>
          <MapIcon size={16} /> Explore campus map
        </button>
      </div>

      <div className="stats-grid">

        {user.role === 'staff' ? (
          <>

            <Stat
              label="Total dustbins"
              value={analytics?.total_bins ?? bins.length}
              sub="Registered on campus"
              icon={Trash2}
            />

            <Stat
              label="Overflowing"
              value={analytics?.bin_status?.Overflowing ?? bins.filter(b => b.status === 'Overflowing').length}
              sub="Needs attention"
              icon={AlertTriangle}
              tone="orange"
            />

            <Stat
              label="Open reports"
              value={reports.filter(r => !['Resolved', 'Rejected'].includes(r.status)).length}
              sub="Awaiting action"
              icon={ClipboardList}
              tone="blue"
            />

            <Stat
              label="Resolved reports"
              value={count('Resolved')}
              sub="Completed"
              icon={CheckCircle2}
              tone="purple"
            />

          </>
        ) : (
          <>

            <Stat
              label="My reports"
              value={reports.length}
              sub="Reports submitted"
              icon={ClipboardList}
            />

            <Stat
              label="In progress"
              value={reports.filter(r => ['Assigned', 'In Progress', 'Under Review'].includes(r.status)).length}
              sub="Being handled"
              icon={RefreshCw}
              tone="blue"
            />

            <Stat
              label="Resolved"
              value={count('Resolved')}
              sub="Issues fixed"
              icon={CheckCircle2}
              tone="purple"
            />

            <Stat
              label="Campus bins"
              value={bins.length}
              sub="Registered bins"
              icon={Trash2}
              tone="orange"
            />

          </>
        )}

      </div>

      <div className="dashboard-grid">

        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>
                {user.role === 'staff' ? 'Recent reports' : 'My recent reports'}
              </h3>
              <p className="muted">Latest activity from the campus</p>
            </div>

            <button className="text-button" onClick={() => setPage('reports')}>
              View all →
            </button>
          </div>

          {reports.slice(0, 5).length
            ? reports.slice(0, 5).map(r => (
              <ReportRow key={r.id} r={r} />
            ))
            : <Empty text="No reports yet. Reports will appear here." />}

        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Top hotspots</h3>
              <p className="muted">Locations needing attention</p>
            </div>

            <button className="text-button" onClick={() => setPage('map')}>
              Map →
            </button>
          </div>

          {hotspots.slice(0, 4).map(h => (
            <div className="hotspot-row" key={h.location_id}>
              <div>
                <b>{h.name}</b>
                <small>{h.reports} reports · score {h.score}</small>
              </div>

              <span className={'level ' + h.level.toLowerCase()}>
                {h.level}
              </span>
            </div>
          ))}

        </div>

      </div>

      {user.role === 'student' && (
        <div className="panel report-form-panel">

          <div className="panel-head">
            <div>
              <h3>Report a waste issue</h3>
              <p className="muted">Tell campus staff what needs attention.</p>
            </div>

            <span className="form-tag">QUICK REPORT</span>
          </div>

          <form className="form-grid" onSubmit={submit}>

            <label>
              Campus location
              <select
                required
                value={issue.location_id}
                onChange={e => setIssue({ ...issue, location_id: e.target.value })}
              >
                <option value="">Choose a location</option>

                {locations.map(l => (
                  <option value={l.id} key={l.id}>
                    {l.name}
                  </option>
                ))}

              </select>
            </label>

            <label>
              Problem type
              <select
                value={issue.issue_type}
                onChange={e => setIssue({ ...issue, issue_type: e.target.value })}
              >
                {['Overflowing', 'Damaged', 'Missing', 'Insufficient bins', 'Other'].map(x => (
                  <option key={x} value={x}>{x}</option>
                ))}
              </select>
            </label>

            <label className="span-two">
              Photo URL (optional)
              <input
                placeholder="https://…"
                value={issue.image_url}
                onChange={e => setIssue({ ...issue, image_url: e.target.value })}
              />
            </label>

            <label className="span-two">
              Description
              <textarea
                rows="3"
                placeholder="Add details to help staff locate the issue…"
                value={issue.description}
                onChange={e => setIssue({ ...issue, description: e.target.value })}
              />
            </label>

            <div className="span-two form-actions">
              <button className="primary">
                <Plus size={16} /> Submit report
              </button>

              {message && <span className="muted">{message}</span>}
            </div>

          </form>
        </div>
      )}

      {user.role === 'staff' && message && (
        <p className="error">{message}</p>
      )}

    </>
  );
}

// ==========================================
// REPORT ROW
// ==========================================

function ReportRow({ r }) {
  return (
    <div className="report-row">

      <div className="report-symbol">
        <Trash2 size={17} />
      </div>

      <div className="report-info">
        <b>{r.issue_type} · {r.location_name}</b>
        <small>
          {r.waste_type} · {new Date(r.created_at).toLocaleString()}
        </small>
      </div>

      <span className={'status ' + r.status.toLowerCase().replaceAll(' ', '-')}>
        {r.status}
      </span>

    </div>
  );
}

// ==========================================
// EMPTY STATE
// ==========================================

function Empty({ text }) {
  return (
    <div className="empty">
      <Leaf size={24} />
      <p>{text}</p>
    </div>
  );
}

// ==========================================
// REPORTS
// ==========================================

function Reports({ user }) {
  const [items, setItems] = useState([]);
  const [staff, setStaff] = useState([]);
  const [msg, setMsg] = useState('');

  async function load() {
    setItems(await api('/api/v1/reports'));

    if (user.role === 'staff') {
      setStaff(await api('/api/v1/staff'));
    }
  }

  useEffect(() => {
    load().catch(e => setMsg(e.message));
  }, []);

  async function update(id, patch) {
    try {
      await api('/api/v1/reports/' + id, {
        method: 'PATCH',
        body: JSON.stringify(patch)
      });

      load();
    } catch (e) {
      setMsg(e.message);
    }
  }

  return (
    <div className="panel">

      <div className="panel-head">
        <div>
          <h3>
            {user.role === 'staff' ? 'All campus reports' : 'Your submitted reports'}
          </h3>
          <p className="muted">{items.length} reports</p>
        </div>

        <button className="outline" onClick={() => load()}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {msg && <p className="error">{msg}</p>}

      {items.length === 0
        ? <Empty text="No reports found." />
        : items.map(r => (

          <div className="report-card" key={r.id}>

            <div className="report-card-top">
              <div>
                <b>#{r.id} · {r.issue_type}</b>

                <p className="muted">
                  {r.location_name} · {r.waste_type} · Submitted by {user.role === 'staff' ? r.reporter_name : 'you'}
                </p>
              </div>

              <span className={'status ' + r.status.toLowerCase().replaceAll(' ', '-')}>
                {r.status}
              </span>
            </div>

            {r.description && <p>{r.description}</p>}

            {r.image_url && (
              <a href={r.image_url} target="_blank" rel="noreferrer">
                View attached image
              </a>
            )}

            {r.resolution_note && (
              <p className="resolution">
                Resolution: {r.resolution_note}
              </p>
            )}

            {user.role === 'staff' && (
              <div className="staff-controls">

                <select
                  value={r.status}
                  onChange={e => update(r.id, { status: e.target.value })}
                >
                  {['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <select
                  value={r.assigned_to || ''}
                  onChange={e => update(r.id, {
                    assigned_to: e.target.value ? Number(e.target.value) : null,
                    status: 'Assigned'
                  })}
                >
                  <option value="">Unassigned</option>

                  {staff.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}

                </select>

                <input
                  placeholder="Resolution note"
                  defaultValue={r.resolution_note}
                  id={'note-' + r.id}
                />

                <button
                  className="outline small-btn"
                  onClick={() => update(r.id, {
                    resolution_note: document.getElementById('note-' + r.id).value
                  })}
                >
                  Save note
                </button>

              </div>
            )}

          </div>

        ))}

    </div>
  );
}

// ==========================================
// DUSTBINS
// ==========================================

function Bins() {
  const [bins, setBins] = useState([]);
  const [locs, setLocs] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    Promise.all([
      api('/api/v1/bins'),
      api('/api/v1/locations')
    ])
      .then(([b, l]) => {
        setBins(b);
        setLocs(l);
      })
      .catch(e => setErr(e.message));
  }, []);

  return (
    <div className="panel">

      <div className="panel-head">
        <div>
          <h3>Campus dustbins</h3>
          <p className="muted">
            Browse registered bins and their current condition.
          </p>
        </div>
      </div>

      {err && <p className="error">{err}</p>}

      <div className="table-wrap">
        <table>

          <thead>
            <tr>
              <th>Bin ID</th>
              <th>Location</th>
              <th>Bin type</th>
              <th>Capacity</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {bins.map(b => (
              <tr key={b.id}>
                <td><b>{b.code}</b></td>
                <td>
                  {locs.find(l => l.id === b.location_id)?.name || '—'}
                </td>
                <td>{b.bin_type}</td>
                <td>{b.capacity_litres} L</td>
                <td>
                  <span className={'status ' + b.status.toLowerCase().replaceAll(' ', '-')}>
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>
  );
}

// ==========================================
// MANAGE BINS
// ==========================================

function ManageBins() {
  const [bins, setBins] = useState([]);
  const [locs, setLocs] = useState([]);

  const [form, setForm] = useState({
    code: '',
    location_id: '',
    bin_type: 'Wet / Organic',
    capacity_litres: 50,
    status: 'Functional'
  });

  const [msg, setMsg] = useState('');

  async function load() {
    const [b, l] = await Promise.all([
      api('/api/v1/bins'),
      api('/api/v1/locations')
    ]);

    setBins(b);
    setLocs(l);
  }

  useEffect(() => {
    load().catch(e => setMsg(e.message));
  }, []);

  async function add(e) {
    e.preventDefault();

    try {
      await api('/api/v1/bins', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          location_id: Number(form.location_id),
          capacity_litres: Number(form.capacity_litres)
        })
      });

      setMsg('Dustbin added.');
      setForm({ ...form, code: '' });
      load();
    } catch (e) {
      setMsg(e.message);
    }
  }

  async function status(id, b) {
    try {
      await api('/api/v1/bins/' + id, {
        method: 'PATCH',
        body: JSON.stringify({
          code: b.code,
          location_id: b.location_id,
          bin_type: b.bin_type,
          capacity_litres: b.capacity_litres,
          status: b.status === 'Functional' ? 'Overflowing' : 'Functional',
          notes: b.notes
        })
      });

      load();
    } catch (e) {
      setMsg(e.message);
    }
  }

  return (
    <>

      <div className="panel">

        <div className="panel-head">
          <div>
            <h3>Register a dustbin</h3>
            <p className="muted">
              Add a bin to the campus inventory.
            </p>
          </div>
        </div>

        <form className="form-grid" onSubmit={add}>

          <label>
            Bin code
            <input
              required
              placeholder="BIN-006"
              value={form.code}
              onChange={e => setForm({ ...form, code: e.target.value })}
            />
          </label>

          <label>
            Location
            <select
              required
              value={form.location_id}
              onChange={e => setForm({ ...form, location_id: e.target.value })}
            >
              <option value="">Choose location</option>

              {locs.map(l => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}

            </select>
          </label>

          <label>
            Bin type
            <select
              value={form.bin_type}
              onChange={e => setForm({ ...form, bin_type: e.target.value })}
            >
              {['Wet / Organic', 'Dry / Recyclable', 'General', 'E-waste', 'Hazardous', 'Sanitary'].map(x => (
                <option key={x} value={x}>{x}</option>
              ))}
            </select>
          </label>

          <label>
            Capacity (litres)
            <input
              type="number"
              min="1"
              value={form.capacity_litres}
              onChange={e => setForm({ ...form, capacity_litres: e.target.value })}
            />
          </label>

          <div className="span-two">
            <button className="primary">
              <Plus size={16} /> Add dustbin
            </button>

            {msg && <span className="muted">{msg}</span>}
          </div>

        </form>
      </div>

      <div className="panel">

        <div className="panel-head">
          <h3>Manage inventory</h3>
        </div>

        {bins.map(b => (
          <div className="inventory-row" key={b.id}>

            <div>
              <b>{b.code}</b>
              <small>
                {locs.find(l => l.id === b.location_id)?.name} · {b.bin_type}
              </small>
            </div>

            <span className={'status ' + b.status.toLowerCase().replaceAll(' ', '-')}>
              {b.status}
            </span>

            <button
              className="outline small-btn"
              onClick={() => status(b.id, b)}
            >
              Toggle condition
            </button>

          </div>
        ))}

      </div>

    </>
  );
}

// ==========================================
// HOTSPOT MAP
// ==========================================

function HotspotMap() {
  const [points, setPoints] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    api('/api/v1/hotspots')
      .then(setPoints)
      .catch(e => setErr(e.message));
  }, []);

  const center = points.length
    ? [points[0].latitude, points[0].longitude]
    : [13.0100, 74.7940];

  return (
    <>

      <div className="panel">

        <div className="panel-head">
          <div>
            <h3>Campus hotspot map</h3>
            <p className="muted">
              Report frequency and issue severity by location.
            </p>
          </div>

          <div className="map-legend">
            <span>● High</span>
            <span>● Moderate</span>
            <span>● Low</span>
          </div>
        </div>

        {err && <p className="error">{err}</p>}

        <MapContainer
          center={center}
          zoom={16}
          scrollWheelZoom
          style={{ height: 430, width: '100%', borderRadius: 14 }}
        >

          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {points.map(p => (
            <Marker
              key={p.location_id}
              position={[p.latitude, p.longitude]}
            >
              <Popup>
                <b>{p.name}</b>
                <br />
                {p.reports} reports
                <br />
                Hotspot score: {p.score}
                <br />
                Level: {p.level}
              </Popup>
            </Marker>
          ))}

        </MapContainer>

        <p className="tiny muted map-note">
          Map coordinates in the demo seed data are illustrative.
          Replace them with verified campus coordinates before public launch.
        </p>

      </div>

      <div className="hotspot-grid">

        {points.map(p => (
          <div className="panel hotspot-card" key={p.location_id}>

            <div className="hotspot-row">
              <b>{p.name}</b>
              <span className={'level ' + p.level.toLowerCase()}>
                {p.level}
              </span>
            </div>

            <strong className="score">{p.score}</strong>

            <small className="muted">
              Hotspot score · {p.reports} reports
            </small>

          </div>
        ))}

      </div>

    </>
  );
}

export default App;
