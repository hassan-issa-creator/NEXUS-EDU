import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

class ParentDashboard extends StatelessWidget {
  const ParentDashboard({super.key});

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
                // Top bar
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
                        const Text('نكسس لأولياء الأمور', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white)),
                        Text('Nexus EDU — Parent', style: TextStyle(fontSize: 10, color: Colors.white.withOpacity(0.35), letterSpacing: 2)),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Welcome Card
                Container(
                  width: double.infinity, padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [Color(0xFF1A0F3C), Color(0xFF2D1B69), Color(0xFF3D2680)]),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: const Color(0xFF7C3AED).withOpacity(0.15)),
                    boxShadow: [BoxShadow(color: const Color(0xFF7C3AED).withOpacity(0.12), blurRadius: 30, offset: const Offset(0, 10))],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('مرحباً يا ولي الأمر 👨‍👩‍👧', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Colors.white)),
                      const SizedBox(height: 8),
                      Text('تابع تقدم أبنائك الدراسي', style: TextStyle(fontSize: 14, color: Colors.white.withOpacity(0.7))),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Children
                const Text('أبنائي', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white)),
                const SizedBox(height: 12),
                SizedBox(
                  height: 100,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    children: const [
                      _ChildChip(name: 'أحمد', selected: true, grade: 'الصف الثالث'),
                      SizedBox(width: 10),
                      _ChildChip(name: 'سارة', selected: false, grade: 'الصف الأول'),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Stats
                GridView.count(
                  shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2, mainAxisSpacing: 10, crossAxisSpacing: 10, childAspectRatio: 1.55,
                  children: const [
                    _ParentStat(label: 'المعدل', value: '87%', icon: Icons.emoji_events_rounded, color: Color(0xFFFBBF24)),
                    _ParentStat(label: 'الحضور', value: '92%', icon: Icons.calendar_today_rounded, color: Color(0xFF3B82F6)),
                    _ParentStat(label: 'الواجبات المسلمة', value: '12/15', icon: Icons.assignment_turned_in_rounded, color: Color(0xFF10B981)),
                    _ParentStat(label: 'الترتيب', value: '#3', icon: Icons.leaderboard_rounded, color: Color(0xFFA855F7)),
                  ],
                ),
                const SizedBox(height: 24),

                // Activities
                const Text('آخر النشاطات', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white)),
                const SizedBox(height: 12),
                ..._activities.map((a) => Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.cardDark, borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.borderDark),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 40, height: 40,
                        decoration: BoxDecoration(color: a.color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                        child: Center(child: Text(a.emoji, style: const TextStyle(fontSize: 20))),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(a.title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: Colors.white)),
                            const SizedBox(height: 2),
                            Text(a.time, style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.3))),
                          ],
                        ),
                      ),
                    ],
                  ),
                )),
                const SizedBox(height: 24),

                // Subscription Button — FUNCTIONAL
                GestureDetector(
                  onTap: () => _showSubscriptionSheet(context),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [Color(0xFF10B981), Color(0xFF059669)]),
                      borderRadius: BorderRadius.circular(18),
                      boxShadow: [BoxShadow(color: const Color(0xFF10B981).withOpacity(0.3), blurRadius: 16, offset: const Offset(0, 6))],
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.payment_rounded, color: Colors.white, size: 22),
                        SizedBox(width: 10),
                        Text('إدارة الاشتراكات والمدفوعات', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w800)),
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

  // ═════════════════════════════════════
  // SUBSCRIPTION MANAGEMENT SHEET
  // ═════════════════════════════════════
  static void _showSubscriptionSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => Directionality(
        textDirection: TextDirection.rtl,
        child: Container(
          height: MediaQuery.of(context).size.height * 0.8,
          decoration: const BoxDecoration(
            color: Color(0xFF0F1A2E),
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(2)))),
                const SizedBox(height: 20),
                const Center(child: Text('إدارة الاشتراكات 💳', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white))),
                const SizedBox(height: 24),

                // Current Plan
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [Color(0xFF1A0F3C), Color(0xFF2D1B69)]),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFFFBBF24).withOpacity(0.3)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('الباقة الذهبية', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFFFBBF24))),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(color: const Color(0xFF10B981).withOpacity(0.15), borderRadius: BorderRadius.circular(8)),
                            child: const Text('نشط ✅', style: TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.w700)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text('تجديد تلقائي: 15 أبريل 2026', style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.5))),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          _PlanFeature(icon: Icons.check_circle, label: 'جميع المواد'),
                          const SizedBox(width: 16),
                          _PlanFeature(icon: Icons.check_circle, label: 'AI مساعد'),
                          const SizedBox(width: 16),
                          _PlanFeature(icon: Icons.check_circle, label: 'تقارير مفصلة'),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Payment History
                const Text('سجل المدفوعات', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Colors.white)),
                const SizedBox(height: 12),
                _PaymentRecord(date: '15 مارس 2026', amount: '299 ر.س', status: 'مدفوع', isPaid: true),
                _PaymentRecord(date: '15 فبراير 2026', amount: '299 ر.س', status: 'مدفوع', isPaid: true),
                _PaymentRecord(date: '15 يناير 2026', amount: '299 ر.س', status: 'مدفوع', isPaid: true),
                const SizedBox(height: 24),

                // Plans
                const Text('الباقات المتاحة', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Colors.white)),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(child: _PlanCard(name: 'أساسي', price: '99', features: ['3 مواد', 'تقارير بسيطة'])),
                    const SizedBox(width: 10),
                    Expanded(child: _PlanCard(name: 'ذهبي', price: '299', features: ['كل المواد', 'AI + تقارير'], isActive: true)),
                    const SizedBox(width: 10),
                    Expanded(child: _PlanCard(name: 'بريميوم', price: '499', features: ['كل شيء', '1-on-1 دعم'])),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════
