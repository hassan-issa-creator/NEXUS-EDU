'use client'

import { useEffect, useState, useCallback } from 'react'
import { Link } from '@/i18n/routing'
import { dashboardApi, TeacherDashboardResponse } from '@/lib/api/dashboard'
import { apiClient } from '@/lib/api/client'
import { motion, AnimatePresence } from 'framer-motion'
import { useRealtimeNotifications } from '@/lib/providers/socket-provider'
import {
  Users, FileText, ClipboardList, Calendar, BookOpen, Zap,
  BrainCircuit, TrendingUp, AlertCircle, CheckCircle2, Clock,
  ChevronLeft, Plus, BarChart3, Sparkles, MessageSquare, Award, X
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts'

function KpiCard({ label, value, icon: Icon, color, sub }: {
  label: string; value: string | number; icon: any; color: string; sub?: string
}) {
  return (
    <motion.div whileHover={{ y: -3, scale: 1.02 }} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}18` }}>
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
        {sub && <p className="text-[10px] text-muted-foreground/70">{sub}</p>}
      </div>
    </motion.div>
  )
}

// Quick Grade Modal
function QuickGradeModal({ submission, onClose, onGraded }: { submission: any; onClose: () => void; onGraded: () => void }) {
  const [score, setScore] = useState('')
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!score) return
    setLoading(true)
    try {
      await apiClient.patch(`/assignments/submissions/${submission.id}/grade`, { grade: Number(score), feedback })
      onGraded()
      onClose()
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="bg-card border border-border rounded-3xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground">تصحيح الواجب</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3 mb-5">
          <p className="text-sm font-bold text-foreground">{submission.assignment?.title}</p>
          <p className="text-xs text-muted-foreground">الطالب: {submission.student?.name || submission.student?.email}</p>
          <div>
            <label className="text-xs font-bold text-foreground mb-1 block">الدرجة (من 100)</label>
            <input type="number" min={0} max={100} value={score} onChange={e => setScore(e.target.value)}
              className="w-full border border-border rounded-xl px-3 py-2 bg-muted text-foreground text-sm outline-none focus:border-teal-500" />
          </div>
          <div>
            <label className="text-xs font-bold text-foreground mb-1 block">ملاحظات (اختياري)</label>
            <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={3}
              className="w-full border border-border rounded-xl px-3 py-2 bg-muted text-foreground text-sm outline-none resize-none focus:border-teal-500" />
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={submit} disabled={loading || !score}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-50">
            {loading ? 'جاري الحفظ...' : 'حفظ الدرجة'}
          </button>
          <button onClick={onClose} className="px-4 py-2.5 border border-border rounded-xl text-sm text-muted-foreground hover:bg-muted">إلغاء</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function TeacherDashboardPage() {
  const [data, setData] = useState<TeacherDashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null)
  const [liveNotif, setLiveNotif] = useState<string | null>(null)
  const [gradingQueue, setGradingQueue] = useState<any[]>([])

  const load = useCallback(async () => {
    try {
      const d = await dashboardApi.getTeacherDashboard()
      setData(d)
      setGradingQueue(d.gradingQueue || [])
    } catch { setError('تعذر تحميل بيانات لوحة التحكم') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  useRealtimeNotifications(useCallback((n: any) => {
    setLiveNotif(n.title)
    setTimeout(() => setLiveNotif(null), 4000)
  }, []))

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full" />
    </div>
  )

  if (error || !data) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <AlertCircle className="w-12 h-12 text-rose-500" />
      <p className="text-lg font-bold">{error || 'لا توجد بيانات'}</p>
      <button onClick={load} className="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm">إعادة المحاولة</button>
    </div>
  )

  const { teacher, summary, classPerformance, recentAssignments, attendanceSummary, interventionAlerts } = data
  const attPct = attendanceSummary?.totalRecords > 0
    ? Math.round((attendanceSummary.present / attendanceSummary.totalRecords) * 100) : 0

  const classChartData = (classPerformance || []).map(c => ({
    name: c.name.substring(0, 8), avg: Math.round(c.averageGrade || 0), students: c.studentCount
  }))

  const radarData = (classPerformance || []).slice(0, 6).map(c => ({
    subject: c.name.substring(0, 6), value: Math.round(c.averageGrade || 0)
  }))

  return (
    <div className="space-y-6 pb-10" dir="rtl">
      {/* Live toast */}
      <AnimatePresence>
        {liveNotif && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-sm font-bold">
            <Zap className="w-4 h-4" /> {liveNotif}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-10 w-56 h-56 bg-cyan-300/20 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-teal-200 text-sm font-medium mb-1">مرحباً،</p>
            <h1 className="text-3xl font-extrabold mb-3">{teacher.name}</h1>
            <div className="grid grid-cols-3 gap-4 mt-2">
              {[
                { icon: Users, val: summary.totalStudents, label: 'طالب' },
                { icon: ClipboardList, val: summary.pendingSubmissions, label: 'بانتظار التصحيح' },
                { icon: Calendar, val: `${attPct}%`, label: 'نسبة الحضور' },
              ].map((s, i) => (
                <div key={i} className="bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3">
                  <s.icon className="w-4 h-4 text-white/70 mb-1" />
                  <p className="text-xl font-extrabold">{s.val}</p>
                  <p className="text-xs text-white/70">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Quick Actions */}
          <div className="flex flex-col gap-2">
            {[
              { href: '/teacher/assignments', icon: Plus, label: 'واجب جديد', color: 'bg-white/20' },
              { href: '/teacher/content-generator', icon: BrainCircuit, label: 'توليد محتوى AI', color: 'bg-white/20' },
              { href: '/teacher/automation', icon: Zap, label: 'أدوات الأتمتة', color: 'bg-white/20' },
            ].map((a, i) => (
              <Link key={i} href={a.href}>
                <motion.div whileHover={{ x: -3 }} className={`${a.color} hover:bg-white/30 backdrop-blur-sm flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-colors`}>
                  <a.icon className="w-4 h-4" />
                  <span className="text-sm font-bold">{a.label}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="الفصول" value={summary.totalClasses} icon={Users} color="#14b8a6" />
        <KpiCard label="الواجبات" value={summary.totalAssignments} icon={FileText} color="#3b82f6" />
        <KpiCard label="الدروس" value={summary.totalLessons} icon={BookOpen} color="#8b5cf6" />
        <KpiCard label="بانتظار التصحيح" value={gradingQueue.length} icon={ClipboardList} color="#f59e0b" sub="اضغط لتصحيح" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-5">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
          className="bg-card border border-border rounded-3xl p-6">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-500" /> متوسط درجات الفصول
          </h3>
          {classChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={classChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} domain={[0, 100]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}
                  formatter={(v: any) => [`${v}%`, 'المتوسط']} />
                <Bar dataKey="avg" fill="#14b8a6" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-muted-foreground text-sm py-12">لا توجد بيانات بعد</p>}
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-3xl p-6">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" /> أداء الفصول (رادار)
          </h3>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Radar dataKey="value" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.3} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-muted-foreground text-sm py-12">لا توجد بيانات</p>}
        </motion.div>
      </div>

      {/* Grading Queue + Recent Assignments */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-5">
        {/* Grading Queue */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-card border border-border rounded-3xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-amber-50/50 dark:bg-amber-900/10">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-amber-500" /> قائمة التصحيح
              {gradingQueue.length > 0 && (
                <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{gradingQueue.length}</span>
              )}
            </h3>
            <Link href="/teacher/grading" className="text-xs text-teal-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              عرض الكل <ChevronLeft className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border/50">
            {gradingQueue.length === 0 && (
              <div className="flex flex-col items-center py-12 gap-2">
                <CheckCircle2 className="w-10 h-10 text-teal-500" />
                <p className="text-sm font-bold text-teal-600">أحسنت! لا توجد واجبات بانتظار التصحيح</p>
              </div>
            )}
            {gradingQueue.slice(0, 8).map((sub: any, i) => (
              <div key={sub.id} className="flex items-center gap-4 px-6 py-3 hover:bg-muted/40 transition-colors">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {(sub.student?.name || sub.student?.email || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-foreground truncate">{sub.student?.name || sub.student?.email}</p>
                  <p className="text-xs text-muted-foreground truncate">{sub.assignment?.title}</p>
                </div>
                <div className="flex-shrink-0 text-left">
                  <p className="text-[10px] text-muted-foreground">{new Date(sub.submittedAt).toLocaleDateString('ar-SA')}</p>
                  <button onClick={() => setSelectedSubmission(sub)}
                    className="mt-1 text-xs bg-teal-600 text-white px-3 py-1 rounded-lg font-bold hover:bg-teal-700 transition-colors">
                    صحح
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Assignments + AI tools */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
          className="flex flex-col gap-4">
          <div className="bg-card border border-border rounded-3xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" /> آخر الواجبات
              </h3>
            </div>
            <div className="divide-y divide-border/50">
              {(recentAssignments || []).slice(0, 5).map((a: any) => (
                <div key={a.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.subject} • {a.submissions} تسليم</p>
                  </div>
                </div>
              ))}
              {(!recentAssignments || recentAssignments.length === 0) && (
                <p className="text-center text-muted-foreground text-xs py-6">لا توجد واجبات</p>
              )}
            </div>
          </div>

          {/* AI Toolkit */}
          <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-5 text-white">
            <h3 className="font-bold mb-3 flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-yellow-300" /> أدوات الذكاء الاصطناعي
            </h3>
            <div className="space-y-2">
              {[
                { href: '/teacher/content-generator', label: 'توليد محتوى تعليمي', icon: BrainCircuit },
                { href: '/teacher/student-risk-report', label: 'تقرير الطلاب المعرضين للخطر', icon: AlertCircle },
                { href: '/teacher/automation', label: 'الأتمتة والجدولة', icon: Zap },
              ].map((t, i) => (
                <Link key={i} href={t.href}>
                  <div className="flex items-center gap-2 bg-white/15 hover:bg-white/25 rounded-xl px-3 py-2.5 cursor-pointer transition-colors">
                    <t.icon className="w-4 h-4 text-yellow-200" />
                    <span className="text-xs font-bold">{t.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Early Intervention Alerts */}
          {interventionAlerts && interventionAlerts.length > 0 && (
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-3xl p-5 shadow-sm">
              <h3 className="font-bold mb-3 flex items-center gap-2 text-sm text-rose-700 dark:text-rose-400">
                <AlertCircle className="w-4 h-4" /> تنبيهات التدخل المبكر
              </h3>
              <div className="space-y-3">
                {interventionAlerts.map(alert => (
                  <div key={alert.id} className="bg-white dark:bg-gray-800 rounded-xl p-3 text-xs border border-rose-100 dark:border-rose-900/30">
                    <p className="font-bold text-foreground mb-1">{alert.title}</p>
                    <p className="text-muted-foreground leading-relaxed">{alert.body}</p>
                    {alert.data?.studentId && (
                      <Link href={`/teacher/students/${alert.data.studentId}`} className="mt-2 text-rose-600 dark:text-rose-400 font-semibold inline-block hover:underline">
                        فتح ملف الطالب
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Grade Modal */}
      <AnimatePresence>
        {selectedSubmission && (
          <QuickGradeModal submission={selectedSubmission}
            onClose={() => setSelectedSubmission(null)}
            onGraded={() => { load(); setGradingQueue(q => q.filter(s => s.id !== selectedSubmission.id)) }} />
        )}
      </AnimatePresence>
    </div>
  )
}
