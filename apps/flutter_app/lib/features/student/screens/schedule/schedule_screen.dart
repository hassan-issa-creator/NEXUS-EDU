import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class ScheduleScreen extends StatelessWidget {
  const ScheduleScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('الجدول الدراسي')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('اليوم - الثلاثاء', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
            const SizedBox(height: 16),
            ..._todaySchedule.asMap().entries.map((entry) {
              final i = entry.key;
              final s = entry.value;
              final isNow = i == 1;
              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isNow ? AppColors.primary.withOpacity(0.05) : Theme.of(context).colorScheme.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: isNow ? AppColors.primary : AppColors.border.withOpacity(0.5), width: isNow ? 2 : 1),
                ),
                child: Row(
                  children: [
                    Column(
                      children: [
                        Text(s.start, style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: isNow ? AppColors.primary : AppColors.textPrimary)),
                        Text(s.end, style: TextStyle(fontSize: 12, color: AppColors.textHint)),
                      ],
                    ),
                    Container(width: 1, height: 40, margin: const EdgeInsets.symmetric(horizontal: 14), color: AppColors.border),
                    Container(
                      width: 40, height: 40,
                      decoration: BoxDecoration(color: s.color.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
                      child: Center(child: Text(s.emoji, style: const TextStyle(fontSize: 20))),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(s.subject, style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: isNow ? AppColors.primary : AppColors.textPrimary)),
                          Text(s.room, style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                        ],
                      ),
                    ),
                    if (isNow)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(8)),
                        child: const Text('الآن', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700)),
                      ),
                  ],
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}

class _ScheduleItem {
  final String start, end, subject, room, emoji;
  final Color color;
  const _ScheduleItem({required this.start, required this.end, required this.subject, required this.room, required this.color, required this.emoji});
}

final _todaySchedule = [
  _ScheduleItem(start: '8:00', end: '8:45', subject: 'الرياضيات', room: 'قاعة 201', color: AppColors.math, emoji: '📐'),
  _ScheduleItem(start: '9:00', end: '9:45', subject: 'الفيزياء', room: 'معمل الفيزياء', color: AppColors.physics, emoji: '⚡'),
  _ScheduleItem(start: '10:00', end: '10:45', subject: 'اللغة العربية', room: 'قاعة 105', color: AppColors.arabic, emoji: '📝'),
  _ScheduleItem(start: '11:00', end: '11:30', subject: 'استراحة ☕', room: '', color: AppColors.textHint, emoji: '☕'),
  _ScheduleItem(start: '11:30', end: '12:15', subject: 'الكيمياء', room: 'معمل الكيمياء', color: AppColors.chemistry, emoji: '🧪'),
  _ScheduleItem(start: '12:30', end: '1:15', subject: 'علوم الحاسب', room: 'معمل الحاسب', color: AppColors.computerScience, emoji: '💻'),
];
