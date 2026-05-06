'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Gamepad2, Trophy, Users, Clock } from 'lucide-react'

export default function GamesManagementPage() {
    const t = useTranslations('admin')

    const gameStats = [
        { icon: Gamepad2, title: 'إجمالي الألعاب', count: 12, color: 'text-purple-600' },
        { icon: Users, title: 'اللاعبون النشطون', count: 234, color: 'text-blue-600' },
        { icon: Trophy, title: 'المسابقات', count: 8, color: 'text-yellow-600' },
        { icon: Clock, title: 'جلسات اليوم', count: 45, color: 'text-green-600' },
    ]

    const games = [
        { name: 'مليون مليون', type: 'مسابقة', players: 45, status: 'نشط' },
        { name: 'اختبار سريع', type: 'تدريب', players: 23, status: 'نشط' },
        { name: 'تحدي الرياضيات', type: 'مسابقة', players: 0, status: 'متوقف' },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">إدارة الألعاب</h1>
                <p className="text-muted-foreground">إدارة الألعاب التعليمية والمسابقات</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {gameStats.map((stat, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.count}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>الألعاب المتاحة</CardTitle>
                    <CardDescription>قائمة بجميع الألعاب والمسابقات في المنصة</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {games.map((game, index) => (
                            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-4">
                                    <Gamepad2 className="h-8 w-8 text-purple-600" />
                                    <div>
                                        <h3 className="font-semibold">{game.name}</h3>
                                        <p className="text-sm text-muted-foreground">{game.type}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-sm">
                                        <Users className="inline h-4 w-4 ml-1" />
                                        {game.players}
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs ${game.status === 'نشط'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {game.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
