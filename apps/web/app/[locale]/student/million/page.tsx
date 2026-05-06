'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users, Clock, Trophy } from 'lucide-react';
import { useMillionSocket } from '@/hooks/useMillionSocket';
import { motion } from 'framer-motion';

export default function MillionLobbyPage() {
    const router = useRouter();
    const { createRoom, connected } = useMillionSocket();

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [roomTitle, setRoomTitle] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreateRoom = async () => {
        if (!roomTitle.trim()) return;

        setLoading(true);
        try {
            const room = await createRoom({
                title: roomTitle,
                type: 'public',
                settings: {
                    questionCount: 10,
                    timeLimit: 15,
                    maxPlayers: 10
                }
            });

            // Navigate to room
            router.push(`/student/million/room/${room.id}`);
        } catch (error: any) {
            console.error('Failed to create room:', error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                    dir="rtl"
                >
                    <div className="inline-block mb-4 p-4 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full">
                        <Trophy className="w-16 h-16 text-white" />
                    </div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
                        مسابقة حوار المليون
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400">
                        تحدى أصدقاءك في مسابقة معرفية مثيرة!
                    </p>
                </motion.div>

                {/* Connection Status */}
                {!connected && (
                    <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-center" dir="rtl">
                        <p className="text-yellow-800 dark:text-yellow-200">
                            جاري الاتصال بالخادم...
                        </p>
                    </div>
                )}

                {/* Create Room Button */}
                <div className="mb-8" dir="rtl">
                    <Button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        size="lg"
                        className="w-full md:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-lg px-8 py-6"
                        disabled={!connected}
                    >
                        <Plus className="w-6 h-6 ml-2" />
                        إنشاء غرفة جديدة
                    </Button>
                </div>

                {/* Create Room Form */}
                {showCreateForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-8"
                    >
                        <Card dir="rtl">
                            <CardHeader>
                                <CardTitle>غرفة جديدة</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">عنوان الغرفة</label>
                                    <Input
                                        value={roomTitle}
                                        onChange={(e) => setRoomTitle(e.target.value)}
                                        placeholder="مثال: غرفة العلوم - المستوى المتوسط"
                                        className="text-right"
                                        dir="rtl"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleCreateRoom}
                                        disabled={!roomTitle.trim() || loading}
                                        className="flex-1"
                                    >
                                        {loading ? 'جاري الإنشاء...' : 'إنشاء'}
                                    </Button>
                                    <Button
                                        onClick={() => setShowCreateForm(false)}
                                        variant="outline"
                                    >
                                        إلغاء
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="text-center" dir="rtl">
                            <CardHeader>
                                <Users className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                                <CardTitle>لعب جماعي</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 dark:text-gray-400">
                                    تحدى حتى 10 لاعبين في نفس الوقت
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="text-center" dir="rtl">
                            <CardHeader>
                                <Clock className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                                <CardTitle>سرعة الإجابة</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 dark:text-gray-400">
                                    كن الأسرع لتحصل على نقاط إضافية
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="text-center" dir="rtl">
                            <CardHeader>
                                <Trophy className="w-12 h-12 text-yellow-600 mx-auto mb-2" />
                                <CardTitle>نظام النقاط</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 dark:text-gray-400">
                                    احصل على نقاط حسب الصعوبة والسرعة
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Room List (Placeholder) */}
                <Card dir="rtl">
                    <CardHeader>
                        <CardTitle>الغرف المتاحة</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                            لا توجد غرف نشطة حالياً. ابدأ بإنشاء غرفة جديدة!
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
