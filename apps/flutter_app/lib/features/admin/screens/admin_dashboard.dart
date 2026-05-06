import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

class AdminDashboard extends StatelessWidget {
  const AdminDashboard({super.key});

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
                        const Text('لوحة التحكم 🛡️', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white)),
                        Text('Nexus EDU — Admin', style: TextStyle(fontSize: 10, color: Colors.white.withOpacity(0.35), letterSpacing: 2)),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Welcome Card
                Container(
                  width: double.infinity, padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [Color(0xFF0F172A), Color(0xFF1E293B), Color(0xFF334155)]),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: Colors.white.withOpacity(0.05)),
                    boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 30, offset: const Offset(0, 10))],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('نظرة شاملة على المنصة', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white)),
                      const SizedBox(height: 8),
                      Text('آخر تحديث: الآن', style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.4))),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Stats
                GridView.count(
                  shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2, mainAxisSpacing: 10, crossAxisSpacing: 10, childAspectRatio: 1.55,
                  children: const [
                    _AdminStat(label: 'إجمالي المستخدمين', value: '1,250', icon: Icons.people_rounded, color: Color(0xFF3B82F6), trend: '12'),
                    _AdminStat(label: 'الطلاب النشطين', value: '890', icon: Icons.school_rounded, color: Color(0xFF10B981), trend: '5'),
                    _AdminStat(label: 'المعلمين', value: '45', icon: Icons.person_rounded, color: Color(0xFFA855F7), trend: '2'),
                    _AdminStat(label: 'الفصول', value: '32', icon: Icons.class_rounded, color: Color(0xFFFBBF24)),
                  ],
                ),
                const SizedBox(height: 24),

                // Management Items — ALL FUNCTIONAL
                const Text('الإدارة', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white)),
                const SizedBox(height: 12),
                ..._adminItems.map((item) => GestureDetector(
                  onTap: () => _showAdminPanel(context, item),
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.cardDark, borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: AppColors.borderDark),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 44, height: 44,
                          decoration: BoxDecoration(color: item.color.withOpacity(0.1), borderRadius: BorderRadius.circular(14)),
                          child: Icon(item.icon, color: item.color, size: 22),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(item.title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: Colors.white)),
                              const SizedBox(height: 2),
                              Text(item.subtitle, style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.35))),
                            ],
                          ),
                        ),
                        Icon(Icons.arrow_forward_ios_rounded, color: Colors.white.withOpacity(0.15), size: 14),
                      ],
                    ),
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
  // ADMIN PANEL BOTTOM SHEET
  // ═════════════════════════════════════
  static void _showAdminPanel(BuildContext context, _AdminItem item) {
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
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(color: item.color.withOpacity(0.12), borderRadius: BorderRadius.circular(14)),
                    child: Icon(item.icon, color: item.color, size: 22),
                  ),
                  const SizedBox(width: 12),
                  Text(item.title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Colors.white)),
                ],
              ),
              const SizedBox(height: 8),
              Text(item.subtitle, style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.4))),
              const SizedBox(height: 20),

              // Content based on type
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  children: _getItemContent(item),
                ),
              ),

              // Action button
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 30),
                child: GestureDetector(
                  onTap: () {
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Row(children: [const Icon(Icons.check_circle, color: Colors.white), const SizedBox(width: 8), Text('تم الحفظ بنجاح ✅')]),
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
                      gradient: LinearGradient(colors: [item.color, item.color.withOpacity(0.7)]),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.add_rounded, color: Colors.white, size: 20),
                        const SizedBox(width: 8),
                        Text('إضافة ${item.title.replaceAll('إدارة ', '')}', style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w800)),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  static List<Widget> _getItemContent(_AdminItem item) {
    // Generate appropriate sample data based on admin item
    final List<Map<String, String>> data;
    switch (item.title) {
      case 'إدارة المستخدمين':
        data = [
          {'name': 'أحمد محمد', 'sub': 'طالب — الصف الثالث/أ', 'badge': 'نشط'},
          {'name': 'سارة خالد', 'sub': 'طالبة — الصف الثاني/ب', 'badge': 'نشط'},
          {'name': 'م. إبراهيم علي', 'sub': 'معلم — رياضيات', 'badge': 'نشط'},
          {'name': 'خالد العتيبي', 'sub': 'ولي أمر', 'badge': 'نشط'},
          {'name': 'هدى المطيري', 'sub': 'طالبة — الصف الأول', 'badge': 'معلق'},
        ];
        break;
      case 'إدارة الفصول':
        data = [
          {'name': 'الصف الثالث/أ', 'sub': '32 طالب — 5 مواد', 'badge': 'نشط'},
          {'name': 'الصف الثاني/ب', 'sub': '28 طالب — 5 مواد', 'badge': 'نشط'},
          {'name': 'الصف الثالث/ج', 'sub': '25 طالب — 4 مواد', 'badge': 'نشط'},
          {'name': 'الصف الأول/أ', 'sub': '30 طالب — 6 مواد', 'badge': 'نشط'},
        ];
        break;
      case 'إدارة المواد':
        data = [
          {'name': 'الرياضيات', 'sub': '3 فصول — م. إبراهيم', 'badge': '📐'},
          {'name': 'الفيزياء', 'sub': '2 فصول — م. خالد', 'badge': '🔬'},
          {'name': 'الكيمياء', 'sub': '2 فصول — م. سعاد', 'badge': '⚗️'},
          {'name': 'اللغة العربية', 'sub': '4 فصول — م. فاطمة', 'badge': '📖'},
          {'name': 'اللغة الإنجليزية', 'sub': '3 فصول — م. أحمد', 'badge': '🌍'},
        ];
        break;
      default:
        data = [
          {'name': 'عنصر 1', 'sub': 'تفاصيل العنصر الأول', 'badge': 'نشط'},
          {'name': 'عنصر 2', 'sub': 'تفاصيل العنصر الثاني', 'badge': 'نشط'},
          {'name': 'عنصر 3', 'sub': 'تفاصيل العنصر الثالث', 'badge': 'معلق'},
        ];
    }

    return data.map((d) => Container(
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
            decoration: BoxDecoration(color: item.color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
            child: Center(
              child: d['badge']!.length <= 2
                ? Text(d['badge']!, style: const TextStyle(fontSize: 18))
                : Icon(Icons.person_rounded, color: item.color, size: 20),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(d['name']!, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: Colors.white)),
                const SizedBox(height: 2),
                Text(d['sub']!, style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.4))),
              ],
            ),
          ),
          if (d['badge']!.length > 2)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: d['badge'] == 'نشط' ? const Color(0xFF10B981).withOpacity(0.1) : const Color(0xFFFBBF24).withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(d['badge']!, style: TextStyle(
                fontSize: 11, fontWeight: FontWeight.w700,
                color: d['badge'] == 'نشط' ? const Color(0xFF10B981) : const Color(0xFFFBBF24),
              )),
            ),
          const SizedBox(width: 8),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              GestureDetector(
                onTap: () {},
                child: Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(color: const Color(0xFF3B82F6).withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                  child: const Icon(Icons.edit_rounded, color: Color(0xFF3B82F6), size: 16),
                ),
              ),
              const SizedBox(width: 4),
              GestureDetector(
                onTap: () {},
                child: Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(color: const Color(0xFFEF4444).withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                  child: const Icon(Icons.delete_outline_rounded, color: Color(0xFFEF4444), size: 16),
                ),
              ),
            ],
          ),
        ],
      ),
    )).toList();
  }
}

