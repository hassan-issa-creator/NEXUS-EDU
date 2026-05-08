'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dashboardApi } from '@/lib/api/dashboard';
import { apiClient } from '@/lib/api/client';
import { SocketProvider, useRealtimeNotifications } from '@/lib/providers/socket-provider';
import {
  Users, BookOpen, TrendingUp, AlertCircle, CheckCircle2, Calendar,
  Award, BarChart3, UserCheck, Clock, FileText, Shield, Zap, BrainCircuit,
  Loader2, School, Activity, Bell, Star, RefreshCw
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

function KpiCard({ label, value, icon: Icon, color, trend, trendLabel }: {
  label: string; value: string | number; icon: any; color: string; trend?: number; trendLabel?: string
}) {
  const isUp = (trend ?? 0) >= 0;
  return (
    <motion.div whileHover={{ y: -3 }}
      className="bg-card border border-border rounded-2xl p-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 rounded-t-2xl" style={{ background: color }} />
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-bold flex items-center gap-0.5 ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isUp ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-extrabold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      {trendLabel && <p className="text-[10px] text-muted-foreground/60 mt-0.5">{trendLabel}</p>}
    </motion.div>
  );
}

function AlertRow({ type, text, time }: { type: string; text: string; time: string }) {
  const colors: Record<string, string> = { urgent: '#ef4444', warning: '#f59e0b', success: '#22c55e', info: '#3b82f6' };
  return (
    <div className="flex items-start gap-3 px-5 py-3 hover:bg-muted/40 transition-colors">
      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: colors[type] || '#6b7280' }} />
      <div className="flex-1">
        <p className="text-sm text-foreground font-medium">{text}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{time}</p>
      </div>
      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: `${colors[type]}40` }} />
    </div>
  );
}

