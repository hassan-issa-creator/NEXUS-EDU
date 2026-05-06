'use client'

import { useEffect, useState } from 'react'
import { dashboardApi, AdminDashboardResponse } from '@/lib/api/dashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, DollarSign, GraduationCap, Users, Plus, FileText, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/routing'
import { SkeletonDashboard } from '@/components/ui/skeleton-card'
import { EmptyState } from '@/components/ui/empty-state'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

function SummaryCard(props: { title: string; value: string | number; description: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{props.title}</CardDescription>
        <CardTitle className="text-3xl font-bold">{props.value}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">{props.description}</CardContent>
    </Card>
  )
}

function EnrollmentChart({ data }: { data: Array<{ label: string; value: number }> }) {
  if (data.length === 0) return <EmptyState type="analytics" title="لا توجد بيانات كافية" className="py-4" />
  
  const formattedData = data.map(item => {
    const monthMap: Record<string, string> = {
      'Jan': 'يناير', 'Feb': 'فبراير', 'Mar': 'مارس', 'Apr': 'أبريل', 'May': 'مايو', 'Jun': 'يونيو',
      'Jul': 'يوليو', 'Aug': 'أغسطس', 'Sep': 'سبتمبر', 'Oct': 'أكتوبر', 'Nov': 'نوفمبر', 'Dec': 'ديسمبر'
    }
    return { name: monthMap[item.label] || item.label, value: item.value }
  })

  return (
    <div className="h-[250px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorEnrollment" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
            itemStyle={{ color: '#3B82F6', fontWeight: 'bold' }}
            formatter={(value: number) => [value, 'عدد الطلاب']}
          />
          <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorEnrollment)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function RevenueChart({ data }: { data: Array<{ label: string; value: number }> }) {
  if (data.length === 0) return <EmptyState type="analytics" title="لا توجد بيانات كافية" className="py-4" />
  
  const formattedData = data.map(item => {
    const monthMap: Record<string, string> = {
      'Jan': 'يناير', 'Feb': 'فبراير', 'Mar': 'مارس', 'Apr': 'أبريل', 'May': 'مايو', 'Jun': 'يونيو',
      'Jul': 'يوليو', 'Aug': 'أغسطس', 'Sep': 'سبتمبر', 'Oct': 'أكتوبر', 'Nov': 'نوفمبر', 'Dec': 'ديسمبر'
    }
    return { name: monthMap[item.label] || item.label, value: item.value }
  })

  return (
    <div className="h-[250px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
          <Tooltip 
            cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
            contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
            itemStyle={{ color: '#10B981', fontWeight: 'bold' }}
            formatter={(value: number) => [`${value.toLocaleString()} ر.س`, 'الإيرادات']}
          />
          <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} barSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      try {
        setData(await dashboardApi.getAdminDashboard())
      } catch (err) {
        console.error(err)
        setError('تعذر تحميل بيانات لوحة تحكم الإدارة.')
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [])

  if (loading) {
    return <SkeletonDashboard />
  }

  if (error || !data) {
    return (
      <EmptyState
        type="error"
        title="حدث خطأ"
        description={error ?? 'لم يتم العثور على بيانات'}
        action={{
          label: 'إعادة المحاولة',
          onClick: () => window.location.reload()
        }}
      />
    )
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Hero Card */}
      <Card className="border-none bg-gradient-to-br from-[#F43F5E] to-[#E11D48] text-white shadow-xl overflow-hidden relative">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-0 right-10 w-40 h-40 rounded-full bg-white blur-3xl"></div>
        </div>

        <CardContent className="relative z-10 flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-white/80 font-medium tracking-wide">مركز التحكم الإداري</p>
            <h1 className="mt-1 text-3xl font-bold">مرحباً، {data.admin.name} 👋</h1>
            <p className="mt-3 text-white/90 text-sm max-w-md leading-relaxed">
              إجمالي النظام: <span className="font-bold bg-white/20 px-2 py-0.5 rounded-md mx-1">{data.kpis.totalStudents}</span> طالب، و <span className="font-bold bg-white/20 px-2 py-0.5 rounded-md mx-1">{data.kpis.totalTeachers}</span> معلم، بالإضافة إلى <span className="font-bold bg-white/20 px-2 py-0.5 rounded-md mx-1">{data.invoiceSummary.paid}</span> فاتورة مسددة.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Link href="/admin/users">
                <Button className="bg-white text-[#E11D48] hover:bg-white/90 font-semibold shadow-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  إضافة مستخدم
                </Button>
              </Link>
              <Link href="/admin/enrollments">
                <Button variant="outline" className="text-white border-white/30 hover:bg-white/10 hover:text-white">
                  تقرير شامل
                </Button>
              </Link>
            </div>
          </div>
          <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-6 border border-white/20 flex flex-col items-center justify-center min-w-[180px]">
            <p className="text-white/80 text-sm font-medium">إجمالي الإيرادات</p>
            <p className="mt-2 text-4xl font-bold tracking-tight">
              {data.kpis.totalRevenue.toLocaleString()} <span className="text-xl font-normal opacity-80">ر.س</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="المستخدمين" value={data.kpis.totalUsers} description={`${data.kpis.activeUsers} حساب نشط حالياً`} />
        <SummaryCard title="الطلاب" value={data.kpis.totalStudents} description="إجمالي حسابات الطلاب في النظام" />
        <SummaryCard title="الفصول الدراسية" value={data.kpis.totalClasses} description={`${data.kpis.totalSubjects} مادة دراسية مرتبطة بالفصول`} />
        <SummaryCard title="الإيرادات المسددة" value={`${data.kpis.totalRevenue.toLocaleString()} ر.س`} description="الفواتير المدفوعة بنجاح فقط" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Enrollment Series */}
        <Card className="shadow-sm border-border">
          <CardHeader className="pb-2 border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-lg"><Users className="h-5 w-5 text-blue-500" /> اتجاه التسجيل</CardTitle>
            <CardDescription className="mt-1">معدل إضافة الطلاب شهرياً</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 pb-6 px-4">
            <EnrollmentChart data={data.enrollmentSeries} />
          </CardContent>
        </Card>

        {/* Revenue Series */}
        <Card className="shadow-sm border-border">
          <CardHeader className="pb-2 border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-lg"><DollarSign className="h-5 w-5 text-emerald-500" /> الإيرادات الشهرية</CardTitle>
            <CardDescription className="mt-1">الإيرادات المحصلة عبر بوابات الدفع</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 pb-6 px-4">
            <RevenueChart data={data.revenueSeries} />
          </CardContent>
        </Card>

        {/* Invoice Summary */}
        <Card className="shadow-sm border-border">
          <CardHeader className="pb-2 border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-lg"><FileText className="h-5 w-5 text-amber-500" /> حالة الفواتير</CardTitle>
            <CardDescription className="mt-1">ملخص حالات السداد المالي</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 pb-6 flex flex-col items-center">
            <div className="h-[180px] w-full relative mb-4 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'مدفوعة', value: data.invoiceSummary.paid, color: '#10B981' },
                      { name: 'قيد الانتظار', value: data.invoiceSummary.pending, color: '#F59E0B' },
                      { name: 'فشلت', value: data.invoiceSummary.failed, color: '#EF4444' },
                    ].filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {[
                      { name: 'مدفوعة', value: data.invoiceSummary.paid, color: '#10B981' },
                      { name: 'قيد الانتظار', value: data.invoiceSummary.pending, color: '#F59E0B' },
                      { name: 'فشلت', value: data.invoiceSummary.failed, color: '#EF4444' },
                    ].filter(d => d.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Total overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold">{data.invoiceSummary.paid + data.invoiceSummary.pending + data.invoiceSummary.failed}</span>
                <span className="text-xs text-muted-foreground">فواتير</span>
              </div>
            </div>
            
            <div className="w-full space-y-2.5">
              {[
                { label: 'مدفوعة', value: data.invoiceSummary.paid, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500' },
                { label: 'قيد الانتظار', value: data.invoiceSummary.pending, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500' },
                { label: 'تتطلب إجراء', value: data.invoiceSummary.requiresAction, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500' },
                { label: 'فشلت', value: data.invoiceSummary.failed, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500' },
                { label: 'مستردة', value: data.invoiceSummary.refunded, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-500' },
              ].map((item) => (
                item.value > 0 && (
                  <div key={item.label} className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/50 p-2.5 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.bg}`}></div>
                      <span className="text-xs font-medium">{item.label}</span>
                    </div>
                    <span className={`font-bold text-sm ${item.color}`}>{item.value}</span>
                  </div>
                )
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Recent Activity */}
        <Card className="shadow-sm border-border">
          <CardHeader className="pb-2 border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-lg"><Activity className="h-5 w-5 text-purple-500" /> النشاط الأخير</CardTitle>
            <CardDescription className="mt-1">سجل إجراءات النظام المباشرة</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {data.recentActivity.length === 0 ? (
              <EmptyState type="default" title="لا يوجد نشاط مسجل" className="py-8" />
            ) : (
              data.recentActivity.map((item) => {
                const actionMap: Record<string, string> = {
                  'created': 'تم الإنشاء', 'updated': 'تم التحديث', 'deleted': 'تم الحذف', 'logged_in': 'تسجيل دخول'
                }
                const entityMap: Record<string, string> = {
                  'user': 'مستخدم', 'class': 'فصل', 'assignment': 'واجب', 'payment': 'دفعة'
                }
                const arAction = actionMap[item.action] || item.action
                const arEntity = entityMap[item.entityType] || item.entityType

                return (
                  <div key={item.id} className="rounded-2xl border border-border p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                          {arEntity}
                        </Badge>
                        <Badge variant="outline" className="border-border">
                          {arAction}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleString('ar-SA')}
                      </span>
                    </div>
                    <p className="mt-3 font-medium text-sm text-foreground">المنفذ: {item.actor}</p>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* System Health */}
        <Card className="shadow-sm border-border">
          <CardHeader className="pb-2 border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-lg"><Database className="h-5 w-5 text-rose-500" /> صحة النظام</CardTitle>
            <CardDescription className="mt-1">مؤشرات الأداء المباشرة للخوادم</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {data.systemHealth.map((item) => {
              const nameMap: Record<string, string> = {
                'Database Connection': 'اتصال قاعدة البيانات',
                'API Latency': 'استجابة الخادم (API)',
                'Storage Usage': 'استهلاك المساحة',
                'Active Websockets': 'اتصالات المزامنة المباشرة'
              }
              const arName = nameMap[item.name] || item.name
              const isHealthy = item.status === 'healthy'

              return (
                <div key={item.name} className="rounded-2xl border border-border p-4 hover:border-border/80 transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-foreground">{arName}</span>
                    <Badge className={
                      isHealthy 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' 
                        : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
                    } variant="outline">
                      {isHealthy ? 'مستقر' : 'تنبيه'}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-end justify-between">
                    <p className="text-xs text-muted-foreground w-2/3 leading-relaxed">{item.detail}</p>
                    <p className="text-lg font-bold text-foreground font-mono">{item.value}</p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
