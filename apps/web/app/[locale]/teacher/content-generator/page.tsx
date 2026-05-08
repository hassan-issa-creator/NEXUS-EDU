'use client'

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Sparkles, Loader2, UploadCloud, FileJson, Layers, CheckCircle2, BookOpen, Presentation, Check, Info, ImageIcon, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api/client';

export default function ContentGeneratorPage() {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [imageLoading, setImageLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        try {
            const res = await apiClient.post('/upload/pdf-to-text', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data?.success) {
                setText(res.data.text);
            }
        } catch (error) {
            console.error("Failed to parse PDF", error);
            alert('تعذر قراءة ملف الـ PDF. يرجى المحاولة مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateImage = async () => {
        if (!result?.summary) return;
        setImageLoading(true);
        setImageUrl(null);
        try {
            const res = await apiClient.post('/ai/generate-image', { prompt: result.summary });
            if (res.data?.success) {
                setImageUrl(res.data.data.url);
            }
        } catch (error) {
            console.error("Failed to generate image", error);
            alert('تعذر توليد الصورة. تأكد من إعدادات الذكاء الاصطناعي.');
        } finally {
            setImageLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!text.trim()) return;
        setLoading(true);
        setResult(null);
        try {
            const res = await apiClient.post('/ai/process-document', { text });
            if (res.data?.success) {
                setResult(res.data.data);
            }
        } catch (error) {
            console.error("Failed to generate content", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveTemplate = async () => {
        if (!result) return;
        setLoading(true);
        try {
            const res = await apiClient.post('/teacher/ai-generator/templates', {
                title: 'درس مولد بالذكاء الاصطناعي',
                content: result,
                type: 'LESSON_PLAN'
            });
            if (res.data?.success) {
                alert('تم حفظ القالب بنجاح!');
            }
        } catch (error) {
            console.error("Failed to save template", error);
            alert('حدث خطأ أثناء الحفظ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-10">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-violet-700 via-fuchsia-600 to-pink-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl"
            >
                <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
                    <Sparkles className="w-48 h-48" />
                </div>
                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                            <FileJson className="w-8 h-8 text-yellow-300" />
                            محول المحتوى التفاعلي (AI)
                        </h1>
                        <p className="text-fuchsia-100 text-lg max-w-2xl">
                            قم بلصق محتوى الدرس أو الملزمة وسيقوم الذكاء الاصطناعي بتوليد ملخصات، بطاقات استذكار، واختبارات تفاعلية تلقائياً بضغطة زر.
                        </p>
                    </div>
                </div>
            </motion.div>

            <div className="grid lg:grid-cols-[1fr_1.5fr] gap-6">
                {/* Input Section */}
                <Card className="border-border shadow-sm h-fit">
                    <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-border">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-500" />
                            المحتوى الأصلي
                        </CardTitle>
                        <CardDescription>ألصق النص هنا للبدء بالتحليل</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                        <label className="border-2 border-dashed border-indigo-200 dark:border-indigo-900 rounded-xl p-6 text-center hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors cursor-pointer group block">
                            <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
                            <UploadCloud className="w-8 h-8 text-indigo-400 mx-auto mb-2 group-hover:text-indigo-600 transition-colors" />
                            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                رفع ملف PDF
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">سيتم استخراج النص تلقائياً للتحليل</p>
                        </label>
                        
                        <div className="relative">
                            <Textarea 
                                placeholder="ألصق محتوى الدرس هنا... (مثال: الشرح الخاص بالحرب العالمية الثانية، أو أساسيات البرمجة)" 
                                className="min-h-[300px] resize-y"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                            />
                        </div>

                        <Button 
                            className="w-full gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white"
                            onClick={handleGenerate}
                            disabled={!text.trim() || loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    جاري المعالجة والتحليل...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    توليد المحتوى التفاعلي
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Output Section */}
                <Card className="border-border shadow-sm min-h-[500px] bg-slate-50/50 dark:bg-slate-900/20">
                    {!result && !loading && (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-50">
                            <Layers className="w-20 h-20 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-bold text-muted-foreground">لا يوجد محتوى مولد بعد</h3>
                            <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                                ألصق النص واضغط على زر التوليد لرؤية السحر. سيتم استخراج الملخصات، المفاهيم، والأسئلة التفاعلية.
                            </p>
                        </div>
                    )}
                    
                    {loading && (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <div className="relative">
                                <div className="absolute inset-0 bg-fuchsia-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                                <Loader2 className="w-16 h-16 text-fuchsia-500 animate-spin relative z-10" />
                            </div>
                            <p className="mt-6 font-medium text-lg animate-pulse text-fuchsia-700 dark:text-fuchsia-400">
                                الذكاء الاصطناعي يقوم بصياغة المحتوى...
                            </p>
                        </div>
                    )}

                    {result && !loading && (
                        <Tabs defaultValue="summary" className="w-full">
                            <CardHeader className="border-b border-border pb-0 px-0 flex flex-row items-center justify-between pr-4">
                                <TabsList className="w-full justify-start rounded-none bg-transparent border-0 h-auto p-0 flex-wrap px-4">
                                    <TabsTrigger value="summary" className="data-[state=active]:border-b-2 data-[state=active]:border-fuchsia-500 rounded-none pb-3 px-4">
                                        الملخص والمفاهيم
                                    </TabsTrigger>
                                    <TabsTrigger value="quiz" className="data-[state=active]:border-b-2 data-[state=active]:border-fuchsia-500 rounded-none pb-3 px-4">
                                        الاختبار (Quiz)
                                    </TabsTrigger>
                                    <TabsTrigger value="flashcards" className="data-[state=active]:border-b-2 data-[state=active]:border-fuchsia-500 rounded-none pb-3 px-4">
                                        بطاقات الاستذكار
                                    </TabsTrigger>
                                    <TabsTrigger value="homework" className="data-[state=active]:border-b-2 data-[state=active]:border-fuchsia-500 rounded-none pb-3 px-4">
                                        الواجبات المقترحة
                                    </TabsTrigger>
                                    <TabsTrigger value="image" className="data-[state=active]:border-b-2 data-[state=active]:border-fuchsia-500 rounded-none pb-3 px-4">
                                        توليد صورة (AI)
                                    </TabsTrigger>
                                </TabsList>
                                <Button variant="outline" size="sm" onClick={handleSaveTemplate} className="mb-2 shrink-0">
                                    <CheckCircle2 className="w-4 h-4 ml-2 text-green-600" />
                                    حفظ القالب
                                </Button>
                            </CardHeader>
                            <CardContent className="p-6">
                                <AnimatePresence mode="wait">
                                    {/* Summary Tab */}
                                    <TabsContent value="summary" className="space-y-6 mt-0 outline-none">
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                            <h3 className="text-lg font-bold flex items-center gap-2 mb-3 text-fuchsia-700 dark:text-fuchsia-400">
                                                <BookOpen className="w-5 h-5" /> الملخص
                                            </h3>
                                            <p className="text-foreground/90 leading-relaxed bg-white dark:bg-slate-900 p-4 rounded-xl border border-border shadow-sm">
                                                {result.summary}
                                            </p>
                                        </motion.div>
                                        
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                                            <h3 className="text-lg font-bold flex items-center gap-2 mb-3 text-indigo-700 dark:text-indigo-400 mt-8">
                                                <Presentation className="w-5 h-5" /> المفاهيم الرئيسية
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {result.keyConcepts.map((concept: string, idx: number) => (
                                                    <Badge key={idx} variant="secondary" className="px-3 py-1.5 text-sm bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                                                        {concept}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </motion.div>
                                    </TabsContent>

                                    {/* Quiz Tab */}
                                    <TabsContent value="quiz" className="space-y-6 mt-0 outline-none">
                                        <div className="space-y-6">
                                            {result.quiz.map((q: any, idx: number) => (
                                                <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-border shadow-sm">
                                                    <h4 className="font-bold text-lg mb-4 flex gap-2">
                                                        <span className="text-fuchsia-500">{idx + 1}.</span> {q.question}
                                                    </h4>
                                                    <div className="grid sm:grid-cols-2 gap-3 mb-4">
                                                        {q.options.map((opt: string, optIdx: number) => (
                                                            <div key={optIdx} className={`p-3 rounded-lg border ${optIdx === q.correctAnswer ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-medium' : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-muted-foreground'}`}>
                                                                {optIdx === q.correctAnswer && <Check className="w-4 h-4 inline-block ml-2" />}
                                                                {opt}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-3 rounded-lg text-sm flex gap-2 items-start">
                                                        <Info className="w-4 h-4 shrink-0 mt-0.5" />
                                                        <p>{q.explanation}</p>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </TabsContent>

                                    {/* Flashcards Tab */}
                                    <TabsContent value="flashcards" className="mt-0 outline-none">
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            {result.flashcards.map((card: any, idx: number) => (
                                                <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }} className="group perspective-1000 h-[200px]">
                                                    <div className="relative w-full h-full transition-all duration-500 transform-style-3d group-hover:rotate-y-180">
                                                        <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900 rounded-xl shadow-sm flex flex-col justify-center items-center p-6 text-center cursor-pointer">
                                                            <span className="text-xs font-bold text-indigo-400 mb-2 uppercase tracking-widest">المصطلح</span>
                                                            <h4 className="font-bold text-lg">{card.front}</h4>
                                                        </div>
                                                        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-xl shadow-sm flex flex-col justify-center items-center p-6 text-center cursor-pointer">
                                                            <span className="text-xs font-bold text-indigo-500 mb-2 uppercase tracking-widest">التعريف</span>
                                                            <p className="text-sm font-medium text-indigo-900 dark:text-indigo-200">{card.back}</p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </TabsContent>

                                    {/* Homework Tab */}
                                    <TabsContent value="homework" className="mt-0 outline-none">
                                        <div className="space-y-4">
                                            {result.homework.map((hw: string, idx: number) => (
                                                <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="flex items-start gap-4 p-4 bg-white dark:bg-slate-900 border border-border rounded-xl shadow-sm">
                                                    <div className="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 p-2 rounded-lg shrink-0">
                                                        <CheckCircle2 className="w-5 h-5" />
                                                    </div>
                                                    <p className="font-medium text-foreground leading-relaxed pt-1">{hw}</p>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </TabsContent>

                                    {/* Image Generation Tab */}
                                    <TabsContent value="image" className="mt-0 outline-none">
                                        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-border text-center">
                                            <ImageIcon className="w-16 h-16 text-indigo-300 mb-4" />
                                            <h3 className="text-xl font-bold mb-2">رسومات توضيحية للدرس</h3>
                                            <p className="text-muted-foreground mb-6 max-w-md">
                                                سيقوم الذكاء الاصطناعي بتوليد صورة جذابة ومناسبة للأطفال تشرح المفاهيم الرئيسية في هذا الدرس.
                                            </p>
                                            
                                            <Button 
                                                onClick={handleGenerateImage} 
                                                disabled={imageLoading}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                                            >
                                                {imageLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                                توليد صورة تعليمية
                                            </Button>

                                            {imageUrl && (
                                                <motion.div 
                                                    initial={{ opacity: 0, scale: 0.9 }} 
                                                    animate={{ opacity: 1, scale: 1 }} 
                                                    className="mt-8 w-full max-w-md mx-auto"
                                                >
                                                    <div className="relative rounded-2xl overflow-hidden shadow-lg border-4 border-white dark:border-slate-800">
                                                        <img src={imageUrl} alt="AI Generated Illustration" className="w-full h-auto" />
                                                    </div>
                                                    <Button variant="outline" className="mt-4 gap-2 w-full" onClick={() => window.open(imageUrl, '_blank')}>
                                                        <Download className="w-4 h-4" />
                                                        تحميل الصورة
                                                    </Button>
                                                </motion.div>
                                            )}
                                        </div>
                                    </TabsContent>
                                </AnimatePresence>
                            </CardContent>
                        </Tabs>
                    )}
                </Card>
            </div>
        </div>
    );
}
