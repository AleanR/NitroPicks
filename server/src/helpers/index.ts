import bcrypt from "bcrypt";
import crypto from 'crypto';

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return bcrypt.hash(password, salt);
}

export const comparePassword = async (password: string, hashed: string) => {
    return bcrypt.compare(password, hashed);
}


export const genResetToken = async () => {
    const resetToken = crypto.randomBytes(128).toString('hex');

    const hashed = crypto.createHash('sha256').update(resetToken).digest('hex');

    return { resetToken, hashed };
}