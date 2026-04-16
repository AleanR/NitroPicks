// lib/modules/events/data/event_api_service.dart

import 'dart:convert';
import 'package:http/http.dart' as http;
import '../domain/event.dart';
import '../../../core/constants/api_constants.dart';

class EventApiService {
  final String token;

  const EventApiService({required this.token});

  /// GET /games — all upcoming/live games, no page limit.
  /// Used for the main events list when there is no search query.
  Future<List<EventModel>> getPublicGames() async {
    final uri = Uri.parse('${ApiConstants.baseUrl}/games');
    final response = await http.get(uri, headers: _headers);

    if (response.statusCode == 200) {
      final results = jsonDecode(response.body) as List<dynamic>;
      return results
          .map((g) => EventModel.fromJson(g as Map<String, dynamic>))
          .toList();
    }

    throw Exception('Failed to load events: ${response.statusCode}');
  }

  /// GET /games/search?query=&page=1 — paginated search (7 per page).
  /// Used only when the user has typed a search term.
  Future<List<EventModel>> searchGames({
    required String query,
    int page = 1,
  }) async {
    final uri = Uri.parse('${ApiConstants.baseUrl}/games/search').replace(queryParameters: {
      'query': query,
      'page': page.toString(),
    });

    final response = await http.get(uri, headers: _headers);

    if (response.statusCode == 200) {
      final body = jsonDecode(response.body) as Map<String, dynamic>;
      final results = body['results'] as List<dynamic>;
      return results
          .map((g) => EventModel.fromJson(g as Map<String, dynamic>))
          .toList();
    }

    throw Exception('Failed to load events: ${response.statusCode}');
  }

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      };
}
