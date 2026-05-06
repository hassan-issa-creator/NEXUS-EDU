'use client'

import { useState } from 'react'
import { Search, MoreVertical, Mail, FileText, UserCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

const classesData = [
    {
        id: '10-A',
        name: 'الصف 10 - أ',
        subject: 'الرياضيات',
        studentsCount: 25,
        schedule: 'الأحد، الثلاثاء، الخميس',
        students: [
            { id: 1, name: 'أحمد علي', status: 'present', grade: 'A' },
            { id: 2, name: 'سارة محمد', status: 'absent', grade: 'B+' },
            { id: 3, name: 'خالد عمر', status: 'present', grade: 'A-' },
            // ... more students
        ]
    },
    {
        id: '11-B',
        name: 'الصف 11 - ب',
        subject: 'الفيزياء',
        studentsCount: 22,
        schedule: 'الاثنين، الأربعاء',
        students: []
    }
]

export default function TeacherClassesPage() {
    const [searchTerm, setSearchTerm] = useState('')

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">فصولي الدراسية 🏫</h2>
                    <p className="text-muted-foreground">إدارة الطلاب والفصول</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative w-64">
                        <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="بحث عن طالب..."
                            className="pr-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="grid gap-6">
                {classesData.map((cls) => (
                    <Card key={cls.id}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle className="text-xl">{cls.name}</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {cls.subject} • {cls.studentsCount} طالب • {cls.schedule}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                    <UserCheck className="w-4 h-4 ml-2" />
                                    تحضير سريع
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Mail className="w-4 h-4 ml-2" />
                                    مراسلة الفصل
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="mt-4">
                                <h4 className="text-sm font-semibold mb-3">قائمة الطلاب</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {cls.students.map((student) => (
                                        <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarFallback>{student.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-medium">{student.name}</p>
                                                    <Badge variant={student.status === 'present' ? 'outline' : 'destructive'} className="text-[10px] h-5">
                                                        {student.status === 'present' ? 'حاضر' : 'غائب'}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>ملف الطالب</DropdownMenuItem>
                                                    <DropdownMenuItem>سجل الدرجات</DropdownMenuItem>
                                                    <DropdownMenuItem>مراسلة ولي الأمر</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    ))}
                                    <div className="flex items-center justify-center p-3 border border-dashed rounded-lg text-muted-foreground text-sm">
                                        + {cls.studentsCount - cls.students.length} طلاب آخرين
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
