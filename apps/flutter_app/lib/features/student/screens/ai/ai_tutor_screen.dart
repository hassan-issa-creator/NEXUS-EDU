import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

/// AI Tutor Chat Screen — interactive AI assistant
class AiTutorScreen extends StatefulWidget {
  const AiTutorScreen({super.key});

  @override
  State<AiTutorScreen> createState() => _AiTutorScreenState();
}

class _AiTutorScreenState extends State<AiTutorScreen> with SingleTickerProviderStateMixin {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final FocusNode _focusNode = FocusNode();
  late AnimationController _pulseController;
  final List<_ChatMessage> _messages = [
    _ChatMessage(isUser: false, text: 'مرحباً! 👋 أنا مساعد نِكْسُس الذكي.\nاسألني أي سؤال عن موادك الدراسية وسأساعدك!', time: '٨:٣٠ ص'),
  ];

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(vsync: this, duration: const Duration(seconds: 2))..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    _focusNode.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  void _sendMessage() {
    final text = _controller.text.trim();
    if (text.isEmpty) return;
    setState(() {
      _messages.add(_ChatMessage(isUser: true, text: text, time: 'الآن'));
      _controller.clear();
    });
    _scrollToBottom();
    // Simulate AI response
    Future.delayed(const Duration(milliseconds: 800), () {
      if (mounted) {
        setState(() {
          _messages.add(_ChatMessage(isUser: false, text: _getAiResponse(text), time: 'الآن'));
        });
        _scrollToBottom();
      }
    });
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  String _getAiResponse(String q) {
    if (q.contains('رياض') || q.contains('معادل')) return 'المعادلات الخطية هي معادلات من الدرجة الأولى على الصورة: ax + b = 0\n\nحيث:\n• a هو معامل المتغير\n• b هو الحد الثابت\n• x هو المتغير المطلوب إيجاده\n\nمثال: 2x + 6 = 0\nالحل: x = -3 ✅';
    if (q.contains('فيز') || q.contains('حرك')) return 'قوانين نيوتن الثلاثة:\n\n1️⃣ قانون القصور الذاتي\n2️⃣ F = ma (القوة = الكتلة × التسارع)\n3️⃣ لكل فعل رد فعل مساوٍ له في المقدار ومعاكس في الاتجاه\n\nهل تريد مثال عملي؟ 🧪';
    if (q.contains('كيم')) return 'الجدول الدوري يرتب العناصر حسب:\n\n• العدد الذري (عدد البروتونات)\n• الخواص الكيميائية المتشابهة\n\nالمجموعات تكون رأسياً والدورات أفقياً ⚗️';
    return 'سؤال ممتاز! 🌟\n\nدعني أفكر في الإجابة...\nيمكنك مراجعة الدروس المتعلقة في قسم المواد الدراسية.\n\nهل تريد مساعدة في شيء آخر؟';
  }

  @override
  Widget build(BuildContext context) {
    final bottomPadding = MediaQuery.of(context).viewInsets.bottom;

    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: AppColors.backgroundDark,
        resizeToAvoidBottomInset: true,
        body: SafeArea(
          child: Column(
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(colors: [Color(0xFF7C3AED), Color(0xFFA855F7)]),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: const Icon(Icons.smart_toy_rounded, color: Colors.white, size: 22),
                    ),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('مساعد نِكْسُس AI', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white)),
                          Text('متصل الآن • ذكاء اصطناعي', style: TextStyle(fontSize: 11, color: Color(0xFF10B981))),
                        ],
                      ),
                    ),
                    AnimatedBuilder(
                      animation: _pulseController,
                      builder: (_, __) => Container(
                        width: 10, height: 10,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: const Color(0xFF10B981),
                          boxShadow: [BoxShadow(color: const Color(0xFF10B981).withOpacity(_pulseController.value * 0.5), blurRadius: 8)],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),

              // Quick Suggestions
              SizedBox(
                height: 36,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  children: [
                    _SuggestionChip(text: '📐 اشرح المعادلات', onTap: () { _controller.text = 'اشرح المعادلات الخطية'; _sendMessage(); }),
                    _SuggestionChip(text: '🧪 قوانين نيوتن', onTap: () { _controller.text = 'اشرح قوانين نيوتن في الفيزياء'; _sendMessage(); }),
                    _SuggestionChip(text: '⚗️ الجدول الدوري', onTap: () { _controller.text = 'اشرح الجدول الدوري في الكيمياء'; _sendMessage(); }),
                  ],
                ),
              ),
              const SizedBox(height: 12),

              // Chat Messages
              Expanded(
                child: GestureDetector(
                  onTap: () => _focusNode.unfocus(),
                  child: ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    physics: const BouncingScrollPhysics(),
                    itemCount: _messages.length,
                    itemBuilder: (_, i) => _MessageBubble(message: _messages[i]),
                  ),
                ),
              ),

              // Input Bar
              Container(
                padding: EdgeInsets.fromLTRB(16, 12, 16, bottomPadding > 0 ? 12 : 24),
                decoration: BoxDecoration(
                  color: AppColors.cardDark,
                  border: Border(top: BorderSide(color: Colors.white.withOpacity(0.05))),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _controller,
                        focusNode: _focusNode,
                        style: const TextStyle(color: Colors.white, fontSize: 14),
                        textDirection: TextDirection.rtl,
                        maxLines: null,
                        textInputAction: TextInputAction.send,
                        decoration: InputDecoration(
                          hintText: 'اكتب سؤالك هنا...',
                          hintTextDirection: TextDirection.rtl,
                          hintStyle: TextStyle(color: Colors.white.withOpacity(0.25)),
                          filled: true,
                          fillColor: Colors.white.withOpacity(0.04),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: BorderSide(color: Colors.white.withOpacity(0.06)),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: BorderSide(color: Colors.white.withOpacity(0.06)),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: const BorderSide(color: Color(0xFF7C3AED), width: 1.5),
                          ),
                        ),
                        onSubmitted: (_) => _sendMessage(),
                      ),
                    ),
                    const SizedBox(width: 10),
                    GestureDetector(
                      onTap: _sendMessage,
                      child: Container(
                        width: 48, height: 48,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(colors: [Color(0xFF7C3AED), Color(0xFFA855F7)]),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: const Icon(Icons.send_rounded, color: Colors.white, size: 22),
                      ),
                    ),
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

