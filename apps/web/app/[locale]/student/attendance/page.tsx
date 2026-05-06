'use client'

import { useState, useEffect } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/lib/api/client'
import { CheckCircle, XCircle, Clock, Calendar as CalendarIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface AttendanceData {
    summary: {
        present: number
        absent: number
        late: number
        totalDays: number
        attendanceRate: number
    }
    weeklyOverview: {
        day: string
        status: 'Present' | 'Absent' | 'Late'
        date: string
    }[]
    history: {
        date: string
        status: 'Present' | 'Absent' | 'Late'
        dateLabel: string
        subject: string
    }[]
}

export default function AttendancePage() {
    const [data, setData] = useState<AttendanceData | null>(null)
    const [loading, setLoading] = useState(true)
    const [date, setDate] = useState<Date | undefined>(new Date())
    const t = useTranslations('student.attendance')

    useEffect(() => {
        fetchAttendance()
    }, [])

    const fetchAttendance = async () => {
        try {
            const response = await apiClient.get('/attendance')
            if (response.data && response.data.summary) {
                setData(response.data)
            } else {
                throw new Error('Empty data')
            }
        } catch (error) {
            console.error('Failed to fetch attendance:', error)
            // Mock data fallback
            setData({
                summary: {
                    present: 45,
                    absent: 2,
                    late: 3,
                    totalDays: 50,
                    attendanceRate: 90
                },
                weeklyOverview: [
                    { day: 'الأحد', status: 'Present', date: '2024-11-24' },
                    { day: 'الاثنين', status: 'Present', date: '2024-11-25' },
                    { day: 'الثلاثاء', status: 'Late', date: '2024-11-26' },
                    { day: 'الأربعاء', status: 'Present', date: '2024-11-27' },
                    { day: 'الخميس', status: 'Absent', date: '2024-11-28' }
                ],
                history: [
                    { date: '2024-11-28', status: 'Absent', dateLabel: '28 نوفمبر 2024', subject: 'الفيزياء' },
                    { date: '2024-11-27', status: 'Present', dateLabel: '27 نوفمبر 2024', subject: 'الرياضيات' },
                    { date: '2024-11-26', status: 'Late', dateLabel: '26 نوفمبر 2024', subject: 'الكيمياء' },
                    { date: '2024-11-25', status: 'Present', dateLabel: '25 نوفمبر 2024', subject: 'اللغة العربية' },
                    { date: '2024-11-24', status: 'Present', dateLabel: '24 نوفمبر 2024', subject: 'اللغة الإنجليزية' }
                ]
            })
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="p-8 text-center">{t('summary.rate')}...</div>
    }

    if (!data) return <div className="p-8 text-center">No data available</div>

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
                <p className="text-gray-600 dark:text-gray-400">{t('subtitle')}</p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="md:col-span-1">
                    <CardContent className="pt-6 text-center">
                        <div className="relative w-32 h-32 mx-auto mb-4">
                            {/* Circular Progress Placeholder */}
                            <div className="w-full h-full rounded-full border-8 border-gray-100 flex items-center justify-center">
                                <span className="text-3xl font-bold text-primary">{data.summary.attendanceRate}%</span>
                            </div>
                            <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90" style={{ pointerEvents: 'none' }}>
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    strokeDasharray="351"
                                    strokeDashoffset={351 - (351 * data.summary.attendanceRate) / 100}
                                    className="text-primary"
                                />
                            </svg>
                        </div>
                        <p className="font-medium text-gray-900 dark:text-white">{t('summary.rate')}</p>
                    </CardContent>
                </Card>

                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle>{t('weeklyOverview')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-end h-32 gap-2">
                            {data.weeklyOverview.map((day, idx) => (
                                <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                                    <div
                                        className={`w-full rounded-t-lg transition-all hover:opacity-80 ${day.status === 'Present' ? 'bg-green-500 h-24' :
                                            day.status === 'Absent' ? 'bg-red-500 h-8' : 'bg-yellow-500 h-16'
                                            }`}
                                    />
                                    <span className="text-xs font-medium text-gray-500">{day.day}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-center flex-wrap gap-4 mt-6">
                            <div className="flex items-center text-sm">
                                <div className="w-3 h-3 bg-green-500 rounded-full ml-2" />
                                {t('summary.present')} ({data.summary.present})
                            </div>
                            <div className="flex items-center text-sm">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full ml-2" />
                                {t('summary.late')} ({data.summary.late})
                            </div>
                            <div className="flex items-center text-sm">
                                <div className="w-3 h-3 bg-red-500 rounded-full ml-2" />
                                {t('summary.absent')} ({data.summary.absent})
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Calendar View */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>{t('calendar')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border"
                        />
                    </CardContent>
                </Card>

                {/* Recent History */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>{t('history')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data.history.map((record, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-full ${record.status === 'Present' ? 'bg-green-100 text-green-600' :
                                            record.status === 'Absent' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                                            }`}>
                                            {record.status === 'Present' ? <CheckCircle className="w-5 h-5" /> :
                                                record.status === 'Absent' ? <XCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{record.subject}</p>
                                            <p className="text-sm text-gray-500">{record.dateLabel || new Date(record.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <Badge variant={
                                        record.status === 'Present' ? 'default' :
                                            record.status === 'Absent' ? 'destructive' : 'secondary'
                                    }>
                                        {record.status === 'Present' ? t('status.present') :
                                            record.status === 'Absent' ? t('status.absent') : t('status.late')}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
