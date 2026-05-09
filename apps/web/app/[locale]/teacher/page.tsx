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
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, Cell
} from 'recharts'

function KpiCard({ label, value, icon: Icon, color, sub }: {
  label: string; value: string | number; icon: any; color: string; sub?: string
}) {
  return (
    <motion.div whileHover={{ y: -4, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}
      className="bg-white/80 dark:bg-[#1e1e2d]/80 backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-3xl p-6 flex items-center gap-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
      <div className="absolute -top-6 -right-6 w-24 h-24 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-2xl rounded-full" style={{ backgroundColor: color }} />
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner relative z-10" style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}>
        <Icon className="w-7 h-7" style={{ color }} />
      </div>
      <div className="relative z-10">
        <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-1">{value}</p>
        <p className="text-sm font-bold text-gray-500 dark:text-gray-400">{label}</p>
        {sub && <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium mt-1">{sub}</p>}
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
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="bg-white dark:bg-[#1e1e2d] border border-gray-100 dark:border-white/10 rounded-[2rem] p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">تصحيح الواجب</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 flex items-center justify-center text-gray-500 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-4 mb-8">
          <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
            <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">{submission.assignment?.title}</p>
            <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5"><Users className="w-3 h-3" /> الطالب: {submission.student?.name || submission.student?.email}</p>
          </div>
          <div>
            <label className="text-sm font-bold text-gray-900 dark:text-white mb-2 block">الدرجة الممنوحة (من 100)</label>
            <input type="number" min={0} max={100} value={score} onChange={e => setScore(e.target.value)} placeholder="مثال: 95"
              className="w-full border-2 border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 bg-white dark:bg-[#12121a] text-gray-900 dark:text-white text-sm font-bold outline-none focus:border-teal-500 transition-colors" />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-900 dark:text-white mb-2 block">ملاحظات وتشجيع (اختياري)</label>
            <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={3} placeholder="اكتب ملاحظاتك للطالب هنا..."
              className="w-full border-2 border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 bg-white dark:bg-[#12121a] text-gray-900 dark:text-white text-sm font-medium outline-none resize-none focus:border-teal-500 transition-colors" />
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={submit} disabled={loading || !score}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-teal-500/30 disabled:opacity-50">
            {loading ? 'جاري الحفظ...' : 'اعتماد الدرجة'}
          </button>
          <button onClick={onClose} className="px-6 py-3.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl font-bold text-sm text-gray-700 dark:text-gray-300 transition-colors">إلغاء</button>
        </div>
      </motion.div>
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
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="relative w-16 h-16">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 border-4 border-teal-500/20 border-t-teal-600 rounded-full" />
      </div>
    </div>
  )

  if (error || !data) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center">
        <AlertCircle className="w-10 h-10 text-rose-500" />
      </div>
      <p className="text-xl font-bold text-gray-900 dark:text-white">{error || 'لا توجد بيانات متاحة'}</p>
      <button onClick={load} className="px-6 py-3 bg-teal-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-teal-500/30">إعادة المحاولة</button>
    </div>
  )

  const { teacher, summary, classPerformance, recentAssignments, attendanceSummary, interventionAlerts } = data
  const attPct = attendanceSummary?.totalRecords > 0
    ? Math.round((attendanceSummary.present / attendanceSummary.totalRecords) * 100) : 0

  const classChartData = (classPerformance || []).map(c => ({
    name: c.name.substring(0, 8), avg: Math.round(c.averageGrade || 0), students: c.studentCount
  }))

  const radarData = (classPerformance || []).slice(0, 6).map(c => ({
    subject: c.name.substring(0, 8), value: Math.round(c.averageGrade || 0)
  }))

  return (
    <div className="space-y-8 pb-12" dir="rtl">
      {/* Live toast */}
      <AnimatePresence>
        {liveNotif && (
          <motion.div initial={{ opacity: 0, y: -40, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-[#1e1e2d] border border-gray-100 dark:border-white/10 text-gray-900 dark:text-white px-5 py-3 rounded-2xl shadow-2xl shadow-teal-500/10 flex items-center gap-3 text-sm font-bold">
            <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-500/20 flex items-center justify-center text-teal-600">
              <Zap className="w-4 h-4" />
            </div>
            {liveNotif}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Hero Section */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0f766e] via-[#0369a1] to-[#1e3a8a] p-8 md:p-10 text-white shadow-2xl">
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50 mix-blend-overlay">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-30" />
          <motion.div animate={{ rotate: 360, scale: [1, 1.1, 1] }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-400/40 via-transparent to-transparent rounded-full blur-3xl" />
          <motion.div animate={{ rotate: -360, scale: [1, 1.2, 1] }} transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-40 -left-20 w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400/30 via-transparent to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-md mb-4 shadow-sm">
              <span className="text-xs font-bold text-teal-100 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-yellow-300" /> بوابة المعلم الذكية
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-teal-100">
              أهلاً بك، أ. {teacher.name}
            </h1>
            
            <div className="flex flex-wrap gap-4 mt-2">
              {[
                { icon: Users, val: summary.totalStudents, label: 'إجمالي الطلاب' },
                { icon: ClipboardList, val: summary.pendingSubmissions, label: 'بانتظار التصحيح' },
                { icon: Calendar, val: `${attPct}%`, label: 'متوسط الحضور' },
              ].map((s, i) => (
                <div key={i} className="bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 min-w-[150px] shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <s.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-black text-2xl text-white tracking-tight leading-none mb-1">{s.val}</p>
                    <p className="text-[11px] font-medium text-teal-100">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto">
            {[
              { href: '/teacher/assignments', icon: Plus, label: 'إسناد واجب جديد', primary: true },
              { href: '/teacher/content-generator', icon: BrainCircuit, label: 'توليد محتوى بالذكاء الاصطناعي', primary: false },
              { href: '/teacher/automation', icon: Zap, label: 'أدوات الأتمتة المتقدمة', primary: false },
            ].map((a, i) => (
              <Link key={i} href={a.href} className="w-full md:w-auto">
                <motion.button whileHover={{ scale: 1.02 }} className={`w-full flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-bold text-sm transition-all shadow-sm ${
                  a.primary 
                    ? 'bg-white text-teal-900 hover:bg-teal-50 shadow-[0_0_20px_rgb(255,255,255,0.2)]' 
                    : 'bg-white/10 hover:bg-white/20 border border-white/10 text-white backdrop-blur-sm'
                }`}>
                  <a.icon className="w-4 h-4" /> {a.label}
                </motion.button>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard label="الفصول المسندة" value={summary.totalClasses} icon={Users} color="#0d9488" />
        <KpiCard label="الواجبات النشطة" value={summary.totalAssignments} icon={FileText} color="#2563eb" />
        <KpiCard label="إجمالي الدروس" value={summary.totalLessons} icon={BookOpen} color="#7c3aed" />
        <KpiCard label="مهام التصحيح" value={gradingQueue.length} icon={ClipboardList} color="#d97706" sub="يتطلب انتباهك" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
          className="bg-white dark:bg-[#1e1e2d] border border-gray-100 dark:border-white/5 rounded-[2rem] p-7 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 dark:text-white text-lg leading-tight">متوسط درجات الفصول</h3>
              <p className="text-xs text-gray-500 mt-0.5">تحليل أداء الفصول الموكلة إليك</p>
            </div>
          </div>
          {classChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={classChartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-100 dark:text-gray-800/50" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 500 }} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="avg" fill="#0d9488" radius={[6, 6, 6, 6]} maxBarSize={40}>
                  {classChartData.map((_, index) => <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#0d9488' : '#14b8a6'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-[260px] flex items-center justify-center"><p className="text-gray-400 font-medium">لا توجد بيانات متاحة بعد</p></div>}
        </motion.div>

        {/* Radar Chart */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#1e1e2d] border border-gray-100 dark:border-white/5 rounded-[2rem] p-7 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 dark:text-white text-lg leading-tight">الأداء الشامل للمواد</h3>
              <p className="text-xs text-gray-500 mt-0.5">تقييم تفصيلي لتوزيع الدرجات</p>
            </div>
          </div>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="currentColor" className="text-gray-200 dark:text-gray-800" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 600 }} />
                <Radar dataKey="value" stroke="#0d9488" fill="#0d9488" fillOpacity={0.4} strokeWidth={3} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          ) : <div className="h-[260px] flex items-center justify-center"><p className="text-gray-400 font-medium">لا توجد بيانات متاحة</p></div>}
        </motion.div>
      </div>

      {/* Grading Queue + Tools Area */}
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        {/* Grading Queue */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-white dark:bg-[#1e1e2d] border border-gray-100 dark:border-white/5 rounded-[2rem] overflow-hidden shadow-sm flex flex-col">
          <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100 dark:border-white/5 bg-amber-50/50 dark:bg-amber-900/10">
            <h3 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-amber-500" /> مهام التصحيح المعلقة
              {gradingQueue.length > 0 && (
                <span className="bg-amber-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm">{gradingQueue.length}</span>
              )}
            </h3>
            <Link href="/teacher/grading" className="text-xs text-teal-600 dark:text-teal-400 font-bold flex items-center gap-1 hover:gap-2 transition-all px-3 py-1.5 rounded-full hover:bg-teal-50 dark:hover:bg-teal-500/10">
              عرض الكل <ChevronLeft className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-white/5 flex-1 overflow-y-auto min-h-[300px]">
            {gradingQueue.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                <div className="w-16 h-16 bg-teal-50 dark:bg-teal-500/10 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-teal-500" />
                </div>
                <p className="text-lg font-extrabold text-teal-700 dark:text-teal-400 mb-1">أنجزت جميع المهام!</p>
                <p className="text-xs text-gray-500">لا توجد واجبات بانتظار التصحيح حالياً.</p>
              </div>
            )}
            {gradingQueue.slice(0, 8).map((sub: any) => (
              <div key={sub.id} className="flex items-center gap-4 px-7 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-black text-lg flex-shrink-0 shadow-sm">
                  {(sub.student?.name || sub.student?.email || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 pr-2">
                  <p className="font-bold text-sm text-gray-900 dark:text-white truncate group-hover:text-teal-600 transition-colors mb-1">{sub.student?.name || sub.student?.email}</p>
                  <p className="text-xs text-gray-500 font-medium flex items-center gap-1"><BookOpen className="w-3 h-3" /> {sub.assignment?.title}</p>
                </div>
                <div className="flex-shrink-0 flex flex-col items-end gap-2">
                  <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(sub.submittedAt).toLocaleDateString('ar-SA')}</p>
                  <button onClick={() => setSelectedSubmission(sub)}
                    className="text-xs bg-teal-50 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 px-4 py-1.5 rounded-lg font-bold hover:bg-teal-600 hover:text-white transition-all shadow-sm">
                    صحح الآن
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Column: AI Tools & Alerts */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
          className="flex flex-col gap-6">
          
          {/* Recent Assignments Minimal Card */}
          <div className="bg-white dark:bg-[#1e1e2d] border border-gray-100 dark:border-white/5 rounded-[2rem] overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" /> آخر الواجبات المسندة
              </h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-white/5 p-2">
              {(recentAssignments || []).slice(0, 4).map((a: any) => (
                <div key={a.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{a.title}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{a.subject} • {a.submissions} تسليم</p>
                  </div>
                </div>
              ))}
              {(!recentAssignments || recentAssignments.length === 0) && (
                <p className="text-center text-gray-400 text-xs py-8 font-medium">لا توجد سجلات</p>
              )}
            </div>
          </div>

          {/* AI Premium Toolkit */}
          <div className="bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 rounded-[2rem] p-6 text-white shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700" />
            <h3 className="font-extrabold mb-4 flex items-center gap-2 text-base relative z-10">
              <Sparkles className="w-5 h-5 text-yellow-300" /> قدرات الذكاء الاصطناعي
            </h3>
            <div className="space-y-2.5 relative z-10">
              {[
                { href: '/teacher/content-generator', label: 'مساعد تحضير الدروس', icon: BrainCircuit },
                { href: '/teacher/student-risk-report', label: 'التنبؤ بتعثر الطلاب', icon: AlertCircle },
                { href: '/teacher/automation', label: 'التصحيح الآلي الذكي', icon: Zap },
              ].map((t, i) => (
                <Link key={i} href={t.href}>
                  <div className="flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl px-4 py-3 cursor-pointer transition-all backdrop-blur-sm">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                      <t.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-bold">{t.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Early Intervention Alerts */}
          {interventionAlerts && interventionAlerts.length > 0 && (
            <div className="bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/20 rounded-[2rem] p-6 shadow-sm">
              <h3 className="font-extrabold mb-4 flex items-center gap-2 text-sm text-rose-700 dark:text-rose-400">
                <AlertCircle className="w-5 h-5 animate-pulse" /> تنبيهات التدخل المبكر
              </h3>
              <div className="space-y-3">
                {interventionAlerts.map((alert: any) => (
                  <div key={alert.id} className="bg-white dark:bg-[#1e1e2d] rounded-2xl p-4 shadow-sm border border-rose-100 dark:border-rose-500/10">
                    <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">{alert.title}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-3">{alert.body}</p>
                    {alert.data?.studentId && (
                      <Link href={`/teacher/students/${alert.data.studentId}`} className="text-[11px] bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold px-3 py-1.5 rounded-lg inline-flex hover:bg-rose-200 transition-colors">
                        إجراء تدابير داعمة
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