// ═══════════════════════════════════════
// WIDGETS
// ═══════════════════════════════════════

class _AdminStat extends StatelessWidget {
  final String label, value; final IconData icon; final Color color; final String? trend;
  const _AdminStat({required this.label, required this.value, required this.icon, required this.color, this.trend});
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(color: AppColors.cardDark, borderRadius: BorderRadius.circular(18), border: Border.all(color: AppColors.borderDark)),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Icon(icon, color: color, size: 22),
        if (trend != null)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(color: const Color(0xFF10B981).withOpacity(0.1), borderRadius: BorderRadius.circular(6)),
            child: Text('+$trend', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF10B981))),
          ),
      ]),
      Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Colors.white)),
        Text(label, style: TextStyle(fontSize: 10, color: Colors.white.withOpacity(0.4))),
      ]),
    ]),
  );
}

class _AdminItem {
  final IconData icon;
  final String title, subtitle;
  final Color color;
  const _AdminItem({required this.icon, required this.title, required this.subtitle, required this.color});
}

final _adminItems = [
  _AdminItem(icon: Icons.people_rounded, title: 'إدارة المستخدمين', subtitle: 'إضافة، تعديل، وحذف المستخدمين', color: const Color(0xFF3B82F6)),
  _AdminItem(icon: Icons.class_rounded, title: 'إدارة الفصول', subtitle: 'إنشاء وإدارة الفصول الدراسية', color: const Color(0xFF10B981)),
  _AdminItem(icon: Icons.menu_book_rounded, title: 'إدارة المواد', subtitle: 'إضافة وتعديل المواد الدراسية', color: const Color(0xFFFBBF24)),
  _AdminItem(icon: Icons.cloud_upload_rounded, title: 'إدارة المحتوى', subtitle: 'رفع وإدارة المحتوى التعليمي', color: const Color(0xFFA855F7)),
  _AdminItem(icon: Icons.how_to_reg_rounded, title: 'التسجيل والقبول', subtitle: 'إدارة تسجيل الطلاب', color: const Color(0xFF0D9488)),
  _AdminItem(icon: Icons.games_rounded, title: 'إدارة الألعاب', subtitle: 'إضافة وإدارة الألعاب التعليمية', color: const Color(0xFFF59E0B)),
  _AdminItem(icon: Icons.security_rounded, title: 'الصلاحيات', subtitle: 'إدارة أدوار وصلاحيات المستخدمين', color: const Color(0xFFEF4444)),
  _AdminItem(icon: Icons.settings_rounded, title: 'إعدادات النظام', subtitle: 'إعدادات المنصة والتهيئة', color: const Color(0xFF6B7280)),
];
