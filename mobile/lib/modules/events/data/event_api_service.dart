// lib/modules/events/data/event_api_service.dart

import 'dart:convert';
import 'package:http/http.dart' as http;
import '../domain/event.dart';

class EventApiService {
  static const String _baseUrl = 'http://localhost:8080/api';

  final String token;

  const EventApiService({required this.token});

  /// GET /games/search?query=&page=1
  /// Returns paginated list of games. Pass empty query for all.
  Future<List<EventModel>> searchGames({
    String query = '',
    int page = 1,
  }) async {
    final uri = Uri.parse('$_baseUrl/games/search').replace(queryParameters: {
      'query': query.isEmpty ? ' ' : query, // backend requires non-empty query
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