// WIDGETS
// ═══════════════════════════════════════

class _ChildChip extends StatelessWidget {
  final String name, grade; final bool selected;
  const _ChildChip({required this.name, required this.selected, required this.grade});
  @override
  Widget build(BuildContext context) => Container(
    width: 120, padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(
      color: selected ? const Color(0xFF10B981).withOpacity(0.08) : AppColors.cardDark,
      borderRadius: BorderRadius.circular(18),
      border: Border.all(color: selected ? const Color(0xFF10B981).withOpacity(0.3) : AppColors.borderDark, width: selected ? 2 : 1),
    ),
    child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
      Container(
        width: 40, height: 40,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: LinearGradient(colors: selected ? [const Color(0xFF0D9488), const Color(0xFF10B981)] : [const Color(0xFF3B82F6), const Color(0xFF6366F1)]),
        ),
        child: const Center(child: Text('👦', style: TextStyle(fontSize: 20))),
      ),
      const SizedBox(height: 6),
      Text(name, style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: selected ? const Color(0xFF10B981) : Colors.white)),
      Text(grade, style: TextStyle(fontSize: 10, color: Colors.white.withOpacity(0.35))),
    ]),
  );
}

class _ParentStat extends StatelessWidget {
  final String label, value; final IconData icon; final Color color;
  const _ParentStat({required this.label, required this.value, required this.icon, required this.color});
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(color: AppColors.cardDark, borderRadius: BorderRadius.circular(18), border: Border.all(color: AppColors.borderDark)),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
      Icon(icon, color: color, size: 24),
      Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white)),
        Text(label, style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.4))),
      ]),
    ]),
  );
}

class _PlanFeature extends StatelessWidget {
  final IconData icon; final String label;
  const _PlanFeature({required this.icon, required this.label});
  @override
  Widget build(BuildContext context) => Row(
    children: [
      Icon(icon, size: 14, color: const Color(0xFF10B981)),
      const SizedBox(width: 4),
      Text(label, style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.6))),
    ],
  );
}

class _PaymentRecord extends StatelessWidget {
  final String date, amount, status; final bool isPaid;
  const _PaymentRecord({required this.date, required this.amount, required this.status, required this.isPaid});
  @override
  Widget build(BuildContext context) => Container(
    margin: const EdgeInsets.only(bottom: 8),
    padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(color: AppColors.cardDark, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.borderDark)),
    child: Row(
      children: [
        Container(
          width: 36, height: 36,
          decoration: BoxDecoration(color: const Color(0xFF10B981).withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
          child: const Icon(Icons.receipt_long_rounded, color: Color(0xFF10B981), size: 18),
        ),
        const SizedBox(width: 12),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(date, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: Colors.white)),
          Text(amount, style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.4))),
        ])),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(color: const Color(0xFF10B981).withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
          child: Text(status, style: const TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.w700)),
        ),
      ],
    ),
  );
}

class _PlanCard extends StatelessWidget {
  final String name, price; final List<String> features; final bool isActive;
  const _PlanCard({required this.name, required this.price, required this.features, this.isActive = false});
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(
      color: isActive ? const Color(0xFFFBBF24).withOpacity(0.08) : AppColors.cardDark,
      borderRadius: BorderRadius.circular(16),
      border: Border.all(color: isActive ? const Color(0xFFFBBF24).withOpacity(0.3) : AppColors.borderDark),
    ),
    child: Column(
      children: [
        Text(name, style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: isActive ? const Color(0xFFFBBF24) : Colors.white)),
        const SizedBox(height: 4),
        Text('$price ر.س', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: isActive ? const Color(0xFFFBBF24) : Colors.white.withOpacity(0.6))),
        Text('/شهر', style: TextStyle(fontSize: 9, color: Colors.white.withOpacity(0.3))),
        const SizedBox(height: 8),
        ...features.map((f) => Text(f, style: TextStyle(fontSize: 10, color: Colors.white.withOpacity(0.4)))),
      ],
    ),
  );
}

class _ActivityData {
  final String title, time, emoji; final Color color;
  const _ActivityData({required this.title, required this.time, required this.emoji, required this.color});
}

final _activities = [
  _ActivityData(title: 'أحمد حصل على 95% في اختبار الرياضيات', time: 'منذ ساعة', emoji: '🎉', color: const Color(0xFF10B981)),
  _ActivityData(title: 'أحمد سلم واجب الفيزياء', time: 'منذ 3 ساعات', emoji: '📄', color: const Color(0xFF3B82F6)),
  _ActivityData(title: 'أحمد حضر حصة الكيمياء', time: 'اليوم 10:00 ص', emoji: '✅', color: const Color(0xFF0D9488)),
  _ActivityData(title: 'تنبيه: لم يسلم واجب اللغة العربية', time: 'أمس', emoji: '⚠️', color: const Color(0xFFFBBF24)),
];
