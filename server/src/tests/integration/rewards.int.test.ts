import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApp } from '../../app';

// Mock app-startup dependency from rewards controller
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ error: null }),
    },
  })),
}), { virtual: true });

// Mock rewards dependencies
vi.mock('../../modules/rewards/rewards.model', () => ({
  getActiveRewards: vi.fn(),
  getRewardById: vi.fn(),
}));

vi.mock('../../modules/users/users.model', () => ({
  UserModel: {
    findById: vi.fn(),
  },
  getUserById: vi.fn(),
  updateUserById: vi.fn(),
}));

describe('Rewards integration', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createApp();
  });

  it('GET /api/rewards returns 401 if not authenticated', async () => {
    const res = await request(app).get('/api/rewards');

    expect(res.status).toBe(401);
  });

  it('POST /api/users/:id/redeem returns 401 if not authenticated', async () => {
    const res = await request(app)
      .post('/api/users/123/redeem')
      .send({ rewardId: 'reward1' });

    expect(res.status).toBe(401);
  });

  it('POST /api/users/:id/earn-points returns 401 if not authenticated', async () => {
    const res = await request(app)
      .post('/api/users/123/earn-points')
      .send({ code: '1234567812345678' });

    expect(res.status).toBe(401);
  });
});