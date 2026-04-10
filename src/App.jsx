import { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { X, Check, ChevronDown, ChevronUp, Filter, Users, Clock, Pin, Plus, BarChart3, MessageSquare, Building2, Settings, Home, Flag, CheckSquare, Menu, Pencil } from "lucide-react";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      }
    }
  }
);

const LOGINS = {
  Dustin:    { password: "Turtles2323!", isAdmin: true },
  Jessica:   { password: "Pizza4Life!", isAdmin: false },
  Ty:        { password: "ShellYeah23!", isAdmin: false },
  Charlotte: { password: "NinjaPower!", isAdmin: false },
  Sydni:     { password: "Booyakasha1!", isAdmin: false },
  Marco:     { password: "RadicalDude!", isAdmin: false },
};

const TEAM_MEMBERS = ["Jessica","Ty","Charlotte","Sydni","Marco"];

const departments = [
  { name: "Clinic Operations", color: "#3b82f6", divisions: [
    { name: "Front Office", drivers: ["Copay Collection","Insurance Verification","Daily review and reconciliation of completed and no-show appointments","Form Completion","Provider Support"] },
    { name: "PVP", drivers: ["Insurance Confirmation and Copay Determination for New Patients","Virtual Copays","Balance Collection","MEDUSA Worksheet","Front Desk Support"] }
  ]},
  { name: "Shared Services", color: "#10b981", divisions: [
    { name: "Intake", drivers: ["Prioritizing identification and scheduling of open new patient appointments within 72 hours","Appropriate Scheduling per Triage Rules","92.5% Answer Percentage","Working New Patient Wait List","Patient Customer Service"] },
    { name: "PC", drivers: ["Reducing no-show rates by proactively offering virtual appointments or later-day rescheduling","92.5% Answer Percentage","Provider Schedule Change Requests","Patient Customer Service","Outreach to patients without a scheduled follow-up appointment"] },
    { name: "Referrals", drivers: ["Referrals contacted within 24 Hours","Referral Conversion Percentage","Appropriate Scheduling per Triage Rules","90% Answer Percentage","Strategic Referral Relationship Management"] },
    { name: "Therapy Scheduling", drivers: ["Prioritizing identification and scheduling of open new patient appointments within 72 hours","Priority List Conversion Percentage","Appropriate Scheduling per Triage Rules","90% Answer Percentage","Coordinating with Front Office to fill in-person openings within 24 hours"] },
    { name: "HIM", drivers: ["Uploading Referrals","Identifying and escalating subpoenas cases","Stat Referrals","Referral Partner Updates","Ensuring case closure within 21 days"] }
  ]}
];

const DIVISION_METRICS = {
  "Front Office": [
    { key: "copayCollection", label: "Copay Collection %", target: 92.5, unit: "%", higherIsBetter: true },
    { key: "notCheckedOut", label: "Appts Not Checked Out", target: 0, unit: "", higherIsBetter: false },
    { key: "inactiveInsurance", label: "Inactive Insurance Follow-ups", target: 0, unit: "", higherIsBetter: false },
  ],
  "PVP": [
    { key: "virtualCopay", label: "Virtual Copay Collection %", target: 82.5, unit: "%", higherIsBetter: true },
    { key: "smallBalances", label: "Small Balances from Last Week", target: 0, unit: "", higherIsBetter: false },
  ],
  "PC": [{ key: "phoneAnswer", label: "Phone Answer %", target: 92.5, unit: "%", higherIsBetter: true }],
  "Intake": [{ key: "phoneAnswer", label: "Phone Answer %", target: 92.5, unit: "%", higherIsBetter: true }],
  "Referrals": [{ key: "referralConversion", label: "Referral Conversion %", target: 75, unit: "%", higherIsBetter: true }],
  "Therapy Scheduling": [{ key: "priorityConversion", label: "Priority List Conversion %", target: 75, unit: "%", higherIsBetter: true }],
  "HIM": [{ key: "casesOver21", label: "Cases Over 21 Days", target: 0, unit: "%", higherIsBetter: false }],
};

const FTE_STRUCTURE = {
  "Shared Services": ["Intake", "Patient Concierge", "Therapy Scheduling", "Referrals", "HIM"],
  "Operations": ["Front Desk", "PVP"],
};

const DEFAULT_FTE = () => {
  const init = {};
  Object.entries(FTE_STRUCTURE).forEach(([div, depts]) => {
    init[div] = {};
    depts.forEach(dept => { init[div][dept] = { fte: 0, requisitions: [] }; });
  });
  return init;
};

async function dbGet(table) {
  const { data, error } = await supabase.from(table).select("value").eq("id", "global").maybeSingle();
  if (error) console.error(`dbGet error (${table}):`, error);
  return data ? data.value : null;
}
async function dbSet(table, value) {
  const { error } = await supabase.from(table).upsert({ id: "global", value, updated_at: new Date().toISOString() });
  if (error) console.error(`dbSet error (${table}):`, error);
}

function getWeekKey(date = new Date()) {
  const d = new Date(date);
  d.setHours(0,0,0,0);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().split("T")[0];
}

function getLast26Weeks() {
  const weeks = [];
  const now = new Date();
  for (let i = 25; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - d.getDay() - i * 7);
    weeks.push(getWeekKey(d));
  }
  return weeks;
}

function daysAgo(ts) { return Math.floor((Date.now() - new Date(ts).getTime()) / 86400000); }

