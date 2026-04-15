import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login, register } from '../../modules/authentication/authentication.controllers';
import { getUserByEmail, createUser, UserModel } from '../../modules/users/users.model';
import { comparePassword, hashPassword } from '../../helpers';
import { createToken } from '../../helpers/jwt';
import { sendEmailVerifOTP } from '../../modules/services/email.service';

// Mock dependencies used by the controller
vi.mock('../../modules/users/users.model', () => ({
  getUserByEmail: vi.fn(),
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
}));

describe('authentication.controllers', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      body: {},
      query: {},
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      cookie: vi.fn().mockReturnThis(),
      clearCookie: vi.fn().mockReturnThis(),
    };
  });

  describe('login', () => {
    it('returns 400 if email or password is missing', async () => {
      req.body = { email: '' };

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Email and password required!',
      });
    });

    it('returns 401 if user does not exist', async () => {
      req.body = {
        email: 'jase@example.com',
        password: 'test123',
      };

      const selectMock = vi.fn().mockResolvedValue(null);
      (getUserByEmail as any).mockReturnValue({ select: selectMock });

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid credentials!',
      });
    });

    it('returns 403 if user is not verified', async () => {
      req.body = {
        email: 'jase@example.com',
        password: 'test123',
      };

      const fakeUser = {
        _id: '123',
        email: 'jase@example.com',
        isVerified: false,
        authentication: {
          password: 'hashed-password',
        },
      };

      const selectMock = vi.fn().mockResolvedValue(fakeUser);
      (getUserByEmail as any).mockReturnValue({ select: selectMock });
      (comparePassword as any).mockResolvedValue(true);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Please verify your email before signing in.',
      });
    });

    it('returns 200 on successful login', async () => {
      req.body = {
        email: 'jase@example.com',
        password: 'test123',
      };

      const fakeUser = {
        _id: { toString: () => '123' },
        email: 'jase@example.com',
        isVerified: true,
        role: 'user',
        authentication: {
          password: 'hashed-password',
        },
        toObject: () => ({
          email: 'jase@example.com',
          isVerified: true,
          role: 'user',
        }),
      };

      const selectMock = vi.fn().mockResolvedValue(fakeUser);
      (getUserByEmail as any).mockReturnValue({ select: selectMock });
      (comparePassword as any).mockResolvedValue(true);
      (createToken as any).mockResolvedValue('fake-jwt-token');

      await login(req, res);

      expect(res.cookie).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        email: 'jase@example.com',
        isVerified: true,
        role: 'user',
        isAdmin: false,
        token: 'fake-jwt-token',
      });
    });
  });

  describe('register', () => {
    it('returns 400 if required fields are missing', async () => {
      req.body = {
        firstname: 'Jase',
        lastname: 'Thomas',
      };

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Missing required field(s)',
      });
    });

    it('returns 409 if user already exists', async () => {
      req.body = {
        firstname: 'Jase',
        lastname: 'Thomas',
        ucfID: '1234567',
        major: 'CS',
        email: 'jase@example.com',
        password: 'test123',
        username: 'jaset',
      };

      (UserModel.findOne as any).mockResolvedValue({ _id: 'existing-user' });

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User with provided email, username or UCF ID already exists',
      });
    });

    it('returns 201 on successful register', async () => {
      req.body = {
        firstname: 'Jase',
        lastname: 'Thomas',
        ucfID: '1234567',
        major: 'CS',
        email: 'jase@example.com',
        password: 'test123',
        username: 'jaset',
      };

      (UserModel.findOne as any).mockResolvedValue(null);
      (hashPassword as any).mockResolvedValue('hashed-password');
      (createUser as any).mockResolvedValue({
        _id: { toString: () => '123' },
        email: 'jase@example.com',
      });
      (createToken as any).mockResolvedValue('fake-jwt-token');
      (sendEmailVerifOTP as any).mockResolvedValue(undefined);

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Email Verification OTP Sent!',
        otpUrl: expect.stringContaining('/verify-email?token=fake-jwt-token'),
        token: 'fake-jwt-token',
      });
    });
  });
});