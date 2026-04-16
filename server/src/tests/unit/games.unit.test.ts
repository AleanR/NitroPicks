import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAllGames,
  searchGames,
  addGame,
  updateGame,
  updateScore,
  endGame,
  cancelGame,
  deleteGame,
  getPublicGames,
} from '../../modules/games/games.controllers';
import {
  getGames,
  getGameById,
  createGame,
  deleteGameById,
  GameModel,
} from '../../modules/games/games.model';
import { refund } from '../../modules/services/cancel.service';
import { gameOver } from '../../modules/services/results.service';
import { formatTime } from '../../helpers/time';

vi.mock('../../modules/games/games.model', () => ({
  getGames: vi.fn(),
  getGameById: vi.fn(),
  createGame: vi.fn(),
  deleteGameById: vi.fn(),
  GameModel: {
    countDocuments: vi.fn(),
    find: vi.fn(),
  },
}));

vi.mock('../../modules/services/cancel.service', () => ({
  refund: vi.fn(),
}));

vi.mock('../../modules/services/results.service', () => ({
  gameOver: vi.fn(),
}));

vi.mock('../../helpers/time', () => ({
  formatTime: vi.fn(),
}));

describe('games.controllers', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      body: {},
      params: {},
      query: {},
      user: undefined,
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  describe('getAllGames', () => {
    it('returns 200 with all games', async () => {
      const games = [{ _id: 'g1' }, { _id: 'g2' }];
      (getGames as any).mockResolvedValue(games);

      await getAllGames(req, res);

      expect(getGames).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(games);
    });

    it('returns 500 if getGames throws', async () => {
      (getGames as any).mockRejectedValue(new Error('DB fail'));

      await getAllGames(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('searchGames', () => {
    it('returns 400 if query is missing', async () => {
      req.query = { page: '1' };

      await searchGames(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Search query is required',
        success: false,
      });
    });

    it('returns 400 if page is missing', async () => {
      req.query = { query: 'UCF' };

      await searchGames(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Missing page number',
        success: false,
      });
    });

    it('returns 200 with paginated results', async () => {
      req.query = { query: 'UCF active', page: '1' };

      const games = [{ _id: 'g1' }];
      const skipMock = vi.fn().mockResolvedValue(games);
      const limitMock = vi.fn().mockReturnValue({ skip: skipMock });
      const selectMock = vi.fn().mockReturnValue({ limit: limitMock });

      (GameModel.countDocuments as any).mockResolvedValue(1);
      (GameModel.find as any).mockReturnValue({ select: selectMock });

      await searchGames(req, res);

      expect(GameModel.countDocuments).toHaveBeenCalled();
      expect(GameModel.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        page: '1',
        total: 1,
        totalPages: 1,
        results: games,
      });
    });

    it('returns 500 if searchGames throws', async () => {
      req.query = { query: 'UCF', page: '1' };
      (GameModel.countDocuments as any).mockRejectedValue(new Error('DB fail'));

      await searchGames(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('addGame', () => {
    it('returns 400 if required fields are missing', async () => {
      req.body = {};

      await addGame(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Missing required field(s)',
      });
    });

    it('returns 400 if team names are not strings', async () => {
      req.body = {
        homeTeam: 123,
        awayTeam: 'Houston Cougars',
        date: '2099-12-31',
        time: '5:00 PM',
        emoji: 'Basketball 🏀',
        homeOdds: 2,
        awayOdds: 3,
      };

      await addGame(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Team names must be string',
      });
    });

    it('returns 400 if betting window is invalid', async () => {
      req.body = {
        homeTeam: 'UCF Knights',
        awayTeam: 'Houston Cougars',
        date: '2000-01-01',
        time: '5:00 PM',
        emoji: 'Basketball 🏀',
        homeOdds: 2,
        awayOdds: 3,
      };

      (formatTime as any).mockReturnValue('17:00');

      await addGame(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid betting window',
      });
    });

    it('returns 201 on successful game creation', async () => {
      req.body = {
        homeTeam: 'UCF Knights',
        awayTeam: 'Houston Cougars',
        date: '2099-12-31',
        time: '5:00 PM',
        emoji: 'Basketball 🏀',
        homeOdds: 2,
        awayOdds: 3,
      };

      (formatTime as any).mockReturnValue('17:00');
      (createGame as any).mockResolvedValue(undefined);

      await addGame(req, res);

      expect(createGame).toHaveBeenCalledWith(
        expect.objectContaining({
          sport: 'Basketball',
          homeTeam: 'UCF Knights',
          awayTeam: 'Houston Cougars',
          emoji: '🏀',
          status: 'upcoming',
          homeWin: { label: 'Knights Win', odds: 2 },
          awayWin: { label: 'Cougars Win', odds: 3 },
        })
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Game created successfully',
      });
    });

    it('returns 500 if createGame throws', async () => {
      req.body = {
        homeTeam: 'UCF Knights',
        awayTeam: 'Houston Cougars',
        date: '2099-12-31',
        time: '5:00 PM',
        emoji: 'Basketball 🏀',
        homeOdds: 2,
        awayOdds: 3,
      };

      (formatTime as any).mockReturnValue('17:00');
      (createGame as any).mockRejectedValue(new Error('DB fail'));

      await addGame(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('updateGame', () => {
    it('returns 400 if unauthorized', async () => {
      req.params = { id: 'g1' };

      await updateGame(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Unauthorized',
      });
    });

    it('returns 400 if game ID is missing', async () => {
      req.user = { id: 'admin1' };
      req.params = {};

      await updateGame(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Game ID is required',
      });
    });

    it('returns 400 if odds are invalid', async () => {
      req.user = { id: 'admin1' };
      req.params = { id: 'g1' };
      req.body = {
        homeOdds: 'abc',
        awayOdds: 2,
      };

      await updateGame(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Odds must be integers',
      });
    });

    it('returns 400 if game is not found', async () => {
      req.user = { id: 'admin1' };
      req.params = { id: 'g1' };
      req.body = {
        homeOdds: 2,
        awayOdds: 3,
      };

      (getGameById as any).mockResolvedValue(null);

      await updateGame(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Game not found',
      });
    });

    it('returns 200 on successful game update', async () => {
      req.user = { id: 'admin1' };
      req.params = { id: 'g1' };
      req.body = {
        homeTeam: 'UCF Knights',
        awayTeam: 'Houston Cougars',
        date: '2099-12-31',
        time: '5:00 PM',
        emoji: 'Basketball 🏀',
        homeOdds: 2,
        awayOdds: 3,
      };

      const fakeGame = {
        sport: '',
        homeTeam: '',
        awayTeam: '',
        bettingClosesAt: new Date(),
        homeWin: { odds: 0 },
        awayWin: { odds: 0 },
        emoji: '',
        save: vi.fn().mockResolvedValue(undefined),
      };

      (formatTime as any).mockReturnValue('17:00');
      (getGameById as any).mockResolvedValue(fakeGame);

      await updateGame(req, res);

      expect(fakeGame.sport).toBe('Basketball');
      expect(fakeGame.homeTeam).toBe('UCF Knights');
      expect(fakeGame.awayTeam).toBe('Houston Cougars');
      expect(fakeGame.homeWin.odds).toBe(2);
      expect(fakeGame.awayWin.odds).toBe(3);
      expect(fakeGame.emoji).toBe('🏀');
      expect(fakeGame.save).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Game updated successfully',
      });
    });

    it('returns 500 if save throws', async () => {
      req.user = { id: 'admin1' };
      req.params = { id: 'g1' };
      req.body = {
        homeTeam: 'UCF Knights',
        awayTeam: 'Houston Cougars',
        date: '2099-12-31',
        time: '5:00 PM',
        emoji: 'Basketball 🏀',
        homeOdds: 2,
        awayOdds: 3,
      };

      const fakeGame = {
        sport: '',
        homeTeam: '',
        awayTeam: '',
        bettingClosesAt: new Date(),
        homeWin: { odds: 0 },
        awayWin: { odds: 0 },
        emoji: '',
        save: vi.fn().mockRejectedValue(new Error('Save failed')),
      };

      (formatTime as any).mockReturnValue('17:00');
      (getGameById as any).mockResolvedValue(fakeGame);

      await updateGame(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('updateScore', () => {
    it('returns 400 if game ID is missing', async () => {
      req.params = {};
      req.body = { team: 'home', score: 3 };

      await updateScore(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Game ID is required',
      });
    });

    it('returns 400 if required fields are missing', async () => {
      req.params = { id: 'g1' };
      req.body = {};

      await updateScore(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Missing required field(s)',
      });
    });

    it('returns 400 if game is not found', async () => {
      req.params = { id: 'g1' };
      req.body = { team: 'home', score: 2 };

      (getGameById as any).mockResolvedValue(null);

      await updateScore(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Game not found',
      });
    });

    it('updates home score successfully', async () => {
      req.params = { id: 'g1' };
      req.body = { team: 'home', score: 2 };

      const fakeGame = {
        scoreHome: 5,
        scoreAway: 3,
        save: vi.fn().mockResolvedValue(undefined),
      };

      (getGameById as any).mockResolvedValue(fakeGame);

      await updateScore(req, res);

      expect(fakeGame.scoreHome).toBe(7);
      expect(fakeGame.scoreAway).toBe(3);
      expect(fakeGame.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Score updated successfully',
      });
    });

    it('updates away score successfully', async () => {
      req.params = { id: 'g1' };
      req.body = { team: 'away', score: 4 };

      const fakeGame = {
        scoreHome: 5,
        scoreAway: 3,
        save: vi.fn().mockResolvedValue(undefined),
      };

      (getGameById as any).mockResolvedValue(fakeGame);

      await updateScore(req, res);

      expect(fakeGame.scoreHome).toBe(5);
      expect(fakeGame.scoreAway).toBe(7);
      expect(fakeGame.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Score updated successfully',
      });
    });

    it('returns 500 if updateScore throws', async () => {
      req.params = { id: 'g1' };
      req.body = { team: 'home', score: 2 };

      (getGameById as any).mockRejectedValue(new Error('DB fail'));

      await updateScore(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('endGame', () => {
    it('returns 400 if unauthorized', async () => {
      req.params = { id: 'g1' };

      await endGame(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Unauthorized',
      });
    });

    it('returns 400 if game ID is missing', async () => {
      req.user = { id: 'admin1' };
      req.params = {};

      await endGame(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Game ID is required',
      });
    });

    it('returns 200 on successful game end', async () => {
      req.user = { id: 'admin1' };
      req.params = { id: 'g1' };

      (gameOver as any).mockResolvedValue(undefined);

      await endGame(req, res);

      expect(gameOver).toHaveBeenCalledWith('g1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Game ended successfully',
      });
    });

    it('returns 500 if gameOver throws', async () => {
      req.user = { id: 'admin1' };
      req.params = { id: 'g1' };

      (gameOver as any).mockRejectedValue(new Error('Service fail'));

      await endGame(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('cancelGame', () => {
    it('returns 400 if unauthorized', async () => {
      req.params = { id: 'g1' };

      await cancelGame(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Unauthorized',
      });
    });

    it('returns 400 if game ID is missing', async () => {
      req.user = { id: 'admin1' };
      req.params = {};

      await cancelGame(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Game ID is required',
      });
    });

    it('returns 200 on successful game cancellation', async () => {
      req.user = { id: 'admin1' };
      req.params = { id: 'g1' };

      (refund as any).mockResolvedValue(undefined);

      await cancelGame(req, res);

      expect(refund).toHaveBeenCalledWith('g1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Game cancelled and all bets refunded',
      });
    });

    it('returns 500 if refund throws', async () => {
      req.user = { id: 'admin1' };
      req.params = { id: 'g1' };

      (refund as any).mockRejectedValue(new Error('Refund fail'));

      await cancelGame(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('deleteGame', () => {
    it('returns 400 if unauthorized', async () => {
      req.params = { id: 'g1' };

      await deleteGame(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Unauthorized',
      });
    });

    it('returns 400 if game ID is missing', async () => {
      req.user = { id: 'admin1' };
      req.params = {};

      await deleteGame(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Game ID is required',
      });
    });

    it('returns 404 if game is not found', async () => {
      req.user = { id: 'admin1' };
      req.params = { id: 'g1' };

      (getGameById as any).mockResolvedValue(null);

      await deleteGame(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Game not found',
      });
    });

    it('returns 200 on successful game deletion', async () => {
      req.user = { id: 'admin1' };
      req.params = { id: 'g1' };

      (getGameById as any).mockResolvedValue({ _id: 'g1' });
      (deleteGameById as any).mockResolvedValue(undefined);

      await deleteGame(req, res);

      expect(deleteGameById).toHaveBeenCalledWith('g1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Game deleted',
      });
    });

    it('returns 500 if deleteGame throws', async () => {
      req.user = { id: 'admin1' };
      req.params = { id: 'g1' };

      (getGameById as any).mockRejectedValue(new Error('DB fail'));

      await deleteGame(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('getPublicGames', () => {
    it('returns 200 with transformed public games', async () => {
      const now = new Date();

      const games = [
        {
          toObject: () => ({
            _id: 'g1',
            status: 'upcoming',
            bettingClosesAt: new Date(now.getTime() + 60_000),
          }),
        },
        {
          toObject: () => ({
            _id: 'g2',
            status: 'upcoming',
            bettingClosesAt: new Date(now.getTime() - 60_000),
          }),
        },
        {
          toObject: () => ({
            _id: 'g3',
            status: 'finished',
            bettingClosesAt: new Date(now.getTime() - 60_000),
          }),
        },
      ];

      const sortMock = vi.fn().mockResolvedValue(games);
      const selectMock = vi.fn().mockReturnValue({ sort: sortMock });

      (GameModel.find as any).mockReturnValue({
        select: selectMock,
      });

      await getPublicGames(req, res);

      expect(GameModel.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        {
          _id: 'g1',
          status: 'upcoming',
          bettingClosesAt: expect.any(Date),
        },
        {
          _id: 'g2',
          status: 'live',
          bettingClosesAt: expect.any(Date),
        },
        {
          _id: 'g3',
          status: 'finished',
          bettingClosesAt: expect.any(Date),
        },
      ]);
    });

    it('returns 500 if getPublicGames throws', async () => {
      (GameModel.find as any).mockImplementation(() => {
        throw new Error('DB fail');
      });

      await getPublicGames(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });
});