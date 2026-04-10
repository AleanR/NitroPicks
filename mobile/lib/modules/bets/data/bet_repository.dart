// lib/modules/bets/data/bet_repository.dart

import '../domain/bet.dart';
import 'bet_api_service.dart';

class BetRepository {
  final BetApiService _service;

  const BetRepository({required BetApiService service}) : _service = service;

  Future<Bet> placeBet({
    required double stake,
    required List<BetLeg> legs,
  }) async {
    return _service.placeBet(stake: stake, legs: legs);
  }
}
