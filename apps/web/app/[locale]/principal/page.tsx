'use client';

import { motion } from 'framer-motion';
import { Users, BookOpen, TrendingUp, AlertCircle, CheckCircle, Calendar, Award, BarChart3, UserCheck, Clock, FileText, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const schoolStats = [
    { title: 'إجمالي الطلاب', value: '1,240', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'إجمالي المعلمين', value: '68', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'نسبة الحضور اليوم', value: '96%', icon: UserCheck, color: 'text-teal-600', bg: 'bg-teal-50' },
    { title: 'المعدل العام', value: '87%', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
];

const alerts = [
    { type: 'urgent', text: '3 معلمين لم يسلموا تحضير الدروس هذا الأسبوع', time: 'منذ ساعة' },
    { type: 'warning', text: 'انخفاض نسبة الحضور في الصف 11-ب إلى 82%', time: 'منذ 3 ساعات' },
    { type: 'info', text: 'تقرير الأداء الشهري جاهز للمراجعة', time: 'أمس' },
    { type: 'success', text: 'تم إكمال تقييم أداء جميع المعلمين للفصل الأول', time: 'أمس' },
];

const topTeachers = [
    { name: 'أ. محمد أحمد', subject: 'الرياضيات', rating: 4.9, students: 180 },
    { name: 'أ. فاطمة علي', subject: 'اللغة العربية', rating: 4.8, students: 150 },
    { name: 'د. سالم خالد', subject: 'الفيزياء', rating: 4.7, students: 120 },
    { name: 'أ. نورة سعد', subject: 'الكيمياء', rating: 4.6, students: 140 },
];

export default function PrincipalDashboard() {
    return (
        <div className="min-h-screen bg-background p-8" dir="rtl">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="flex justify-between items-center mb-8"
            >
                <div>
                    <h1 className="text-[28px] font-extrabold text-foreground tracking-tight">بوابة قائد المدرسة</h1>
                    <p className="text-[14px] text-muted-foreground mt-1">نظام Nexus EDU - لوحة القيادة والمتابعة العامة</p>
                </div>
                <div className="flex gap-3">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl px-6 hover-lift">
                        تقرير يومي
                    </Button>
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center border-2 border-white shadow-md">
                        <span className="text-purple-600 font-bold text-lg">ق</span>
                    </div>
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {schoolStats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.2 + i * 0.05 }}
                        whileHover={{ y: -4 }}
                        className="bg-card p-6 rounded-[20px] shadow-sm border border-border flex justify-between items-start cursor-pointer hover:shadow-lg transition-shadow"
                    >
                        <div>
                            <p className="text-[13px] font-medium text-muted-foreground mb-1">{stat.title}</p>
                            <h3 className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</h3>
                        </div>
                        <div className={`p-3 rounded-2xl ${stat.bg}`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Alerts & Notifications */}
                <div className="lg:col-span-2 bg-card rounded-[20px] shadow-sm border border-border overflow-hidden">
                    <div className="p-6 border-b border-border flex justify-between items-center">
                        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-purple-500" />
                            التنبيهات والإشعارات
                        </h2>
                        <Button variant="outline" size="sm" className="text-sm font-bold rounded-xl">عرض الكل</Button>
                    </div>
                    <div className="divide-y divide-border/50">
                        {alerts.map((alert, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="p-5 flex items-start gap-4 hover:bg-muted/50/50 transition-colors"
                            >
                                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                    alert.type === 'urgent' ? 'bg-rose-500' :
                                    alert.type === 'warning' ? 'bg-amber-500' :
                                    alert.type === 'success' ? 'bg-teal-500' : 'bg-blue-500'
                                }`} />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-foreground">{alert.text}</p>
                                    <p className="text-xs text-muted-foreground/80 mt-1">{alert.time}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Top Teachers */}
                <div className="bg-card rounded-[20px] shadow-sm border border-border p-6">
                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-500" />
                        أفضل المعلمين أداءً
                    </h3>
                    <div className="space-y-4">
                        {topTeachers.map((teacher, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                    {teacher.name.replace('أ. ', '').replace('د. ', '').charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-sm text-foreground">{teacher.name}</p>
                                    <p className="text-xs text-muted-foreground">{teacher.subject} • {teacher.students} طالب</p>
                                </div>
                                <div className="flex items-center gap-1 text-sm font-bold text-yellow-600">
                                    <Award className="w-4 h-4 text-yellow-500" />
                                    {teacher.rating}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { icon: BarChart3, label: 'التقارير الشاملة', desc: 'إحصائيات المدرسة', color: 'from-purple-500 to-purple-700' },
                    { icon: FileText, label: 'تحضير المعلمين', desc: 'متابعة التحضير اليومي', color: 'from-blue-500 to-blue-700' },
                    { icon: Shield, label: 'الانضباط المدرسي', desc: 'سجل المخالفات والحوادث', color: 'from-rose-500 to-rose-700' },
                    { icon: Zap, label: 'أدوات الأتمتة', desc: 'تقارير آلية ذكية', color: 'from-amber-500 to-amber-700' },
                ].map((action, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                        whileHover={{ scale: 1.03, y: -2 }}
                        className={`relative overflow-hidden rounded-2xl p-5 cursor-pointer shadow-lg bg-gradient-to-br ${action.color} group`}
                    >
                        <div className="absolute top-0 left-0 w-20 h-20 bg-card/10 rounded-full -translate-x-6 -translate-y-6 group-hover:scale-150 transition-transform duration-500" />
                        <div className="relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-card/20 flex items-center justify-center mb-3">
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
