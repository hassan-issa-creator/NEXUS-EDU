import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/constants/app_colors.dart';

class LeaderboardScreen extends StatefulWidget {
  const LeaderboardScreen({super.key});

  @override
  State<LeaderboardScreen> createState() => _LeaderboardScreenState();
}

class _LeaderboardScreenState extends State<LeaderboardScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  int _selectedFilter = 0;
  final List<String> _filters = ['الأسبوع', 'الشهر', 'الفصل'];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: AppColors.backgroundDark,
        body: SafeArea(
          child: Column(
            children: [
              // ── Header ───────────────────────────
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                child: Row(
                  children: [
                    GestureDetector(
                      onTap: () => Navigator.pop(context),
                      child: Container(
                        width: 40, height: 40,
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.06),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Icon(Icons.arrow_forward_ios_rounded, color: Colors.white.withOpacity(0.7), size: 16),
                      ),
                    ),
                    const SizedBox(width: 14),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('لوحة المتصدرين 🏆', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Colors.white)),
                          Text('تنافس مع زملائك واكسب المراتب', style: TextStyle(fontSize: 12, color: Colors.white38)),
                        ],
                      ),
                    ),
                    // My rank badge
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        gradient: AppColors.primaryGradient,
                        borderRadius: BorderRadius.circular(14),
                        boxShadow: [BoxShadow(color: const Color(0xFF10B981).withOpacity(0.3), blurRadius: 12)],
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text('🏅', style: TextStyle(fontSize: 14)),
                          SizedBox(width: 4),
                          Text('#3', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 15)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // ── Tab Bar ───────────────────────────
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  children: [
                    Expanded(
                      child: Container(
                        height: 44,
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.05),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: Colors.white.withOpacity(0.06)),
                        ),
                        child: TabBar(
                          controller: _tabController,
                          indicator: BoxDecoration(
                            gradient: AppColors.primaryGradient,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          indicatorSize: TabBarIndicatorSize.tab,
                          labelColor: Colors.white,
                          unselectedLabelColor: Colors.white38,
                          labelStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
                          dividerColor: Colors.transparent,
                          tabs: const [
                            Tab(text: 'الفصل'),
                            Tab(text: 'المدرسة'),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),

              // ── Time Filter ───────────────────────────
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  children: _filters.asMap().entries.map((e) {
                    final selected = _selectedFilter == e.key;
                    return Padding(
                      padding: const EdgeInsets.only(left: 8),
                      child: GestureDetector(
                        onTap: () {
                          HapticFeedback.selectionClick();
                          setState(() => _selectedFilter = e.key);
                        },
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 250),
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 7),
                          decoration: BoxDecoration(
                            color: selected ? const Color(0xFF10B981).withOpacity(0.15) : Colors.white.withOpacity(0.04),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: selected ? const Color(0xFF10B981).withOpacity(0.4) : Colors.white.withOpacity(0.06)),
                          ),
                          child: Text(e.value, style: TextStyle(
                            fontSize: 12, fontWeight: FontWeight.w700,
                            color: selected ? const Color(0xFF10B981) : Colors.white38,
                          )),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 20),

              // ── Content ───────────────────────────
              Expanded(
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    _LeaderboardList(entries: _classLeaderboard, myIndex: 2),
                    _LeaderboardList(entries: _schoolLeaderboard, myIndex: 4),
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

// ══════════════════════════════════════
// LEADERBOARD LIST
// ══════════════════════════════════════
class _LeaderboardList extends StatelessWidget {
  final List<_LeaderEntry> entries;
  final int myIndex;
  const _LeaderboardList({required this.entries, required this.myIndex});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        children: [
          // ── Podium ──────────────────────────
          _PodiumWidget(top3: entries.take(3).toList()),
          const SizedBox(height: 24),

          // ── My Position Banner ──────────────────────────
          Container(
            padding: const EdgeInsets.all(14),
            margin: const EdgeInsets.only(bottom: 16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFF0D9488), Color(0xFF10B981)]),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [BoxShadow(color: const Color(0xFF10B981).withOpacity(0.3), blurRadius: 16, offset: const Offset(0, 6))],
            ),
            child: Row(
              children: [
                const Text('📍', style: TextStyle(fontSize: 20)),
                const SizedBox(width: 10),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('موقعك الحالي', style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w600)),
                      Text('أنت في المركز #3 من أصل 32 طالب', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w800)),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    const Text('2,700 نقطة', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 15)),
                    Text('−150 للمركز الثاني', style: TextStyle(fontSize: 10, color: Colors.white.withOpacity(0.6))),
                  ],
                ),
              ],
            ),
          ),

          // ── Full List ──────────────────────────
          ...entries.asMap().entries.map((entry) {
            final i = entry.key;
            final student = entry.value;
            final isMe = i == myIndex;
            return _LeaderCard(rank: i + 1, entry: student, isMe: isMe);
          }),
          const SizedBox(height: 30),
        ],
      ),
    );
  }
}

