import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApp } from '../../app';
import { getUserById, getUsers } from '../../modules/users/users.model';
import { BetModel } from '../../modules/bets/bets.model';

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ error: null }),
    },
  })),
}), { virtual: true });

vi.mock('../../modules/users/users.model', () => ({
  deleteUserById: vi.fn(),
  getUsers: vi.fn(),
  updateUserById: vi.fn(),
  getUserById: vi.fn(),
  UserModel: {
    findById: vi.fn(),
    countDocuments: vi.fn(),
    find: vi.fn(),
  },
}));

vi.mock('../../modules/bets/bets.model', () => ({
  BetModel: {
    aggregate: vi.fn(),
  },
}));

vi.mock('../../modules/services/email.service', () => ({
  sendSupportEmail: vi.fn(),
  sendEmailVerifOTP: vi.fn(),
  sendPassResetToken: vi.fn(),
}));

vi.mock('../../helpers/jwt', () => ({
  verifyToken: vi.fn(),
  createToken: vi.fn(),
}));

vi.mock('../../helpers', () => ({
  genResetToken: vi.fn(),
  hashPassword: vi.fn(),
  comparePassword: vi.fn(),
}));

describe('Users integration', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createApp();
  });

  it('GET /api/users/me returns 401 if not authenticated', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
  });

  it('POST /api/users/earn-points returns 401 if not authenticated', async () => {
    const res = await request(app)
      .post('/api/users/earn-points')
      .send({ code: '1234567812345678' });

    expect(res.status).toBe(401);
  });

  it('GET /api/users returns 401 if not authenticated', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
  });

  it('DELETE /api/users/:id returns 401 if not authenticated', async () => {
    const res = await request(app).delete('/api/users/u1');
    expect(res.status).toBe(401);
  });

  it('PATCH /api/users/:id returns 401 if not authenticated', async () => {
    const res = await request(app)
      .patch('/api/users/u1')
      .send({ major: 'CS' });

    expect(res.status).toBe(401);
  });

  it('GET /api/users/search returns 401 if not authenticated', async () => {
    const res = await request(app).get('/api/users/search?query=jase&page=1');
    expect(res.status).toBe(401);
  });

  it('GET /api/users/:id/redemptions returns 401 if not authenticated', async () => {
    const res = await request(app).get('/api/users/u1/redemptions');
    expect(res.status).toBe(401);
  });

  it('GET /api/users/:id/ticket-redemptions returns 401 if not authenticated', async () => {
    const res = await request(app).get('/api/users/u1/ticket-redemptions');
    expect(res.status).toBe(401);
  });

  it('POST /api/users/support/contact returns 401 if not authenticated', async () => {
    const res = await request(app)
      .post('/api/users/support/contact')
      .send({ subject: 'Help', message: 'Test' });

    expect(res.status).toBe(401);
  });

  it('GET /api/users/count returns 200 (public route)', async () => {
    (getUsers as any).mockResolvedValue([
      { username: 'admin' },
      { username: 'jaset' },
      { username: 'amyl' },
    ]);

    const res = await request(app).get('/api/users/count');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ count: '2' });
  });

  it('GET /api/users/points/total returns 200 (public route)', async () => {
    (getUsers as any).mockResolvedValue([
      { knightPoints: 3000 },
      { knightPoints: 2500 },
    ]);

    const res = await request(app).get('/api/users/points/total');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ total: '5,500' });
  });

  it('GET /api/users/redemptions/total returns 200 (public route)', async () => {
    (getUsers as any).mockResolvedValue([
      { redemptions: [{}, {}] },
      { redemptions: [{}] },
      {},
    ]);

    const res = await request(app).get('/api/users/redemptions/total');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ total: '3' });
  });

  it('GET /api/users/leaderboard returns 200 (public route)', async () => {
    (getUsers as any).mockResolvedValue([
      { _id: '1', firstname: 'Jase', lastname: 'Thomas', username: 'jaset', knightPoints: 3000 },
      { _id: '2', firstname: 'Admin', lastname: 'User', username: 'admin', knightPoints: 9999 },
      { _id: '3', firstname: 'Amy', lastname: 'Lee', username: 'amyl', knightPoints: 2500 },
    ]);

    (BetModel.aggregate as any).mockResolvedValue([
      { _id: '1', total: 10, wins: 7 },
      { _id: '3', total: 4, wins: 1 },
    ]);

    const res = await request(app).get('/api/users/leaderboard');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0].username).toBe('jaset');
    expect(res.body[0].rank).toBe(1);
  });

  it('GET /api/users/:id returns 200 (public route)', async () => {
    (getUserById as any).mockResolvedValue({
      _id: 'u1',
      firstname: 'Jase',
      lastname: 'Thomas',
      username: 'jaset',
      major: 'CS',
      knightPoints: 1500,
      createdAt: '2026-01-01',
    });

    const res = await request(app).get('/api/users/u1');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      _id: 'u1',
      firstname: 'Jase',
      lastname: 'Thomas',
      username: 'jaset',
      major: 'CS',
      knightPoints: 1500,
      createdAt: '2026-01-01',
    });
  });
});