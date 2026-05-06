import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/routing/route_names.dart';
import '../../../auth/providers/auth_provider.dart';

/// Language state provider
final languageProvider = StateProvider<String>((ref) => 'ar');

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentLang = ref.watch(languageProvider);
    final isArabic = currentLang == 'ar';

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
                // Header
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
                    const Text('الإعدادات ⚙️', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white)),
                  ],
                ),
                const SizedBox(height: 24),

                // Profile card
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: AppColors.heroGradient,
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(color: const Color(0xFF10B981).withOpacity(0.15)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 56, height: 56,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: const LinearGradient(colors: [Color(0xFF0D9488), Color(0xFF10B981)]),
                          border: Border.all(color: Colors.white.withOpacity(0.2), width: 2),
                        ),
                        child: const Center(child: Text('أ', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Colors.white))),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('أحمد محمد', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 18)),
                            const SizedBox(height: 2),
                            Text('student@school.com', style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 12)),
                            const SizedBox(height: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                              decoration: BoxDecoration(
                                color: const Color(0xFF10B981).withOpacity(0.15),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Text('🎓 طالب', style: TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.w700)),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // ═════════════════════════
                // LANGUAGE TOGGLE
                // ═════════════════════════
                const Text('اللغة / Language', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Colors.white)),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: AppColors.cardDark,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.borderDark),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: () => ref.read(languageProvider.notifier).state = 'ar',
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 300),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            decoration: BoxDecoration(
                              color: isArabic ? const Color(0xFF10B981).withOpacity(0.15) : Colors.transparent,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: isArabic ? const Color(0xFF10B981).withOpacity(0.3) : Colors.transparent),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text('🇸🇦', style: TextStyle(fontSize: 18)),
                                const SizedBox(width: 8),
                                Text('العربية', style: TextStyle(
                                  color: isArabic ? const Color(0xFF10B981) : Colors.white.withOpacity(0.4),
                                  fontWeight: isArabic ? FontWeight.w800 : FontWeight.w500,
                                  fontSize: 14,
                                )),
                              ],
                            ),
                          ),
                        ),
                      ),
                      Expanded(
                        child: GestureDetector(
                          onTap: () => ref.read(languageProvider.notifier).state = 'en',
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 300),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            decoration: BoxDecoration(
                              color: !isArabic ? const Color(0xFF3B82F6).withOpacity(0.15) : Colors.transparent,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: !isArabic ? const Color(0xFF3B82F6).withOpacity(0.3) : Colors.transparent),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text('🇺🇸', style: TextStyle(fontSize: 18)),
                                const SizedBox(width: 8),
                                Text('English', style: TextStyle(
                                  color: !isArabic ? const Color(0xFF3B82F6) : Colors.white.withOpacity(0.4),
                                  fontWeight: !isArabic ? FontWeight.w800 : FontWeight.w500,
                                  fontSize: 14,
                                )),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // ═════════════════════════
                // GENERAL SETTINGS
                // ═════════════════════════
                const Text('عام', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Colors.white)),
                const SizedBox(height: 10),
                _SettingsTile(icon: Icons.person_outline_rounded, title: 'تعديل الملف الشخصي', color: const Color(0xFF10B981)),
                _SettingsTile(icon: Icons.dark_mode_rounded, title: 'الوضع الداكن', color: const Color(0xFF3B82F6), hasSwitch: true, switchValue: true),
                _SettingsTile(icon: Icons.notifications_outlined, title: 'الإشعارات', color: const Color(0xFFFBBF24), hasSwitch: true, switchValue: true),
                _SettingsTile(icon: Icons.lock_outline_rounded, title: 'تغيير كلمة المرور', color: const Color(0xFFA855F7)),
                const SizedBox(height: 24),

                // ═════════════════════════
                // SUPPORT
                // ═════════════════════════
                const Text('الدعم', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Colors.white)),
                const SizedBox(height: 10),
                _SettingsTile(icon: Icons.help_outline_rounded, title: 'مركز المساعدة', color: const Color(0xFF06B6D4)),
                _SettingsTile(icon: Icons.info_outline_rounded, title: 'حول التطبيق', color: const Color(0xFF6B7280)),
                _SettingsTile(icon: Icons.privacy_tip_outlined, title: 'سياسة الخصوصية', color: const Color(0xFF0D9488)),
                const SizedBox(height: 24),

                // Logout
                GestureDetector(
                  onTap: () async {
                    await ref.read(authProvider.notifier).logout();
                    if (context.mounted) context.go(RouteNames.login);
                  },
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
                const SizedBox(height: 16),
                Center(child: Text('Nexus EDU v1.0.0 — Hassan Issa', style: TextStyle(fontSize: 10, color: Colors.white.withOpacity(0.15)))),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _SettingsTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final Color color;
  final bool hasSwitch;
  final bool switchValue;

  const _SettingsTile({
    required this.icon,
    required this.title,
    required this.color,
    this.hasSwitch = false,
    this.switchValue = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
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
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 14),
          Expanded(child: Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: Colors.white))),
          if (hasSwitch)
            Switch(
              value: switchValue,
              onChanged: (_) {},
              activeColor: const Color(0xFF10B981),
            )
          else
            Icon(Icons.arrow_forward_ios_rounded, color: Colors.white.withOpacity(0.15), size: 14),
        ],
      ),
    );
  }
}
