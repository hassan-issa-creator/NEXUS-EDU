import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/routing/route_names.dart';
import 'package:go_router/go_router.dart';

/// Profile Screen — user info, stats, achievements, settings
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

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
              children: [
                // LOGO + Title
                Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(14),
                      child: Image.asset('assets/images/logo.jpeg', width: 44, height: 44, fit: BoxFit.cover),
                    ),
                    const SizedBox(width: 12),
                    const Text('الملف الشخصي', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white)),
                  ],
                ),
                const SizedBox(height: 30),

                // Avatar + Name
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(28),
                  decoration: BoxDecoration(
                    gradient: AppColors.heroGradient,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: const Color(0xFF10B981).withOpacity(0.15)),
                  ),
                  child: Column(
                    children: [
                      Container(
                        width: 90, height: 90,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: const LinearGradient(colors: [Color(0xFF0D9488), Color(0xFF10B981)]),
                          border: Border.all(color: Colors.white.withOpacity(0.2), width: 3),
                        ),
                        child: const Center(child: Text('أ', style: TextStyle(fontSize: 36, fontWeight: FontWeight.w900, color: Colors.white))),
                      ),
                      const SizedBox(height: 16),
                      const Text('أحمد محمد', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Colors.white)),
                      const SizedBox(height: 4),
                      Text('ahmed@nexus.edu.sa', style: TextStyle(fontSize: 13, color: Colors.white.withOpacity(0.4))),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFBBF24).withOpacity(0.15),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Text('🎓 طالب — المستوى الذهبي', style: TextStyle(color: Color(0xFFFBBF24), fontSize: 12, fontWeight: FontWeight.w700)),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Stats Row
                Row(
                  children: [
                    Expanded(child: _ProfileStat(value: '1,250', label: 'XP', icon: Icons.bolt_rounded, color: const Color(0xFFFBBF24))),
                    const SizedBox(width: 10),
                    Expanded(child: _ProfileStat(value: '#3', label: 'الترتيب', icon: Icons.emoji_events_rounded, color: const Color(0xFF10B981))),
                    const SizedBox(width: 10),
                    Expanded(child: _ProfileStat(value: '87%', label: 'المتوسط', icon: Icons.trending_up_rounded, color: const Color(0xFF3B82F6))),
                  ],
                ),
                const SizedBox(height: 24),

                // Menu Items
                _ProfileMenuItem(icon: Icons.workspace_premium_rounded, title: 'إنجازاتي', subtitle: '12 إنجاز', color: const Color(0xFFFBBF24),
                  onTap: () => context.push(RouteNames.studentAchievements)),
                _ProfileMenuItem(icon: Icons.assignment_rounded, title: 'واجباتي', subtitle: '3 واجبات معلقة', color: const Color(0xFF3B82F6),
                  onTap: () => context.go(RouteNames.studentAssignments)),
                _ProfileMenuItem(icon: Icons.bar_chart_rounded, title: 'درجاتي', subtitle: 'عرض التقارير', color: const Color(0xFF10B981),
                  onTap: () => context.push(RouteNames.studentGrades)),
                _ProfileMenuItem(icon: Icons.calendar_today_rounded, title: 'جدولي', subtitle: 'الجدول الدراسي', color: const Color(0xFFA855F7),
                  onTap: () => context.push(RouteNames.studentSchedule)),
                _ProfileMenuItem(icon: Icons.settings_rounded, title: 'الإعدادات', subtitle: 'حسابي والتفضيلات', color: const Color(0xFF6B7280),
                  onTap: () => context.go(RouteNames.studentSettings)),
                const SizedBox(height: 16),

                // Logout
                GestureDetector(
                  onTap: () => context.go(RouteNames.login),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEF4444).withOpacity(0.08),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFEF4444).withOpacity(0.15)),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.logout_rounded, color: Color(0xFFEF4444), size: 20),
                        SizedBox(width: 8),
                        Text('تسجيل الخروج', style: TextStyle(color: Color(0xFFEF4444), fontSize: 14, fontWeight: FontWeight.w700)),
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

class _ProfileStat extends StatelessWidget {
  final String value, label;
  final IconData icon;
  final Color color;
  const _ProfileStat({required this.value, required this.label, required this.icon, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 18),
      decoration: BoxDecoration(
        color: AppColors.cardDark,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.borderDark),
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

class _ProfileMenuItem extends StatelessWidget {
  final IconData icon;
  final String title, subtitle;
  final Color color;
  final VoidCallback? onTap;
  const _ProfileMenuItem({required this.icon, required this.title, required this.subtitle, required this.color, this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.cardDark,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.borderDark),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: Colors.white)),
                  const SizedBox(height: 2),
                  Text(subtitle, style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.35))),
                ],
              ),
            ),
            Icon(Icons.arrow_forward_ios_rounded, color: Colors.white.withOpacity(0.15), size: 16),
          ],
        ),
      ),
    );
  }
}
