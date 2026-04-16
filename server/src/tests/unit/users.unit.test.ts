import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getPublicUser,
  getCurrentUser,
  getAllUsers,
  getLeaderboard,
  searchUsers,
  deleteUser,
  updateUser,
  getRedemptions,
  contactSupport,
  earnPoints,
  redeemPerk,
} from '../../modules/users/users.controllers';
import {
  deleteUserById,
  getUsers,
  updateUserById,
  UserModel,
  getUserById,
} from '../../modules/users/users.model';
import { sendSupportEmail } from '../../modules/services/email.service';

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

vi.mock('../../modules/services/email.service', () => ({
  sendSupportEmail: vi.fn(),
}));

describe('users.controllers', () => {
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

  describe('getPublicUser', () => {
    it('returns 404 if user is not found', async () => {
      req.params = { id: 'u1' };
      (getUserById as any).mockResolvedValue(null);

      await getPublicUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('returns 200 with public user data', async () => {
      req.params = { id: 'u1' };
      (getUserById as any).mockResolvedValue({
        _id: 'u1',
        firstname: 'Jase',
        lastname: 'Thomas',
        username: 'jaset',
        major: 'CS',
        knightPoints: 1500,
        createdAt: '2026-01-01',
      });

      await getPublicUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
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

  describe('getCurrentUser', () => {
    it('returns 401 if not authenticated', async () => {
      await getCurrentUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not authenticated' });
    });

    it('returns 404 if current user is not found', async () => {
      req.user = { id: 'u1' };
      (getUserById as any).mockResolvedValue(null);

      await getCurrentUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('returns 200 with current user data', async () => {
      req.user = { id: 'u1' };
      (getUserById as any).mockResolvedValue({
        role: 'admin',
        toObject: () => ({ _id: 'u1', email: 'jase@ucf.edu', role: 'admin' }),
      });

      await getCurrentUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        _id: 'u1',
        email: 'jase@ucf.edu',
        role: 'admin',
        isAdmin: true,
      });
    });
  });

  describe('getAllUsers', () => {
    it('returns 200 with all users', async () => {
      const users = [{ _id: 'u1' }, { _id: 'u2' }];
      (getUsers as any).mockResolvedValue(users);

      await getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(users);
    });
  });

  describe('getLeaderboard', () => {
    it('returns 200 with leaderboard data', async () => {
      (getUsers as any).mockResolvedValue([
        { _id: '1', firstname: 'A', lastname: 'A', username: 'a', knightPoints: 3000 },
        { _id: '2', firstname: 'B', lastname: 'B', username: 'admin', knightPoints: 9999 },
        { _id: '3', firstname: 'C', lastname: 'C', username: 'c', knightPoints: 2000 },
      ]);

      await getLeaderboard(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      const leaderboard = (res.json as any).mock.calls[0][0];
      expect(leaderboard.length).toBe(2);
      expect(leaderboard[0].name).toBe('A A');
      expect(leaderboard[0].rank).toBe(1);
    });
  });

  describe('searchUsers', () => {
    it('returns 400 if query is missing', async () => {
      req.query = { page: '1' };

      await searchUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Search query is required',
        success: false,
      });
    });

    it('returns 400 if page is missing', async () => {
      req.query = { query: 'Jase' };

      await searchUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Missing page number',
        success: false,
      });
    });

    it('returns 200 with paginated user results', async () => {
      req.query = { query: 'Jase CS', page: '1' };

      const skipMock = vi.fn().mockResolvedValue([{ _id: 'u1', firstname: 'Jase' }]);
      const limitMock = vi.fn().mockReturnValue({ skip: skipMock });
      const selectMock = vi.fn().mockReturnValue({ limit: limitMock });

      (UserModel.countDocuments as any).mockResolvedValue(1);
      (UserModel.find as any).mockReturnValue({ select: selectMock });

      await searchUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        page: '1',
        total: 1,
        totalPages: 1,
        results: [{ _id: 'u1', firstname: 'Jase' }],
      });
    });
  });

  describe('deleteUser', () => {
    it('returns 400 if user ID is missing', async () => {
      await deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User ID is required' });
    });

    it('returns 401 if unauthorized', async () => {
      req.params = { id: 'u1' };

      await deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('returns 403 if trying to delete another user', async () => {
      req.params = { id: 'u1' };
      req.user = { id: 'u2' };

      await deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Can only delete own account' });
    });

    it('returns 404 if user is not found', async () => {
      req.params = { id: 'u1' };
      req.user = { id: 'u1' };
      (UserModel.findById as any).mockResolvedValue(null);

      await deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('returns 200 on successful deletion', async () => {
      req.params = { id: 'u1' };
      req.user = { id: 'u1' };
      (UserModel.findById as any).mockResolvedValue({ _id: 'u1' });
      (deleteUserById as any).mockResolvedValue(undefined);

      await deleteUser(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: 'User deleted!' });
    });
  });

  describe('updateUser', () => {
    it('returns 400 if user ID is missing', async () => {
      await updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User ID is required' });
    });

    it('returns 401 if unauthorized', async () => {
      req.params = { id: 'u1' };

      await updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('returns 403 if trying to update another user', async () => {
      req.params = { id: 'u1' };
      req.user = { id: 'u2' };

      await updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Can only update own account' });
    });

    it('returns 404 if user is not found', async () => {
      req.params = { id: 'u1' };
      req.user = { id: 'u1' };

      const selectMock = vi.fn().mockResolvedValue(null);
      (updateUserById as any).mockReturnValue({ select: selectMock });

      await updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('returns 200 on successful update', async () => {
      req.params = { id: 'u1' };
      req.user = { id: 'u1' };
      req.body = { major: 'Math' };

      const updatedUser = { _id: 'u1', major: 'Math' };
      const selectMock = vi.fn().mockResolvedValue(updatedUser);
      (updateUserById as any).mockReturnValue({ select: selectMock });

      await updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User updated successfully',
        user: updatedUser,
      });
    });
  });

  describe('getRedemptions', () => {
    it('returns 401 if unauthorized', async () => {
      req.params = { id: 'u1' };

      await getRedemptions(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('returns 403 if requesting another user redemptions', async () => {
      req.params = { id: 'u1' };
      req.user = { id: 'u2' };

      await getRedemptions(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });
    });

    it('returns 200 with sorted redemptions', async () => {
      req.params = { id: 'u1' };
      req.user = { id: 'u1' };
      (getUserById as any).mockResolvedValue({
        redemptions: [
          { redeemedAt: '2026-01-01T00:00:00.000Z' },
          { redeemedAt: '2026-02-01T00:00:00.000Z' },
        ],
      });

      await getRedemptions(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const redemptions = (res.json as any).mock.calls[0][0];
      expect(redemptions[0].redeemedAt).toBe('2026-02-01T00:00:00.000Z');
    });
  });

  describe('contactSupport', () => {
    it('returns 401 if unauthorized', async () => {
      await contactSupport(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('returns 400 if subject or message is missing', async () => {
      req.user = { id: 'u1' };
      req.body = { subject: '', message: '' };

      await contactSupport(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Subject and message are required.',
      });
    });

    it('returns 404 if user is not found', async () => {
      req.user = { id: 'u1' };
      req.body = { subject: 'Help', message: 'Test message' };
      (getUserById as any).mockResolvedValue(null);

      await contactSupport(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('returns 200 on successful support email', async () => {
      req.user = { id: 'u1' };
      req.body = { subject: 'Help', message: 'Test message' };
      (getUserById as any).mockResolvedValue({
        firstname: 'Jase',
        lastname: 'Thomas',
        email: 'jase@ucf.edu',
      });
      (sendSupportEmail as any).mockResolvedValue(undefined);

      await contactSupport(req, res);

      expect(sendSupportEmail).toHaveBeenCalledWith(
        'Jase Thomas',
        'jase@ucf.edu',
        'Help',
        'Test message'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Your message has been sent to support.',
      });
    });
  });

  describe('earnPoints', () => {
    it('returns 401 if not authenticated', async () => {
      await earnPoints(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not authenticated' });
    });

    it('returns 400 if code is invalid', async () => {
      req.user = { id: 'u1' };
      req.body = { code: '123' };

      await earnPoints(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Code must be exactly 16 digits',
      });
    });

    it('returns 200 on successful point earn', async () => {
      req.user = { id: 'u1' };
      req.body = { code: '1234567812345678' };
      (updateUserById as any).mockResolvedValue({ knightPoints: 2000 });

      await earnPoints(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: '1000 KP added!',
        knightPoints: 2000,
      });
    });
  });

  describe('redeemPerk', () => {
    it('returns 401 if not authenticated', async () => {
      await redeemPerk(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not authenticated' });
    });

    it('returns 400 if perk is unknown', async () => {
      req.user = { id: 'u1' };
      req.body = { perkId: 'bad-perk' };

      await redeemPerk(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unknown perk' });
    });

    it('returns 404 if user is not found', async () => {
      req.user = { id: 'u1' };
      req.body = { perkId: 'ucf-dining' };
      (getUserById as any).mockResolvedValue(null);

      await redeemPerk(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('returns 400 if user does not have enough KP', async () => {
      req.user = { id: 'u1' };
      req.body = { perkId: 'knights-ticket' };
      (getUserById as any).mockResolvedValue({ knightPoints: 1000 });

      await redeemPerk(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not enough KP' });
    });

    it('returns 200 on successful perk redemption', async () => {
      req.user = { id: 'u1' };
      req.body = { perkId: 'ucf-dining' };
      (getUserById as any).mockResolvedValue({ knightPoints: 10000 });
      (updateUserById as any).mockResolvedValue({ knightPoints: 5000 });

      await redeemPerk(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Purchase successful!',
        confirmationCode: expect.stringMatching(/^\d{16}$/),
        knightPoints: 5000,
      });
    });
  });
});