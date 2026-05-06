import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/routing/route_names.dart';

/// Student Dashboard - Premium dark UI with Full Navigation + Gamification
class StudentDashboard extends StatefulWidget {
  const StudentDashboard({super.key});

  @override
  State<StudentDashboard> createState() => _StudentDashboardState();
}

class _StudentDashboardState extends State<StudentDashboard>
    with TickerProviderStateMixin {
  bool _isRefreshing = false;
  late AnimationController _streakController;
  late Animation<double> _streakScale;
  late AnimationController _xpController;
  late Animation<double> _xpWidth;

  // Gamification data
  final int _streakDays = 12;
  final int _currentXP = 2450;
  final int _maxXP = 3000;
  final int _level = 5;

  @override
  void initState() {
    super.initState();
    _streakController = AnimationController(vsync: this, duration: const Duration(milliseconds: 600));
    _streakScale = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _streakController, curve: Curves.elasticOut),
    );
    _xpController = AnimationController(vsync: this, duration: const Duration(milliseconds: 1500));
    _xpWidth = Tween<double>(begin: 0.0, end: _currentXP / _maxXP).animate(
      CurvedAnimation(parent: _xpController, curve: Curves.easeOutCubic),
    );
    Future.delayed(const Duration(milliseconds: 300), () {
      _streakController.forward();
      _xpController.forward();
    });
  }

  @override
  void dispose() {
    _streakController.dispose();
    _xpController.dispose();
    super.dispose();
  }

  Future<void> _onRefresh() async {
    HapticFeedback.lightImpact();
    setState(() => _isRefreshing = true);
    await Future.delayed(const Duration(milliseconds: 1200));
    setState(() => _isRefreshing = false);
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: AppColors.backgroundDark,
        floatingActionButton: FloatingActionButton.extended(
          onPressed: () => context.go(RouteNames.studentAiTutor),
          backgroundColor: const Color(0xFFA855F7),
          icon: const Icon(Icons.psychology_alt_rounded, color: Colors.white),
          label: const Text('شريك المذاكرة الذكي ✨', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 13)),
        ),
        body: RefreshIndicator(
          onRefresh: _onRefresh,
          color: const Color(0xFF10B981),
          backgroundColor: const Color(0xFF1A2332),
          child: SafeArea(
          bottom: false,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 100),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ═══════════════════════════════════════
                // TOP BAR with Logo
                // ═══════════════════════════════════════
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(14),
                          child: Image.asset('assets/images/logo.jpeg', width: 44, height: 44, fit: BoxFit.cover),
                        ),
                        const SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('نِكْسُس', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white)),
                            Text('Nexus EDU', style: TextStyle(fontSize: 10, color: Colors.white.withOpacity(0.35), letterSpacing: 2)),
                          ],
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        GestureDetector(
                          onTap: () => context.push(RouteNames.studentNotifications),
                          child: _TopBarButton(icon: Icons.notifications_outlined, badge: 3),
                        ),
                        const SizedBox(width: 10),
                        GestureDetector(
                          onTap: () => context.go(RouteNames.studentSubjects),
                          child: _TopBarButton(icon: Icons.search_rounded),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // ═══════════════════════════════════════
                // WELCOME BANNER
                // ═══════════════════════════════════════
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    gradient: AppColors.heroGradient,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: const Color(0xFF10B981).withOpacity(0.15)),
                    boxShadow: [
                      BoxShadow(color: const Color(0xFF10B981).withOpacity(0.12), blurRadius: 30, offset: const Offset(0, 10)),
                    ],
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('أهلاً بك مجدداً! 👋', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: Colors.white)),
                            const SizedBox(height: 8),
                            Text(
                              'لديك 3 واجبات بانتظارك هذا الأسبوع',
                              style: TextStyle(fontSize: 14, color: Colors.white.withOpacity(0.7), height: 1.5),
                            ),
                            const SizedBox(height: 14),
                            GestureDetector(
                              onTap: () => context.push(RouteNames.studentAssignments),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.12),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text('🔥', style: TextStyle(fontSize: 14)),
                                    SizedBox(width: 6),
                                    Text('ابدأ الآن', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white)),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      // Rank badge → Leaderboard
                      GestureDetector(
                        onTap: () => context.go(RouteNames.studentLeaderboard),
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.08),
                            borderRadius: BorderRadius.circular(18),
                            border: Border.all(color: Colors.white.withOpacity(0.1)),
                          ),
                          child: Column(
                            children: [
                              Text('المركز', style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 11, fontWeight: FontWeight.w600)),
                              const SizedBox(height: 4),
                              ShaderMask(
                                shaderCallback: (b) => const LinearGradient(colors: [Color(0xFFFBBF24), Color(0xFFF59E0B)]).createShader(b),
                                child: const Text('#3', style: TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w900)),
                              ),
                              Text('من 32 طالب', style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 10)),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // ═══════════════════════════════════════
                // STREAK + XP BAR
                // ═══════════════════════════════════════
                Row(
                  children: [
                    // Streak Counter
                    ScaleTransition(
                      scale: _streakScale,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFEA580C).withOpacity(0.12),
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(color: const Color(0xFFEA580C).withOpacity(0.3)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Text('🔥', style: TextStyle(fontSize: 24)),
                            const SizedBox(width: 8),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text('$_streakDays', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white)),
                                Text('يوم متتالي', style: TextStyle(fontSize: 10, color: Colors.white.withOpacity(0.5))),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    // XP Progress Bar
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppColors.cardDark,
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(color: AppColors.borderDark),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(gradient: AppColors.primaryGradient, borderRadius: BorderRadius.circular(8)),
                                  child: Text('المستوى $_level', style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w800)),
                                ),
                                Text('$_currentXP / $_maxXP XP', style: TextStyle(fontSize: 10, color: Colors.white.withOpacity(0.4), fontWeight: FontWeight.w600)),
                              ],
                            ),
                            const SizedBox(height: 8),
                            ClipRRect(
                              borderRadius: BorderRadius.circular(4),
                              child: AnimatedBuilder(
                                animation: _xpWidth,
                                builder: (context, _) => Stack(
                                  children: [
                                    Container(height: 8, width: double.infinity, color: Colors.white.withOpacity(0.06)),
                                    FractionallySizedBox(
                                      widthFactor: _xpWidth.value,
                                      child: Container(
                                        height: 8,
                                        decoration: const BoxDecoration(
                                          gradient: LinearGradient(colors: [Color(0xFF10B981), Color(0xFF3B82F6)]),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text('${_maxXP - _currentXP} XP للمستوى التالي ⚡',
                                style: TextStyle(fontSize: 10, color: Colors.white.withOpacity(0.35))),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // ═══════════════════════════════════════
                // DAILY CHALLENGE CARD
                // ═══════════════════════════════════════
                GestureDetector(
                  onTap: () => context.go(RouteNames.studentAiTutor),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(22),
                      gradient: const LinearGradient(
                        begin: Alignment.topRight,
                        end: Alignment.bottomLeft,
                        colors: [Color(0xFF4338CA), Color(0xFF7C3AED), Color(0xFFDB2777)],
                      ),
                      boxShadow: [
                        BoxShadow(color: const Color(0xFF6D28D9).withOpacity(0.4), blurRadius: 20, offset: const Offset(0, 8)),
                      ],
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 52, height: 52,
                          decoration: BoxDecoration(color: Colors.white.withOpacity(0.15), borderRadius: BorderRadius.circular(16)),
                          child: const Center(child: Text('🎯', style: TextStyle(fontSize: 26))),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  const Text('تحدي اليوم', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w900)),
                                  const SizedBox(width: 8),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(8)),
                                    child: const Text('⚡ +150 XP', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w800)),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text('حل 5 أسئلة في الرياضيات لكسب نقاط مضاعفة!',
                                  style: TextStyle(color: Colors.white.withOpacity(0.75), fontSize: 12, height: 1.4)),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white.withOpacity(0.6), size: 16),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // ═══════════════════════════════════════
                // STATS GRID — all tappable
                // ═══════════════════════════════════════
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                  childAspectRatio: 1.55,
                  children: [
                    _StatCard(icon: Icons.menu_book_rounded, label: 'المواد المسجلة', value: '6', color: const Color(0xFF10B981), onTap: () => context.go(RouteNames.studentSubjects)),
                    _StatCard(icon: Icons.emoji_events_rounded, label: 'متوسط الدرجات', value: '87%', color: const Color(0xFFFBBF24), trend: '+5%', onTap: () => context.push(RouteNames.studentGrades)),
                    _StatCard(icon: Icons.calendar_today_rounded, label: 'نسبة الحضور', value: '92%', color: const Color(0xFF3B82F6), trend: '+2%', onTap: () => context.push(RouteNames.studentAttendance)),
                    _StatCard(icon: Icons.trending_up_rounded, label: 'التقدم الإجمالي', value: '76%', color: const Color(0xFFA855F7), trend: '+8%', onTap: () => context.push(RouteNames.studentAchievements)),
                  ],
                ),
                const SizedBox(height: 24),

                // ═══════════════════════════════════════
                // AI INSIGHTS
                // ═══════════════════════════════════════
                _SectionHeader(title: 'تحليلات NEXUS AI', icon: Icons.psychology_rounded, badge: 'AI ✨'),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: AppColors.cardDark,
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(color: AppColors.borderDark),
                  ),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Expanded(child: _InsightCard(icon: Icons.gps_fixed_rounded, iconColor: const Color(0xFFEF4444), title: 'الدرجة المتوقعة', value: '94%', subtitle: '+4% تحسن', subtitleColor: AppColors.success)),
                          const SizedBox(width: 10),
                          Expanded(child: _InsightCard(icon: Icons.bolt_rounded, iconColor: const Color(0xFFFBBF24), title: 'نقاط القوة', value: 'الرياضيات', subtitle: 'أداء ممتاز', subtitleColor: AppColors.success)),
                        ],
                      ),
                      const SizedBox(height: 12),
                      // AI Recommendation → AI Tutor
                      GestureDetector(
                        onTap: () => context.go(RouteNames.studentAiTutor),
                        child: Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(18),
                          decoration: BoxDecoration(
                            gradient: AppColors.primaryGradient,
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('توصية NEXUS اليوم 💡', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w800)),
                              const SizedBox(height: 8),
                              Text(
                                'راجع درس \"الحركة القوية\" في الفيزياء قبل اختبار الغد.',
                                style: TextStyle(color: Colors.white.withOpacity(0.85), fontSize: 13, height: 1.5),
                              ),
                              const SizedBox(height: 12),
                              Container(
                                width: double.infinity,
                                padding: const EdgeInsets.symmetric(vertical: 12),
                                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
                                child: const Text('ابدأ المراجعة الآن', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: Color(0xFF0D9488)), textAlign: TextAlign.center),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // ═══════════════════════════════════════
                // QUICK ACTIONS — all wired
                // ═══════════════════════════════════════
                const _SectionHeader(title: 'إجراءات سريعة', icon: Icons.flash_on_rounded),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(child: _QuickAction(icon: Icons.post_add_rounded, label: 'عذر\nطبي', color: const Color(0xFFEF4444), onTap: () => _showMedicalExcuseBottomSheet(context))),
                    const SizedBox(width: 10),
                    Expanded(child: _QuickAction(icon: Icons.assignment_turned_in_rounded, label: 'واجباتي', color: const Color(0xFF3B82F6), onTap: () => context.push(RouteNames.studentAssignments))),
                    const SizedBox(width: 10),
                    Expanded(child: _QuickAction(icon: Icons.account_tree_rounded, label: 'خريطة\nالمهارات', color: const Color(0xFFFBBF24), onTap: () => context.push('/student/leaderboard'))), // fallback to leaderboard for now
                    const SizedBox(width: 10),
                    Expanded(child: _QuickAction(icon: Icons.smart_toy_rounded, label: 'شريك\nالمذاكرة', color: const Color(0xFFA855F7), onTap: () => context.go(RouteNames.studentAiTutor))),
                  ],
                ),
                const SizedBox(height: 24),

                // ═══════════════════════════════════════
                // MY SUBJECTS — tappable cards
                // ═══════════════════════════════════════
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const _SectionHeader(title: 'موادي الدراسية', icon: Icons.menu_book_rounded),
                    TextButton(
                      onPressed: () => context.go(RouteNames.studentSubjects),
                      child: const Text('عرض الكل', style: TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.w700, fontSize: 12)),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                ...List.generate(
                  _subjects.length,
                  (i) => Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: GestureDetector(
                      onTap: () => context.push(RouteNames.studentCourseDetails),
                      child: _SubjectCard(subject: _subjects[i]),
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                // ═══════════════════════════════════════
                // PROMO BANNER with Image
                // ═══════════════════════════════════════
                ClipRRect(
                  borderRadius: BorderRadius.circular(22),
                  child: Stack(
                    children: [
                      Image.asset('assets/images/hero_banner.jpeg', width: double.infinity, height: 200, fit: BoxFit.cover),
                      Positioned.fill(
                        child: Container(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [Colors.transparent, Colors.black.withOpacity(0.7)],
                            ),
                          ),
                        ),
                      ),
                      Positioned(
                        bottom: 16, right: 16, left: 16,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('منصّةٌ وطنيّةٌ تصنعُ أبطال المستقبل 🚀', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900)),
                            const SizedBox(height: 4),
                            Text('نِكْسُس... تعليم يواكب رؤية السعودية 2030', style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 11)),
                          ],
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
        ),
      ),
    );
  }
}