// ══════════════════════════════════════
// PODIUM
// ══════════════════════════════════════
class _PodiumWidget extends StatelessWidget {
  final List<_LeaderEntry> top3;
  const _PodiumWidget({required this.top3});

  @override
  Widget build(BuildContext context) {
    if (top3.length < 3) return const SizedBox();
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        _PodiumCard(rank: 2, entry: top3[1], height: 110, color: const Color(0xFFC0C0C0)),
        const SizedBox(width: 6),
        _PodiumCard(rank: 1, entry: top3[0], height: 145, color: const Color(0xFFFBBF24)),
        const SizedBox(width: 6),
        _PodiumCard(rank: 3, entry: top3[2], height: 90, color: const Color(0xFFCD7F32)),
      ],
    );
  }
}

class _PodiumCard extends StatelessWidget {
  final int rank;
  final _LeaderEntry entry;
  final double height;
  final Color color;
  const _PodiumCard({required this.rank, required this.entry, required this.height, required this.color});

  @override
  Widget build(BuildContext context) {
    final medals = ['', '🥇', '🥈', '🥉'];
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(medals[rank], style: const TextStyle(fontSize: 30)),
        const SizedBox(height: 4),
        Container(
          width: 50, height: 50,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: color.withOpacity(0.15),
            border: Border.all(color: color.withOpacity(0.4), width: 2),
          ),
          child: Center(child: Text(entry.emoji, style: const TextStyle(fontSize: 22))),
        ),
        const SizedBox(height: 6),
        SizedBox(
          width: 90,
          child: Text(entry.name, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 11, color: Colors.white), textAlign: TextAlign.center, maxLines: 1, overflow: TextOverflow.ellipsis),
        ),
        const SizedBox(height: 6),
        Container(
          width: 90, height: height,
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(14)),
            border: Border.all(color: color.withOpacity(0.25)),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('${entry.points}', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: color)),
              Text('نقطة', style: TextStyle(fontSize: 10, color: color.withOpacity(0.7))),
            ],
          ),
        ),
      ],
    );
  }
}

// ══════════════════════════════════════
// LEADER CARD
// ══════════════════════════════════════
class _LeaderCard extends StatelessWidget {
  final int rank;
  final _LeaderEntry entry;
  final bool isMe;
  const _LeaderCard({required this.rank, required this.entry, required this.isMe});

