import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Flag, X, Check, ChevronDown, ChevronUp, Filter, Users, Building2, MessageSquare, Clock, Pin, Plus, BarChart3 } from "lucide-react";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      }
    }
  }
);

const departments = [
  {
    name: "Clinic Operations", color: "#3b82f6",
    divisions: [
      { name: "Front Office", drivers: ["Copay Collection","Insurance Verification","Performing daily review and reconciliation of completed and no-show appointments","Form Completion","Provider Support"] },
      { name: "PVP", drivers: ["Insurance Confirmation and Copay Determination for New Patients","Virtual Copays","Balance Collection","MEDUSA Worksheet","Front Desk Support"] }
    ]
  },
  {
    name: "Patient Experience & Access", color: "#a855f7",
    divisions: [
      { name: "Intake", drivers: ["Prioritizing the identification and scheduling of open new patient appointments within the next 72 hours","Appropriate Scheduling per Triage Rules","92.5% Answer Percentage","Working New Patient Wait List","Patient Customer Service"] },
      { name: "PC", drivers: ["Reducing no-show rates by proactively offering virtual appointments or later-day rescheduling options","92.5% Answer Percentage","Provider Schedule Change Requests","Patient Customer Service","Conducting outreach to patients who do not have a scheduled follow-up appointment."] }
    ]
  },
  {
    name: "Shared Services", color: "#10b981",
    divisions: [
      { name: "Referrals", drivers: ["Referrals contacted within 24 Hours","Referral Conversion Percentage","Appropriate Scheduling per Triage Rules","90% Answer Percentage","Strategic Referral Relationship Management"] },
      { name: "Therapy Scheduling", drivers: ["Prioritizing the identification and scheduling of open new patient appointments within the next 72 hours","Priority List Conversion Percentage","Appropriate Scheduling per Triage Rules","90% Answer Percentage","Coordinating with the Front Office to strategically fill in-person appointment openings within 24 hours"] },
      { name: "HIM", drivers: ["Uploading Referrals","Identifying and appropriately escalating subpoenas cases","Stat Referrals","Referral Partner Updates","Ensuring case closure within a 21-day timeframe"] }
    ]
  }
];

const TEAM_MEMBERS = ["Dustin","Jessica","Ami","Sydni","Marco"];
const CREDS = { username: "ABM2026", password: "Cowabunga" };

function daysAgo(ts) {
  return Math.floor((Date.now() - new Date(ts).getTime()) / 86400000);
}

function getBadges(status, comments, redSince) {
  const badges = [];
  const pendingCount = (comments || []).filter(c => c.status === "pending").length;
  const daysRed = redSince ? daysAgo(redSince) : 0;
  if (status === "red" && daysRed >= 7) badges.push({ label: "Stale", icon: "⚠️", cls: "bg-orange-500/20 text-orange-300 border-orange-500/40" });
  if (status === "red" && pendingCount >= 3) badges.push({ label: "High Risk", icon: "🔥", cls: "bg-red-500/20 text-red-300 border-red-500/40" });
  return badges;
}

// ── Supabase helpers ──────────────────────────────────────────────────────────
async function dbGet(table) {
  const { data } = await supabase.from(table).select("value").eq("id", "global").single();
  return data ? data.value : null;
}
async function dbSet(table, value) {
  await supabase.from(table).upsert({ id: "global", value, updated_at: new Date().toISOString() });
}

