'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { dashboardApi } from '@/lib/api/dashboard'
import { apiClient } from '@/lib/api/client'
import { useRealtimeNotifications, useRealtimeAttendance } from '@/lib/providers/socket-provider'
import {
  User, BookOpen, Clock, CreditCard, AlertCircle, CheckCircle2,
  Loader2, TrendingUp, TrendingDown, Zap, BrainCircuit, MessageSquare,
  Calendar, Award, Shield, Bell, ChevronLeft, Sparkles, Star
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import Link from 'next/link'

// ── Sub-components ─────────────────────────────────────────
function ChildAvatar({ name, color }: { name: string; color: string }) {
  return (
    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shadow-lg"
      style={{ background: color }}>
      {(name || 'S')[0]}
    </div>
  )
}

function MiniGradeBar({ label, value, max = 100, color }: { label: string; value: number; max?: number; color: string }) {
  const pct = Math.min(Math.round((value / max) * 100), 100)
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-bold text-foreground">{value}/{max}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ backgroundColor: color }}
          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }} />
      </div>
    </div>
  )
}

const CHILD_COLORS = ['from-violet-500 to-purple-600', 'from-teal-500 to-emerald-600', 'from-rose-500 to-pink-600', 'from-amber-500 to-orange-500']
const CHILD_SOLID  = ['#8b5cf6', '#14b8a6', '#f43f5e', '#f59e0b']

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
    <div className="flex items-center justify-center py-6">
      <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
    </div>
  )

  if (!advice) return (
    <button onClick={fetch} className="w-full bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 py-3 rounded-xl text-sm font-bold hover:bg-violet-100 transition-colors">
      ✨ احصل على توصيات AI
    </button>
  )

  const statusColor = { excellent: '#22c55e', good: '#3b82f6', needsAttention: '#f59e0b', urgent: '#ef4444' }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColor[advice.overallStatus as keyof typeof statusColor] || '#6b7280' }} />
        <p className="text-sm font-bold text-foreground">{advice.summary}</p>
      </div>
      {advice.positives?.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-bold text-emerald-600">✅ نقاط القوة</p>
          {advice.positives.map((p: string, i: number) => <p key={i} className="text-xs text-muted-foreground pr-3">• {p}</p>)}
        </div>
      )}
      {advice.concerns?.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-bold text-amber-600">⚠️ نقاط تحتاج اهتمام</p>
          {advice.concerns.map((c: string, i: number) => <p key={i} className="text-xs text-muted-foreground pr-3">• {c}</p>)}
        </div>
      )}
      {advice.actionableAdvice?.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-bold text-blue-600">💡 توصيات عملية</p>
          {advice.actionableAdvice.map((a: string, i: number) => <p key={i} className="text-xs text-muted-foreground pr-3">• {a}</p>)}
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
    <motion.div whileHover={{ y: -2 }} onClick={onClick}
      className={`cursor-pointer rounded-3xl p-5 border-2 transition-all ${isSelected ? 'border-transparent shadow-xl' : 'border-border bg-card hover:border-muted-foreground/30'}`}
      style={isSelected ? { background: `linear-gradient(135deg, ${solid}15, ${solid}08)`, borderColor: solid } : {}}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white font-extrabold text-lg shadow`}>
          {(child.name || 'S')[0]}
        </div>
        <div>
          <p className="font-extrabold text-foreground">{child.name}</p>
          <p className="text-xs text-muted-foreground">{child.class || 'الصف غير محدد'}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted/50 rounded-xl p-2.5 text-center">
          <p className="text-xl font-extrabold" style={{ color: avgGrade >= 80 ? '#22c55e' : avgGrade >= 60 ? '#f59e0b' : '#ef4444' }}>{avgGrade}%</p>
          <p className="text-[10px] text-muted-foreground">المعدل</p>
        </div>
        <div className="bg-muted/50 rounded-xl p-2.5 text-center">
          <p className="text-xl font-extrabold" style={{ color: attPct >= 90 ? '#22c55e' : attPct >= 75 ? '#f59e0b' : '#ef4444' }}>{attPct}%</p>
          <p className="text-[10px] text-muted-foreground">الحضور</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${child.todayAttendance === 'PRESENT' ? 'bg-emerald-500' : child.todayAttendance === 'ABSENT' ? 'bg-rose-500' : 'bg-amber-500'}`} />
        <p className="text-xs text-muted-foreground">
          اليوم: {child.todayAttendance === 'PRESENT' ? 'حاضر' : child.todayAttendance === 'ABSENT' ? 'غائب ⚠️' : child.todayAttendance === 'LATE' ? 'متأخر' : 'لم يسجل بعد'}
        </p>
      </div>
    </motion.div>
  )
}

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
    <div className="flex justify-center items-center h-64">
      <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
    </div>
  )

  if (childrenData.length === 0) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <AlertCircle className="w-16 h-16 text-muted-foreground" />
      <h2 className="text-2xl font-bold text-foreground">لا يوجد أبناء مسجلين</h2>
      <p className="text-muted-foreground text-center max-w-sm">يرجى التواصل مع إدارة المدرسة لربط حسابك بحسابات أبنائك.</p>
    </div>
  )

  const selected = childrenData[selectedIdx]
  const solid = CHILD_SOLID[selectedIdx % CHILD_SOLID.length]

  const subjectGrades = (selected?.subjectPerformance || []).slice(0, 5)
  const gradeHistory = (selected?.gradeHistory || []).map((g: any) => ({ name: g.label || g.date, درجة: g.value || g.grade }))

  return (
    <div className="space-y-6 pb-10" dir="rtl">
      {/* Live Toasts */}
      <AnimatePresence>
        {(liveNotif || liveAttendance) && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-sm font-bold">
            <Bell className="w-4 h-4" /> {liveAttendance || liveNotif}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -left-10 w-48 h-48 bg-rose-300/20 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <p className="text-amber-100 text-sm mb-1">بوابة ولي الأمر</p>
          <h1 className="text-3xl font-extrabold mb-2">تابع تقدم أبنائك 👨‍👩‍👧‍👦</h1>
          <p className="text-white/80 text-sm">لديك <strong>{childrenData.length}</strong> {childrenData.length === 1 ? 'ابن/ابنة' : 'أبناء'} مسجلين في النظام</p>
          <div className="flex gap-4 mt-5 flex-wrap">
            {[
              { href: '/parent/payments', icon: CreditCard, label: 'المدفوعات' },
              { href: '/parent/notifications', icon: Bell, label: 'الإشعارات' },
              { href: '/parent/messages', icon: MessageSquare, label: 'تواصل مع المعلم' },
            ].map((a, i) => (
              <Link key={i} href={a.href}>
                <div className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-4 py-2 cursor-pointer transition-colors">
                  <a.icon className="w-4 h-4" />
                  <span className="text-sm font-bold">{a.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Children Selector */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {childrenData.map((child, i) => (
          <motion.div key={child.id || i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}>
            <ChildCard child={child} colorIdx={i} isSelected={selectedIdx === i} onClick={() => setSelectedIdx(i)} />
          </motion.div>
        ))}
      </div>

      {/* Selected Child Details */}
      <AnimatePresence mode="wait">
        <motion.div key={selectedIdx} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
          className="grid lg:grid-cols-[1fr_320px] gap-5">

          {/* Left: Grades + Chart */}
          <div className="space-y-5">
            {/* Grade History Chart */}
            <div className="bg-card border border-border rounded-3xl p-6">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" style={{ color: solid }} /> مسار الدرجات
              </h3>
              {gradeHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={gradeHistory} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="pG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={solid} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={solid} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} domain={[0, 100]} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                    <Area type="monotone" dataKey="درجة" stroke={solid} fill="url(#pG)" strokeWidth={2.5} dot={{ r: 4, fill: solid }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <p className="text-center text-muted-foreground text-sm py-10">لا توجد بيانات درجات بعد</p>}
            </div>

            {/* Subject Performance */}
            {subjectGrades.length > 0 && (
              <div className="bg-card border border-border rounded-3xl p-6">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" style={{ color: solid }} /> أداء المواد الدراسية
                </h3>
                <div className="space-y-3">
                  {subjectGrades.map((s: any, i: number) => (
                    <MiniGradeBar key={i} label={s.name} value={Math.round(s.averageGrade || 0)} color={solid} />
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Assignments */}
            {selected?.upcomingAssignments?.length > 0 && (
              <div className="bg-card border border-border rounded-3xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                  <h3 className="font-bold text-foreground flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-amber-500" /> واجبات قادمة
                  </h3>
                </div>
                <div className="divide-y divide-border/50">
                  {selected.upcomingAssignments.slice(0, 4).map((a: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 px-6 py-3">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: solid }} />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-foreground">{a.title}</p>
                        <p className="text-xs text-muted-foreground">{a.subject?.name} • {a.dueDate ? new Date(a.dueDate).toLocaleDateString('ar-SA') : 'بدون موعد'}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                        a.status === 'graded' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20' :
                        a.status === 'submitted' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20' :
                        'bg-amber-50 text-amber-700 dark:bg-amber-900/20'
                      }`}>{a.status === 'graded' ? 'مصحح' : a.status === 'submitted' ? 'مسلّم' : 'معلق'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: AI + Attendance */}
          <div className="space-y-4">
            {/* AI Advisor */}
            <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-5 text-white">
              <h3 className="font-bold mb-3 flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-yellow-300" /> تحليل AI لـ {selected.name}
              </h3>
              <div className="bg-white/10 rounded-2xl p-4">
                <AiAdvicePanel childId={selected.id} />
              </div>
            </div>

            {/* Attendance Stats */}
            <div className="bg-card border border-border rounded-3xl p-5">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4" style={{ color: solid }} /> إحصائيات الحضور
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'حاضر', value: selected.attendance?.present || 0, color: '#22c55e' },
                  { label: 'غائب', value: selected.attendance?.absent || 0, color: '#ef4444' },
                  { label: 'متأخر', value: selected.attendance?.late || 0, color: '#f59e0b' },
                  { label: 'بعذر', value: selected.attendance?.excused || 0, color: '#6b7280' },
                ].map((s, i) => (
                  <div key={i} className="bg-muted/50 rounded-xl p-3 text-center">
                    <p className="text-xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            {selected.gamification?.achievementsUnlocked > 0 && (
              <div className="bg-card border border-border rounded-3xl p-5">
                <h3 className="font-bold text-foreground mb-3 flex items-center gap-2 text-sm">
                  <Award className="w-4 h-4 text-yellow-500" /> الإنجازات
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-foreground">{selected.gamification.achievementsUnlocked}</p>
                    <p className="text-xs text-muted-foreground">إنجاز مفتوح</p>
                  </div>
                  <div className="mr-auto">
                    <p className="text-sm font-bold text-foreground">{selected.gamification.totalXP?.toLocaleString()} XP</p>
                    <p className="text-xs text-muted-foreground">المستوى {selected.gamification.level}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
