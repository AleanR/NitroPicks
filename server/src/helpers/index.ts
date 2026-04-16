import bcrypt from "bcrypt";
import crypto from 'crypto';

const SALT_ROUNDS = 10;

// Hash password with given salt
export const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return bcrypt.hash(password, salt);
}

// Decrypt hashed password & compare with inputted password
export const comparePassword = async (password: string, hashed: string) => {
    return bcrypt.compare(password, hashed);
}

// Generate encrypted password reset token
export const genResetToken = async () => {
    const resetToken = crypto.randomBytes(128).toString('hex');

    const hashed = crypto.createHash('sha256').update(resetToken).digest('hex');

    return { resetToken, hashed };
}