class _ChatMessage {
  final bool isUser;
  final String text, time;
  const _ChatMessage({required this.isUser, required this.text, required this.time});
}

class _MessageBubble extends StatelessWidget {
  final _ChatMessage message;
  const _MessageBubble({required this.message});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!message.isUser) ...[
            Container(
              width: 32, height: 32,
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [Color(0xFF7C3AED), Color(0xFFA855F7)]),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.smart_toy_rounded, color: Colors.white, size: 16),
            ),
            const SizedBox(width: 8),
          ],
          if (message.isUser) const SizedBox(width: 40),
          Flexible(
            child: Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: message.isUser ? const Color(0xFF10B981).withOpacity(0.12) : Colors.white.withOpacity(0.04),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: message.isUser ? const Color(0xFF10B981).withOpacity(0.2) : Colors.white.withOpacity(0.05)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(message.text, style: TextStyle(color: Colors.white.withOpacity(0.9), fontSize: 13.5, height: 1.6)),
                  const SizedBox(height: 6),
                  Text(message.time, style: TextStyle(color: Colors.white.withOpacity(0.2), fontSize: 10)),
                ],
              ),
            ),
          ),
          if (message.isUser) ...[
            const SizedBox(width: 8),
            Container(
              width: 32, height: 32,
              decoration: BoxDecoration(color: const Color(0xFF10B981).withOpacity(0.15), borderRadius: BorderRadius.circular(10)),
              child: const Icon(Icons.person_rounded, color: Color(0xFF10B981), size: 16),
            ),
          ],
        ],
      ),
    );
  }
}

class _SuggestionChip extends StatelessWidget {
  final String text;
  final VoidCallback onTap;
  const _SuggestionChip({required this.text, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(left: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: const Color(0xFF7C3AED).withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFF7C3AED).withOpacity(0.2)),
        ),
        child: Text(text, style: const TextStyle(color: Color(0xFFA855F7), fontSize: 12, fontWeight: FontWeight.w600)),
      ),
    );
  }
}
