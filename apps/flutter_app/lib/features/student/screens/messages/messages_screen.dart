import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class MessagesScreen extends StatelessWidget {
  const MessagesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('الرسائل 💬')),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        child: const Icon(Icons.edit_rounded),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _chats.length,
        itemBuilder: (context, index) {
          final chat = _chats[index];
          return Container(
            margin: const EdgeInsets.only(bottom: 8),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border.withOpacity(0.5)),
            ),
            child: ListTile(
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              leading: CircleAvatar(
                radius: 24,
                backgroundColor: AppColors.primary.withOpacity(0.1),
                child: Text(chat.emoji, style: const TextStyle(fontSize: 20)),
              ),
              title: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(chat.name, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                  Text(chat.time, style: TextStyle(fontSize: 11, color: AppColors.textHint)),
                ],
              ),
              subtitle: Row(
                children: [
                  Expanded(
                    child: Text(chat.lastMessage, style: TextStyle(fontSize: 12, color: AppColors.textSecondary), maxLines: 1, overflow: TextOverflow.ellipsis),
                  ),
                  if (chat.unread > 0)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(10)),
                      child: Text('${chat.unread}', style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700)),
                    ),
                ],
              ),
              onTap: () {},
            ),
          );
        },
      ),
    );
  }
}

class _ChatData {
  final String name, lastMessage, time, emoji;
  final int unread;
  const _ChatData({required this.name, required this.lastMessage, required this.time, required this.unread, required this.emoji});
}

final _chats = [
  _ChatData(name: 'أ. أحمد علي', lastMessage: 'أحسنت في الواجب الأخير! استمر', time: '10:30 ص', unread: 2, emoji: '👨‍🏫'),
  _ChatData(name: 'د. سارة محمد', lastMessage: 'لا تنسى اختبار الفيزياء غداً', time: '9:15 ص', unread: 1, emoji: '👩‍🏫'),
  _ChatData(name: 'مجموعة الرياضيات', lastMessage: 'هل أحد يقدر يشرح المسألة الثالثة؟', time: 'أمس', unread: 5, emoji: '👥'),
  _ChatData(name: 'أ. حسن خالد', lastMessage: 'تم رفع نتائج الاختبار', time: 'أمس', unread: 0, emoji: '👨‍🏫'),
  _ChatData(name: 'الدعم الفني', lastMessage: 'تم حل مشكلتك. شكراً لتواصلك', time: 'الأحد', unread: 0, emoji: '🛠️'),
];