function getBadges(status, comments, isMain) {
  const badges = [];
  const pendingCount = (comments || []).filter(c => c.status === "pending").length;
  if (status === "red" && pendingCount >= 3) badges.push({ label: "High Risk", icon: "🔥", cls: "bg-red-500/20 text-red-300 border-red-500/40" });
  if (isMain && status === "red") badges.push({ label: "High Impact", icon: "⭐", cls: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40" });
  return badges;
}

function HealthCircle({ pct }) {
  const r = 54, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 80 ? "#10b981" : pct >= 60 ? "#eab308" : "#ef4444";
  const label = pct >= 80 ? "Excellent" : pct >= 60 ? "Good" : "At Risk";
  return (
    <div className="flex flex-col items-center justify-center">
      <svg viewBox="0 0 130 130" className="w-36 h-36">
        <circle cx="65" cy="65" r={r} fill="none" stroke="#1e293b" strokeWidth="12"/>
        <circle cx="65" cy="65" r={r} fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 65 65)"/>
        <text x="65" y="60" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">{pct}%</text>
        <text x="65" y="78" textAnchor="middle" fill="#94a3b8" fontSize="11">{label}</text>
      </svg>
    </div>
  );
}

function Gauge({ value, target, label, unit, higherIsBetter }) {
  const hasValue = value !== "" && value !== null && value !== undefined;
  const numVal = parseFloat(value);
  let pct = 0, color = "#475569", statusLabel = "No Data";
  if (hasValue) {
    if (target === 0) {
      if (numVal === 0) { pct = 100; color = "#10b981"; statusLabel = "On Target"; }
      else if (numVal <= 3) { pct = 60; color = "#eab308"; statusLabel = "Close"; }
      else { pct = 20; color = "#ef4444"; statusLabel = "Below"; }
    } else if (higherIsBetter) {
      pct = Math.min((numVal / target) * 100, 100);
      color = pct >= 100 ? "#10b981" : pct >= 85 ? "#eab308" : "#ef4444";
      statusLabel = pct >= 100 ? "On Target" : pct >= 85 ? "Close" : "Below";
    }
  }
  const circumference = Math.PI * 54;
  const dash = (pct / 100) * circumference;
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 120 70" className="w-24 h-14">
        <path d="M 10 65 A 54 54 0 0 1 110 65" fill="none" stroke="#1e293b" strokeWidth="10" strokeLinecap="round"/>
        <path d="M 10 65 A 54 54 0 0 1 110 65" fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={`${dash} ${circumference}`}/>
        <text x="60" y="58" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
          {hasValue ? `${value}${unit}` : "—"}
        </text>
      </svg>
      <div className="text-center">
        <div className="text-xs text-slate-400 leading-tight px-1">{label}</div>
        <div className="text-xs font-semibold" style={{ color }}>{statusLabel}</div>
        <div className="text-xs text-slate-600">Goal: {target === 0 ? "0" : `${target}${unit}`}</div>
      </div>
    </div>
  );
}

function TrendChart({ history, metricDef, weeks }) {
  const W = 300, H = 90, pad = { l: 28, r: 8, t: 8, b: 20 };
  const innerW = W - pad.l - pad.r, innerH = H - pad.t - pad.b;
  const vals = weeks.map(w => history[w] ? parseFloat(history[w][metricDef.key]) : null);
  const defined = vals.filter(v => v !== null && !isNaN(v));
  if (defined.length === 0) return <div className="text-center text-slate-500 text-xs py-3">No historical data yet</div>;
  const maxVal = metricDef.target === 0 ? Math.max(...defined, 5) : Math.max(metricDef.target * 1.1, ...defined);
  const barW = innerW / weeks.length;
  const toY = v => pad.t + innerH - ((v / maxVal)) * innerH;
  const toX = i => pad.l + i * barW + barW / 2;
  const points = vals.map((v, i) => v !== null && !isNaN(v) ? `${toX(i)},${toY(v)}` : null).filter(Boolean);
  const targetY = metricDef.target === 0 ? null : toY(metricDef.target);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-20">
      {targetY && <line x1={pad.l} y1={targetY} x2={W-pad.r} y2={targetY} stroke="#10b981" strokeWidth="1" strokeDasharray="3 2" opacity="0.5"/>}
      {vals.map((v, i) => {
        if (v === null || isNaN(v)) return null;
        const bh = (v / maxVal) * innerH;
        const color = metricDef.target === 0 ? (v === 0 ? "#10b981" : v <= 3 ? "#eab308" : "#ef4444") : (v >= metricDef.target ? "#10b981" : v >= metricDef.target * 0.85 ? "#eab308" : "#ef4444");
        return <rect key={i} x={pad.l + i * barW + barW * 0.15} y={toY(v)} width={barW * 0.7} height={bh} fill={color} opacity="0.7" rx="1"/>;
      })}
      {points.length > 1 && <polyline points={points.join(" ")} fill="none" stroke="white" strokeWidth="1.5" opacity="0.7" strokeLinecap="round" strokeLinejoin="round"/>}
      {weeks.map((w, i) => i % 6 === 0 ? <text key={i} x={toX(i)} y={H-4} textAnchor="middle" fill="#64748b" fontSize="7">{w.slice(5)}</text> : null)}
    </svg>
  );
}

