import 'package:flutter/material.dart';

import '../../../../shared/theme/app_theme.dart';
import '../../domain/event.dart';

class EventDetailScreen extends StatelessWidget {
  final EventModel? event;

  const EventDetailScreen({super.key, this.event});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        iconTheme: const IconThemeData(color: Colors.white),
        title: Text(
          event != null
              ? '${event!.home.shortName} vs ${event!.away.shortName}'
              : 'Event Detail',
          style: const TextStyle(color: Colors.white, fontSize: 16),
        ),
      ),
      body: const Center(
        child: Text(
          'Event detail\n(coming soon)',
          textAlign: TextAlign.center,
          style: TextStyle(color: Colors.grey, fontSize: 16),
        ),
      ),
    );
  }
}
