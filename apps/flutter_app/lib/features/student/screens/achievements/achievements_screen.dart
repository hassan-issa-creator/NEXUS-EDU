import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import 'package:go_router/go_router.dart';

/// Achievements Screen — badges, XP progress, milestones
class AchievementsScreen extends StatelessWidget {
  const AchievementsScreen({super.key});

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
                // Header
                Row(
                  children: [
                    GestureDetector(
                      onTap: () => context.pop(),
                      child: Container(
                        width: 44, height: 44,
                        decoration: BoxDecoration(color: Colors.white.withOpacity(0.05), borderRadius: BorderRadius.circular(14)),
                        child: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 18),
                      ),
                    ),
                    const SizedBox(width: 14),
                    const Text('إنجازاتي 🏆', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white)),
                  ],
                ),
                const SizedBox(height: 24),

                // XP Progress Card
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [Color(0xFF1E3A5F), Color(0xFF0D1B2A)]),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: const Color(0xFFFBBF24).withOpacity(0.2)),
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('المستوى الحالي', style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 12)),
                              const SizedBox(height: 4),
                              ShaderMask(
                                shaderCallback: (b) => const LinearGradient(colors: [Color(0xFFFBBF24), Color(0xFFF59E0B)]).createShader(b),
                                child: const Text('المستوى الذهبي ⭐', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Colors.white)),
                              ),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFBBF24).withOpacity(0.12),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: const Text('1,250\nXP', style: TextStyle(color: Color(0xFFFBBF24), fontSize: 16, fontWeight: FontWeight.w900, height: 1.2), textAlign: TextAlign.center),
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('التقدم للمستوى التالي', style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 11)),
                          Text('1,250 / 2,000 XP', style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 11, fontWeight: FontWeight.w700)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(6),
                        child: LinearProgressIndicator(
                          value: 0.625,
                          backgroundColor: Colors.white.withOpacity(0.06),
                          valueColor: const AlwaysStoppedAnimation(Color(0xFFFBBF24)),
                          minHeight: 8,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Badges Grid
                const Text('الأوسمة المكتسبة', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white)),
                const SizedBox(height: 12),
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 3,
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                  childAspectRatio: 0.85,
                  children: const [
                    _BadgeCard(emoji: '🏆', title: 'المتفوق', subtitle: '5 واجبات متتالية', isEarned: true, color: Color(0xFFFBBF24)),
                    _BadgeCard(emoji: '🔥', title: 'نشيط', subtitle: '7 أيام حضور', isEarned: true, color: Color(0xFFEF4444)),
                    _BadgeCard(emoji: '⚡', title: 'سريع', subtitle: 'أول من يسلم', isEarned: true, color: Color(0xFF3B82F6)),
                    _BadgeCard(emoji: '🌟', title: 'نجم المادة', subtitle: 'A+ في مادة', isEarned: true, color: Color(0xFF10B981)),
                    _BadgeCard(emoji: '📚', title: 'قارئ', subtitle: '20 درس مكتمل', isEarned: true, color: Color(0xFFA855F7)),
                    _BadgeCard(emoji: '🎯', title: 'دقيق', subtitle: '90%+ في اختبار', isEarned: true, color: Color(0xFF0D9488)),
                    _BadgeCard(emoji: '💎', title: 'ماسي', subtitle: '2000 XP', isEarned: false, color: Color(0xFF6B7280)),
                    _BadgeCard(emoji: '🦅', title: 'المنافس', subtitle: 'Top 3', isEarned: false, color: Color(0xFF6B7280)),
                    _BadgeCard(emoji: '👑', title: 'الملك', subtitle: '#1 في الترتيب', isEarned: false, color: Color(0xFF6B7280)),
                  ],
                ),
                const SizedBox(height: 24),

                // Daily Challenge
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [Color(0xFF7C3AED), Color(0xFFA855F7)]),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Column(
                    children: [
                      const Text('التحدي اليومي 🎮', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900)),
                      const SizedBox(height: 8),
                      Text('حل 5 أسئلة في الرياضيات واحصل على 50 XP!', style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 13)),
                      const SizedBox(height: 14),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14)),
                        child: const Text('ابدأ التحدي', style: TextStyle(color: Color(0xFF7C3AED), fontSize: 14, fontWeight: FontWeight.w800), textAlign: TextAlign.center),
                      ),
                    ],
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

class _BadgeCard extends StatelessWidget {
  final String emoji, title, subtitle;
  final bool isEarned;
  final Color color;
  const _BadgeCard({required this.emoji, required this.title, required this.subtitle, required this.isEarned, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isEarned ? color.withOpacity(0.08) : Colors.white.withOpacity(0.02),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isEarned ? color.withOpacity(0.2) : Colors.white.withOpacity(0.04)),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(emoji, style: TextStyle(fontSize: 28, color: isEarned ? null : Colors.grey)),
          const SizedBox(height: 6),
          Text(title, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: isEarned ? Colors.white : Colors.white.withOpacity(0.2))),
          const SizedBox(height: 2),
          Text(subtitle, style: TextStyle(fontSize: 8, color: isEarned ? Colors.white.withOpacity(0.4) : Colors.white.withOpacity(0.1)), textAlign: TextAlign.center),
        ],
      ),
    );
  }
}
