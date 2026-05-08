'use client'

import { useEffect, useState, useCallback } from 'react'
import { Link } from '@/i18n/routing'
import { dashboardApi, StudentDashboardResponse } from '@/lib/api/dashboard'
import { apiClient } from '@/lib/api/client'
import { motion, AnimatePresence } from 'framer-motion'
import { useRealtimeAssignments, useRealtimeNotifications } from '@/lib/providers/socket-provider'
import {
  BookOpen, Calendar, Trophy, Sparkles, Target, Award, BrainCircuit,
  TrendingUp, Clock, CheckCircle2, AlertCircle, Flame, Star,
  MessageSquare, ChevronLeft, Zap, BarChart3, FileText, Send, X
} from 'lucide-react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts'

// ── tiny helpers ──────────────────────────────────────────
function Ring({ pct, color, size = 80, label, value }: { pct: number; color: string; size?: number; label: string; value: string }) {
  const r = size / 2 - 8; const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={6} className="text-muted/30" />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: 'easeOut' }} />
      </svg>
      <p className="text-xl font-extrabold -mt-1" style={{ color }}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function StatChip({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <div className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-bold text-sm text-foreground">{value}</p>
      </div>
    </div>
  )
}

const URGENCY: Record<string, { label: string; color: string }> = {
  high:   { label: 'عاجل', color: '#ef4444' },
  medium: { label: 'قريب', color: '#f59e0b' },
  low:    { label: 'متاح', color: '#22c55e' },
}

function getUrgency(due?: string | null) {
  if (!due) return 'low'
  const diff = (new Date(due).getTime() - Date.now()) / 86400000
  return diff < 1 ? 'high' : diff < 3 ? 'medium' : 'low'
}

// ── AI Tutor Widget ────────────────────────────────────────
function AiTutorWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const send = async () => {
    if (!input.trim() || loading) return
    const question = input.trim()
    setInput('')
    setMessages(p => [...p, { role: 'user', text: question }])
    setLoading(true)
    try {
      const res = await apiClient.post('/ai/ask', { question })
      setMessages(p => [...p, { role: 'ai', text: res.data?.data?.answer || 'لم أتمكن من الإجابة.' }])
    } catch {
      setMessages(p => [...p, { role: 'ai', text: 'حدث خطأ في الاتصال. حاول مجدداً.' }])
    } finally { setLoading(false) }
  }

  return (
    <>
      <motion.button whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(p => !p)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-2xl flex items-center justify-center"
        aria-label="AI Tutor">
        <BrainCircuit className="w-6 h-6" />
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 left-6 z-50 w-80 bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col" style={{ height: 400 }}>
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-white" />
                <p className="text-white font-bold text-sm">المساعد الذكي</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.length === 0 && (
                <p className="text-xs text-muted-foreground text-center mt-8">اسألني أي سؤال دراسي! 🎓</p>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <p className={`text-xs px-3 py-2 rounded-2xl max-w-[75%] leading-relaxed ${
                    m.role === 'user' ? 'bg-violet-600 text-white' : 'bg-muted text-foreground'}`}>{m.text}</p>
                </div>
              ))}
              {loading && <p className="text-xs text-muted-foreground text-center animate-pulse">يفكر...</p>}
            </div>
            <div className="p-3 border-t border-border flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="اكتب سؤالك..." className="flex-1 text-xs bg-muted rounded-xl px-3 py-2 outline-none border border-border" />
              <button onClick={send} className="w-8 h-8 bg-violet-600 rounded-xl flex items-center justify-center text-white">
                <Send className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ── Main Page ──────────────────────────────────────────────