function DriverCard({ driver, idx, divisionName, status, comments, pinnedDrivers, onToggle, onAddComment, onTogglePin }) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [editingComment, setEditingComment] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [selectedUser, setSelectedUser] = useState(TEAM_MEMBERS[0]);
  const [commentStatus, setCommentStatus] = useState("pending");
  const isPinned = pinnedDrivers.includes(`${divisionName}-${idx}`);
  const isMain = idx === 0;
  const badges = getBadges(status, comments, isMain);
  const assignedMembers = [...new Set((comments || []).map(c => c.author))];
  const lastUpdated = comments?.length ? comments.reduce((a, b) => new Date(a.timestamp) > new Date(b.timestamp) ? a : b) : null;
  const handleSave = () => {
    if (!commentText.trim()) return;
    onAddComment(divisionName, idx, { text: commentText.trim(), author: selectedUser, status: commentStatus, timestamp: new Date().toISOString() });
    setCommentText(""); setEditingComment(false);
  };
  return (
    <div className={`rounded-lg border transition-all ${status === "green" ? "border-emerald-700/40 bg-emerald-950/20" : "border-red-700/40 bg-red-950/20"} ${isPinned ? "ring-2 ring-yellow-500/50" : ""}`}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="flex items-start gap-2 p-3 cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <button onClick={e => { e.stopPropagation(); onToggle(); }}
          className={`mt-0.5 w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center hover:scale-110 transition-all ${status === "green" ? "border-emerald-500 bg-emerald-500/20" : "border-red-500 bg-red-500/20"}`}>
          <div className={`w-2.5 h-2.5 rounded-full ${status === "green" ? "bg-emerald-400" : "bg-red-400"}`}/>
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${isMain ? "bg-slate-600 text-slate-200" : "bg-slate-800 text-slate-400"}`}>{isMain ? "MAIN" : `P${idx+1}`}</span>
            {badges.map(b => <span key={b.label} className={`text-xs px-1.5 py-0.5 rounded border font-semibold ${b.cls}`}>{b.icon} {b.label}</span>)}
            {comments?.length > 0 && <span className="text-xs text-slate-400 flex items-center gap-1"><MessageSquare className="w-3 h-3"/>{comments.length}</span>}
            {lastUpdated && <span className="text-xs text-slate-500">{daysAgo(lastUpdated.timestamp)}d ago</span>}
            {assignedMembers.length > 0 && <span className="text-xs text-slate-400">{assignedMembers.join(", ")}</span>}
          </div>
          <p className="text-sm text-slate-200 leading-snug">{driver}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <div className={`flex gap-1 transition-opacity ${hovered ? "opacity-100" : "opacity-0"}`}>
            <button onClick={e => { e.stopPropagation(); onTogglePin(); }} className={`p-1 rounded ${isPinned ? "bg-yellow-500/30 text-yellow-300" : "bg-slate-700 text-slate-400"}`}><Pin className="w-3 h-3"/></button>
            <button onClick={e => { e.stopPropagation(); setExpanded(true); setEditingComment(true); }} className="p-1 rounded bg-slate-700 text-slate-400"><MessageSquare className="w-3 h-3"/></button>
          </div>
          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-500"/> : <ChevronDown className="w-3.5 h-3.5 text-slate-500"/>}
        </div>
      </div>
      {expanded && (
        <div className="border-t border-slate-800 px-3 py-2 space-y-2">
          {(comments || []).map((c, ci) => (
            <div key={ci} className={`border-l-4 pl-3 py-1.5 rounded-r text-xs ${c.status === "pending" ? "border-yellow-500 bg-yellow-900/20" : "border-blue-500 bg-blue-900/20"}`}>
              <div className="flex justify-between gap-2">
                <div>
                  <span className="font-bold text-white mr-2">{c.author}</span>
                  <span className={`px-1.5 py-0.5 rounded border font-semibold ${c.status === "pending" ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/50" : "bg-blue-500/20 text-blue-300 border-blue-500/50"}`}>{c.status === "pending" ? "PENDING" : "COMPLETE"}</span>
                  <span className="text-slate-500 ml-2">{daysAgo(c.timestamp)}d ago</span>
                  <p className="text-slate-300 mt-1">{c.text}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => onAddComment(divisionName, idx, null, ci)} className="p-1 rounded bg-slate-700 text-slate-300"><Check className="w-3 h-3"/></button>
                  <button onClick={() => onAddComment(divisionName, idx, null, ci, true)} className="p-1 rounded bg-red-900/40 text-red-400"><X className="w-3 h-3"/></button>
                </div>
              </div>
            </div>
          ))}
          {editingComment ? (
            <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-2 space-y-2">
              <div className="flex gap-2">
                <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 rounded p-1 text-xs">
                  {TEAM_MEMBERS.map(m => <option key={m}>{m}</option>)}
                </select>
                <select value={commentStatus} onChange={e => setCommentStatus(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 rounded p-1 text-xs">
                  <option value="pending">Pending</option>
                  <option value="complete">Complete</option>
                </select>
              </div>
              <textarea value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Add a comment..." autoFocus
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded p-1.5 text-xs min-h-[50px] placeholder-slate-600"/>
              <div className="flex gap-2">
                <button onClick={handleSave} className="px-2 py-1 bg-emerald-600 text-white text-xs font-bold rounded">Save</button>
                <button onClick={() => setEditingComment(false)} className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setEditingComment(true)} className="text-xs text-emerald-400 font-semibold flex items-center gap-1"><Plus className="w-3 h-3"/> Add Comment</button>
          )}
        </div>
      )}
    </div>
  );
}

