'use client'

import { CreditCard, Download, History, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

const invoices = [
    {
        id: 'INV-001',
        description: 'القسط الدراسي الأول - 2024/2025',
        amount: 5000,
        date: '2024-09-01',
        status: 'paid',
        student: 'أحمد علي'
    },
    {
        id: 'INV-002',
        description: 'رسوم الكتب والزي المدرسي',
        amount: 1500,
        date: '2024-09-05',
        status: 'paid',
        student: 'أحمد علي'
    },
    {
        id: 'INV-003',
        description: 'القسط الدراسي الثاني - 2024/2025',
        amount: 5000,
        date: '2024-12-15',
        status: 'pending',
        student: 'أحمد علي'
    },
    {
        id: 'INV-004',
        description: 'رحلة علمية',
        amount: 200,
        date: '2024-11-20',
        status: 'overdue',
        student: 'سارة علي'
    }
]

export default function ParentPaymentsPage() {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid': return <Badge variant="success">مدفوع</Badge>
            case 'pending': return <Badge variant="warning">مستحق</Badge>
            case 'overdue': return <Badge variant="destructive">متأخر</Badge>
            default: return <Badge variant="secondary">{status}</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">المدفوعات والفواتير 💳</h2>
                    <p className="text-muted-foreground">سجل العمليات المالية والرسوم المستحقة</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي المدفوع</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">6,500 ر.س</div>
                        <p className="text-xs text-muted-foreground">للعام الدراسي الحالي</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">المبالغ المستحقة</CardTitle>
                        <History className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">5,000 ر.س</div>
                        <p className="text-xs text-muted-foreground">تستحق قريباً</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">متأخرات</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">200 ر.س</div>
                        <p className="text-xs text-muted-foreground">يرجى السداد فوراً</p>
                    </CardContent>
                </Card>
            </div>

            {/* Invoices Table */}
            <Card>
                <CardHeader>
                    <CardTitle>سجل الفواتير</CardTitle>
                    <CardDescription>عرض وتحميل الفواتير السابقة والحالية</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-right">رقم الفاتورة</TableHead>
                                <TableHead className="text-right">الوصف</TableHead>
                                <TableHead className="text-right">الطالب</TableHead>
                                <TableHead className="text-right">التاريخ</TableHead>
                                <TableHead className="text-right">المبلغ</TableHead>
                                <TableHead className="text-center">الحالة</TableHead>
                                <TableHead className="text-left">إجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.map((invoice) => (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-medium">{invoice.id}</TableCell>
                                    <TableCell>{invoice.description}</TableCell>
                                    <TableCell>{invoice.student}</TableCell>
                                    <TableCell>{invoice.date}</TableCell>
                                    <TableCell className="font-bold">{invoice.amount.toLocaleString()} ر.س</TableCell>
                                    <TableCell className="text-center">{getStatusBadge(invoice.status)}</TableCell>
                                    <TableCell className="text-left">
                                        <div className="flex gap-2 justify-end">
                                            {invoice.status !== 'paid' && (
                                                <Button size="sm" variant="default">دفع</Button>
                                            )}
                                            <Button size="sm" variant="ghost">
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
