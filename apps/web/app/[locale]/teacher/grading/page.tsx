'use client'

import { useState } from 'react'
import { Check, X, Eye, Download, Sparkles, Loader2, Wand2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { aiApi } from '@/lib/api/ai'
import { cn } from '@/lib/utils'

const submissions = [
    { id: 1, student: 'أحمد علي', assignment: 'واجب الرياضيات #3', submittedAt: '2024-12-01 14:30', status: 'pending', file: 'math_hw_ahmed.pdf' },
    { id: 2, student: 'سارة محمد', assignment: 'واجب الرياضيات #3', submittedAt: '2024-12-01 15:45', status: 'graded', grade: 18, feedback: 'ممتاز يا سارة، استمري!', file: 'math_hw_sara.pdf' },
    { id: 3, student: 'خالد عمر', assignment: 'واجب الرياضيات #3', submittedAt: '2024-12-01 16:20', status: 'pending', file: 'math_hw_khaled.pdf' },
]

export default function GradingPage() {
    const { toast } = useToast()
    const [selectedSubmission, setSelectedSubmission] = useState<any>(null)
    const [grade, setGrade] = useState('')
    const [feedback, setFeedback] = useState('')
    const [isAiGrading, setIsAiGrading] = useState(false)

    const handleGrade = () => {
        toast({
            title: "تم رصد الدرجة ✅",
            description: `تم منح ${grade}/20 للطالب ${selectedSubmission.student}`,
        })
        setSelectedSubmission(null)
        setGrade('')
        setFeedback('')
    }

    const handleAiGrade = async () => {
        if (!selectedSubmission) return
        setIsAiGrading(true)

        try {
            // In a real scenario, we'd pass selectedSubmission.id
            const res = await aiApi.autoGrade(selectedSubmission.id.toString())
            if (res.data.success) {
                setGrade(res.data.data.score.toString())
                setFeedback(res.data.data.feedback)
                toast({
                    title: "تم التصحيح بالذكاء الاصطناعي ✨",
                    description: "قام المساعد باقتراح الدرجة والملاحظات بناءً على إجابة الطالب.",
                })
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "خطأ",
                description: "عذراً، فشل المساعد في تصحيح الواجب حالياً.",
            })
        } finally {
            setIsAiGrading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-3">
                        التصحيح والدرجات ✍️
                    </h2>
                    <p className="text-muted-foreground mt-1 text-lg">مراجعة تسليمات الطلاب ورصد الدرجات بالذكاء الاصطناعي</p>
                </div>
            </div>

            <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="border-b border-gray-50 pb-6">
                    <CardTitle className="text-xl font-bold text-gray-800">قائمة التسليمات الحديثة</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="rounded-xl border border-gray-100 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead className="text-right font-bold py-4">الطالب</TableHead>
                                    <TableHead className="text-right font-bold">الواجب</TableHead>
                                    <TableHead className="text-right font-bold">توقيت التسليم</TableHead>
                                    <TableHead className="text-center font-bold">الحالة</TableHead>
                                    <TableHead className="text-center font-bold">الملف</TableHead>
                                    <TableHead className="text-left font-bold">الإجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {submissions.map((sub) => (
                                    <TableRow key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                                        <TableCell className="font-semibold py-4">{sub.student}</TableCell>
                                        <TableCell>{sub.assignment}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                                {sub.submittedAt}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                className={cn(
                                                    "px-3 py-1 rounded-full border-none",
                                                    sub.status === 'graded' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                                                )}
                                            >
                                                {sub.status === 'graded' ? 'تم التصحيح' : 'قيد الانتظار'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button variant="ghost" size="sm" className="hover:bg-blue-50 text-blue-600 rounded-full h-10 w-10">
                                                <Download className="w-5 h-5" />
                                            </Button>
                                        </TableCell>
                                        <TableCell className="text-left">
                                            {sub.status === 'pending' ? (
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => setSelectedSubmission(sub)}
                                                            className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-6 shadow-md hover:shadow-lg transition-all"
                                                        >
                                                            تصحيح
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-2xl">
                                                        <DialogHeader className="p-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
                                                            <DialogTitle className="text-white text-2xl flex items-center gap-3">
                                                                <Wand2 className="w-6 h-6" />
                                                                تصحيح واجب: {sub.student}
                                                            </DialogTitle>
                                                        </DialogHeader>
                                                        <div className="p-6 space-y-6">
                                                            <div className="flex justify-center">
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    disabled={isAiGrading}
                                                                    onClick={handleAiGrade}
                                                                    className="w-full h-14 relative overflow-hidden group border-primary-200 hover:border-primary-500 rounded-xl"
                                                                >
                                                                    <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                                    <div className="relative flex items-center justify-center gap-3 text-primary-700 font-bold text-lg">
                                                                        {isAiGrading ? (
                                                                            <>
                                                                                <Loader2 className="w-6 h-6 animate-spin" />
                                                                                جاري التصحيح الذكي...
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Sparkles className="w-6 h-6 text-primary-500 animate-pulse" />
                                                                                تصحيح سحري بالذكاء الاصطناعي
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </Button>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <Label className="text-gray-700 font-bold">الدرجة المقترحة</Label>
                                                                    <div className="relative">
                                                                        <Input
                                                                            type="number"
                                                                            max="20"
                                                                            placeholder="0"
                                                                            value={grade}
                                                                            className="h-12 text-xl font-bold rounded-xl bg-gray-50 border-gray-200 focus:ring-primary-500"
                                                                            onChange={(e) => setGrade(e.target.value)}
                                                                        />
                                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">/ 20</span>
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label className="text-gray-700 font-bold">التقييم العام</Label>
                                                                    <div className="h-12 flex items-center px-4 bg-gray-50 rounded-xl border border-gray-200">
                                                                        {Number(grade) >= 18 ? 'ممتاز ⭐' : Number(grade) >= 15 ? 'جيد جداً 👍' : 'قيد المراجعة'}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label className="text-gray-700 font-bold">ملاحظات الذكاء الاصطناعي ورد المدرس</Label>
                                                                <Textarea
                                                                    placeholder="اكتب ملاحظاتك هنا أو دع الذكاء الاصطناعي يقترح عليك..."
                                                                    rows={4}
                                                                    value={feedback}
                                                                    className="rounded-xl bg-gray-50 border-gray-200 focus:ring-primary-500 text-right leading-relaxed"
                                                                    onChange={(e) => setFeedback(e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                        <DialogFooter className="p-6 bg-gray-50 flex gap-3">
                                                            <Button onClick={handleGrade} className="flex-1 h-12 text-lg font-bold bg-green-600 hover:bg-green-700 shadow-lg shadow-green-100">رصد الدرجة الآن</Button>
                                                            <Button variant="ghost" className="h-12">إلغاء</Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-2xl text-primary-700">{sub.grade}</span>
                                                    <span className="text-gray-400 font-bold">/ 20</span>
                                                    <div className="p-1 bg-green-50 rounded-full">
                                                        <Check className="w-4 h-4 text-green-600" />
                                                    </div>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
