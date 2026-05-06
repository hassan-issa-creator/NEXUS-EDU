'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  points: number;
  badges: string[];
}

interface LeaderboardProps {
  title?: string;
  limit?: number;
}

const BADGE_ICONS: Record<string, string> = {
  first_quiz: '🎯',
  perfect_score: '💯',
  streak_7: '🔥',
  top_10: '⭐',
  quiz_master: '🏆',
};

export function Leaderboard({ title = 'لوحة الشرف', limit = 10 }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    const mockData: LeaderboardEntry[] = [
      { rank: 1, userId: '1', name: 'أحمد محمد', points: 1250, badges: ['perfect_score', 'quiz_master'] },
      { rank: 2, userId: '2', name: 'فاطمة علي', points: 1180, badges: ['streak_7', 'top_10'] },
      { rank: 3, userId: '3', name: 'محمد أحمد', points: 1050, badges: ['first_quiz', 'perfect_score'] },
      { rank: 4, userId: '4', name: 'سارة حسن', points: 980, badges: ['streak_7'] },
      { rank: 5, userId: '5', name: 'عمر خالد', points: 920, badges: ['first_quiz'] },
      { rank: 6, userId: '6', name: 'نور الدين', points: 850, badges: [] },
      { rank: 7, userId: '7', name: 'ليلى أحمد', points: 820, badges: ['first_quiz'] },
      { rank: 8, userId: '8', name: 'يوسف علي', points: 780, badges: [] },
      { rank: 9, userId: '9', name: 'مريم حسن', points: 750, badges: ['streak_7'] },
      { rank: 10, userId: '10', name: 'خالد محمود', points: 720, badges: [] },
    ];

    setTimeout(() => {
      setEntries(mockData.slice(0, limit));
      setLoading(false);
    }, 500);
  }, [limit]);

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500 to-amber-400 text-yellow-900';
      case 2:
        return 'bg-gradient-to-r from-slate-400 to-slate-300 text-slate-800';
      case 3:
        return 'bg-gradient-to-r from-amber-700 to-amber-600 text-amber-100';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-1/3" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-10 w-10 bg-slate-700 rounded-full" />
              <div className="flex-1 h-4 bg-slate-700 rounded" />
              <div className="h-4 w-16 bg-slate-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          {title}
        </h3>
        <span className="text-sm text-slate-400">
          أفضل {limit} طلاب
        </span>
      </div>

      {/* List */}
      <ul className="divide-y divide-slate-700/50">
        {entries.map((entry, index) => (
          <motion.li
            key={entry.userId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="px-6 py-4 flex items-center gap-4 hover:bg-slate-700/30 transition-colors"
          >
            {/* Rank */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getRankStyle(entry.rank)}`}
            >
              {entry.rank}
            </div>

            {/* Avatar & Name */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-white truncate">
                  {entry.name}
                </span>
                {/* Badges */}
                <span className="flex gap-0.5">
                  {entry.badges.slice(0, 3).map((badge) => (
                    <span key={badge} title={badge}>
                      {BADGE_ICONS[badge] || '🎖️'}
                    </span>
                  ))}
                </span>
              </div>
            </div>

            {/* Points */}
            <div className="text-left">
              <span className="text-lg font-bold text-blue-400">
                {entry.points.toLocaleString('ar-EG')}
              </span>
              <span className="text-xs text-slate-500 block">
                نقطة
              </span>
            </div>
          </motion.li>
        ))}
      </ul>

      {/* Footer */}
      <div className="px-6 py-3 bg-slate-900/50 border-t border-slate-700/50">
        <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
          عرض المزيد ←
        </button>
      </div>
    </div>
  );
}

export default Leaderboard;
