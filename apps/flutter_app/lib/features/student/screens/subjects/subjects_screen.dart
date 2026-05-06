import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class SubjectsScreen extends StatelessWidget {
  const SubjectsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('المواد الدراسية')),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _subjects.length,
        itemBuilder: (context, index) {
          final subject = _subjects[index];
          final color = subject.color;
          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.border.withOpacity(0.5)),
              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8, offset: const Offset(0, 2))],
            ),
            child: Row(
              children: [
                Container(
                  width: 56, height: 56,
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Center(child: Text(subject.emoji, style: const TextStyle(fontSize: 28))),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(subject.name, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                      const SizedBox(height: 4),
                      Text('المعلم: ${subject.teacher}', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Expanded(
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(4),
                              child: LinearProgressIndicator(
                                value: subject.progress / 100, backgroundColor: AppColors.border,
                                valueColor: AlwaysStoppedAnimation(color), minHeight: 6,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text('${subject.progress}%', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12, color: color)),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Column(
                  children: [
                    Text(subject.grade, style: TextStyle(fontWeight: FontWeight.w900, fontSize: 20, color: AppColors.primary)),
                    const SizedBox(height: 2),
                    Text('${subject.lessons} دروس', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                  ],
                ),
                const SizedBox(width: 4),
                Icon(Icons.chevron_left_rounded, color: AppColors.textHint),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _SubjectData {
  final String name, teacher, grade, lessons, emoji;
  final int progress;
  final Color color;
  const _SubjectData({required this.name, required this.teacher, required this.grade, required this.lessons, required this.progress, required this.color, required this.emoji});
}

final _subjects = [
  _SubjectData(name: 'الرياضيات', teacher: 'أ. أحمد علي', progress: 75, grade: 'A-', lessons: '15/20', color: AppColors.math, emoji: '📐'),
  _SubjectData(name: 'الفيزياء', teacher: 'د. سارة محمد', progress: 60, grade: 'B+', lessons: '12/20', color: AppColors.physics, emoji: '⚡'),
  _SubjectData(name: 'الكيمياء', teacher: 'أ. حسن خالد', progress: 80, grade: 'A', lessons: '16/20', color: AppColors.chemistry, emoji: '🧪'),
  _SubjectData(name: 'اللغة العربية', teacher: 'أ. فاطمة إبراهيم', progress: 90, grade: 'A', lessons: '18/20', color: AppColors.arabic, emoji: '📝'),
  _SubjectData(name: 'اللغة الإنجليزية', teacher: 'Mr. John', progress: 70, grade: 'B+', lessons: '14/20', color: AppColors.english, emoji: '🌍'),
  _SubjectData(name: 'علوم الحاسب', teacher: 'م. نور حسن', progress: 85, grade: 'A', lessons: '17/20', color: AppColors.computerScience, emoji: '💻'),
];
