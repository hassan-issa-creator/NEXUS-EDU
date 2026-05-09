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
  MessageSquare, ChevronLeft, Zap, BarChart3, FileText, Send, X, Bell
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
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={6} className="text-gray-200 dark:text-gray-800" />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: 'easeOut' }} />
      </svg>
      <p className="text-xl font-extrabold -mt-1 text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
    </div>
  )
}

function StatChip({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <motion.div whileHover={{ y: -4, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}
      className="flex flex-col gap-3 bg-white/80 dark:bg-[#1e1e2d]/80 backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
      <div className="absolute -top-6 -left-6 w-24 h-24 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-2xl rounded-full" style={{ backgroundColor: color }} />
      <div className="flex items-center gap-3 relative z-10">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner" style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400">{label}</p>
          <p className="font-black text-2xl tracking-tight text-gray-900 dark:text-white leading-none mt-1">{value}</p>
        </div>
      </div>
    </motion.div>
  )
}

const URGENCY: Record<string, { label: string; color: string; bg: string }> = {
  high:   { label: 'عاجل', color: '#ef4444', bg: 'bg-red-50 dark:bg-red-500/10' },
  medium: { label: 'قريب', color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  low:    { label: 'متاح', color: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
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
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(p => !p)}
        className="fixed bottom-6 left-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 text-white shadow-[0_0_30px_rgba(124,58,237,0.4)] flex items-center justify-center border-4 border-white dark:border-[#1e1e2d]"
        aria-label="AI Tutor">
        <BrainCircuit className="w-7 h-7" />
        <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-[#1e1e2d] rounded-full" />
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: "bottom left" }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-28 left-6 z-50 w-80 sm:w-96 bg-white/95 dark:bg-[#1e1e2d]/95 backdrop-blur-xl border border-gray-100 dark:border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col" style={{ height: 480 }}>
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-violet-600 to-indigo-600">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-inner">
                  <BrainCircuit className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-extrabold text-sm">المعلم الذكي (AI)</p>
                  <p className="text-violet-200 text-[10px] font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> متصل ومستعد للمساعدة</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 text-white transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-[#12121a]/50">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mb-3">
                    <Sparkles className="w-8 h-8 text-violet-600 dark:text-violet-400" />
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">كيف يمكنني مساعدتك اليوم؟</p>
                  <p className="text-xs text-gray-500 mt-1">اطرح أي سؤال حول المنهج وسأقوم بشرحه لك بطريقة مبسطة.</p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                    <p className={`text-sm px-4 py-3 shadow-sm leading-relaxed ${
                      m.role === 'user' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl rounded-br-sm' : 'bg-white dark:bg-[#1e1e2d] border border-gray-100 dark:border-white/5 text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-sm'}`}>{m.text}</p>
                    <span className="text-[9px] text-gray-400 mt-1 mx-1 font-medium">{m.role === 'user' ? 'أنت' : 'المعلم الذكي'}</span>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-[#1e1e2d] border border-gray-100 dark:border-white/5 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>
            <div className="p-3 bg-white dark:bg-[#1e1e2d] border-t border-gray-100 dark:border-white/5">
              <div className="relative flex items-center">
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
                  placeholder="اكتب سؤالك هنا..." className="w-full text-sm bg-gray-100 dark:bg-white/5 rounded-full pl-12 pr-4 py-3.5 outline-none border border-transparent focus:border-violet-500/50 transition-colors placeholder:text-gray-400" />
                <button onClick={send} disabled={!input.trim() || loading} className="absolute left-1.5 w-10 h-10 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 rounded-full flex items-center justify-center text-white transition-colors shadow-md">
                  <Send className="w-4 h-4 -ml-0.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 dark:bg-[#1e1e2d]/90 backdrop-blur-md border border-gray-100 dark:border-white/10 p-3 rounded-xl shadow-xl">
        <p className="font-bold text-gray-900 dark:text-white mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

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
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="relative w-16 h-16">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 border-4 border-violet-500/20 border-t-violet-600 rounded-full" />
      </div>
    </div>
  )

  if (error || !data) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center">
        <AlertCircle className="w-10 h-10 text-rose-500" />
      </div>
      <p className="text-xl font-bold text-gray-900 dark:text-white">{error || 'لا توجد بيانات متاحة'}</p>
      <button onClick={() => window.location.reload()} className="px-6 py-3 bg-violet-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-violet-500/30">إعادة المحاولة</button>
    </div>
  )

  const { student, summary, upcomingAssignments, attendance, subjectPerformance, gamification, weeklyActivity } = data

  const attTotal = attendance.present + attendance.absent + attendance.late + attendance.excused
  const attPct = attTotal > 0 ? Math.round((attendance.present / attTotal) * 100) : 0
  const avgGrade = Math.round(summary.averageGrade || 0)
  const completionPct = summary.pendingAssignments + summary.completedAssignments > 0
    ? Math.round((summary.completedAssignments / (summary.pendingAssignments + summary.completedAssignments)) * 100) : 0

  const radarData = subjectPerformance.slice(0, 6).map(s => ({ subject: s.name.substring(0, 8), value: s.averageGrade || 0 }))
  const weeklyChartData = weeklyActivity.map(w => ({ name: w.label, تسليمات: w.submissions, حضور: w.attended }))

  const allAssignments = [...liveAssignments, ...(upcomingAssignments || [])].slice(0, 6)

  return (
    <div className="space-y-8 pb-12" dir="rtl">
      {/* Live toast */}
      <AnimatePresence>
        {liveNotif && (
          <motion.div initial={{ opacity: 0, y: -40, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-[#1e1e2d] border border-gray-100 dark:border-white/10 text-gray-900 dark:text-white px-5 py-3 rounded-2xl shadow-2xl shadow-violet-500/10 flex items-center gap-3 text-sm font-bold">
            <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center text-violet-600">
              <Bell className="w-4 h-4" />
            </div>
            {liveNotif}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Hero Banner */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200 }}
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#4c1d95] via-[#6d28d9] to-[#4338ca] p-8 md:p-10 text-white shadow-[0_20px_50px_rgba(109,40,217,0.25)]">
        
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-screen opacity-50">
          <motion.div animate={{ rotate: 360, scale: [1, 1.1, 1] }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-400/30 via-transparent to-transparent rounded-full blur-3xl" />
          <motion.div animate={{ rotate: -360, scale: [1, 1.2, 1] }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-40 -left-20 w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-400/30 via-transparent to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-8">
          <div className="w-full xl:w-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-md mb-4">
              <span className="text-xs font-bold text-violet-100 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-yellow-300" /> مرحباً بعودتك
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">{student.firstName || student.name}</h1>
            
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="bg-white/10 border border-white/10 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2.5 shadow-inner">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-yellow-400 to-yellow-200 flex items-center justify-center">
                  <Star className="w-3 h-3 text-yellow-900" />
                </div>
                <div>
                  <p className="text-[10px] text-violet-200 font-medium">المستوى</p>
                  <p className="text-sm font-black">{gamification.level}</p>
                </div>
              </div>
              <div className="bg-white/10 border border-white/10 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2.5 shadow-inner">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-orange-500 to-orange-300 flex items-center justify-center">
                  <Flame className="w-3 h-3 text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-violet-200 font-medium">أيام متواصلة</p>
                  <p className="text-sm font-black">{gamification.streakDays}</p>
                </div>
              </div>
              <div className="bg-white/10 border border-white/10 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2.5 shadow-inner">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-400 flex items-center justify-center">
                  <Zap className="w-3 h-3 text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-violet-200 font-medium">إجمالي النقاط</p>
                  <p className="text-sm font-black">{gamification.totalXP.toLocaleString()} XP</p>
                </div>
              </div>
            </div>

            {/* Premium Progress Bar */}
            <div className="max-w-md bg-black/20 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-bold text-violet-100 flex items-center gap-1.5"><Trophy className="w-3 h-3 text-yellow-400" /> الطريق للمستوى التالي</span>
                <span className="text-xs font-black bg-white/20 px-2 py-0.5 rounded text-white">{gamification.totalXP % 1000} / 1000</span>
              </div>
              <div className="h-2.5 bg-black/30 rounded-full overflow-hidden p-0.5">
                <motion.div className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-rose-400 rounded-full relative"
                  initial={{ width: 0 }} animate={{ width: `${(gamification.totalXP % 1000) / 10}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}>
                    <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[progress_1s_linear_infinite]" />
                  </motion.div>
              </div>
            </div>
          </div>
          
          {/* Glassmorphic Progress Rings */}
          <div className="flex justify-center gap-4 md:gap-8 bg-black/10 p-6 rounded-[2rem] border border-white/10 backdrop-blur-md">
            <Ring pct={attPct} color="#34d399" label="نسبة الحضور" value={`${attPct}%`} size={90} />
            <div className="w-px h-20 bg-white/10 self-center hidden md:block" />
            <Ring pct={avgGrade} color="#fcd34d" label="المعدل العام" value={`${avgGrade}%`} size={90} />
            <div className="w-px h-20 bg-white/10 self-center hidden md:block" />
            <Ring pct={completionPct} color="#60a5fa" label="إنجاز الواجبات" value={`${completionPct}%`} size={90} />
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[
          { icon: BookOpen, label: 'المواد المسجلة', value: summary.totalSubjects, color: '#8b5cf6' },
          { icon: FileText, label: 'واجبات للحل', value: summary.pendingAssignments, color: '#f59e0b' },
          { icon: CheckCircle2, label: 'واجبات سلمت', value: summary.completedAssignments, color: '#10b981' },
          { icon: Award, label: 'أوسمة الإنجاز', value: gamification.achievementsUnlocked, color: '#ec4899' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1 }}>
            <StatChip {...s} />
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
          className="bg-white dark:bg-[#1e1e2d] border border-gray-100 dark:border-white/5 rounded-[2rem] p-7 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 dark:text-white text-lg leading-tight">الأداء الأكاديمي الشامل</h3>
              <p className="text-xs text-gray-500 mt-0.5">تحليل مستواك في مختلف المواد</p>
            </div>
          </div>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="currentColor" className="text-gray-200 dark:text-gray-800" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 600 }} />
                <Radar name="الأداء" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} strokeWidth={3} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          ) : <div className="h-[260px] flex items-center justify-center"><p className="text-gray-400 font-medium">لم يتم رصد درجات كافية لتحليل الأداء</p></div>}
        </motion.div>

        {/* Weekly Activity Area Chart */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
          className="bg-white dark:bg-[#1e1e2d] border border-gray-100 dark:border-white/5 rounded-[2rem] p-7 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 dark:text-white text-lg leading-tight">النشاط الأسبوعي</h3>
              <p className="text-xs text-gray-500 mt-0.5">معدل التفاعل والحضور آخر 7 أيام</p>
            </div>
          </div>
          {weeklyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={weeklyChartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-100 dark:text-gray-800/50" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 500 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="تسليمات" stroke="#8b5cf6" fill="url(#gS)" strokeWidth={3} activeDot={{ r: 6, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="حضور" stroke="#38bdf8" fill="url(#gA)" strokeWidth={3} activeDot={{ r: 6, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div className="h-[260px] flex items-center justify-center"><p className="text-gray-400 font-medium">لا توجد بيانات تفاعل لهذا الأسبوع</p></div>}
        </motion.div>
      </div>

      {/* Assignments Timeline + Navigation */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Assignments */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-white dark:bg-[#1e1e2d] border border-gray-100 dark:border-white/5 rounded-[2rem] overflow-hidden shadow-sm flex flex-col">
          <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
            <h3 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" /> الواجبات والمهام القادمة
            </h3>
            <Link href="/student/assignments" className="text-xs text-violet-600 dark:text-violet-400 font-bold flex items-center gap-1 hover:gap-2 transition-all px-3 py-1.5 rounded-full hover:bg-violet-50 dark:hover:bg-violet-500/10">
              عرض الكل <ChevronLeft className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-white/5 flex-1 overflow-y-auto">
            {allAssignments.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full py-16">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="font-bold text-gray-900 dark:text-white">أنجزت جميع مهامك!</p>
                <p className="text-xs text-gray-500 mt-1">استرح قليلاً، لا توجد واجبات معلقة.</p>
              </div>
            )}
            {allAssignments.map((a: any, i) => {
              const urgency = getUrgency(a.dueDate)
              const { color, bg } = URGENCY[urgency]
              const isLive = i < liveAssignments.length
              return (
                <motion.div key={a.id || i} initial={isLive ? { backgroundColor: '#8b5cf620' } : {}}
                  animate={{ backgroundColor: 'transparent' }} transition={{ duration: 2 }}
                  className="flex items-center gap-4 px-7 py-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group cursor-pointer">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 ${bg}`}>
                    <FileText className="w-5 h-5" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-sm text-gray-900 dark:text-white truncate group-hover:text-violet-600 transition-colors">{a.title}</p>
                      {isLive && <span className="text-[9px] bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-2 py-0.5 rounded-full font-bold shadow-sm">تحديث مباشر</span>}
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1.5 font-medium">
                      <BookOpen className="w-3 h-3" /> {a.subject?.name || a.subject}
                    </p>
                  </div>
                  <div className="text-left flex-shrink-0 flex flex-col items-end gap-1.5">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-md border" style={{ backgroundColor: `${color}10`, color, borderColor: `${color}20` }}>
                      {URGENCY[urgency].label}
                    </span>
                    <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {a.dueDate ? new Date(a.dueDate).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' }) : 'غير محدد'}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Navigation Actions */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
          className="flex flex-col gap-4">
          <h3 className="font-bold text-gray-900 dark:text-white mb-1 px-1">الوصول السريع</h3>
          {[
            { href: '/student/ai-tutor', icon: BrainCircuit, label: 'المعلم الذكي', desc: 'مساعدة فورية بالذكاء الاصطناعي', gradient: 'from-violet-600 to-indigo-600', shadow: 'shadow-violet-500/20' },
            { href: '/student/grades', icon: Award, label: 'سجل الدرجات', desc: 'نتائج الاختبارات والواجبات', gradient: 'from-rose-500 to-pink-600', shadow: 'shadow-rose-500/20' },
            { href: '/student/attendance', icon: Calendar, label: 'الحضور والغياب', desc: 'نسبة الحضور والمبررات', gradient: 'from-teal-500 to-emerald-600', shadow: 'shadow-teal-500/20' },
            { href: '/student/million', icon: Trophy, label: 'تحدي المليون', desc: 'مسابقات نكسس والأوسمة', gradient: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/20' },
          ].map((a, i) => (
            <Link key={i} href={a.href}>
              <motion.div whileHover={{ scale: 1.02, x: -4 }} className={`flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r ${a.gradient} text-white cursor-pointer shadow-lg ${a.shadow} relative overflow-hidden group`}>
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                <div className="w-12 h-12 bg-white/20 rounded-xl border border-white/20 flex items-center justify-center flex-shrink-0 shadow-inner backdrop-blur-sm">
                  <a.icon className="w-5 h-5" />
                </div>
                <div className="relative z-10">
                  <p className="font-bold text-sm mb-0.5">{a.label}</p>
                  <p className="text-white/80 text-[11px] font-medium">{a.desc}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>

      {/* Subject Performance Cards */}
      {subjectPerformance.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <h3 className="font-extrabold text-gray-900 dark:text-white text-xl mb-5 flex items-center gap-2 px-1">
            <Target className="w-6 h-6 text-violet-500" /> تحليل أداء المواد التفصيلي
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {subjectPerformance.map((s, i) => {
              const pct = Math.min(Math.round(s.averageGrade || 0), 100)
              const color = pct >= 85 ? '#10b981' : pct >= 65 ? '#f59e0b' : '#ef4444'
              const bg = pct >= 85 ? 'bg-emerald-50 dark:bg-emerald-500/5' : pct >= 65 ? 'bg-amber-50 dark:bg-amber-500/5' : 'bg-red-50 dark:bg-red-500/5'
              
              return (
                <motion.div key={s.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * i }} whileHover={{ y: -4 }}
                  className={`bg-white dark:bg-[#1e1e2d] border border-gray-100 dark:border-white/5 rounded-3xl p-5 shadow-sm overflow-hidden relative`}>
                  <div className="absolute -top-10 -right-10 w-24 h-24 blur-2xl opacity-20 rounded-full" style={{ backgroundColor: color }} />
                  
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="pr-1">
                      <p className="font-extrabold text-sm text-gray-900 dark:text-white truncate max-w-[140px] mb-1">{s.name}</p>
                      <p className="text-xs text-gray-500 font-medium">{s.teacher}</p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-xl font-black text-lg shadow-sm border`} style={{ backgroundColor: `${color}15`, color, borderColor: `${color}30` }}>
                      {pct}%
                    </div>
                  </div>
                  
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-3 relative z-10">
                    <motion.div className="h-full rounded-full relative" style={{ backgroundColor: color }}
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.5, delay: 0.2 * i }}>
                        <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] opacity-50" />
                    </motion.div>
                  </div>
                  
                  <div className="flex justify-between items-center text-[11px] font-medium text-gray-400 relative z-10">
                    <span>{s.totalLessons} درس مكتمل</span>
                    <span style={{ color }}>{pct >= 85 ? 'مستوى ممتاز' : pct >= 65 ? 'أداء جيد' : 'يحتاج للتحسين'}</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Floating AI Button is already fixed in the component above */}
      <AiTutorWidget />
    </div>
  )
}
