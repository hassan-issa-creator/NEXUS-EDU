'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { dashboardApi } from '@/lib/api/dashboard'
import { apiClient } from '@/lib/api/client'
import { useRealtimeNotifications, useRealtimeAttendance } from '@/lib/providers/socket-provider'
import {
  User, BookOpen, Clock, CreditCard, AlertCircle, CheckCircle2,
  Loader2, TrendingUp, TrendingDown, Zap, BrainCircuit, MessageSquare,
  Calendar, Award, Shield, Bell, ChevronLeft, Sparkles, Star, Trophy
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import Link from 'next/link'

// ── Sub-components ─────────────────────────────────────────
function ChildAvatar({ name, color }: { name: string; color: string }) {
  return (
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg border-2 border-white/20"
      style={{ background: color }}>
      {(name || 'S')[0]}
    </div>
  )
}

function MiniGradeBar({ label, value, max = 100, color }: { label: string; value: number; max?: number; color: string }) {
  const pct = Math.min(Math.round((value / max) * 100), 100)
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold">
        <span className="text-gray-600 dark:text-gray-300">{label}</span>
        <span className="text-gray-900 dark:text-white" style={{ color }}>{value}/{max}</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <motion.div className="h-full rounded-full relative" style={{ backgroundColor: color }}
          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: "easeOut" }}>
          <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] opacity-50" />
        </motion.div>
      </div>
    </div>
  )
}

const CHILD_COLORS = ['from-violet-500 to-indigo-600', 'from-teal-500 to-emerald-600', 'from-rose-500 to-pink-600', 'from-amber-500 to-orange-500']
const CHILD_SOLID  = ['#8b5cf6', '#10b981', '#f43f5e', '#f59e0b']

// ── AI Advice Panel ───────────────────────────────────────
function AiAdvicePanel({ childId }: { childId: string }) {
  const [advice, setAdvice] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetch = async () => {
    if (!childId || loading) return
    setLoading(true)
    try {
      const res = await apiClient.post('/ai/parent-advice', { studentId: childId })
      if (res.data?.success) setAdvice(res.data.data)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [childId])

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-10 gap-3">
      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
        <Sparkles className="w-6 h-6 animate-pulse text-yellow-300" />
      </div>
      <p className="text-xs font-bold text-white/80">المعلم الذكي يقوم بتحليل البيانات...</p>
    </div>
  )

  if (!advice) return (
    <button onClick={fetch} className="w-full bg-white text-violet-700 hover:bg-gray-50 py-4 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2">
      <Sparkles className="w-4 h-4 text-violet-500" /> توليد تقرير الذكاء الاصطناعي
    </button>
  )

  const statusColor = { excellent: '#4ade80', good: '#60a5fa', needsAttention: '#fbbf24', urgent: '#f87171' }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
        <div className="w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]" style={{ backgroundColor: statusColor[advice.overallStatus as keyof typeof statusColor] || '#9ca3af', color: statusColor[advice.overallStatus as keyof typeof statusColor] }} />
        <p className="text-sm font-bold text-white leading-relaxed">{advice.summary}</p>
      </div>
      
      {advice.positives?.length > 0 && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl">
          <p className="text-xs font-black text-emerald-300 mb-2 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> الإيجابيات ونقاط القوة</p>
          {advice.positives.map((p: string, i: number) => <p key={i} className="text-[11px] text-emerald-50/90 font-medium pr-5 mb-1 relative before:content-[''] before:absolute before:right-1.5 before:top-1.5 before:w-1.5 before:h-1.5 before:bg-emerald-400 before:rounded-full">{p}</p>)}
        </div>
      )}
      
      {advice.concerns?.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl">
          <p className="text-xs font-black text-amber-300 mb-2 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> ملاحظات تتطلب انتباهك</p>
          {advice.concerns.map((c: string, i: number) => <p key={i} className="text-[11px] text-amber-50/90 font-medium pr-5 mb-1 relative before:content-[''] before:absolute before:right-1.5 before:top-1.5 before:w-1.5 before:h-1.5 before:bg-amber-400 before:rounded-full">{c}</p>)}
        </div>
      )}
      
      {advice.actionableAdvice?.length > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/20 p-3.5 rounded-xl">
          <p className="text-xs font-black text-blue-300 mb-2 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> خطة عمل مقترحة</p>
          {advice.actionableAdvice.map((a: string, i: number) => <p key={i} className="text-[11px] text-blue-50/90 font-medium pr-5 mb-1 relative before:content-[''] before:absolute before:right-1.5 before:top-1.5 before:w-1.5 before:h-1.5 before:bg-blue-400 before:rounded-full">{a}</p>)}
        </div>
      )}
    </div>
  )
}

