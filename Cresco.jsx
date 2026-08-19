import React, { useState, useEffect, useRef, useMemo, createContext, useContext } from "react";
import {
  LayoutGrid, CalendarDays, BookOpen, ClipboardList, Timer as TimerIcon,
  NotebookPen, User, Shield, Users, ChevronLeft, ChevronRight, Plus,
  Check, X, Play, Pause, RotateCcw, Square, Maximize2, Minimize2,
  Flame, TrendingUp, Lock, Unlock, LogOut, Pencil, Trash2, ArrowLeftRight,
  Eye, EyeOff, ChevronDown, Palette, Sparkles, Cloud, CloudOff
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis
} from "recharts";
import {
  subscribeToUsers,
  saveUserToFirestore,
  deleteUserFromFirestore,
  subscribeToAdmin,
  saveAdminToFirestore,
  isFirebaseReady
} from "./firebase";

/* ============================== DESIGN TOKENS ============================== */
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700&display=swap');

    .cresco * { box-sizing: border-box; }
    .cresco, .cresco.theme-sage {
      --ink: #0F2A1D;
      --deep: #375534;
      --mid: #6B9071;
      --line: #AEC3B0;
      --canvas: #E3EED4;
      --surface: #EFF5E6;
      --surface-2: #DCE8CB;
      --white: #FBFDF8;
    }
    .cresco.theme-ocean {
      --ink: #0A1C2A;
      --deep: #1A3E5C;
      --mid: #3B7EA1;
      --line: #9DC3DC;
      --canvas: #E1EDF5;
      --surface: #EEF6FB;
      --surface-2: #D4E7F3;
      --white: #F9FCFE;
    }
    .cresco.theme-terracotta {
      --ink: #2B160E;
      --deep: #5E2F20;
      --mid: #A85D42;
      --line: #DFB7A4;
      --canvas: #F5EBE4;
      --surface: #FAF4F0;
      --surface-2: #EBDCD3;
      --white: #FDFBF9;
    }
    .cresco.theme-amethyst {
      --ink: #1B1028;
      --deep: #432860;
      --mid: #78539A;
      --line: #C2B0D8;
      --canvas: #EDE8F5;
      --surface: #F5F1FA;
      --surface-2: #DFD5EC;
      --white: #FAF9FD;
    }
    .cresco {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      color: var(--ink);
      background: var(--canvas);
      min-height: 100vh;
      position: relative;
      -webkit-font-smoothing: antialiased;
      transition: background .25s ease, color .25s ease;
    }
    .cresco h1, .cresco h2, .cresco h3 {
      font-family: 'Space Grotesk', sans-serif;
      letter-spacing: -0.015em;
    }
    .cresco .disp {
      font-family: 'Outfit', 'Space Grotesk', sans-serif;
      letter-spacing: -0.03em;
    }
    .cresco ::selection { background: var(--mid); color: var(--white); }
    .cresco button { font-family: inherit; cursor: pointer; }
    .cresco input, .cresco select { font-family: inherit; }
    .cresco::-webkit-scrollbar { width: 8px; height: 8px; }
    .cresco::-webkit-scrollbar-thumb { background: var(--line); border-radius: 8px; }


    .card {
      background: var(--surface);
      border: 1px solid rgba(55,85,52,0.08);
      border-radius: 22px;
      box-shadow: 0 1px 2px rgba(15,42,29,0.04), 0 8px 24px -12px rgba(15,42,29,0.10);
    }
    .card-nested {
      background: var(--surface-2);
      border-radius: 16px;
    }
    .btn-primary {
      background: var(--ink);
      color: var(--canvas);
      border: none;
      border-radius: 999px;
      padding: 11px 20px;
      font-weight: 600;
      font-size: 14px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: transform .15s ease, background .15s ease;
    }
    .btn-primary:active { transform: scale(0.96); }
    .btn-primary:hover { background: var(--deep); }
    .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-ghost {
      background: transparent;
      color: var(--deep);
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 10px 18px;
      font-weight: 600;
      font-size: 14px;
      transition: background .15s ease, transform .15s ease;
    }
    .btn-ghost:hover { background: rgba(107,144,113,0.12); }
    .btn-ghost:active { transform: scale(0.96); }
    .btn-icon {
      width: 36px; height: 36px; border-radius: 999px; border: 1px solid var(--line);
      background: var(--white); display: flex; align-items: center; justify-content: center;
      color: var(--deep); transition: background .15s ease, transform .1s ease;
    }
    .btn-icon:hover { background: var(--surface-2); }
    .btn-icon:active { transform: scale(0.92); }

    .field {
      width: 100%;
      background: var(--white);
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 10px 13px;
      font-size: 14px;
      color: var(--ink);
      outline: none;
      transition: border-color .15s ease, box-shadow .15s ease;
    }
    .field:focus { border-color: var(--mid); box-shadow: 0 0 0 3px rgba(107,144,113,0.18); }
    .label { font-size: 12px; font-weight: 600; color: var(--deep); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; display: block; }

    @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .enter { animation: fadeUp .35s cubic-bezier(.2,.7,.3,1) both; }
    @keyframes popIn { from { opacity:0; transform: scale(.96);} to {opacity:1; transform:scale(1);} }
    .pop { animation: popIn .2s ease both; }

    /* Dock */
    .dock-wrap {
      position: fixed; left: 0; right: 0; bottom: 0; display: flex; justify-content: center;
      padding: 14px env(safe-area-inset-right) calc(14px + env(safe-area-inset-bottom)) env(safe-area-inset-left);
      z-index: 40; pointer-events: none;
    }
    .dock {
      pointer-events: auto;
      display: flex; align-items: center; gap: 4px;
      background: var(--ink);
      padding: 6px; border-radius: 999px;
      box-shadow: 0 14px 40px -12px rgba(15,42,29,0.45), 0 2px 8px rgba(15,42,29,0.2);
      max-width: 96vw; overflow-x: auto;
    }
    .dock::-webkit-scrollbar { display: none; }
    .dock-item {
      display: flex; align-items: center; gap: 7px;
      height: 44px; border-radius: 999px; border: none; background: transparent;
      color: rgba(227,238,212,0.6); padding: 0 14px; white-space: nowrap;
      transition: background .25s cubic-bezier(.2,.7,.3,1), color .2s ease, padding .25s cubic-bezier(.2,.7,.3,1), width .25s ease;
      flex-shrink: 0;
    }
    .dock-item.active { background: var(--mid); color: var(--ink); padding: 0 16px 0 12px; }
    .dock-item span { font-size: 13px; font-weight: 600; max-width: 0; overflow: hidden; opacity: 0; transition: max-width .25s ease, opacity .2s ease; }
    .dock-item.active span { max-width: 120px; opacity: 1; margin-left: 1px; }

    /* Dynamic Island Timer */
    .island-wrap {
      position: fixed; top: 16px; left: 0; right: 0;
      display: flex; justify-content: center;
      z-index: 100; pointer-events: none;
    }
    .island-pill {
      pointer-events: auto;
      background: #000000;
      color: #7AE2FF;
      border-radius: 999px;
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 6px 7px 6px 8px;
      box-shadow: 0 16px 36px -6px rgba(0,0,0,0.65), 0 4px 12px rgba(0,0,0,0.4);
      border: 1.5px solid rgba(255,255,255,0.12);
      cursor: pointer;
      transition: transform .2s cubic-bezier(.2,.8,.3,1), box-shadow .2s ease;
      min-width: 215px;
      user-select: none;
      -webkit-user-select: none;
    }
    .island-pill:hover {
      transform: scale(1.02);
      box-shadow: 0 20px 42px -6px rgba(0,0,0,0.75), 0 6px 16px rgba(0,0,0,0.5);
    }
    .island-pill:active { transform: scale(0.98); }
    .island-time {
      font-family: 'Outfit', 'Space Grotesk', sans-serif;
      font-size: 26px;
      font-weight: 800;
      color: #7AE2FF;
      letter-spacing: -0.02em;
      line-height: 1;
      font-variant-numeric: tabular-nums;
      flex: 1;
      text-align: center;
    }
    .island-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #15242D;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #7AE2FF;
      transition: background .15s ease, transform .12s ease;
      flex-shrink: 0;
    }
    .island-btn:hover {
      background: #1C3340;
      transform: scale(1.08);
    }
    .island-btn:active { transform: scale(0.92); }

    .progress-ring-bg { stroke: var(--surface-2); }
    .bar-track { background: var(--surface-2); border-radius: 999px; overflow: hidden; }
    .bar-fill { background: linear-gradient(90deg, var(--deep), var(--mid)); border-radius: 999px; transition: width .5s cubic-bezier(.2,.8,.3,1); }

    .tag { font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; padding: 3px 9px; border-radius: 999px; }
    .tag-ok { background: rgba(107,144,113,0.22); color: var(--deep); }
    .tag-off { background: rgba(15,42,29,0.06); color: var(--deep); opacity: 0.6; }
    .tag-absent { background: rgba(181,101,79,0.18); color: #8F3A26; }
    .tag-holiday { background: rgba(107,144,113,0.15); color: var(--deep); border: 1px dashed var(--line); }

    /* GitHub activity heat map styling */
    .activity-grid-wrap {
      overflow-x: auto;
      padding-bottom: 2px;
    }
    .activity-grid-wrap::-webkit-scrollbar { height: 4px; }
    .activity-grid-wrap::-webkit-scrollbar-thumb { background: var(--line); border-radius: 4px; }
    .activity-square {
      width: 8px;
      height: 8px;
      border-radius: 1.5px;
      transition: transform .15s ease, box-shadow .15s ease;
      cursor: pointer;
    }
    .activity-square:hover {
      transform: scale(1.4);
      z-index: 10;
      box-shadow: 0 0 0 2px var(--ink);
    }

    .page-title { font-size: 26px; font-weight: 700; margin: 0; }
    .page-sub { font-size: 14px; color: var(--deep); opacity: 0.75; margin-top: 2px; }

    @media (min-width: 900px) {
      .page-title { font-size: 32px; }
    }
  `}</style>
);

/* ============================== HELPERS ============================== */
const pad = (n) => String(n).padStart(2, "0");
const dKey = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const todayKey = () => { const t = new Date(); return dKey(t.getFullYear(), t.getMonth(), t.getDate()); };
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const fmtTime = (totalSec) => {
  const h = Math.floor(totalSec / 3600), m = Math.floor((totalSec % 3600) / 60), s = Math.floor(totalSec % 60);
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};
const uid = () => Math.random().toString(36).slice(2, 10);

function computeAttendanceStats(attendance, year, month) {
  const days = new Date(year, month + 1, 0).getDate();
  let present = 0, absent = 0, holiday = 0, marked = 0;
  for (let d = 1; d <= days; d++) {
    const key = dKey(year, month, d);
    const dow = new Date(year, month, d).getDay();
    const status = attendance[key] || (dow === 0 ? "holiday" : null);
    if (status === "present") { present++; marked++; }
    else if (status === "absent") { absent++; marked++; }
    else if (status === "holiday") { holiday++; }
  }
  const trackable = present + absent;
  const pct = trackable > 0 ? Math.round((present / trackable) * 100) : null;
  return { present, absent, holiday, pct, days };
}

function computeStreak(studyLogs) {
  const dates = Object.keys(studyLogs).filter(k => studyLogs[k] > 0).sort();
  if (dates.length === 0) return 0;
  const dateSet = new Set(dates);
  let cursor = new Date();
  // allow streak to start counting from today or yesterday
  let cursorKey = dKey(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());
  if (!dateSet.has(cursorKey)) {
    cursor.setDate(cursor.getDate() - 1);
    cursorKey = dKey(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());
    if (!dateSet.has(cursorKey)) return 0;
  }
  let streak = 0;
  while (dateSet.has(dKey(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/* ============================== AUTH & USER ACCOUNTS ============================== */
const DEFAULT_ADMIN = {
  uid: "admin_root",
  role: "admin",
  password: import.meta.env.VITE_ADMIN_PASSWORD || "admin1234",
  profile: {
    name: "System Administrator",
    email: import.meta.env.VITE_ADMIN_EMAIL || "admin@cresco.com",
    username: import.meta.env.VITE_ADMIN_USERNAME || "admin@cresco.com",
    phone: ""
  }
};

function seedUser(overrides = {}) {
  return {
    uid: uid(),
    role: "user",
    password: "password123",
    sharing: false,
    consentAt: null,
    profile: { name: "", email: "", phone: "", username: "" },
    targets: [],
    subjects: [],
    tests: [],
    attendance: {},
    focusSessions: [],
    studyLogs: {},
    ...overrides,
  };
}

/* ============================== APP CONTEXT ============================== */
const AppCtx = createContext(null);
const useApp = () => useContext(AppCtx);

/* ============================== ROOT ============================== */
export default function CrescoApp() {
  const [users, setUsersState] = useState(() => {
    try {
      const saved = localStorage.getItem("cresco_users_data");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Exclude old mock demo users if any exist in storage
        const realUsers = parsed.filter(u => !u.uid?.startsWith("user_"));
        return realUsers;
      }
      return [];
    } catch (e) {
      return [];
    }
  });

  const [adminAccount, setAdminAccountState] = useState(() => {
    try {
      const saved = localStorage.getItem("cresco_admin_data");
      return saved ? JSON.parse(saved) : DEFAULT_ADMIN;
    } catch (e) {
      return DEFAULT_ADMIN;
    }
  });

  function updateAdmin(updater) {
    setAdminAccountState(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      try {
        localStorage.setItem("cresco_admin_data", JSON.stringify(next));
      } catch (e) {}
      saveAdminToFirestore(next);
      return next;
    });
  }

  // Real-time Firestore synchronization
  useEffect(() => {
    const unsubUsers = subscribeToUsers((firestoreUsers) => {
      if (firestoreUsers && firestoreUsers.length > 0) {
        setUsersState(firestoreUsers);
        try {
          localStorage.setItem("cresco_users_data", JSON.stringify(firestoreUsers));
        } catch (e) {}
      }
    });

    const unsubAdmin = subscribeToAdmin((firestoreAdmin) => {
      if (firestoreAdmin) {
        setAdminAccountState(firestoreAdmin);
        try {
          localStorage.setItem("cresco_admin_data", JSON.stringify(firestoreAdmin));
        } catch (e) {}
      }
    });

    return () => {
      if (unsubUsers) unsubUsers();
      if (unsubAdmin) unsubAdmin();
    };
  }, []);

  const [session, setSessionState] = useState(() => {
    try {
      const saved = localStorage.getItem("cresco_session");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [page, setPageState] = useState(() => {
    try {
      const saved = localStorage.getItem("cresco_active_page");
      return saved || "dashboard";
    } catch (e) {
      return "dashboard";
    }
  });

  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem("cresco_theme") || "sage";
    } catch (e) {
      return "sage";
    }
  });

  function setTheme(t) {
    setThemeState(t);
    try {
      localStorage.setItem("cresco_theme", t);
    } catch (e) {}
  }

  // global timer state — survives navigation
  const [timer, setTimer] = useState({
    mode: "stopwatch", // 'stopwatch' | 'timer'
    running: false,
    elapsed: 0,       // seconds counted (stopwatch: up, timer: consumed)
    durationSec: 25 * 60,
    startedAt: null,
  });
  const intervalRef = useRef(null);

  useEffect(() => {
    if (timer.running) {
      intervalRef.current = setInterval(() => {
        setTimer(t => {
          if (!t.running) return t;
          if (t.mode === "timer" && t.elapsed >= t.durationSec - 1) {
            clearInterval(intervalRef.current);
            return { ...t, elapsed: t.durationSec, running: false };
          }
          return { ...t, elapsed: t.elapsed + 1 };
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [timer.running]);

  const currentUser = useMemo(() => {
    if (!session || session.role !== "user") return null;
    const match = users.find(u => u.uid === session.uid);
    return match || users[0] || null;
  }, [session, users]);

  function setSession(sess) {
    setSessionState(sess);
    try {
      if (sess) {
        localStorage.setItem("cresco_session", JSON.stringify(sess));
      } else {
        localStorage.removeItem("cresco_session");
        localStorage.removeItem("cresco_active_page");
      }
    } catch (e) { }
  }

  function setPage(p) {
    setPageState(p);
    try {
      localStorage.setItem("cresco_active_page", p);
    } catch (e) { }
  }

  function setUsers(valOrFn) {
    setUsersState(prev => {
      const next = typeof valOrFn === "function" ? valOrFn(prev) : valOrFn;
      try {
        localStorage.setItem("cresco_users_data", JSON.stringify(next));
      } catch (e) { }
      return next;
    });
  }

  function updateUser(uidVal, updater) {
    setUsers(prev => prev.map(u => {
      if (u.uid === uidVal) {
        const updated = updater(u);
        saveUserToFirestore(updated);
        return updated;
      }
      return u;
    }));
  }

  function logSession(durSec, mode) {
    if (!currentUser || durSec < 1) return;
    const today = todayKey();
    const studyHours = Math.round((durSec / 3600) * 10) / 10;
    const existingHrs = currentUser.studyLogs[today] || 0;
    const hrsToAdd = studyHours > 0 ? studyHours : (durSec >= 60 ? 0.1 : 0);
    const newHrs = Math.round((existingHrs + hrsToAdd) * 10) / 10;

    updateUser(currentUser.uid, u => ({
      ...u,
      focusSessions: [{ id: uid(), date: today, durationSec: durSec, mode }, ...u.focusSessions],
      studyLogs: hrsToAdd > 0 ? { ...u.studyLogs, [today]: newHrs } : u.studyLogs,
    }));

    setTimer(t => ({ ...t, running: false, elapsed: 0, startedAt: null }));
  }

  function resetTimer() {
    setTimer(t => ({ ...t, running: false, elapsed: 0, startedAt: null }));
  }

  const ctxValue = {
    users, setUsers, updateUser,
    adminAccount, updateAdmin,
    session, setSession,
    page, setPage,
    currentUser,
    timer, setTimer, resetTimer, logSession,
    theme, setTheme,
  };

  if (!session) {
    return (
      <div className={`cresco theme-${theme}`}>
        <GlobalStyle />
        <LoginScreenInner users={users} adminAccount={adminAccount} onLogin={setSession} />
      </div>
    );
  }

  return (
    <AppCtx.Provider value={ctxValue}>
      <div className={`cresco theme-${theme}`}>
        <GlobalStyle />
        {session.role === "user" && page !== "focus" && timer.elapsed > 0 && <TimerIsland />}
        <Shell />
      </div>
    </AppCtx.Provider>
  );
}

/* ============================== SAPLING LOGO ============================== */
function CrescoLogo({ size = 36, style = {}, className = "", variant = "badge" }) {
  if (variant === "raw") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "inline-block", verticalAlign: "middle", ...style }}
        className={className}
      >
        <defs>
          <linearGradient id="saplingRaw1" x1="10" y1="8" x2="22" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#86BA77" />
            <stop offset="100%" stopColor="#375534" />
          </linearGradient>
          <linearGradient id="saplingRaw2" x1="26" y1="12" x2="18" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#AEC3B0" />
            <stop offset="100%" stopColor="#6B9071" />
          </linearGradient>
        </defs>
        {/* Mound / Ground base */}
        <path d="M8 29 C 14 27.5, 22 27.5, 28 29" stroke="var(--ink)" strokeWidth="2.4" strokeLinecap="round" opacity="0.3" />
        {/* Main Growing Stem */}
        <path d="M18 28 C 18 21.5, 17.2 16, 16 10.5" stroke="var(--ink)" strokeWidth="2.6" strokeLinecap="round" />
        {/* Left Leaf */}
        <path d="M16.8 18 C 9.5 18, 6.5 12.5, 9.5 8 C 14 6, 16.8 12.5, 16.8 18 Z" fill="url(#saplingRaw1)" />
        {/* Right Leaf */}
        <path d="M17.2 14.5 C 23.5 13, 28 17, 26.5 21.5 C 22 23.5, 18 19, 17.2 14.5 Z" fill="url(#saplingRaw2)" />
        {/* Top growth tip */}
        <circle cx="16" cy="9" r="1.6" fill="#86BA77" />
      </svg>
    );
  }

  // Default: badge container with dark ink background and vibrant sapling
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: Math.round(size * 0.32),
      background: "var(--ink)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 8px 24px -4px rgba(15,42,29,0.35)",
      flexShrink: 0,
      ...style
    }} className={className}>
      <svg
        width={Math.round(size * 0.65)}
        height={Math.round(size * 0.65)}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="saplingBadge1" x1="10" y1="8" x2="22" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A4D694" />
            <stop offset="100%" stopColor="#6B9071" />
          </linearGradient>
          <linearGradient id="saplingBadge2" x1="26" y1="12" x2="18" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E3EED4" />
            <stop offset="100%" stopColor="#AEC3B0" />
          </linearGradient>
        </defs>
        {/* Mound / Ground base */}
        <path d="M8 29 C 14 27.5, 22 27.5, 28 29" stroke="var(--canvas)" strokeWidth="2.4" strokeLinecap="round" opacity="0.35" />
        {/* Main Growing Stem */}
        <path d="M18 28 C 18 21.5, 17.2 16, 16 10.5" stroke="var(--canvas)" strokeWidth="2.6" strokeLinecap="round" />
        {/* Left Leaf */}
        <path d="M16.8 18 C 9.5 18, 6.5 12.5, 9.5 8 C 14 6, 16.8 12.5, 16.8 18 Z" fill="url(#saplingBadge1)" />
        {/* Right Leaf */}
        <path d="M17.2 14.5 C 23.5 13, 28 17, 26.5 21.5 C 22 23.5, 18 19, 17.2 14.5 Z" fill="url(#saplingBadge2)" />
        {/* Top growth tip */}
        <circle cx="16" cy="9" r="1.6" fill="#FFFFFF" />
      </svg>
    </div>
  );
}

/* ============================== LOGIN ============================== */
function LoginScreenInner({ users, adminAccount, onLogin }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function handleLogin(e) {
    if (e) e.preventDefault();
    setError("");
    const trimmedId = identifier.trim().toLowerCase();
    const trimmedPw = password.trim();

    if (!trimmedId || !trimmedPw) {
      setError("Please enter both username/email and password.");
      return;
    }

    // 1. Check Admin Account
    const adminEmail = (adminAccount?.profile?.email || "admin@cresco.com").toLowerCase();
    const adminUsername = (adminAccount?.profile?.username || "admin@cresco.com").toLowerCase();
    const adminPass = adminAccount?.password || "admin1234";

    if ((trimmedId === adminEmail || trimmedId === adminUsername || trimmedId === "admin") && trimmedPw === adminPass) {
      onLogin({ role: "admin", uid: adminAccount?.uid || "admin_root" });
      return;
    }

    // 2. Check Student Accounts
    const matched = (users || []).find(u => {
      const uEmail = (u.profile?.email || "").toLowerCase();
      const uUsername = (u.profile?.username || "").toLowerCase();
      const uPass = u.password || "password123";
      return (trimmedId === uEmail || trimmedId === uUsername) && trimmedPw === uPass;
    });

    if (matched) {
      onLogin({ role: "user", uid: matched.uid });
      return;
    }

    setError("Invalid email/username or password. Please try again.");
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
      background: "radial-gradient(ellipse at top, rgba(174,195,176,0.35) 0%, var(--canvas) 70%)",
      position: "relative",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 920,
        display: "grid",
        gridTemplateColumns: "1.05fr 1.1fr",
        borderRadius: 28,
        overflow: "hidden",
        boxShadow: "0 24px 60px -12px rgba(15,42,29,0.18), 0 4px 16px rgba(15,42,29,0.06)",
        border: "1px solid rgba(55,85,52,0.14)",
        background: "var(--surface)",
      }}>

        {/* LEFT PANEL: BRAND & VALUE PROPOSITION */}
        <div style={{
          background: "var(--ink)",
          color: "var(--canvas)",
          padding: "42px 38px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Subtle background glow */}
          <div style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(107,144,113,0.3) 0%, transparent 70%)",
            pointerEvents: "none"
          }} />

          <div>
            {/* Sapling Logo Emblem */}
            <div style={{ marginBottom: 24 }}>
              <CrescoLogo size={58} style={{ background: "var(--mid)", boxShadow: "0 10px 28px rgba(107,144,113,0.4)" }} />
            </div>

            <h1 className="disp" style={{ fontSize: 34, fontWeight: 900, margin: "0 0 8px", color: "var(--canvas)", lineHeight: 1.15, letterSpacing: "-0.03em" }}>
              Cresco
            </h1>
            <p style={{ margin: "0 0 28px", color: "rgba(227,238,212,0.75)", fontSize: 14.5, lineHeight: 1.5 }}>
              A calm, focused academic progress and study companion engineered for high-performance students.
            </p>

            {/* Feature Badges */}
            <div style={{ display: "grid", gap: 12 }}>
              {[
                { icon: CalendarDays, text: "Interactive daily attendance & target tracking" },
                { icon: TimerIcon, text: "Distraction-free focus stopwatch & timers" },
                { icon: ClipboardList, text: "Curriculum mastery & mock test analytics" },
                { icon: Shield, text: "Unified role authentication & private data storage" },
              ].map((feat, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "rgba(227,238,212,0.85)" }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: "rgba(255,255,255,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0
                  }}>
                    <feat.icon size={15} style={{ color: "var(--mid)" }} />
                  </div>
                  <span>{feat.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: UNIFIED LOGIN FORM */}
        <div style={{
          padding: "42px 40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "var(--white)",
        }}>
          <div>
            <div style={{ marginBottom: 28 }}>
              <span className="label" style={{ marginBottom: 4, color: "var(--mid)" }}>Welcome Back</span>
              <h2 className="disp" style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Sign in to Cresco</h2>
              <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--deep)", opacity: 0.7 }}>
                Enter your credentials to access your dashboard.
              </p>
            </div>

            <form onSubmit={handleLogin} style={{ display: "grid", gap: 16 }}>
              {error && (
                <div style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  fontSize: 12.5,
                  fontWeight: 600,
                  background: "rgba(181,101,79,0.14)",
                  color: "#8F3A26",
                  border: "1px solid rgba(181,101,79,0.25)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}>
                  <X size={15} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <span className="label" style={{ marginBottom: 6, display: "block" }}>Email or Username</span>
                <input
                  className="field"
                  type="text"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder="e.g. admin@cresco.com or username"
                  autoFocus
                  style={{ width: "100%", fontSize: 13.5 }}
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span className="label" style={{ marginBottom: 0 }}>Password</span>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    className="field"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    style={{ paddingRight: 40, width: "100%", fontSize: 13.5 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    style={{
                      position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", color: "var(--deep)", opacity: 0.55,
                      cursor: "pointer", display: "flex", alignItems: "center", padding: 4
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: 14, marginTop: 8 }}
              >
                Sign In &rarr;
              </button>
            </form>
          </div>

          {/* Discreet Footer Note */}
          <div style={{
            marginTop: 24,
            paddingTop: 16,
            borderTop: "1px solid var(--surface-2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 11.5,
            color: "var(--deep)",
            opacity: 0.6
          }}>
            <span>🔒 Secure encrypted session</span>
            <span>Cresco Workspace</span>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ============================== SHELL / NAV ============================== */
const USER_NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { id: "attendance", label: "Attendance", icon: CalendarDays },
  { id: "academic", label: "Academic", icon: BookOpen },
  { id: "tests", label: "Tests", icon: ClipboardList },
  { id: "focus", label: "Focus", icon: TimerIcon },
  { id: "studylog", label: "Study Log", icon: NotebookPen },
  { id: "profile", label: "Profile", icon: User },
];
const ADMIN_NAV = [
  { id: "admin-dashboard", label: "Overview", icon: LayoutGrid },
  { id: "admin-users", label: "Users", icon: Users },
  { id: "admin-compare", label: "Compare", icon: ArrowLeftRight },
];

function Shell() {
  const { session, setSession, page, setPage } = useApp();
  const nav = session.role === "admin" ? ADMIN_NAV : USER_NAV;
  const activePage = nav.find(n => n.id === page) ? page : nav[0].id;

  useEffect(() => { setPage(nav[0].id); /* eslint-disable-next-line */ }, [session.role]);

  return (
    <>
      <div style={{ padding: "10px 20px 100px" }}>
        <div key={activePage} className="enter">
          <PageRouter page={activePage} />
        </div>
      </div>
      <div className="dock-wrap">
        <nav className="dock">
          {nav.map(item => {
            const Icon = item.icon;
            const active = item.id === activePage;
            return (
              <button key={item.id} className={`dock-item${active ? " active" : ""}`} onClick={() => setPage(item.id)}>
                <Icon size={19} strokeWidth={2.2} />
                <span>{item.label}</span>
              </button>
            );
          })}
          <button className="dock-item" onClick={() => setSession(null)} title="Log out">
            <LogOut size={19} strokeWidth={2.2} />
          </button>
        </nav>
      </div>
    </>
  );
}

function TopBar() {
  const { session, currentUser } = useApp();
  const label = session.role === "admin" ? "Admin" : (currentUser?.profile.name || "Cresco");
  const sub = session.role === "admin" ? "Cresco administration" : `@${currentUser?.profile.username || "user"}`;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 11, background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ color: "var(--canvas)", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 16 }}>C</span>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.1 }}>{label}</div>
          <div style={{ fontSize: 12, color: "var(--deep)", opacity: 0.65 }}>{sub}</div>
        </div>
      </div>
      {session.role === "admin" && (
        <span className="tag" style={{ background: "var(--ink)", color: "var(--canvas)" }}>
          <Shield size={11} style={{ verticalAlign: -2, marginRight: 4 }} />ADMIN
        </span>
      )}
    </div>
  );
}

function PageRouter({ page }) {
  switch (page) {
    case "dashboard": return <DashboardPage />;
    case "attendance": return <AttendancePage />;
    case "academic": return <AcademicPage />;
    case "tests": return <TestsPage />;
    case "focus": return <FocusPage />;
    case "studylog": return <StudyLogPage />;
    case "profile": return <ProfilePage />;
    case "admin-dashboard": return <AdminDashboardPage />;
    case "admin-users": return <AdminUsersPage />;
    case "admin-compare": return <AdminComparePage />;
    default: return null;
  }
}

/* ============================== DYNAMIC ISLAND TIMER ============================== */
function MascotTimerIcon({ size = 38, pct = 65, running = true }) {
  const r = 16;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(Math.max(pct, 0), 100) / 100) * c;

  return (
    <div style={{
      width: size,
      height: size,
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0
    }}>
      <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Stopwatch Top Crown Buttons */}
        <rect x="20" y="1.5" width="4" height="2.5" rx="1.2" fill="#1C3845" />
        <rect x="18" y="0.5" width="8" height="1.8" rx="0.9" fill="#7AE2FF" />
        <rect x="32.5" y="4.5" width="3.5" height="2" rx="1" transform="rotate(35 32.5 4.5)" fill="#7AE2FF" />

        {/* Outer Dark Ring Track */}
        <circle cx="22" cy="24" r={r} stroke="#1A3B4A" strokeWidth="3" />

        {/* Outer Progress Arc */}
        <circle
          cx="22" cy="24" r={r}
          stroke="#7AE2FF"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform="rotate(-90 22 24)"
          style={{ transition: "stroke-dashoffset 0.4s ease" }}
        />

        {/* Face Inner Cyan Circle */}
        <circle cx="22" cy="24" r="13.8" fill="#7AE2FF" />

        {/* Stopwatch Clock Hand / Slanted Eyebrow */}
        <path d="M22 23.5 L28.5 20" stroke="#0B1A24" strokeWidth="2.4" strokeLinecap="round" />

        {/* Left Eye (Sparkle Cartoon Eye) */}
        <ellipse cx="16" cy="23.5" rx="2.5" ry="3" fill="#0B1A24" />
        <circle cx="15.2" cy="22.3" r="1" fill="#FFFFFF" />
        <circle cx="16.8" cy="24.5" r="0.5" fill="#FFFFFF" />

        {/* Right Eye (Sparkle Cartoon Eye) */}
        <ellipse cx="27" cy="24.5" rx="2.5" ry="3" fill="#0B1A24" />
        <circle cx="26.2" cy="23.3" r="1" fill="#FFFFFF" />
        <circle cx="27.8" cy="25.5" r="0.5" fill="#FFFFFF" />

        {/* Cute Blushing Cheeks */}
        <ellipse cx="13" cy="26" rx="1.8" ry="1.2" fill="#FF79C6" opacity="0.65" />
        <ellipse cx="30" cy="27" rx="1.8" ry="1.2" fill="#FF79C6" opacity="0.65" />

        {/* Cute Smile */}
        <path d="M20 26.5 Q22 28.8 24 26.5" stroke="#0B1A24" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
}

function TimerIsland() {
  const { timer, setTimer, setPage } = useApp();
  const display = timer.mode === "timer" ? Math.max(timer.durationSec - timer.elapsed, 0) : timer.elapsed;
  const pct = timer.mode === "timer"
    ? Math.round(((timer.durationSec - timer.elapsed) / timer.durationSec) * 100)
    : Math.round((timer.elapsed % 3600) / 36);

  // Format mm:ss (e.g. 5:24) matching the screenshot
  const formatIslandTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="island-wrap">
      <div
        className="island-pill"
        onClick={() => setPage("focus")}
        title="Click to open Focus Workspace"
      >
        {/* Left Mascot Icon with animated progress arc */}
        <MascotTimerIcon size={38} pct={pct} running={timer.running} />

        {/* Center Digital Countdown */}
        <div className="island-time">
          {formatIslandTime(display)}
        </div>

        {/* Right Play/Pause Button */}
        <button
          className="island-btn"
          onClick={(e) => {
            e.stopPropagation();
            setTimer(t => ({ ...t, running: !t.running }));
          }}
          title={timer.running ? "Pause timer" : "Resume timer"}
        >
          {timer.running ? (
            <svg width="14" height="15" viewBox="0 0 14 15" fill="none">
              <rect x="2.5" y="1" width="3.2" height="13" rx="1.6" fill="#7AE2FF" />
              <rect x="8.3" y="1" width="3.2" height="13" rx="1.6" fill="#7AE2FF" />
            </svg>
          ) : (
            <svg width="14" height="15" viewBox="0 0 14 15" fill="none">
              <path d="M3 2 L12 7.5 L3 13 Z" fill="#7AE2FF" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

/* ============================== DASHBOARD CARDS ============================== */
function RingProgress({ pct, size = 64, stroke = 7, color = "var(--mid)" }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(Math.max(pct, 0), 100) / 100) * c;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--surface-2)" strokeWidth={stroke} fill="none" />
      <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
        strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset .6s cubic-bezier(.2,.8,.3,1)" }} />
    </svg>
  );
}

function GitHubActivityCard({ user, onUpdateLogs }) {
  const [viewMode, setViewMode] = useState("6month"); // '6month' | 'month'
  const [selectedMonthOffset, setSelectedMonthOffset] = useState(0);
  const [activeCell, setActiveCell] = useState(null);
  const [quickInput, setQuickInput] = useState("");

  const scrollRef = useRef(null);
  const studyLogs = user.studyLogs || {};

  // Jan 1 to Dec 31 calendar year timeline
  const calendarYearData = useMemo(() => {
    const today = new Date();
    const curYear = today.getFullYear();
    const curMonth = today.getMonth();

    const jan1 = new Date(curYear, 0, 1);
    const jan1Dow = (jan1.getDay() + 6) % 7; // Mon=0 .. Sun=6
    const startDate = new Date(jan1);
    startDate.setDate(jan1.getDate() - jan1Dow);

    const dec31 = new Date(curYear, 11, 31);
    const dec31Dow = (dec31.getDay() + 6) % 7;
    const endDate = new Date(dec31);
    endDate.setDate(dec31.getDate() + (6 - dec31Dow));

    const columns = [];
    let cursor = new Date(startDate);
    let ongoingWeekIndex = 0;
    let foundOngoing = false;
    let colIdx = 0;

    while (cursor <= endDate) {
      const col = [];
      for (let r = 0; r < 7; r++) {
        const key = dKey(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());
        const hrs = studyLogs[key] || 0;
        const isCurMonth = cursor.getFullYear() === curYear && cursor.getMonth() === curMonth;
        if (isCurMonth && !foundOngoing) {
          ongoingWeekIndex = colIdx;
          foundOngoing = true;
        }
        col.push({
          key,
          hrs,
          date: new Date(cursor),
          year: cursor.getFullYear(),
          monthIdx: cursor.getMonth(),
          dayNum: cursor.getDate(),
          isCurrentYear: cursor.getFullYear() === curYear
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      columns.push(col);
      colIdx++;
    }
    return { columns, ongoingWeekIndex, curYear };
  }, [studyLogs]);

  // Auto scroll to ongoing month on mount if needed
  useEffect(() => {
    if (scrollRef.current && calendarYearData.ongoingWeekIndex > 0) {
      const targetScroll = Math.max(0, (calendarYearData.ongoingWeekIndex * 15) - 80);
      scrollRef.current.scrollLeft = targetScroll;
    }
  }, [calendarYearData.ongoingWeekIndex]);

  // Month label headers from Jan to Dec
  const monthHeaderLabels = useMemo(() => {
    const map = {};
    let lastLabeledMonth = -1;
    (calendarYearData.columns || []).forEach((col, wIdx) => {
      // Find the first day in this column that belongs to the current year
      const targetDay = col && col.find(d => d && d.isCurrentYear);
      if (targetDay) {
        const m = targetDay.monthIdx;
        if (m !== lastLabeledMonth && targetDay.dayNum <= 7) {
          map[wIdx] = MONTH_NAMES[m].slice(0, 3);
          lastLabeledMonth = m;
        }
      }
    });
    return map;
  }, [calendarYearData]);

  // Single month view calculation
  const now = new Date();
  const year = now.getFullYear();
  const monthIdx = now.getMonth() + selectedMonthOffset;
  const targetDate = new Date(year, monthIdx, 1);
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth();

  const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const firstDayDow = (new Date(targetYear, targetMonth, 1).getDay() + 6) % 7;

  const monthCells = useMemo(() => {
    const arr = [];
    for (let i = 0; i < firstDayDow; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const key = dKey(targetYear, targetMonth, d);
      const hrs = studyLogs[key] || 0;
      arr.push({ day: d, key, hrs, date: new Date(targetYear, targetMonth, d) });
    }
    return arr;
  }, [targetYear, targetMonth, daysInMonth, firstDayDow, studyLogs]);

  const monthWeeks = useMemo(() => {
    const weeksCount = Math.ceil(monthCells.length / 7);
    const cols = [];
    for (let w = 0; w < weeksCount; w++) {
      const col = [];
      for (let r = 0; r < 7; r++) col.push(monthCells[w * 7 + r] || null);
      cols.push(col);
    }
    return cols;
  }, [monthCells]);

  const monthTotal = useMemo(() => {
    let sum = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const key = dKey(targetYear, targetMonth, d);
      sum += studyLogs[key] || 0;
    }
    return Math.round(sum * 10) / 10;
  }, [targetYear, targetMonth, daysInMonth, studyLogs]);

  const activeDaysCount = useMemo(() => {
    let count = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const key = dKey(targetYear, targetMonth, d);
      if ((studyLogs[key] || 0) > 0) count++;
    }
    return count;
  }, [targetYear, targetMonth, daysInMonth, studyLogs]);

  const peakDay = useMemo(() => {
    let maxKey = null;
    let maxHrs = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const key = dKey(targetYear, targetMonth, d);
      const hrs = studyLogs[key] || 0;
      if (hrs > maxHrs) { maxHrs = hrs; maxKey = key; }
    }
    return maxHrs > 0 ? { dateKey: maxKey, hrs: maxHrs } : null;
  }, [targetYear, targetMonth, daysInMonth, studyLogs]);

  const streak = useMemo(() => computeStreak(studyLogs), [studyLogs]);

  function getLevelColor(hrs) {
    if (!hrs || hrs <= 0) return "var(--surface-2)";
    if (hrs <= 1.5) return "#AEC3B0";
    if (hrs <= 3.5) return "#6B9071";
    if (hrs <= 5.5) return "#375534";
    return "#0F2A1D";
  }

  function getLevelBorder(hrs) {
    if (!hrs || hrs <= 0) return "1px solid rgba(55,85,52,0.1)";
    if (hrs > 5.5) return "1px solid var(--ink)";
    return "1px solid transparent";
  }

  const dowLabels = ["Mon", "", "Wed", "", "Fri", "", "Sun"];

  function handleSaveCellHours() {
    if (!activeCell) return;
    const val = parseFloat(quickInput);
    const updated = { ...studyLogs };
    if (isNaN(val) || val <= 0) {
      delete updated[activeCell.key];
    } else {
      updated[activeCell.key] = val;
    }
    onUpdateLogs(updated);
    setActiveCell(null);
    setQuickInput("");
  }

  return (
    <div className="card enter" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Card Header & Controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h2 style={{ margin: 0, fontSize: 16 }}>Study Activity Map</h2>
            <span className="tag tag-ok" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Flame size={12} style={{ color: "#E05A47" }} /> {streak} day streak
            </span>
          </div>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--deep)", opacity: 0.75 }}>
            {viewMode === "6month" ? "Full Year Activity Timeline · Click any square to log hours" : `${MONTH_NAMES[targetMonth]} ${targetYear} · ${monthTotal} hrs total`}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", background: "var(--surface-2)", padding: 3, borderRadius: 999 }}>
            <button
              onClick={() => setViewMode("6month")}
              style={{
                border: "none", borderRadius: 999, padding: "5px 12px", fontWeight: 700, fontSize: 11.5,
                background: viewMode === "6month" ? "var(--ink)" : "transparent",
                color: viewMode === "6month" ? "var(--canvas)" : "var(--deep)",
                transition: "all .15s ease", cursor: "pointer"
              }}
            >
              52-Week View
            </button>
            <button
              onClick={() => setViewMode("month")}
              style={{
                border: "none", borderRadius: 999, padding: "5px 12px", fontWeight: 700, fontSize: 11.5,
                background: viewMode === "month" ? "var(--ink)" : "transparent",
                color: viewMode === "month" ? "var(--canvas)" : "var(--deep)",
                transition: "all .15s ease", cursor: "pointer"
              }}
            >
              Month View
            </button>
          </div>

          {viewMode === "month" && (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button className="btn-icon" style={{ width: 28, height: 28 }} onClick={() => setSelectedMonthOffset(o => o - 1)}>
                <ChevronLeft size={14} />
              </button>
              <button className="btn-icon" style={{ width: 28, height: 28 }} disabled={selectedMonthOffset >= 0} onClick={() => setSelectedMonthOffset(o => o + 1)}>
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* VIEW MODE 1: FULL CALENDAR YEAR GRAPH */}
      {viewMode === "6month" ? (
        <div style={{ background: "var(--white)", padding: "14px 16px", borderRadius: 14, border: "1px solid var(--line)", overflow: "hidden" }}>
          <div ref={scrollRef} style={{ overflowX: "auto", scrollBehavior: "smooth", paddingBottom: 4 }}>
            <div style={{ minWidth: 700 }}>
              {/* Synchronized Jan-Dec Month Headers Row */}
              <div style={{ display: "flex", gap: 3, marginLeft: 28, marginBottom: 6, height: 14 }}>
                {(calendarYearData.columns || []).map((col, colIdx) => (
                  <div key={colIdx} style={{ flex: 1, minWidth: 10, position: "relative" }}>
                    {monthHeaderLabels[colIdx] && (
                      <span style={{ position: "absolute", left: 0, top: 0, fontSize: 10, fontWeight: 700, color: "var(--deep)", opacity: 0.85, whiteSpace: "nowrap" }}>
                        {monthHeaderLabels[colIdx]}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Activity Grid (Mon..Sun rows x Jan-Dec week columns) */}
              <div style={{ display: "flex", gap: 6, alignItems: "stretch" }}>
                <div style={{ display: "grid", gridTemplateRows: "repeat(7, 11px)", gap: 3, fontSize: 9, color: "var(--deep)", opacity: 0.65, fontWeight: 600, textAlign: "right" }}>
                  {dowLabels.map((lbl, idx) => (
                    <span key={idx} style={{ height: 11, lineHeight: "11px", width: 22 }}>{lbl}</span>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 3, flex: 1 }}>
                  {(calendarYearData.columns || []).map((col, colIdx) => (
                    <div key={colIdx} style={{ display: "grid", gridTemplateRows: "repeat(7, 11px)", gap: 3, flex: 1, minWidth: 10 }}>
                      {(col || []).map((item, rowIdx) => {
                        if (!item) return <div key={rowIdx} style={{ height: 11 }} />;
                        const isToday = item.key === todayKey();
                        return (
                          <div
                            key={item.key || rowIdx}
                            className="activity-square"
                            title={`${item.date?.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}: ${item.hrs ? `${item.hrs} hrs studied` : "No study logged"}`}
                            onClick={() => {
                              setActiveCell(item);
                              setQuickInput(item.hrs ? String(item.hrs) : "");
                            }}
                            style={{
                              height: 11,
                              borderRadius: 2.5,
                              background: getLevelColor(item.hrs),
                              border: isToday ? "1.5px solid var(--ink)" : getLevelBorder(item.hrs),
                              opacity: item.isCurrentYear ? 1 : 0.25,
                              cursor: "pointer",
                              transition: "transform .1s ease, filter .1s ease",
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.2)"}
                            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, paddingTop: 8, borderTop: "1px solid var(--surface-2)", fontSize: 11, color: "var(--deep)" }}>
            <span style={{ opacity: 0.7 }}>Click any square to record or adjust hours</span>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ opacity: 0.6, fontSize: 10 }}>0 hrs</span>
              {[0, 1.5, 3.5, 5.5, 7].map((lvl, idx) => (
                <span key={idx} style={{
                  width: 10, height: 10, borderRadius: 2.5, background: getLevelColor(lvl),
                  border: getLevelBorder(lvl), display: "inline-block"
                }} />
              ))}
              <span style={{ opacity: 0.6, fontSize: 10 }}>6+ hrs</span>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW MODE 2: MONTH VIEW + STATS SIDEBAR */
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 16, background: "var(--white)", padding: "14px 16px", borderRadius: 14, border: "1px solid var(--line)" }}>
          {/* Left: Month matrix */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--deep)", marginBottom: 8 }}>
              {MONTH_NAMES[targetMonth]} Calendar Matrix
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ display: "grid", gridTemplateRows: "repeat(7, 13px)", gap: 3.5, fontSize: 9.5, color: "var(--deep)", opacity: 0.65, fontWeight: 600, textAlign: "right" }}>
                {dowLabels.map((lbl, idx) => (
                  <span key={idx} style={{ height: 13, lineHeight: "13px", width: 24 }}>{lbl}</span>
                ))}
              </div>

              <div style={{ display: "flex", gap: 3.5 }}>
                {(monthWeeks || []).map((col, colIdx) => (
                  <div key={colIdx} style={{ display: "grid", gridTemplateRows: "repeat(7, 13px)", gap: 3.5 }}>
                    {(col || []).map((item, rowIdx) => {
                      if (!item) return <div key={`empty-${colIdx}-${rowIdx}`} style={{ width: 13, height: 13 }} />;
                      const isToday = item.key === todayKey();
                      return (
                        <div
                          key={item.key || `cell-${colIdx}-${rowIdx}`}
                          className="activity-square"
                          title={`${item.date?.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: ${item.hrs ? `${item.hrs} hrs` : "No study"}`}
                          onClick={() => {
                            setActiveCell(item);
                            setQuickInput(item.hrs ? String(item.hrs) : "");
                          }}
                          style={{
                            width: 13,
                            height: 13,
                            borderRadius: 3,
                            background: getLevelColor(item.hrs),
                            border: isToday ? "1.5px solid var(--ink)" : getLevelBorder(item.hrs),
                            cursor: "pointer",
                            transition: "transform .1s ease",
                          }}
                          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.2)"}
                          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Monthly Analytics Sidebar */}
          <div style={{ background: "var(--surface-2)", padding: "12px 16px", borderRadius: 12, display: "grid", gap: 8, fontSize: 12, alignContent: "start" }}>
            <div style={{ fontWeight: 700, fontSize: 11, textTransform: "uppercase", color: "var(--deep)", opacity: 0.7, letterSpacing: "0.04em" }}>Month Insights</div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ opacity: 0.8 }}>Total Logged:</span>
              <strong style={{ color: "var(--ink)", fontSize: 13 }}>{monthTotal} hrs</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ opacity: 0.8 }}>Active Days:</span>
              <strong style={{ color: "var(--ink)" }}>{activeDaysCount} / {daysInMonth} d</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ opacity: 0.8 }}>Daily Average:</span>
              <strong style={{ color: "var(--ink)" }}>{activeDaysCount ? (monthTotal / activeDaysCount).toFixed(1) : "0"} h/d</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ opacity: 0.8 }}>Peak Day:</span>
              <strong style={{ color: "var(--ink)" }}>{peakDay ? `${peakDay.hrs}h` : "—"}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ opacity: 0.8 }}>Consistency:</span>
              <strong style={{ color: "var(--ink)" }}>{Math.round((activeDaysCount / daysInMonth) * 100)}%</strong>
            </div>
          </div>
        </div>
      )}

      {activeCell && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,42,29,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 70, padding: 16 }} onClick={() => setActiveCell(null)}>
          <div className="card pop" style={{ padding: 18, width: "100%", maxWidth: 320, background: "var(--white)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <h3 style={{ margin: 0, fontSize: 14 }}>{activeCell.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</h3>
              <button className="btn-icon" style={{ width: 26, height: 26 }} onClick={() => setActiveCell(null)}><X size={13} /></button>
            </div>
            <label className="label">Hours studied</label>
            <input type="number" step="0.5" min="0" max="24" className="field" placeholder="e.g. 3.5" value={quickInput} onChange={e => setQuickInput(e.target.value)} autoFocus style={{ marginBottom: 12 }} />
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn-primary" style={{ flex: 1, justifyContent: "center", padding: "7px 12px", fontSize: 12.5 }} onClick={handleSaveCellHours}>Save</button>
              {activeCell.hrs > 0 && (
                <button className="btn-ghost" style={{ padding: "7px 10px", fontSize: 12.5, color: "#8F3A26" }} onClick={() => { setQuickInput(""); handleSaveCellHours(); }}>Clear</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QuickStudyLogCard({ user, onUpdateLogs }) {
  const today = todayKey();
  const currentTodayHrs = user.studyLogs[today] || 0;

  function addHours(delta) {
    const next = Math.max(0, Math.round((currentTodayHrs + delta) * 10) / 10);
    onUpdateLogs({ ...user.studyLogs, [today]: next });
  }

  return (
    <div className="card enter" style={{ padding: 18, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span className="label" style={{ marginBottom: 2 }}>Quick Log</span>
          <div style={{ fontSize: 13, color: "var(--deep)", opacity: 0.8 }}>Log today's study hours</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="disp" style={{ fontSize: 20, fontWeight: 700 }}>{currentTodayHrs} <span style={{ fontSize: 12, fontWeight: 500 }}>hrs today</span></div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {[0.5, 1, 2, 3].map(h => (
          <button key={h} className="btn-ghost" style={{ padding: "6px 10px", fontSize: 12, flex: 1 }} onClick={() => addHours(h)}>
            +{h}h
          </button>
        ))}
        {currentTodayHrs > 0 && (
          <button className="btn-ghost" style={{ padding: "6px 8px", fontSize: 12, color: "#8F3A26" }} onClick={() => addHours(-currentTodayHrs)}>
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

function TestPerformanceCard({ user, onNavigate }) {
  const tests = user.tests || [];
  const validTests = tests.filter(t => t.percentile != null);
  const latestTest = validTests[0] || tests[0];

  const avgPercentile = validTests.length
    ? +(validTests.reduce((a, b) => a + b.percentile, 0) / validTests.length).toFixed(1)
    : null;

  return (
    <div className="card enter" style={{ padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <span className="label" style={{ marginBottom: 2 }}>Test Performance</span>
          <h2 style={{ margin: 0, fontSize: 16 }}>Recent Results</h2>
        </div>
        <button className="btn-ghost" style={{ padding: "5px 11px", fontSize: 12 }} onClick={() => onNavigate("tests")}>View All</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div className="card-nested" style={{ padding: 12 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", color: "var(--deep)", opacity: 0.65 }}>Avg Percentile</div>
          <div className="disp" style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>{avgPercentile != null ? `${avgPercentile}%` : "—"}</div>
        </div>
        <div className="card-nested" style={{ padding: 12 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", color: "var(--deep)", opacity: 0.65 }}>Latest Score</div>
          <div className="disp" style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>
            {latestTest?.percentile != null ? `${latestTest.percentile}%` : latestTest?.marks != null ? `${latestTest.marks} mks` : "—"}
          </div>
        </div>
      </div>

      {latestTest && (
        <div style={{ marginTop: 10, fontSize: 12, color: "var(--deep)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Latest: <strong>{latestTest.name}</strong></span>
          {latestTest.rank && <span className="tag tag-ok">Rank #{latestTest.rank}</span>}
        </div>
      )}
    </div>
  );
}

function SubjectBreakdownCard({ user, onNavigate }) {
  const subjects = user.subjects || [];

  return (
    <div className="card enter" style={{ padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <span className="label" style={{ marginBottom: 2 }}>Subject Mastery</span>
          <h2 style={{ margin: 0, fontSize: 16 }}>Curriculum Status</h2>
        </div>
        <button className="btn-ghost" style={{ padding: "5px 11px", fontSize: 12 }} onClick={() => onNavigate("academic")}>Manage</button>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {subjects.map(s => {
          const totalCh = s.chapters.length;
          const avgProgress = totalCh ? Math.round(s.chapters.reduce((a, c) => a + c.progress, 0) / totalCh) : 0;
          return (
            <div key={s.id} className="card-nested" style={{ padding: "10px 12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, fontSize: 12.5 }}>
                <span style={{ fontWeight: 600 }}>{s.name}</span>
                <span style={{ fontWeight: 700 }}>{avgProgress}%</span>
              </div>
              <div className="bar-track" style={{ height: 6 }}>
                <div className="bar-fill" style={{ width: `${avgProgress}%`, height: "100%" }} />
              </div>
            </div>
          );
        })}
        {subjects.length === 0 && <p style={{ fontSize: 13, opacity: 0.7, margin: 0 }}>No subjects configured yet.</p>}
      </div>
    </div>
  );
}

function WeeklyAnalyticsCard({ user }) {
  const studyLogs = user.studyLogs || {};
  const focusSessions = user.focusSessions || [];

  const days = useMemo(() => {
    const result = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = dKey(d.getFullYear(), d.getMonth(), d.getDate());
      const label = DOW[d.getDay()];

      const studyHrs = studyLogs[key] || 0;
      const focusSec = focusSessions.filter(s => s.date === key).reduce((a, s) => a + s.durationSec, 0);
      const focusHrs = Math.round((focusSec / 3600) * 10) / 10;

      result.push({ name: label, Study: studyHrs, Focus: focusHrs });
    }
    return result;
  }, [studyLogs, focusSessions]);

  return (
    <div className="card enter" style={{ padding: 18, display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
      <div>
        <span className="label" style={{ marginBottom: 2 }}>Weekly Comparison</span>
        <h2 style={{ margin: "0 0 12px", fontSize: 16 }}>Study vs Focus Timer (Hours)</h2>
      </div>
      <div style={{ flex: 1, minHeight: 160, display: "flex", alignItems: "center" }}>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={days}>
            <CartesianGrid stroke="var(--surface-2)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#375534" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#375534" }} axisLine={false} tickLine={false} width={24} />
            <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #AEC3B0", fontSize: 12 }} />
            <Bar dataKey="Study" fill="#375534" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Focus" fill="#6B9071" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function DashboardPage() {
  const { currentUser, updateUser, setPage, setTimer, timer } = useApp();
  if (!currentUser) return null;
  const u = currentUser;
  const today = todayKey();
  const todayStatus = u.attendance[today] || (new Date().getDay() === 0 ? "holiday" : null);

  const streak = useMemo(() => computeStreak(u.studyLogs), [u.studyLogs]);

  const currentChapter = useMemo(() => {
    let best = null;
    u.subjects.forEach(s => s.chapters.forEach(c => {
      if (c.progress < 100 && (!best || c.lastTouched < best.chapter.lastTouched)) best = { subject: s, chapter: c };
    }));
    return best;
  }, [u.subjects]);

  function markToday(status) {
    updateUser(u.uid, usr => ({ ...usr, attendance: { ...usr.attendance, [today]: status } }));
  }

  function handleUpdateLogs(newLogs) {
    updateUser(u.uid, usr => ({ ...usr, studyLogs: newLogs }));
  }

  function updateChapterProgress(subjectId, chapterId, newProgress) {
    const clamped = Math.max(0, Math.min(100, newProgress));
    updateUser(u.uid, usr => ({
      ...usr,
      subjects: usr.subjects.map(s => s.id === subjectId ? {
        ...s,
        chapters: s.chapters.map(c => c.id === chapterId ? { ...c, progress: clamped } : c)
      } : s)
    }));
  }

  function startFocus() {
    setTimer(t => ({ ...t, running: true }));
    setPage("focus");
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* Header Greeting, Date Pill & Live Streak Pill */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <CrescoLogo size={36} variant="badge" />
          <h1 className="page-title" style={{ margin: 0 }}>Hi {u.profile.name.split(" ")[0] || "there"} 👋</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--white)", color: "var(--ink)", padding: "7px 14px", borderRadius: 999, fontWeight: 600, fontSize: 12.5, border: "1px solid var(--line)" }}>
            <CalendarDays size={14} style={{ color: "var(--deep)" }} />
            <span>{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--ink)", color: "var(--canvas)", padding: "7px 14px", borderRadius: 999, fontWeight: 700, fontSize: 13 }}>
            <Flame size={15} style={{ color: "#E05A47" }} />
            <span>{streak} Day Streak</span>
          </div>
        </div>
      </div>

      {/* 1. PRIMARY OPERATIONAL ROW: Attendance + Focus Launch */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="label" style={{ marginBottom: 0 }}>Today's attendance</span>
            {todayStatus && (
              <span className={`tag ${todayStatus === "present" ? "tag-ok" : todayStatus === "absent" ? "tag-absent" : "tag-holiday"}`}>
                {todayStatus}
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button
              className={todayStatus === "present" ? "btn-primary" : "btn-ghost"}
              style={{ padding: "7px 12px", fontSize: 12.5 }}
              onClick={() => markToday("present")}
            >
              <Check size={13} style={{ marginRight: 3 }} /> Present
            </button>
            <button
              className={todayStatus === "absent" ? "btn-primary" : "btn-ghost"}
              style={{ padding: "7px 12px", fontSize: 12.5 }}
              onClick={() => markToday("absent")}
            >
              <X size={13} style={{ marginRight: 3 }} /> Absent
            </button>
            <button
              className={todayStatus === "holiday" ? "btn-primary" : "btn-ghost"}
              style={{ padding: "7px 12px", fontSize: 12.5 }}
              onClick={() => markToday("holiday")}
            >
              <CalendarDays size={13} style={{ marginRight: 3 }} /> Holiday
            </button>
          </div>
        </div>

        <div className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10, background: "var(--ink)", color: "var(--canvas)" }}>
          <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.06em" }}>Focus session</span>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="disp" style={{ fontSize: 20, fontWeight: 700 }}>{timer.running ? "In progress" : "Start a session"}</span>
            <button className="btn-icon" style={{ background: "var(--mid)", border: "none", color: "var(--ink)" }} onClick={startFocus}>
              <Play size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE TODAY ROW: Currently Studying Chapter & Quick Study Logger */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 12 }}>
        <div className="card enter" style={{ padding: 18, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span className="label" style={{ marginBottom: 0 }}>Currently studying</span>
            <button className="btn-ghost" style={{ padding: "4px 10px", fontSize: 11.5 }} onClick={() => setPage("academic")}>Academic</button>
          </div>
          {currentChapter ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontSize: 12, color: "var(--deep)", opacity: 0.75 }}>{currentChapter.subject.name}</div>
                <div className="disp" style={{ fontSize: 19, fontWeight: 700 }}>{currentChapter.chapter.name}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div className="bar-track" style={{ width: 100, height: 7 }}>
                  <div className="bar-fill" style={{ width: `${currentChapter.chapter.progress}%`, height: "100%" }} />
                </div>
                <span className="disp" style={{ fontWeight: 700, fontSize: 15 }}>{currentChapter.chapter.progress}%</span>
                <button
                  className="btn-ghost"
                  style={{ padding: "4px 9px", fontSize: 11.5, fontWeight: 700 }}
                  onClick={() => updateChapterProgress(currentChapter.subject.id, currentChapter.chapter.id, currentChapter.chapter.progress + 10)}
                  title="Increment 10%"
                >
                  +10%
                </button>
              </div>
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: 13, color: "var(--deep)", opacity: 0.7 }}>No active chapters yet.</p>
          )}
        </div>

        <QuickStudyLogCard user={u} onUpdateLogs={handleUpdateLogs} />
      </div>

      {/* 3. GOAL & ACADEMIC PERFORMANCE ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <TestPerformanceCard user={u} onNavigate={setPage} />
        <SubjectBreakdownCard user={u} onNavigate={setPage} />
      </div>

      {/* 4. TARGET PROGRESS */}
      <div className="card enter" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 17 }}>Target progress</h2>
          <button className="btn-ghost" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => setPage("profile")}>Manage</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14 }}>
          {u.targets.map(t => {
            const pct = Math.min(100, Math.round((t.current / t.goal) * 100));
            return (
              <div key={t.id} className="card-nested" style={{ padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ position: "relative", width: 64, height: 64, flexShrink: 0 }}>
                  <RingProgress pct={pct} />
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>{pct}%</div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5, lineHeight: 1.25 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: "var(--deep)", opacity: 0.7 }}>{t.current}{t.unit} of {t.goal}{t.unit}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. HISTORICAL ANALYTICS & ACTIVITY LOGS (Side-by-Side: Equal Height Activity Map & Weekly Chart) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 12, alignItems: "stretch" }}>
        <GitHubActivityCard user={u} onUpdateLogs={handleUpdateLogs} />
        <WeeklyAnalyticsCard user={u} />
      </div>
    </div>
  );
}

/* ============================== ATTENDANCE ============================== */
function AttendancePage() {
  const { currentUser, updateUser } = useApp();
  const u = currentUser;
  const [cursor, setCursor] = useState(() => { const t = new Date(); return { y: t.getFullYear(), m: t.getMonth() }; });
  const [targetInput, setTargetInput] = useState("");
  const [popover, setPopover] = useState(null); // { day, x, y }
  const longPressTimer = useRef(null);
  const monthKey = `${cursor.y}-${pad(cursor.m + 1)}`;
  const target = u.attendance[`target-${monthKey}`];

  const stats = useMemo(() => computeAttendanceStats(u.attendance, cursor.y, cursor.m), [u.attendance, cursor]);
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const firstDow = new Date(cursor.y, cursor.m, 1).getDay();

  function setDay(d, status) {
    const cellDate = new Date(cursor.y, cursor.m, d);
    cellDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (cellDate > today) return; // Disallow future dates

    const key = dKey(cursor.y, cursor.m, d);
    updateUser(u.uid, usr => ({ ...usr, attendance: { ...usr.attendance, [key]: status } }));
    setPopover(null);
  }

  function clearDay(d) {
    const key = dKey(cursor.y, cursor.m, d);
    updateUser(u.uid, usr => {
      const att = { ...usr.attendance };
      delete att[key];
      return { ...usr, attendance: att };
    });
    setPopover(null);
  }

  function saveTarget() {
    const val = parseInt(targetInput, 10);
    if (!val) return;
    updateUser(u.uid, usr => ({ ...usr, attendance: { ...usr.attendance, [`target-${monthKey}`]: val } }));
    setTargetInput("");
  }

  function handleLongPressStart(e, d) {
    e.preventDefault();
    const cellDate = new Date(cursor.y, cursor.m, d);
    cellDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (cellDate > today) return; // Future dates cannot be long-pressed

    const rect = e.currentTarget.getBoundingClientRect();
    longPressTimer.current = setTimeout(() => {
      setPopover({ day: d, x: rect.left + rect.width / 2, y: rect.top });
    }, 400);
  }

  function handleLongPressEnd() {
    clearTimeout(longPressTimer.current);
  }

  useEffect(() => () => clearTimeout(longPressTimer.current), []);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {/* Popover overlay */}
      {popover && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50 }}
          onMouseDown={() => setPopover(null)}
          onTouchStart={() => setPopover(null)}
        >
          <div
            onMouseDown={e => e.stopPropagation()}
            onTouchStart={e => e.stopPropagation()}
            style={{
              position: "fixed",
              left: Math.min(popover.x - 96, window.innerWidth - 200),
              top: Math.max(10, popover.y - 160),
              width: 192,
              background: "var(--ink)",
              borderRadius: 16,
              padding: 8,
              boxShadow: "0 16px 40px -8px rgba(15,42,29,0.45), 0 4px 12px rgba(15,42,29,0.2)",
              display: "flex",
              flexDirection: "column",
              gap: 4,
              zIndex: 51,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(227,238,212,0.45)", textAlign: "center", padding: "4px 0 8px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {MONTH_NAMES[cursor.m].slice(0,3)} {popover.day}
            </div>
            {[
              { status: "present", label: "Present", emoji: "✓", color: "#6B9071" },
              { status: "absent",  label: "Absent",  emoji: "✗", color: "#B5654F" },
              { status: "holiday", label: "Holiday", emoji: "◇", color: "#AEC3B0" },
            ].map(opt => (
              <button key={opt.status} onMouseDown={() => setDay(popover.day, opt.status)}
                style={{
                  background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 10,
                  padding: "9px 14px", color: "var(--canvas)", fontWeight: 600, fontSize: 13,
                  display: "flex", alignItems: "center", gap: 10, cursor: "pointer", textAlign: "left",
                  transition: "background .15s ease",
                }}
                onMouseEnter={e => e.currentTarget.style.background = opt.color + "44"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
              >
                <span style={{ width: 22, height: 22, borderRadius: 6, background: opt.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>{opt.emoji}</span>
                {opt.label}
              </button>
            ))}
            <button onMouseDown={() => clearDay(popover.day)}
              style={{
                background: "transparent", border: "none", borderRadius: 10, padding: "7px 14px",
                color: "rgba(227,238,212,0.35)", fontWeight: 600, fontSize: 12, cursor: "pointer", textAlign: "center",
              }}
              onMouseEnter={e => e.currentTarget.style.color = "rgba(227,238,212,0.7)"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(227,238,212,0.35)"}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Calendar card */}
      <div className="card" style={{ padding: "16px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <button className="btn-icon" style={{ width: 32, height: 32 }}
            onClick={() => setCursor(c => { const m = c.m - 1; return m < 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m }; })}>
            <ChevronLeft size={15} />
          </button>
          <span className="disp" style={{ fontWeight: 700, fontSize: 16 }}>{MONTH_NAMES[cursor.m]} {cursor.y}</span>
          <button className="btn-icon" style={{ width: 32, height: 32 }}
            onClick={() => setCursor(c => { const m = c.m + 1; return m > 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m }; })}>
            <ChevronRight size={15} />
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 6 }}>
          {DOW.map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: 10.5, fontWeight: 700, color: "var(--deep)", opacity: 0.45, padding: "2px 0" }}>{d}</div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {Array.from({ length: firstDow }).map((_, i) => <div key={"e" + i} style={{ height: "calc(max(40px, (100vh - 360px) / 6))" }} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d = i + 1;
            const key = dKey(cursor.y, cursor.m, d);
            const dow = new Date(cursor.y, cursor.m, d).getDay();
            const cellDate = new Date(cursor.y, cursor.m, d);
            cellDate.setHours(0, 0, 0, 0);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isFuture = cellDate > today;
            const status = u.attendance[key] || (dow === 0 ? "holiday" : null);
            const isToday = key === todayKey();
            const isWeekend = dow === 0 || dow === 6;

            return (
              <button key={d}
                disabled={isFuture}
                onMouseDown={isFuture ? undefined : e => handleLongPressStart(e, d)}
                onMouseUp={isFuture ? undefined : handleLongPressEnd}
                onTouchStart={isFuture ? undefined : e => handleLongPressStart(e, d)}
                onTouchEnd={isFuture ? undefined : handleLongPressEnd}
                title={isFuture ? "Future date (cannot be marked)" : "Hold to mark attendance"}
                style={{
                  height: "calc(max(40px, (100vh - 360px) / 6))", borderRadius: 9,
                  border: isToday ? "2px solid var(--ink)" : isFuture ? "1px dashed rgba(55,85,52,0.12)" : "1.5px solid transparent",
                  background: isFuture
                    ? "transparent"
                    : status === "present"
                    ? "#6B9071"
                    : status === "absent"
                    ? "#B5654F"
                    : status === "holiday"
                    ? "var(--surface-2)"
                    : isWeekend
                    ? "rgba(174,195,176,0.2)"
                    : "var(--surface-2)",
                  color: isFuture
                    ? "rgba(55,85,52,0.3)"
                    : status === "present" || status === "absent"
                    ? "var(--white)"
                    : isWeekend
                    ? "var(--mid)"
                    : "var(--ink)",
                  fontWeight: isToday ? 700 : isFuture ? 400 : 500,
                  fontSize: 13,
                  cursor: isFuture ? "not-allowed" : "pointer",
                  opacity: isFuture ? 0.45 : 1,
                  transition: "opacity .12s ease",
                  userSelect: "none", WebkitUserSelect: "none",
                }}
                onMouseEnter={e => { if (!isFuture) e.currentTarget.style.opacity = "0.75"; }}
                onMouseLeave={e => { if (!isFuture) e.currentTarget.style.opacity = "1"; handleLongPressEnd(); }}
              >
                {d}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 11, color: "var(--deep)", opacity: 0.65, alignItems: "center" }}>
          {[{ label: "Present", color: "#6B9071" }, { label: "Absent", color: "#B5654F" }, { label: "Holiday", color: "var(--surface-2)", border: "1px solid var(--line)" }].map(l => (
            <span key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 3, background: l.color, border: l.border, flexShrink: 0 }} />
              {l.label}
            </span>
          ))}
          <span style={{ marginLeft: "auto", fontSize: 10, opacity: 0.7 }}>Hold past date to mark · Future dates locked</span>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {[
          { label: "Present",    value: stats.present,                                color: "#6B9071" },
          { label: "Absent",     value: stats.absent,                                 color: "#B5654F" },
          { label: "Holidays",   value: stats.holiday,                                color: "var(--mid)" },
          { label: "Attendance", value: stats.pct === null ? "—" : `${stats.pct}%`,  color: stats.pct !== null && stats.pct >= 75 ? "#6B9071" : stats.pct !== null ? "#B5654F" : "var(--mid)" },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--deep)", opacity: 0.6, marginBottom: 4 }}>{s.label}</div>
            <div className="disp" style={{ fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Monthly target */}
      <div className="card" style={{ padding: "14px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: target ? 10 : 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--deep)", opacity: 0.7 }}>Monthly target</span>
          {target && (
            <button style={{ fontSize: 11, background: "none", border: "none", color: "var(--deep)", opacity: 0.45, cursor: "pointer", padding: 0 }}
              onClick={() => updateUser(u.uid, usr => { const att = { ...usr.attendance }; delete att[`target-${monthKey}`]; return { ...usr, attendance: att }; })}>
              Change
            </button>
          )}
        </div>
        {target ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 8, fontWeight: 600 }}>
              <span>{stats.present} of {target} days</span>
              <span style={{ color: stats.present >= target ? "#6B9071" : "var(--deep)" }}>{Math.min(100, Math.round((stats.present / target) * 100))}%</span>
            </div>
            <div className="bar-track" style={{ height: 8 }}>
              <div className="bar-fill" style={{ width: `${Math.min(100, (stats.present / target) * 100)}%`, height: "100%" }} />
            </div>
          </>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <input className="field" placeholder="e.g. 22" value={targetInput} onChange={e => setTargetInput(e.target.value)}
              type="number" style={{ fontSize: 13, padding: "7px 10px" }} onKeyDown={e => e.key === "Enter" && saveTarget()} />
            <button className="btn-primary" onClick={saveTarget} style={{ padding: "7px 16px", fontSize: 13 }}>Set target</button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="card-nested" style={{ padding: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--deep)", opacity: 0.65, marginBottom: 4 }}>{label}</div>
      <div className="disp" style={{ fontSize: 24, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

/* ============================== ACADEMIC PROGRESS ============================== */
function AcademicPage() {
  const { currentUser, updateUser } = useApp();
  const u = currentUser;
  const [newSubject, setNewSubject] = useState("");
  const [openSubjects, setOpenSubjects] = useState(() => new Set(u.subjects.map(s => s.id)));
  const [addingChapterFor, setAddingChapterFor] = useState(null);
  const [newChapterName, setNewChapterName] = useState("");
  const [editingSubject, setEditingSubject] = useState(null);

  function toggleOpen(id) {
    setOpenSubjects(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function addSubject() {
    if (!newSubject.trim()) return;
    updateUser(u.uid, usr => ({ ...usr, subjects: [...usr.subjects, { id: uid(), name: newSubject.trim(), chapters: [] }] }));
    setNewSubject("");
  }
  function deleteSubject(sid) {
    updateUser(u.uid, usr => ({ ...usr, subjects: usr.subjects.filter(s => s.id !== sid) }));
  }
  function renameSubject(sid, name) {
    updateUser(u.uid, usr => ({ ...usr, subjects: usr.subjects.map(s => s.id === sid ? { ...s, name } : s) }));
  }
  function addChapter(sid) {
    if (!newChapterName.trim()) return;
    updateUser(u.uid, usr => ({ ...usr, subjects: usr.subjects.map(s => s.id === sid ? { ...s, chapters: [...s.chapters, { id: uid(), name: newChapterName.trim(), progress: 0, lastTouched: 0 }] } : s) }));
    setNewChapterName(""); setAddingChapterFor(null);
  }
  function deleteChapter(sid, cid) {
    updateUser(u.uid, usr => ({ ...usr, subjects: usr.subjects.map(s => s.id === sid ? { ...s, chapters: s.chapters.filter(c => c.id !== cid) } : s) }));
  }
  function setChapterProgress(sid, cid, val) {
    const clamped = Math.max(0, Math.min(100, val));
    updateUser(u.uid, usr => ({ ...usr, subjects: usr.subjects.map(s => s.id === sid ? { ...s, chapters: s.chapters.map(c => c.id === cid ? { ...c, progress: clamped, lastTouched: 0 } : c) } : s) }));
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="card" style={{ padding: 16, display: "flex", gap: 8 }}>
        <input className="field" placeholder="Add a subject (e.g. Chemistry)" value={newSubject}
          onChange={e => setNewSubject(e.target.value)} onKeyDown={e => e.key === "Enter" && addSubject()} />
        <button className="btn-primary" onClick={addSubject}><Plus size={16} />Subject</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, alignItems: "start" }}>
        {u.subjects.map(s => {
          const avg = s.chapters.length ? Math.round(s.chapters.reduce((a, c) => a + c.progress, 0) / s.chapters.length) : 0;
          const done = s.chapters.filter(c => c.progress === 100).length;
          return (
            <div key={s.id} className="card enter" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Subject header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {editingSubject === s.id ? (
                    <input className="field" style={{ width: "100%", fontSize: 15 }} defaultValue={s.name} autoFocus
                      onBlur={e => { renameSubject(s.id, e.target.value || s.name); setEditingSubject(null); }}
                      onKeyDown={e => e.key === "Enter" && e.target.blur()} />
                  ) : (
                    <h2 style={{ margin: "0 0 4px", fontSize: 16, lineHeight: 1.2 }}>{s.name}</h2>
                  )}
                  <div style={{ fontSize: 11.5, color: "var(--deep)", opacity: 0.65 }}>
                    {done}/{s.chapters.length} chapters done
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, marginLeft: 10, flexShrink: 0 }}>
                  <div style={{ position: "relative", width: 48, height: 48 }}>
                    <RingProgress pct={avg} size={48} stroke={5} />
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11 }}>{avg}%</div>
                  </div>
                </div>
              </div>

              {/* Overall progress bar */}
              <div>
                <div className="bar-track" style={{ height: 5 }}>
                  <div className="bar-fill" style={{ width: `${avg}%`, height: "100%" }} />
                </div>
              </div>

              {/* Chapters */}
              <div style={{ display: "grid", gap: 8 }}>
                {s.chapters.map(c => (
                  <div key={c.id} className="card-nested" style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 13, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 8, flexShrink: 0 }}>
                        <input type="number" className="field"
                          style={{ width: 52, padding: "3px 6px", textAlign: "center", fontSize: 12 }}
                          value={c.progress}
                          onChange={e => setChapterProgress(s.id, c.id, parseInt(e.target.value || 0, 10))} />
                        <span style={{ fontSize: 11, opacity: 0.6 }}>%</span>
                        <button className="btn-icon" style={{ width: 24, height: 24 }} onClick={() => deleteChapter(s.id, c.id)}><Trash2 size={11} /></button>
                      </div>
                    </div>
                    <input type="range" min={0} max={100} value={c.progress}
                      onChange={e => setChapterProgress(s.id, c.id, parseInt(e.target.value, 10))}
                      style={{ width: "100%", accentColor: "var(--mid)" }} />
                  </div>
                ))}
                {s.chapters.length === 0 && (
                  <div style={{ fontSize: 12.5, color: "var(--deep)", opacity: 0.5, textAlign: "center", padding: "8px 0" }}>No chapters yet</div>
                )}
              </div>

              {/* Add chapter / actions */}
              <div style={{ marginTop: "auto" }}>
                {addingChapterFor === s.id ? (
                  <div style={{ display: "flex", gap: 6 }}>
                    <input className="field" autoFocus placeholder="Chapter name" value={newChapterName}
                      onChange={e => setNewChapterName(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && addChapter(s.id)}
                      style={{ fontSize: 13 }} />
                    <button className="btn-primary" style={{ padding: "7px 12px", fontSize: 12 }} onClick={() => addChapter(s.id)}>Add</button>
                    <button className="btn-ghost" style={{ padding: "7px 10px", fontSize: 12 }} onClick={() => setAddingChapterFor(null)}>✕</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <button className="btn-ghost" style={{ padding: "6px 12px", fontSize: 12.5 }}
                      onClick={() => setAddingChapterFor(s.id)}>
                      <Plus size={13} style={{ marginRight: 4, verticalAlign: -2 }} />Chapter
                    </button>
                    <div style={{ display: "flex", gap: 5 }}>
                      <button className="btn-icon" style={{ width: 28, height: 28 }} onClick={() => setEditingSubject(s.id)}><Pencil size={12} /></button>
                      <button className="btn-icon" style={{ width: 28, height: 28 }} onClick={() => deleteSubject(s.id)}><Trash2 size={12} /></button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {u.subjects.length === 0 && <EmptyState text="No subjects yet. Add your first subject above." />}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="card" style={{ padding: 30, textAlign: "center", color: "var(--deep)", opacity: 0.7, fontSize: 14 }}>{text}</div>
  );
}

/* ============================== TESTS ============================== */
function TestsPage() {
  const { currentUser, updateUser } = useApp();
  const u = currentUser;
  const [showForm, setShowForm] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [form, setForm] = useState({ name: "", date: "", subject: "", total: "", marks: "", percentile: "", rank: "" });

  function addTest() {
    if (!form.name.trim()) return;
    updateUser(u.uid, usr => ({
      ...usr,
      tests: [{
        id: uid(), name: form.name.trim(), date: form.date || null, subject: form.subject || null,
        total: form.total ? Number(form.total) : null, marks: form.marks ? Number(form.marks) : null,
        percentile: form.percentile ? Number(form.percentile) : null, rank: form.rank ? Number(form.rank) : null,
      }, ...usr.tests],
    }));
    setForm({ name: "", date: "", subject: "", total: "", marks: "", percentile: "", rank: "" });
    setShowForm(false);
  }
  function removeTest(id) {
    updateUser(u.uid, usr => ({ ...usr, tests: usr.tests.filter(t => t.id !== id) }));
  }

  const byDate = [...u.tests].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const visible = showAll ? byDate : byDate.slice(0, 10);

  const sorted = [...u.tests].filter(t => t.date).sort((a, b) => a.date.localeCompare(b.date));
  const percentileSeries = sorted.filter(t => t.percentile != null).map(t => ({ name: t.name.slice(0, 12), percentile: t.percentile }));
  const subjectMap = {};
  u.tests.forEach(t => {
    if (t.subject && t.percentile != null) {
      subjectMap[t.subject] = subjectMap[t.subject] || [];
      subjectMap[t.subject].push(t.percentile);
    }
  });
  const subjectSeries = Object.entries(subjectMap).map(([subject, vals]) => ({ subject, avg: +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) }));

  // score color
  function scoreColor(marks, total) {
    if (!marks || !total) return "var(--mid)";
    const pct = (marks / total) * 100;
    return pct >= 75 ? "#6B9071" : pct >= 50 ? "#D4904A" : "#B5654F";
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>

      {/* Action bar */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="btn-primary" onClick={() => setShowForm(v => !v)}><Plus size={16} />New test</button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card pop" style={{ padding: 18, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10 }}>
          <div><span className="label">Test name*</span><input className="field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div><span className="label">Date</span><input type="date" className="field" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
          <div><span className="label">Subject</span><input className="field" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} /></div>
          <div><span className="label">Total marks</span><input type="number" className="field" value={form.total} onChange={e => setForm({ ...form, total: e.target.value })} /></div>
          <div><span className="label">Marks obtained</span><input type="number" className="field" value={form.marks} onChange={e => setForm({ ...form, marks: e.target.value })} /></div>
          <div><span className="label">Percentile</span><input type="number" step="0.1" className="field" value={form.percentile} onChange={e => setForm({ ...form, percentile: e.target.value })} /></div>
          <div><span className="label">Rank</span><input type="number" className="field" value={form.rank} onChange={e => setForm({ ...form, rank: e.target.value })} /></div>
          <div style={{ display: "flex", alignItems: "end", gap: 8 }}>
            <button className="btn-primary" onClick={addTest}>Save</button>
            <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Clipboard-style test cards */}
      {u.tests.length > 0 ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            {visible.map(t => {
              const scorePct = t.marks != null && t.total != null ? Math.round((t.marks / t.total) * 100) : null;
              const subjectLabel = t.subject || "General";
              return (
                <div key={t.id} style={{
                  background: "var(--surface)",
                  border: "1px solid rgba(55,85,52,0.1)",
                  borderRadius: 16,
                  overflow: "hidden",
                  boxShadow: "0 2px 8px -2px rgba(15,42,29,0.08), 0 1px 2px rgba(15,42,29,0.04)",
                  display: "flex", flexDirection: "column",
                  position: "relative",
                }}>
                  {/* Clipboard top strip */}
                  <div style={{
                    background: "var(--ink)", padding: "10px 14px 10px",
                    display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8,
                  }}>
                    {/* Clip notch */}
                    <div style={{
                      position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)",
                      width: 36, height: 10, background: "var(--deep)", borderRadius: "0 0 8px 8px",
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: "var(--canvas)", fontWeight: 700, fontSize: 13.5, lineHeight: 1.3,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {t.name}
                      </div>
                      <div style={{ color: "rgba(227,238,212,0.55)", fontSize: 11, marginTop: 2 }}>
                        {[subjectLabel, t.date].filter(Boolean).join(" · ")}
                      </div>
                    </div>
                    <button
                      onClick={() => removeTest(t.id)}
                      style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 6,
                        width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", flexShrink: 0, color: "rgba(227,238,212,0.5)", }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(181,101,79,0.4)"}
                      onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>

                  {/* Card body */}
                  <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                    {/* Score big display */}
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      {t.marks != null && t.total != null ? (
                        <>
                          <span className="disp" style={{ fontSize: 28, fontWeight: 800, color: scoreColor(t.marks, t.total), lineHeight: 1 }}>
                            {t.marks}
                          </span>
                          <span style={{ fontSize: 13, color: "var(--deep)", opacity: 0.55, fontWeight: 600 }}>/ {t.total}</span>
                          {scorePct != null && (
                            <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700,
                              background: scoreColor(t.marks, t.total) + "22",
                              color: scoreColor(t.marks, t.total),
                              padding: "2px 7px", borderRadius: 999 }}>{scorePct}%</span>
                          )}
                        </>
                      ) : (
                        <span style={{ fontSize: 13, color: "var(--deep)", opacity: 0.45 }}>No score</span>
                      )}
                    </div>

                    {/* Divider */}
                    <div style={{ borderTop: "1px dashed rgba(55,85,52,0.12)" }} />

                    {/* Meta stats */}
                    <div style={{ display: "flex", gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--deep)", opacity: 0.5, letterSpacing: "0.05em" }}>Percentile</div>
                        <div style={{ fontWeight: 700, fontSize: 14, marginTop: 1 }}>{t.percentile != null ? `${t.percentile}` : "—"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--deep)", opacity: 0.5, letterSpacing: "0.05em" }}>Rank</div>
                        <div style={{ fontWeight: 700, fontSize: 14, marginTop: 1 }}>{t.rank != null ? `#${t.rank}` : "—"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Show more / less */}
          {byDate.length > 10 && (
            <button className="btn-ghost" style={{ justifySelf: "center", padding: "8px 24px" }}
              onClick={() => setShowAll(v => !v)}>
              {showAll ? "Show less" : `Show all ${byDate.length} tests`}
            </button>
          )}
        </>
      ) : (
        <EmptyState text="No tests logged yet. Add your first test above." />
      )}

      {/* Analytics — side by side */}
      {(percentileSeries.length > 0 || subjectSeries.length > 0) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {percentileSeries.length > 0 && (
            <div className="card" style={{ padding: 18 }}>
              <span className="label" style={{ marginBottom: 10, display: "block" }}>Percentile trend</span>
              <ResponsiveContainer width="100%" height={190}>
                <LineChart data={percentileSeries}>
                  <CartesianGrid stroke="var(--surface-2)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#375534" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#375534" }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #AEC3B0", fontSize: 12 }} />
                  <Line type="monotone" dataKey="percentile" stroke="#375534" strokeWidth={2.5} dot={{ r: 4, fill: "#6B9071" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          {subjectSeries.length > 0 && (
            <div className="card" style={{ padding: 18 }}>
              <span className="label" style={{ marginBottom: 10, display: "block" }}>Subject avg percentile</span>
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={subjectSeries}>
                  <CartesianGrid stroke="var(--surface-2)" vertical={false} />
                  <XAxis dataKey="subject" tick={{ fontSize: 10, fill: "#375534" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#375534" }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #AEC3B0", fontSize: 12 }} />
                  <Bar dataKey="avg" fill="#6B9071" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: 10, opacity: 0.6, textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

/* ============================== FOCUS TIMER ============================== */
function FocusPage() {
  const { currentUser, timer, setTimer, resetTimer, logSession } = useApp();
  const u = currentUser;
  const fsRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  function toggleFullscreen() {
    if (!document.fullscreenElement) fsRef.current?.requestFullscreen?.().catch(() => { });
    else document.exitFullscreen?.();
  }

  const display = timer.mode === "timer" ? Math.max(timer.durationSec - timer.elapsed, 0) : timer.elapsed;
  const ringPct = timer.mode === "timer" ? Math.min(100, (timer.elapsed / timer.durationSec) * 100) : 0;

  const totalSec = display;
  const mMinutes = Math.floor(totalSec / 60);
  const sSeconds = totalSec % 60;
  const mm = String(mMinutes).padStart(2, "0");
  const ss = String(sSeconds).padStart(2, "0");

  function setDuration(mins) {
    setTimer(t => ({ ...t, durationSec: mins * 60, elapsed: t.mode === "timer" ? 0 : t.elapsed }));
  }
  function switchMode(mode) {
    resetTimer();
    setTimer(t => ({ ...t, mode, elapsed: 0, running: false }));
  }

  const totalFocus = u.focusSessions.reduce((a, s) => a + s.durationSec, 0);
  const weekAgo = Date.now() - 7 * 86400000;
  const chartData = [...u.focusSessions].filter(s => new Date(s.date).getTime() >= weekAgo)
    .reduce((acc, s) => {
      const found = acc.find(a => a.date === s.date);
      if (found) found.min += Math.round(s.durationSec / 60); else acc.push({ date: s.date.slice(5), min: Math.round(s.durationSec / 60) });
      return acc;
    }, []).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "stretch", minHeight: "calc(100vh - 130px)" }}>

      {/* LEFT: Timer */}
      <div ref={fsRef} className="card" style={{
        padding: isFullscreen ? "40px 24px" : 24,
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "space-between",
        gap: isFullscreen ? 16 : 18,
        ...(isFullscreen ? {
          background: "var(--ink)", color: "var(--canvas)",
          minHeight: "100vh", width: "100vw",
          position: "fixed", inset: 0, zIndex: 9999, borderRadius: 0
        } : {})
      }}>
        {/* Mode toggle */}
        <div style={{ display: "flex", gap: 6, background: isFullscreen ? "rgba(255,255,255,0.08)" : "var(--surface-2)", padding: 4, borderRadius: 999 }}>
          {["stopwatch", "timer"].map(m => (
            <button key={m} onClick={() => switchMode(m)} style={{
              border: "none", borderRadius: 999, padding: "8px 20px", fontWeight: 700, fontSize: 13,
              background: timer.mode === m ? (isFullscreen ? "var(--mid)" : "var(--ink)") : "transparent",
              color: timer.mode === m ? (isFullscreen ? "var(--ink)" : "var(--canvas)") : (isFullscreen ? "var(--canvas)" : "var(--deep)"),
              transition: "all .2s ease", cursor: "pointer",
            }}>{m === "stopwatch" ? "Stopwatch" : "Timer"}</button>
          ))}
        </div>

        {/* Duration presets */}
        {timer.mode === "timer" && !timer.running && timer.elapsed === 0 && (
          <div style={{ display: "flex", gap: 8 }}>
            {[15, 25, 45, 60].map(min => (
              <button key={min} className="btn-ghost" style={{ padding: "6px 14px", fontWeight: 600, fontSize: 12.5, ...(isFullscreen ? { color: "var(--canvas)", borderColor: "rgba(255,255,255,0.3)" } : {}) }}
                onClick={() => setDuration(min)}>{min}m</button>
            ))}
          </div>
        )}

        {/* Time display */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, width: "100%" }}>
          <span className="disp" style={{
            fontSize: isFullscreen ? "clamp(120px, 26vw, 360px)" : "clamp(64px, 8vw, 96px)",
            fontWeight: 900,
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "-0.04em",
            lineHeight: 1,
            textShadow: isFullscreen ? "0 16px 50px rgba(0,0,0,0.5)" : "none",
            userSelect: "none",
          }}>
            {fmtTime(display)}
          </span>
          {/* Slim progress bar for timer mode */}
          {timer.mode === "timer" && !isFullscreen && (
            <div style={{ width: "80%", maxWidth: 280 }}>
              <div style={{ height: 4, borderRadius: 999, background: "var(--surface-2)", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 999,
                  background: "var(--mid)",
                  width: `${ringPct}%`,
                  transition: "width 1s linear",
                }} />
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", alignItems: "center" }}>
          <button className="btn-primary" style={{ padding: "12px 28px", fontSize: 15 }} onClick={() => setTimer(t => ({ ...t, running: !t.running }))}>
            {timer.running ? <><Pause size={16} /> Pause</> : <><Play size={16} /> {timer.elapsed > 0 ? "Resume" : "Start"}</>}
          </button>

          {timer.running && (
            <button className="btn-ghost" style={{ padding: "12px 18px", ...(isFullscreen ? { color: "var(--canvas)", borderColor: "rgba(255,255,255,0.3)" } : {}) }}
              onClick={() => setTimer(t => ({ ...t, running: false }))}>
              <Square size={15} style={{ marginRight: 6, verticalAlign: -2 }} />Stop
            </button>
          )}

          {timer.elapsed > 0 && !timer.running && (
            <>
              <button className="btn-primary" style={{ padding: "12px 20px", background: "var(--mid)", color: "var(--ink)" }}
                onClick={() => logSession(timer.mode === "timer" ? timer.durationSec : timer.elapsed, timer.mode)}>
                <Check size={16} />Log session
              </button>
              <button className="btn-ghost" style={{ padding: "12px 16px", color: "#8F3A26", borderColor: "rgba(143,58,38,0.3)" }}
                onClick={resetTimer}>Discard</button>
            </>
          )}

          {timer.elapsed > 0 && timer.running && (
            <button className="btn-ghost" style={{ padding: "12px 14px" }} onClick={resetTimer} title="Reset"><RotateCcw size={15} /></button>
          )}

          <button className="btn-icon" style={isFullscreen ? { background: "transparent", borderColor: "rgba(255,255,255,0.3)", color: "var(--canvas)" } : {}}
            onClick={toggleFullscreen} title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>

        {timer.elapsed > 0 && !timer.running && (
          <div style={{
            padding: "10px 16px", borderRadius: 12, width: "100%",
            background: isFullscreen ? "rgba(255,255,255,0.1)" : "var(--surface-2)",
            color: isFullscreen ? "var(--canvas)" : "var(--ink)", fontSize: 12.5, textAlign: "center",
          }}>
            ⏱ Recorded <strong>{fmtTime(timer.mode === "timer" ? timer.durationSec : timer.elapsed)}</strong> — log it or discard.
          </div>
        )}
      </div>

      {/* RIGHT: Stats + chart + sessions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div className="card" style={{ padding: "16px 18px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--deep)", opacity: 0.6, marginBottom: 4 }}>Sessions</div>
            <div className="disp" style={{ fontSize: 32, fontWeight: 800, lineHeight: 1 }}>{u.focusSessions.length}</div>
          </div>
          <div className="card" style={{ padding: "16px 18px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--deep)", opacity: 0.6, marginBottom: 4 }}>Total time</div>
            <div className="disp" style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.15 }}>{fmtTime(totalFocus)}</div>
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="card" style={{ padding: 18 }}>
            <span className="label" style={{ marginBottom: 10, display: "block" }}>Focus last 7 days</span>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={chartData}>
                <CartesianGrid stroke="var(--surface-2)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#375534" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#375534" }} axisLine={false} tickLine={false} width={26} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #AEC3B0", fontSize: 12 }} formatter={v => [`${v} min`, "Focus"]} />
                <Bar dataKey="min" fill="#6B9071" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent sessions — grows to fill remaining space */}
        <div style={{ flex: 1, overflow: "auto" }}>
          {u.focusSessions.length > 0 ? (
            <SessionHistory sessions={u.focusSessions} />
          ) : (
            <EmptyState text="No sessions yet. Start your first focus session above." />
          )}
        </div>
      </div>

    </div>
  );
}

/* ============================== SESSION HISTORY COMPONENT ============================== */
function SessionHistory({ sessions }) {
  const [showAll, setShowAll] = useState(false);
  const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date));
  const visible = showAll ? sorted : sorted.slice(0, 10);

  const modeColors = {
    stopwatch: { bg: "#6B9071", label: "Stopwatch" },
    timer:     { bg: "#375534", label: "Timer" },
  };

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 12 }}>
        {visible.map(s => {
          const mc = modeColors[s.mode] || { bg: "var(--mid)", label: s.mode };
          const mins = Math.round(s.durationSec / 60);
          return (
            <div key={s.id} style={{
              background: "var(--surface)",
              border: "1px solid rgba(55,85,52,0.1)",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 2px 8px -2px rgba(15,42,29,0.08)",
              display: "flex", flexDirection: "column",
              position: "relative",
            }}>
              {/* Clipboard top strip */}
              <div style={{ background: "var(--ink)", padding: "10px 14px 12px", position: "relative" }}>
                {/* Clip notch */}
                <div style={{
                  position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)",
                  width: 32, height: 9, background: "var(--deep)", borderRadius: "0 0 7px 7px",
                }} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(227,238,212,0.5)", fontSize: 11, fontWeight: 600 }}>{s.date}</span>
                  <span style={{
                    background: mc.bg, color: "var(--canvas)", fontSize: 10, fontWeight: 700,
                    padding: "2px 8px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.04em",
                  }}>{mc.label}</span>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                <div className="disp" style={{ fontSize: 30, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.03em" }}>
                  {fmtTime(s.durationSec)}
                </div>
                <div style={{ borderTop: "1px dashed rgba(55,85,52,0.12)" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 11, color: "var(--deep)", opacity: 0.55 }}>
                    {mins} min{mins !== 1 ? "s" : ""}
                  </div>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: s.mode === "timer" ? "#6B9071" : "#AEC3B0",
                  }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sorted.length > 10 && (
        <button className="btn-ghost" style={{ justifySelf: "center", padding: "8px 24px" }}
          onClick={() => setShowAll(v => !v)}>
          {showAll ? "Show less" : `Show all ${sorted.length} sessions`}
        </button>
      )}
    </div>
  );
}


/* ============================== STUDY LOG ============================== */
function StudyLogPage() {
  const { currentUser, updateUser } = useApp();
  const u = currentUser;
  const [date, setDate] = useState(todayKey());
  const [hours, setHours] = useState("");
  const [showAll, setShowAll] = useState(false);

  const studyLogs = u.studyLogs || {};
  const entries = useMemo(() => Object.entries(studyLogs).sort((a, b) => b[0].localeCompare(a[0])), [studyLogs]);
  const streak = useMemo(() => computeStreak(studyLogs), [studyLogs]);

  const totalHours = useMemo(() => {
    const sum = Object.values(studyLogs).reduce((a, b) => a + (parseFloat(b) || 0), 0);
    return Math.round(sum * 10) / 10;
  }, [studyLogs]);

  const activeDays = useMemo(() => {
    return Object.values(studyLogs).filter(h => (parseFloat(h) || 0) > 0).length;
  }, [studyLogs]);

  const dailyAvg = useMemo(() => {
    if (!activeDays) return 0;
    return (totalHours / activeDays).toFixed(1);
  }, [totalHours, activeDays]);

  // Last 14 days chart data
  const last14DaysData = useMemo(() => {
    const res = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = dKey(d.getFullYear(), d.getMonth(), d.getDate());
      const label = `${d.getMonth() + 1}/${d.getDate()}`;
      res.push({
        date: label,
        hours: studyLogs[key] || 0
      });
    }
    return res;
  }, [studyLogs]);

  function save() {
    const val = parseFloat(hours);
    if (!val || val <= 0) return;
    updateUser(u.uid, usr => ({ ...usr, studyLogs: { ...usr.studyLogs, [date]: val } }));
    setHours("");
  }

  function addPresetHours(preset) {
    const today = todayKey();
    const current = studyLogs[today] || 0;
    const next = Math.round((current + preset) * 10) / 10;
    updateUser(u.uid, usr => ({ ...usr, studyLogs: { ...usr.studyLogs, [today]: next } }));
  }

  function removeLog(dKeyVal) {
    updateUser(u.uid, usr => {
      const updated = { ...usr.studyLogs };
      delete updated[dKeyVal];
      return { ...usr, studyLogs: updated };
    });
  }

  function handleUpdateLogs(newLogs) {
    updateUser(u.uid, usr => ({ ...usr, studyLogs: newLogs }));
  }

  const visibleEntries = showAll ? entries : entries.slice(0, 8);

  return (
    <div style={{ display: "grid", gap: 16 }}>

      {/* Top 4 Summary Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <div className="card" style={{ padding: "14px 18px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--deep)", opacity: 0.6, marginBottom: 4 }}>Total Hours</div>
          <div className="disp" style={{ fontSize: 26, fontWeight: 800, color: "#375534", lineHeight: 1 }}>{totalHours}h</div>
        </div>
        <div className="card" style={{ padding: "14px 18px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--deep)", opacity: 0.6, marginBottom: 4 }}>Day Streak</div>
          <div className="disp" style={{ fontSize: 26, fontWeight: 800, color: "#E05A47", lineHeight: 1, display: "flex", alignItems: "center", gap: 6 }}>
            <Flame size={22} style={{ color: "#E05A47" }} /> {streak}d
          </div>
        </div>
        <div className="card" style={{ padding: "14px 18px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--deep)", opacity: 0.6, marginBottom: 4 }}>Active Days</div>
          <div className="disp" style={{ fontSize: 26, fontWeight: 800, color: "#6B9071", lineHeight: 1 }}>{activeDays}</div>
        </div>
        <div className="card" style={{ padding: "14px 18px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--deep)", opacity: 0.6, marginBottom: 4 }}>Daily Average</div>
          <div className="disp" style={{ fontSize: 26, fontWeight: 800, color: "var(--ink)", lineHeight: 1 }}>{dailyAvg}h/d</div>
        </div>
      </div>

      {/* Scaled & Accurate Activity Heatmap Card */}
      <GitHubActivityCard user={u} onUpdateLogs={handleUpdateLogs} />

      {/* Bottom 2-Column Row: Logger & Charts (Left) vs Clipboard History (Right) */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 16, alignItems: "start" }}>

        {/* LEFT COLUMN: Quick Logger & Recent Trend */}
        <div style={{ display: "grid", gap: 14 }}>
          {/* Quick presets & Log Form */}
          <div className="card" style={{ padding: "18px 20px", display: "grid", gap: 14 }}>
            <div>
              <span className="label" style={{ marginBottom: 4 }}>Quick Add (Today)</span>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[0.5, 1, 2, 3, 4, 6].map(p => (
                  <button
                    key={p}
                    className="btn-ghost"
                    style={{ padding: "7px 12px", fontSize: 12.5, fontWeight: 700, flex: 1 }}
                    onClick={() => addPresetHours(p)}
                  >
                    +{p}h
                  </button>
                ))}
              </div>
            </div>

            <div style={{ borderTop: "1px dashed rgba(55,85,52,0.12)" }} />

            <div>
              <span className="label" style={{ marginBottom: 6 }}>Custom Log Entry</span>
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr auto", gap: 8, alignItems: "end" }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--deep)", opacity: 0.7, display: "block", marginBottom: 3 }}>Date</span>
                  <input type="date" className="field" value={date} onChange={e => setDate(e.target.value)} max={todayKey()} style={{ padding: "8px 10px", fontSize: 13 }} />
                </div>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--deep)", opacity: 0.7, display: "block", marginBottom: 3 }}>Hours</span>
                  <input type="number" step="0.5" min="0" max="24" className="field" placeholder="e.g. 3.5" value={hours} onChange={e => setHours(e.target.value)} onKeyDown={e => e.key === "Enter" && save()} style={{ padding: "8px 10px", fontSize: 13 }} />
                </div>
                <button className="btn-primary" onClick={save} style={{ padding: "8px 18px", fontSize: 13 }}>
                  <Plus size={15} style={{ marginRight: 2 }} /> Save
                </button>
              </div>
            </div>
          </div>

          {/* 14-Day Study Trend Chart */}
          <div className="card" style={{ padding: "18px 20px" }}>
            <span className="label" style={{ marginBottom: 8, display: "block" }}>Past 14 Days Activity (Hours)</span>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={last14DaysData}>
                <CartesianGrid stroke="var(--surface-2)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#375534" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#375534" }} axisLine={false} tickLine={false} width={24} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #AEC3B0", fontSize: 12 }} formatter={v => [`${v} hrs`, "Studied"]} />
                <Bar dataKey="hours" fill="#375534" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT COLUMN: Clipboard-Style History Cards */}
        <div className="card" style={{ padding: "18px 20px", display: "grid", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <span className="label" style={{ marginBottom: 2 }}>Log History</span>
              <h2 style={{ margin: 0, fontSize: 16 }}>Recorded Sessions ({entries.length})</h2>
            </div>
          </div>

          {entries.length > 0 ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
                {visibleEntries.map(([d, h]) => (
                  <div key={d} style={{
                    background: "var(--surface)",
                    border: "1px solid rgba(55,85,52,0.1)",
                    borderRadius: 14,
                    overflow: "hidden",
                    boxShadow: "0 2px 6px -2px rgba(15,42,29,0.06)",
                    display: "flex", flexDirection: "column",
                    position: "relative",
                  }}>
                    {/* Top Notch Clip */}
                    <div style={{ background: "var(--ink)", padding: "8px 12px 9px", position: "relative" }}>
                      <div style={{
                        position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)",
                        width: 28, height: 7, background: "var(--deep)", borderRadius: "0 0 6px 6px",
                      }} />
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ color: "rgba(227,238,212,0.65)", fontSize: 11, fontWeight: 600 }}>{d}</span>
                        <button
                          onClick={() => removeLog(d)}
                          style={{
                            background: "transparent", border: "none", color: "rgba(227,238,212,0.4)",
                            cursor: "pointer", padding: 0, display: "flex", alignItems: "center"
                          }}
                          onMouseEnter={e => e.currentTarget.style.color = "#FFA494"}
                          onMouseLeave={e => e.currentTarget.style.color = "rgba(227,238,212,0.4)"}
                          title="Delete entry"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div style={{ padding: "10px 12px", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                      <div className="disp" style={{ fontSize: 24, fontWeight: 800, color: "var(--ink)", lineHeight: 1 }}>
                        {h}<span style={{ fontSize: 12, fontWeight: 600, color: "var(--deep)", opacity: 0.6, marginLeft: 2 }}>hrs</span>
                      </div>
                      <span className="tag tag-ok" style={{ fontSize: 10, padding: "2px 7px" }}>Logged</span>
                    </div>
                  </div>
                ))}
              </div>

              {entries.length > 8 && (
                <button
                  className="btn-ghost"
                  style={{ justifySelf: "center", padding: "7px 20px", fontSize: 12.5 }}
                  onClick={() => setShowAll(v => !v)}
                >
                  {showAll ? "Show less" : `Show all ${entries.length} entries`}
                </button>
              )}
            </>
          ) : (
            <EmptyState text="No study logs recorded yet. Use the logger on the left to add your first hours." />
          )}
        </div>

      </div>

    </div>
  );
}

