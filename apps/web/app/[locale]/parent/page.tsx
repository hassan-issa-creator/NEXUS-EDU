'use client'

import { motion } from 'framer-motion'
import { User, BookOpen, Clock, CreditCard, AlertCircle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

const childrenData = [
    {
        id: 1,
        name: 'أحمد علي',
        grade: 'الصف العاشر',
        avatar: '/avatars/ahmed.png',
        gpa: '3.8',
        attendance: 95,
        nextExam: 'الرياضيات - الأحد القادم',
        recentGrades: [
            { subject: 'الرياضيات', score: 18, total: 20 },
            { subject: 'الفيزياء', score: 45, total: 50 },
        ]
    },
    {
        id: 2,
        name: 'سارة علي',
        grade: 'الصف الثامن',
        avatar: '/avatars/sara.png',
        gpa: '4.0',
        attendance: 98,
        nextExam: 'العلوم - الثلاثاء',
        recentGrades: [
            { subject: 'اللغة العربية', score: 25, total: 25 },
            { subject: 'العلوم', score: 19, total: 20 },
        ]
    }
]

export default function ParentDashboard() {
    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="bg-gradient-to-r from-primary-700 via-indigo-600 to-primary-600 rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl"
            >
                <div className="absolute inset-0 animate-gradient-shift" style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.3), rgba(6,182,212,0.2), rgba(79,70,229,0.3))', backgroundSize: '200% 200%' }}></div>
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-float-slow"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-float-delay"></div>
                <div className="flex justify-between items-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-3xl font-bold mb-3">مرحباً بك، أبو أحمد 👋</h2>
                        <p className="text-primary-100 text-lg">تابع تقدم أبنائك الدراسي وتواصل مع المدرسة بسهولة</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                    >
                        <Link href="/parent/payments">
                            <Button variant="secondary" size="lg" className="gap-2 rounded-2xl font-bold h-12 px-6 shadow-lg hover-lift">
                                <CreditCard className="w-5 h-5" />
                                دفع الرسوم
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </motion.div>

            {/* Image Banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
                className="relative rounded-3xl overflow-hidden h-48 shadow-lg hover-lift"
            >
                <div className="absolute inset-0">
                    <img src="/images/parent-monitoring.jpeg" alt="" className="w-full h-full object-cover blur-sm scale-105 opacity-60" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-l from-purple-900/80 to-transparent" />
                <div className="relative z-10 h-full flex items-center justify-end p-8">
                    <div className="text-right">
                        <p className="text-white/80 text-sm font-medium mb-1">متابعة شاملة</p>
                        <h3 className="text-white text-2xl font-black">NEXUS EDU - اطمئنان أولياء الأمور</h3>
                    </div>
                </div>
            </motion.div>

            <Tabs defaultValue={childrenData[0]?.id.toString()} className="w-full">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">نظرة عامة على الأبناء</h3>
                    <TabsList>
                        {childrenData.map(child => (
                            <TabsTrigger key={child.id} value={child.id.toString()}>
                                {child.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                {childrenData.map(child => (
                    <TabsContent key={child.id} value={child.id.toString()} className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">المعدل التراكمي</CardTitle>
                                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{child.gpa}</div>
                                    <p className="text-xs text-muted-foreground">ممتاز</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">نسبة الحضور</CardTitle>
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{child.attendance}%</div>
                                    <Progress value={child.attendance} className="h-2 mt-2" />
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">الاختبار القادم</CardTitle>
                                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-lg font-bold truncate" title={child.nextExam}>{child.nextExam}</div>
                                    <p className="text-xs text-muted-foreground">استعد جيداً!</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">الواجبات</CardTitle>
                                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">3</div>
                                    <p className="text-xs text-muted-foreground">قيد الانتظار</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-6">
                            {/* Recent Activity */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>أحدث الدرجات</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {child.recentGrades.map((grade, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-full">
                                                    <BookOpen className="w-4 h-4 text-primary-600 dark:text-primary-300" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{grade.subject}</p>
                                                    <p className="text-xs text-muted-foreground">اختبار قصير</p>
                                                </div>
                                            </div>
                                            <div className="text-left">
                                                <span className="font-bold text-lg">{grade.score}</span>
                                                <span className="text-gray-500 text-sm">/{grade.total}</span>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Announcements */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>تنبيهات المدرسة</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-3 border-r-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10 rounded-r-lg">
                                        <h4 className="font-medium text-yellow-800 dark:text-yellow-200">اجتماع أولياء الأمور</h4>
                                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">ندعوكم لحضور الاجتماع يوم الخميس القادم الساعة 10 صباحاً.</p>
                                    </div>
                                    <div className="p-3 border-r-4 border-blue-500 bg-blue-50 dark:bg-blue-900/10 rounded-r-lg">
                                        <h4 className="font-medium text-blue-800 dark:text-blue-200">رحلة مدرسية</h4>
                                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">تم فتح باب التسجيل للرحلة العلمية إلى المتحف الوطني.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}
