'use client';

import { useTranslations } from 'next-intl';
import { Trophy, Gamepad2, Target, Award, Star, Crown } from 'lucide-react';
import Link from 'next/link';

export default function GamesPage() {
    const t = useTranslations();

    const games = [
        {
            id: '1',
            title: 'اختبار سريع',
            titleEn: 'Quick Quiz',
            type: 'quiz',
            difficulty: 'easy',
            icon: Target,
            color: 'bg-blue-500',
            players: 245,
        },
        {
            id: '2',
            title: 'لعبة الذاكرة',
            titleEn: 'Memory Match',
            type: 'memory',
            difficulty: 'medium',
            icon: Gamepad2,
            color: 'bg-purple-500',
            players: 189,
        },
        {
            id: '3',
            title: 'ألغاز الكلمات',
            titleEn: 'Word Puzzle',
            type: 'puzzle',
            difficulty: 'hard',
            icon: Star,
            color: 'bg-green-500',
            players: 156,
        },
        {
            id: '4',
            title: 'السحب والإفلات',
            titleEn: 'Drag & Drop',
            type: 'dragdrop',
            difficulty: 'easy',
            icon: Award,
            color: 'bg-orange-500',
            players: 198,
        },
    ];

    const achievements = [
        { title: 'بطل الألعاب', icon: Crown, earned: true, points: 500 },
        { title: 'ماستر الذاكرة', icon: Trophy, earned: true, points: 300 },
        { title: 'خبير الألغاز', icon: Star, earned: false, points: 400 },
        { title: 'نجم الفريق', icon: Award, earned: false, points: 600 },
    ];

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">🎮 الألعاب التعليمية</h1>
                    <p className="text-muted-foreground mt-2">
                        العب وتعلم مع أصدقائك في ألعاب تفاعلية ممتعة
                    </p>
                </div>
                <Link
                    href="/student/leaderboard"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                    🏆 لوحة المتصدرين
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl">
                    <div className="flex items-center gap-3">
                        <Gamepad2 className="w-8 h-8" />
                        <div>
                            <p className="text-sm opacity-90">ألعاب مكتملة</p>
                            <p className="text-3xl font-bold">24</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl">
                    <div className="flex items-center gap-3">
                        <Trophy className="w-8 h-8" />
                        <div>
                            <p className="text-sm opacity-90">إجمالي النقاط</p>
                            <p className="text-3xl font-bold">1,850</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl">
                    <div className="flex items-center gap-3">
                        <Star className="w-8 h-8" />
                        <div>
                            <p className="text-sm opacity-90">الجوائز</p>
                            <p className="text-3xl font-bold">8/12</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl">
                    <div className="flex items-center gap-3">
                        <Crown className="w-8 h-8" />
                        <div>
                            <p className="text-sm opacity-90">الترتيب</p>
                            <p className="text-3xl font-bold">#12</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Games Grid */}
            <div>
                <h2 className="text-2xl font-bold mb-4">الألعاب المتاحة</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {games.map((game) => {
                        const Icon = game.icon;
                        return (
                            <Link
                                key={game.id}
                                href={`/student/games/${game.id}`}
                                className="group"
                            >
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-primary transition-all hover:shadow-lg">
                                    <div className={`${game.color} w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">{game.title}</h3>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        {game.titleEn}
                                    </p>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className={`px-2 py-1 rounded ${game.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                                game.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                            }`}>
                                            {game.difficulty === 'easy' ? 'سهل' : game.difficulty === 'medium' ? 'متوسط' : 'صعب'}
                                        </span>
                                        <span className="text-muted-foreground">
                                            {game.players} لاعب
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Achievements */}
            <div>
                <h2 className="text-2xl font-bold mb-4">🏆 الجوائز والإنجازات</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {achievements.map((achievement, idx) => {
                        const Icon = achievement.icon;
                        return (
                            <div
                                key={idx}
                                className={`p-6 rounded-xl border-2 ${achievement.earned
                                        ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300'
                                        : 'bg-gray-50 border-gray-200 opacity-60'
                                    }`}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`${achievement.earned ? 'bg-yellow-500' : 'bg-gray-300'
                                        } w-12 h-12 rounded-full flex items-center justify-center`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">{achievement.title}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {achievement.points} نقطة
                                        </p>
                                    </div>
                                </div>
                                {achievement.earned && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                        ✓ تم الحصول عليها
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
