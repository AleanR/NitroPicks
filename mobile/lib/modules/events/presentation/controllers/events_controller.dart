// lib/modules/events/presentation/controllers/events_controller.dart

import 'package:flutter/foundation.dart';
import '../../data/event_repository.dart';
import '../../domain/event.dart';

class EventsController extends ChangeNotifier {
  final EventRepository _repository;

  EventsController({required EventRepository repository})
      : _repository = repository;

  List<EventModel> _events = [];
  bool _isLoading = false;
  String? _error;

  List<EventModel> get events => _events;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadEvents({String query = ''}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _events = await _repository.getEvents(query: query);
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
