import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

class TeacherDashboard extends StatelessWidget {
  const TeacherDashboard({super.key});

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
                        const Text('نِكْسُس للمعلمين', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white)),
                        Text('Nexus EDU — Teacher', style: TextStyle(fontSize: 10, color: Colors.white.withOpacity(0.35), letterSpacing: 2)),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Welcome
                Container(
                  width: double.infinity, padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    gradient: AppColors.heroGradient,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: const Color(0xFF10B981).withOpacity(0.15)),
                    boxShadow: [BoxShadow(color: const Color(0xFF10B981).withOpacity(0.12), blurRadius: 30, offset: const Offset(0, 10))],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('مرحباً يا معلم! 👨‍🏫', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: Colors.white)),
                      const SizedBox(height: 8),
                      Text('لديك 2 حصص اليوم و 15 واجب بحاجة للتصحيح', style: TextStyle(fontSize: 14, color: Colors.white.withOpacity(0.7))),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Stats
                GridView.count(
                  shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2, mainAxisSpacing: 10, crossAxisSpacing: 10, childAspectRatio: 1.55,
                  children: const [
                    _Stat(icon: Icons.class_rounded, label: 'الفصول', value: '4', color: Color(0xFF3B82F6)),
                    _Stat(icon: Icons.people_rounded, label: 'الطلاب', value: '128', color: Color(0xFF10B981)),
                    _Stat(icon: Icons.assignment_rounded, label: 'واجبات للتصحيح', value: '15', color: Color(0xFFFBBF24)),
                    _Stat(icon: Icons.check_circle_rounded, label: 'نسبة الحضور', value: '94%', color: Color(0xFF0D9488)),
                  ],
                ),
                const SizedBox(height: 24),

                // Quick Actions — FUNCTIONAL
                const Text('إجراءات سريعة', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white)),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(child: _Action(icon: Icons.qr_code_rounded, label: 'تسجيل حضور\nQR', color: const Color(0xFF10B981), onTap: () => _showQrAttendance(context))),
                    const SizedBox(width: 10),
                    Expanded(child: _Action(icon: Icons.add_task_rounded, label: 'إنشاء\nواجب', color: const Color(0xFF3B82F6), onTap: () => _showCreateAssignment(context))),
                    const SizedBox(width: 10),
                    Expanded(child: _Action(icon: Icons.grading_rounded, label: 'تصحيح', color: const Color(0xFFFBBF24), onTap: () => _showGrading(context))),
                    const SizedBox(width: 10),
                    Expanded(child: _Action(icon: Icons.psychology_rounded, label: 'AI\nتحليل', color: const Color(0xFFA855F7), onTap: () => _showAiInsights(context))),
                  ],
                ),
                const SizedBox(height: 24),

                // ── AI At-Risk Alert ─────────────────────────
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEF4444).withOpacity(0.06),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFFEF4444).withOpacity(0.2)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(color: const Color(0xFFEF4444).withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
                            child: const Icon(Icons.warning_amber_rounded, color: Color(0xFFEF4444), size: 18),
                          ),
                          const SizedBox(width: 10),
                          const Expanded(
                            child: Text('طلاب يحتاجون متابعة عاجلة', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Colors.white)),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(color: const Color(0xFFEF4444).withOpacity(0.15), borderRadius: BorderRadius.circular(8)),
                            child: const Text('NEXUS AI', style: TextStyle(color: Color(0xFFEF4444), fontSize: 10, fontWeight: FontWeight.w800)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      ...[
                        ('سالم أحمد', 'ضعف في الجبر — يحتاج خطة علاجية', Icons.trending_down_rounded, const Color(0xFFEF4444)),
                        ('نورة علي', 'لم تسلم واجبين متتاليين', Icons.assignment_late_rounded, const Color(0xFFFBBF24)),
                        ('فهد خالد', 'انخفاض في الحضور (60%)', Icons.person_off_rounded, const Color(0xFFF59E0B)),
                      ].map((s) => Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.03),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: Colors.white.withOpacity(0.05)),
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(6),
                              decoration: BoxDecoration(color: s.$4.withOpacity(0.12), borderRadius: BorderRadius.circular(8)),
                              child: Icon(s.$3, color: s.$4, size: 16),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                Text(s.$1, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: Colors.white)),
                                Text(s.$2, style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.4))),
                              ]),
                            ),
                            GestureDetector(
                              onTap: () {},
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                decoration: BoxDecoration(gradient: AppColors.primaryGradient, borderRadius: BorderRadius.circular(8)),
                                child: const Text('خطة AI', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w800)),
                              ),
                            ),
                          ],
                        ),
                      )),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Upcoming Classes
                const Text('الحصص القادمة', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white)),
                const SizedBox(height: 12),
                ..._upcomingClasses.map((c) => Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.cardDark, borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: AppColors.borderDark),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 48, height: 48,
                        decoration: BoxDecoration(color: c.color.withOpacity(0.1), borderRadius: BorderRadius.circular(14)),
                        child: Center(child: Text(c.emoji, style: const TextStyle(fontSize: 24))),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(c.subject, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: Colors.white)),
                            const SizedBox(height: 2),
                            Text('${c.className} • ${c.time}', style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.4))),
                          ],
                        ),
                      ),
                      Text('${c.students} طالب', style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.3))),
                    ],
                  ),
                )),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ═════════════════════════════════════
  // AI INSIGHTS SHEET
  // ═════════════════════════════════════
  static void _showAiInsights(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => Directionality(
        textDirection: TextDirection.rtl,
        child: Container(
          height: MediaQuery.of(context).size.height * 0.75,
          padding: const EdgeInsets.all(24),
          decoration: const BoxDecoration(
            color: Color(0xFF0F1A2E),
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(2)))),
              const SizedBox(height: 20),
              const Text('تحليلات NEXUS AI 🤖', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white)),
              const SizedBox(height: 6),
              Text('رؤى ذكية لتحسين أداء فصلك', style: TextStyle(fontSize: 13, color: Colors.white.withOpacity(0.5))),
              const SizedBox(height: 24),
              Expanded(
                child: ListView(
                  children: [
                    _AiInsightCard(icon: Icons.trending_up_rounded, color: const Color(0xFF10B981), title: 'الصف الثالث/أ يتقدم بسرعة', body: 'ارتفع المتوسط 8% هذا الأسبوع. الطلاب يتفاعلون مع الواجبات الجديدة.'),
                    const SizedBox(height: 12),
                    _AiInsightCard(icon: Icons.warning_rounded, color: const Color(0xFFFBBF24), title: 'توصية: درس تكراري للمعادلات', body: '40% من الطلاب أخطأوا في نفس الأسئلة. يُنصح بشرح مراجعة إضافية.'),
                    const SizedBox(height: 12),
                    _AiInsightCard(icon: Icons.psychology_rounded, color: const Color(0xFFA855F7), title: 'أفضل وقت لأداء الاختبارات', body: 'تُشير البيانات أن أفضل أداء للطلاب يكون بين 9-11 صباحاً.'),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }


  // ═════════════════════════════════════
  // QR ATTENDANCE SHEET
  // ═════════════════════════════════════
  static void _showQrAttendance(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => Directionality(
        textDirection: TextDirection.rtl,
        child: Container(
          height: MediaQuery.of(context).size.height * 0.75,
          decoration: const BoxDecoration(
            color: Color(0xFF0F1A2E),
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          child: Column(
            children: [
              const SizedBox(height: 12),
              Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(2))),
              const SizedBox(height: 20),
              const Text('تسجيل الحضور QR 📱', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white)),
              const SizedBox(height: 8),
              Text('اعرض هذا الكود للطلاب لتسجيل حضورهم', style: TextStyle(fontSize: 13, color: Colors.white.withOpacity(0.5))),
              const SizedBox(height: 30),
              // QR Code placeholder
              Container(
                width: 220, height: 220,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [BoxShadow(color: const Color(0xFF10B981).withOpacity(0.3), blurRadius: 30)],
                ),
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    // QR pattern simulation
                    GridView.count(
                      crossAxisCount: 11, shrinkWrap: true, padding: const EdgeInsets.all(16),
                      physics: const NeverScrollableScrollPhysics(),
                      children: List.generate(121, (i) {
                        final isCorner = (i < 33 && (i % 11 < 3)) || (i < 33 && (i % 11 > 7)) || (i > 87 && (i % 11 < 3));
                        final isRandom = i.hashCode % 3 == 0;
                        return Container(
                          margin: const EdgeInsets.all(1),
                          decoration: BoxDecoration(
                            color: isCorner || isRandom ? const Color(0xFF0D1B2A) : Colors.transparent,
                            borderRadius: BorderRadius.circular(1),
                          ),
                        );
                      }),
                    ),
                    // Logo center
                    Container(
                      width: 40, height: 40,
                      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8)),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.asset('assets/images/logo.jpeg', fit: BoxFit.cover),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Text('كود الحصة: MTH-301-A', style: TextStyle(color: Color(0xFF10B981), fontSize: 16, fontWeight: FontWeight.w800, letterSpacing: 2)),
              ),
              const SizedBox(height: 20),
              // Student list
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  children: [
                    _AttendanceStudent(name: 'أحمد محمد', status: 'حاضر', time: '9:01 ص', isPresent: true),
                    _AttendanceStudent(name: 'سارة خالد', status: 'حاضر', time: '9:02 ص', isPresent: true),
                    _AttendanceStudent(name: 'عمر إبراهيم', status: 'حاضر', time: '9:03 ص', isPresent: true),
                    _AttendanceStudent(name: 'فاطمة حسن', status: 'غائب', time: '—', isPresent: false),
                    _AttendanceStudent(name: 'يوسف أحمد', status: 'متأخر', time: '9:15 ص', isPresent: true),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ═════════════════════════════════════
  // CREATE ASSIGNMENT SHEET
  // ═════════════════════════════════════
  static void _showCreateAssignment(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => Directionality(
        textDirection: TextDirection.rtl,
        child: Container(
          height: MediaQuery.of(context).size.height * 0.8,
          padding: const EdgeInsets.all(24),
          decoration: const BoxDecoration(
            color: Color(0xFF0F1A2E),
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(2)))),
                const SizedBox(height: 20),
                const Text('إنشاء واجب جديد 📝', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white)),
                const SizedBox(height: 24),
                _FormField(label: 'عنوان الواجب', hint: 'مثال: حل تمارين المعادلات'),
                const SizedBox(height: 16),
                _FormField(label: 'وصف الواجب', hint: 'اكتب تفاصيل الواجب هنا...', maxLines: 3),
                const SizedBox(height: 16),
                const Text('المادة', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.white)),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8, runSpacing: 8,
                  children: [
                    _ChipSelect(label: 'الرياضيات', isSelected: true),
                    _ChipSelect(label: 'الفيزياء', isSelected: false),
                    _ChipSelect(label: 'الكيمياء', isSelected: false),
                    _ChipSelect(label: 'اللغة العربية', isSelected: false),
                  ],
                ),
                const SizedBox(height: 16),
                const Text('الفصل', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.white)),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8, runSpacing: 8,
                  children: [
                    _ChipSelect(label: 'الصف الثالث/أ', isSelected: true),
                    _ChipSelect(label: 'الصف الثاني/ب', isSelected: false),
                    _ChipSelect(label: 'الصف الثالث/ج', isSelected: false),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(child: _FormField(label: 'الدرجة الكاملة', hint: '20')),
                    const SizedBox(width: 12),
                    Expanded(child: _FormField(label: 'تاريخ التسليم', hint: '20/03/2026')),
                  ],
                ),
                const SizedBox(height: 24),
                GestureDetector(
                  onTap: () {
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: const Row(children: [Icon(Icons.check_circle, color: Colors.white), SizedBox(width: 8), Text('تم إنشاء الواجب بنجاح! ✅')]),
                        backgroundColor: const Color(0xFF10B981),
                        behavior: SnackBarBehavior.floating,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        margin: const EdgeInsets.all(16),
                      ),
                    );
                  },
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [Color(0xFF0D9488), Color(0xFF10B981)]),
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [BoxShadow(color: const Color(0xFF10B981).withOpacity(0.3), blurRadius: 16, offset: const Offset(0, 6))],
                    ),
                    child: const Text('إنشاء الواجب', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800), textAlign: TextAlign.center),
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
  // GRADING SHEET
  // ═════════════════════════════════════
  static void _showGrading(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => Directionality(
        textDirection: TextDirection.rtl,
        child: Container(
          height: MediaQuery.of(context).size.height * 0.75,
          decoration: const BoxDecoration(
            color: Color(0xFF0F1A2E),
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          child: Column(
            children: [
              const SizedBox(height: 12),
              Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(2))),
              const SizedBox(height: 20),
              const Text('التصحيح 📋', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white)),
              const SizedBox(height: 8),
              Text('15 واجب بانتظار التصحيح', style: TextStyle(fontSize: 13, color: Colors.white.withOpacity(0.5))),
              const SizedBox(height: 20),
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  children: [
                    _GradingItem(name: 'أحمد محمد', subject: 'الرياضيات', assignment: 'تمارين المعادلات', submitted: 'منذ ساعة'),
                    _GradingItem(name: 'سارة خالد', subject: 'الرياضيات', assignment: 'تمارين المعادلات', submitted: 'منذ 2 ساعة'),
                    _GradingItem(name: 'عمر إبراهيم', subject: 'الرياضيات', assignment: 'تمارين المعادلات', submitted: 'منذ 3 ساعات'),
                    _GradingItem(name: 'فاطمة حسن', subject: 'الرياضيات', assignment: 'حل المسائل', submitted: 'أمس'),
                    _GradingItem(name: 'يوسف أحمد', subject: 'الجبر', assignment: 'كثيرات الحدود', submitted: 'أمس'),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ═════════════════════════════════════════════
// PRIVATE WIDGETS
// ═════════════════════════════════════════════

class _Stat extends StatelessWidget {
  final IconData icon; final String label, value; final Color color;
  const _Stat({required this.icon, required this.label, required this.value, required this.color});
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

class _Action extends StatelessWidget {
  final IconData icon; final String label; final Color color; final VoidCallback onTap;
  const _Action({required this.icon, required this.label, required this.color, required this.onTap});
  @override
  Widget build(BuildContext context) => GestureDetector(
    onTap: onTap,
    child: Container(
      padding: const EdgeInsets.symmetric(vertical: 16),
      decoration: BoxDecoration(color: color.withOpacity(0.08), borderRadius: BorderRadius.circular(18), border: Border.all(color: color.withOpacity(0.15))),
      child: Column(children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(color: color.withOpacity(0.12), shape: BoxShape.circle),
          child: Icon(icon, color: color, size: 24),
        ),
        const SizedBox(height: 8),
        Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: color), textAlign: TextAlign.center),
      ]),
    ),
  );
}

class _AttendanceStudent extends StatelessWidget {
  final String name, status, time;
  final bool isPresent;
  const _AttendanceStudent({required this.name, required this.status, required this.time, required this.isPresent});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isPresent ? const Color(0xFF10B981).withOpacity(0.05) : const Color(0xFFEF4444).withOpacity(0.05),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: isPresent ? const Color(0xFF10B981).withOpacity(0.1) : const Color(0xFFEF4444).withOpacity(0.1)),
      ),
      child: Row(
        children: [
          Container(
            width: 36, height: 36,
            decoration: BoxDecoration(
              color: isPresent ? const Color(0xFF10B981).withOpacity(0.15) : const Color(0xFFEF4444).withOpacity(0.15),
              shape: BoxShape.circle,
            ),
            child: Icon(
              isPresent ? Icons.check_rounded : Icons.close_rounded,
              color: isPresent ? const Color(0xFF10B981) : const Color(0xFFEF4444),
              size: 18,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(child: Text(name, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: Colors.white))),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(status, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: isPresent ? const Color(0xFF10B981) : const Color(0xFFEF4444))),
              Text(time, style: TextStyle(fontSize: 10, color: Colors.white.withOpacity(0.3))),
            ],
          ),
        ],
      ),
    );
  }
}

