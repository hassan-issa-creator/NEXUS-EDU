'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Users, CheckCircle, Clock, Wallet, Search, Filter, Download } from 'lucide-react';

interface Employee {
    id: number;
    name: string;
    role: string;
    salary: number;
    status: 'paid' | 'pending';
    date: string;
}

const initialEmployees: Employee[] = [
    { id: 1, name: 'أحمد محمد', role: 'مدرس رياضيات', salary: 5000, status: 'paid', date: '2026-03-20' },
    { id: 2, name: 'سارة خالد', role: 'مدرسة لغة عربية', salary: 5200, status: 'pending', date: '-' },
    { id: 3, name: 'يوسف عبدالله', role: 'وكيل شئون طلاب', salary: 7000, status: 'pending', date: '-' },
    { id: 4, name: 'نورة سعد', role: 'موجه طلابي', salary: 6000, status: 'paid', date: '2026-03-21' },
    { id: 5, name: 'خالد عمر', role: 'مشرف تربوي', salary: 6500, status: 'pending', date: '-' },
];

export default function AccountantDashboard() {
    const [employees, setEmployees] = useState(initialEmployees);
    const [searchQuery, setSearchQuery] = useState('');

    const totalPayroll = employees.reduce((sum, emp) => sum + emp.salary, 0);
    const paidAmount = employees.filter(e => e.status === 'paid').reduce((sum, emp) => sum + emp.salary, 0);
    const pendingAmount = totalPayroll - paidAmount;

    const handlePay = (id: number) => {
        setEmployees(currentEmployees =>
            currentEmployees.map(emp =>
                emp.id === id
                    ? {
                        ...emp,
                        status: 'paid',
                        date: new Date().toISOString().split('T')[0] ?? '-',
                    }
                    : emp
            )
        );
    };

    const filteredEmployees = employees.filter(emp => emp.name.includes(searchQuery) || emp.role.includes(searchQuery));

    return (
        <div className="min-h-screen bg-background p-8" dir="rtl">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-[28px] font-extrabold text-foreground tracking-tight">بوابة المحاسبة الذكية</h1>
                    <p className="text-[14px] text-muted-foreground mt-1">نظام Nexus ERP - إدارة مسيرات الرواتب والموارد المالية</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-card border border-slate-200 rounded-xl text-muted-foreground font-medium hover:bg-muted/50 transition-colors shadow-sm">
                        <Download className="w-4 h-4" />
                        تصدير التقرير
                    </button>
                    <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center border-2 border-white shadow-md">
                        <span className="text-rose-600 font-bold text-lg">M</span>
                    </div>
                </div>
            </div>

            {/* Smart Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard title="إجمالي الرواتب المستحقة" value={`${totalPayroll} ر.س`} icon={Wallet} color="text-foreground" bg="bg-card" />
                <StatCard title="المبالغ المصروفة" value={`${paidAmount} ر.س`} icon={CheckCircle} color="text-teal-600" bg="bg-teal-50" />
                <StatCard title="المبالغ المعلقة" value={`${pendingAmount} ر.س`} icon={Clock} color="text-amber-600" bg="bg-amber-50" />
                <StatCard title="إجمالي الموظفين" value={employees.length.toString()} icon={Users} color="text-indigo-600" bg="bg-indigo-50" />
            </div>

            {/* Main Automation Engine: Smart Payroll Table */}
            <div className="bg-card rounded-[20px] shadow-sm border border-border overflow-hidden">
                <div className="p-6 border-b border-border flex justify-between items-center bg-card">
                    <div>
                        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-rose-500" />
                            مسير رواتب الشهر الحالي (موظفين الشهر)
                        </h2>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
                            <input 
                                type="text"
                                placeholder="بحث عن موظف أو تخصص..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-64 h-10 pr-10 pl-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                            />
                        </div>
                        <button className="p-2 border border-slate-200 rounded-xl text-muted-foreground hover:bg-muted/50 transition-colors">
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-muted/50/50 text-muted-foreground text-[13px] font-semibold border-b border-border">
                                <th className="p-4 pl-6">اسم الموظف</th>
                                <th className="p-4">المسمى الوظيفي</th>
                                <th className="p-4">الراتب الأساسي</th>
                                <th className="p-4">تاريخ الصرف</th>
                                <th className="p-4">حالة الصرف</th>
                                <th className="p-4 pr-6 text-left">الإجراء السريع</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.map((emp) => (
                                <motion.tr 
                                    key={emp.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="border-b border-border/50 hover:bg-muted/50/50 transition-colors"
                                >
                                    <td className="p-4 pl-6 font-bold text-foreground dark:text-foreground flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-xs font-bold text-muted-foreground">
                                            {emp.name.charAt(0)}
                                        </div>
                                        {emp.name}
                                    </td>
                                    <td className="p-4 text-muted-foreground text-sm">{emp.role}</td>
                                    <td className="p-4 font-semibold text-foreground">{emp.salary} ر.س</td>
                                    <td className="p-4 text-muted-foreground text-sm">{emp.date}</td>
                                    <td className="p-4">
                                        {emp.status === 'paid' ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-teal-100 text-teal-700">
                                                <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div> تم الصرف
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-700">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> معلق
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 pr-6 text-left">
                                        {emp.status === 'pending' ? (
                                            <button 
                                                onClick={() => handlePay(emp.id)}
                                                className="px-4 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm shadow-rose-500/20"
                                            >
                                                صرف الراتب
                                            </button>
                                        ) : (
                                            <button className="px-4 py-1.5 bg-muted text-muted-foreground/80 text-xs font-bold rounded-lg cursor-not-allowed">
                                                تم بنجاح
                                            </button>
                                        )}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredEmployees.length === 0 && (
                        <div className="p-12 text-center text-muted-foreground">لا يوجد موظفين يطابقون بحثك.</div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color, bg }: { title: string, value: string, icon: any, color: string, bg: string }) {
    return (
        <div className="bg-card p-6 rounded-[20px] shadow-sm border border-border">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-[13px] font-medium text-muted-foreground mb-1">{title}</p>
                    <h3 className={`text-2xl font-extrabold ${color}`}>{value}</h3>
                </div>
                <div className={`p-3 rounded-2xl ${bg}`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                </div>
            </div>
        </div>
    );
}
