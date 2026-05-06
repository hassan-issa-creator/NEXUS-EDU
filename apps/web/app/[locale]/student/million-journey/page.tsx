'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Award, Target, Zap, Calendar } from 'lucide-react';
import PointsDisplay from './components/PointsDisplay';
import LevelProgress from './components/LevelProgress';
import CategoryCard from './components/CategoryCard';
import GoalsWidget from './components/GoalsWidget';
import ComparisonChart from './components/ComparisonChart';
import PositionCard from './components/PositionCard';
import ProbabilityGauge from './components/ProbabilityGauge';
import Recommendations from './components/Recommendations';

interface JourneyData {
    profile: any;
    currentScore: any;
    level: any;
    badges: any[];
    positions: {
        classRank: number;
        gradeRank: number;
        schoolRank: number;
    };
    goals: {
        weekly: { target: number; current: number; percentage: number };
        monthly: { target: number; current: number; percentage: number };
    };
    comparison: {
        lastWeek: number;
        lastMonth: number;
        trend: 'up' | 'down' | 'stable';
    };
    recommendations: string[];
    nextBadges: Array<{ badge: any; progress: number }>;
}

export default function MillionJourneyPage() {
    const [data, setData] = useState<JourneyData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchJourneyData();
    }, []);

    const fetchJourneyData = async () => {
        try {
            // TODO: Replace with actual API call
            const response = await fetch('/api/million-achiever/journey/me');
            const result = await response.json();
            setData(result.data);
        } catch (error) {
            console.error('Error fetching journey data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">No Data Available</h2>
                    <p className="text-muted-foreground">
                        Start your Million Achiever journey today!
                    </p>
                </div>
            </div>
        );
    }

    const categories = [
        { name: 'Attendance', score: data.currentScore?.attendanceScore || 0, icon: Calendar, color: '#3B82F6' },
        { name: 'Behavior', score: data.currentScore?.behaviorScore || 0, icon: Award, color: '#10B981' },
        { name: 'Assignments', score: data.currentScore?.assignmentsScore || 0, icon: Target, color: '#8B5CF6' },
        { name: 'Exams', score: data.currentScore?.examsScore || 0, icon: Trophy, color: '#F59E0B' },
        { name: 'Participation', score: data.currentScore?.participationScore || 0, icon: Zap, color: '#EC4899' },
        { name: 'Projects', score: data.currentScore?.projectsScore || 0, icon: Award, color: '#6366F1' },
    ];

    return (
        <div className="min-h-screen bg-background p-6 space-y-8">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-8"
            >
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-4">
                    رحلة المليون
                </h1>
                <p className="text-lg text-muted-foreground">
                    Your path to becoming a Million Achiever
                </p>
            </motion.div>

            {/* Points and Level */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PointsDisplay
                    totalPoints={data.profile.totalPoints}
                    trend={data.comparison.trend}
                    change={data.comparison.lastWeek}
                />
                <LevelProgress
                    currentLevel={data.level.levelName}
                    levelNumber={data.level.levelNumber}
                    progress={data.profile.pointsToNextLevel}
                    nextLevel={data.level.levelNumber + 1}
                />
            </div>

            {/* Goals */}
            <GoalsWidget
                weekly={data.goals.weekly}
                monthly={data.goals.monthly}
            />

            {/* Category Breakdown */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Performance Categories</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((category, index) => (
                        <motion.div
                            key={category.name}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                            <CategoryCard {...category} />
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Comparison and Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ComparisonChart
                    lastWeek={data.comparison.lastWeek}
                    lastMonth={data.comparison.lastMonth}
                />
                <ProbabilityGauge
                    probability={data.profile.winningProbability}
                    consistencyIndex={data.profile.consistencyIndex}
                />
            </div>

            {/* Leaderboard Position */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Your Rankings</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <PositionCard
                        scope="Class"
                        rank={data.positions.classRank}
                        icon={Award}
                        color="blue"
                    />
                    <PositionCard
                        scope="Grade"
                        rank={data.positions.gradeRank}
                        icon={Trophy}
                        color="purple"
                    />
                    <PositionCard
                        scope="School"
                        rank={data.positions.schoolRank}
                        icon={Zap}
                        color="orange"
                    />
                </div>
            </div>

            {/* Recommendations */}
            <Recommendations recommendations={data.recommendations} />

            {/* Next Badges */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Next Badges to Earn</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.nextBadges.map((item, index) => (
                        <motion.div
                            key={item.badge.badgeCode}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="bg-card border rounded-lg p-4"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold">{item.badge.badgeName}</span>
                                <span className="text-sm text-muted-foreground">{item.progress}%</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2">
                                <div
                                    className="bg-primary h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${item.progress}%` }}
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
