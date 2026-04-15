import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getMyBets,
  getMyBetsList,
  getUserBetsList,
  getAllBets,
  addBet,
  removeBet,
} from '../../modules/bets/bets.controllers';
import {
  getBetById,
  deleteBetById,
  getBets,
  getBetsByUser,
  getBetsByUserWithGames,
} from '../../modules/bets/bets.model';
import { placeBet } from '../../modules/services/bet.service';

vi.mock('../../modules/bets/bets.model', () => ({
  createBet: vi.fn(),
  deleteBetById: vi.fn(),
  getBetById: vi.fn(),
  getBets: vi.fn(),
  getBetsByUser: vi.fn(),
  getBetsByUserWithGames: vi.fn(),
}));

vi.mock('../../modules/users/users.model', () => ({
  deductKnightPoints: vi.fn(),
}));

vi.mock('../../modules/services/bet.service', () => ({
  placeBet: vi.fn(),
}));

describe('bets.controllers', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      body: {},
      params: {},
      user: undefined,
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  describe('getMyBets', () => {
    it('returns 401 if unauthorized', async () => {
      await getMyBets(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('returns 200 with bet summary', async () => {
      req.user = { id: 'user1' };

      (getBetsByUser as any).mockResolvedValue([
        { status: 'win' },
        { status: 'win' },
        { status: 'lose' },
        { status: 'active' },
      ]);

      await getMyBets(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        total: 4,
        won: 2,
        lost: 1,
      });
    });
  });

  describe('getMyBetsList', () => {
    it('returns 401 if unauthorized', async () => {
      await getMyBetsList(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('returns 200 with user bets list', async () => {
      req.user = { id: 'user1' };
      const bets = [{ _id: 'b1' }, { _id: 'b2' }];

      (getBetsByUserWithGames as any).mockResolvedValue(bets);

      await getMyBetsList(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(bets);
    });
  });

  describe('getUserBetsList', () => {
    it('returns 400 if user ID is missing', async () => {
      req.params = {};

      await getUserBetsList(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User ID is required' });
    });

    it('returns 200 with requested user bets', async () => {
      req.params = { id: 'user2' };
      const bets = [{ _id: 'b3' }];

      (getBetsByUserWithGames as any).mockResolvedValue(bets);

      await getUserBetsList(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(bets);
    });
  });

  describe('getAllBets', () => {
    it('returns 200 with all bets', async () => {
      const bets = [{ _id: 'b1' }, { _id: 'b2' }];

      (getBets as any).mockResolvedValue(bets);

      await getAllBets(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(bets);
    });
  });

  describe('addBet', () => {
    it('returns 400 if required fields are missing', async () => {
      req.body = {};

      await addBet(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Missing required field(s)',
      });
    });

    it('returns 401 if unauthorized', async () => {
      req.body = { stake: 100, legs: [{}] };

      await addBet(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Unauthorized',
      });
    });

    it('returns 400 if legs is not a non-empty array', async () => {
      req.user = { id: 'user1' };
      req.body = { stake: 100, legs: [] };

      await addBet(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Bets must be non-empty array',
      });
    });

    it('returns 201 on successful bet creation', async () => {
      req.user = { id: 'user1' };
      req.body = {
        stake: 100,
        legs: [{ gameId: 'g1', team: 'home', odds: 1.8 }],
      };

      const fakeBet = { _id: 'bet1', stake: 100 };
      (placeBet as any).mockResolvedValue(fakeBet);

      await addBet(req, res);

      expect(placeBet).toHaveBeenCalledWith('user1', 100, req.body.legs);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Bet created successfully',
        bet: fakeBet,
      });
    });

    it('returns 400 for business logic errors', async () => {
      req.user = { id: 'user1' };
      req.body = {
        stake: 100,
        legs: [{ gameId: 'g1', team: 'home', odds: 1.8 }],
      };

      (placeBet as any).mockRejectedValue(new Error('Insufficient funds'));

      await addBet(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Insufficient funds',
      });
    });
  });

  describe('removeBet', () => {
    it('returns 400 if bet ID is missing', async () => {
      req.params = {};

      await removeBet(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Bet ID is required',
      });
    });

    it('returns 401 if unauthorized', async () => {
      req.params = { betId: 'bet1' };

      await removeBet(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Unauthorized',
      });
    });

    it('returns 400 if bet is not found', async () => {
      req.params = { betId: 'bet1' };
      req.user = { id: 'user1' };

      (getBetById as any).mockResolvedValue(null);

      await removeBet(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Bet not found',
      });
    });

    it('returns 400 if bet is already expired', async () => {
      req.params = { betId: 'bet1' };
      req.user = { id: 'user1' };

      (getBetById as any).mockResolvedValue({
        _id: 'bet1',
        status: 'win',
      });

      await removeBet(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Bet is already expired',
      });
    });

    it('returns 200 on successful bet removal', async () => {
      req.params = { betId: 'bet1' };
      req.user = { id: 'user1' };

      (getBetById as any).mockResolvedValue({
        _id: 'bet1',
        status: 'active',
      });
      (deleteBetById as any).mockResolvedValue(undefined);

      await removeBet(req, res);

      expect(deleteBetById).toHaveBeenCalledWith('bet1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Bet removed successfully',
      });
    });
  });
});