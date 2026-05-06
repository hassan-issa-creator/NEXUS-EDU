'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, UserX, Briefcase, Search } from 'lucide-react';

const initialStaff = [
    { id: 1, name: 'أحمد محمد', role: 'مدرس رياضيات', type: 'دوام كامل', attendance: 'حاضر', time: '07:15 AM' },
    { id: 2, name: 'سارة خالد', role: 'مدرسة لغة عربية', type: 'دوام كامل', attendance: 'غائب', time: '-' },
    { id: 3, name: 'يوسف عبدالله', role: 'وكيل شئون طلاب', type: 'إداري', attendance: 'حاضر', time: '07:05 AM' },
    { id: 4, name: 'نورة سعد', role: 'موجه طلابي', type: 'إداري', attendance: 'إجازة مرضية', time: '-' },
    { id: 5, name: 'مريم حسن', role: 'مدرسة علوم', type: 'دوام جزئي', attendance: 'حاضر', time: '08:00 AM' },
];

export default function HRDashboard() {
    const [staff, setStaff] = useState(initialStaff);
    const [searchQuery, setSearchQuery] = useState('');

    const presentCount = staff.filter(s => s.attendance === 'حاضر').length;
    const absentCount = staff.filter(s => s.attendance === 'غائب').length;
    const leaveCount = staff.filter(s => s.attendance === 'إجازة مرضية').length;

    const filteredStaff = staff.filter(s => s.name.includes(searchQuery) || s.role.includes(searchQuery));

    return (
        <div className="min-h-screen bg-background p-8" dir="rtl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-[28px] font-extrabold text-foreground tracking-tight">بوابة الموارد البشرية (HR)</h1>
                    <p className="text-[14px] text-muted-foreground mt-1">نظام Nexus ERP - إدارة شئون الموظفين والحضور والغياب</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard title="إجمالي المعلمين والموظفين" value={staff.length.toString()} icon={Users} color="text-indigo-600" bg="bg-indigo-50" />
                <StatCard title="حضور اليوم" value={presentCount.toString()} icon={UserCheck} color="text-teal-600" bg="bg-teal-50" />
                <StatCard title="غياب اليوم" value={absentCount.toString()} icon={UserX} color="text-rose-600" bg="bg-rose-50" />
                <StatCard title="في إجازة طبية العذر" value={leaveCount.toString()} icon={Briefcase} color="text-amber-600" bg="bg-amber-50" />
            </div>

            <div className="bg-card rounded-[20px] shadow-sm border border-border overflow-hidden">
                <div className="p-6 border-b border-border flex justify-between items-center bg-card">
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2">سجل بصمة الحضور والغياب اليومي</h2>
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
                        <input type="text" placeholder="بحث عن موظف أو قسم..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-64 h-10 pr-10 pl-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-muted/50/50 text-muted-foreground text-[13px] font-semibold border-b border-border">
                                <th className="p-4 pl-6">الاسم الكامل</th>
                                <th className="p-4">المسمى الوظيفي</th>
                                <th className="p-4">نوع العقد والتصنيف</th>
                                <th className="p-4">حالة الحضور اللحظية</th>
                                <th className="p-4 pr-6">وقت التسجيل / الدخول</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStaff.map((s) => (
                                <tr key={s.id} className="border-b border-border/50 hover:bg-muted/50/50 transition-colors">
                                    <td className="p-4 pl-6 font-bold text-foreground flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600">{s.name.charAt(0)}</div>
                                        {s.name}
                                    </td>
                                    <td className="p-4 text-muted-foreground text-sm bg-card">{s.role}</td>
                                    <td className="p-4 text-muted-foreground text-sm">{s.type}</td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${s.attendance === 'حاضر' ? 'bg-teal-100 text-teal-700' : s.attendance === 'غائب' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {s.attendance}
                                        </span>
                                    </td>
                                    <td className="p-4 pr-6 text-muted-foreground font-medium font-mono">{s.time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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
