import 'dart:convert';

import 'package:http/http.dart' as http;

import '../../../core/constants/api_constants.dart';
import '../../../core/errors/app_exception.dart';
import '../domain/account.dart';

class EarnPointsResult {
  final String message;
  final int knightPoints;

  const EarnPointsResult({
    required this.message,
    required this.knightPoints,
  });
}

class AccountApiService {
  AccountApiService({
    required this.token,
    http.Client? client,
  }) : _client = client ?? http.Client();

  final String token;
  final http.Client _client;

  Future<Account> getCurrentAccount() async {
    final response = await _client.get(
      Uri.parse('${ApiConstants.baseUrl}/users/me'),
      headers: _headers,
    );

    final body = _decodeResponse(
      response,
      fallbackMessage: 'Unable to load your account.',
    );

    return Account.fromJson(body);
  }

  Future<Map<String, int>> getBetStats() async {
    final response = await _client.get(
      Uri.parse('${ApiConstants.baseUrl}/bets/my'),
      headers: _headers,
    );

    final body = _decodeResponse(
      response,
      fallbackMessage: 'Unable to load bet stats.',
    );

    return {
      'total': (body['total'] as num?)?.toInt() ?? 0,
      'won':   (body['won']   as num?)?.toInt() ?? 0,
      'lost':  (body['lost']  as num?)?.toInt() ?? 0,
    };
  }

  Future<EarnPointsResult> earnPoints({required String code}) async {
    final response = await _client.post(
      Uri.parse('${ApiConstants.baseUrl}/users/earn-points'),
      headers: _headers,
      body: jsonEncode({'code': code}),
    );

    final body = _decodeResponse(
      response,
      fallbackMessage: 'Unable to load credits right now.',
    );

    final points = body['knightPoints'];
    return EarnPointsResult(
      message: body['message']?.toString() ?? 'KnightPoints added.',
      knightPoints:
          points is num ? points.toInt() : int.tryParse('${points ?? ''}') ?? 0,
    );
  }

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      };

  Map<String, dynamic> _decodeResponse(
    http.Response response, {
    required String fallbackMessage,
  }) {
    final body = response.body.isNotEmpty
        ? jsonDecode(response.body) as Map<String, dynamic>
        : <String, dynamic>{};

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return body;
    }

    throw AppException(body['message']?.toString() ?? fallbackMessage);
  }
}
