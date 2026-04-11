// lib/modules/events/data/event_repository.dart

import '../domain/event.dart';
import 'event_api_service.dart';

class EventRepository {
  final EventApiService _service;

  const EventRepository({required EventApiService service})
      : _service = service;

  Future<List<EventModel>> getEvents({String query = '', int page = 1}) async {
    if (query.isEmpty) {
      return _service.getPublicGames();
    }
    return _service.searchGames(query: query, page: page);
  }
}
