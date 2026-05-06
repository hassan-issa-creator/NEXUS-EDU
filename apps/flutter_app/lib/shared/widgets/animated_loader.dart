import 'dart:math';
import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

/// Reusable animated loading widget with multiple styles
class AnimatedLoader extends StatefulWidget {
  final LoaderStyle style;
  final Color? color;
  final double size;

  const AnimatedLoader({
    super.key,
    this.style = LoaderStyle.dots,
    this.color,
    this.size = 10,
  });

  @override
  State<AnimatedLoader> createState() => _AnimatedLoaderState();
}

class _AnimatedLoaderState extends State<AnimatedLoader> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final color = widget.color ?? AppColors.primary;

    switch (widget.style) {
      case LoaderStyle.dots:
        return _buildDots(color);
      case LoaderStyle.pulse:
        return _buildPulse(color);
      case LoaderStyle.spinner:
        return _buildSpinner(color);
    }
  }

  Widget _buildDots(Color color) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(3, (i) {
        return AnimatedBuilder(
          animation: _controller,
          builder: (_, __) {
            final value = sin((_controller.value * 2 * pi) - (i * 0.8)).clamp(0.0, 1.0);
            return Container(
              margin: const EdgeInsets.symmetric(horizontal: 3),
              width: widget.size,
              height: widget.size,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: color.withOpacity(0.3 + value * 0.7),
              ),
            );
          },
        );
      }),
    );
  }

  Widget _buildPulse(Color color) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (_, __) {
        final scale = 0.8 + (sin(_controller.value * 2 * pi) + 1) * 0.2;
        return Transform.scale(
          scale: scale,
          child: Container(
            width: widget.size * 3,
            height: widget.size * 3,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: color.withOpacity(0.2),
              border: Border.all(color: color.withOpacity(0.5), width: 2),
            ),
          ),
        );
      },
    );
  }

  Widget _buildSpinner(Color color) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (_, __) {
        return Transform.rotate(
          angle: _controller.value * 2 * pi,
          child: SizedBox(
            width: widget.size * 3,
            height: widget.size * 3,
            child: CircularProgressIndicator(
              strokeWidth: 2.5,
              valueColor: AlwaysStoppedAnimation(color),
              backgroundColor: color.withOpacity(0.1),
            ),
          ),
        );
      },
    );
  }
}

enum LoaderStyle { dots, pulse, spinner }
