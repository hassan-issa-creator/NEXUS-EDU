'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, Trophy, Flame, Target, Zap, Award, Lock } from 'lucide-react';

interface BadgeInfo {
    id: string;
    name: string;
    nameAr: string;
    description: string;
    descriptionAr: string;
    icon: string;
    points: number;
    earned?: boolean;
    earnedAt?: Date;
    progress?: number; // 0-100
}

interface StudentGamificationStats {
    totalPoints: number;
    level: number;
    currentLevelPoints: number;
    nextLevelPoints: number;
    rank: number;
    totalStudents: number;
    streak: number;
    badges: BadgeInfo[];
}

interface StudentGamificationCardProps {
    studentId: string;
    data?: StudentGamificationStats;
}

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 4000, 8000, 15000, 30000];
const LEVEL_NAMES = ['مبتدئ', 'متعلم', 'نشيط', 'متميز', 'خبير', 'ماهر', 'محترف', 'أسطوري', 'أسطوري+', 'الأعلى'];

export function StudentGamificationCard({ studentId, data: propData }: StudentGamificationCardProps) {
    const [data, setData] = useState<StudentGamificationStats | null>(propData || null);
    const [loading, setLoading] = useState(!propData);

    useEffect(() => {
        if (!propData) {
            fetchData();
        }
    }, [studentId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/gamification/user/${studentId}`);
            if (response.ok) {
                const statsData = await response.json();
                setData(statsData);
            } else {
                // Use mock data for demo
                setData({
                    totalPoints: 450,
                    level: 3,
                    currentLevelPoints: 450,
                    nextLevelPoints: 500,
                    rank: 12,
                    totalStudents: 50,
                    streak: 5,
                    badges: [
                        { id: 'first_quiz', nameAr: 'الخطوات الأولى', name: 'First Steps', description: '', descriptionAr: 'أكمل أول اختبار', icon: '🎯', points: 10, earned: true },
                        { id: 'streak_7', nameAr: 'محارب الأسبوع', name: 'Week Warrior', description: '', descriptionAr: 'سجل دخول 7 أيام متتالية', icon: '🔥', points: 30, earned: false, progress: 71 },
                        { id: 'perfect_score', nameAr: 'العلامة الكاملة', name: 'Perfect Score', description: '', descriptionAr: 'احصل على 100%', icon: '💯', points: 50, earned: true },
                    ],
                });
            }
        } catch {
            console.error('Failed to fetch gamification stats');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Card className="animate-pulse">
                <CardContent className="pt-6">
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </CardContent>
            </Card>
        );
    }

    if (!data) return null;

    const levelProgress = ((data.currentLevelPoints - LEVEL_THRESHOLDS[data.level - 1]!) / 
        (data.nextLevelPoints - LEVEL_THRESHOLDS[data.level - 1]!)) * 100;

    return (
        <div className="space-y-4">
            {/* Main Stats Card */}
            <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 p-6 text-white">
                    <div className="flex items-center justify-between">
                        {/* Level Badge */}
                        <motion.div 
                            className="text-center"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                        >
                            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-2">
                                <span className="text-3xl font-bold">{data.level}</span>
                            </div>
                            <p className="text-sm opacity-90">{LEVEL_NAMES[data.level - 1]}</p>
                        </motion.div>

                        {/* Points */}
                        <div className="text-center">
                            <div className="flex items-center gap-2 justify-center">
                                <Star className="w-8 h-8 text-yellow-300" />
                                <span className="text-4xl font-bold">{data.totalPoints}</span>
                            </div>
                            <p className="text-sm opacity-90">نقطة</p>
                        </div>

                        {/* Streak */}
                        <div className="text-center">
                            <div className="flex items-center gap-2 justify-center">
                                <Flame className="w-8 h-8 text-orange-300" />
                                <span className="text-4xl font-bold">{data.streak}</span>
                            </div>
                            <p className="text-sm opacity-90">يوم متتالي</p>
                        </div>

                        {/* Rank */}
                        <div className="text-center">
                            <div className="flex items-center gap-2 justify-center">
                                <Trophy className="w-8 h-8 text-yellow-300" />
                                <span className="text-4xl font-bold">#{data.rank}</span>
                            </div>
                            <p className="text-sm opacity-90">من {data.totalStudents}</p>
                        </div>
                    </div>

                    {/* Level Progress */}
                    <div className="mt-6">
                        <div className="flex justify-between text-sm mb-2">
                            <span>المستوى {data.level}</span>
                            <span>{data.currentLevelPoints}/{data.nextLevelPoints} نقطة</span>
                        </div>
                        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                            <motion.div 
                                className="h-full bg-white rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${levelProgress}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                            />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Badges */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Award className="w-5 h-5 text-yellow-500" />
                        الإنجازات
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                        {data.badges.map((badge, index) => (
                            <motion.div
                                key={badge.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`relative p-4 rounded-xl border-2 text-center transition-all ${
                                    badge.earned 
                                        ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' 
                                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                                }`}
                            >
                                {!badge.earned && (
                                    <div className="absolute top-2 left-2">
                                        <Lock className="w-4 h-4 text-gray-400" />
                                    </div>
                                )}
                                <span className={`text-4xl ${!badge.earned ? 'grayscale opacity-50' : ''}`}>
                                    {badge.icon}
                                </span>
                                <p className="mt-2 font-medium text-sm">{badge.nameAr}</p>
                                <Badge variant="secondary" className="mt-1 text-xs">
                                    +{badge.points}
                                </Badge>
                                {!badge.earned && badge.progress !== undefined && (
                                    <div className="mt-2">
                                        <Progress value={badge.progress} className="h-1" />
                                        <p className="text-xs text-gray-500 mt-1">{badge.progress}%</p>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
