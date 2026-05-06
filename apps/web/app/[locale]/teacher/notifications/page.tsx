'use client'

import { useState } from 'react'
import { Send, Bell } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'

export default function NotificationsPage() {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        await new Promise(resolve => setTimeout(resolve, 1000))
        setLoading(false)
        toast({
            title: "تم إرسال التنبيه ✅",
            description: "وصل الإشعار لجميع المستلمين المحددين.",
        })
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">إرسال التنبيهات 🔔</h2>
                <p className="text-muted-foreground">إرسال إشعارات للطلاب وأولياء الأمور</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>رسالة جديدة</CardTitle>
                    <CardDescription>سيصل هذا الإشعار عبر التطبيق والبريد الإلكتروني</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSend} className="space-y-6">
                        <div className="space-y-2">
                            <Label>المستلمون</Label>
                            <Select required>
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر الفئة المستهدفة" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all-students">جميع طلابي</SelectItem>
                                    <SelectItem value="10-a">الصف 10 - أ فقط</SelectItem>
                                    <SelectItem value="11-b">الصف 11 - ب فقط</SelectItem>
                                    <SelectItem value="parents">أولياء الأمور</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>عنوان التنبيه</Label>
                            <Input placeholder="مثال: تذكير بموعد الاختبار" required />
                        </div>

                        <div className="space-y-2">
                            <Label>نص الرسالة</Label>
                            <Textarea
                                placeholder="اكتب نص الرسالة هنا..."
                                className="min-h-[150px]"
                                required
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={loading} className="gap-2">
                                <Send className="w-4 h-4" />
                                {loading ? 'جاري الإرسال...' : 'إرسال الآن'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