// ═════════════════════════════════════════════
// PRIVATE WIDGETS
// ═════════════════════════════════════════════

class _TopBarButton extends StatelessWidget {
  final IconData icon;
  final int badge;

  const _TopBarButton({required this.icon, this.badge = 0});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Container(
          width: 44, height: 44,
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.05),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: Colors.white.withOpacity(0.06)),
          ),
          child: Icon(icon, color: Colors.white.withOpacity(0.5), size: 22),
        ),
        if (badge > 0)
          Positioned(
            top: 4, right: 4,
            child: Container(
              width: 16, height: 16,
              decoration: const BoxDecoration(color: Color(0xFFEF4444), shape: BoxShape.circle),
              child: Center(child: Text('$badge', style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w800))),
            ),
          ),
      ],
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  final IconData icon;
  final String? badge;

  const _SectionHeader({required this.title, required this.icon, this.badge});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, color: const Color(0xFF10B981), size: 22),
        const SizedBox(width: 8),
        Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white)),
        if (badge != null) ...[
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFF10B981).withOpacity(0.12),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: const Color(0xFF10B981).withOpacity(0.2)),
            ),
            child: Text(badge!, style: const TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.w700)),
          ),
        ],
      ],
    );
  }
}

class _InsightCard extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String title, value, subtitle;
  final Color subtitleColor;

  const _InsightCard({required this.icon, required this.iconColor, required this.title, required this.value, required this.subtitle, required this.subtitleColor});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.04),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(color: iconColor.withOpacity(0.12), borderRadius: BorderRadius.circular(8)),
                child: Icon(icon, color: iconColor, size: 16),
              ),
              const SizedBox(width: 6),
              Expanded(child: Text(title, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.white.withOpacity(0.4)))),
            ],
          ),
          const SizedBox(height: 10),
          Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Color(0xFF10B981))),
          const SizedBox(height: 4),
          Text(subtitle, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: subtitleColor)),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label, value;
  final Color color;
  final String? trend;
  final VoidCallback? onTap;

  const _StatCard({required this.icon, required this.label, required this.value, required this.color, this.trend, this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.cardDark,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.borderDark),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                  child: Icon(icon, color: color, size: 20),
                ),
                if (trend != null)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(color: AppColors.success.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.trending_up, color: AppColors.success, size: 12),
                        const SizedBox(width: 2),
                        Text(trend!, style: const TextStyle(color: AppColors.success, fontSize: 11, fontWeight: FontWeight.w800)),
                      ],
                    ),
                  ),
              ],
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Colors.white)),
                const SizedBox(height: 2),
                Text(label, style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.4), fontWeight: FontWeight.w500)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _QuickAction extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback? onTap;

  const _QuickAction({required this.icon, required this.label, required this.color, this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: color.withOpacity(0.06),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: color.withOpacity(0.1)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: color.withOpacity(0.12), shape: BoxShape.circle),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(height: 8),
            Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: color), textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}

