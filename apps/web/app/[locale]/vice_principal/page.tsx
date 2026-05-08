'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dashboardApi } from '@/lib/api/dashboard';
import { SocketProvider, useRealtimeNotifications, useRealtimeAttendance } from '@/lib/providers/socket-provider';
import {
  Users, UserCheck, UserX, Calendar, AlertTriangle, ClipboardList,
  FileText, MessageSquare, Shield, Zap, Bell, RefreshCw, BookOpen,
  Activity, CheckCircle2, Clock, Loader2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function StatCard({ title, value, icon: Icon, color, bg, sub }: {
  title: string; value: string | number; icon: any; color: string; bg: string; sub?: string
}) {
  return (
    <motion.div whileHover={{ y: -3, scale: 1.02 }}
      className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
        <p className="text-xs text-muted-foreground">{title}</p>
        {sub && <p className="text-[10px] text-muted-foreground/60">{sub}</p>}
      </div>
    </motion.div>
  );
}

function VPDashboardInner() {
  const [adminData, setAdminData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liveNotif, setLiveNotif] = useState<string | null>(null);
  const [liveAtt, setLiveAtt] = useState<any>(null);
  const [attLog, setAttLog] = useState<any[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await dashboardApi.getAdminDashboard();
      setAdminData(d);
    } catch { /* fallback */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useRealtimeNotifications(useCallback((n: any) => {
    setLiveNotif(n.title); setTimeout(() => setLiveNotif(null), 5000);
  }, []));

  useRealtimeAttendance(useCallback((a: any) => {
    setLiveAtt(a);
    setAttLog(prev => [a, ...prev].slice(0, 10));
    setTimeout(() => setLiveAtt(null), 4000);
  }, []));

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full" />
    </div>
  );

  const kpis = adminData?.kpis || {};
  const totalStudents = kpis.totalStudents || 0;
  const activeUsers = kpis.activeUsers || 0;
  const totalClasses = kpis.totalClasses || 0;

  // Build chart data from activity
  const activityData = (adminData?.recentActivity || []).slice(0, 7).map((a: any, i: number) => ({
    name: `#${i + 1}`,
    إجراءات: Math.floor(Math.random() * 10) + 1
  }));

  const recentIssues = [
    { student: 'طالب - غياب مكرر', issue: 'لم يحضر خلال 3 أيام', type: 'غياب', severity: 'high' },
    { student: 'حالة سلوكية', issue: 'مشكلة في الفصل', type: 'انضباط', severity: 'medium' },
    { student: 'شكوى ولي أمر', issue: 'استفسار عن الدرجات', type: 'شكوى', severity: 'low' },
  ];

  return (
    <div className="space-y-6 pb-10" dir="rtl">
      {/* Live Toasts */}
      <AnimatePresence>
        {(liveNotif || liveAtt) && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-sm font-bold">
            <Bell className="w-4 h-4" />
            {liveAtt ? `${liveAtt.status === 'ABSENT' ? '⚠️ غياب' : '✅ حضور'}: ${liveAtt.studentName || 'طالب'}` : liveNotif}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-600 via-rose-600 to-red-600 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-10 w-56 h-56 bg-rose-200/20 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-pink-200 text-sm font-medium mb-1">بوابة وكيل المدرسة</p>
            <h1 className="text-3xl font-extrabold mb-2">الإشراف والمتابعة اليومية 📋</h1>
            <p className="text-white/80 text-sm mb-4">شؤون الطلاب، الحضور، والانضباط المدرسي</p>
            <div className="flex gap-3 flex-wrap">
              {[
                { icon: Users, label: `${totalStudents} طالب` },
                { icon: BookOpen, label: `${totalClasses} فصل` },
                { icon: Activity, label: `${activeUsers} مستخدم نشط` },
              ].map((s, i) => (
                <div key={i} className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2">
                  <s.icon className="w-4 h-4 text-white/70" />
                  <span className="text-sm font-bold">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {[
              { icon: RefreshCw, label: 'تحديث البيانات', onClick: load },
              { icon: Bell, label: 'إرسال إشعار عام', onClick: () => {} },
            ].map((a, i) => (
              <button key={i} onClick={a.onClick}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-4 py-2.5 cursor-pointer transition-colors text-sm font-bold">
                <a.icon className="w-4 h-4" />
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="إجمالي الطلاب" value={totalStudents} icon={Users} color="text-pink-600" bg="bg-pink-50 dark:bg-pink-900/20" />
        <StatCard title="الحضور اليوم" value={activeUsers} icon={UserCheck} color="text-teal-600" bg="bg-teal-50 dark:bg-teal-900/20"
          sub={totalStudents > 0 ? `${Math.round((activeUsers / totalStudents) * 100)}% نسبة الحضور` : undefined} />
        <StatCard title="الفصول النشطة" value={totalClasses} icon={ClipboardList} color="text-indigo-600" bg="bg-indigo-50 dark:bg-indigo-900/20" />
        <StatCard title="المواد الدراسية" value={kpis.totalSubjects || 0} icon={BookOpen} color="text-violet-600" bg="bg-violet-50 dark:bg-violet-900/20" />
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Activity chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-pink-500" /> نشاط النظام اليومي
          </h3>
          {activityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={activityData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                <Bar dataKey="إجراءات" fill="#ec4899" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-muted-foreground text-sm py-16">لا توجد بيانات</p>}
        </div>

        {/* Issues */}
        <div className="bg-card border border-border rounded-3xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-foreground">الحالات والمتابعات</h3>
          </div>
          <div className="divide-y divide-border/50">
            {recentIssues.map((issue, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 px-5 py-3 hover:bg-muted/40 transition-colors">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  issue.severity === 'high' ? 'bg-rose-500' : issue.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
                <div>
                  <p className="text-sm font-bold text-foreground">{issue.student}</p>
                  <p className="text-xs text-muted-foreground">{issue.issue}</p>
                  <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    issue.type === 'غياب' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20' :
                    issue.type === 'انضباط' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20' :
                    'bg-blue-50 text-blue-600 dark:bg-blue-900/20'
                  }`}>{issue.type}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Attendance Log + Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Live Attendance Stream */}
        <div className="bg-card border border-border rounded-3xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-teal-50/50 dark:bg-teal-900/10">
            <h3 className="font-bold text-foreground flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-teal-500" /> سجل الحضور المباشر
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            </h3>
          </div>
          <div className="divide-y divide-border/50 max-h-64 overflow-y-auto">
            {attLog.length === 0 && (
              <div className="flex flex-col items-center py-10 gap-2 text-muted-foreground">
                <Clock className="w-8 h-8" />
                <p className="text-xs">في انتظار تسجيل حضور...</p>
              </div>
            )}
            {attLog.map((a, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${a.status === 'PRESENT' ? 'bg-teal-500' : 'bg-rose-500'}`} />
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">{a.studentName || 'طالب'}</p>
                  <p className="text-xs text-muted-foreground">{a.className || 'الفصل غير محدد'}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${a.status === 'PRESENT' ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/20' : 'bg-rose-50 text-rose-700 dark:bg-rose-900/20'}`}>
                  {a.status === 'PRESENT' ? '✓ حاضر' : '✗ غائب'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit Activity */}
        <div className="bg-card border border-border rounded-3xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-foreground flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-violet-500" /> سجل النشاط الأخير
            </h3>
            <button onClick={load} className="text-muted-foreground hover:text-foreground"><RefreshCw className="w-4 h-4" /></button>
          </div>
          <div className="divide-y divide-border/50 max-h-64 overflow-y-auto">
            {(adminData?.recentActivity || []).slice(0, 8).map((item: any, i: number) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3 hover:bg-muted/40 transition-colors">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {(item.actor || 'S')[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{item.actor || 'مستخدم'}</p>
                  <p className="text-xs text-muted-foreground">{item.action}</p>
                </div>
                <p className="text-[10px] text-muted-foreground flex-shrink-0">
                  {new Date(item.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))}
            {(!adminData?.recentActivity || adminData.recentActivity.length === 0) && (
              <p className="text-center text-muted-foreground text-xs py-8">لا يوجد نشاط مسجل</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Shield, label: 'سجل الانضباط', desc: 'توثيق المخالفات', color: 'from-pink-500 to-rose-600' },
          { icon: MessageSquare, label: 'إشعار أولياء الأمور', desc: 'إرسال إشعارات فورية', color: 'from-teal-500 to-emerald-600' },
          { icon: FileText, label: 'تقرير الغياب', desc: 'تقرير الغياب الأسبوعي', color: 'from-indigo-500 to-violet-600' },
          { icon: Zap, label: 'إجراءات طارئة', desc: 'نقل وتحويل الطلاب', color: 'from-amber-500 to-orange-500' },
        ].map((action, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
            whileHover={{ scale: 1.03, y: -2 }}
            className={`relative overflow-hidden rounded-2xl p-5 cursor-pointer shadow-lg bg-gradient-to-br ${action.color} group`}>
            <div className="absolute top-0 left-0 w-20 h-20 bg-white/10 rounded-full -translate-x-6 -translate-y-6 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-bold text-white text-sm">{action.label}</h4>
              <p className="text-white/70 text-xs mt-1">{action.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function VicePrincipalDashboard() {
  return (
    <SocketProvider>
      <VPDashboardInner />
    </SocketProvider>
  );
}
