// lib/modules/rewards/data/rewards_api_service.dart

import 'dart:convert';
import 'package:http/http.dart' as http;
import '../domain/redemption.dart';
import '../domain/reward.dart';
import '../../../core/constants/api_constants.dart';

class RewardsApiService {
  static const _base = ApiConstants.baseUrl;

  final String token;
  const RewardsApiService({required this.token});

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      };

  Future<List<Reward>> getRewards() async {
    final res = await http.get(Uri.parse('$_base/rewards'), headers: _headers);
    if (res.statusCode == 200) {
      final List data = jsonDecode(res.body);
      return data.map((j) => Reward.fromJson(j as Map<String, dynamic>)).toList();
    }
    throw Exception('Failed to load rewards (${res.statusCode})');
  }

  Future<Map<String, dynamic>> redeemReward({
    required String userId,
    required String rewardId,
  }) async {
    final res = await http.post(
      Uri.parse('$_base/users/$userId/redeem'),
      headers: _headers,
      body: jsonEncode({'rewardId': rewardId}),
    );
    final body = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode == 200) return body;
    throw Exception(body['message']?.toString() ?? 'Redemption failed');
  }

  Future<List<Redemption>> getRedemptions({required String userId}) async {
    final res = await http.get(
      Uri.parse('$_base/users/$userId/redemptions'),
      headers: _headers,
    );
    if (res.statusCode == 200) {
      final List data = jsonDecode(res.body);
      return data.map((j) => Redemption.fromJson(j as Map<String, dynamic>)).toList();
    }
    throw Exception('Failed to load redemptions (${res.statusCode})');
  }
}
