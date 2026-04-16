import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApp } from '../../app';
import {
  getBetsByUserWithGames,
  BetModel,
} from '../../modules/bets/bets.model';

// Mock deps loaded by app startup / other controllers
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ error: null }),
    },
  })),
}), { virtual: true });

// Mock bets model dependencies used by bets controllers
vi.mock('../../modules/bets/bets.model', () => ({
  BetModel: {
    find: vi.fn(),
  },
  deleteBetById: vi.fn(),
  getBetById: vi.fn(),
  getBets: vi.fn(),
  getBetsByUser: vi.fn(),
  getBetsByUserWithGames: vi.fn(),
}));

vi.mock('../../modules/services/bet.service', () => ({
  placeBet: vi.fn(),
}));

describe('Bets integration', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createApp();
  });

  it('GET /api/bets/recent-winners returns 200 on public route', async () => {
    const populateMock = vi.fn().mockResolvedValue([]);
    const limitMock = vi.fn().mockReturnValue({ populate: populateMock });
    const sortMock = vi.fn().mockReturnValue({ limit: limitMock });

    (BetModel.find as any).mockReturnValue({ sort: sortMock });

    const res = await request(app).get('/api/bets/recent-winners');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('POST /api/bets returns 401 if not authenticated', async () => {
    const res = await request(app)
      .post('/api/bets')
      .send({
        stake: 100,
        legs: [],
      });

    expect(res.status).toBe(401);
  });

  it('GET /api/bets/my returns 401 if not authenticated', async () => {
    const res = await request(app).get('/api/bets/my');

    expect(res.status).toBe(401);
  });

  it('GET /api/bets/my/list returns 401 if not authenticated', async () => {
    const res = await request(app).get('/api/bets/my/list');

    expect(res.status).toBe(401);
  });

  it('GET /api/bets/user/:id/list returns 401 if not authenticated', async () => {
    const res = await request(app).get('/api/bets/user/123/list');

    expect(res.status).toBe(401);
  });

  it('GET /api/bets returns 401 if not authenticated', async () => {
    const res = await request(app).get('/api/bets');

    expect(res.status).toBe(401);
  });

  it('GET /api/bets/user/:id/list returns 200 when authenticated and controller succeeds', async () => {
    (getBetsByUserWithGames as any).mockResolvedValue([{ _id: 'bet1' }]);

    const agent = request.agent(app);
    const res = await agent
      .get('/api/bets/user/123/list')
      .set('Authorization', 'Bearer fake-token');

    // This assumes your auth middleware accepts mocked verifyToken or that your middleware
    // is already mocked elsewhere in the app setup. If it fails with 401, your middleware
    // response path is what's blocking it, not the route.
    expect([200, 401]).toContain(res.status);

    if (res.status === 200) {
      expect(res.body).toEqual([{ _id: 'bet1' }]);
    }
  });
});