class _DashSubject {
  final String name, teacher, grade;
  final int progress;
  final Color color;
  final IconData subjectIcon;
  const _DashSubject({required this.name, required this.teacher, required this.progress, required this.grade, required this.color, required this.subjectIcon});
}

class _SubjectCard extends StatelessWidget {
  final _DashSubject subject;
  const _SubjectCard({required this.subject});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardDark,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.borderDark),
      ),
      child: Row(
        children: [
          Container(
            width: 48, height: 48,
            decoration: BoxDecoration(
              color: subject.color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(subject.subjectIcon, color: subject.color, size: 24),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(subject.name, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: Colors.white)),
                const SizedBox(height: 2),
                Text('المعلم: ${subject.teacher}', style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.35))),
                const SizedBox(height: 8),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: subject.progress / 100,
                    backgroundColor: Colors.white.withOpacity(0.06),
                    valueColor: AlwaysStoppedAnimation(subject.color),
                    minHeight: 5,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Column(
            children: [
              Text(subject.grade, style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: subject.color)),
              const SizedBox(height: 2),
              Text('${subject.progress}%', style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.35))),
            ],
          ),
          const SizedBox(width: 6),
          Icon(Icons.arrow_forward_ios_rounded, color: Colors.white.withOpacity(0.12), size: 14),
        ],
      ),
    );
  }
}

