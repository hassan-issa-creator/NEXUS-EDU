import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import 'package:go_router/go_router.dart';

/// Quiz Screen — interactive quiz with questions and score
class QuizScreen extends StatefulWidget {
  const QuizScreen({super.key});

  @override
  State<QuizScreen> createState() => _QuizScreenState();
}

class _QuizScreenState extends State<QuizScreen> {
  int _currentQ = 0;
  int _score = 0;
  int? _selectedAnswer;
  bool _showResult = false;
  bool _answered = false;

  final List<_Question> _questions = [
    _Question(text: 'ما حل المعادلة: 2x + 6 = 0؟', options: ['x = 3', 'x = -3', 'x = 6', 'x = -6'], correct: 1),
    _Question(text: 'ما وحدة قياس القوة في النظام الدولي؟', options: ['جول', 'واط', 'نيوتن', 'باسكال'], correct: 2),
    _Question(text: 'ما الرمز الكيميائي للماء؟', options: ['CO₂', 'H₂O', 'NaCl', 'O₂'], correct: 1),
    _Question(text: 'أي مما يلي عدد أولي؟', options: ['4', '9', '15', '17'], correct: 3),
    _Question(text: 'ما ناتج: 15² ؟', options: ['200', '215', '225', '250'], correct: 2),
  ];

  void _selectAnswer(int index) {
    if (_answered) return;
    setState(() {
      _selectedAnswer = index;
      _answered = true;
      if (index == _questions[_currentQ].correct) _score++;
    });
    Future.delayed(const Duration(milliseconds: 800), _nextQuestion);
  }

  void _nextQuestion() {
    if (_currentQ < _questions.length - 1) {
      setState(() { _currentQ++; _selectedAnswer = null; _answered = false; });
    } else {
      setState(() { _showResult = true; });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_showResult) return _buildResult(context);

    final q = _questions[_currentQ];
    final progress = (_currentQ + 1) / _questions.length;

    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: AppColors.backgroundDark,
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(20),
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
                        child: const Icon(Icons.close_rounded, color: Colors.white, size: 20),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('السؤال ${_currentQ + 1} من ${_questions.length}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Colors.white)),
                          const SizedBox(height: 6),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(4),
                            child: LinearProgressIndicator(
                              value: progress,
                              backgroundColor: Colors.white.withOpacity(0.06),
                              valueColor: const AlwaysStoppedAnimation(Color(0xFF10B981)),
                              minHeight: 6,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 14),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981).withOpacity(0.12),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text('$_score/${_currentQ + (_answered ? 1 : 0)}', style: const TextStyle(color: Color(0xFF10B981), fontSize: 13, fontWeight: FontWeight.w800)),
                    ),
                  ],
                ),
                const SizedBox(height: 40),

                // Question
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: AppColors.cardDark,
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(color: AppColors.borderDark),
                  ),
                  child: Text(q.text, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Colors.white, height: 1.5)),
                ),
                const SizedBox(height: 24),

                // Options
                ...List.generate(q.options.length, (i) {
                  Color bg = Colors.white.withOpacity(0.03);
                  Color border = Colors.white.withOpacity(0.06);
                  Color textColor = Colors.white.withOpacity(0.8);
                  IconData? icon;

                  if (_answered) {
                    if (i == q.correct) {
                      bg = const Color(0xFF10B981).withOpacity(0.12);
                      border = const Color(0xFF10B981).withOpacity(0.3);
                      textColor = const Color(0xFF10B981);
                      icon = Icons.check_circle_rounded;
                    } else if (i == _selectedAnswer) {
                      bg = const Color(0xFFEF4444).withOpacity(0.12);
                      border = const Color(0xFFEF4444).withOpacity(0.3);
                      textColor = const Color(0xFFEF4444);
                      icon = Icons.cancel_rounded;
                    }
                  } else if (i == _selectedAnswer) {
                    bg = const Color(0xFF10B981).withOpacity(0.08);
                    border = const Color(0xFF10B981).withOpacity(0.2);
                  }

                  return GestureDetector(
                    onTap: () => _selectAnswer(i),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: bg,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: border),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 32, height: 32,
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.04),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Center(child: Text('${String.fromCharCode(65 + i)}', style: TextStyle(fontWeight: FontWeight.w800, color: textColor, fontSize: 14))),
                          ),
                          const SizedBox(width: 14),
                          Expanded(child: Text(q.options[i], style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: textColor))),
                          if (icon != null) Icon(icon, color: textColor, size: 22),
                        ],
                      ),
                    ),
                  );
                }),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildResult(BuildContext context) {
    final percentage = (_score / _questions.length * 100).round();
    final passed = percentage >= 60;

    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: AppColors.backgroundDark,
        body: SafeArea(
          child: Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(passed ? '🎉' : '📚', style: const TextStyle(fontSize: 64)),
                  const SizedBox(height: 20),
                  Text(passed ? 'أحسنت!' : 'حاول مرة أخرى', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: Colors.white)),
                  const SizedBox(height: 8),
                  Text('حصلت على $_score من ${_questions.length}', style: TextStyle(fontSize: 16, color: Colors.white.withOpacity(0.5))),
                  const SizedBox(height: 24),
                  Container(
                    width: 120, height: 120,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: LinearGradient(colors: passed ? [const Color(0xFF10B981), const Color(0xFF059669)] : [const Color(0xFFEF4444), const Color(0xFFDC2626)]),
                    ),
                    child: Center(child: Text('$percentage%', style: const TextStyle(fontSize: 36, fontWeight: FontWeight.w900, color: Colors.white))),
                  ),
                  const SizedBox(height: 30),
                  if (passed) Text('+50 XP 🔥', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: const Color(0xFFFBBF24).withOpacity(0.8))),
                  const SizedBox(height: 30),
                  Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() { _currentQ = 0; _score = 0; _selectedAnswer = null; _showResult = false; _answered = false; }),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.05),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: const Text('إعادة المحاولة', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700), textAlign: TextAlign.center),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: GestureDetector(
                          onTap: () => context.pop(),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(colors: [Color(0xFF10B981), Color(0xFF059669)]),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: const Text('العودة', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700), textAlign: TextAlign.center),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _Question {
  final String text;
  final List<String> options;
  final int correct;
  const _Question({required this.text, required this.options, required this.correct});
}
