'use client';

import { motion } from 'framer-motion';
import { Users, BookOpen, ClipboardCheck, BarChart3, AlertTriangle, TrendingUp, Eye, FileText, Star, Calendar, ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const visitData = [
    { id: 1, teacher: 'أ. أحمد محمد', subject: 'الرياضيات', class: 'الصف 10 - أ', date: '2026-03-20', rating: 4.5, status: 'مكتملة' },
    { id: 2, teacher: 'أ. سارة خالد', subject: 'اللغة العربية', class: 'الصف 11 - ب', date: '2026-03-19', rating: 4.0, status: 'مكتملة' },
    { id: 3, teacher: 'د. حسن عمر', subject: 'الفيزياء', class: 'الصف 12 - أ', date: '2026-03-22', rating: 0, status: 'مجدولة' },
    { id: 4, teacher: 'أ. نورة سعد', subject: 'الكيمياء', class: 'الصف 10 - ج', date: '2026-03-23', rating: 0, status: 'مجدولة' },
];

const performanceMetrics = [
    { label: 'تحضير الدروس', value: 92 },
    { label: 'التفاعل مع الطلاب', value: 85 },
    { label: 'استخدام التقنية', value: 78 },
    { label: 'إدارة الصف', value: 88 },
    { label: 'التقويم المستمر', value: 81 },
];

export default function SupervisorDashboard() {
    const completedVisits = visitData.filter(v => v.status === 'مكتملة').length;
    const scheduledVisits = visitData.filter(v => v.status === 'مجدولة').length;
    const avgRating = visitData.filter(v => v.rating > 0).reduce((sum, v) => sum + v.rating, 0) / completedVisits;

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
                    <h1 className="text-[28px] font-extrabold text-foreground tracking-tight">بوابة الإشراف التربوي</h1>
                    <p className="text-[14px] text-muted-foreground mt-1">نظام Nexus EDU - متابعة أداء المعلمين والزيارات الإشرافية</p>
                </div>
                <div className="flex gap-3">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-6 hover-lift">
                        + زيارة جديدة
                    </Button>
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-white shadow-md">
                        <span className="text-indigo-600 font-bold text-lg">م</span>
                    </div>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard title="إجمالي المعلمين تحت الإشراف" value="24" icon={Users} color="text-indigo-600" bg="bg-indigo-50" />
                <StatCard title="الزيارات المكتملة" value={completedVisits.toString()} icon={ClipboardCheck} color="text-teal-600" bg="bg-teal-50" />
                <StatCard title="الزيارات المجدولة" value={scheduledVisits.toString()} icon={Calendar} color="text-amber-600" bg="bg-amber-50" />
                <StatCard title="متوسط التقييم" value={avgRating.toFixed(1)} icon={Star} color="text-yellow-600" bg="bg-yellow-50" />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Visits Table */}
                <div className="lg:col-span-2 bg-card rounded-[20px] shadow-sm border border-border overflow-hidden">
                    <div className="p-6 border-b border-border flex justify-between items-center">
                        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                            <Eye className="w-5 h-5 text-indigo-500" />
                            سجل الزيارات الإشرافية
                        </h2>
                        <Button variant="outline" size="sm" className="text-sm font-bold rounded-xl">عرض الكل</Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-muted/50/50 text-muted-foreground text-[13px] font-semibold border-b border-border">
                                    <th className="p-4 pl-6">المعلم</th>
                                    <th className="p-4">المادة</th>
                                    <th className="p-4">الفصل</th>
                                    <th className="p-4">التاريخ</th>
                                    <th className="p-4">التقييم</th>
                                    <th className="p-4 pr-6">الحالة</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visitData.map((visit) => (
                                    <motion.tr
                                        key={visit.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="border-b border-border/50 hover:bg-muted/50/50 transition-colors"
                                    >
                                        <td className="p-4 pl-6 font-bold text-foreground flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600">
                                                {visit.teacher.replace('أ. ', '').replace('د. ', '').charAt(0)}
                                            </div>
                                            {visit.teacher}
                                        </td>
                                        <td className="p-4 text-muted-foreground text-sm">{visit.subject}</td>
                                        <td className="p-4 text-muted-foreground text-sm">{visit.class}</td>
                                        <td className="p-4 text-muted-foreground text-sm font-mono">{visit.date}</td>
                                        <td className="p-4">
                                            {visit.rating > 0 ? (
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                    <span className="font-bold text-foreground">{visit.rating}</span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground/80 text-sm">—</span>
                                            )}
                                        </td>
                                        <td className="p-4 pr-6">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                                                visit.status === 'مكتملة' ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                                {visit.status}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Performance Metrics */}
                <div className="bg-card rounded-[20px] shadow-sm border border-border p-6">
                    <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-indigo-500" />
                        مؤشرات الأداء العامة
                    </h3>
                    <div className="space-y-5">
                        {performanceMetrics.map((metric, i) => (
                            <div key={i}>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-muted-foreground">{metric.label}</span>
                                    <span className="text-sm font-bold text-foreground">{metric.value}%</span>
                                </div>
                                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${metric.value}%` }}
                                        transition={{ duration: 1, delay: i * 0.1 }}
                                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* AI Recommendation */}
                    <div className="mt-6 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                        <h4 className="font-bold text-indigo-800 text-sm mb-2 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            توصية NEXUS AI
                        </h4>
                        <p className="text-xs text-indigo-700 leading-relaxed">
                            لوحظ تراجع في مؤشر &quot;استخدام التقنية&quot; لـ 3 معلمين. ننصح بتنظيم ورشة تدريبية على أدوات التعليم الإلكتروني.
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { icon: FileText, label: 'تقرير إشرافي', desc: 'إنشاء تقرير زيارة جديد', color: 'from-blue-500 to-blue-700' },
                    { icon: ClipboardCheck, label: 'نموذج تقييم', desc: 'تقييم أداء معلم', color: 'from-teal-500 to-teal-700' },
                    { icon: AlertTriangle, label: 'خطة علاجية', desc: 'إنشاء خطة تحسين أداء', color: 'from-amber-500 to-amber-700' },
                    { icon: BookOpen, label: 'تبادل الزيارات', desc: 'جدولة زيارة متبادلة', color: 'from-purple-500 to-purple-700' },
                ].map((action, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 200 }}
                        whileHover={{ scale: 1.05, y: -4 }}
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

function StatCard({ title, value, icon: Icon, color, bg }: { title: string, value: string, icon: any, color: string, bg: string }) {
    return (
        <div className="bg-card p-6 rounded-[20px] shadow-sm border border-border flex justify-between items-start hover:-translate-y-1 transition-transform cursor-pointer">
            <div>
                <p className="text-[13px] font-medium text-muted-foreground mb-1">{title}</p>
                <h3 className={`text-2xl font-extrabold ${color}`}>{value}</h3>
            </div>
            <div className={`p-3 rounded-2xl ${bg}`}><Icon className={`w-6 h-6 ${color}`} /></div>
        </div>
    );
}
