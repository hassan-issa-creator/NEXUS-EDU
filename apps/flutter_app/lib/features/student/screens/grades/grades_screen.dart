import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class GradesScreen extends StatelessWidget {
  const GradesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('الدرجات')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // GPA Card
            Container(
              width: double.infinity, padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(gradient: AppColors.primaryGradient, borderRadius: BorderRadius.circular(20)),
              child: Column(
                children: [
                  Text('المعدل التراكمي', style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 14)),
                  const SizedBox(height: 8),
                  const Text('3.7 / 4.0', style: TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.w900)),
                  const SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(8)),
                    child: const Text('ممتاز 🌟', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            const Text('درجات المواد', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
            const SizedBox(height: 12),
            ..._grades.map((g) => Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border.withOpacity(0.5)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 44, height: 44,
                    decoration: BoxDecoration(color: g.color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                    child: Center(child: Text(g.emoji, style: const TextStyle(fontSize: 22))),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(g.name, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                        const SizedBox(height: 4),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: LinearProgressIndicator(
                            value: g.score / 100, backgroundColor: AppColors.border,
                            valueColor: AlwaysStoppedAnimation(g.color), minHeight: 6,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text('${g.score}%', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: g.color)),
                      Text(g.grade, style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                    ],
                  ),
                ],
              ),
            )),
          ],
        ),
      ),
    );
  }
}

class _GradeData {
  final String name, grade, emoji;
  final int score;
  final Color color;
  const _GradeData({required this.name, required this.score, required this.grade, required this.color, required this.emoji});
}

final _grades = [
  _GradeData(name: 'الرياضيات', score: 92, grade: 'A', color: AppColors.math, emoji: '📐'),
  _GradeData(name: 'الفيزياء', score: 88, grade: 'B+', color: AppColors.physics, emoji: '⚡'),
  _GradeData(name: 'الكيمياء', score: 85, grade: 'B+', color: AppColors.chemistry, emoji: '🧪'),
  _GradeData(name: 'اللغة العربية', score: 95, grade: 'A+', color: AppColors.arabic, emoji: '📝'),
  _GradeData(name: 'اللغة الإنجليزية', score: 87, grade: 'B+', color: AppColors.english, emoji: '🌍'),
  _GradeData(name: 'علوم الحاسب', score: 93, grade: 'A', color: AppColors.computerScience, emoji: '💻'),
];
