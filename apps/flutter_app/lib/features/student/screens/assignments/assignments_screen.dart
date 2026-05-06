import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class AssignmentsScreen extends StatelessWidget {
  const AssignmentsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('الواجبات')),
      body: DefaultTabController(
        length: 3,
        child: Column(
          children: [
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(color: AppColors.background, borderRadius: BorderRadius.circular(12)),
              child: TabBar(
                labelColor: AppColors.primary,
                unselectedLabelColor: AppColors.textSecondary,
                indicatorSize: TabBarIndicatorSize.tab,
                dividerColor: Colors.transparent,
                indicator: BoxDecoration(color: AppColors.primary50, borderRadius: BorderRadius.circular(12)),
                tabs: const [
                  Tab(text: 'الحالية'),
                  Tab(text: 'المسلمة'),
                  Tab(text: 'المتأخرة'),
                ],
              ),
            ),
            Expanded(
              child: TabBarView(
                children: [
                  _buildAssignmentList(context, _currentAssignments),
                  _buildAssignmentList(context, _submittedAssignments),
                  _buildEmptyState(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Text('📋', style: TextStyle(fontSize: 48)),
          const SizedBox(height: 12),
          Text('لا توجد واجبات', style: TextStyle(color: AppColors.textSecondary, fontSize: 16, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Widget _buildAssignmentList(BuildContext context, List<_AssignmentData> assignments) {
    if (assignments.isEmpty) return _buildEmptyState();
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: assignments.length,
      itemBuilder: (context, index) {
        final a = assignments[index];
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.border.withOpacity(0.5)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(child: Text(a.title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15))),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(color: a.statusColor.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                    child: Text(a.status, style: TextStyle(color: a.statusColor, fontSize: 11, fontWeight: FontWeight.w700)),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(a.subject, style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(Icons.calendar_today_rounded, size: 14, color: AppColors.textHint),
                  const SizedBox(width: 4),
                  Text(a.deadline, style: TextStyle(fontSize: 12, color: AppColors.textHint)),
                  const Spacer(),
                  if (a.grade != null) ...[
                    Icon(Icons.grade_rounded, size: 14, color: AppColors.accent),
                    const SizedBox(width: 4),
                    Text(a.grade!, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.accent)),
                  ],
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}

class _AssignmentData {
  final String title, subject, deadline, status;
  final Color statusColor;
  final String? grade;
  const _AssignmentData({required this.title, required this.subject, required this.deadline, required this.status, required this.statusColor, this.grade});
}

final _currentAssignments = [
  _AssignmentData(title: 'حل تمارين المعادلات', subject: 'الرياضيات - أ. أحمد علي', deadline: 'غداً', status: 'جديد', statusColor: AppColors.info),
  _AssignmentData(title: 'تقرير تجربة الحركة', subject: 'الفيزياء - د. سارة محمد', deadline: 'بعد 3 أيام', status: 'قيد العمل', statusColor: AppColors.warning),
  _AssignmentData(title: 'تحليل نص أدبي', subject: 'اللغة العربية - أ. فاطمة', deadline: 'بعد 5 أيام', status: 'جديد', statusColor: AppColors.info),
];

final _submittedAssignments = [
  _AssignmentData(title: 'بحث عن التفاعلات الكيميائية', subject: 'الكيمياء - أ. حسن خالد', deadline: 'تم التسليم', status: 'مسلم ✓', statusColor: AppColors.success, grade: '95/100'),
  _AssignmentData(title: 'مشروع برمجي', subject: 'علوم الحاسب - م. نور حسن', deadline: 'تم التسليم', status: 'مسلم ✓', statusColor: AppColors.success, grade: '88/100'),
];
