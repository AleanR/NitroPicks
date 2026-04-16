import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getMyBets,
  getMyBetsList,
  getUserBetsList,
  getAllBets,
  getRecentWinners,
  addBet,
  removeBet,
} from '../../modules/bets/bets.controllers';
import {
  getBetById,
  deleteBetById,
  getBets,
  getBetsByUser,
  getBetsByUserWithGames,
  BetModel,
} from '../../modules/bets/bets.model';
import { placeBet } from '../../modules/services/bet.service';

vi.mock('../../modules/bets/bets.model', () => ({
  deleteBetById: vi.fn(),
  getBetById: vi.fn(),
  getBets: vi.fn(),
  getBetsByUser: vi.fn(),
  getBetsByUserWithGames: vi.fn(),
  BetModel: {
    find: vi.fn(),
  },
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

      expect(getBetsByUser).toHaveBeenCalledWith('user1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        total: 4,
        won: 2,
        lost: 1,
      });
    });

    it('returns 500 if getBetsByUser throws', async () => {
      req.user = { id: 'user1' };
      (getBetsByUser as any).mockRejectedValue(new Error('DB fail'));

      await getMyBets(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
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

      expect(getBetsByUserWithGames).toHaveBeenCalledWith('user1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(bets);
    });

    it('returns 500 if getBetsByUserWithGames throws', async () => {
      req.user = { id: 'user1' };
      (getBetsByUserWithGames as any).mockRejectedValue(new Error('DB fail'));

      await getMyBetsList(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
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

      expect(getBetsByUserWithGames).toHaveBeenCalledWith('user2');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(bets);
    });

    it('returns 500 if getBetsByUserWithGames throws', async () => {
      req.params = { id: 'user2' };
      (getBetsByUserWithGames as any).mockRejectedValue(new Error('DB fail'));

      await getUserBetsList(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
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

    it('returns 500 if getBets throws', async () => {
      (getBets as any).mockRejectedValue(new Error('DB fail'));

      await getAllBets(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('getRecentWinners', () => {
    it('returns top 3 unique winners sorted by wonAmount', async () => {
      const recentWinningBets = [
        {
          expectedPayout: 300,
          stake: 100,
          updatedAt: new Date('2026-04-10T10:00:00Z'),
          userId: {
            _id: 'u1',
            firstname: 'John',
            lastname: 'Doe',
            username: 'jdoe',
          },
        },
        {
          expectedPayout: 250,
          stake: 100,
          updatedAt: new Date('2026-04-11T10:00:00Z'),
          userId: {
            _id: 'u2',
            firstname: 'Jane',
            lastname: 'Smith',
            username: 'jsmith',
          },
        },
        {
          expectedPayout: 500,
          stake: 100,
          updatedAt: new Date('2026-04-12T10:00:00Z'),
          userId: {
            _id: 'u3',
            firstname: 'Bob',
            lastname: 'Lee',
            username: 'blee',
          },
        },
        {
          expectedPayout: 400,
          stake: 100,
          updatedAt: new Date('2026-04-13T10:00:00Z'),
          userId: {
            _id: 'u1',
            firstname: 'John',
            lastname: 'Doe',
            username: 'jdoe',
          },
        },
      ];

      const populate = vi.fn().mockResolvedValue(recentWinningBets);
      const limit = vi.fn().mockReturnValue({ populate });
      const sort = vi.fn().mockReturnValue({ limit });
      (BetModel.find as any).mockReturnValue({ sort });

      await getRecentWinners(req, res);

      expect(BetModel.find).toHaveBeenCalledWith({ status: 'win' });
      expect(sort).toHaveBeenCalledWith({ updatedAt: -1 });
      expect(limit).toHaveBeenCalledWith(50);
      expect(populate).toHaveBeenCalledWith('userId', 'firstname lastname username');

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        {
          id: 'u3',
          name: 'Bob Lee',
          initials: 'BL',
          username: 'blee',
          wonPoints: '400',
          wonAt: new Date('2026-04-12T10:00:00Z'),
        },
        {
          id: 'u1',
          name: 'John Doe',
          initials: 'JD',
          username: 'jdoe',
          wonPoints: '200',
          wonAt: new Date('2026-04-10T10:00:00Z'),
        },
        {
          id: 'u2',
          name: 'Jane Smith',
          initials: 'JS',
          username: 'jsmith',
          wonPoints: '150',
          wonAt: new Date('2026-04-11T10:00:00Z'),
        },
      ]);
    });

    it('skips bets with missing user data', async () => {
      const recentWinningBets = [
        {
          expectedPayout: 200,
          stake: 100,
          updatedAt: new Date('2026-04-10T10:00:00Z'),
          userId: null,
        },
      ];

      const populate = vi.fn().mockResolvedValue(recentWinningBets);
      const limit = vi.fn().mockReturnValue({ populate });
      const sort = vi.fn().mockReturnValue({ limit });
      (BetModel.find as any).mockReturnValue({ sort });

      await getRecentWinners(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('returns 500 if query fails', async () => {
      const populate = vi.fn().mockRejectedValue(new Error('DB fail'));
      const limit = vi.fn().mockReturnValue({ populate });
      const sort = vi.fn().mockReturnValue({ limit });
      (BetModel.find as any).mockReturnValue({ sort });

      await getRecentWinners(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
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

    it('returns 500 for unexpected errors', async () => {
      req.user = { id: 'user1' };
      req.body = {
        stake: 100,
        legs: [{ gameId: 'g1', team: 'home', odds: 1.8 }],
      };

      (placeBet as any).mockRejectedValue(new Error('Unexpected failure'));

      await addBet(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal server error',
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

    it('returns 500 if removeBet throws unexpectedly', async () => {
      req.params = { betId: 'bet1' };
      req.user = { id: 'user1' };

      (getBetById as any).mockRejectedValue(new Error('DB fail'));

      await removeBet(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal server error',
      });
    });
  });
});