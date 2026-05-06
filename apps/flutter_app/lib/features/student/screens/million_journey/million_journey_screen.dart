import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/constants/app_colors.dart';

class MillionJourneyScreen extends StatefulWidget {
  const MillionJourneyScreen({super.key});

  @override
  State<MillionJourneyScreen> createState() => _MillionJourneyScreenState();
}

class _MillionJourneyScreenState extends State<MillionJourneyScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _progressAnim;

  final int _currentPoints = 2700;
  final int _targetPoints = 10000;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    );
    _progressAnim = Tween<double>(begin: 0.0, end: _currentPoints / _targetPoints).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic),
    );
    Future.delayed(const Duration(milliseconds: 400), () => _controller.forward());
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: AppColors.backgroundDark,
        body: SafeArea(
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 40),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── Header ─────────────────────────────
                Row(
                  children: [
                    GestureDetector(
                      onTap: () => Navigator.pop(context),
                      child: Container(
                        width: 40, height: 40,
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.06),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: Colors.white.withOpacity(0.06)),
                        ),
                        child: Icon(Icons.arrow_forward_ios_rounded, color: Colors.white.withOpacity(0.7), size: 16),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('رحلة المليون 🌟', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Colors.white)),
                        Text('اكسب نقاطك وحقق الجائزة الكبرى', style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.4))),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // ── Hero Points Card ─────────────────────────────
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(28),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(28),
                    gradient: const LinearGradient(
                      begin: Alignment.topRight,
                      end: Alignment.bottomLeft,
                      colors: [Color(0xFF4338CA), Color(0xFF7C3AED), Color(0xFFDB2777)],
                    ),
                    boxShadow: [
                      BoxShadow(color: const Color(0xFF7C3AED).withOpacity(0.5), blurRadius: 30, offset: const Offset(0, 12)),
                    ],
                  ),
                  child: Column(
                    children: [
                      // Trophy + Points
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Text('🏆', style: TextStyle(fontSize: 52)),
                          const SizedBox(width: 16),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('نقاطك الحالية', style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 13, fontWeight: FontWeight.w600)),
                              const SizedBox(height: 4),
                              AnimatedBuilder(
                                animation: _progressAnim,
                                builder: (context, _) => Text(
                                  '${(_currentPoints * _progressAnim.value / (_currentPoints / _targetPoints)).round().clamp(0, _currentPoints).toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')}',
                                  style: const TextStyle(fontSize: 42, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: -1),
                                ),
                              ),
                              Text('/ $_targetPoints نقطة', style: TextStyle(fontSize: 13, color: Colors.white.withOpacity(0.55))),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),

                      // Progress Bar
                      Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('${(_currentPoints / _targetPoints * 100).toStringAsFixed(1)}% نحو جائزة المليون 🎯',
                                  style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 12, fontWeight: FontWeight.w700)),
                              Text('${(_targetPoints - _currentPoints).toString()} نقطة متبقية',
                                  style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 11)),
                            ],
                          ),
                          const SizedBox(height: 10),
                          AnimatedBuilder(
                            animation: _progressAnim,
                            builder: (context, _) => ClipRRect(
                              borderRadius: BorderRadius.circular(6),
                              child: Stack(
                                children: [
                                  Container(height: 12, width: double.infinity, color: Colors.white.withOpacity(0.12)),
                                  FractionallySizedBox(
                                    widthFactor: _progressAnim.value,
                                    child: Container(
                                      height: 12,
                                      decoration: const BoxDecoration(
                                        gradient: LinearGradient(colors: [Color(0xFFFBBF24), Color(0xFFF59E0B)]),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // Quick Stats Row
                      Row(
                        children: [
                          _QuickStat(value: '12', label: 'يوم streak', icon: '🔥'),
                          Container(width: 1, height: 40, color: Colors.white.withOpacity(0.1)),
                          _QuickStat(value: '#3', label: 'الترتيب', icon: '🏅'),
                          Container(width: 1, height: 40, color: Colors.white.withOpacity(0.1)),
                          _QuickStat(value: '5', label: 'المستوى', icon: '⚡'),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 28),

                // ── How to Earn ─────────────────────────────
                _SectionTitle(title: 'كيف تكسب النقاط؟', icon: Icons.lightbulb_rounded, color: const Color(0xFFFBBF24)),
                const SizedBox(height: 14),
                SizedBox(
                  height: 102,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    physics: const BouncingScrollPhysics(),
                    children: const [
                      _EarnCard(emoji: '📝', title: 'واجب يومي', points: '+20', color: Color(0xFF10B981)),
                      SizedBox(width: 10),
                      _EarnCard(emoji: '🎯', title: 'تحدي اليوم', points: '+150', color: Color(0xFF6366F1)),
                      SizedBox(width: 10),
                      _EarnCard(emoji: '⭐', title: 'درجة A+', points: '+100', color: Color(0xFFFBBF24)),
                      SizedBox(width: 10),
                      _EarnCard(emoji: '✅', title: 'حضور يومي', points: '+10', color: Color(0xFF3B82F6)),
                      SizedBox(width: 10),
                      _EarnCard(emoji: '🏆', title: 'المركز الأول', points: '+500', color: Color(0xFFEC4899)),
                    ],
                  ),
                ),
                const SizedBox(height: 28),

                // ── Milestones ─────────────────────────────
                _SectionTitle(title: 'مراحل رحلة المليون', icon: Icons.flag_rounded, color: const Color(0xFF10B981)),
                const SizedBox(height: 14),
                ..._milestones.map((m) => _MilestoneCard(milestone: m, currentPoints: _currentPoints)),
                const SizedBox(height: 28),

                // ── Achievements ─────────────────────────────
                _SectionTitle(title: 'شاراتي المكتسبة', icon: Icons.workspace_premium_rounded, color: const Color(0xFFA855F7)),
                const SizedBox(height: 14),
                Wrap(
                  spacing: 10, runSpacing: 10,
                  children: const [
                    _Badge(emoji: '🌟', title: 'المبتدئ', color: Color(0xFF10B981)),
                    _Badge(emoji: '⚡', title: 'النشيط', color: Color(0xFF3B82F6)),
                    _Badge(emoji: '🎓', title: 'النجم', color: Color(0xFFFBBF24)),
                    _Badge(emoji: '🏅', title: 'المتفوق', color: Color(0xFFA855F7)),
                    _Badge(emoji: '🔒', title: 'البطل', color: Color(0xFF374151), locked: true),
                    _Badge(emoji: '🔒', title: 'الأسطورة', color: Color(0xFF374151), locked: true),
                  ],
                ),
                const SizedBox(height: 28),

                // ── Grand Prize Banner ─────────────────────────────
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(24),
                    gradient: const LinearGradient(
                      colors: [Color(0xFF78350F), Color(0xFF92400E), Color(0xFFB45309)],
                      begin: Alignment.topRight, end: Alignment.bottomLeft,
                    ),
                    border: Border.all(color: const Color(0xFFFBBF24).withOpacity(0.3)),
                    boxShadow: [BoxShadow(color: const Color(0xFFF59E0B).withOpacity(0.3), blurRadius: 20, offset: const Offset(0, 8))],
                  ),
                  child: Column(
                    children: [
                      const Text('🎁', style: TextStyle(fontSize: 44)),
                      const SizedBox(height: 12),
                      const Text('جائزة المليون ريال 🏆', style: TextStyle(color: Color(0xFFFBBF24), fontSize: 22, fontWeight: FontWeight.w900), textAlign: TextAlign.center),
                      const SizedBox(height: 8),
                      Text(
                        'أكمل رحلتك، تصدّر المرتبة الأولى، واحصل على الجائزة الكبرى في نهاية الفصل الدراسي!',
                        style: TextStyle(color: Colors.white.withOpacity(0.75), fontSize: 13, height: 1.6),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      GestureDetector(
                        onTap: () {
                          HapticFeedback.mediumImpact();
                          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                            content: Text('استمر في التقدم لتفوز بالجائزة! 🌟', style: TextStyle(fontWeight: FontWeight.w700)),
                            backgroundColor: Color(0xFFF59E0B),
                            behavior: SnackBarBehavior.floating,
                          ));
                        },
                        child: Container(
                          width: double.infinity,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFBBF24),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: const Text('تعرّف على شروط الجائزة', style: TextStyle(color: Color(0xFF78350F), fontSize: 14, fontWeight: FontWeight.w900), textAlign: TextAlign.center),
                        ),
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

// ══════════════════════════════════════
// WIDGETS
// ══════════════════════════════════════

class _SectionTitle extends StatelessWidget {
  final String title;
  final IconData icon;
  final Color color;
  const _SectionTitle({required this.title, required this.icon, required this.color});

  @override
  Widget build(BuildContext context) => Row(
    children: [
      Icon(icon, color: color, size: 20),
      const SizedBox(width: 8),
      Text(title, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900, color: Colors.white)),
    ],
  );
}

class _QuickStat extends StatelessWidget {
  final String value, label, icon;
  const _QuickStat({required this.value, required this.label, required this.icon});

  @override
  Widget build(BuildContext context) => Expanded(
    child: Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(icon, style: const TextStyle(fontSize: 18)),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white)),
        Text(label, style: TextStyle(fontSize: 10, color: Colors.white.withOpacity(0.5))),
      ],
    ),
  );
}

class _EarnCard extends StatelessWidget {
  final String emoji, title, points;
  final Color color;
  const _EarnCard({required this.emoji, required this.title, required this.points, required this.color});

  @override
  Widget build(BuildContext context) => Container(
    width: 100,
    padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(
      color: color.withOpacity(0.08),
      borderRadius: BorderRadius.circular(18),
      border: Border.all(color: color.withOpacity(0.2)),
    ),
    child: Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(emoji, style: const TextStyle(fontSize: 26)),
        const SizedBox(height: 6),
        Text(title, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white), textAlign: TextAlign.center),
        const SizedBox(height: 4),
        Text(points, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: color)),
      ],
    ),
  );
}

