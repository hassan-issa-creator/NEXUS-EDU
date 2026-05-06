'use client'

import { useEffect, useState } from 'react'
import { Link } from '@/i18n/routing'
import { dashboardApi, TeacherDashboardResponse } from '@/lib/api/dashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, CheckCircle2, ClipboardList, Users, ChevronLeft, Plus } from 'lucide-react'
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

export default function TeacherDashboardPage() {
  const [data, setData] = useState<TeacherDashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      try {
        setData(await dashboardApi.getTeacherDashboard())
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
      <Card className="border-none bg-gradient-to-br from-[#3B82F6] to-[#2563EB] text-white shadow-xl overflow-hidden relative">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-0 right-10 w-40 h-40 rounded-full bg-white blur-3xl"></div>
        </div>

        <CardContent className="relative z-10 flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-white/80 font-medium tracking-wide">مرحباً بك مجدداً يا أستاذ</p>
            <h1 className="mt-1 text-3xl font-bold">{data.teacher.name} 👋</h1>
            <p className="mt-3 text-white/90 text-sm max-w-md leading-relaxed">
              لديك <span className="font-bold bg-white/20 px-2 py-0.5 rounded-md mx-1">{data.summary.pendingSubmissions}</span> تسليمات تنتظر التصحيح. يوم عمل موفق!
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Link href="/teacher/assignments/create">
                <Button className="bg-white text-[#2563EB] hover:bg-white/90 font-semibold shadow-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  إنشاء واجب جديد
                </Button>
              </Link>
              <Link href="/teacher/attendance">
                <Button variant="outline" className="text-white border-white/30 hover:bg-white/10 hover:text-white">
                  تحضير الطلاب
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="الفصول" value={data.summary.totalClasses} description="الفصول المسندة إليك هذا الفصل الدراسي" />
        <SummaryCard title="الطلاب" value={data.summary.totalStudents} description="إجمالي الطلاب المسجلين في فصولك" />
        <SummaryCard title="الواجبات" value={data.summary.totalAssignments} description="الواجبات التي قمت بإنشائها" />
        <SummaryCard title="نسبة الحضور العام" value={`${data.summary.attendanceRate}%`} description="معدل حضور الطلاب في آخر 30 يوماً" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Class Performance */}
        <Card className="shadow-sm border-border">
          <CardHeader className="pb-2 border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-lg"><Users className="h-5 w-5 text-blue-500" /> أداء الفصول</CardTitle>
            <CardDescription className="mt-1">نظرة عامة على مستوى الطلاب حسب الفصل</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {data.classPerformance.length === 0 ? (
              <EmptyState type="default" className="py-8" />
            ) : (
              <div className="space-y-6">
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.classPerformance} margin={{ top: 10, right: 10, left: -25, bottom: 0 }} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} width={80} />
                      <RechartsTooltip 
                        cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                        contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
                        itemStyle={{ color: '#3B82F6', fontWeight: 'bold' }}
                        formatter={(value: number) => [`${value}%`, 'متوسط الدرجات']}
                      />
                      <Bar dataKey="averageGrade" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {data.classPerformance.map((classItem) => (
                    <div key={classItem.id} className="rounded-2xl border border-border bg-card p-3 hover:border-blue-200 dark:hover:border-blue-900/50 transition-colors">
                      <h3 className="font-semibold text-sm text-foreground truncate">{classItem.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {classItem.studentCount} طالب • {classItem.subjectCount} مادة
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Grading Queue */}
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/50">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg"><ClipboardList className="h-5 w-5 text-amber-500" /> قائمة التصحيح</CardTitle>
              <CardDescription className="mt-1">تسليمات الواجبات التي تحتاج لتقييم</CardDescription>
            </div>
            <Link href="/teacher/grading">
              <Button variant="ghost" size="sm" className="text-sm text-muted-foreground hover:text-foreground">
                عرض الكل <ChevronLeft className="h-4 w-4 mr-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {data.gradingQueue.length === 0 ? (
              <EmptyState type="assignments" title="لا توجد تسليمات للتصحيح" description="لقد قمت بتصحيح جميع الواجبات المسلمة. عمل رائع!" className="py-8" />
            ) : (
              data.gradingQueue.map((item) => (
                <div key={item.id} className="group rounded-2xl border border-border bg-card hover:bg-muted/30 p-4 transition-all duration-200">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{item.assignment.title}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        الطالب: <span className="text-foreground font-medium">{item.student.name || item.student.email}</span>
                      </p>
                    </div>
                    <Badge variant="outline" className="border-amber-200 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20">
                      بانتظار التقييم
                    </Badge>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>تم التسليم: {new Date(item.submittedAt).toLocaleString('ar-SA')}</span>
                    <Button variant="ghost" size="sm" className="h-7 text-xs px-2 group-hover:bg-primary group-hover:text-primary-foreground">
                      قيّم الآن
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Recent Assignments */}
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/50">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg"><BookOpen className="h-5 w-5 text-purple-500" /> أحدث الواجبات</CardTitle>
              <CardDescription className="mt-1">آخر الواجبات التي قمت بإنشائها أو إدارتها</CardDescription>
            </div>
            <Link href="/teacher/assignments">
              <Button variant="ghost" size="sm" className="text-sm text-muted-foreground hover:text-foreground">
                إدارة الواجبات <ChevronLeft className="h-4 w-4 mr-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {data.recentAssignments.length === 0 ? (
              <EmptyState type="default" className="py-8" />
            ) : (
              data.recentAssignments.map((assignment) => (
                <div key={assignment.id} className="rounded-2xl border border-border p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{assignment.title}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">{assignment.subject}</p>
                    </div>
                    <Badge variant="secondary" className="font-medium">{assignment.submissions} تسليمات</Badge>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    تاريخ التسليم: <span className="font-medium text-foreground">{assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('ar-SA') : 'غير محدد'}</span>
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Attendance Summary */}
        <Card className="shadow-sm border-border">
          <CardHeader className="pb-2 border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-lg"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> ملخص الحضور العام</CardTitle>
            <CardDescription className="mt-1">إحصاءات الحضور لجميع فصولك (آخر 30 يوماً)</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="h-[180px] w-full relative mb-4 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'حاضر', value: data.attendanceSummary.present, color: '#10B981' },
                      { name: 'متأخر', value: data.attendanceSummary.late, color: '#F59E0B' },
                      { name: 'غائب', value: data.attendanceSummary.absent, color: '#EF4444' },
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
                      { name: 'حاضر', value: data.attendanceSummary.present, color: '#10B981' },
                      { name: 'متأخر', value: data.attendanceSummary.late, color: '#F59E0B' },
                      { name: 'غائب', value: data.attendanceSummary.absent, color: '#EF4444' },
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
                <span className="text-2xl font-bold">{data.attendanceSummary.totalRecords}</span>
                <span className="text-xs text-muted-foreground">إجمالي</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-2 border border-emerald-100 dark:border-emerald-800">
                <span className="text-xs font-medium text-muted-foreground mb-1">حاضر</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{data.attendanceSummary.present}</span>
              </div>
              <div className="flex flex-col items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/20 p-2 border border-amber-100 dark:border-amber-800">
                <span className="text-xs font-medium text-muted-foreground mb-1">متأخر</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{data.attendanceSummary.late}</span>
              </div>
              <div className="flex flex-col items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20 p-2 border border-red-100 dark:border-red-800">
                <span className="text-xs font-medium text-muted-foreground mb-1">غائب</span>
                <span className="font-bold text-red-600 dark:text-red-400">{data.attendanceSummary.absent}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
