import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class GamesScreen extends StatelessWidget {
  const GamesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('الألعاب التعليمية 🎮')),
      body: GridView.count(
        padding: const EdgeInsets.all(16),
        crossAxisCount: 2,
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
        childAspectRatio: 0.85,
        children: _games.map((g) => InkWell(
          onTap: () {},
          borderRadius: BorderRadius.circular(20),
          child: Container(
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.border.withOpacity(0.5)),
              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8, offset: const Offset(0, 2))],
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 64, height: 64,
                  decoration: BoxDecoration(color: g.color.withOpacity(0.1), borderRadius: BorderRadius.circular(16)),
                  child: Center(child: Text(g.emoji, style: const TextStyle(fontSize: 32))),
                ),
                const SizedBox(height: 12),
                Text(g.name, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14), textAlign: TextAlign.center),
                const SizedBox(height: 4),
                Text(g.desc, style: TextStyle(fontSize: 11, color: AppColors.textSecondary), textAlign: TextAlign.center),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(color: g.color.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                  child: Text(g.difficulty, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: g.color)),
                ),
              ],
            ),
          ),
        )).toList(),
      ),
    );
  }
}

class _GameData {
  final String name, desc, emoji, difficulty;
  final Color color;
  const _GameData({required this.name, required this.desc, required this.emoji, required this.color, required this.difficulty});
}

final _games = [
  _GameData(name: 'تحدي الرياضيات', desc: 'حل معادلات بسرعة', emoji: '🔢', color: AppColors.math, difficulty: 'متوسط'),
  _GameData(name: 'مغامرة الكلمات', desc: 'اكتشف المرادفات', emoji: '📝', color: AppColors.arabic, difficulty: 'سهل'),
  _GameData(name: 'مختبر العلوم', desc: 'تجارب افتراضية', emoji: '🧪', color: AppColors.chemistry, difficulty: 'صعب'),
  _GameData(name: 'سباق المعرفة', desc: 'أسئلة متنوعة', emoji: '🏁', color: AppColors.accent, difficulty: 'متوسط'),
  _GameData(name: 'لغز البرمجة', desc: 'حل ألغاز برمجية', emoji: '💻', color: AppColors.computerScience, difficulty: 'صعب'),
  _GameData(name: 'خريطة التاريخ', desc: 'اكتشف الأحداث', emoji: '🗺️', color: AppColors.english, difficulty: 'سهل'),
];
