// lib/modules/bets/data/bet_api_service.dart

import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../../core/constants/api_constants.dart';
import '../domain/bet.dart';

class BetApiService {
  final String token;

  const BetApiService({required this.token});

  /// POST /bets — place a new bet.
  Future<Bet> placeBet({
    required double stake,
    required List<BetLeg> legs,
  }) async {
    final response = await http.post(
      Uri.parse('${ApiConstants.baseUrl}/bets'),
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

    throw Exception(body['message'] ?? 'Failed to place bet');
  }

  /// GET /bets/my/list — fetch all bets for the authenticated user,
  /// with game info populated on each leg.
  Future<List<Bet>> getMyBets() async {
    final response = await http.get(
      Uri.parse('${ApiConstants.baseUrl}/bets/my/list'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      final list = jsonDecode(response.body) as List<dynamic>;
      return list
          .map((j) => Bet.fromJson(j as Map<String, dynamic>))
          .toList();
    }

    final body = jsonDecode(response.body) as Map<String, dynamic>;
    throw Exception(body['message'] ?? 'Failed to load bets');
  }

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      };
}
