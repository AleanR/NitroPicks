import { Response } from 'express';
import { AuthenticatedRequest } from '../../helpers/auth';
import { UserModel } from '../users/users.model';
import { getActiveRewards, getRewardById } from './rewards.model';
import { Resend } from 'resend';

const getResend = () => new Resend(process.env.RESEND_API_KEY || 'no-key');
const FROM = process.env.EMAIL_FROM || 'NitroPicks <onboarding@resend.dev>';

// ── Voucher code generator ────────────────────────────────────────────────────

function generateVoucherCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const segment = (len: number) =>
        Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `UCF-${segment(3)}-${segment(4)}`;
}

// ── Send voucher email ────────────────────────────────────────────────────────

async function sendVoucherEmail(to: string, rewardName: string, voucherCode: string) {
    const { error } = await getResend().emails.send({
        from: FROM,
        to: [to],
        subject: `Your NitroPicks Voucher: ${rewardName}`,
        html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0d0d0f;padding:32px;border-radius:16px;border:1px solid #27272a;">
                <h2 style="color:#FBBF24;margin:0 0 8px;">🎉 Voucher Confirmed!</h2>
                <p style="color:#a1a1aa;margin:0 0 24px;">You redeemed: <strong style="color:#fff;">${rewardName}</strong></p>
                <div style="background:#1a1a1a;border:2px solid #FBBF24;border-radius:12px;padding:20px;text-align:center;margin:0 0 24px;">
                    <p style="color:#9CA3AF;margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Your Voucher Code</p>
                    <p style="color:#FBBF24;font-size:28px;font-weight:bold;letter-spacing:3px;margin:0;">${voucherCode}</p>
                </div>
                <p style="color:#52525b;font-size:13px;">Show this code to redeem your reward.</p>
            </div>
        `,
    });
    if (error) console.error('Voucher email failed:', error);
}

// ── GET /rewards — all active rewards ────────────────────────────────────────

export const getRewards = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const rewards = await getActiveRewards();
        return res.status(200).json(rewards);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// ── POST /users/:id/redeem — redeem a reward ─────────────────────────────────

export const redeemReward = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { rewardId } = req.body;

        if (!id) return res.status(400).json({ message: 'User ID is required' });
        if (!rewardId) return res.status(400).json({ message: 'Reward ID is required' });
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const [user, reward] = await Promise.all([
            UserModel.findById(id),
            getRewardById(rewardId),
        ]);

        if (!user) return res.status(404).json({ message: 'User not found' });
        if (!reward || !reward.isActive) return res.status(404).json({ message: 'Reward not found' });

        if (reward.quantityAvailable - reward.quantityRedeemed <= 0) {
            return res.status(400).json({ message: 'This reward is out of stock' });
        }

        if (user.knightPoints < reward.pointsCost) {
            return res.status(400).json({ message: 'Not enough Knight Points' });
        }

        // Deduct points, increment redemption count, save redemption record
        user.knightPoints -= reward.pointsCost;
        reward.quantityRedeemed += 1;

        const voucherCode = generateVoucherCode();

        (user as any).redemptions.push({
            rewardId: reward._id,
            rewardName: reward.name,
            voucherCode,
            pointsCost: reward.pointsCost,
            redeemedAt: new Date(),
        });

        await Promise.all([user.save(), reward.save()]);

        // Send email (non-blocking — don't fail the request if email fails)
        sendVoucherEmail(user.email, reward.name, voucherCode).catch(err =>
            console.error('Voucher email failed:', err.message)
        );

        return res.status(200).json({
            message: 'Reward redeemed successfully',
            voucherCode,
            rewardName: reward.name,
            remainingKnightPoints: user.knightPoints,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