class _GradingItem extends StatelessWidget {
  final String name, subject, assignment, submitted;
  const _GradingItem({required this.name, required this.subject, required this.assignment, required this.submitted});

  @override
  Widget build(BuildContext context) {
    return Container(
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
            width: 40, height: 40,
            decoration: BoxDecoration(color: const Color(0xFFFBBF24).withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
            child: const Icon(Icons.assignment_rounded, color: Color(0xFFFBBF24), size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: Colors.white)),
                const SizedBox(height: 2),
                Text('$subject — $assignment', style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.4))),
                const SizedBox(height: 2),
                Text(submitted, style: TextStyle(fontSize: 10, color: Colors.white.withOpacity(0.25))),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFF10B981), Color(0xFF059669)]),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Text('صحح', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }
}

class _FormField extends StatelessWidget {
  final String label, hint;
  final int maxLines;
  const _FormField({required this.label, required this.hint, this.maxLines = 1});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.white)),
        const SizedBox(height: 8),
        TextField(
          maxLines: maxLines,
          style: const TextStyle(color: Colors.white, fontSize: 14),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(color: Colors.white.withOpacity(0.2)),
            filled: true,
            fillColor: Colors.white.withOpacity(0.04),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: Colors.white.withOpacity(0.06))),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: Colors.white.withOpacity(0.06))),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFF10B981), width: 1.5)),
          ),
        ),
      ],
    );
  }
}