  @override
  Widget build(BuildContext context) {
    final Color rankColor = rank == 1
        ? const Color(0xFFFBBF24)
        : rank == 2
            ? const Color(0xFFC0C0C0)
            : rank == 3
                ? const Color(0xFFCD7F32)
                : Colors.white30;

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isMe ? const Color(0xFF10B981).withOpacity(0.06) : AppColors.cardDark,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isMe ? const Color(0xFF10B981).withOpacity(0.3) : AppColors.borderDark,
          width: isMe ? 1.5 : 1,
        ),
      ),
      child: Row(
        children: [
          // Rank
          SizedBox(
            width: 36,
            child: Text(
              rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : '#$rank',
              style: TextStyle(fontWeight: FontWeight.w900, fontSize: rank <= 3 ? 22 : 13, color: rankColor),
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(width: 10),
          // Avatar
          Container(
            width: 42, height: 42,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: isMe ? const Color(0xFF10B981).withOpacity(0.15) : Colors.white.withOpacity(0.05),
              border: Border.all(color: isMe ? const Color(0xFF10B981).withOpacity(0.4) : Colors.white.withOpacity(0.08)),
            ),
            child: Center(child: Text(entry.emoji, style: const TextStyle(fontSize: 20))),
          ),
          const SizedBox(width: 12),
          // Name + Points
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(entry.name, style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: isMe ? const Color(0xFF10B981) : Colors.white)),
                    if (isMe) ...[
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(color: const Color(0xFF10B981).withOpacity(0.15), borderRadius: BorderRadius.circular(6)),
                        child: const Text('أنت ⭐', style: TextStyle(color: Color(0xFF10B981), fontSize: 9, fontWeight: FontWeight.w800)),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 2),
                Row(
                  children: [
                    Text('${entry.points} نقطة', style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.4))),
                    if (entry.badges != null && entry.badges!.isNotEmpty) ...[
                      const SizedBox(width: 8),
                      ...entry.badges!.map((b) => Text(b, style: const TextStyle(fontSize: 13))),
                    ],
                  ],
                ),
              ],
            ),
          ),
          // Streak
          if (entry.streak > 0)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFFEA580C).withOpacity(0.12),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFEA580C).withOpacity(0.2)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('🔥', style: TextStyle(fontSize: 11)),
                  const SizedBox(width: 3),
                  Text('${entry.streak}', style: const TextStyle(color: Color(0xFFEA580C), fontSize: 11, fontWeight: FontWeight.w800)),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

// ══════════════════════════════════════
// DATA MODELS
// ══════════════════════════════════════
class _LeaderEntry {
  final String name, emoji;
  final int points, streak;
  final List<String>? badges;
  const _LeaderEntry({required this.name, required this.points, required this.emoji, this.streak = 0, this.badges});
}

final _classLeaderboard = [
  const _LeaderEntry(name: 'محمد خالد', points: 3200, emoji: '👨‍🎓', streak: 21, badges: ['🏆', '🔥']),
  const _LeaderEntry(name: 'سارة أحمد', points: 2850, emoji: '👩‍🎓', streak: 14, badges: ['⭐']),
  const _LeaderEntry(name: 'أنت', points: 2700, emoji: '🌟', streak: 12, badges: ['📚', '⚡']),
  const _LeaderEntry(name: 'علي محمد', points: 2500, emoji: '👨‍🎓', streak: 8, badges: ['🏅']),
  const _LeaderEntry(name: 'نورة سعد', points: 2400, emoji: '👩‍🎓', streak: 7, badges: ['⭐']),
  const _LeaderEntry(name: 'أحمد يوسف', points: 2300, emoji: '👨‍🎓', streak: 5),
  const _LeaderEntry(name: 'ريم عبدالله', points: 2200, emoji: '👩‍🎓', streak: 4),
  const _LeaderEntry(name: 'خالد عمر', points: 2100, emoji: '👨‍🎓', streak: 3),
];

final _schoolLeaderboard = [
  const _LeaderEntry(name: 'فاطمة الزهراني', points: 4100, emoji: '👩‍🎓', streak: 30, badges: ['👑', '🏆']),
  const _LeaderEntry(name: 'عبدالله العتيبي', points: 3800, emoji: '👨‍🎓', streak: 25, badges: ['🔥']),
  const _LeaderEntry(name: 'هند المطيري', points: 3500, emoji: '👩‍🎓', streak: 18, badges: ['⭐']),
  const _LeaderEntry(name: 'سلطان القحطاني', points: 3200, emoji: '👨‍🎓', streak: 16),
  const _LeaderEntry(name: 'أنت', points: 2700, emoji: '🌟', streak: 12, badges: ['📚']),
  const _LeaderEntry(name: 'لينا الشهري', points: 2600, emoji: '👩‍🎓', streak: 10),
  const _LeaderEntry(name: 'ماجد الدوسري', points: 2400, emoji: '👨‍🎓', streak: 7),
];