/* ============================== THEMES ============================== */
const THEMES = [
  {
    id: "sage",
    name: "Sage Forest",
    desc: "Calm organic greens & creamy linen canvas",
    badge: "Default",
    preview: ["#0F2A1D", "#6B9071", "#AEC3B0", "#E3EED4"],
  },
  {
    id: "ocean",
    name: "Nordic Ocean",
    desc: "Arctic navy, deep ocean & glacial mist",
    badge: "Ocean",
    preview: ["#0A1C2A", "#1A3E5C", "#3B7EA1", "#E1EDF5"],
  },
  {
    id: "terracotta",
    name: "Warm Terracotta",
    desc: "Earthy clay, warm amber & sandstone",
    badge: "Warm",
    preview: ["#2B160E", "#5E2F20", "#A85D42", "#F5EBE4"],
  },
  {
    id: "amethyst",
    name: "Dusk Amethyst",
    desc: "Twilight velvet, royal plum & lavender mist",
    badge: "Violet",
    preview: ["#1B1028", "#432860", "#78539A", "#EDE8F5"],
  },
];

/* ============================== PROFILE ============================== */
function ProfilePage() {
  const { currentUser, updateUser, setSession, setPage, theme, setTheme } = useApp();
  const u = currentUser;
  const [form, setForm] = useState(u.profile);
  const [saved, setSaved] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [step, setStep] = useState(1);

  // Password change state
  const [pwChangeForm, setPwChangeForm] = useState({ current: "", newPass: "", confirmPass: "" });
  const [pwChangeStatus, setPwChangeStatus] = useState({ text: "", type: "" });

  // New target form
  const [showAddTarget, setShowAddTarget] = useState(false);
  const [targetForm, setTargetForm] = useState({ name: "", current: 0, goal: 10, unit: "h" });

  const streak = useMemo(() => computeStreak(u.studyLogs), [u.studyLogs]);
  const totalStudyHrs = useMemo(() => {
    const sum = Object.values(u.studyLogs || {}).reduce((a, b) => a + (parseFloat(b) || 0), 0);
    return Math.round(sum * 10) / 10;
  }, [u.studyLogs]);

  function saveProfile() {
    updateUser(u.uid, usr => ({ ...usr, profile: form }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleUpdatePassword(e) {
    if (e) e.preventDefault();
    setPwChangeStatus({ text: "", type: "" });
    const currentActual = u.password || "password123";
    if (pwChangeForm.current !== currentActual) {
      setPwChangeStatus({ text: "Current password does not match.", type: "err" });
      return;
    }
    if (pwChangeForm.newPass.length < 4) {
      setPwChangeStatus({ text: "New password must be at least 4 characters.", type: "err" });
      return;
    }
    if (pwChangeForm.newPass !== pwChangeForm.confirmPass) {
      setPwChangeStatus({ text: "New passwords do not match.", type: "err" });
      return;
    }
    updateUser(u.uid, usr => ({ ...usr, password: pwChangeForm.newPass }));
    setPwChangeForm({ current: "", newPass: "", confirmPass: "" });
    setPwChangeStatus({ text: "Password changed successfully!", type: "ok" });
    setTimeout(() => setPwChangeStatus({ text: "", type: "" }), 3500);
  }

  function confirmShare() {
    if (pw.length < 4) { setPwError("Enter your account password to confirm."); return; }
    updateUser(u.uid, usr => ({ ...usr, sharing: true, consentAt: todayKey() }));
    setConfirmOpen(false); setStep(1); setPw(""); setPwError("");
  }

  function revoke() {
    updateUser(u.uid, usr => ({ ...usr, sharing: false }));
  }

  function addTarget() {
    if (!targetForm.name.trim() || !targetForm.goal) return;
    const newT = {
      id: uid(),
      name: targetForm.name.trim(),
      current: Number(targetForm.current) || 0,
      goal: Number(targetForm.goal) || 1,
      unit: targetForm.unit || ""
    };
    updateUser(u.uid, usr => ({ ...usr, targets: [...(usr.targets || []), newT] }));
    setTargetForm({ name: "", current: 0, goal: 10, unit: "h" });
    setShowAddTarget(false);
  }

  function removeTarget(tid) {
    updateUser(u.uid, usr => ({ ...usr, targets: (usr.targets || []).filter(t => t.id !== tid) }));
  }

  function updateTargetCurrent(tid, newCurr) {
    updateUser(u.uid, usr => ({
      ...usr,
      targets: (usr.targets || []).map(t => t.id === tid ? { ...t, current: Math.max(0, Number(newCurr) || 0) } : t)
    }));
  }

  const initials = (form.name || "Student").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div style={{ display: "grid", gap: 16 }}>

      {/* 1. HERO USER BANNER */}
      <div className="card" style={{
        padding: "24px 28px",
        background: "linear-gradient(135deg, var(--surface) 0%, rgba(174,195,176,0.25) 100%)",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 18
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* Avatar Monogram */}
          <div style={{
            width: 68, height: 68, borderRadius: 20, background: "var(--ink)",
            color: "var(--canvas)", display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 800,
            boxShadow: "0 8px 20px -6px rgba(15,42,29,0.35)", flexShrink: 0
          }}>
            {initials}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <h1 className="disp" style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>{form.name}</h1>
              <span className="tag tag-ok" style={{ fontSize: 11, padding: "2px 9px", fontWeight: 700 }}>Active Student</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--deep)", opacity: 0.75, marginTop: 4 }}>
              @{form.username} · Member since 2026
            </div>
          </div>
        </div>

        {/* Quick Stat Badges */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ background: "var(--white)", border: "1px solid var(--line)", padding: "8px 14px", borderRadius: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <Flame size={16} style={{ color: "#E05A47" }} />
            <span style={{ fontSize: 12.5, fontWeight: 700 }}>{streak}d streak</span>
          </div>
          <div style={{ background: "var(--white)", border: "1px solid var(--line)", padding: "8px 14px", borderRadius: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <BookOpen size={15} style={{ color: "var(--deep)" }} />
            <span style={{ fontSize: 12.5, fontWeight: 700 }}>{u.subjects?.length || 0} subjects</span>
          </div>
          <div style={{ background: "var(--white)", border: "1px solid var(--line)", padding: "8px 14px", borderRadius: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <ClipboardList size={15} style={{ color: "var(--deep)" }} />
            <span style={{ fontSize: 12.5, fontWeight: 700 }}>{u.tests?.length || 0} tests</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN SECTION */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 16, alignItems: "start" }}>

        {/* LEFT COLUMN: Personal Info, Password Change & Targets */}
        <div style={{ display: "grid", gap: 16 }}>

          {/* Personal Information Form */}
          <div className="card" style={{ padding: "20px 22px", display: "grid", gap: 14 }}>
            <div>
              <span className="label" style={{ marginBottom: 2 }}>Account Information</span>
              <h2 style={{ margin: 0, fontSize: 16 }}>Personal Details</h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--deep)", opacity: 0.7, display: "block", marginBottom: 4 }}>Full Name</span>
                <input className="field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ padding: "9px 12px", fontSize: 13.5 }} />
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--deep)", opacity: 0.7, display: "block", marginBottom: 4 }}>Username (Permanent)</span>
                <input className="field" value={form.username} disabled style={{ padding: "9px 12px", fontSize: 13.5, opacity: 0.6, background: "var(--surface-2)" }} />
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--deep)", opacity: 0.7, display: "block", marginBottom: 4 }}>Email Address</span>
                <input className="field" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ padding: "9px 12px", fontSize: 13.5 }} />
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--deep)", opacity: 0.7, display: "block", marginBottom: 4 }}>Phone Number</span>
                <input className="field" type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={{ padding: "9px 12px", fontSize: 13.5 }} />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
              <button className="btn-primary" onClick={saveProfile} style={{ padding: "9px 20px", fontSize: 13 }}>
                Save changes
              </button>
              {saved && (
                <span style={{ fontSize: 13, fontWeight: 600, color: "#375534", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <Check size={16} style={{ color: "#6B9071" }} /> Profile updated!
                </span>
              )}
            </div>
          </div>

          {/* Change Password Card */}
          <div className="card" style={{ padding: "20px 22px", display: "grid", gap: 14 }}>
            <div>
              <span className="label" style={{ marginBottom: 2 }}>Security Credentials</span>
              <h2 style={{ margin: 0, fontSize: 16 }}>Change Password</h2>
            </div>

            <form onSubmit={handleUpdatePassword} style={{ display: "grid", gap: 12 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--deep)", opacity: 0.7, display: "block", marginBottom: 4 }}>Current Password</span>
                <input
                  type="password"
                  className="field"
                  value={pwChangeForm.current}
                  onChange={e => setPwChangeForm({ ...pwChangeForm, current: e.target.value })}
                  placeholder="Enter current password"
                  style={{ padding: "9px 12px", fontSize: 13 }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--deep)", opacity: 0.7, display: "block", marginBottom: 4 }}>New Password</span>
                  <input
                    type="password"
                    className="field"
                    value={pwChangeForm.newPass}
                    onChange={e => setPwChangeForm({ ...pwChangeForm, newPass: e.target.value })}
                    placeholder="Min. 4 characters"
                    style={{ padding: "9px 12px", fontSize: 13 }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--deep)", opacity: 0.7, display: "block", marginBottom: 4 }}>Confirm New Password</span>
                  <input
                    type="password"
                    className="field"
                    value={pwChangeForm.confirmPass}
                    onChange={e => setPwChangeForm({ ...pwChangeForm, confirmPass: e.target.value })}
                    placeholder="Re-enter new password"
                    style={{ padding: "9px 12px", fontSize: 13 }}
                  />
                </div>
              </div>

              {pwChangeStatus.text && (
                <div style={{
                  padding: "9px 13px",
                  borderRadius: 10,
                  fontSize: 12.5,
                  fontWeight: 600,
                  background: pwChangeStatus.type === "err" ? "rgba(181,101,79,0.14)" : "rgba(107,144,113,0.18)",
                  color: pwChangeStatus.type === "err" ? "#8F3A26" : "#375534",
                  border: pwChangeStatus.type === "err" ? "1px solid rgba(181,101,79,0.25)" : "1px solid rgba(107,144,113,0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}>
                  {pwChangeStatus.type === "err" ? <X size={15} /> : <Check size={15} />}
                  <span>{pwChangeStatus.text}</span>
                </div>
              )}

              <button type="submit" className="btn-primary" style={{ justifySelf: "start", padding: "8px 18px", fontSize: 13, marginTop: 2 }}>
                Update Password
              </button>
            </form>
          </div>

          {/* Academic Targets Management */}
          <div className="card" style={{ padding: "20px 22px", display: "grid", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <span className="label" style={{ marginBottom: 2 }}>Goal Setting</span>
                <h2 style={{ margin: 0, fontSize: 16 }}>Target Progress Items</h2>
              </div>
              <button className="btn-ghost" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => setShowAddTarget(v => !v)}>
                <Plus size={14} style={{ marginRight: 4, verticalAlign: -2 }} /> Add Goal
              </button>
            </div>

            {showAddTarget && (
              <div className="card-nested pop" style={{ padding: 14, display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr auto", gap: 8, alignItems: "end" }}>
                <div>
                  <span className="label" style={{ fontSize: 10 }}>Target Name*</span>
                  <input className="field" placeholder="e.g. Physics Ch." value={targetForm.name} onChange={e => setTargetForm({ ...targetForm, name: e.target.value })} style={{ padding: "6px 8px", fontSize: 12.5 }} />
                </div>
                <div>
                  <span className="label" style={{ fontSize: 10 }}>Current</span>
                  <input type="number" min="0" className="field" value={targetForm.current} onChange={e => setTargetForm({ ...targetForm, current: e.target.value })} style={{ padding: "6px 8px", fontSize: 12.5 }} />
                </div>
                <div>
                  <span className="label" style={{ fontSize: 10 }}>Goal*</span>
                  <input type="number" min="1" className="field" value={targetForm.goal} onChange={e => setTargetForm({ ...targetForm, goal: e.target.value })} style={{ padding: "6px 8px", fontSize: 12.5 }} />
                </div>
                <div>
                  <span className="label" style={{ fontSize: 10 }}>Unit</span>
                  <input className="field" placeholder="e.g. h / ch" value={targetForm.unit} onChange={e => setTargetForm({ ...targetForm, unit: e.target.value })} style={{ padding: "6px 8px", fontSize: 12.5 }} />
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button className="btn-primary" onClick={addTarget} style={{ padding: "7px 12px", fontSize: 12 }}>Add</button>
                  <button className="btn-ghost" onClick={() => setShowAddTarget(false)} style={{ padding: "7px 9px", fontSize: 12 }}>✕</button>
                </div>
              </div>
            )}

            <div style={{ display: "grid", gap: 10 }}>
              {(u.targets || []).map(t => {
                const pct = Math.min(100, Math.round((t.current / t.goal) * 100));
                return (
                  <div key={t.id} className="card-nested" style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: 13.5 }}>{t.name}</span>
                        <span style={{ fontSize: 11.5, color: "var(--deep)", opacity: 0.65, marginLeft: 6 }}>
                          ({t.current}{t.unit} of {t.goal}{t.unit})
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input
                          type="number" min="0" max={t.goal * 2} className="field"
                          value={t.current}
                          onChange={e => updateTargetCurrent(t.id, e.target.value)}
                          style={{ width: 50, padding: "3px 6px", fontSize: 12, textAlign: "center" }}
                        />
                        <span style={{ fontWeight: 700, fontSize: 12.5, minWidth: 36, textAlign: "right" }}>{pct}%</span>
                        <button className="btn-icon" style={{ width: 26, height: 26 }} onClick={() => removeTarget(t.id)}><Trash2 size={11} /></button>
                      </div>
                    </div>
                    <div className="bar-track" style={{ height: 6 }}>
                      <div className="bar-fill" style={{ width: `${pct}%`, height: "100%" }} />
                    </div>
                  </div>
                );
              })}
              {(!u.targets || u.targets.length === 0) && (
                <EmptyState text="No targets set yet. Add a study goal or chapter target above." />
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Theme Selector, Data Privacy & Account Security */}
        <div style={{ display: "grid", gap: 16 }}>

          {/* Theme Selector Card */}
          <div className="card" style={{ padding: "20px 22px", display: "grid", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "var(--surface-2)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <Palette size={18} style={{ color: "var(--deep)" }} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 16 }}>Color Theme</h2>
                  <div style={{ fontSize: 11.5, color: "var(--deep)", opacity: 0.65 }}>Personalize Workspace Aesthetics</div>
                </div>
              </div>
              <span className="tag tag-ok" style={{ textTransform: "capitalize" }}>
                {THEMES.find(t => t.id === theme)?.name || "Sage Forest"}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {THEMES.map(th => {
                const isActive = (theme || "sage") === th.id;
                return (
                  <div
                    key={th.id}
                    onClick={() => setTheme(th.id)}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 14,
                      border: isActive ? "2px solid var(--ink)" : "1px solid var(--line)",
                      background: isActive ? "var(--surface-2)" : "var(--white)",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      transition: "all .15s ease",
                      boxShadow: isActive ? "0 4px 14px -2px rgba(15,42,29,0.12)" : "none",
                      position: "relative",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: "var(--ink)" }}>{th.name}</span>
                      {isActive && <Check size={14} style={{ color: "var(--ink)" }} />}
                    </div>

                    {/* Color Swatch Dots */}
                    <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                      {th.preview.map((c, ci) => (
                        <div
                          key={ci}
                          style={{
                            width: 14, height: 14, borderRadius: "50%",
                            background: c,
                            border: "1px solid rgba(0,0,0,0.1)",
                            flexShrink: 0
                          }}
                        />
                      ))}
                    </div>

                    <div style={{ fontSize: 11, color: "var(--deep)", opacity: 0.7, lineHeight: 1.25 }}>
                      {th.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Data Privacy & Sharing Card */}
          <div className="card" style={{ padding: "20px 22px", display: "grid", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: u.sharing ? "rgba(107,144,113,0.15)" : "rgba(15,42,29,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  {u.sharing ? <Unlock size={18} style={{ color: "#375534" }} /> : <Lock size={18} style={{ color: "var(--deep)" }} />}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 16 }}>Data Privacy & Sharing</h2>
                  <div style={{ fontSize: 11.5, color: "var(--deep)", opacity: 0.65 }}>Admin Visibility Controls</div>
                </div>
              </div>
              <span className={u.sharing ? "tag tag-ok" : "tag"} style={{ fontSize: 11 }}>
                {u.sharing ? "Sharing Active" : "Private"}
              </span>
            </div>

            {u.sharing ? (
              <div style={{ background: "var(--white)", border: "1px solid var(--line)", padding: "14px 16px", borderRadius: 12, display: "grid", gap: 10 }}>
                <p style={{ fontSize: 13, color: "var(--deep)", margin: 0, lineHeight: 1.4 }}>
                  Your attendance, academic progress, test scores, focus logs, and study hours are <strong>currently shared with your Admin</strong>. Consent active since <strong>{u.consentAt}</strong>.
                </p>
                <button className="btn-ghost" onClick={revoke} style={{ justifySelf: "start", color: "#8F3A26", borderColor: "rgba(143,58,38,0.25)" }}>
                  <Lock size={14} style={{ marginRight: 6, verticalAlign: -2 }} /> Revoke Admin Access
                </button>
              </div>
            ) : (
              <div style={{ background: "var(--white)", border: "1px solid var(--line)", padding: "14px 16px", borderRadius: 12, display: "grid", gap: 10 }}>
                <p style={{ fontSize: 13, color: "var(--deep)", margin: 0, lineHeight: 1.4 }}>
                  By default, your detailed learning activity remains <strong>100% private</strong> to you. Sharing allows your institutional Admin to review your attendance, tests, and study logs to provide mentorship.
                </p>
                <button className="btn-primary" onClick={() => { setConfirmOpen(true); setStep(1); }} style={{ justifySelf: "start" }}>
                  <Shield size={14} style={{ marginRight: 6, verticalAlign: -2 }} /> Enable Admin Data Sharing
                </button>
              </div>
            )}
          </div>

          {/* Account Security & Session Card */}
          <div className="card" style={{ padding: "20px 22px", display: "grid", gap: 14 }}>
            <div>
              <span className="label" style={{ marginBottom: 2 }}>Security & Session</span>
              <h2 style={{ margin: 0, fontSize: 16 }}>Account Management</h2>
            </div>

            <div style={{ display: "grid", gap: 8, fontSize: 12.5 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "var(--surface-2)", borderRadius: 8 }}>
                <span style={{ opacity: 0.7 }}>Account ID:</span>
                <code style={{ fontWeight: 700, color: "var(--ink)" }}>{u.uid}</code>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "var(--surface-2)", borderRadius: 8 }}>
                <span style={{ opacity: 0.7 }}>Role:</span>
                <strong style={{ color: "var(--ink)", textTransform: "capitalize" }}>Student Account</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "var(--surface-2)", borderRadius: 8 }}>
                <span style={{ opacity: 0.7 }}>Auth Protocol:</span>
                <span style={{ fontWeight: 600, color: "var(--deep)" }}>Firebase Local State</span>
              </div>
            </div>

            <div style={{ borderTop: "1px dashed rgba(55,85,52,0.12)", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "var(--deep)", opacity: 0.7 }}>Sign out of this workstation</span>
              <button
                className="btn-ghost"
                onClick={() => setSession(null)}
                style={{ padding: "8px 16px", fontSize: 12.5, color: "#8F3A26", borderColor: "rgba(143,58,38,0.25)" }}
              >
                <LogOut size={13} style={{ marginRight: 6, verticalAlign: -2 }} /> Log Out
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Consent Modal Dialog */}
      {confirmOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,42,29,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: 20 }}>
          <div className="card pop" style={{ width: "100%", maxWidth: 420, padding: 26, background: "var(--white)" }}>
            {step === 1 ? (
              <>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(107,144,113,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <Shield size={22} style={{ color: "#375534" }} />
                </div>
                <h3 style={{ margin: "0 0 8px", fontSize: 18 }}>Confirm Data Sharing</h3>
                <p style={{ fontSize: 13.5, color: "var(--deep)", lineHeight: 1.4, margin: "0 0 18px" }}>
                  This grants your institution's Admin read access to your attendance records, test performance, and study logs. You can revoke this permission anytime.
                </p>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button className="btn-ghost" onClick={() => setConfirmOpen(false)}>Cancel</button>
                  <button className="btn-primary" onClick={() => setStep(2)}>Continue to Password</button>
                </div>
              </>
            ) : (
              <>
                <h3 style={{ margin: "0 0 6px", fontSize: 18 }}>Confirm Account Password</h3>
                <p style={{ fontSize: 13.5, color: "var(--deep)", margin: "0 0 14px" }}>Please enter your password to authorize data sharing.</p>
                <input
                  type="password" className="field" placeholder="Enter password (e.g. 1234)"
                  value={pw} onChange={e => { setPw(e.target.value); setPwError(""); }}
                  autoFocus onKeyDown={e => e.key === "Enter" && confirmShare()}
                  style={{ marginBottom: 6 }}
                />
                {pwError && <p style={{ color: "#B5654F", fontSize: 12.5, margin: "4px 0 10px", fontWeight: 600 }}>{pwError}</p>}
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 14 }}>
                  <button className="btn-ghost" onClick={() => setConfirmOpen(false)}>Cancel</button>
                  <button className="btn-primary" onClick={confirmShare}>Authorize & Share</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

/* ============================== ADMIN: DASHBOARD ============================== */
function AdminDashboardPage() {
  const { users, setPage, adminAccount, updateAdmin } = useApp();
  const sharing = users.filter(u => u.sharing);

  const [adminPwForm, setAdminPwForm] = useState({ current: "", newPass: "", confirmPass: "" });
  const [adminPwStatus, setAdminPwStatus] = useState({ text: "", type: "" });

  function handleAdminPasswordChange(e) {
    if (e) e.preventDefault();
    setAdminPwStatus({ text: "", type: "" });
    const currentActual = adminAccount?.password || "admin1234";

    if (adminPwForm.current !== currentActual) {
      setAdminPwStatus({ text: "Current admin password is incorrect.", type: "err" });
      return;
    }
    if (adminPwForm.newPass.length < 4) {
      setAdminPwStatus({ text: "New password must be at least 4 characters.", type: "err" });
      return;
    }
    if (adminPwForm.newPass !== adminPwForm.confirmPass) {
      setAdminPwStatus({ text: "New passwords do not match.", type: "err" });
      return;
    }

    updateAdmin(adm => ({ ...adm, password: adminPwForm.newPass }));
    setAdminPwForm({ current: "", newPass: "", confirmPass: "" });
    setAdminPwStatus({ text: "Admin password updated successfully!", type: "ok" });
    setTimeout(() => setAdminPwStatus({ text: "", type: "" }), 3500);
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12 }}>
        <StatCard label="Total students" value={users.length} />
        <StatCard label="Sharing data" value={sharing.length} />
        <StatCard label="Private accounts" value={users.length - sharing.length} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16, alignItems: "start" }}>
        {/* Consented Students */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 style={{ margin: 0, fontSize: 17 }}>Students Sharing Data</h2>
            <button className="btn-ghost" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => setPage("admin-compare")}>Compare</button>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {sharing.map(u => (
              <div key={u.uid} className="card-nested" style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{u.profile.name}</div>
                  <div style={{ fontSize: 11.5, opacity: 0.65 }}>Consented {u.consentAt}</div>
                </div>
                <span className="tag tag-ok">Accessible</span>
              </div>
            ))}
            {sharing.length === 0 && <EmptyState text="No student users have granted data sharing yet." />}
          </div>
        </div>

        {/* Admin Password Change Card */}
        <div className="card" style={{ padding: 20, display: "grid", gap: 12 }}>
          <div>
            <span className="label" style={{ marginBottom: 2 }}>Admin Credentials</span>
            <h2 style={{ margin: 0, fontSize: 17 }}>Change Admin Password</h2>
          </div>

          <form onSubmit={handleAdminPasswordChange} style={{ display: "grid", gap: 10 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--deep)", opacity: 0.7, display: "block", marginBottom: 4 }}>Current Admin Password</span>
              <input
                type="password"
                className="field"
                value={adminPwForm.current}
                onChange={e => setAdminPwForm({ ...adminPwForm, current: e.target.value })}
                placeholder="Enter current password"
                style={{ padding: "8px 11px", fontSize: 13 }}
              />
            </div>

            <div>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--deep)", opacity: 0.7, display: "block", marginBottom: 4 }}>New Password</span>
              <input
                type="password"
                className="field"
                value={adminPwForm.newPass}
                onChange={e => setAdminPwForm({ ...adminPwForm, newPass: e.target.value })}
                placeholder="Min. 4 characters"
                style={{ padding: "8px 11px", fontSize: 13 }}
              />
            </div>

            <div>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--deep)", opacity: 0.7, display: "block", marginBottom: 4 }}>Confirm New Password</span>
              <input
                type="password"
                className="field"
                value={adminPwForm.confirmPass}
                onChange={e => setAdminPwForm({ ...adminPwForm, confirmPass: e.target.value })}
                placeholder="Re-enter new password"
                style={{ padding: "8px 11px", fontSize: 13 }}
              />
            </div>

            {adminPwStatus.text && (
              <div style={{
                padding: "8px 12px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                background: adminPwStatus.type === "err" ? "rgba(181,101,79,0.14)" : "rgba(107,144,113,0.18)",
                color: adminPwStatus.type === "err" ? "#8F3A26" : "#375534",
                border: adminPwStatus.type === "err" ? "1px solid rgba(181,101,79,0.25)" : "1px solid rgba(107,144,113,0.3)",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}>
                {adminPwStatus.type === "err" ? <X size={14} /> : <Check size={14} />}
                <span>{adminPwStatus.text}</span>
              </div>
            )}

            <button type="submit" className="btn-primary" style={{ justifySelf: "start", padding: "8px 16px", fontSize: 12.5, marginTop: 4 }}>
              Update Admin Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ============================== ADMIN: USERS ============================== */
function AdminUsersPage() {
  const { users, setUsers } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [createError, setCreateError] = useState("");

  function createUser(e) {
    if (e) e.preventDefault();
    setCreateError("");
    const trimmedUser = form.username.trim();
    const trimmedPass = form.password.trim();
    const trimmedName = form.name.trim() || trimmedUser;
    const trimmedEmail = form.email.trim() || `${trimmedUser}@cresco.com`;

    if (!trimmedUser || !trimmedPass) {
      setCreateError("Username and initial password are required.");
      return;
    }
    if (users.some(u => (u.profile?.username || "").toLowerCase() === trimmedUser.toLowerCase())) {
      setCreateError("A student with this username already exists.");
      return;
    }

    const u = seedUser({
      profile: { name: trimmedName, email: trimmedEmail, phone: "", username: trimmedUser },
      password: trimmedPass,
      sharing: false,
      subjects: [],
      tests: [],
      targets: [],
      focusSessions: [],
      studyLogs: {}
    });

    setUsers(prev => [...prev, u]);
    saveUserToFirestore(u);
    setForm({ name: "", username: "", email: "", password: "" });
    setCreateError("");
    setShowCreate(false);
  }

  function deleteUser(uidToDelete) {
    if (confirm("Are you sure you want to delete this student account?")) {
      setUsers(prev => prev.filter(u => u.uid !== uidToDelete));
      deleteUserFromFirestore(uidToDelete);
      if (viewing === uidToDelete) setViewing(null);
    }
  }

  const viewUser = users.find(u => u.uid === viewing);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <span className="label" style={{ marginBottom: 2 }}>Directory</span>
          <h2 style={{ margin: 0, fontSize: 18 }}>Registered Student Accounts ({users.length})</h2>
        </div>
        <button className="btn-primary" onClick={() => { setShowCreate(v => !v); setCreateError(""); }}>
          <Plus size={16} /> Add Student Account
        </button>
      </div>

      {showCreate && (
        <div className="card pop" style={{ padding: "20px 22px", display: "grid", gap: 14 }}>
          <div>
            <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>Provision New Student Account</h3>
            <p style={{ margin: 0, fontSize: 12.5, color: "var(--deep)", opacity: 0.65 }}>
              Create an account for a student. They can immediately log in using these credentials.
            </p>
          </div>

          {createError && (
            <div style={{
              padding: "8px 12px",
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 600,
              background: "rgba(181,101,79,0.14)",
              color: "#8F3A26",
              border: "1px solid rgba(181,101,79,0.25)",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}>
              <X size={14} />
              <span>{createError}</span>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            <div>
              <span className="label">Full Name</span>
              <input className="field" placeholder="e.g. Maya Sharma" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <span className="label">Username*</span>
              <input className="field" placeholder="e.g. maya.sharma" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
            </div>
            <div>
              <span className="label">Email Address</span>
              <input className="field" type="email" placeholder="e.g. maya@cresco.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <span className="label">Initial Password*</span>
              <input className="field" type="password" placeholder="Enter temporary password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <button className="btn-primary" onClick={createUser}>Save & Provision</button>
            <button className="btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gap: 10 }}>
        {users.map(u => (
          <div key={u.uid} className="card" style={{ padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, cursor: "pointer" }}
            onClick={() => setViewing(u.uid)}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 999, background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "var(--deep)" }}>
                {u.profile.name.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{u.profile.name}</div>
                <div style={{ fontSize: 12, opacity: 0.65 }}>@{u.profile.username}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span className="tag tag-ok">Profile visible</span>
              <span className={`tag ${u.sharing ? "tag-ok" : "tag-off"}`}>{u.sharing ? "Data accessible" : "Data private"}</span>
            </div>
          </div>
        ))}
      </div>

      {viewUser && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,42,29,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: 20 }}
          onClick={() => setViewing(null)}>
          <div className="card pop" style={{ width: "100%", maxWidth: 460, padding: 24, maxHeight: "85vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <div>
                <h2 style={{ margin: "0 0 2px" }}>{viewUser.profile.name}</h2>
                <p style={{ margin: 0, fontSize: 13, opacity: 0.65 }}>@{viewUser.profile.username}</p>
              </div>
              <button className="btn-icon" onClick={() => setViewing(null)}><X size={15} /></button>
            </div>
            <div className="card-nested" style={{ padding: 14, marginTop: 16, display: "grid", gap: 6, fontSize: 13 }}>
              <div><strong>Email:</strong> {viewUser.profile.email || "—"}</div>
              <div><strong>Phone:</strong> {viewUser.profile.phone || "—"}</div>
            </div>

            <div style={{ marginTop: 16 }}>
              <span className="label">Cresco data</span>
              {viewUser.sharing ? (
                <div style={{ display: "grid", gap: 8 }}>
                  <div className="card-nested" style={{ padding: 12, fontSize: 13 }}>
                    Attendance %: {(() => { const t = new Date(); return computeAttendanceStats(viewUser.attendance, t.getFullYear(), t.getMonth()).pct ?? "—"; })()}
                  </div>
                  <div className="card-nested" style={{ padding: 12, fontSize: 13 }}>
                    Chapters tracked: {viewUser.subjects.reduce((a, s) => a + s.chapters.length, 0)}
                  </div>
                  <div className="card-nested" style={{ padding: 12, fontSize: 13 }}>
                    Tests logged: {viewUser.tests.length}
                  </div>
                  <div className="card-nested" style={{ padding: 12, fontSize: 13 }}>
                    Total focus time: {fmtTime(viewUser.focusSessions.reduce((a, s) => a + s.durationSec, 0))}
                  </div>
                  <div className="card-nested" style={{ padding: 12, fontSize: 13 }}>
                    Study streak: {computeStreak(viewUser.studyLogs)} days
                  </div>
                </div>
              ) : (
                <div className="card-nested" style={{ padding: 16, textAlign: "center", fontSize: 13, color: "var(--deep)", opacity: 0.75 }}>
                  <Lock size={16} style={{ marginBottom: 6 }} /><br />
                  This user hasn't granted data-sharing permission.
                </div>
              )}
            </div>

            <div style={{ marginTop: 18, paddingTop: 12, borderTop: "1px dashed rgba(55,85,52,0.12)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "var(--deep)", opacity: 0.6 }}>Student ID: {viewUser.uid}</span>
              <button
                className="btn-ghost"
                onClick={() => deleteUser(viewUser.uid)}
                style={{ color: "#8F3A26", borderColor: "rgba(143,58,38,0.25)", padding: "6px 12px", fontSize: 12 }}
              >
                <Trash2 size={13} style={{ marginRight: 4, verticalAlign: -2 }} /> Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================== ADMIN: COMPARE MODE ============================== */
// Extensible rubric system — add new entries here to extend Compare Mode.
const RUBRICS = [
  {
    id: "attendance",
    label: "Attendance this month",
    compute: (u) => { const t = new Date(); const s = computeAttendanceStats(u.attendance, t.getFullYear(), t.getMonth()); return s.pct; },
    format: (v) => v === null ? "—" : `${v}%`,
    higherIsBetter: true,
  },
  {
    id: "avgPercentile",
    label: "Average test percentile",
    compute: (u) => { const vals = u.tests.map(t => t.percentile).filter(v => v !== null && v !== undefined); return vals.length ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null; },
    format: (v) => v === null ? "—" : v,
    higherIsBetter: true,
  },
  {
    id: "avgProgress",
    label: "Average chapter progress",
    compute: (u) => { const all = u.subjects.flatMap(s => s.chapters.map(c => c.progress)); return all.length ? Math.round(all.reduce((a, b) => a + b, 0) / all.length) : null; },
    format: (v) => v === null ? "—" : `${v}%`,
    higherIsBetter: true,
  },
  {
    id: "focusTime",
    label: "Total focus time",
    compute: (u) => u.focusSessions.reduce((a, s) => a + s.durationSec, 0),
    format: (v) => fmtTime(v),
    higherIsBetter: true,
  },
  {
    id: "streak",
    label: "Study streak",
    compute: (u) => computeStreak(u.studyLogs),
    format: (v) => `${v} days`,
    higherIsBetter: true,
  },
];

function AdminComparePage() {
  const { users } = useApp();
  const eligible = users.filter(u => u.sharing);
  const [selected, setSelected] = useState([]);

  function toggle(uidVal) {
    setSelected(prev => {
      if (prev.includes(uidVal)) return prev.filter(x => x !== uidVal);
      if (prev.length >= 5) return prev;
      return [...prev, uidVal];
    });
  }

  const compareUsers = users.filter(u => selected.includes(u.uid));
  const active = compareUsers.length >= 2;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="card" style={{ padding: 16 }}>
        <span className="label">Eligible users ({selected.length}/5 selected)</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {eligible.map(u => {
            const on = selected.includes(u.uid);
            return (
              <button key={u.uid} onClick={() => toggle(u.uid)}
                style={{
                  border: `1px solid ${on ? "var(--ink)" : "var(--line)"}`, borderRadius: 999, padding: "8px 14px",
                  background: on ? "var(--ink)" : "var(--white)", color: on ? "var(--canvas)" : "var(--ink)",
                  fontWeight: 600, fontSize: 13, transition: "all .15s ease",
                }}>
                {u.profile.name}
              </button>
            );
          })}
          {eligible.length === 0 && <EmptyState text="No users have granted data sharing yet." />}
        </div>
      </div>

      {active ? (
        <div className="card enter" style={{ padding: 20, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", fontSize: 11, textTransform: "uppercase", color: "var(--deep)", opacity: 0.65, padding: "0 10px 12px 0" }}>Rubric</th>
                {compareUsers.map(u => (
                  <th key={u.uid} style={{ textAlign: "center", fontSize: 13, fontWeight: 700, padding: "0 10px 12px" }}>{u.profile.name.split(" ")[0]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RUBRICS.map(r => {
                const values = compareUsers.map(u => r.compute(u));
                const numericVals = values.filter(v => v !== null);
                const best = numericVals.length ? (r.higherIsBetter ? Math.max(...numericVals) : Math.min(...numericVals)) : null;
                return (
                  <tr key={r.id} style={{ borderTop: "1px solid var(--surface-2)" }}>
                    <td style={{ padding: "12px 10px 12px 0", fontSize: 13, fontWeight: 600, color: "var(--deep)" }}>{r.label}</td>
                    {compareUsers.map((u, i) => {
                      const v = values[i];
                      const isBest = v !== null && v === best && numericVals.length > 1;
                      return (
                        <td key={u.uid} style={{ textAlign: "center", padding: "12px 10px" }}>
                          <span style={{
                            display: "inline-block", padding: "4px 12px", borderRadius: 999, fontWeight: 700, fontSize: 13,
                            background: isBest ? "var(--mid)" : "var(--surface-2)", color: isBest ? "var(--ink)" : "var(--deep)"
                          }}>{r.format(v)}</span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState text={eligible.length > 0 ? "Select at least 2 users to compare." : "Compare Mode needs at least 2 users with shared data."} />
      )}
    </div>
  );
}