class _ChipSelect extends StatelessWidget {
  final String label;
  final bool isSelected;
  const _ChipSelect({required this.label, required this.isSelected});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: isSelected ? const Color(0xFF10B981).withOpacity(0.15) : Colors.white.withOpacity(0.04),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: isSelected ? const Color(0xFF10B981).withOpacity(0.3) : Colors.white.withOpacity(0.06)),
      ),
      child: Text(label, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: isSelected ? const Color(0xFF10B981) : Colors.white.withOpacity(0.4))),
    );
  }
}

class _AiInsightCard extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String title, body;
  const _AiInsightCard({required this.icon, required this.color, required this.title, required this.body});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.06),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: color.withOpacity(0.12), borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, color: color, size: 18),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: Colors.white)),
                const SizedBox(height: 4),
                Text(body, style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.5), height: 1.5)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}


class _ClassItem {
  final String subject, className, time, emoji;
  final int students;
  final Color color;
  const _ClassItem({required this.subject, required this.className, required this.time, required this.students, required this.color, required this.emoji});
}

final _upcomingClasses = [
  _ClassItem(subject: 'الرياضيات', className: 'الصف الثالث/أ', time: '9:00 ص', students: 32, color: const Color(0xFF10B981), emoji: '📐'),
  _ClassItem(subject: 'الرياضيات', className: 'الصف الثاني/ب', time: '10:00 ص', students: 28, color: const Color(0xFF10B981), emoji: '📐'),
  _ClassItem(subject: 'الجبر المتقدم', className: 'الصف الثالث/ج', time: '11:30 ص', students: 25, color: const Color(0xFF3B82F6), emoji: '📊'),
];
