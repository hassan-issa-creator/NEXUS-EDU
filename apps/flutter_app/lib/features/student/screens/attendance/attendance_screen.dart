import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class AttendanceScreen extends StatelessWidget {
  const AttendanceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('سجل الحضور')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              children: [
                Expanded(child: _AttStat(label: 'حاضر', value: '92%', color: AppColors.success, icon: Icons.check_circle_rounded)),
                const SizedBox(width: 10),
                Expanded(child: _AttStat(label: 'غائب', value: '5%', color: AppColors.error, icon: Icons.cancel_rounded)),
                const SizedBox(width: 10),
                Expanded(child: _AttStat(label: 'متأخر', value: '3%', color: AppColors.warning, icon: Icons.watch_later_rounded)),
              ],
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity, height: 56,
              child: ElevatedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.qr_code_scanner_rounded),
                label: const Text('تسجيل حضور بالـ QR', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                style: ElevatedButton.styleFrom(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16))),
              ),
            ),
            const SizedBox(height: 24),
            const Align(alignment: Alignment.centerRight, child: Text('سجل الحضور', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800))),
            const SizedBox(height: 12),
            ..._records.map((r) => Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.surface, borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border.withOpacity(0.5)),
              ),
              child: Row(
                children: [
                  Container(width: 10, height: 10, decoration: BoxDecoration(color: r.color, shape: BoxShape.circle)),
                  const SizedBox(width: 12),
                  Expanded(child: Text(r.date, style: const TextStyle(fontWeight: FontWeight.w600))),
                  Text(r.subject, style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                  const SizedBox(width: 12),
                  Text(r.status, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: r.color)),
                ],
              ),
            )),
          ],
        ),
      ),
    );
  }
}

class _AttStat extends StatelessWidget {
  final String label, value;
  final Color color;
  final IconData icon;
  const _AttStat({required this.label, required this.value, required this.color, required this.icon});
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: color.withOpacity(0.08), borderRadius: BorderRadius.circular(16), border: Border.all(color: color.withOpacity(0.15))),
      child: Column(
        children: [
          Icon(icon, color: color, size: 28),
          const SizedBox(height: 8),
          Text(value, style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: color)),
          Text(label, style: TextStyle(fontSize: 12, color: color, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}

class _AttRecord {
  final String date, subject, status;
  final Color color;
  const _AttRecord({required this.date, required this.subject, required this.status, required this.color});
}

final _records = [
  _AttRecord(date: '2026/03/10', subject: 'الرياضيات', status: 'حاضر ✓', color: AppColors.success),
  _AttRecord(date: '2026/03/10', subject: 'الفيزياء', status: 'حاضر ✓', color: AppColors.success),
  _AttRecord(date: '2026/03/09', subject: 'الكيمياء', status: 'متأخر', color: AppColors.warning),
  _AttRecord(date: '2026/03/09', subject: 'اللغة العربية', status: 'حاضر ✓', color: AppColors.success),
  _AttRecord(date: '2026/03/08', subject: 'علوم الحاسب', status: 'حاضر ✓', color: AppColors.success),
  _AttRecord(date: '2026/03/07', subject: 'الرياضيات', status: 'غائب ✗', color: AppColors.error),
];