function DivisionMetricsSection({ division, metricsHistory, assignedTo, currentUser, isAdmin, onEnterMetrics }) {
  const [showHistory, setShowHistory] = useState(false);
  const divMetrics = DIVISION_METRICS[division] || [];
  const weeks = getLast26Weeks();
  const currentWeek = getWeekKey();
  const currentData = metricsHistory[currentWeek] || {};
  const hasCurrentData = divMetrics.some(dm => currentData[dm.key] !== "" && currentData[dm.key] !== undefined);
  const canEdit = currentUser === assignedTo || isAdmin;
  const needsEntry = canEdit && !hasCurrentData;
  return (
    <div className="mb-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Weekly Metrics</span>
          {assignedTo && <span className="text-xs text-slate-500">· {assignedTo}</span>}
          {needsEntry && <span className="text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 px-1.5 py-0.5 rounded font-semibold animate-pulse">Entry Needed</span>}
        </div>
        <div className="flex items-center gap-2">
          {canEdit && <button onClick={() => onEnterMetrics(division)} className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded transition-colors">{hasCurrentData ? "Update" : "Enter"}</button>}
          <button onClick={() => setShowHistory(h => !h)} className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1">
            Trend {showHistory ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>}
          </button>
        </div>
      </div>
      <div className="p-3">
        {!hasCurrentData ? (
          <div className="text-center py-2 text-slate-500 text-xs">{canEdit ? "Click Enter to add this week's metrics" : "Waiting for metrics"}</div>
        ) : (
          <div className={`grid gap-2 ${divMetrics.length === 1 ? "grid-cols-1 max-w-[100px] mx-auto" : divMetrics.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
            {divMetrics.map(dm => <Gauge key={dm.key} value={currentData[dm.key]} target={dm.target} label={dm.label} unit={dm.unit} higherIsBetter={dm.higherIsBetter}/>)}
          </div>
        )}
      </div>
      {showHistory && (
        <div className="border-t border-slate-700/50 p-3 space-y-3">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Last 6 Months</p>
          {divMetrics.map(dm => (
            <div key={dm.key}>
              <p className="text-xs text-slate-400 mb-1">{dm.label}</p>
              <TrendChart history={metricsHistory} metricDef={dm} weeks={weeks}/>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DivisionPanel({ division, statuses, comments, pinnedDrivers, onToggle, onAddComment, onTogglePin, metricsHistory, assignments, currentUser, isAdmin, onEnterMetrics, meetingMode = false, filters = {} }) {
  const drivers = division.drivers;
  const greenCount = drivers.filter((_, i) => statuses[i] === "green").length;
  const pct = Math.round((greenCount / drivers.length) * 100);
  const visibleDrivers = drivers.filter((_, i) => {
    const s = statuses[i];
    const c = comments[i] || [];
    if (meetingMode) return s === "red" || c.some(x => x.status === "pending");
    if (filters.status === "red") return s === "red";
    if (filters.status === "green") return s === "green";
    return true;
  });
  const pinned = visibleDrivers.filter(d => pinnedDrivers.includes(`${division.name}-${drivers.indexOf(d)}`));
  const sorted = [...pinned, ...visibleDrivers.filter(d => !pinned.includes(d))];
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
        <h3 className="text-base font-bold text-white">{division.name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{pct}%</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${pct === 100 ? "bg-emerald-500/20 text-emerald-300" : pct >= 60 ? "bg-yellow-500/20 text-yellow-300" : "bg-red-500/20 text-red-300"}`}>{greenCount}/{drivers.length}</span>
        </div>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full mb-3 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: pct === 100 ? "#10b981" : pct >= 60 ? "#eab308" : "#ef4444" }}/>
      </div>
      {DIVISION_METRICS[division.name] && (
        <DivisionMetricsSection division={division.name} metricsHistory={metricsHistory[division.name] || {}}
          assignedTo={assignments[division.name]} currentUser={currentUser} isAdmin={isAdmin} onEnterMetrics={onEnterMetrics}/>
      )}
      <div className="space-y-2">
        {sorted.length === 0
          ? <p className="text-slate-500 text-sm text-center py-3">No drivers match current filter</p>
          : sorted.map(driver => {
              const ri = drivers.indexOf(driver);
              return <DriverCard key={ri} driver={driver} idx={ri} divisionName={division.name}
                status={statuses[ri]} comments={comments[ri]}
                pinnedDrivers={pinnedDrivers} onToggle={() => onToggle(division.name, ri)}
                onAddComment={onAddComment} onTogglePin={() => onTogglePin(`${division.name}-${ri}`)}/>;
            })}
      </div>
    </div>
  );
}

function EnterMetricsModal({ division, history, onSave, onClose }) {
  const divMetrics = DIVISION_METRICS[division] || [];
  const weekKey = getWeekKey();
  const existing = history[weekKey] || {};
  const [form, setForm] = useState(() => {
    const f = { weekEnding: weekKey };
    divMetrics.forEach(dm => { f[dm.key] = existing[dm.key] || ""; });
    return f;
  });
  const set = (k, v) => setForm(f => ({...f, [k]: v}));
  return (
    <div style={{position:"fixed",inset:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.7)"}} onClick={onClose}>
      <div style={{background:"#0f172a",border:"1px solid #334155",borderRadius:"1rem",padding:"1.5rem",width:"100%",maxWidth:"24rem",boxShadow:"0 25px 50px rgba(0,0,0,0.5)"}} onClick={e => e.stopPropagation()}>
        <h2 style={{color:"white",fontWeight:"bold",fontSize:"1.1rem",marginBottom:"0.25rem"}}>Enter Weekly Metrics</h2>
        <p style={{color:"#34d399",fontSize:"0.875rem",fontWeight:"600",marginBottom:"1rem"}}>{division} · Week of {weekKey}</p>
        <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
          {divMetrics.map(dm => (
            <div key={dm.key}>
              <label style={{display:"block",color:"#94a3b8",fontSize:"0.75rem",fontWeight:"600",marginBottom:"0.25rem"}}>{dm.label} (goal: {dm.target === 0 ? "0" : `${dm.target}${dm.unit}`})</label>
              <input type="number" value={form[dm.key]} onChange={e => set(dm.key, e.target.value)} placeholder="Enter value"
                style={{width:"100%",background:"#1e293b",border:"1px solid #334155",color:"white",borderRadius:"0.5rem",padding:"0.5rem 0.75rem",fontSize:"0.875rem",outline:"none",boxSizing:"border-box"}}/>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:"0.75rem",marginTop:"1.25rem"}}>
          <button onClick={() => onSave(division, weekKey, form)} style={{flex:1,background:"#059669",color:"white",fontWeight:"bold",padding:"0.625rem",borderRadius:"0.5rem",border:"none",cursor:"pointer",fontSize:"0.875rem"}}>Save</button>
          <button onClick={onClose} style={{flex:1,background:"#334155",color:"#cbd5e1",fontWeight:"bold",padding:"0.625rem",borderRadius:"0.5rem",border:"none",cursor:"pointer",fontSize:"0.875rem"}}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function FteDeptCard({ division, dept, fte, requisitions, isAdmin, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [localFte, setLocalFte] = useState(fte);
  const [localReqs, setLocalReqs] = useState([...requisitions]);
  const [newReq, setNewReq] = useState("");
  const handleOpen = () => { setLocalFte(fte); setLocalReqs([...requisitions]); setNewReq(""); setEditing(true); };
  const handleSave = () => { onUpdate(division, dept, { fte: parseInt(localFte) || 0, requisitions: localReqs }); setEditing(false); };
  const handleAddReq = () => { if (!newReq.trim()) return; setLocalReqs(r => [...r, newReq.trim()]); setNewReq(""); };
  const handleRemoveReq = (i) => setLocalReqs(r => r.filter((_, ri) => ri !== i));
  return (
    <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:"0.75rem",padding:"1rem"}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:"0.75rem",paddingBottom:"0.75rem",borderBottom:"1px solid #1e293b"}}>
        <div>
          <div style={{color:"white",fontWeight:"bold",fontSize:"0.95rem"}}>{dept}</div>
          <div style={{color:"#64748b",fontSize:"0.75rem"}}>{division}</div>
        </div>
        {isAdmin && !editing && (
          <button onClick={handleOpen} style={{background:"#059669",color:"white",border:"none",borderRadius:"0.4rem",padding:"0.3rem 0.6rem",fontSize:"0.75rem",fontWeight:"bold",cursor:"pointer"}}>Edit</button>
        )}
        {isAdmin && editing && (
          <div style={{display:"flex",gap:"0.4rem"}}>
            <button onClick={handleSave} style={{background:"#059669",color:"white",border:"none",borderRadius:"0.4rem",padding:"0.3rem 0.6rem",fontSize:"0.75rem",fontWeight:"bold",cursor:"pointer"}}>Save</button>
            <button onClick={() => setEditing(false)} style={{background:"#334155",color:"#cbd5e1",border:"none",borderRadius:"0.4rem",padding:"0.3rem 0.6rem",fontSize:"0.75rem",cursor:"pointer"}}>Cancel</button>
          </div>
        )}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"0.75rem"}}>
        <div style={{width:"2.75rem",height:"2.75rem",background:"rgba(16,185,129,0.15)",border:"1px solid rgba(16,185,129,0.4)",borderRadius:"0.6rem",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          {editing ? (
            <input type="number" min="0" value={localFte} onChange={e => setLocalFte(e.target.value)}
              style={{width:"2.2rem",background:"transparent",border:"none",color:"#34d399",fontWeight:"bold",fontSize:"1rem",textAlign:"center",outline:"none"}}/>
          ) : (
            <span style={{color:"#34d399",fontWeight:"bold",fontSize:"1.2rem"}}>{fte}</span>
          )}
        </div>
        <div>
          <div style={{color:"white",fontSize:"0.875rem",fontWeight:"600"}}>Current FTEs</div>
          <div style={{color:"#64748b",fontSize:"0.75rem"}}>Full-time equivalents</div>
        </div>
      </div>
      <div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.4rem"}}>
          <span style={{color:"#94a3b8",fontSize:"0.7rem",fontWeight:"600",textTransform:"uppercase",letterSpacing:"0.05em"}}>Open Requisitions</span>
          {(editing ? localReqs : requisitions).length > 0 && (
            <span style={{background:"rgba(234,179,8,0.2)",color:"#fde047",border:"1px solid rgba(234,179,8,0.4)",borderRadius:"0.3rem",padding:"0.1rem 0.4rem",fontSize:"0.7rem",fontWeight:"bold"}}>
              {(editing ? localReqs : requisitions).length}
            </span>
          )}
        </div>
        {!editing && (
          requisitions.length === 0
            ? <p style={{color:"#475569",fontSize:"0.75rem",fontStyle:"italic"}}>No open requisitions</p>
            : requisitions.map((req, i) => (
                <div key={i} style={{display:"flex",alignItems:"center",gap:"0.4rem",background:"rgba(234,179,8,0.1)",border:"1px solid rgba(234,179,8,0.25)",borderRadius:"0.4rem",padding:"0.35rem 0.5rem",marginBottom:"0.3rem"}}>
                  <div style={{width:"0.4rem",height:"0.4rem",borderRadius:"50%",background:"#fbbf24",flexShrink:0}}/>
                  <span style={{color:"#fde68a",fontSize:"0.75rem"}}>{req}</span>
                </div>
              ))
        )}
        {editing && (
          <div>
            {localReqs.map((req, i) => (
              <div key={i} style={{display:"flex",alignItems:"center",gap:"0.4rem",background:"#1e293b",border:"1px solid #334155",borderRadius:"0.4rem",padding:"0.35rem 0.5rem",marginBottom:"0.3rem"}}>
                <span style={{flex:1,color:"#e2e8f0",fontSize:"0.75rem"}}>{req}</span>
                <button onClick={() => handleRemoveReq(i)} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",padding:"0",lineHeight:1,fontSize:"0.85rem"}}>✕</button>
              </div>
            ))}
            <div style={{display:"flex",gap:"0.4rem",marginTop:"0.4rem"}}>
              <input value={newReq} onChange={e => setNewReq(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAddReq()}
                placeholder="Add job title..."
                style={{flex:1,background:"#1e293b",border:"1px solid #334155",color:"white",borderRadius:"0.4rem",padding:"0.35rem 0.5rem",fontSize:"0.75rem",outline:"none"}}/>
              <button onClick={handleAddReq} style={{background:"#059669",color:"white",border:"none",borderRadius:"0.4rem",padding:"0.35rem 0.6rem",fontSize:"0.75rem",fontWeight:"bold",cursor:"pointer"}}>Add</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [u, setU] = useState(""), [p, setP] = useState(""), [err, setErr] = useState("");
  const submit = () => {
    const user = LOGINS[u];
    if (user && user.password === p) onLogin(u, user.isAdmin);
    else setErr("Invalid username or password.");
  };
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg">
            <svg viewBox="0 0 40 40" className="w-9 h-9" fill="none">
              <polyline points="6,34 16,20 24,26 34,8" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="27,8 34,8 34,15" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">ABM Division Tracker</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to continue</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1 block">Username</label>
            <input value={u} onChange={e => setU(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500" placeholder="Enter your name"/>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1 block">Password</label>
            <input type="password" value={p} onChange={e => setP(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500" placeholder="Enter password"/>
          </div>
          {err && <p className="text-red-400 text-xs">{err}</p>}
          <button onClick={submit} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg transition-colors">Sign In</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activePage, setActivePage] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [statuses, setStatuses] = useState(() => {
    const s = {};
    departments.forEach(d => d.divisions.forEach(div => { s[div.name] = div.drivers.map(() => "green"); }));
    return s;
  });
  const [comments, setComments] = useState({});
  const [redSince, setRedSince] = useState({});
  const [pinnedDrivers, setPinnedDrivers] = useState([]);
  const [metricsHistory, setMetricsHistory] = useState({});
  const [assignments, setAssignments] = useState({});
  const [fteData, setFteData] = useState(DEFAULT_FTE());
  const [enteringMetricsDiv, setEnteringMetricsDiv] = useState(null);
  const [meetingMode, setMeetingMode] = useState(false);
  const [showMikey, setShowMikey] = useState(false);
  const [dismissedBanner, setDismissedBanner] = useState(false);
  const [filters, setFilters] = useState({ status: "all" });

  const loadAll = async () => {
    try {
      const [s, c, r, p, m, a, f] = await Promise.all([
        dbGet("abm_statuses"), dbGet("abm_comments"), dbGet("abm_red_since"),
        dbGet("abm_pinned"), dbGet("abm_metrics_history"), dbGet("abm_assignments"), dbGet("abm_fte")
      ]);
      if (s) setStatuses(s);
      if (c) setComments(c);
      if (r) setRedSince(r);
      if (p) setPinnedDrivers(p);
      if (m) setMetricsHistory(m);
      if (a) setAssignments(a);
      if (f) setFteData(f);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadAll(); const iv = setInterval(loadAll, 6000); return () => clearInterval(iv); }, []);

  const toggleStatus = async (divName, idx) => {
    const next = statuses[divName][idx] === "green" ? "red" : "green";
    const newS = { ...statuses, [divName]: statuses[divName].map((v, i) => i === idx ? next : v) };
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

  const handleSaveMetrics = async (division, weekKey, form) => {
    const newM = { ...metricsHistory, [division]: { ...(metricsHistory[division] || {}), [weekKey]: form } };
    setMetricsHistory(newM); dbSet("abm_metrics_history", newM);
    setEnteringMetricsDiv(null);
  };

  const handleSaveAssignments = async (newA) => {
    setAssignments(newA); dbSet("abm_assignments", newA);
  };

  const handleFteUpdate = async (division, dept, data) => {
    const newF = { ...fteData, [division]: { ...fteData[division], [dept]: data } };
    setFteData(newF); dbSet("abm_fte", newF);
  };

  const getComments = (divName, idx) => comments[`${divName}-${idx}`] || [];

  let totalGreen = 0, totalRed = 0, totalPending = 0;
  departments.forEach(d => d.divisions.forEach(div => div.drivers.forEach((_, i) => {
    statuses[div.name]?.[i] === "red" ? totalRed++ : totalGreen++;
  })));
  Object.values(comments).forEach(arr => (arr||[]).forEach(c => { if (c.status === "pending") totalPending++; }));
  const totalDrivers = totalGreen + totalRed;
  const healthPct = Math.round((totalGreen / totalDrivers) * 100);

  const memberScores = Object.keys(LOGINS).map(m => {
    let pending = 0, complete = 0;
    Object.values(comments).forEach(arr => (arr||[]).forEach(c => { if (c.author === m) c.status === "pending" ? pending++ : complete++; }));
    return { name: m, pending, complete, total: pending + complete };
  });

  const actionItems = {};
  Object.keys(LOGINS).forEach(m => { actionItems[m] = []; });
  departments.forEach(d => d.divisions.forEach(div => div.drivers.forEach((driver, idx) => {
    getComments(div.name, idx).filter(x => x.status === "pending").forEach(x => {
      if (actionItems[x.author]) actionItems[x.author].push({ division: div.name, driver, comment: x.text, driverStatus: statuses[div.name]?.[idx], timestamp: x.timestamp, priority: idx === 0 ? "Main" : `P${idx+1}` });
    });
  })));

  const currentWeek = getWeekKey();
  const myPendingDivisions = useMemo(() => {
    if (!currentUser) return [];
    return Object.keys(DIVISION_METRICS).filter(div => {
      if (assignments[div] !== currentUser) return false;
      const history = metricsHistory[div] || {};
      const divMetrics = DIVISION_METRICS[div] || [];
      const current = history[currentWeek] || {};
      return !divMetrics.some(dm => current[dm.key] !== "" && current[dm.key] !== undefined);
    });
  }, [currentUser, assignments, metricsHistory]);

  if (!currentUser) return <LoginScreen onLogin={(u, admin) => { setCurrentUser(u); setIsAdmin(admin); }} />;
  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="text-slate-400 text-lg">Loading…</div></div>;

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "tracker", label: "Driver Tracker", icon: Flag },
    { id: "metrics", label: "Analytics", icon: BarChart3 },
    { id: "actions", label: "Action Items", icon: CheckSquare },
    { id: "employees", label: "Employees", icon: Users },
    ...(isAdmin ? [{ id: "admin", label: "Admin", icon: Settings }] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? "w-52" : "w-14"} bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-200 flex-shrink-0`}>
        <div className="flex items-center gap-3 px-3 py-4 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 40 40" className="w-5 h-5" fill="none">
              <polyline points="6,34 16,20 24,26 34,8" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="27,8 34,8 34,15" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          {sidebarOpen && <div className="min-w-0"><div className="text-sm font-bold text-white leading-tight">ABM</div><div className="text-xs text-slate-400 leading-tight">Clinical Ops</div></div>}
          <button onClick={() => setSidebarOpen(o => !o)} className="ml-auto text-slate-500 hover:text-slate-300 flex-shrink-0"><Menu className="w-4 h-4"/></button>
        </div>
        <nav className="flex-1 py-3 space-y-1 px-2">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors text-left ${activePage === item.id ? "bg-emerald-600/20 text-emerald-400" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`}>
                <Icon className="w-4 h-4 flex-shrink-0"/>
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-slate-800 p-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{currentUser[0]}</div>
            {sidebarOpen && <div className="flex-1 min-w-0"><div className="text-xs font-semibold text-white truncate">{currentUser}</div><div className="text-xs text-slate-500">{isAdmin ? "Admin" : "Team"}</div></div>}
            {sidebarOpen && <button onClick={() => { setCurrentUser(null); setIsAdmin(false); }} className="text-slate-500 hover:text-slate-300 text-xs">Out</button>}
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">
              {activePage === "home" && "Operations Briefing"}
              {activePage === "tracker" && "Driver Tracker"}
              {activePage === "metrics" && "Analytics"}
              {activePage === "actions" && "Action Items"}
              {activePage === "employees" && "Employees"}
              {activePage === "admin" && "Admin"}
            </h1>
            <p className="text-xs text-slate-400">{new Date().toLocaleDateString("en-US", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}</p>
          </div>
          <div className="flex items-center gap-3">
            {activePage === "tracker" && (
              <div className="flex rounded-lg overflow-hidden border border-slate-700">
                <button onClick={() => setMeetingMode(false)} className={`px-3 py-1.5 text-xs font-semibold transition-colors ${!meetingMode ? "bg-slate-700 text-white" : "text-slate-400"}`}>Normal</button>
                <button onClick={() => setMeetingMode(true)} className={`px-3 py-1.5 text-xs font-semibold transition-colors ${meetingMode ? "bg-emerald-600 text-white" : "text-slate-400"}`}>Meeting</button>
              </div>
            )}
            <button onClick={() => setShowMikey(true)} className="px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white text-xs rounded-lg border border-green-500 font-bold">🍕 Cowabunga!</button>
          </div>
        </div>

        {myPendingDivisions.length > 0 && !dismissedBanner && (
          <div className="bg-yellow-900/40 border-b border-yellow-600 px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-yellow-300 font-bold text-sm">📊 Metrics needed: {myPendingDivisions.join(", ")}</span>
              {myPendingDivisions.map(div => (
                <button key={div} onClick={() => setEnteringMetricsDiv(div)} className="px-2 py-1 bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-bold rounded transition-colors">Enter {div}</button>
              ))}
            </div>
            <button onClick={() => setDismissedBanner(true)} className="text-yellow-500 hover:text-yellow-300"><X className="w-4 h-4"/></button>
          </div>
        )}

        <div className="flex-1 p-6 overflow-auto">

          {/* HOME */}
          {activePage === "home" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "On Track", value: totalGreen, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-700/30" },
                  { label: "Needs Attention", value: totalRed, color: "text-red-400", bg: "bg-red-500/10 border-red-700/30" },
                  { label: "Pending Actions", value: totalPending, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-700/30" },
                  { label: "Total Drivers", value: totalDrivers, color: "text-white", bg: "bg-slate-800/50 border-slate-700" },
                ].map(s => (
                  <div key={s.label} className={`${s.bg} rounded-xl border p-4 text-center`}>
                    <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-xs text-slate-400 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 flex flex-col items-center justify-center">
                  <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">Overall Health</h3>
                  <HealthCircle pct={healthPct}/>
                  <div className="mt-3 w-full space-y-2">
                    {departments.map(dept => {
                      let g = 0, t = 0;
                      dept.divisions.forEach(div => div.drivers.forEach((_, i) => { t++; if (statuses[div.name]?.[i] === "green") g++; }));
                      const p = Math.round((g/t)*100);
                      return (
                        <div key={dept.name} className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 w-28 truncate">{dept.name}</span>
                          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width:`${p}%`, background: p>=80?"#10b981":p>=60?"#eab308":"#ef4444" }}/>
                          </div>
                          <span className="text-xs text-slate-400 w-8 text-right">{p}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 p-5">
                  <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wide">Team Scorecard</h3>
                  <div className="grid gap-3 grid-cols-3">
                    {memberScores.map(m => (
                      <div key={m.name} className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center text-white font-bold text-sm mx-auto mb-1">{m.name[0]}</div>
                        <div className="font-bold text-white text-xs">{m.name}</div>
                        <div className="mt-1.5 space-y-0.5 text-xs">
                          <div className="flex justify-between text-slate-400"><span>Pending</span><span className="text-yellow-300 font-bold">{m.pending}</span></div>
                          <div className="flex justify-between text-slate-400"><span>Done</span><span className="text-emerald-300 font-bold">{m.complete}</span></div>
                        </div>
                        {m.total > 0 && <div className="mt-1.5 h-1 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width:`${Math.round((m.complete/m.total)*100)}%` }}/></div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
                <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wide">Needs Attention</h3>
                {totalRed === 0 ? (
                  <div className="text-center py-6 text-emerald-400 font-semibold">All drivers on track!</div>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {departments.flatMap(d => d.divisions.flatMap(div =>
                      div.drivers.map((driver, i) => ({ driver, divName: div.name, idx: i, status: statuses[div.name]?.[i] }))
                    )).filter(x => x.status === "red").map((x, i) => (
                      <div key={i} className="bg-red-950/30 border border-red-700/40 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0"/>
                          <span className="text-xs font-semibold text-slate-300">{x.divName}</span>
                          <span className="text-xs bg-slate-800 text-slate-400 px-1.5 rounded">{x.idx === 0 ? "MAIN" : `P${x.idx+1}`}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-snug">{x.driver}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TRACKER */}
          {activePage === "tracker" && (
            <div className="space-y-4">
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-3 flex flex-wrap gap-3 items-center">
                <Filter className="w-4 h-4 text-slate-400"/>
                <div className="flex rounded-lg overflow-hidden border border-slate-700 text-xs">
                  {[["all","All"],["green","On Track"],["red","Needs Attention"]].map(([v,l]) => (
                    <button key={v} onClick={() => setFilters(f => ({...f, status: v}))} className={`px-3 py-1.5 font-medium transition-colors ${filters.status === v ? "bg-slate-700 text-white" : "text-slate-400"}`}>{l}</button>
                  ))}
                </div>
              </div>
              {meetingMode && <div className="bg-emerald-900/40 border border-emerald-700 rounded-xl p-3 text-center"><p className="text-emerald-300 font-bold text-sm">Meeting Mode — Red drivers and pending items only</p></div>}
              {departments.map(dept => {
                const visibleDivisions = dept.divisions.filter(div => {
                  const divStatuses = statuses[div.name] || [];
                  const divComments = div.drivers.reduce((acc, _, i) => { acc[i] = getComments(div.name, i); return acc; }, {});
                  if (meetingMode) return divStatuses.some(s => s === "red") || Object.values(divComments).some(c => c.some(x => x.status === "pending"));
                  if (filters.status === "green") return divStatuses.some(s => s === "green");
                  if (filters.status === "red") return divStatuses.some(s => s === "red");
                  return true;
                });
                if (visibleDivisions.length === 0) return null;
                return (
                  <div key={dept.name}>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg mb-3 font-bold text-white text-base" style={{ backgroundColor: dept.color }}>
                      <Building2 className="w-4 h-4"/> {dept.name}
                    </div>
                    <div className="grid gap-4 lg:grid-cols-2">
                      {visibleDivisions.map(div => (
                        <DivisionPanel key={div.name} division={div}
                          statuses={statuses[div.name] || []}
                          comments={div.drivers.reduce((acc, _, i) => { acc[i] = getComments(div.name, i); return acc; }, {})}
                          pinnedDrivers={pinnedDrivers} onToggle={toggleStatus}
                          onAddComment={handleComment}
                          onTogglePin={togglePin}
                          metricsHistory={metricsHistory} assignments={assignments}
                          currentUser={currentUser} isAdmin={isAdmin} onEnterMetrics={setEnteringMetricsDiv}
                          meetingMode={meetingMode} filters={filters}/>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ANALYTICS */}
          {activePage === "metrics" && (
            <div className="grid gap-4 lg:grid-cols-2">
              {Object.keys(DIVISION_METRICS).map(divName => {
                const divMetrics = DIVISION_METRICS[divName];
                const weeks = getLast26Weeks();
                const history = metricsHistory[divName] || {};
                const currentData = history[currentWeek] || {};
                const hasData = divMetrics.some(dm => currentData[dm.key] !== "" && currentData[dm.key] !== undefined);
                const canEdit = currentUser === assignments[divName] || isAdmin;
                return (
                  <div key={divName} className="bg-slate-900 rounded-xl border border-slate-800 p-4">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                      <h3 className="text-base font-bold text-white">{divName}</h3>
                      <div className="flex items-center gap-2">
                        {assignments[divName] && <span className="text-xs text-slate-500">{assignments[divName]}</span>}
                        {canEdit && <button onClick={() => setEnteringMetricsDiv(divName)} className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded">{hasData ? "Update" : "Enter"}</button>}
                      </div>
                    </div>
                    {!hasData ? <div className="text-center py-4 text-slate-500 text-sm">No data for this week</div> : (
                      <>
                        <div className={`grid gap-3 mb-4 ${divMetrics.length === 1 ? "grid-cols-1 max-w-[100px] mx-auto" : divMetrics.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                          {divMetrics.map(dm => <Gauge key={dm.key} value={currentData[dm.key]} target={dm.target} label={dm.label} unit={dm.unit} higherIsBetter={dm.higherIsBetter}/>)}
                        </div>
                        <div className="border-t border-slate-800 pt-3 space-y-3">
                          <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">6-Month Trend</p>
                          {divMetrics.map(dm => (
                            <div key={dm.key}>
                              <p className="text-xs text-slate-400 mb-1">{dm.label}</p>
                              <TrendChart history={history} metricDef={dm} weeks={weeks}/>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ACTION ITEMS */}
          {activePage === "actions" && (
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {Object.keys(LOGINS).map(m => {
                const items = actionItems[m] || [];
                return (
                  <div key={m} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-800">
                      <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center text-white font-bold">{m[0]}</div>
                      <div><div className="font-bold text-white">{m}</div><div className="text-xs text-slate-400">{items.length} pending</div></div>
                    </div>
                    {items.length === 0 ? <div className="text-center py-4 text-slate-500 text-sm">All caught up</div> : (
                      <div className="space-y-2">
                        {items.map((it, i) => (
                          <div key={i} className={`p-2.5 rounded border-l-4 text-xs ${it.driverStatus === "red" ? "bg-red-950/30 border-red-500" : "bg-slate-700/30 border-emerald-500"}`}>
                            <div className="text-slate-400 mb-0.5">{it.division} · {it.priority}</div>
                            <div className="text-slate-300 font-medium mb-0.5 leading-snug">{it.driver}</div>
                            <div className="text-slate-400 italic">"{it.comment}"</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* EMPLOYEES */}
          {activePage === "employees" && (
            <div className="space-y-8">
              {Object.entries(fteData).map(([division, depts]) => {
                const totalFte = Object.values(depts).reduce((sum, d) => sum + (d.fte || 0), 0);
                const totalReqs = Object.values(depts).reduce((sum, d) => sum + d.requisitions.length, 0);
                return (
                  <div key={division}>
                    <div className="flex items-center gap-4 mb-4">
                      <h2 className="text-lg font-bold text-white">{division}</h2>
                      <span className="text-xs bg-slate-800 border border-slate-700 text-slate-400 px-2 py-1 rounded-lg">{totalFte} FTEs</span>
                      {totalReqs > 0 && <span className="text-xs bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 px-2 py-1 rounded-lg">{totalReqs} open req{totalReqs !== 1 ? "s" : ""}</span>}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {Object.entries(depts).map(([dept, data]) => (
                        <FteDeptCard key={dept} division={division} dept={dept}
                          fte={data.fte} requisitions={data.requisitions}
                          isAdmin={isAdmin} onUpdate={handleFteUpdate}/>
                      ))}
                    </div>
                  </div>
                );
              })}
              {!isAdmin && <p className="text-center text-slate-500 text-sm mt-4">Only Dustin can update FTE counts and requisitions.</p>}
            </div>
          )}

          {/* ADMIN */}
          {activePage === "admin" && isAdmin && (
            <div className="space-y-4 max-w-lg">
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
                <h3 className="text-base font-bold text-white mb-1">Metrics Assignments</h3>
                <p className="text-slate-400 text-sm mb-4">Assign who enters each division's weekly metrics</p>
                <div className="space-y-3">
                  {Object.keys(DIVISION_METRICS).map(div => (
                    <div key={div} className="flex items-center justify-between gap-3">
                      <span className="text-sm text-slate-300">{div}</span>
                      <select value={assignments[div] || ""} onChange={e => { const newA = {...assignments, [div]: e.target.value}; handleSaveAssignments(newA); }}
                        className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500">
                        <option value="">— Unassigned —</option>
                        {Object.keys(LOGINS).map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
                <h3 className="text-base font-bold text-white mb-1">Team Logins</h3>
                <p className="text-slate-400 text-sm mb-4">Share these credentials with your team</p>
                <div className="space-y-2">
                  {Object.entries(LOGINS).map(([u, v]) => (
                    <div key={u} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center text-white text-xs font-bold">{u[0]}</div>
                        <span className="text-sm text-white font-semibold">{u}</span>
                        {v.isAdmin && <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40">Admin</span>}
                      </div>
                      <span className="text-xs text-slate-500 font-mono">{v.password}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mikey */}
      {showMikey && (
        <div style={{position:"fixed",inset:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.6)"}} onClick={() => setShowMikey(false)}>
          <div className="flex flex-col items-center">
            <div className="bg-white text-black font-black text-4xl px-8 py-4 rounded-2xl shadow-2xl mb-2 relative">
              COWABUNGA, DUDE! 🤙
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"/>
            </div>
            <svg viewBox="0 0 200 220" className="w-56 h-56 drop-shadow-2xl">
              <ellipse cx="100" cy="160" rx="55" ry="50" fill="#4a7c2f"/>
              <ellipse cx="100" cy="158" rx="42" ry="38" fill="#8B6914"/>
              <ellipse cx="100" cy="158" rx="36" ry="32" fill="#c4920a"/>
              <line x1="100" y1="126" x2="100" y2="190" stroke="#8B6914" strokeWidth="2"/>
              <line x1="64" y1="158" x2="136" y2="158" stroke="#8B6914" strokeWidth="2"/>
              <ellipse cx="100" cy="85" rx="42" ry="40" fill="#5a9e3a"/>
              <rect x="58" y="72" width="84" height="22" rx="11" fill="#FF6B00"/>
              <path d="M58 78 Q40 70 35 60" stroke="#FF6B00" strokeWidth="4" fill="none" strokeLinecap="round"/>
              <path d="M142 78 Q160 70 165 60" stroke="#FF6B00" strokeWidth="4" fill="none" strokeLinecap="round"/>
              <ellipse cx="83" cy="80" rx="10" ry="9" fill="white"/>
              <ellipse cx="117" cy="80" rx="10" ry="9" fill="white"/>
              <circle cx="85" cy="81" r="5" fill="#1a1a1a"/>
              <circle cx="119" cy="81" r="5" fill="#1a1a1a"/>
              <circle cx="87" cy="79" r="2" fill="white"/>
              <circle cx="121" cy="79" r="2" fill="white"/>
              <path d="M75 100 Q100 125 125 100" stroke="#1a1a1a" strokeWidth="3" fill="#ff9999" strokeLinecap="round"/>
              <path d="M80 102 Q100 120 120 102" fill="#cc4444"/>
              <rect x="88" y="103" width="10" height="8" rx="2" fill="white"/>
              <rect x="101" y="103" width="10" height="8" rx="2" fill="white"/>
              <path d="M48 140 Q20 130 15 150" stroke="#4a7c2f" strokeWidth="14" fill="none" strokeLinecap="round"/>
              <path d="M152 140 Q180 120 190 140" stroke="#4a7c2f" strokeWidth="14" fill="none" strokeLinecap="round"/>
              <circle cx="15" cy="152" r="10" fill="#5a9e3a"/>
              <circle cx="190" cy="142" r="10" fill="#5a9e3a"/>
              <rect x="62" y="170" width="76" height="10" rx="5" fill="#FF6B00"/>
              <rect x="93" y="168" width="14" height="14" rx="3" fill="#FFD700"/>
            </svg>
            <p className="text-white text-sm mt-2 opacity-70">Click anywhere to close</p>
          </div>
        </div>
      )}

      {enteringMetricsDiv && (
        <EnterMetricsModal division={enteringMetricsDiv} history={metricsHistory[enteringMetricsDiv] || {}}
          onSave={handleSaveMetrics} onClose={() => setEnteringMetricsDiv(null)}/>
      )}
    </div>
  );
}
