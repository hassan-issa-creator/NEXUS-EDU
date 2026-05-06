'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { BookOpen, Clock, User } from 'lucide-react';

export default function SubjectsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">المواد الدراسية</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((subject) => (
                    <Link key={subject.id} href={`/student/subjects/${subject.id}`}>
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-lg font-bold">{subject.name}</CardTitle>
                                <BookOpen className="h-5 w-5 text-primary-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4 mt-4">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <User className="h-4 w-4 ml-2" />
                                        {subject.teacher}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Clock className="h-4 w-4 ml-2" />
                                        {subject.schedule}
                                    </div>
                                    <div className="flex items-center justify-between pt-4">
                                        <Badge variant={subject.status === 'active' ? 'default' : 'secondary'}>
                                            {subject.status === 'active' ? 'نشط' : 'مكتمل'}
                                        </Badge>
                                        <span className="text-sm font-medium text-primary-600">
                                            عرض التفاصيل ←
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}

const subjects = [
    { id: 'math', name: 'الرياضيات', teacher: 'أ. فاطمة علي', schedule: 'الأحد، الثلاثاء 09:00', status: 'active' },
    { id: 'physics', name: 'الفيزياء', teacher: 'أ. خالد حسن', schedule: 'الاثنين، الأربعاء 10:00', status: 'active' },
    { id: 'chemistry', name: 'الكيمياء', teacher: 'أ. سارة محمد', schedule: 'الخميس 11:00', status: 'active' },
    { id: 'arabic', name: 'اللغة العربية', teacher: 'أ. محمد أحمد', schedule: 'يومياً 08:00', status: 'active' },
    { id: 'english', name: 'اللغة الإنجليزية', teacher: 'Mr. John Smith', schedule: 'الأحد، الأربعاء 12:00', status: 'active' },
    { id: 'biology', name: 'الأحياء', teacher: 'أ. نورة سعد', schedule: 'الثلاثاء 11:00', status: 'active' },
];
