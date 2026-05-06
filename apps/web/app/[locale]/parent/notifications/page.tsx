'use client'

import { Bell, Calendar, Info, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const notifications = [
    {
        id: 1,
        title: 'تذكير بدفع الرسوم الدراسية',
        message: 'يرجى العلم بأن موعد استحقاق القسط الثاني هو 15 ديسمبر 2024.',
        type: 'warning',
        date: '2024-12-01',
        icon: AlertTriangle
    },
    {
        id: 2,
        title: 'اجتماع أولياء الأمور',
        message: 'ندعوكم لحضور اجتماع أولياء الأمور لمناقشة نتائج منتصف الفصل الدراسي.',
        type: 'info',
        date: '2024-11-28',
        icon: Calendar
    },
    {
        id: 3,
        title: 'غياب الطالب أحمد',
        message: 'تم تسجيل غياب للطالب أحمد علي يوم الأحد الموافق 2024-11-25.',
        type: 'alert',
        date: '2024-11-25',
        icon: Bell
    },
    {
        id: 4,
        title: 'إعلان رحلة مدرسية',
        message: 'تعلن المدرسة عن تنظيم رحلة علمية لطلاب الصف العاشر.',
        type: 'success',
        date: '2024-11-20',
        icon: Info
    }
]

export default function ParentNotificationsPage() {
    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'warning': return 'bg-yellow-50 text-yellow-800 border-yellow-200'
            case 'alert': return 'bg-red-50 text-red-800 border-red-200'
            case 'success': return 'bg-green-50 text-green-800 border-green-200'
            default: return 'bg-blue-50 text-blue-800 border-blue-200'
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">الإشعارات والتنبيهات 🔔</h2>
                <p className="text-muted-foreground">كل ما يخص أبنائك وأخبار المدرسة</p>
            </div>

            <div className="grid gap-4">
                {notifications.map((notification) => (
                    <Card key={notification.id} className="overflow-hidden">
                        <div className="flex items-start p-4 gap-4">
                            <div className={`p-3 rounded-full ${getTypeStyles(notification.type)} bg-opacity-20`}>
                                <notification.icon className={`w-6 h-6 ${getTypeStyles(notification.type).split(' ')[1]}`} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-lg">{notification.title}</h3>
                                    <span className="text-sm text-muted-foreground">{notification.date}</span>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 mt-1">
                                    {notification.message}
                                </p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
