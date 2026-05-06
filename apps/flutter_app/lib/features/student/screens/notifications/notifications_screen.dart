import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import 'package:go_router/go_router.dart';

/// Notifications Screen
class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: AppColors.backgroundDark,
        body: SafeArea(
          bottom: false,
          child: Column(
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
                child: Row(
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
                    const Text('الإشعارات', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white)),
                    const Spacer(),
                    TextButton(
                      onPressed: () {},
                      child: const Text('مسح الكل', style: TextStyle(color: Color(0xFF10B981), fontSize: 12, fontWeight: FontWeight.w600)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Notifications List
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.fromLTRB(20, 0, 20, 100),
                  physics: const BouncingScrollPhysics(),
                  itemCount: _notifications.length,
                  itemBuilder: (_, i) => _NotificationTile(notification: _notifications[i]),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NotifData {
  final IconData icon;
  final Color color;
  final String title, body, time;
  final bool isNew;
  const _NotifData({required this.icon, required this.color, required this.title, required this.body, required this.time, this.isNew = false});
}

final List<_NotifData> _notifications = [
  _NotifData(icon: Icons.assignment_turned_in_rounded, color: const Color(0xFF10B981), title: 'واجب جديد', body: 'تم إضافة واجب جديد في مادة الرياضيات — المعادلات التربيعية', time: 'منذ 5 دقائق', isNew: true),
  _NotifData(icon: Icons.emoji_events_rounded, color: const Color(0xFFFBBF24), title: 'إنجاز جديد! 🏆', body: 'مبروك! حصلت على وسام "المتفوق" لتسليمك 5 واجبات متتالية', time: 'منذ ساعة', isNew: true),
  _NotifData(icon: Icons.quiz_rounded, color: const Color(0xFFA855F7), title: 'اختبار غداً', body: 'تذكير: اختبار الفيزياء — الحركة والقوة، غداً الساعة 10 صباحاً', time: 'منذ 3 ساعات', isNew: true),
  _NotifData(icon: Icons.trending_up_rounded, color: const Color(0xFF3B82F6), title: 'تحديث الدرجات', body: 'تم تحديث درجتك في الكيمياء إلى A — ممتاز!', time: 'أمس'),
  _NotifData(icon: Icons.calendar_today_rounded, color: const Color(0xFFEF4444), title: 'تغيير في الجدول', body: 'تم تعديل موعد حصة اللغة الإنجليزية ليوم الخميس', time: 'قبل يومين'),
  _NotifData(icon: Icons.smart_toy_rounded, color: const Color(0xFF7C3AED), title: 'نصيحة AI', body: 'بناءً على أدائك، ننصحك بمراجعة الفصل الثالث في الفيزياء', time: 'قبل 3 أيام'),
  _NotifData(icon: Icons.group_rounded, color: const Color(0xFF0D9488), title: 'رسالة من المعلم', body: 'أ. أحمد: أحسنتم في الاختبار الأخير، استمروا!', time: 'قبل 4 أيام'),
];

class _NotificationTile extends StatelessWidget {
  final _NotifData notification;
  const _NotificationTile({required this.notification});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: notification.isNew ? notification.color.withOpacity(0.05) : AppColors.cardDark,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: notification.isNew ? notification.color.withOpacity(0.15) : AppColors.borderDark),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: notification.color.withOpacity(0.12), borderRadius: BorderRadius.circular(12)),
            child: Icon(notification.icon, color: notification.color, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(child: Text(notification.title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: Colors.white))),
                    if (notification.isNew)
                      Container(
                        width: 8, height: 8,
                        decoration: BoxDecoration(shape: BoxShape.circle, color: notification.color),
                      ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(notification.body, style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.5), height: 1.4)),
                const SizedBox(height: 6),
                Text(notification.time, style: TextStyle(fontSize: 10, color: Colors.white.withOpacity(0.25))),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
