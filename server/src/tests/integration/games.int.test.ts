import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApp } from '../../app';

import {
  GameModel,
  getGames,
} from '../../modules/games/games.model';

import { getUserById } from '../../modules/users/users.model';
import { verifyToken } from '../../helpers/jwt';

/*
========================
MOCK DEPENDENCIES
========================
*/

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ error: null }),
    },
  })),
}), { virtual: true });

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

vi.mock('../../modules/users/users.model', () => ({
  getUserById: vi.fn(),
}));

vi.mock('../../helpers/jwt', () => ({
  verifyToken: vi.fn(),
  createToken: vi.fn(),
}));

vi.mock('../../modules/services/cancel.service', () => ({
  refund: vi.fn(),
}));

vi.mock('../../modules/services/results.service', () => ({
  gameOver: vi.fn(),
}));

vi.mock('../../helpers/time', () => ({
  formatTime: vi.fn(() => '17:00'),
}));

/*
========================
TEST SUITE
========================
*/

describe('Games integration', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createApp();
  });

  /*
  ========================
  PUBLIC ROUTE
  ========================
  */

  it('GET /api/games returns 200 (public route)', async () => {
    const now = new Date();

    const games = [
      {
        toObject: () => ({
          _id: 'g1',
          status: 'upcoming',
          bettingClosesAt: new Date(now.getTime() + 60_000),
        }),
      },
    ];

    const sortMock = vi.fn().mockResolvedValue(games);
    const selectMock = vi.fn().mockReturnValue({ sort: sortMock });

    (GameModel.find as any).mockReturnValue({
      select: selectMock,
    });

    const res = await request(app).get('/api/games');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        _id: 'g1',
        status: 'upcoming',
        bettingClosesAt: expect.any(String),
      },
    ]);
  });

  /*
  ========================
  UNAUTHORIZED ROUTES
  ========================
  */

  it('GET /api/games/search returns 401 if not authenticated', async () => {
    const res = await request(app).get('/api/games/search?query=UCF&page=1');

    expect(res.status).toBe(401);
  });

  it('GET /api/games/all returns 401 if not authenticated', async () => {
    const res = await request(app).get('/api/games/all');

    expect(res.status).toBe(401);
  });

  it('POST /api/games returns 401 if not authenticated', async () => {
    const res = await request(app)
      .post('/api/games')
      .send({
        homeTeam: 'UCF Knights',
        awayTeam: 'Houston Cougars',
        date: '2099-12-31',
        time: '5:00 PM',
        emoji: 'Basketball 🏀',
        homeOdds: 2,
        awayOdds: 3,
      });

    expect(res.status).toBe(401);
  });

  it('PATCH /api/games/:id returns 401 if not authenticated', async () => {
    const res = await request(app)
      .patch('/api/games/g1')
      .send({
        homeTeam: 'UCF Knights',
        awayTeam: 'Houston Cougars',
        homeOdds: 2,
        awayOdds: 3,
        emoji: 'Basketball 🏀',
      });

    expect(res.status).toBe(401);
  });

  it('PATCH /api/games/:id/score returns 401 if not authenticated', async () => {
    const res = await request(app)
      .patch('/api/games/g1/score')
      .send({
        team: 'home',
        score: 2,
      });

    expect(res.status).toBe(401);
  });

  it('DELETE /api/games/:id/cancel returns 401 if not authenticated', async () => {
    const res = await request(app).delete('/api/games/g1/cancel');

    expect(res.status).toBe(401);
  });

  it('DELETE /api/games/:id returns 401 if not authenticated', async () => {
    const res = await request(app).delete('/api/games/g1');

    expect(res.status).toBe(401);
  });

  it('PUT /api/games/:id/end returns 401 if not authenticated', async () => {
    const res = await request(app).put('/api/games/g1/end');

    expect(res.status).toBe(401);
  });

  /*
  ========================
  AUTHENTICATED NON-ADMIN
  ========================
  */

  it('GET /api/games/all returns 401 for authenticated non-admin user', async () => {
    (verifyToken as any).mockResolvedValue({ id: 'user1' });

    (getUserById as any).mockResolvedValue({
      _id: 'user1',
      role: 'user',
    });

    const res = await request(app)
      .get('/api/games/all')
      .set('Cookie', ['token=fake-token']);

    expect(res.status).toBe(401);
  });

  /*
  ========================
  AUTHENTICATED ADMIN
  ========================
  */

  it('GET /api/games/all returns 200 for authenticated admin user', async () => {
    (verifyToken as any).mockResolvedValue({ id: 'admin1' });

    (getUserById as any).mockResolvedValue({
      _id: 'admin1',
      role: 'admin',
    });

    (getGames as any).mockResolvedValue([{ _id: 'g1' }]);

    const res = await request(app)
      .get('/api/games/all')
      .set('Cookie', ['token=fake-token']);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ _id: 'g1' }]);
  });
});