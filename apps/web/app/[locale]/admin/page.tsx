'use client'

import { useEffect, useState, useCallback } from 'react'
import { dashboardApi, AdminDashboardResponse } from '@/lib/api/dashboard'
import { motion, AnimatePresence } from 'framer-motion'
import { SocketProvider, useRealtimeNotifications } from '@/lib/providers/socket-provider'
import {
  Activity, DollarSign, GraduationCap, Users, Plus, FileText,
  Database, Bell, Shield, BarChart3, TrendingUp, Zap, RefreshCw,
  CheckCircle2, AlertCircle, Clock, UserCheck, BookOpen, School
} from 'lucide-react'
import { Link } from '@/i18n/routing'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line
} from 'recharts'

function KpiCard({ title, value, icon: Icon, color, description, trend }: {
  title: string; value: string | number; icon: any; color: string; description: string; trend?: number
}) {
  const isUp = (trend ?? 0) >= 0
  return (
    <motion.div whileHover={{ y: -3 }}
      className="bg-card border border-border rounded-2xl p-5 relative overflow-hidden group">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `radial-gradient(circle at 0% 0%, ${color}08, transparent 70%)` }} />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          {trend !== undefined && (
            <span className={`text-xs font-bold ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isUp ? '▲' : '▼'} {Math.abs(trend)}%
            </span>
          )}
        </div>
        <p className="text-2xl font-extrabold text-foreground">{value}</p>
        <p className="text-xs font-bold text-foreground/70 mt-0.5">{title}</p>
        <p className="text-[10px] text-muted-foreground mt-1">{description}</p>
      </div>
    </motion.div>
  )
}

function AdminDashboardInner() {
  const [data, setData] = useState<AdminDashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [liveNotif, setLiveNotif] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try { setData(await dashboardApi.getAdminDashboard()) }
    catch { setError('تعذر تحميل بيانات لوحة تحكم الإدارة.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  useRealtimeNotifications(useCallback((n: any) => {
    setLiveNotif(n.title); setTimeout(() => setLiveNotif(null), 5000)
  }, []))

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full" />
    </div>
  )

  if (error || !data) return (
    <div className="flex flex-col items-center gap-3 h-64 justify-center">
      <AlertCircle className="w-12 h-12 text-rose-500" />
      <p className="font-bold">{error}</p>
      <button onClick={load} className="px-4 py-2 bg-rose-600 text-white rounded-xl text-sm">إعادة المحاولة</button>
    </div>
  )

  const enrollData = (data.enrollmentSeries || []).map(e => {
    const m: Record<string,string> = { Jan:'يناير',Feb:'فبراير',Mar:'مارس',Apr:'أبريل',May:'مايو',Jun:'يونيو',Jul:'يوليو',Aug:'أغسطس',Sep:'سبتمبر',Oct:'أكتوبر',Nov:'نوفمبر',Dec:'ديسمبر' }
    return { name: m[e.label] || e.label, طلاب: e.value }
  })
  const revData = (data.revenueSeries || []).map(e => {
    const m: Record<string,string> = { Jan:'يناير',Feb:'فبراير',Mar:'مارس',Apr:'أبريل',May:'مايو',Jun:'يونيو',Jul:'يوليو',Aug:'أغسطس',Sep:'سبتمبر',Oct:'أكتوبر',Nov:'نوفمبر',Dec:'ديسمبر' }
    return { name: m[e.label] || e.label, إيرادات: e.value }
  })
  const { paid, pending, failed, requiresAction, refunded } = data.invoiceSummary
  const invoiceData = [
    { name: 'مدفوعة', value: paid, color: '#22c55e' },
    { name: 'معلقة', value: pending, color: '#f59e0b' },
    { name: 'فشلت', value: failed, color: '#ef4444' },
  ].filter(d => d.value > 0)

  return (
    <div className="space-y-6 pb-10" dir="rtl">
      {/* Live toast */}
      <AnimatePresence>
        {liveNotif && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-rose-600 to-red-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-sm font-bold">
            <Bell className="w-4 h-4" /> {liveNotif}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-600 via-red-600 to-pink-700 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-10 w-56 h-56 bg-pink-300/20 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-rose-200 text-sm font-medium mb-1">مركز التحكم الإداري</p>
            <h1 className="text-3xl font-extrabold mb-2">مرحباً، {data.admin.name} 👑</h1>
            <p className="text-white/80 text-sm mb-4">نظرة شاملة على عمليات المنصة في الوقت الفعلي</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { val: data.kpis.totalStudents, label: 'طالب', icon: GraduationCap },
                { val: data.kpis.totalTeachers, label: 'معلم', icon: BookOpen },
                { val: `${(data.kpis.totalRevenue || 0).toLocaleString()} ر.س`, label: 'إيرادات', icon: DollarSign },
              ].map((s, i) => (
                <div key={i} className="bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center gap-2">
                  <s.icon className="w-4 h-4 text-white/70" />
                  <div>
                    <p className="font-extrabold text-lg">{s.val}</p>
                    <p className="text-xs text-white/70">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Link href="/admin/users">
              <div className="flex items-center gap-2 bg-white text-rose-700 rounded-xl px-4 py-2.5 cursor-pointer font-bold text-sm hover:bg-white/90 transition-colors">
                <Plus className="w-4 h-4" /> إضافة مستخدم
              </div>
            </Link>
            <button onClick={load}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 rounded-xl px-4 py-2.5 cursor-pointer font-bold text-sm transition-colors">
              <RefreshCw className="w-4 h-4" /> تحديث البيانات
            </button>
            <Link href="/admin/enrollments">
              <div className="flex items-center gap-2 bg-white/20 hover:bg-white/30 rounded-xl px-4 py-2.5 cursor-pointer font-bold text-sm transition-colors">
                <BarChart3 className="w-4 h-4" /> تقرير شامل
              </div>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'إجمالي المستخدمين', value: data.kpis.totalUsers, icon: Users, color: '#f43f5e', description: `${data.kpis.activeUsers} حساب نشط`, trend: 5 },
          { title: 'الطلاب', value: data.kpis.totalStudents, icon: GraduationCap, color: '#3b82f6', description: 'إجمالي حسابات الطلاب', trend: 3 },
          { title: 'الفصول الدراسية', value: data.kpis.totalClasses, icon: School, color: '#8b5cf6', description: `${data.kpis.totalSubjects} مادة مرتبطة` },
          { title: 'الإيرادات المسددة', value: `${(data.kpis.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: '#10b981', description: 'الفواتير المدفوعة بنجاح', trend: 8 },
        ].map((k, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <KpiCard {...k} />
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Enrollment area */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="bg-card border border-border rounded-3xl p-6 lg:col-span-2">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" /> اتجاه تسجيل الطلاب
          </h3>
          {enrollData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={enrollData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="aE" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                <Area type="monotone" dataKey="طلاب" stroke="#3b82f6" fill="url(#aE)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-muted-foreground text-sm py-16">لا توجد بيانات</p>}
        </motion.div>

        {/* Invoice Donut */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-3xl p-6">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" /> حالة الفواتير
          </h3>
          <div className="relative" style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={invoiceData.length > 0 ? invoiceData : [{ name: 'لا توجد', value: 1, color: '#e5e7eb' }]}
                  cx="50%" cy="50%" innerRadius={55} outerRadius={78} paddingAngle={3} dataKey="value" stroke="none">
                  {(invoiceData.length > 0 ? invoiceData : [{ color: '#e5e7eb' }]).map((e: any, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold text-foreground">{paid + pending + failed}</span>
              <span className="text-xs text-muted-foreground">فواتير</span>
            </div>
          </div>
          <div className="space-y-2 mt-3">
            {[
              { l: 'مدفوعة', v: paid, c: '#22c55e' },
              { l: 'معلقة', v: pending, c: '#f59e0b' },
              { l: 'تتطلب إجراء', v: requiresAction, c: '#f97316' },
              { l: 'فشلت', v: failed, c: '#ef4444' },
              { l: 'مستردة', v: refunded, c: '#6b7280' },
            ].filter(s => s.v > 0).map(s => (
              <div key={s.l} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.c }} />
                  <span className="text-xs text-muted-foreground">{s.l}</span>
                </div>
                <span className="text-xs font-bold text-foreground">{s.v}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Revenue + Activity + Health */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Revenue */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
          className="bg-card border border-border rounded-3xl p-6">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-500" /> الإيرادات الشهرية
          </h3>
          {revData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}
                  formatter={(v: any) => [`${Number(v).toLocaleString()} ر.س`, 'الإيرادات']} />
                <Bar dataKey="إيرادات" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-muted-foreground text-sm py-16">لا توجد بيانات</p>}
        </motion.div>

        {/* Activity */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-3xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-500" /> النشاط الأخير
            </h3>
            <button onClick={load} className="text-muted-foreground hover:text-foreground"><RefreshCw className="w-4 h-4" /></button>
          </div>
          <div className="divide-y divide-border/50 overflow-y-auto max-h-64">
            {(data.recentActivity || []).slice(0, 8).map((item: any) => {
              const actionMap: Record<string,string> = { created:'أُنشئ', updated:'حُدِّث', deleted:'حُذف', logged_in:'دخل' }
              const entityMap: Record<string,string> = { user:'مستخدم', class:'فصل', assignment:'واجب', payment:'دفعة', submission:'تسليم' }
              return (
                <div key={item.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {(item.actor || 'U')[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{item.actor}</p>
                    <p className="text-[10px] text-muted-foreground">{actionMap[item.action] || item.action} {entityMap[item.entityType] || ''}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground flex-shrink-0">
                    {new Date(item.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )
            })}
            {(!data.recentActivity || data.recentActivity.length === 0) && (
              <p className="text-center text-muted-foreground text-xs py-8">لا يوجد نشاط مسجل</p>
            )}
          </div>
        </motion.div>

        {/* System Health */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          className="bg-card border border-border rounded-3xl p-5">
          <h3 className="font-bold text-foreground mb-4 text-sm flex items-center gap-2">
            <Database className="w-4 h-4 text-rose-500" /> صحة النظام
          </h3>
          <div className="space-y-3">
            {(data.systemHealth || []).map((item: any) => {
              const nameMap: Record<string,string> = {
                'Database Connection': 'قاعدة البيانات',
                'API Latency': 'سرعة API',
                'Storage Usage': 'التخزين',
                'Active Websockets': 'WebSockets',
              }
              const isHealthy = item.status === 'healthy'
              return (
                <div key={item.name} className={`p-3 rounded-xl border ${isHealthy ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-900/10' : 'border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-900/10'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                      <span className="text-xs font-bold text-foreground">{nameMap[item.name] || item.name}</span>
                    </div>
                    <span className={`text-xs font-bold ${isHealthy ? 'text-emerald-600' : 'text-amber-600'}`}>{item.value}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 pr-4">{item.detail}</p>
                </div>
              )
            })}
            {(!data.systemHealth || data.systemHealth.length === 0) && (
              <div className="text-center py-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">جميع الأنظمة تعمل بشكل طبيعي</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: '/admin/users', icon: Users, label: 'إدارة المستخدمين', desc: 'إضافة وتعديل الحسابات', color: 'from-rose-500 to-red-600' },
          { href: '/admin/classes', icon: School, label: 'الفصول الدراسية', desc: 'إدارة الفصول والمواد', color: 'from-blue-500 to-indigo-600' },
          { href: '/admin/permissions', icon: Shield, label: 'الصلاحيات', desc: 'إدارة أدوار المستخدمين', color: 'from-violet-500 to-purple-600' },
          { href: '/admin/enrollments', icon: GraduationCap, label: 'التقارير والتسجيلات', desc: 'تقارير شاملة للمنصة', color: 'from-amber-500 to-orange-500' },
        ].map((a, i) => (
          <Link key={i} href={a.href}>
            <motion.div whileHover={{ scale: 1.03, y: -2 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
              className={`relative overflow-hidden rounded-2xl p-5 cursor-pointer shadow-lg bg-gradient-to-br ${a.color} group`}>
              <div className="absolute top-0 left-0 w-20 h-20 bg-white/10 rounded-full -translate-x-6 -translate-y-6 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                  <a.icon className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-white text-sm">{a.label}</h4>
                <p className="text-white/70 text-xs mt-1">{a.desc}</p>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <SocketProvider>
      <AdminDashboardInner />
    </SocketProvider>
  )
}
