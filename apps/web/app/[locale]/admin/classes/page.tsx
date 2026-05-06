'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Search, Plus, Pencil, Trash2, Users, BookOpen } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Mock Data
const initialClasses = [
    { id: '1', name: 'الصف الأول ابتدائي - أ', academicYear: '2024-2025', description: 'شعبة المتفوقين', studentsCount: 25, subjectsCount: 8 },
    { id: '2', name: 'الصف الأول ابتدائي - ب', academicYear: '2024-2025', description: 'الشعبة العامة', studentsCount: 28, subjectsCount: 8 },
    { id: '3', name: 'الصف الثاني ابتدائي - أ', academicYear: '2024-2025', description: 'مسار العلوم والرياضيات', studentsCount: 22, subjectsCount: 9 },
    { id: '4', name: 'الصف الثاني ابتدائي - ب', academicYear: '2024-2025', description: 'مسار الفنون واللغات', studentsCount: 20, subjectsCount: 7 },
];

export default function ClassesPage() {
    const { toast } = useToast();
    const [classes, setClasses] = useState(initialClasses);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        academicYear: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        await new Promise(resolve => setTimeout(resolve, 500));

        if (editingClass) {
            setClasses(classes.map(c => c.id === editingClass.id ? { ...c, ...formData } : c));
            toast({ title: "تم بنجاح", description: "تم تحديث بيانات الفصل" });
        } else {
            const newClass = {
                id: Math.random().toString(),
                ...formData,
                studentsCount: 0,
                subjectsCount: 0
            };
            setClasses([...classes, newClass]);
            toast({ title: "تم بنجاح", description: "تم إنشاء الفصل الجديد" });
        }

        setIsSubmitting(false);
        setIsModalOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setEditingClass(null);
        setFormData({
            name: '',
            description: '',
            academicYear: '',
        });
    };

    const handleEdit = (cls: any) => {
        setEditingClass(cls);
        setFormData({
            name: cls.name,
            description: cls.description,
            academicYear: cls.academicYear,
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('هل أنت متأكد من حذف هذا الفصل؟')) {
            setClasses(classes.filter(c => c.id !== id));
            toast({ title: "تم بنجاح", description: "تم حذف الفصل" });
        }
    };

    const filteredClasses = classes.filter(cls =>
        cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.academicYear.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">الفصول الدراسية</h1>
                    <p className="text-muted-foreground">إدارة الفصول الدراسية والمراحل</p>
                </div>
                <Dialog open={isModalOpen} onOpenChange={(open) => {
                    setIsModalOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" />
                            إضافة فصل
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>{editingClass ? 'تعديل فصل' : 'إضافة فصل جديد'}</DialogTitle>
                            <DialogDescription>
                                {editingClass ? 'تعديل بيانات الفصل الحالي' : 'إضافة فصل دراسي جديد'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">اسم الفصل</label>
                                <Input
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="مثال: الأول ابتدائي - أ"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">السنة الدراسية</label>
                                <Input
                                    value={formData.academicYear}
                                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                                    placeholder="مثال: 2024-2025"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">الوصف</label>
                                <Input
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="وصف مختصر للفصل"
                                />
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                    إلغاء
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                        placeholder="بحث عن فصل..."
                        className="pr-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border bg-white dark:bg-gray-800 shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-right">اسم الفصل</TableHead>
                            <TableHead className="text-right">السنة الدراسية</TableHead>
                            <TableHead className="text-right">الوصف</TableHead>
                            <TableHead className="text-right">الإحصائيات</TableHead>
                            <TableHead className="text-right">الإجراءات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredClasses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    لا يوجد فصول دراسية
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredClasses.map((cls) => (
                                <TableRow key={cls.id}>
                                    <TableCell className="font-medium">{cls.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{cls.academicYear}</Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{cls.description}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Badge variant="secondary" className="gap-1">
                                                <Users className="w-3 h-3" />
                                                {cls.studentsCount}
                                            </Badge>
                                            <Badge variant="secondary" className="gap-1">
                                                <BookOpen className="w-3 h-3" />
                                                {cls.subjectsCount}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(cls)}
                                                className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(cls.id)}
                                                className="h-8 w-8 text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
