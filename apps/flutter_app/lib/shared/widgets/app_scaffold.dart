import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/app_colors.dart';
import '../../core/routing/route_names.dart';
import '../../features/auth/providers/auth_provider.dart';

/// App Scaffold with floating bottom navigation + side drawer
class AppScaffold extends ConsumerStatefulWidget {
  final String role;
  final Widget child;

  const AppScaffold({super.key, required this.role, required this.child});

  @override
  ConsumerState<AppScaffold> createState() => _AppScaffoldState();
}

class _AppScaffoldState extends ConsumerState<AppScaffold> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  int _getSelectedIndex(BuildContext context) {
    final location = GoRouterState.of(context).uri.toString();
    final items = _getNavItems(widget.role);
    for (int i = 0; i < items.length; i++) {
      if (location == items[i].route) return i;
    }
    return 0;
  }

  List<_NavItem> _getNavItems(String role) {
    switch (role) {
      case 'student':
        return [
          _NavItem(icon: Icons.home_outlined, activeIcon: Icons.home_rounded, label: 'الرئيسية', route: RouteNames.studentDashboard),
          _NavItem(icon: Icons.menu_book_outlined, activeIcon: Icons.menu_book_rounded, label: 'موادي', route: RouteNames.studentSubjects),
          _NavItem(icon: Icons.smart_toy_outlined, activeIcon: Icons.smart_toy_rounded, label: 'AI', route: RouteNames.studentAiTutor),
          _NavItem(icon: Icons.leaderboard_outlined, activeIcon: Icons.leaderboard_rounded, label: 'المتصدرين', route: RouteNames.studentLeaderboard),
          _NavItem(icon: Icons.person_outlined, activeIcon: Icons.person_rounded, label: 'حسابي', route: RouteNames.studentProfile),
        ];
      case 'teacher':
        return [
          _NavItem(icon: Icons.home_outlined, activeIcon: Icons.home_rounded, label: 'الرئيسية', route: RouteNames.teacherDashboard),
        ];
      case 'parent':
        return [
          _NavItem(icon: Icons.home_outlined, activeIcon: Icons.home_rounded, label: 'الرئيسية', route: RouteNames.parentDashboard),
        ];
      case 'admin':
        return [
          _NavItem(icon: Icons.home_outlined, activeIcon: Icons.home_rounded, label: 'الرئيسية', route: RouteNames.adminDashboard),
        ];
      default:
        return [];
    }
  }

  List<_DrawerItem> _getDrawerItems(String role) {
    switch (role) {
      case 'student':
        return [
          _DrawerItem(icon: Icons.home_rounded, label: 'الرئيسية', route: RouteNames.studentDashboard),
          _DrawerItem(icon: Icons.menu_book_rounded, label: 'المواد الدراسية', route: RouteNames.studentSubjects),
          _DrawerItem(icon: Icons.smart_toy_rounded, label: 'المساعد الذكي AI', route: RouteNames.studentAiTutor),
          _DrawerItem(icon: Icons.leaderboard_rounded, label: 'المتصدرين', route: RouteNames.studentLeaderboard),
          _DrawerItem(icon: Icons.person_rounded, label: 'الملف الشخصي', route: RouteNames.studentProfile),
          _DrawerItem(icon: Icons.emoji_events_rounded, label: 'الإنجازات', route: RouteNames.studentAchievements),
          _DrawerItem(icon: Icons.notifications_rounded, label: 'الإشعارات', route: RouteNames.studentNotifications),
          _DrawerItem(icon: Icons.assignment_rounded, label: 'الواجبات', route: RouteNames.studentAssignments),
          _DrawerItem(icon: Icons.grade_rounded, label: 'الدرجات', route: RouteNames.studentGrades),
          _DrawerItem(icon: Icons.settings_rounded, label: 'الإعدادات', route: RouteNames.studentSettings),
        ];
      case 'teacher':
        return [
          _DrawerItem(icon: Icons.home_rounded, label: 'الرئيسية', route: RouteNames.teacherDashboard),
          _DrawerItem(icon: Icons.settings_rounded, label: 'الإعدادات', route: RouteNames.teacherDashboard),
        ];
      case 'parent':
        return [
          _DrawerItem(icon: Icons.home_rounded, label: 'الرئيسية', route: RouteNames.parentDashboard),
          _DrawerItem(icon: Icons.settings_rounded, label: 'الإعدادات', route: RouteNames.parentDashboard),
        ];
      case 'admin':
        return [
          _DrawerItem(icon: Icons.home_rounded, label: 'لوحة التحكم', route: RouteNames.adminDashboard),
          _DrawerItem(icon: Icons.settings_rounded, label: 'الإعدادات', route: RouteNames.adminDashboard),
        ];
      default:
        return [];
    }
  }

  String _getRoleLabel(String role) {
    switch (role) {
      case 'student': return '🎓 طالب';
      case 'teacher': return '👨‍🏫 معلم';
      case 'parent': return '👨‍👩‍👧 ولي أمر';
      case 'admin': return '🛡️ مدير';
      default: return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    final items = _getNavItems(widget.role);
    final selectedIndex = _getSelectedIndex(context);
    final drawerItems = _getDrawerItems(widget.role);

    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        key: _scaffoldKey,
        backgroundColor: AppColors.backgroundDark,
        extendBody: true,

        // ═══════════════════════════════
        // SIDE DRAWER
        // ═══════════════════════════════
        endDrawer: Drawer(
          backgroundColor: const Color(0xFF0B1120),
          child: SafeArea(
            child: Column(
              children: [
                // Drawer Header
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    gradient: AppColors.heroGradient,
                    border: Border(bottom: BorderSide(color: Colors.white.withOpacity(0.05))),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(14),
                            child: Image.asset('assets/images/logo.jpeg', width: 48, height: 48, fit: BoxFit.cover),
                          ),
                          const SizedBox(width: 12),
                          const Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('نكسس التعليمية', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white)),
                              Text('Nexus EDU', style: TextStyle(fontSize: 11, color: Color(0xFF10B981), letterSpacing: 2)),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: const Color(0xFF10B981).withOpacity(0.12),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(_getRoleLabel(widget.role), style: const TextStyle(color: Color(0xFF10B981), fontSize: 12, fontWeight: FontWeight.w700)),
                      ),
                    ],
                  ),
                ),

                // Menu Items
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    itemCount: drawerItems.length,
                    itemBuilder: (_, i) {
                      final item = drawerItems[i];
                      final isActive = GoRouterState.of(context).uri.toString() == item.route;
                      return Container(
                        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
                        decoration: BoxDecoration(
                          color: isActive ? const Color(0xFF10B981).withOpacity(0.1) : Colors.transparent,
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: ListTile(
                          leading: Icon(item.icon, color: isActive ? const Color(0xFF10B981) : Colors.white.withOpacity(0.4), size: 22),
                          title: Text(item.label, style: TextStyle(
                            fontWeight: isActive ? FontWeight.w800 : FontWeight.w500,
                            fontSize: 14,
                            color: isActive ? const Color(0xFF10B981) : Colors.white.withOpacity(0.7),
                          )),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          onTap: () {
                            Navigator.pop(context);
                            if (!isActive) context.go(item.route);
                          },
                        ),
                      );
                    },
                  ),
                ),

                // Logout
                Container(
                  margin: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEF4444).withOpacity(0.08),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFEF4444).withOpacity(0.15)),
                  ),
                  child: ListTile(
                    leading: const Icon(Icons.logout_rounded, color: Color(0xFFEF4444), size: 20),
                    title: const Text('تسجيل الخروج', style: TextStyle(color: Color(0xFFEF4444), fontWeight: FontWeight.w700, fontSize: 14)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    onTap: () async {
                      Navigator.pop(context);
                      await ref.read(authProvider.notifier).logout();
                      if (context.mounted) context.go(RouteNames.login);
                    },
                  ),
                ),

                Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: Text('Nexus EDU v1.0.0', style: TextStyle(fontSize: 10, color: Colors.white.withOpacity(0.15))),
                ),
              ],
            ),
          ),
        ),

        body: Stack(
          children: [
            widget.child,
            // Drawer toggle button (top left)
            Positioned(
              top: MediaQuery.of(context).padding.top + 10,
              left: 16,
              child: GestureDetector(
                onTap: () => _scaffoldKey.currentState?.openEndDrawer(),
                child: Container(
                  width: 40, height: 40,
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F1A2E).withOpacity(0.9),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white.withOpacity(0.06)),
                  ),
                  child: Icon(Icons.menu_rounded, color: Colors.white.withOpacity(0.6), size: 20),
                ),
              ),
            ),
          ],
        ),

        bottomNavigationBar: Container(
          margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
          decoration: BoxDecoration(
            color: const Color(0xFF0F1A2E),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: Colors.white.withOpacity(0.05)),
            boxShadow: [
              BoxShadow(color: Colors.black.withOpacity(0.3), blurRadius: 20, offset: const Offset(0, 5)),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(24),
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 6),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: List.generate(items.length, (i) {
                  final isActive = selectedIndex == i;
                  return _NavButton(
                    item: items[i],
                    isActive: isActive,
                    onTap: () {
                      if (!isActive) context.go(items[i].route);
                    },
                  );
                }),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItem {
  final IconData icon, activeIcon;
  final String label, route;
  const _NavItem({required this.icon, required this.activeIcon, required this.label, required this.route});
}

class _DrawerItem {
  final IconData icon;
  final String label, route;
  const _DrawerItem({required this.icon, required this.label, required this.route});
}

class _NavButton extends StatelessWidget {
  final _NavItem item;
  final bool isActive;
  final VoidCallback onTap;

  const _NavButton({required this.item, required this.isActive, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOutCubic,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isActive ? const Color(0xFF10B981).withOpacity(0.12) : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 250),
              child: Icon(
                isActive ? item.activeIcon : item.icon,
                key: ValueKey(isActive),
                color: isActive ? const Color(0xFF10B981) : Colors.white.withOpacity(0.3),
                size: 24,
              ),
            ),
            const SizedBox(height: 4),
            AnimatedDefaultTextStyle(
              duration: const Duration(milliseconds: 250),
              style: TextStyle(
                fontSize: 10,
                fontWeight: isActive ? FontWeight.w800 : FontWeight.w500,
                color: isActive ? const Color(0xFF10B981) : Colors.white.withOpacity(0.3),
              ),
              child: Text(item.label),
            ),
            const SizedBox(height: 2),
            AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeOutCubic,
              width: isActive ? 16 : 0,
              height: 3,
              decoration: BoxDecoration(
                color: const Color(0xFF10B981),
                borderRadius: BorderRadius.circular(2),
                boxShadow: isActive ? [BoxShadow(color: const Color(0xFF10B981).withOpacity(0.5), blurRadius: 6)] : null,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
