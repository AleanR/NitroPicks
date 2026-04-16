import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getPublicUser,
  getCurrentUser,
  getTotalRedemptions,
  getTotalPoints,
  getPlayerCount,
  getAllUsers,
  getLeaderboard,
  searchUsers,
  deleteUser,
  updateUser,
  getRedemptions,
  contactSupport,
  earnPoints,
  getTicketRedemptions,
} from '../../modules/users/users.controllers';
import {
  deleteUserById,
  getUsers,
  updateUserById,
  UserModel,
  getUserById,
} from '../../modules/users/users.model';
import { sendSupportEmail } from '../../modules/services/email.service';
import { BetModel } from '../../modules/bets/bets.model';

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

vi.mock('../../modules/bets/bets.model', () => ({
  BetModel: {
    aggregate: vi.fn(),
  },
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

    it('returns 500 if getUserById throws', async () => {
      req.params = { id: 'u1' };
      (getUserById as any).mockRejectedValue(new Error('DB fail'));

      await getPublicUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
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

    it('returns 200 with current user data and isAdmin true', async () => {
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

    it('returns 200 with isAdmin false for non-admin user', async () => {
      req.user = { id: 'u2' };
      (getUserById as any).mockResolvedValue({
        role: 'user',
        toObject: () => ({ _id: 'u2', email: 'test@ucf.edu', role: 'user' }),
      });

      await getCurrentUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        _id: 'u2',
        email: 'test@ucf.edu',
        role: 'user',
        isAdmin: false,
      });
    });
  });

  describe('getTotalRedemptions', () => {
    it('returns 200 with total redemptions', async () => {
      (getUsers as any).mockResolvedValue([
        { redemptions: [{}, {}] },
        { redemptions: [{}] },
        {},
      ]);

      await getTotalRedemptions(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ total: '3' });
    });

    it('returns 500 if getUsers throws', async () => {
      (getUsers as any).mockRejectedValue(new Error('DB fail'));

      await getTotalRedemptions(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('getTotalPoints', () => {
    it('returns 200 with formatted total points', async () => {
      (getUsers as any).mockResolvedValue([
        { knightPoints: 1000 },
        { knightPoints: 2500 },
        { knightPoints: 500 },
      ]);

      await getTotalPoints(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ total: '4,000' });
    });

    it('returns 500 if getUsers throws', async () => {
      (getUsers as any).mockRejectedValue(new Error('DB fail'));

      await getTotalPoints(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('getPlayerCount', () => {
    it('returns 200 with player count excluding admin', async () => {
      (getUsers as any).mockResolvedValue([
        { username: 'admin' },
        { username: 'jase' },
        { username: 'alex' },
      ]);

      await getPlayerCount(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ count: '2' });
    });

    it('returns 500 if getUsers throws', async () => {
      (getUsers as any).mockRejectedValue(new Error('DB fail'));

      await getPlayerCount(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
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

    it('returns 500 if getUsers throws', async () => {
      (getUsers as any).mockRejectedValue(new Error('DB fail'));

      await getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('getLeaderboard', () => {
    it('returns 200 with leaderboard data', async () => {
      (getUsers as any).mockResolvedValue([
        { _id: '1', firstname: 'A', lastname: 'A', username: 'a', knightPoints: 3000 },
        { _id: '2', firstname: 'B', lastname: 'B', username: 'admin', knightPoints: 9999 },
        { _id: '3', firstname: 'C', lastname: 'C', username: 'c', knightPoints: 2000 },
      ]);

      (BetModel.aggregate as any).mockResolvedValue([
        { _id: '1', total: 10, wins: 7 },
        { _id: '3', total: 4, wins: 1 },
      ]);

      await getLeaderboard(req, res);

      expect(BetModel.aggregate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);

      const leaderboard = (res.json as any).mock.calls[0][0];
      expect(leaderboard.length).toBe(2);

      expect(leaderboard[0]).toEqual({
        id: '1',
        username: 'a',
        name: 'A A',
        initials: 'AA',
        rank: 1,
        points: '3,000',
        winRate: 70,
        bets: 10,
        medal: 'gold',
      });

      expect(leaderboard[1]).toEqual({
        id: '3',
        username: 'c',
        name: 'C C',
        initials: 'CC',
        rank: 2,
        points: '2,000',
        winRate: 25,
        bets: 4,
        medal: 'silver',
      });
    });

    it('returns zero stats when user has no bets', async () => {
      (getUsers as any).mockResolvedValue([
        { _id: '5', firstname: 'No', lastname: 'Bets', username: 'nobets', knightPoints: 1000 },
      ]);

      (BetModel.aggregate as any).mockResolvedValue([]);

      await getLeaderboard(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        {
          id: '5',
          username: 'nobets',
          name: 'No Bets',
          initials: 'NB',
          rank: 1,
          points: '1,000',
          winRate: 0,
          bets: 0,
          medal: 'gold',
        },
      ]);
    });

    it('returns 500 if leaderboard query fails', async () => {
      (getUsers as any).mockRejectedValue(new Error('DB fail'));
      (BetModel.aggregate as any).mockResolvedValue([]);

      await getLeaderboard(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
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

      const users = [{ _id: 'u1', firstname: 'Jase' }];
      const skipMock = vi.fn().mockResolvedValue(users);
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
        results: users,
      });
    });

    it('returns 500 if searchUsers throws', async () => {
      req.query = { query: 'Jase', page: '1' };
      (UserModel.countDocuments as any).mockRejectedValue(new Error('DB fail'));

      await searchUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
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

      expect(deleteUserById).toHaveBeenCalledWith('u1');
      expect(res.json).toHaveBeenCalledWith({ message: 'User deleted!' });
    });

    it('returns 500 if deleteUser throws', async () => {
      req.params = { id: 'u1' };
      req.user = { id: 'u1' };
      (UserModel.findById as any).mockRejectedValue(new Error('DB fail'));

      await deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
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

      expect(updateUserById).toHaveBeenCalledWith('u1', { $set: { major: 'Math' } });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User updated successfully',
        user: updatedUser,
      });
    });

    it('returns 500 if updateUser throws', async () => {
      req.params = { id: 'u1' };
      req.user = { id: 'u1' };
      (updateUserById as any).mockImplementation(() => {
        throw new Error('DB fail');
      });

      await updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
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

    it('returns 404 if user is not found', async () => {
      req.params = { id: 'u1' };
      req.user = { id: 'u1' };
      (getUserById as any).mockResolvedValue(null);

      await getRedemptions(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
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
      req.body = { subject: '   ', message: '' };

      await contactSupport(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Subject and message are required.',
      });
    });

    it('returns 400 if subject is too long', async () => {
      req.user = { id: 'u1' };
      req.body = { subject: 'a'.repeat(101), message: 'hello' };

      await contactSupport(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Subject must be 100 characters or less.',
      });
    });

    it('returns 400 if message is too long', async () => {
      req.user = { id: 'u1' };
      req.body = { subject: 'Help', message: 'a'.repeat(2001) };

      await contactSupport(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Message must be 2000 characters or less.',
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
      req.body = { subject: '  Help  ', message: '  Test message  ' };
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

    it('returns 500 if support email fails', async () => {
      req.user = { id: 'u1' };
      req.body = { subject: 'Help', message: 'Test message' };
      (getUserById as any).mockResolvedValue({
        firstname: 'Jase',
        lastname: 'Thomas',
        email: 'jase@ucf.edu',
      });
      (sendSupportEmail as any).mockRejectedValue(new Error('Email fail'));

      await contactSupport(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Failed to send support email.',
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

    it('returns 404 if updated user is not found', async () => {
      req.user = { id: 'u1' };
      req.body = { code: '1234567812345678' };
      (updateUserById as any).mockResolvedValue(null);

      await earnPoints(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('returns 200 on successful point earn', async () => {
      req.user = { id: 'u1' };
      req.body = { code: '1234567812345678' };
      (updateUserById as any).mockResolvedValue({ knightPoints: 2000 });

      await earnPoints(req, res);

      expect(updateUserById).toHaveBeenCalledWith('u1', {
        $inc: { knightPoints: 1000 },
        $push: { ticketRedemptions: { pointsAdded: 1000, redeemedAt: expect.any(Date) } },
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: '1000 KP added!',
        knightPoints: 2000,
      });
    });

    it('returns 500 if earnPoints throws', async () => {
      req.user = { id: 'u1' };
      req.body = { code: '1234567812345678' };
      (updateUserById as any).mockRejectedValue(new Error('DB fail'));

      await earnPoints(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('getTicketRedemptions', () => {
    it('returns 401 if unauthorized', async () => {
      req.params = { id: 'u1' };

      await getTicketRedemptions(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('returns 404 if user is not found', async () => {
      req.user = { id: 'u1' };
      req.params = { id: 'u1' };
      (getUserById as any).mockResolvedValue(null);

      await getTicketRedemptions(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('returns 200 with sorted ticket redemption history', async () => {
      req.user = { id: 'u1' };
      req.params = { id: 'u1' };
      (getUserById as any).mockResolvedValue({
        ticketRedemptions: [
          { redeemedAt: '2026-01-01T00:00:00.000Z', pointsAdded: 1000 },
          { redeemedAt: '2026-03-01T00:00:00.000Z', pointsAdded: 1000 },
          { redeemedAt: '2026-02-01T00:00:00.000Z', pointsAdded: 1000 },
        ],
      });

      await getTicketRedemptions(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        { redeemedAt: '2026-03-01T00:00:00.000Z', pointsAdded: 1000 },
        { redeemedAt: '2026-02-01T00:00:00.000Z', pointsAdded: 1000 },
        { redeemedAt: '2026-01-01T00:00:00.000Z', pointsAdded: 1000 },
      ]);
    });

    it('returns 500 if getTicketRedemptions throws', async () => {
      req.user = { id: 'u1' };
      req.params = { id: 'u1' };
      (getUserById as any).mockRejectedValue(new Error('DB fail'));

      await getTicketRedemptions(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });
});