// ── Inner page (wrapped by SocketProvider) ─────────────────
function PrincipalDashboardInner() {
  const [adminData, setAdminData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [liveNotif, setLiveNotif] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await dashboardApi.getAdminDashboard();
      setAdminData(d);
    } catch { /* use mock fallback */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useRealtimeNotifications(useCallback((n: any) => {
    setLiveNotif(n.title); setTimeout(() => setLiveNotif(null), 5000);
  }, []));

  const generateAiSummary = async () => {
    setAiLoading(true);
    try {
      const res = await apiClient.post('/ai/ask', {
        question: `أنت مساعد مدرسي ذكي. بناءً على البيانات التالية: ${JSON.stringify({
          students: adminData?.kpis?.totalStudents,
          teachers: adminData?.kpis?.totalTeachers,
          attendance: adminData?.kpis?.attendanceRate,
          revenue: adminData?.kpis?.totalRevenue
        })}، قدم ملخصاً تنفيذياً موجزاً لحالة المدرسة هذا الأسبوع بالعربية (3 جمل فقط).`
      });
      setAiSummary(res.data?.data?.answer || 'تعذر توليد الملخص.');
    } catch { setAiSummary('تأكد من اتصال خدمة الذكاء الاصطناعي.'); }
    finally { setAiLoading(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full" />
    </div>
  );

  const kpis = adminData?.kpis || {};
  const enrollSeries = (adminData?.enrollmentSeries || []).map((e: any) => ({
    name: e.label, طلاب: e.value
  }));
  const revSeries = (adminData?.revenueSeries || []).map((e: any) => ({
    name: e.label, إيرادات: e.value
  }));
  const recentActivity = adminData?.recentActivity || [];
  const systemHealth = adminData?.systemHealth || [];
  const invoice = adminData?.invoiceSummary || { paid: 0, pending: 0, failed: 0 };

  const atRiskStudents = recentActivity
    .filter((a: any) => a.entityType === 'attendance' || a.action?.includes('absent'))
    .slice(0, 4);

  return (
    <div className="space-y-6 pb-10" dir="rtl">
      {/* Live toast */}
      <AnimatePresence>
        {liveNotif && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-purple-600 to-violet-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-sm font-bold">
            <Bell className="w-4 h-4" /> {liveNotif}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-700 via-violet-600 to-indigo-700 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-10 w-56 h-56 bg-indigo-300/20 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-purple-200 text-sm font-medium mb-1">بوابة قائد المدرسة</p>
            <h1 className="text-3xl font-extrabold mb-2">نظام Nexus EDU 🏫</h1>
            <p className="text-white/80 text-sm">لوحة القيادة والمتابعة الشاملة لجميع عمليات المدرسة</p>
            <div className="flex gap-3 mt-4 flex-wrap">
              {[
                { label: `${kpis.totalStudents || 0} طالب`, icon: Users },
                { label: `${kpis.totalTeachers || 0} معلم`, icon: BookOpen },
                { label: `${kpis.totalClasses || 0} فصل`, icon: School },
              ].map((s, i) => (
                <div key={i} className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2">
                  <s.icon className="w-4 h-4 text-white/70" />
                  <span className="text-sm font-bold">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          {/* AI Summary */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 max-w-xs">
            <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-yellow-300" /> ملخص AI للأسبوع
            </h3>
            {aiSummary ? (
              <p className="text-xs text-white/90 leading-relaxed">{aiSummary}</p>
            ) : (
              <button onClick={generateAiSummary} disabled={aiLoading}
                className="w-full bg-white/20 hover:bg-white/30 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                {aiLoading ? 'جاري التحليل...' : 'توليد ملخص ذكي'}
              </button>
            )}
            {aiSummary && (
              <button onClick={() => { setAiSummary(null); }} className="mt-2 text-[10px] text-white/50 hover:text-white/80">
                تحديث الملخص ↺
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي المستخدمين', value: kpis.totalUsers || 0, icon: Users, color: '#8b5cf6', trend: 5 },
          { label: 'الطلاب النشطون', value: kpis.activeUsers || 0, icon: UserCheck, color: '#22c55e', trend: 3 },
          { label: 'الإيرادات المحصلة', value: `${(kpis.totalRevenue || 0).toLocaleString()} ر.س`, icon: Award, color: '#f59e0b' },
          { label: 'المواد الدراسية', value: kpis.totalSubjects || 0, icon: BookOpen, color: '#3b82f6', trend: 0 },
        ].map((k, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <KpiCard {...k} />
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Enrollment trend */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="bg-card border border-border rounded-3xl p-6 lg:col-span-2">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-500" /> اتجاه التسجيل الشهري
          </h3>
          {enrollSeries.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={enrollSeries} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="pE" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                <Area type="monotone" dataKey="طلاب" stroke="#8b5cf6" fill="url(#pE)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-muted-foreground text-sm py-16">لا توجد بيانات تسجيل</p>}
        </motion.div>

        {/* Invoice Donut */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-3xl p-6">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" /> حالة الفواتير
          </h3>
          <div className="relative flex items-center justify-center" style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[
                  { name: 'مدفوعة', value: invoice.paid || 1, color: '#22c55e' },
                  { name: 'معلقة', value: invoice.pending || 0, color: '#f59e0b' },
                  { name: 'فشلت', value: invoice.failed || 0, color: '#ef4444' },
                ]} cx="50%" cy="50%" innerRadius={55} outerRadius={78} paddingAngle={3} dataKey="value" stroke="none">
                  {['#22c55e', '#f59e0b', '#ef4444'].map((c, i) => <Cell key={i} fill={c} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold text-foreground">{invoice.paid + invoice.pending + invoice.failed}</span>
              <span className="text-xs text-muted-foreground">فواتير</span>
            </div>
          </div>
          <div className="space-y-2 mt-3">
            {[
              { l: 'مدفوعة', v: invoice.paid, c: '#22c55e' },
              { l: 'معلقة', v: invoice.pending, c: '#f59e0b' },
              { l: 'فشلت', v: invoice.failed, c: '#ef4444' },
            ].map(s => s.v > 0 && (
              <div key={s.l} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.c }} />
                  <span className="text-muted-foreground">{s.l}</span>
                </div>
                <span className="font-bold text-foreground">{s.v}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Revenue Bar + Activity + System Health */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Revenue */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
          className="bg-card border border-border rounded-3xl p-6">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-500" /> الإيرادات الشهرية
          </h3>
          {revSeries.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revSeries} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                <Bar dataKey="إيرادات" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-muted-foreground text-sm py-16">لا توجد بيانات</p>}
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-3xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-500" /> النشاط الأخير
            </h3>
            <button onClick={load} className="text-muted-foreground hover:text-foreground">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-border/50 max-h-64 overflow-y-auto">
            {recentActivity.slice(0, 8).map((item: any, i: number) => (
              <AlertRow key={i}
                type={item.action?.includes('absent') ? 'warning' : item.action?.includes('delete') ? 'urgent' : 'info'}
                text={`${item.actor || 'مستخدم'}: ${item.action || 'إجراء'}`}
                time={new Date(item.createdAt).toLocaleString('ar-SA', { dateStyle: 'short', timeStyle: 'short' })} />
            ))}
            {recentActivity.length === 0 && (
              <p className="text-center text-muted-foreground text-xs py-8">لا يوجد نشاط مسجل</p>
            )}
          </div>
        </motion.div>

        {/* System Health */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          className="bg-card border border-border rounded-3xl p-5">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-rose-500" /> صحة النظام
          </h3>
          <div className="space-y-3">
            {systemHealth.map((item: any) => {
              const nameMap: Record<string, string> = {
                'Database Connection': 'قاعدة البيانات',
                'API Latency': 'سرعة الاستجابة',
                'Storage Usage': 'مساحة التخزين',
                'Active Websockets': 'اتصالات مباشرة',
              };
              const isHealthy = item.status === 'healthy';
              return (
                <div key={item.name} className="flex items-center justify-between p-3 bg-muted/40 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <span className="text-xs font-bold text-foreground">{nameMap[item.name] || item.name}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isHealthy ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'}`}>
                    {item.value}
                  </span>
                </div>
              );
            })}
            {systemHealth.length === 0 && (
              <div className="text-center py-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">جميع الأنظمة تعمل بشكل طبيعي</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Wrap with SocketProvider since principal layout may not include it
export default function PrincipalDashboard() {
  return (
    <SocketProvider>
      <PrincipalDashboardInner />
    </SocketProvider>
  );
}