class _MilestoneCard extends StatelessWidget {
  final _MilestoneData milestone;
  final int currentPoints;
  const _MilestoneCard({required this.milestone, required this.currentPoints});

  @override
  Widget build(BuildContext context) {
    final isDone = currentPoints >= milestone.points;
    final isNext = !isDone && currentPoints >= milestone.points - 2000;
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDone
            ? const Color(0xFF10B981).withOpacity(0.06)
            : isNext
                ? const Color(0xFF6366F1).withOpacity(0.06)
                : Colors.white.withOpacity(0.03),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: isDone
              ? const Color(0xFF10B981).withOpacity(0.25)
              : isNext
                  ? const Color(0xFF6366F1).withOpacity(0.25)
                  : Colors.white.withOpacity(0.05),
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 46, height: 46,
            decoration: BoxDecoration(
              color: isDone ? const Color(0xFF10B981).withOpacity(0.15) : Colors.white.withOpacity(0.05),
              shape: BoxShape.circle,
              border: Border.all(
                color: isDone ? const Color(0xFF10B981).withOpacity(0.3) : Colors.white.withOpacity(0.08),
                width: isNext ? 2 : 1,
              ),
            ),
            child: Center(
              child: isDone
                  ? const Icon(Icons.check_rounded, color: Color(0xFF10B981), size: 22)
                  : Text(milestone.emoji, style: const TextStyle(fontSize: 22)),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(milestone.title, style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: isDone ? const Color(0xFF10B981) : Colors.white)),
                    if (isNext) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(color: const Color(0xFF6366F1).withOpacity(0.15), borderRadius: BorderRadius.circular(6)),
                        child: const Text('التالي 🎯', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: Color(0xFF818CF8))),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 2),
                Text(milestone.reward, style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.4))),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text('${milestone.points.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')} نقطة',
                style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: isDone ? const Color(0xFF10B981) : Colors.white.withOpacity(0.3)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _Badge extends StatelessWidget {
  final String emoji, title;
  final Color color;
  final bool locked;
  const _Badge({required this.emoji, required this.title, required this.color, this.locked = false});

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
    decoration: BoxDecoration(
      color: color.withOpacity(locked ? 0.05 : 0.1),
      borderRadius: BorderRadius.circular(16),
      border: Border.all(color: color.withOpacity(locked ? 0.1 : 0.25)),
    ),
    child: Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(emoji, style: TextStyle(fontSize: 18, color: locked ? Colors.white.withOpacity(0.2) : null)),
        const SizedBox(width: 8),
        Text(title, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: locked ? Colors.white.withOpacity(0.2) : color)),
      ],
    ),
  );
}

class _MilestoneData {
  final String title, reward, emoji;
  final int points;
  const _MilestoneData({required this.title, required this.reward, required this.points, required this.emoji});
}

final _milestones = [
  const _MilestoneData(title: 'البداية المميزة', reward: 'شارة المبتدئ 🌟', points: 100, emoji: '🌟'),
  const _MilestoneData(title: 'طالب نشيط', reward: 'شارة النشاط ⚡', points: 500, emoji: '⚡'),
  const _MilestoneData(title: 'نجم الفصل', reward: 'شارة التجر الذهبية 🎓', points: 1000, emoji: '🎓'),
  const _MilestoneData(title: 'متفوق أكاديمي', reward: 'شارة التفوق + 50 ر.س مكافأة', points: 2500, emoji: '🏅'),
  const _MilestoneData(title: 'بطل المليون', reward: 'شارة البطل + 200 ر.س جائزة', points: 5000, emoji: '🏆'),
  const _MilestoneData(title: 'أسطورة نِكْسُس', reward: 'جائزة المليون الكبرى 🎁', points: 10000, emoji: '👑'),
];
