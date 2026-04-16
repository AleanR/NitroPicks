import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
  const originalClientUrl = process.env.CLIENT_URL;

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

  afterEach(() => {
    process.env.CLIENT_URL = originalClientUrl;
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
        email: 'jase@ucf.edu',
        password: 'test1234',
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
        email: 'jase@ucf.edu',
        password: 'test1234',
      };

      const fakeUser = {
        _id: '123',
        email: 'jase@ucf.edu',
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
        email: 'jase@ucf.edu',
        password: 'test1234',
      };

      const authUser = {
        _id: { toString: () => '123' },
        email: 'jase@ucf.edu',
        isVerified: true,
        role: 'user',
        authentication: {
          password: 'hashed-password',
        },
      };

      const safeUser = {
        toObject: () => ({
          email: 'jase@ucf.edu',
          isVerified: true,
          role: 'user',
        }),
      };

      const selectMock = vi.fn().mockResolvedValue(authUser);

      (getUserByEmail as any)
        .mockReturnValueOnce({ select: selectMock })
        .mockResolvedValueOnce(safeUser);

      (comparePassword as any).mockResolvedValue(true);
      (createToken as any).mockResolvedValue('fake-jwt-token');

      await login(req, res);

      expect(res.cookie).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        email: 'jase@ucf.edu',
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

    it('returns 400 if password is less than 8 characters', async () => {
      req.body = {
        firstname: 'Jase',
        lastname: 'Thomas',
        ucfID: '1234567',
        major: 'Computer Science',
        email: 'jase@ucf.edu',
        password: 'test123',
        username: 'jaset',
      };

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Password must be at least 8 characters long',
      });
    });

    it('returns 400 if email does not use @ucf.edu domain', async () => {
      req.body = {
        firstname: 'Jase',
        lastname: 'Thomas',
        ucfID: '1234567',
        major: 'Computer Science',
        email: 'jase@gmail.com',
        password: 'test1234',
        username: 'jaset',
      };

      (UserModel.findOne as any).mockResolvedValue(null);

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Email must have @ucf.edu domain',
      });
    });

    it('returns 409 if user already exists', async () => {
      req.body = {
        firstname: 'Jase',
        lastname: 'Thomas',
        ucfID: '1234567',
        major: 'Computer Science',
        email: 'jase@ucf.edu',
        password: 'test1234',
        username: 'jaset',
      };

      (UserModel.findOne as any).mockResolvedValue({ _id: 'existing-user' });

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User with provided email, username or UCF ID already exists',
      });
    });

    it('returns 201 on successful register in non-production mode', async () => {
      delete process.env.CLIENT_URL;

      req.body = {
        firstname: 'Jase',
        lastname: 'Thomas',
        ucfID: '1234567',
        major: 'Computer Science',
        email: 'jase@ucf.edu',
        password: 'test1234',
        username: 'jaset',
      };

      (UserModel.findOne as any).mockResolvedValue(null);
      (hashPassword as any).mockResolvedValue('hashed-password');
      (createUser as any).mockResolvedValue({
        _id: { toString: () => '123' },
        email: 'jase@ucf.edu',
      });
      (createToken as any).mockResolvedValue('fake-jwt-token');

      await register(req, res);

      expect(sendEmailVerifOTP).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Account created successfully!',
        token: 'fake-jwt-token',
      });
    });

    it('returns 201 on successful register in production mode', async () => {
      process.env.CLIENT_URL = 'https://nitropicks.xyz';

      req.body = {
        firstname: 'Jase',
        lastname: 'Thomas',
        ucfID: '1234567',
        major: 'Computer Science',
        email: 'jase@ucf.edu',
        password: 'test1234',
        username: 'jaset',
      };

      (UserModel.findOne as any).mockResolvedValue(null);
      (hashPassword as any).mockResolvedValue('hashed-password');
      (createUser as any).mockResolvedValue({
        _id: { toString: () => '123' },
        email: 'jase@ucf.edu',
      });
      (createToken as any).mockResolvedValue('fake-jwt-token');
      (sendEmailVerifOTP as any).mockResolvedValue(undefined);

      await register(req, res);

      expect(sendEmailVerifOTP).toHaveBeenCalledWith(
        'jase@ucf.edu',
        'https://nitropicks.xyz/verify-email?token=fake-jwt-token'
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Email Verification OTP Sent!',
        token: 'fake-jwt-token',
      });
    });
  });
});