// ── Login ─────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [u, setU] = useState(""), [p, setP] = useState(""), [err, setErr] = useState("");
  const submit = () => {
    if (u === CREDS.username && p === CREDS.password) onLogin();
    else setErr("Invalid username or password.");
  };
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-900/40">
            <svg viewBox="0 0 40 40" className="w-9 h-9" fill="none">
              <polyline points="6,34 16,20 24,26 34,8" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="27,8 34,8 34,15" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">ABM Division Performance Tracker</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to continue</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1 block">Username</label>
            <input value={u} onChange={e => setU(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500" placeholder="Enter username" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1 block">Password</label>
            <input type="password" value={p} onChange={e => setP(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500" placeholder="Enter password" />
          </div>
          {err && <p className="text-red-400 text-xs">{err}</p>}
          <button onClick={submit} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg transition-colors">Sign In</button>
        </div>
      </div>
    </div>
  );
}

// ── Driver Card ───────────────────────────────────────────────────────────────
function DriverCard({ driver, idx, divisionName, status, comments, redSince, pinnedDrivers, onToggle, onAddComment, onTogglePin, meetingMode }) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [editingComment, setEditingComment] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [selectedUser, setSelectedUser] = useState(TEAM_MEMBERS[0]);
  const [commentStatus, setCommentStatus] = useState("pending");
  const isPinned = pinnedDrivers.includes(`${divisionName}-${idx}`);
  const badges = getBadges(status, comments, redSince);
  const isMainDriver = idx === 0;
  if (isMainDriver && status === "red") badges.push({ label: "High Impact", icon: "⭐", cls: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40" });
  const pendingComments = (comments || []).filter(c => c.status === "pending");
  const assignedMembers = [...new Set((comments || []).map(c => c.author))];
  const lastUpdated = comments?.length ? comments.reduce((a, b) => new Date(a.timestamp) > new Date(b.timestamp) ? a : b) : null;

  const handleSaveComment = () => {
    if (!commentText.trim()) return;
    onAddComment(divisionName, idx, { text: commentText.trim(), author: selectedUser, status: commentStatus, timestamp: new Date().toISOString() });
    setCommentText(""); setEditingComment(false); setCommentStatus("pending"); setSelectedUser(TEAM_MEMBERS[0]);
  };

  if (meetingMode && status === "green" && pendingComments.length === 0) return null;

  return (
    <div className={`rounded-lg border transition-all duration-200 ${status === "green" ? "border-emerald-700/40 bg-emerald-950/20" : "border-red-700/40 bg-red-950/20"} ${isPinned ? "ring-2 ring-yellow-500/50" : ""}`}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="flex items-start gap-2 p-3 cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <div className="flex flex-col items-center gap-1 flex-shrink-0 mt-0.5">
          <button onClick={e => { e.stopPropagation(); onToggle(); }}
            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 ${status === "green" ? "border-emerald-500 bg-emerald-500/20 hover:bg-emerald-500/40" : "border-red-500 bg-red-500/20 hover:bg-red-500/40"}`}>
            <div className={`w-3 h-3 rounded-full ${status === "green" ? "bg-emerald-400" : "bg-red-400"}`} />
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${isMainDriver ? "bg-slate-600 text-slate-200" : "bg-slate-800 text-slate-400"}`}>
              {isMainDriver ? "MAIN" : `P${idx + 1}`}
            </span>
            {badges.map(b => (
              <span key={b.label} className={`text-xs px-2 py-0.5 rounded border font-semibold ${b.cls}`}>{b.icon} {b.label}</span>
            ))}
            {comments?.length > 0 && <span className="text-xs text-slate-400 flex items-center gap-1"><MessageSquare className="w-3 h-3" />{comments.length}</span>}
            {lastUpdated && <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" />{daysAgo(lastUpdated.timestamp)}d ago</span>}
            {assignedMembers.length > 0 && <span className="text-xs text-slate-400 flex items-center gap-1"><Users className="w-3 h-3" />{assignedMembers.join(", ")}</span>}
          </div>
          <p className="text-sm text-slate-200 leading-snug">{driver}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <div className={`flex gap-1 transition-opacity duration-150 ${hovered ? "opacity-100" : "opacity-0"}`}>
            <button onClick={e => { e.stopPropagation(); onTogglePin(); }}
              className={`p-1.5 rounded text-xs transition-colors ${isPinned ? "bg-yellow-500/30 text-yellow-300" : "bg-slate-700 hover:bg-slate-600 text-slate-400"}`} title="Pin">
              <Pin className="w-3.5 h-3.5" />
            </button>
            <button onClick={e => { e.stopPropagation(); setExpanded(true); setEditingComment(true); }}
              className="p-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-400 transition-colors" title="Add comment">
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-500 ml-1" /> : <ChevronDown className="w-4 h-4 text-slate-500 ml-1" />}
        </div>
      </div>
      {expanded && (
        <div className="border-t border-slate-800 px-4 py-3 space-y-3">
          {(comments || []).length > 0 && (
            <div className="space-y-2">
              {comments.map((c, ci) => (
                <div key={ci} className={`border-l-4 pl-3 py-2 rounded-r ${c.status === "pending" ? "border-yellow-500 bg-yellow-900/20" : "border-blue-500 bg-blue-900/20"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-bold text-white">{c.author}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded border font-semibold ${c.status === "pending" ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/50" : "bg-blue-500/20 text-blue-300 border-blue-500/50"}`}>
                          {c.status === "pending" ? "PENDING" : "COMPLETE"}
                        </span>
                        <span className="text-xs text-slate-500">{daysAgo(c.timestamp)}d ago</span>
                      </div>
                      <p className="text-sm text-slate-300">{c.text}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => onAddComment(divisionName, idx, null, ci)}
                        className="p-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"><Check className="w-3.5 h-3.5" /></button>
                      <button onClick={() => onAddComment(divisionName, idx, null, ci, true)}
                        className="p-1.5 rounded bg-red-900/40 hover:bg-red-900/60 text-red-400 transition-colors"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {editingComment ? (
            <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-3 space-y-2">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-slate-400 mb-1 block">Assign To</label>
                  <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded p-1.5 text-xs focus:outline-none focus:border-emerald-500">
                    {TEAM_MEMBERS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-400 mb-1 block">Status</label>
                  <select value={commentStatus} onChange={e => setCommentStatus(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded p-1.5 text-xs focus:outline-none focus:border-emerald-500">
                    <option value="pending">Pending</option>
                    <option value="complete">Complete</option>
                  </select>
                </div>
              </div>
              <textarea value={commentText} onChange={e => setCommentText(e.target.value)}
                placeholder="Add a comment..." autoFocus
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded p-2 text-sm focus:outline-none focus:border-emerald-500 min-h-[60px] placeholder-slate-600" />
              <div className="flex gap-2">
                <button onClick={handleSaveComment} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded transition-colors">Save</button>
                <button onClick={() => setEditingComment(false)} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded transition-colors">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setEditingComment(true)} className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
              <Plus className="w-3 h-3" /> Add Comment
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Division Panel ────────────────────────────────────────────────────────────
function DivisionPanel({ division, statuses, comments, redSince, pinnedDrivers, onToggle, onAddComment, onTogglePin, filters, meetingMode }) {
  const drivers = division.drivers;
  const greenCount = drivers.filter((_, i) => statuses[i] === "green").length;
  const pct = Math.round((greenCount / drivers.length) * 100);
  const filtered = drivers.filter((_, i) => {
    const s = statuses[i]; const c = comments[i] || [];
    if (filters.status === "red" && s !== "red") return false;
    if (filters.status === "green" && s !== "green") return false;
    if (filters.assignedTo && !c.some(x => x.author === filters.assignedTo)) return false;
    if (filters.onlyWithComments && c.length === 0) return false;
    if (filters.onlyPending && !c.some(x => x.status === "pending")) return false;
    return true;
  });
  const pinned = filtered.filter(d => pinnedDrivers.includes(`${division.name}-${drivers.indexOf(d)}`));
  const unpinned = filtered.filter(d => !pinned.includes(d));
  const sorted = [...pinned, ...unpinned];
  if (sorted.length === 0 && meetingMode) return null;
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
        <h3 className="text-lg font-bold text-white">{division.name}</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">{pct}%</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${pct === 100 ? "bg-emerald-500/20 text-emerald-300" : pct >= 60 ? "bg-yellow-500/20 text-yellow-300" : "bg-red-500/20 text-red-300"}`}>
            {greenCount}/{drivers.length} on track
          </span>
        </div>
      </div>
      <div className="h-2 bg-slate-800 rounded-full mb-4 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: pct === 100 ? "#10b981" : pct >= 60 ? "#eab308" : "#ef4444" }} />
      </div>
      <div className="space-y-2">
        {sorted.length === 0
          ? <p className="text-slate-500 text-sm text-center py-4">No drivers match current filters</p>
          : sorted.map(driver => {
              const ri = drivers.indexOf(driver);
              return <DriverCard key={ri} driver={driver} idx={ri} divisionName={division.name}
                status={statuses[ri]} comments={comments[ri]} redSince={redSince?.[ri]}
                pinnedDrivers={pinnedDrivers} onToggle={() => onToggle(division.name, ri)}
                onAddComment={onAddComment} onTogglePin={() => onTogglePin(`${division.name}-${ri}`)}
                meetingMode={meetingMode} />;
            })}
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [statuses, setStatuses] = useState(() => {
    const s = {};
    departments.forEach(d => d.divisions.forEach(div => { s[div.name] = div.drivers.map(() => "green"); }));
    return s;
  });
  const [comments, setComments] = useState({});
  const [redSince, setRedSince] = useState({});
  const [pinnedDrivers, setPinnedDrivers] = useState([]);
  const [meetingMode, setMeetingMode] = useState(false);
  const [filters, setFilters] = useState({ status: "all", assignedTo: "", dept: "all", onlyWithComments: false, onlyPending: false });
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    try {
      const [s, c, r, p] = await Promise.all([
        dbGet("abm_statuses"), dbGet("abm_comments"),
        dbGet("abm_red_since"), dbGet("abm_pinned")
      ]);
      if (s) setStatuses(s);
      if (c) setComments(c);
      if (r) setRedSince(r);
      if (p) setPinnedDrivers(p);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadAll(); const iv = setInterval(loadAll, 6000); return () => clearInterval(iv); }, []);

  const toggleStatus = async (divName, idx) => {
    const next = statuses[divName][idx] === "green" ? "red" : "green";
    const newS = { ...statuses, [divName]: statuses[divName].map((s, i) => i === idx ? next : s) };
    setStatuses(newS); dbSet("abm_statuses", newS);
    const newRS = JSON.parse(JSON.stringify(redSince));
    if (next === "red") { if (!newRS[divName]) newRS[divName] = {}; newRS[divName][idx] = new Date().toISOString(); }
    else { if (newRS[divName]) delete newRS[divName][idx]; }
    setRedSince(newRS); dbSet("abm_red_since", newRS);
  };

  const handleComment = async (divName, idx, newComment, commentIdx, del = false) => {
    const key = `${divName}-${idx}`;
    const existing = comments[key] ? [...comments[key]] : [];
    let updated;
    if (newComment) updated = [...existing, newComment];
    else if (del) updated = existing.filter((_, i) => i !== commentIdx);
    else updated = existing.map((c, i) => i === commentIdx ? { ...c, status: c.status === "pending" ? "complete" : "pending" } : c);
    const newC = { ...comments, [key]: updated };
    setComments(newC); dbSet("abm_comments", newC);
  };

  const togglePin = async (key) => {
    const newP = pinnedDrivers.includes(key) ? pinnedDrivers.filter(k => k !== key) : [...pinnedDrivers, key];
    setPinnedDrivers(newP); dbSet("abm_pinned", newP);
  };

  const getComments = (divName, idx) => comments[`${divName}-${idx}`] || [];
  const getRedSince = (divName, idx) => redSince[divName]?.[idx];

  let totalGreen = 0, totalRed = 0;
  departments.forEach(d => d.divisions.forEach(div => div.drivers.forEach((_, i) => {
    statuses[div.name]?.[i] === "red" ? totalRed++ : totalGreen++;
  })));
  const totalDrivers = totalGreen + totalRed;

  const memberScores = TEAM_MEMBERS.map(m => {
    let pending = 0, complete = 0;
    Object.values(comments).forEach(arr => (arr || []).forEach(c => {
      if (c.author === m) c.status === "pending" ? pending++ : complete++;
    }));
    return { name: m, pending, complete, total: pending + complete };
  });

  const actionItems = {};
  TEAM_MEMBERS.forEach(m => { actionItems[m] = []; });
  departments.forEach(d => d.divisions.forEach(div => div.drivers.forEach((driver, idx) => {
    getComments(div.name, idx).filter(x => x.status === "pending").forEach(x => {
      actionItems[x.author]?.push({ dept: d.name, division: div.name, driver, comment: x.text, driverStatus: statuses[div.name]?.[idx], timestamp: x.timestamp, priority: idx === 0 ? "Main" : `P${idx + 1}` });
    });
  })));

  if (!loggedIn) return <LoginScreen onLogin={() => setLoggedIn(true)} />;
  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="text-slate-400 text-lg">Loading…</div></div>;

  const filteredDepts = departments.filter(d => filters.dept === "all" || d.name === filters.dept);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex flex-wrap gap-4 items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">ABM Division Performance Tracker</h1>
              <p className="text-slate-400 mt-1">Live · syncs every 6s · shared across team</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <div className="flex rounded-lg overflow-hidden border border-slate-700">
                <button onClick={() => setMeetingMode(false)} className={`px-4 py-2 text-sm font-semibold transition-colors ${!meetingMode ? "bg-slate-700 text-white" : "bg-transparent text-slate-400 hover:text-slate-300"}`}>Normal</button>
                <button onClick={() => setMeetingMode(true)} className={`px-4 py-2 text-sm font-semibold transition-colors ${meetingMode ? "bg-emerald-600 text-white" : "bg-transparent text-slate-400 hover:text-slate-300"}`}>🎬 Meeting Mode</button>
              </div>
              <button onClick={() => setLoggedIn(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg border border-slate-700 transition-colors">Sign Out</button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
            {[
              { label: "On Track", value: totalGreen, cls: "text-emerald-400" },
              { label: "Needs Attention", value: totalRed, cls: "text-red-400" },
              { label: "Total Drivers", value: totalDrivers, cls: "text-white" },
              { label: "Overall", value: `${Math.round((totalGreen / totalDrivers) * 100)}%`, cls: totalGreen / totalDrivers >= 0.7 ? "text-emerald-400" : "text-red-400" }
            ].map(s => (
              <div key={s.label} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 text-center">
                <div className={`text-3xl font-bold ${s.cls}`}>{s.value}</div>
                <div className="text-xs text-slate-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 h-3 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${Math.round((totalGreen / totalDrivers) * 100)}%` }} />
          </div>
        </div>

        {!meetingMode && (
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
            <div className="flex items-center gap-2 mb-3"><Filter className="w-4 h-4 text-slate-400" /><span className="text-sm font-semibold text-slate-300">Filters</span></div>
            <div className="flex flex-wrap gap-3">
              <div className="flex rounded-lg overflow-hidden border border-slate-700 text-sm">
                {[["all","All"],["green","🟢 On Track"],["red","🔴 Attention"]].map(([v,l]) => (
                  <button key={v} onClick={() => setFilters(f => ({...f, status: v}))} className={`px-3 py-1.5 font-medium transition-colors ${filters.status === v ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-300"}`}>{l}</button>
                ))}
              </div>
              <select value={filters.dept} onChange={e => setFilters(f => ({...f, dept: e.target.value}))} className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500">
                <option value="all">🏢 All Departments</option>
                {departments.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
              </select>
              <select value={filters.assignedTo} onChange={e => setFilters(f => ({...f, assignedTo: e.target.value}))} className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500">
                <option value="">👤 All Members</option>
                {TEAM_MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <button onClick={() => setFilters(f => ({...f, onlyWithComments: !f.onlyWithComments}))} className={`px-3 py-1.5 text-sm rounded-lg border transition-colors font-medium ${filters.onlyWithComments ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-300"}`}>💬 Has Comments</button>
              <button onClick={() => setFilters(f => ({...f, onlyPending: !f.onlyPending}))} className={`px-3 py-1.5 text-sm rounded-lg border transition-colors font-medium ${filters.onlyPending ? "bg-yellow-600 border-yellow-500 text-white" : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-300"}`}>⏳ Pending Only</button>
              <button onClick={() => setFilters({ status: "all", assignedTo: "", dept: "all", onlyWithComments: false, onlyPending: false })} className="px-3 py-1.5 text-sm rounded-lg border border-slate-700 bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors">Clear</button>
            </div>
          </div>
        )}

        {meetingMode && (
          <div className="bg-emerald-900/40 border border-emerald-700 rounded-xl p-4 text-center">
            <p className="text-emerald-300 font-bold text-lg">🎬 Meeting Mode — Showing only items needing attention</p>
          </div>
        )}

        {filteredDepts.map(dept => (
          <div key={dept.name}>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg mb-4 font-bold text-white text-xl" style={{ backgroundColor: dept.color }}>
              <Building2 className="w-5 h-5" /> {dept.name}
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              {dept.divisions.map(div => (
                <DivisionPanel key={div.name} division={div}
                  statuses={statuses[div.name] || []}
                  comments={div.drivers.reduce((acc, _, i) => { acc[i] = getComments(div.name, i); return acc; }, {})}
                  redSince={div.drivers.reduce((acc, _, i) => { acc[i] = getRedSince(div.name, i); return acc; }, {})}
                  pinnedDrivers={pinnedDrivers} onToggle={toggleStatus}
                  onAddComment={handleComment} onTogglePin={togglePin}
                  filters={filters} meetingMode={meetingMode} />
              ))}
            </div>
          </div>
        ))}

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h2 className="text-2xl font-bold text-white mb-5 flex items-center gap-2"><BarChart3 className="w-6 h-6 text-emerald-400" /> Team Performance Scorecard</h2>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {memberScores.map(m => (
              <div key={m.name} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-2">{m.name[0]}</div>
                <div className="font-bold text-white text-sm">{m.name}</div>
                <div className="mt-2 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400"><span>Pending</span><span className="text-yellow-300 font-bold">{m.pending}</span></div>
                  <div className="flex justify-between text-slate-400"><span>Complete</span><span className="text-emerald-300 font-bold">{m.complete}</span></div>
                  <div className="flex justify-between text-slate-400"><span>Total</span><span className="text-white font-bold">{m.total}</span></div>
                </div>
                {m.total > 0 && <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.round((m.complete / m.total) * 100)}%` }} /></div>}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h2 className="text-2xl font-bold text-white mb-5 flex items-center gap-2"><MessageSquare className="w-6 h-6 text-emerald-400" /> Action Items Before Next Meeting</h2>
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {TEAM_MEMBERS.map(m => {
              const items = actionItems[m] || [];
              return (
                <div key={m} className="bg-slate-800/40 border border-slate-700 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-700">
                    <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center text-white font-bold shadow">{m[0]}</div>
                    <div><div className="font-bold text-white">{m}</div><div className="text-xs text-slate-400">{items.length} pending task{items.length !== 1 ? "s" : ""}</div></div>
                  </div>
                  {items.length === 0
                    ? <div className="text-center py-5 text-slate-500 text-sm">✓ All caught up</div>
                    : <div className="space-y-2 max-h-64 overflow-y-auto">
                        {items.sort((a, b) => a.driverStatus === "red" ? -1 : 1).map((it, i) => (
                          <div key={i} className={`p-2.5 rounded border-l-4 text-xs ${it.driverStatus === "red" ? "bg-red-950/30 border-red-500" : "bg-slate-700/30 border-emerald-500"}`}>
                            <div className="text-slate-400 mb-1">{it.division} · {it.priority}</div>
                            <div className="text-slate-300 font-medium mb-1 leading-snug">{it.driver}</div>
                            <div className="text-slate-400 italic">"{it.comment}"</div>
                            <div className="text-slate-500 mt-1">{daysAgo(it.timestamp)}d ago</div>
                          </div>
                        ))}
                      </div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