// ── Child Card ─────────────────────────────────────────────
function ChildCard({ child, colorIdx, isSelected, onClick }: {
  child: any; colorIdx: number; isSelected: boolean; onClick: () => void
}) {
  const color = CHILD_COLORS[colorIdx % CHILD_COLORS.length]
  const solid = CHILD_SOLID[colorIdx % CHILD_SOLID.length]
  const attTotal = (child.attendance?.present || 0) + (child.attendance?.absent || 0) + (child.attendance?.late || 0)
  const attPct = attTotal > 0 ? Math.round((child.attendance?.present / attTotal) * 100) : 0
  const avgGrade = Math.round(child.summary?.averageGrade || 0)

  return (
    <motion.div whileHover={{ y: -4, scale: 1.02 }} onClick={onClick} transition={{ type: "spring", stiffness: 300 }}
      className={`cursor-pointer rounded-[2rem] p-6 border-2 transition-all relative overflow-hidden group ${
        isSelected 
          ? 'border-transparent shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)]' 
          : 'border-gray-100 dark:border-white/5 bg-white dark:bg-[#1e1e2d] hover:border-gray-200 dark:hover:border-white/10'
      }`}
      style={isSelected ? { background: `linear-gradient(135deg, ${solid}15, ${solid}05)`, borderColor: `${solid}50` } : {}}>
      
      {isSelected && (
        <div className="absolute -top-10 -left-10 w-32 h-32 blur-3xl opacity-30 rounded-full" style={{ backgroundColor: solid }} />
      )}

      <div className="flex items-center gap-4 mb-5 relative z-10">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white font-black text-xl shadow-lg border border-white/20`}>
          {(child.name || 'S')[0]}
        </div>
        <div>
          <p className="font-extrabold text-gray-900 dark:text-white text-lg">{child.name}</p>
          <p className="text-xs font-medium text-gray-500">{child.class || 'تحديد المستوى معلق'}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 relative z-10">
        <div className={`rounded-xl p-3 text-center border ${isSelected ? 'bg-white/50 dark:bg-black/20 border-transparent' : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5'}`}>
          <p className="text-2xl font-black mb-0.5" style={{ color: avgGrade >= 85 ? '#10b981' : avgGrade >= 65 ? '#f59e0b' : '#ef4444' }}>{avgGrade}%</p>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">المعدل العام</p>
        </div>
        <div className={`rounded-xl p-3 text-center border ${isSelected ? 'bg-white/50 dark:bg-black/20 border-transparent' : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5'}`}>
          <p className="text-2xl font-black mb-0.5" style={{ color: attPct >= 90 ? '#10b981' : attPct >= 75 ? '#f59e0b' : '#ef4444' }}>{attPct}%</p>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">نسبة الحضور</p>
        </div>
      </div>
      
      <div className="mt-4 flex items-center gap-2 px-1 relative z-10">
        <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-white/5">
          <div className={`w-2 h-2 rounded-full ${child.todayAttendance === 'PRESENT' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : child.todayAttendance === 'ABSENT' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`} />
          <p className="text-[11px] font-bold text-gray-600 dark:text-gray-300">
            {child.todayAttendance === 'PRESENT' ? 'حاضر اليوم' : child.todayAttendance === 'ABSENT' ? 'غائب اليوم' : child.todayAttendance === 'LATE' ? 'متأخر' : 'لم يسجل الحضور بعد'}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// Custom Tooltip
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

// ── Main ──────────────────────────────────────────────────
export default function ParentDashboard() {
  const [childrenData, setChildrenData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [liveNotif, setLiveNotif] = useState<string | null>(null)
  const [liveAttendance, setLiveAttendance] = useState<string | null>(null)

  useEffect(() => {
    dashboardApi.getParentDashboard()
      .then((d: any) => { if (d?.children) setChildrenData(d.children) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useRealtimeNotifications(useCallback((n: any) => {
    setLiveNotif(n.title); setTimeout(() => setLiveNotif(null), 5000)
  }, []))

  useRealtimeAttendance(useCallback((a: any) => {
    const msg = a.status === 'PRESENT' ? `✅ ${a.studentName || 'ابنك'} حضر اليوم` : `⚠️ ${a.studentName || 'ابنك'} غائب اليوم`
    setLiveAttendance(msg); setTimeout(() => setLiveAttendance(null), 6000)
  }, []))

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="relative w-16 h-16">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 border-4 border-amber-500/20 border-t-amber-500 rounded-full" />
      </div>
    </div>
  )

  if (childrenData.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-24 h-24 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-2">
        <User className="w-10 h-10 text-gray-400" />
      </div>
      <h2 className="text-2xl font-black text-gray-900 dark:text-white">لم يتم ربط أي أبناء بحسابك</h2>
      <p className="text-gray-500 text-center max-w-sm font-medium">يرجى التواصل مع إدارة المدرسة أو استخدام كود الربط المخصص لإضافة أبنائك.</p>
    </div>
  )

  const selected = childrenData[selectedIdx]
  const solid = CHILD_SOLID[selectedIdx % CHILD_SOLID.length]

  const subjectGrades = (selected?.subjectPerformance || []).slice(0, 5)
  const gradeHistory = (selected?.gradeHistory || []).map((g: any) => ({ name: g.label || g.date, درجة: g.value || g.grade }))

  return (
    <div className="space-y-8 pb-12" dir="rtl">
      {/* Live Toasts */}
      <AnimatePresence>
        {(liveNotif || liveAttendance) && (
          <motion.div initial={{ opacity: 0, y: -40, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-[#1e1e2d] border border-gray-100 dark:border-white/10 text-gray-900 dark:text-white px-5 py-3 rounded-2xl shadow-2xl shadow-amber-500/10 flex items-center gap-3 text-sm font-bold">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-600">
              <Bell className="w-4 h-4" />
            </div>
            {liveAttendance || liveNotif}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Hero Section */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#d97706] via-[#ea580c] to-[#e11d48] p-8 md:p-10 text-white shadow-[0_20px_50px_rgba(234,88,12,0.25)]">
        <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-overlay opacity-40">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-300/40 via-transparent to-transparent rounded-full blur-3xl" />
          <motion.div animate={{ rotate: -360 }} transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-40 -left-20 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-400/40 via-transparent to-transparent rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-4 shadow-sm">
              <span className="text-xs font-bold text-amber-100 flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-yellow-300" /> بوابة المتابعة الأبوية الموحدة
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
              أهلاً بك، ولي الأمر 👨‍👩‍👧‍👦
            </h1>
            <p className="text-white/90 text-sm md:text-base font-medium mb-6 max-w-xl leading-relaxed">
              تتابع من خلال هذا المركز الأداء الأكاديمي لـ <strong className="text-yellow-200 text-lg px-1">{childrenData.length}</strong> {childrenData.length === 1 ? 'ابن مسجل' : 'أبناء مسجلين'}. ابقَ على اطلاع دائم بمسارهم التعليمي.
            </p>
            
            <div className="flex flex-wrap gap-3">
              {[
                { href: '/parent/payments', icon: CreditCard, label: 'الرسوم والمدفوعات', bg: 'bg-white/15' },
                { href: '/parent/notifications', icon: Bell, label: 'سجل الإشعارات', bg: 'bg-white/15' },
                { href: '/parent/messages', icon: MessageSquare, label: 'تواصل مباشر مع الهيئة', bg: 'bg-white text-orange-600 hover:bg-white/90' },
              ].map((a, i) => (
                <Link key={i} href={a.href}>
                  <motion.div whileHover={{ scale: 1.05 }} className={`flex items-center gap-2 ${a.bg} backdrop-blur-sm rounded-xl px-5 py-3 cursor-pointer transition-colors shadow-sm`}>
                    <a.icon className="w-4 h-4" />
                    <span className="text-sm font-bold">{a.label}</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Children Selector Grid */}
      <div>
        <h2 className="text-lg font-extrabold text-gray-900 dark:text-white mb-4 flex items-center gap-2 px-1">
          <Users className="w-5 h-5 text-amber-500" /> اختر الملف للمتابعة التفصيلية
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {childrenData.map((child, i) => (
            <motion.div key={child.id || i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <ChildCard child={child} colorIdx={i} isSelected={selectedIdx === i} onClick={() => setSelectedIdx(i)} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Selected Child Details Studio */}
      <AnimatePresence mode="wait">
        <motion.div key={selectedIdx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
          className="grid lg:grid-cols-[1fr_360px] gap-6 pt-4 border-t border-gray-100 dark:border-white/5">

          {/* Left Column: Grades + Progress */}
          <div className="space-y-6">
            
            {/* Grade History Area Chart */}
            <div className="bg-white dark:bg-[#1e1e2d] border border-gray-100 dark:border-white/5 rounded-[2rem] p-7 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-extrabold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${solid}15` }}>
                    <TrendingUp className="w-4 h-4" style={{ color: solid }} />
                  </div>
                  مسار التقدم الأكاديمي الشامل
                </h3>
              </div>
              {gradeHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={gradeHistory} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="pG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={solid} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={solid} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-100 dark:text-gray-800/50" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 500 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 500 }} domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: solid, strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area type="monotone" dataKey="درجة" stroke={solid} fill="url(#pG)" strokeWidth={3} activeDot={{ r: 6, fill: solid, stroke: '#fff', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <div className="h-[240px] flex items-center justify-center"><p className="text-gray-400 font-medium">لم يتم تسجيل درجات بعد لتقييم المسار</p></div>}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Detailed Subject Performance */}
              {subjectGrades.length > 0 && (
                <div className="bg-white dark:bg-[#1e1e2d] border border-gray-100 dark:border-white/5 rounded-[2rem] p-7 shadow-sm">
                  <h3 className="font-extrabold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" style={{ color: solid }} /> تفصيل أداء المواد
                  </h3>
                  <div className="space-y-5">
                    {subjectGrades.map((s: any, i: number) => (
                      <MiniGradeBar key={i} label={s.name} value={Math.round(s.averageGrade || 0)} color={solid} />
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Assignments Tracker */}
              {selected?.upcomingAssignments?.length > 0 && (
                <div className="bg-white dark:bg-[#1e1e2d] border border-gray-100 dark:border-white/5 rounded-[2rem] p-7 shadow-sm">
                  <h3 className="font-extrabold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-500" /> الواجبات والمهام القادمة
                  </h3>
                  <div className="space-y-4">
                    {selected.upcomingAssignments.slice(0, 4).map((a: any, i: number) => (
                      <div key={i} className="flex items-center gap-4 bg-gray-50 dark:bg-white/5 p-3.5 rounded-2xl border border-gray-100 dark:border-white/5">
                        <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center shadow-sm bg-white dark:bg-[#12121a]">
                          <span className="text-[10px] text-gray-400 font-bold leading-none">{a.dueDate ? new Date(a.dueDate).toLocaleDateString('ar-SA', { month: 'short' }) : '-'}</span>
                          <span className="text-sm font-black text-gray-900 dark:text-white leading-none mt-1">{a.dueDate ? new Date(a.dueDate).getDate() : '-'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate mb-0.5">{a.title}</p>
                          <p className="text-[11px] font-medium text-gray-500 truncate">{a.subject?.name}</p>
                        </div>
                        <span className={`text-[10px] px-2.5 py-1.5 rounded-lg font-black shadow-sm ${
                          a.status === 'graded' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' :
                          a.status === 'submitted' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' :
                          'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                        }`}>{a.status === 'graded' ? 'تم التصحيح' : a.status === 'submitted' ? 'في الانتظار' : 'غير مسلم'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: AI Analytics + Attendance */}
          <div className="space-y-6">
            
            {/* AI Advisor Panel */}
            <div className="bg-gradient-to-br from-[#4c1d95] via-[#6d28d9] to-[#4338ca] rounded-[2rem] p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10">
                <h3 className="font-black text-white mb-5 flex items-center gap-2 text-base">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shadow-inner">
                    <BrainCircuit className="w-4 h-4 text-yellow-300" />
                  </div>
                  تحليل AI لـ {selected.name}
                </h3>
                <div className="bg-white/10 rounded-[1.5rem] p-5 backdrop-blur-md border border-white/20 shadow-inner">
                  <AiAdvicePanel childId={selected.id} />
                </div>
              </div>
            </div>

            {/* Attendance Matrix */}
            <div className="bg-white dark:bg-[#1e1e2d] border border-gray-100 dark:border-white/5 rounded-[2rem] p-6 shadow-sm">
              <h3 className="font-extrabold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                <Calendar className="w-5 h-5" style={{ color: solid }} /> سجل الحضور التفصيلي
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'أيام الحضور', value: selected.attendance?.present || 0, color: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                  { label: 'أيام الغياب', value: selected.attendance?.absent || 0, color: '#ef4444', bg: 'bg-rose-50 dark:bg-rose-500/10' },
                  { label: 'مرات التأخير', value: selected.attendance?.late || 0, color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-500/10' },
                  { label: 'غياب بعذر', value: selected.attendance?.excused || 0, color: '#6b7280', bg: 'bg-gray-50 dark:bg-white/5' },
                ].map((s, i) => (
                  <div key={i} className={`${s.bg} rounded-2xl p-4 text-center border border-transparent shadow-sm relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-2 h-2 rounded-bl-lg" style={{ backgroundColor: s.color }} />
                    <p className="text-3xl font-black mb-1" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-[11px] font-bold text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Gamification Banner */}
            {selected.gamification?.achievementsUnlocked > 0 && (
              <div className="bg-gradient-to-l from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 border border-yellow-200 dark:border-yellow-700/30 rounded-[2rem] p-6 flex items-center gap-4 shadow-sm">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-[1.25rem] flex items-center justify-center shadow-lg border-2 border-white dark:border-[#1e1e2d] flex-shrink-0">
                  <Trophy className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-gray-900 dark:text-white mb-0.5">البطل {selected.name} 🌟</p>
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 font-medium leading-relaxed">فتح {selected.gamification.achievementsUnlocked} أوسمة إنجاز ووصل إلى المستوى {selected.gamification.level}.</p>
                </div>
                <div className="text-center px-3 border-r border-yellow-200 dark:border-yellow-700/50">
                  <p className="text-lg font-black text-orange-600 dark:text-orange-400 leading-none">{selected.gamification.totalXP?.toLocaleString()}</p>
                  <p className="text-[9px] font-bold text-yellow-700 dark:text-yellow-500 mt-1">إجمالي النقاط</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
