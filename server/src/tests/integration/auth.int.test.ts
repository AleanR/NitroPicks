import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApp } from '../../app';

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ error: null }),
    },
  })),
}), { virtual: true });

vi.mock('../../modules/users/users.model', () => ({
  getUserByEmail: vi.fn(() => ({
    select: vi.fn().mockResolvedValue(null),
  })),
  createUser: vi.fn(),
  getUserById: vi.fn(),
  UserModel: {
    findOne: vi.fn(),
  },
}));

vi.mock('../../helpers', () => ({
  comparePassword: vi.fn(),
  hashPassword: vi.fn(),
}));

vi.mock('../../helpers/jwt', () => ({
  createToken: vi.fn(),
  verifyToken: vi.fn(),
}));

vi.mock('../../modules/services/email.service', () => ({
  sendEmailVerifOTP: vi.fn(),
  sendSupportEmail: vi.fn(),
}));

describe('Authentication integration', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createApp();
  });

  it('POST /api/users/auth/login returns 400 when email/password are missing', async () => {
    const res = await request(app)
      .post('/api/users/auth/login')
      .send({ email: '' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      message: 'Email and password required!',
    });
  });

  it('POST /api/users/auth/register returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/users/auth/register')
      .send({
        firstname: 'Jase',
        lastname: 'Thomas',
      });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      message: 'Missing required field(s)',
    });
  });

  it('POST /api/users/auth/logout returns 200', async () => {
    const res = await request(app)
      .post('/api/users/auth/logout')
      .send({});

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'User logged out successfully',
    });
  });

  it('GET /api/users/auth/verify-email returns 401 when token is missing', async () => {
    const res = await request(app)
      .get('/api/users/auth/verify-email');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      message: 'Invalid token',
    });
  });

  it('POST /api/users/auth/resend-verification returns 401 when not authenticated', async () => {
    const res = await request(app)
      .post('/api/users/auth/resend-verification')
      .send({});

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      message: 'Unauthorized!',
    });
  });
});