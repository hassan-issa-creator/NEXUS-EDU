import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/routing/route_names.dart';

/// Course Details Screen — lessons, progress, quiz access
class CourseDetailsScreen extends StatelessWidget {
  final String courseName;
  final Color courseColor;
  final IconData courseIcon;
  final String teacher;
  final int progress;
  final String grade;

  const CourseDetailsScreen({
    super.key,
    this.courseName = 'الرياضيات',
    this.courseColor = const Color(0xFF10B981),
    this.courseIcon = Icons.calculate_rounded,
    this.teacher = 'أ. أحمد علي',
    this.progress = 75,
    this.grade = 'A-',
  });

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: AppColors.backgroundDark,
        body: SafeArea(
          bottom: false,
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 100),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Back + Title
                Row(
                  children: [
                    GestureDetector(
                      onTap: () => context.pop(),
                      child: Container(
                        width: 44, height: 44,
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.05),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 18),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Text(courseName, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white)),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Course Hero Card
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [courseColor.withOpacity(0.25), courseColor.withOpacity(0.05)],
                      begin: Alignment.topLeft, end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: courseColor.withOpacity(0.2)),
                  ),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: courseColor.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(18),
                            ),
                            child: Icon(courseIcon, color: courseColor, size: 36),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(courseName, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Colors.white)),
                                const SizedBox(height: 4),
                                Text('المعلم: $teacher', style: TextStyle(fontSize: 13, color: Colors.white.withOpacity(0.5))),
                                const SizedBox(height: 4),
                                Text('الدرجة: $grade', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: courseColor)),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      // Progress bar
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('التقدم في المادة', style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.5))),
                              Text('$progress%', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: courseColor)),
                            ],
                          ),
                          const SizedBox(height: 8),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(6),
                            child: LinearProgressIndicator(
                              value: progress / 100,
                              backgroundColor: Colors.white.withOpacity(0.06),
                              valueColor: AlwaysStoppedAnimation(courseColor),
                              minHeight: 8,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Quick Stats
                Row(
                  children: [
                    Expanded(child: _MiniStat(icon: Icons.video_library_rounded, label: 'الدروس', value: '12', color: const Color(0xFF3B82F6))),
                    const SizedBox(width: 10),
                    Expanded(child: _MiniStat(icon: Icons.assignment_rounded, label: 'الواجبات', value: '5', color: const Color(0xFFFBBF24))),
                    const SizedBox(width: 10),
                    Expanded(child: _MiniStat(icon: Icons.quiz_rounded, label: 'الاختبارات', value: '3', color: const Color(0xFFA855F7))),
                  ],
                ),
                const SizedBox(height: 24),

                // Lessons List
                const Text('الدروس 📚', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white)),
                const SizedBox(height: 12),
                ...List.generate(6, (i) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: _LessonTile(
                    index: i + 1,
                    title: _lessonNames[i],
                    duration: '${15 + i * 5} دقيقة',
                    isCompleted: i < 3,
                    isCurrent: i == 3,
                    color: courseColor,
                  ),
                )),
                const SizedBox(height: 24),

                // Start Quiz Button
                GestureDetector(
                  onTap: () => context.push(RouteNames.studentQuiz),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 18),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(colors: [courseColor, courseColor.withOpacity(0.7)]),
                      borderRadius: BorderRadius.circular(18),
                      boxShadow: [BoxShadow(color: courseColor.withOpacity(0.3), blurRadius: 16, offset: const Offset(0, 6))],
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.play_arrow_rounded, color: Colors.white, size: 24),
                        SizedBox(width: 8),
                        Text('ابدأ الاختبار', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

final List<String> _lessonNames = [
  'مقدمة في المعادلات',
  'المعادلات الخطية',
  'المعادلات التربيعية',
  'كثيرات الحدود',
  'التفاضل والتكامل',
  'تمارين شاملة',
];

class _MiniStat extends StatelessWidget {
  final IconData icon;
  final String label, value;
  final Color color;
  const _MiniStat({required this.icon, required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.06),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.1)),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 22),
          const SizedBox(height: 8),
          Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: color)),
          const SizedBox(height: 2),
          Text(label, style: TextStyle(fontSize: 10, color: Colors.white.withOpacity(0.4))),
        ],
      ),
    );
  }
}

class _LessonTile extends StatelessWidget {
  final int index;
  final String title, duration;
  final bool isCompleted, isCurrent;
  final Color color;
  const _LessonTile({required this.index, required this.title, required this.duration, required this.isCompleted, required this.isCurrent, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isCurrent ? color.withOpacity(0.08) : AppColors.cardDark,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isCurrent ? color.withOpacity(0.3) : AppColors.borderDark),
      ),
      child: Row(
        children: [
          Container(
            width: 40, height: 40,
            decoration: BoxDecoration(
              color: isCompleted ? color.withOpacity(0.15) : Colors.white.withOpacity(0.04),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Center(
              child: isCompleted
                  ? Icon(Icons.check_circle_rounded, color: color, size: 22)
                  : Text('$index', style: TextStyle(fontWeight: FontWeight.w800, color: isCurrent ? color : Colors.white.withOpacity(0.3))),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: isCurrent ? Colors.white : Colors.white.withOpacity(0.7))),
                const SizedBox(height: 2),
                Text(duration, style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.35))),
              ],
            ),
          ),
          if (isCurrent)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(10)),
              child: const Text('تابع', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700)),
            ),
          if (isCompleted)
            Icon(Icons.play_circle_outline_rounded, color: Colors.white.withOpacity(0.2), size: 22),
        ],
      ),
    );
  }
}
