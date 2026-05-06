'use client';

import { motion } from 'framer-motion';
import { Heart, Users, AlertCircle, FileText, MessageSquare, Brain, Shield, Calendar, TrendingDown, BookOpen, Zap, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/button';

const studentCases = [
    { id: 1, student: 'فهد خالد', grade: 'الصف 11 - أ', type: 'سلوكي', status: 'قيد المتابعة', urgency: 'high', desc: 'ميل للعزلة وانخفاض في التحصيل' },
    { id: 2, student: 'ريم أحمد', grade: 'الصف 10 - ب', type: 'أكاديمي', status: 'جديدة', urgency: 'medium', desc: 'صعوبة في التركيز أثناء الحصص' },
    { id: 3, student: 'سالم محمد', grade: 'الصف 12 - أ', type: 'نفسي', status: 'قيد المتابعة', urgency: 'high', desc: 'قلق من اختبارات القدرات' },
    { id: 4, student: 'نورة سعيد', grade: 'الصف 10 - أ', type: 'اجتماعي', status: 'مغلقة', urgency: 'low', desc: 'خلاف بين طالبتين — تم حله' },
];

const weeklyStats = [
    { label: 'حالات جديدة', value: 5, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'جلسات إرشادية', value: 12, icon: MessageSquare, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'حالات مغلقة', value: 3, icon: Heart, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'إحالات خارجية', value: 1, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
];

const wellbeingMetrics = [
    { label: 'الرضا العام للطلاب', value: 82 },
    { label: 'الشعور بالأمان المدرسي', value: 91 },
    { label: 'التواصل مع الأقران', value: 76 },
    { label: 'الدعم الأسري الملموس', value: 68 },
];

export default function CounselorDashboard() {
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
                    <h1 className="text-[28px] font-extrabold text-foreground tracking-tight">بوابة التوجيه والإرشاد الطلابي</h1>
                    <p className="text-[14px] text-muted-foreground mt-1">نظام Nexus EDU - متابعة الحالات النفسية والسلوكية والأكاديمية</p>
                </div>
                <div className="flex gap-3">
                    <Button className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl px-6 hover-lift">
                        + حالة جديدة
                    </Button>
                    <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center border-2 border-white shadow-md">
                        <span className="text-teal-600 font-bold text-lg">م</span>
                    </div>
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {weeklyStats.map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-card p-6 rounded-[20px] shadow-sm border border-border flex justify-between items-start hover:-translate-y-1 transition-transform cursor-pointer">
                        <div>
                            <p className="text-[13px] font-medium text-muted-foreground mb-1">{stat.label}</p>
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
                {/* Cases Table */}
                <div className="lg:col-span-2 bg-card rounded-[20px] shadow-sm border border-border overflow-hidden">
                    <div className="p-6 border-b border-border flex justify-between items-center">
                        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                            <HeartHandshake className="w-5 h-5 text-teal-500" />
                            سجل الحالات الطلابية
                        </h2>
                        <Button variant="outline" size="sm" className="text-sm font-bold rounded-xl">عرض الكل</Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-muted/50/50 text-muted-foreground text-[13px] font-semibold border-b border-border">
                                    <th className="p-4 pl-6">الطالب</th>
                                    <th className="p-4">الفصل</th>
                                    <th className="p-4">نوع الحالة</th>
                                    <th className="p-4">الوصف</th>
                                    <th className="p-4 pr-6">الحالة</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentCases.map((c) => (
                                    <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="border-b border-border/50 hover:bg-muted/50/50 transition-colors">
                                        <td className="p-4 pl-6 font-bold text-foreground flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                                c.urgency === 'high' ? 'bg-rose-500' : c.urgency === 'medium' ? 'bg-amber-500' : 'bg-teal-500'
                                            }`} />
                                            {c.student}
                                        </td>
                                        <td className="p-4 text-muted-foreground text-sm">{c.grade}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                c.type === 'سلوكي' ? 'bg-rose-100 text-rose-600' :
                                                c.type === 'أكاديمي' ? 'bg-blue-100 text-blue-600' :
                                                c.type === 'نفسي' ? 'bg-purple-100 text-purple-600' : 'bg-teal-100 text-teal-600'
                                            }`}>{c.type}</span>
                                        </td>
                                        <td className="p-4 text-muted-foreground text-sm max-w-[200px] truncate">{c.desc}</td>
                                        <td className="p-4 pr-6">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                                                c.status === 'جديدة' ? 'bg-blue-100 text-blue-700' :
                                                c.status === 'قيد المتابعة' ? 'bg-amber-100 text-amber-700' : 'bg-teal-100 text-teal-700'
                                            }`}>{c.status}</span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Wellbeing Metrics */}
                <div className="bg-card rounded-[20px] shadow-sm border border-border p-6">
                    <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-500" />
                        مؤشرات الصحة النفسية
                    </h3>
                    <div className="space-y-5">
                        {wellbeingMetrics.map((metric, i) => (
                            <div key={i}>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-muted-foreground">{metric.label}</span>
                                    <span className={`text-sm font-bold ${metric.value >= 80 ? 'text-teal-600' : metric.value >= 70 ? 'text-amber-600' : 'text-rose-600'}`}>{metric.value}%</span>
                                </div>
                                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${metric.value}%` }}
                                        transition={{ duration: 1, delay: i * 0.1 }}
                                        className={`h-full rounded-full ${metric.value >= 80 ? 'bg-teal-500' : metric.value >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 p-4 bg-teal-50 rounded-2xl border border-teal-100">
                        <h4 className="font-bold text-teal-800 text-sm mb-2 flex items-center gap-2">
                            <TrendingDown className="w-4 h-4" />
                            تنبيه NEXUS AI
                        </h4>
                        <p className="text-xs text-teal-700 leading-relaxed">
                            مؤشر &quot;الدعم الأسري&quot; في تراجع مستمر للأسبوع الثالث. ننصح بتنظيم لقاء مع أولياء الأمور قريباً.
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { icon: MessageSquare, label: 'جلسة إرشادية', desc: 'تسجيل جلسة مع طالب', color: 'from-teal-500 to-teal-700' },
                    { icon: Shield, label: 'تقرير سلوكي', desc: 'توثيق ملاحظة سلوكية', color: 'from-rose-500 to-rose-700' },
                    { icon: BookOpen, label: 'خطة تحسين', desc: 'وضع خطة تحسين أكاديمي', color: 'from-blue-500 to-blue-700' },
                    { icon: Zap, label: 'إحالة خارجية', desc: 'إحالة للجهات المختصة', color: 'from-purple-500 to-purple-700' },
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
