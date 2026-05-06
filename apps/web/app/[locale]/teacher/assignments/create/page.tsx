'use client'

import { useState } from 'react'
import { Calendar as CalendarIcon, Upload, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { format } from 'date-fns'
import { arSA } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

export default function CreateAssignmentPage() {
    const { toast } = useToast()
    const [date, setDate] = useState<Date>()
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Simulate API
        await new Promise(resolve => setTimeout(resolve, 1000))

        setLoading(false)
        toast({
            title: "تم إنشاء الواجب بنجاح ✅",
            description: "تم إشعار جميع الطلاب في الفصل المختار.",
        })
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">إنشاء واجب جديد 📝</h2>
                <p className="text-muted-foreground">إضافة واجب أو اختبار جديد للفصل</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>تفاصيل الواجب</CardTitle>
                    <CardDescription>أدخل المعلومات الأساسية للواجب</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>عنوان الواجب</Label>
                                <Input placeholder="مثال: حل تمارين الفصل الثالث" required />
                            </div>

                            <div className="space-y-2">
                                <Label>الفصل الدراسي</Label>
                                <Select required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر الفصل" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10-a">الصف 10 - أ (الرياضيات)</SelectItem>
                                        <SelectItem value="11-b">الصف 11 - ب (الفيزياء)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>الوصف والتعليمات</Label>
                            <Textarea
                                placeholder="اكتب تعليمات الواجب هنا..."
                                className="min-h-[120px]"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label>تاريخ التسليم</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, "PPP", { locale: arSA }) : <span>اختر التاريخ</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            initialFocus
                                            dir="rtl"
                                            locale={arSA}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <Label>الدرجة الكلية</Label>
                                <Input type="number" placeholder="10" min="1" />
                            </div>

                            <div className="space-y-2">
                                <Label>نوع الواجب</Label>
                                <Select defaultValue="homework">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="homework">واجب منزلي</SelectItem>
                                        <SelectItem value="quiz">اختبار قصير</SelectItem>
                                        <SelectItem value="project">مشروع</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>المرفقات</Label>
                            <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                                <Upload className="h-8 w-8 mb-2" />
                                <p className="text-sm">اضغط للرفع أو اسحب الملفات هنا</p>
                                <p className="text-xs mt-1">PDF, DOCX, PNG (Max 10MB)</p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" type="button">إلغاء</Button>
                            <Button type="submit" disabled={loading} className="gap-2">
                                <Save className="w-4 h-4" />
                                {loading ? 'جاري الحفظ...' : 'نشر الواجب'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
