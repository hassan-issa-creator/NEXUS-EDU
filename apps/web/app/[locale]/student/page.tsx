'use client'

import { useEffect, useState } from 'react'
import { Link } from '@/i18n/routing'
import { dashboardApi, StudentDashboardResponse } from '@/lib/api/dashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Calendar, GraduationCap, Trophy, ChevronLeft } from 'lucide-react'
import { SkeletonDashboard } from '@/components/ui/skeleton-card'
import { EmptyState } from '@/components/ui/empty-state'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

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

export default function StudentDashboardPage() {
  const [data, setData] = useState<StudentDashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      try {
        const response = await dashboardApi.getStudentDashboard()
        setData(response)
      } catch (err) {
        console.error(err)
        setError('تعذر تحميل بيانات لوحة التحكم.')
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
      <Card className="border-none bg-gradient-to-br from-[#00D1B2] to-[#059669] text-white shadow-xl overflow-hidden relative">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-0 right-10 w-40 h-40 rounded-full bg-white blur-3xl"></div>
        </div>

        <CardContent className="relative z-10 flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-white/80 font-medium tracking-wide">مرحباً بك مجدداً يا</p>
            <h1 className="mt-1 text-3xl font-bold">{data.student.name} 👋</h1>
            <p className="mt-3 text-white/90 text-sm max-w-md leading-relaxed">
              لديك <span className="font-bold bg-white/20 px-2 py-0.5 rounded-md mx-1">{data.summary.pendingAssignments}</span> واجبات معلقة عبر <span className="font-bold bg-white/20 px-2 py-0.5 rounded-md mx-1">{data.summary.totalSubjects}</span> مواد دراسية. دعنا ننجزها!
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Link href="/student/assignments">
                <Button className="bg-white text-[#059669] hover:bg-white/90 font-semibold shadow-sm">
                  عرض الواجبات
                </Button>
              </Link>
              <Link href="/student/grades">
                <Button variant="outline" className="text-white border-white/30 hover:bg-white/10 hover:text-white">
                  سجل الدرجات
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-5 border border-white/20 flex flex-col items-center justify-center min-w-[100px]">
              <p className="text-white/80 text-sm font-medium">المستوى</p>
              <p className="mt-1 text-3xl font-bold">{data.gamification.level}</p>
            </div>
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-5 border border-white/20 flex flex-col items-center justify-center min-w-[100px]">
              <p className="text-white/80 text-sm font-medium">النقاط (XP)</p>
              <p className="mt-1 text-3xl font-bold">{data.gamification.totalXP}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="المواد الدراسية" value={data.summary.totalSubjects} description="المواد النشطة في فصولك الحالية" />
        <SummaryCard title="نسبة الحضور" value={`${data.summary.attendanceRate}%`} description="بناءً على سجلات حضورك الأخيرة" />
        <SummaryCard title="متوسط الدرجات" value={`${data.summary.averageGrade}%`} description="محسوب من درجاتك المسجلة" />
        <SummaryCard title="الإنجازات المكتسبة" value={data.gamification.achievementsUnlocked} description={`${data.gamification.streakDays} أيام متتالية من النشاط`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        {/* Upcoming Assignments */}
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/50">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg"><BookOpen className="h-5 w-5 text-blue-500" /> الواجبات القادمة</CardTitle>
              <CardDescription className="mt-1">من المواد المسجل بها حالياً</CardDescription>
            </div>
            <Link href="/student/assignments">
              <Button variant="ghost" size="sm" className="text-sm text-muted-foreground hover:text-foreground">
                عرض الكل <ChevronLeft className="h-4 w-4 mr-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {data.upcomingAssignments.length === 0 ? (
              <EmptyState type="assignments" className="py-8" />
            ) : (
              data.upcomingAssignments.map((assignment) => (
                <div key={assignment.id} className="group rounded-2xl border border-border bg-card hover:bg-muted/30 p-4 transition-all duration-200">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100">{assignment.subject.name}</Badge>
                    <Badge variant="outline" className={
                      assignment.status === 'pending' ? 'border-amber-200 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20' : 
                      assignment.status === 'submitted' ? 'border-green-200 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20' : ''
                    }>
                      {assignment.status === 'pending' ? 'قيد الانتظار' : 'تم التسليم'}
                    </Badge>
                  </div>
                  <h3 className="mt-3 font-semibold text-foreground">{assignment.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{assignment.description || 'لا يوجد وصف.'}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      تاريخ التسليم: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('ar-SA') : 'غير محدد'}
                    </span>
                    <Button variant="ghost" size="sm" className="h-7 text-xs px-2 group-hover:bg-primary group-hover:text-primary-foreground">
                      بدء الحل
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Attendance Snapshot */}
        <Card className="shadow-sm border-border">
          <CardHeader className="pb-2 border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-lg"><Calendar className="h-5 w-5 text-emerald-500" /> سجل الحضور</CardTitle>
            <CardDescription className="mt-1">ملخص الحضور والغياب الأخير</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="h-[180px] w-full relative mb-4 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'حاضر', value: data.attendance.present, color: '#10B981' },
                      { name: 'متأخر', value: data.attendance.late, color: '#F59E0B' },
                      { name: 'غائب', value: data.attendance.absent, color: '#EF4444' },
                      { name: 'عذر مقبول', value: data.attendance.excused, color: '#3B82F6' },
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
                      { name: 'حاضر', value: data.attendance.present, color: '#10B981' },
                      { name: 'متأخر', value: data.attendance.late, color: '#F59E0B' },
                      { name: 'غائب', value: data.attendance.absent, color: '#EF4444' },
                      { name: 'عذر مقبول', value: data.attendance.excused, color: '#3B82F6' },
                    ].filter(d => d.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold">{data.attendance.present + data.attendance.late + data.attendance.absent + data.attendance.excused}</span>
                <span className="text-xs text-muted-foreground">أيام مسجلة</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="flex flex-col items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-2.5 border border-emerald-100 dark:border-emerald-800">
                <span className="text-xs font-medium text-muted-foreground mb-1">حاضر</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{data.attendance.present}</span>
              </div>
              <div className="flex flex-col items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/20 p-2.5 border border-amber-100 dark:border-amber-800">
                <span className="text-xs font-medium text-muted-foreground mb-1">متأخر</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{data.attendance.late}</span>
              </div>
              <div className="flex flex-col items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20 p-2.5 border border-red-100 dark:border-red-800">
                <span className="text-xs font-medium text-muted-foreground mb-1">غائب</span>
                <span className="font-bold text-red-600 dark:text-red-400">{data.attendance.absent}</span>
              </div>
              <div className="flex flex-col items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20 p-2.5 border border-blue-100 dark:border-blue-800">
                <span className="text-xs font-medium text-muted-foreground mb-1">عذر مقبول</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{data.attendance.excused}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Subject Performance */}
        <Card className="shadow-sm border-border">
          <CardHeader className="pb-2 border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-lg"><GraduationCap className="h-5 w-5 text-purple-500" /> أداء المواد</CardTitle>
            <CardDescription className="mt-1">التقدم والنتائج حسب كل مادة</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {data.subjectPerformance.map((subject) => (
              <div key={subject.id} className="rounded-2xl border border-border p-4 hover:border-purple-200 dark:hover:border-purple-900/50 transition-colors">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{subject.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">المعلم: {subject.teacher}</p>
                  </div>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 font-bold">
                    {subject.averageGrade}%
                  </Badge>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full rounded-full bg-purple-500 transition-all duration-500" style={{ width: `${Math.min(subject.progress, 100)}%` }} />
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-muted-foreground">
                  <span>التقدم: {subject.progress}%</span>
                  <span>{subject.submittedAssignments} من {subject.totalAssignments} واجبات</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Weekly Activity */}
        <Card className="shadow-sm border-border">
          <CardHeader className="pb-2 border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-lg"><Trophy className="h-5 w-5 text-amber-500" /> النشاط الأسبوعي</CardTitle>
            <CardDescription className="mt-1">ملخص نشاطك في آخر 7 أيام</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 pb-6 px-4">
            <div className="h-[250px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={data.weeklyActivity.map(p => ({
                    name: { 'Mon': 'الاثنين', 'Tue': 'الثلاثاء', 'Wed': 'الأربعاء', 'Thu': 'الخميس', 'Fri': 'الجمعة', 'Sat': 'السبت', 'Sun': 'الأحد' }[p.label] || p.label,
                    submissions: p.submissions
                  }))} 
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                  <RechartsTooltip 
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
                    itemStyle={{ color: '#F59E0B', fontWeight: 'bold' }}
                    formatter={(value: number) => [value, 'تسليمات الواجبات']}
                  />
                  <Bar dataKey="submissions" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
