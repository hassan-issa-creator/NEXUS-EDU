'use client';

import { motion } from 'framer-motion';
import { Users, UserCheck, UserX, Calendar, Clock, AlertTriangle, ClipboardList, FileText, MessageSquare, Shield, BookOpen, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const dailyAttendance = [
    { grade: 'الصف 10 - أ', total: 32, present: 30, absent: 2 },
    { grade: 'الصف 10 - ب', total: 30, present: 28, absent: 2 },
    { grade: 'الصف 11 - أ', total: 28, present: 26, absent: 2 },
    { grade: 'الصف 11 - ب', total: 31, present: 25, absent: 6 },
    { grade: 'الصف 12 - أ', total: 25, present: 24, absent: 1 },
    { grade: 'الصف 12 - ب', total: 27, present: 26, absent: 1 },
];

const recentIssues = [
    { student: 'فهد خالد', issue: 'تكرار غياب بدون عذر (3 أيام)', type: 'غياب', severity: 'high' },
    { student: 'سالم أحمد', issue: 'مشكلة سلوكية في الفصل', type: 'انضباط', severity: 'medium' },
    { student: 'نورة علي', issue: 'تأخر متكرر عن الحصة الأولى', type: 'تأخر', severity: 'low' },
    { student: 'عمر حسن', issue: 'شكوى من ولي الأمر بخصوص درجات', type: 'شكوى', severity: 'medium' },
];

const totalStudents = dailyAttendance.reduce((sum, g) => sum + g.total, 0);
const totalPresent = dailyAttendance.reduce((sum, g) => sum + g.present, 0);
const totalAbsent = dailyAttendance.reduce((sum, g) => sum + g.absent, 0);

export default function VicePrincipalDashboard() {
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
                    <h1 className="text-[28px] font-extrabold text-foreground tracking-tight">بوابة وكيل المدرسة</h1>
                    <p className="text-[14px] text-muted-foreground mt-1">نظام Nexus EDU - شئون الطلاب والمتابعة اليومية</p>
                </div>
                <div className="flex gap-3">
                    <Button className="bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl px-6 hover-lift">
                        تقرير يومي
                    </Button>
                    <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center border-2 border-white shadow-md">
                        <span className="text-pink-600 font-bold text-lg">و</span>
                    </div>
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard title="إجمالي الطلاب" value={totalStudents.toString()} icon={Users} color="text-pink-600" bg="bg-pink-50" />
                <StatCard title="حاضرون اليوم" value={totalPresent.toString()} icon={UserCheck} color="text-teal-600" bg="bg-teal-50" />
                <StatCard title="غائبون اليوم" value={totalAbsent.toString()} icon={UserX} color="text-rose-600" bg="bg-rose-50" />
                <StatCard title="نسبة الحضور" value={`${Math.round(totalPresent / totalStudents * 100)}%`} icon={Calendar} color="text-indigo-600" bg="bg-indigo-50" />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Daily Attendance by Grade */}
                <div className="lg:col-span-2 bg-card rounded-[20px] shadow-sm border border-border overflow-hidden">
                    <div className="p-6 border-b border-border flex justify-between items-center">
                        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                            <ClipboardList className="w-5 h-5 text-pink-500" />
                            سجل الحضور اليومي حسب الفصل
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-muted/50/50 text-muted-foreground text-[13px] font-semibold border-b border-border">
                                    <th className="p-4 pl-6">الفصل</th>
                                    <th className="p-4">إجمالي الطلاب</th>
                                    <th className="p-4">حاضرون</th>
                                    <th className="p-4">غائبون</th>
                                    <th className="p-4 pr-6">نسبة الحضور</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dailyAttendance.map((row, i) => {
                                    const pct = Math.round(row.present / row.total * 100);
                                    return (
                                        <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                                            className="border-b border-border/50 hover:bg-muted/50/50 transition-colors">
                                            <td className="p-4 pl-6 font-bold text-foreground">{row.grade}</td>
                                            <td className="p-4 text-muted-foreground">{row.total}</td>
                                            <td className="p-4 text-teal-600 font-semibold">{row.present}</td>
                                            <td className="p-4 text-rose-600 font-semibold">{row.absent}</td>
                                            <td className="p-4 pr-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full ${pct >= 90 ? 'bg-teal-500' : pct >= 80 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                                             style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <span className={`text-sm font-bold ${pct >= 90 ? 'text-teal-600' : pct >= 80 ? 'text-amber-600' : 'text-rose-600'}`}>{pct}%</span>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Issues */}
                <div className="bg-card rounded-[20px] shadow-sm border border-border p-6">
                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        الحالات والمتابعات
                    </h3>
                    <div className="space-y-3">
                        {recentIssues.map((issue, i) => (
                            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                                className="p-3 bg-muted/50 rounded-xl border border-border flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                    issue.severity === 'high' ? 'bg-rose-500' : issue.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                                }`} />
                                <div className="flex-1">
                                    <p className="font-bold text-sm text-foreground">{issue.student}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{issue.issue}</p>
                                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                        issue.type === 'غياب' ? 'bg-rose-100 text-rose-600' :
                                        issue.type === 'انضباط' ? 'bg-amber-100 text-amber-600' :
                                        issue.type === 'تأخر' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                                    }`}>{issue.type}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { icon: Shield, label: 'سجل الانضباط', desc: 'توثيق المخالفات والعقوبات', color: 'from-pink-500 to-pink-700' },
                    { icon: MessageSquare, label: 'إشعار ولي الأمر', desc: 'إرسال إشعارات فورية', color: 'from-teal-500 to-teal-700' },
                    { icon: FileText, label: 'تقرير الغياب', desc: 'تقرير الغياب الأسبوعي', color: 'from-indigo-500 to-indigo-700' },
                    { icon: Zap, label: 'نقل / تحويل', desc: 'إجراءات النقل والقبول', color: 'from-amber-500 to-amber-700' },
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

function StatCard({ title, value, icon: Icon, color, bg }: { title: string, value: string, icon: any, color: string, bg: string }) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card p-6 rounded-[20px] shadow-sm border border-border flex justify-between items-start hover:-translate-y-1 transition-transform cursor-pointer">
            <div>
                <p className="text-[13px] font-medium text-muted-foreground mb-1">{title}</p>
                <h3 className={`text-2xl font-extrabold ${color}`}>{value}</h3>
            </div>
            <div className={`p-3 rounded-2xl ${bg}`}><Icon className={`w-6 h-6 ${color}`} /></div>
        </motion.div>
    );
}
