import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRewards, redeemReward } from '../../modules/rewards/rewards.controllers';
import { getActiveRewards, getRewardById } from '../../modules/rewards/rewards.model';
import { UserModel } from '../../modules/users/users.model';
import { createTransport } from 'nodemailer';

// Mock reward model
vi.mock('../../modules/rewards/rewards.model', () => ({
  getActiveRewards: vi.fn(),
  getRewardById: vi.fn(),
}));

// Mock user model
vi.mock('../../modules/users/users.model', () => ({
  UserModel: {
    findById: vi.fn(),
  },
}));

// Mock nodemailer
vi.mock('nodemailer', () => ({
  createTransport: vi.fn(() => ({
    sendMail: vi.fn().mockResolvedValue(undefined),
  })),
}));

describe('rewards.controllers', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      params: {},
      body: {},
      user: undefined,
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  describe('getRewards', () => {
    it('returns 200 with active rewards', async () => {
      const fakeRewards = [
        { _id: '1', name: 'Reward A', pointsCost: 100, isActive: true },
        { _id: '2', name: 'Reward B', pointsCost: 200, isActive: true },
      ];

      (getActiveRewards as any).mockResolvedValue(fakeRewards);

      await getRewards(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fakeRewards);
    });
  });

  describe('redeemReward', () => {
    it('returns 400 if user ID is missing', async () => {
      req.params = {};
      req.body = { rewardId: 'reward1' };

      await redeemReward(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User ID is required',
      });
    });

    it('returns 400 if reward ID is missing', async () => {
      req.params = { id: 'user1' };
      req.body = {};

      await redeemReward(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Reward ID is required',
      });
    });

    it('returns 401 if user is unauthorized', async () => {
      req.params = { id: 'user1' };
      req.body = { rewardId: 'reward1' };
      req.user = undefined;

      await redeemReward(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Unauthorized',
      });
    });

    it('returns 404 if user is not found', async () => {
      req.params = { id: 'user1' };
      req.body = { rewardId: 'reward1' };
      req.user = { id: 'user1' };

      (UserModel.findById as any).mockResolvedValue(null);
      (getRewardById as any).mockResolvedValue({
        _id: 'reward1',
        isActive: true,
      });

      await redeemReward(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User not found',
      });
    });

    it('returns 404 if reward is not found', async () => {
      req.params = { id: 'user1' };
      req.body = { rewardId: 'reward1' };
      req.user = { id: 'user1' };

      (UserModel.findById as any).mockResolvedValue({
        _id: 'user1',
        knightPoints: 1000,
      });
      (getRewardById as any).mockResolvedValue(null);

      await redeemReward(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Reward not found',
      });
    });

    it('returns 400 if reward is out of stock', async () => {
      req.params = { id: 'user1' };
      req.body = { rewardId: 'reward1' };
      req.user = { id: 'user1' };

      const fakeUser = {
        _id: 'user1',
        knightPoints: 1000,
      };

      const fakeReward = {
        _id: 'reward1',
        name: 'Gift Card',
        isActive: true,
        quantityAvailable: 5,
        quantityRedeemed: 5,
        pointsCost: 500,
      };

      (UserModel.findById as any).mockResolvedValue(fakeUser);
      (getRewardById as any).mockResolvedValue(fakeReward);

      await redeemReward(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'This reward is out of stock',
      });
    });

    it('returns 400 if user does not have enough Knight Points', async () => {
      req.params = { id: 'user1' };
      req.body = { rewardId: 'reward1' };
      req.user = { id: 'user1' };

      const fakeUser = {
        _id: 'user1',
        knightPoints: 100,
      };

      const fakeReward = {
        _id: 'reward1',
        name: 'Gift Card',
        isActive: true,
        quantityAvailable: 10,
        quantityRedeemed: 2,
        pointsCost: 500,
      };

      (UserModel.findById as any).mockResolvedValue(fakeUser);
      (getRewardById as any).mockResolvedValue(fakeReward);

      await redeemReward(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Not enough Knight Points',
      });
    });

    it('returns 200 on successful reward redemption', async () => {
      req.params = { id: 'user1' };
      req.body = { rewardId: 'reward1' };
      req.user = { id: 'user1' };

      const fakeUser = {
        _id: 'user1',
        email: 'jase@ucf.edu',
        knightPoints: 1000,
        redemptions: [],
        save: vi.fn().mockResolvedValue(undefined),
      };

      const fakeReward = {
        _id: 'reward1',
        name: 'Gift Card',
        isActive: true,
        quantityAvailable: 10,
        quantityRedeemed: 2,
        pointsCost: 500,
        save: vi.fn().mockResolvedValue(undefined),
      };

      (UserModel.findById as any).mockResolvedValue(fakeUser);
      (getRewardById as any).mockResolvedValue(fakeReward);

      await redeemReward(req, res);

      expect(fakeUser.knightPoints).toBe(500);
      expect(fakeReward.quantityRedeemed).toBe(3);
      expect(fakeUser.redemptions.length).toBe(1);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Reward redeemed successfully',
        voucherCode: expect.stringMatching(/^UCF-[A-Z2-9]{3}-[A-Z2-9]{4}$/),
        rewardName: 'Gift Card',
        remainingKnightPoints: 500,
      });
    });
  });
});