export default function StudentDashboardPage() {
  const [data, setData] = useState<StudentDashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [liveAssignments, setLiveAssignments] = useState<any[]>([])
  const [liveNotif, setLiveNotif] = useState<string | null>(null)

  useEffect(() => {
    dashboardApi.getStudentDashboard().then(setData).catch(() => setError('تعذر تحميل البيانات')).finally(() => setLoading(false))
  }, [])

  // Real-time handlers
  const handleNewAssignment = useCallback((a: any) => {
    setLiveAssignments(p => [a, ...p].slice(0, 3))
    setLiveNotif(`واجب جديد: ${a.title}`)
    setTimeout(() => setLiveNotif(null), 4000)
  }, [])

  const handleNotification = useCallback((n: any) => {
    setLiveNotif(n.title)
    setTimeout(() => setLiveNotif(null), 4000)
  }, [])

  useRealtimeAssignments(handleNewAssignment)
  useRealtimeNotifications(handleNotification)

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full" />
    </div>
  )

  if (error || !data) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <AlertCircle className="w-12 h-12 text-rose-500" />
      <p className="text-lg font-bold">{error || 'لا توجد بيانات'}</p>
      <button onClick={() => window.location.reload()} className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm">إعادة المحاولة</button>
    </div>
  )

  const { student, summary, upcomingAssignments, attendance, subjectPerformance, gamification, weeklyActivity } = data

  const attTotal = attendance.present + attendance.absent + attendance.late + attendance.excused
  const attPct = attTotal > 0 ? Math.round((attendance.present / attTotal) * 100) : 0
  const avgGrade = Math.round(summary.averageGrade || 0)
  const completionPct = summary.pendingAssignments + summary.completedAssignments > 0
    ? Math.round((summary.completedAssignments / (summary.pendingAssignments + summary.completedAssignments)) * 100) : 0

  const radarData = subjectPerformance.slice(0, 6).map(s => ({ subject: s.name.substring(0, 6), value: s.averageGrade || 0 }))
  const weeklyChartData = weeklyActivity.map(w => ({ name: w.label, تسليمات: w.submissions, حضور: w.attended }))

  const allAssignments = [...liveAssignments, ...(upcomingAssignments || [])].slice(0, 6)

  return (
    <div className="space-y-6 pb-10" dir="rtl">
      {/* Live toast */}
      <AnimatePresence>
        {liveNotif && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-sm font-bold">
            <Zap className="w-4 h-4" /> {liveNotif}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Banner */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-purple-600 to-indigo-600 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-10 w-56 h-56 bg-indigo-300/20 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-violet-200 text-sm font-medium mb-1">مرحباً مجدداً 👋</p>
            <h1 className="text-3xl font-extrabold mb-2">{student.name}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-300" /> المستوى {gamification.level}
              </span>
              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-300" /> {gamification.streakDays} يوم متواصل
              </span>
              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Zap className="w-3 h-3 text-yellow-300" /> {gamification.totalXP.toLocaleString()} XP
              </span>
            </div>
            {/* XP progress bar */}
            <div className="mt-4 w-64">
              <div className="flex justify-between text-xs text-white/70 mb-1">
                <span>تقدم المستوى</span><span>{gamification.totalXP % 1000} / 1000</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full"
                  initial={{ width: 0 }} animate={{ width: `${(gamification.totalXP % 1000) / 10}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut' }} />
              </div>
            </div>
          </div>
          {/* Progress Rings */}
          <div className="flex gap-6">
            <Ring pct={attPct} color="#4ade80" label="الحضور" value={`${attPct}%`} />
            <Ring pct={avgGrade} color="#a78bfa" label="المعدل" value={`${avgGrade}%`} />
            <Ring pct={completionPct} color="#38bdf8" label="الواجبات" value={`${completionPct}%`} />
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: BookOpen, label: 'المواد الدراسية', value: summary.totalSubjects, color: '#8b5cf6' },
          { icon: FileText, label: 'واجبات معلقة', value: summary.pendingAssignments, color: '#f59e0b' },
          { icon: CheckCircle2, label: 'واجبات مكتملة', value: summary.completedAssignments, color: '#22c55e' },
          { icon: Award, label: 'الإنجازات', value: gamification.achievementsUnlocked, color: '#ec4899' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <StatChip {...s} />
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Radar */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
          className="bg-card border border-border rounded-3xl p-6">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-violet-500" /> أداء المواد الدراسية
          </h3>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Radar name="الأداء" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          ) : <p className="text-muted-foreground text-sm text-center py-12">لا توجد بيانات درجات بعد</p>}
        </motion.div>

        {/* Weekly Activity */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-3xl p-6">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" /> النشاط الأسبوعي
          </h3>
          {weeklyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={weeklyChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                <Area type="monotone" dataKey="تسليمات" stroke="#8b5cf6" fill="url(#gS)" strokeWidth={2} />
                <Area type="monotone" dataKey="حضور" stroke="#38bdf8" fill="url(#gA)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <p className="text-muted-foreground text-sm text-center py-12">لا توجد بيانات بعد</p>}
        </motion.div>
      </div>

      {/* Assignments Timeline + Quick Actions */}
      <div className="grid lg:grid-cols-[1fr_300px] gap-5">
        {/* Assignments */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-card border border-border rounded-3xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" /> مواعيد الواجبات
            </h3>
            <Link href="/student/assignments" className="text-xs text-violet-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              عرض الكل <ChevronLeft className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border/50">
            {allAssignments.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-10">لا توجد واجبات قادمة 🎉</p>
            )}
            {allAssignments.map((a: any, i) => {
              const urgency = getUrgency(a.dueDate)
              const { color } = URGENCY[urgency]
              const isLive = i < liveAssignments.length
              return (
                <motion.div key={a.id || i} initial={isLive ? { backgroundColor: '#8b5cf620' } : {}}
                  animate={{ backgroundColor: 'transparent' }} transition={{ duration: 2 }}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-muted/40 transition-colors">
                  <div className="w-2 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-foreground truncate">{a.title}</p>
                      {isLive && <span className="text-[10px] bg-violet-600 text-white px-2 py-0.5 rounded-full font-bold">جديد</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.subject?.name || a.subject}</p>
                  </div>
                  <div className="text-left flex-shrink-0">
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ backgroundColor: `${color}18`, color }}>
                      {URGENCY[urgency].label}
                    </span>
                    <p className="text-[10px] text-muted-foreground mt-1 text-center">
                      {a.dueDate ? new Date(a.dueDate).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' }) : '—'}
                    </p>
                  </div>
                  <Link href={`/student/assignments/${a.id}`}
                    className="text-xs bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 px-3 py-1.5 rounded-xl font-bold hover:bg-violet-100 transition-colors flex-shrink-0">
                    حل
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
          className="flex flex-col gap-3">
          {[
            { href: '/student/ai-tutor', icon: BrainCircuit, label: 'المساعد الذكي', desc: 'اسأل AI أي سؤال', gradient: 'from-violet-600 to-indigo-600' },
            { href: '/student/grades', icon: Award, label: 'درجاتي', desc: 'عرض كل الدرجات', gradient: 'from-rose-500 to-pink-600' },
            { href: '/student/attendance', icon: Calendar, label: 'سجل الحضور', desc: 'غياباتي ومبرراتي', gradient: 'from-teal-500 to-emerald-600' },
            { href: '/student/messages', icon: MessageSquare, label: 'الرسائل', desc: 'تواصل مع المعلمين', gradient: 'from-amber-500 to-orange-500' },
            { href: '/student/million', icon: Trophy, label: 'مسابقة نكسس', desc: 'تحديات وجوائز', gradient: 'from-yellow-500 to-amber-600' },
          ].map((a, i) => (
            <Link key={i} href={a.href}>
              <motion.div whileHover={{ x: -3 }} className={`flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r ${a.gradient} text-white cursor-pointer shadow-md`}>
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <a.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-sm">{a.label}</p>
                  <p className="text-white/70 text-xs">{a.desc}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>

      {/* Subject Performance Cards */}
      {subjectPerformance.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-violet-500" /> أداء المواد
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {subjectPerformance.map((s, i) => {
              const pct = Math.min(Math.round(s.averageGrade || 0), 100)
              const color = pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444'
              return (
                <motion.div key={s.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * i }} whileHover={{ y: -2 }}
                  className="bg-card border border-border rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-bold text-sm text-foreground truncate">{s.name}</p>
                    <span className="text-lg font-extrabold" style={{ color }}>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{ backgroundColor: color }}
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: 0.1 * i }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{s.teacher} • {s.totalLessons} درس</p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Floating AI Button */}
      <AiTutorWidget />
    </div>
  )
}
