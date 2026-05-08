'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Target, AlertTriangle, CheckCircle2, TrendingUp, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api/client';
import Link from 'next/link';

export default function AiPersonalTutorPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWeaknessMap = async () => {
            try {
                const res = await apiClient.get('/ai/weakness-map/me');
                if (res.data?.success) {
                    setData(res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch weakness map", err);
            } finally {
                setLoading(false);
            }
        };

        fetchWeaknessMap();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-muted-foreground animate-pulse">يقوم المعلم الذكي بتحليل أدائك...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
                <AlertTriangle className="w-16 h-16 text-yellow-500" />
                <h2 className="text-2xl font-bold">لا يمكن تحميل خريطة نقاط الضعف</h2>
                <p className="text-muted-foreground">حدث خطأ أثناء الاتصال بالمعلم الذكي. يرجى المحاولة لاحقاً.</p>
                <Link href="/student">
                    <Button variant="outline" className="mt-4">العودة للوحة التحكم</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-10">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl"
            >
                <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
                    <BrainCircuit className="w-48 h-48" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                    <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md border border-white/30">
                        <Sparkles className="w-10 h-10 text-yellow-300" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold mb-2">المعلم الذكي الشخصي</h1>
                        <p className="text-blue-100 text-lg max-w-2xl">
                            تحليل مخصص لأدائك الدراسي، مصمم خصيصاً لمساعدتك على التفوق وتجاوز التحديات الأكاديمية.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Learning Path */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
            >
                <Card className="border-l-4 border-l-primary bg-primary/5 dark:bg-primary/10 shadow-sm">
                    <CardContent className="p-6">
                        <h3 className="font-bold text-lg text-primary flex items-center gap-2 mb-2">
                            <Target className="w-5 h-5" />
                            مسار التعلم المقترح هذا الأسبوع:
                        </h3>
                        <p className="text-lg text-foreground/80 font-medium leading-relaxed">
                            "{data.learningPath}"
                        </p>
                    </CardContent>
                </Card>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Weakness Map */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="h-full border-red-100 dark:border-red-900 shadow-md">
                        <CardHeader className="bg-red-50/50 dark:bg-red-900/10 border-b border-red-100 dark:border-red-900/50 pb-4">
                            <CardTitle className="text-xl flex items-center gap-2 text-red-700 dark:text-red-400">
                                <AlertTriangle className="w-5 h-5" />
                                خريطة المفاهيم للتحسين
                            </CardTitle>
                            <CardDescription>المواضيع التي أظهرت فيها صعوبة مؤخراً</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {data.topics.length > 0 ? (
                                <div className="space-y-6">
                                    {data.topics.map((topic: any, idx: number) => (
                                        <div key={idx} className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-foreground">{topic.topic}</span>
                                                <span className="text-xs font-semibold px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                                                    ضعف بنسبة {topic.score}%
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{topic.description}</p>
                                            <Progress value={100 - topic.score} className="h-2 bg-red-100 dark:bg-red-900" indicatorColor="bg-red-500" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center p-8 space-y-3">
                                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                                    <p className="font-medium text-emerald-600">أداؤك ممتاز! لم يتم رصد أي نقاط ضعف جوهرية.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Recommendations */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="h-full border-emerald-100 dark:border-emerald-900 shadow-md">
                        <CardHeader className="bg-emerald-50/50 dark:bg-emerald-900/10 border-b border-emerald-100 dark:border-emerald-900/50 pb-4">
                            <CardTitle className="text-xl flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                                <TrendingUp className="w-5 h-5" />
                                خطة العمل الموصى بها
                            </CardTitle>
                            <CardDescription>خطوات عملية للتغلب على نقاط الضعف</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <ul className="space-y-4">
                                {data.recommendations.map((rec: string, idx: number) => (
                                    <li key={idx} className="flex gap-3 items-start">
                                        <div className="mt-0.5 shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                                            {idx + 1}
                                        </div>
                                        <p className="text-foreground/90 leading-relaxed font-medium">
                                            {rec}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                            
                            <div className="mt-8 pt-6 border-t border-border">
                                <Link href="/student/courses">
                                    <Button className="w-full gap-2 group bg-emerald-600 hover:bg-emerald-700">
                                        ابدأ المراجعة الآن
                                        <ArrowRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