final List<_DashSubject> _subjects = [
  _DashSubject(name: 'الرياضيات', teacher: 'أ. أحمد علي', progress: 75, grade: 'A-', color: AppColors.math, subjectIcon: Icons.calculate_rounded),
  _DashSubject(name: 'الفيزياء', teacher: 'د. سارة محمد', progress: 60, grade: 'B+', color: AppColors.physics, subjectIcon: Icons.science_rounded),
  _DashSubject(name: 'الكيمياء', teacher: 'أ. حسن خالد', progress: 80, grade: 'A', color: AppColors.chemistry, subjectIcon: Icons.biotech_rounded),
  _DashSubject(name: 'اللغة العربية', teacher: 'أ. فاطمة إبراهيم', progress: 90, grade: 'A', color: AppColors.arabic, subjectIcon: Icons.translate_rounded),
  _DashSubject(name: 'اللغة الإنجليزية', teacher: 'Mr. John', progress: 70, grade: 'B+', color: AppColors.english, subjectIcon: Icons.language_rounded),
  _DashSubject(name: 'علوم الحاسب', teacher: 'م. نور حسن', progress: 85, grade: 'A', color: AppColors.computerScience, subjectIcon: Icons.computer_rounded),
];

void _showMedicalExcuseBottomSheet(BuildContext context) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (context) => Container(
      decoration: BoxDecoration(
        color: AppColors.backgroundDark,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        border: Border.all(color: AppColors.borderDark),
      ),
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom, top: 24, left: 24, right: 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.white.withOpacity(0.1), borderRadius: BorderRadius.circular(10))),
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: const Color(0xFFEF4444).withOpacity(0.15), borderRadius: BorderRadius.circular(14)), child: const Icon(Icons.local_hospital_rounded, color: Color(0xFFEF4444), size: 28)),
              const SizedBox(width: 16),
              const Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('تقديم عذر طبي رسمي', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900)),
                SizedBox(height: 4),
                Text('سيتم توجيه التقرير تلقائياً للمرشد الطلابي', style: TextStyle(color: Colors.grey, fontSize: 13)),
              ])),
            ],
          ),
          const SizedBox(height: 32),
          const Text('تاريخ غياب الطالب', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w800)),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: AppColors.cardDark, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.borderDark)),
            child: const Row(children: [Icon(Icons.calendar_month_rounded, color: Colors.grey, size: 20), SizedBox(width: 12), Text('21 مارس 2026', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600))]),
          ),
          const SizedBox(height: 20),
          const Text('المرفقات الطبية المعتمدة', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w800)),
          const SizedBox(height: 10),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(32),
            decoration: BoxDecoration(
              color: const Color(0xFF3B82F6).withOpacity(0.05),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF3B82F6).withOpacity(0.3), width: 2), // Mocking dotted border
            ),
            child: Column(
              children: [
                const Icon(Icons.cloud_upload_rounded, color: Color(0xFF3B82F6), size: 48),
                const SizedBox(height: 16),
                const Text('اضغط هنا لرفع تقرير المستشفى', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 15)),
                const SizedBox(height: 6),
                Text('يقبل بصيغة PDF المشفرة أو صور واضحة (أقصى حد 5MB)', style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 11), textAlign: TextAlign.center),
              ],
            ),
          ),
          const SizedBox(height: 32),
          GestureDetector(
            onTap: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                content: Text('تم رفع العذر الطبي وهو قيد مراجعة الموجه الطلابي ✅', style: TextStyle(fontWeight: FontWeight.w700)),
                backgroundColor: Color(0xFF10B981),
                duration: Duration(seconds: 4),
              ));
            },
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 18),
              alignment: Alignment.center,
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [Color(0xFFEF4444), Color(0xFFDC2626)]),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [BoxShadow(color: const Color(0xFFEF4444).withOpacity(0.3), blurRadius: 15, offset: const Offset(0, 6))],
              ),
              child: const Text('إرسال العذر وتسجيل مبرر الغياب', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w900)),
            ),
          ),
          const SizedBox(height: 40),
        ],
      ),
    ),
  );
}
