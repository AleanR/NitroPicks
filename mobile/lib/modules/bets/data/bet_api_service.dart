// lib/modules/bets/data/bet_api_service.dart

import 'dart:convert';
import 'package:http/http.dart' as http;
import '../domain/bet.dart';

class BetApiService {
  static const String _baseUrl = 'http://localhost:8080/api';

  final String token;

  const BetApiService({required this.token});

  /// POST /bets
  /// Body: { stake: number, legs: [{ gameId, team, odds }] }
  Future<Bet> placeBet({
    required double stake,
    required List<BetLeg> legs,
  }) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/bets'),
      headers: _headers,
      body: jsonEncode({
        'stake': stake,
        'legs': legs.map((l) => l.toJson()).toList(),
      }),
    );

    final body = jsonDecode(response.body) as Map<String, dynamic>;

    if (response.statusCode == 201) {
      return Bet.fromJson(body['bet'] as Map<String, dynamic>);
    }

    // Surface backend error messages (e.g. "Odds changed too much", "Insufficient points")
    throw Exception(body['message'] ?? 'Failed to place bet');
  }

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      };
}
