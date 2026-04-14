import mongoose from "mongoose";

const RedemptionSchema = new mongoose.Schema({
    rewardId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Reward', required: true },
    rewardName:  { type: String, required: true },
    voucherCode: { type: String, required: true },
    pointsCost:  { type: Number, required: true },
    redeemedAt:  { type: Date, default: Date.now },
});

const TicketRedemptionSchema = new mongoose.Schema({
    pointsAdded: { type: Number, required: true },
    redeemedAt:  { type: Date, default: Date.now },
});

const UserSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    ucfID: { type: String, required: true },
    knightPoints: { type: Number, default: 1000 },
    major: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    isVerified: { type: Boolean, required: true, default: false },
    authentication: {
        type: {
            password: { type: String, required: true, select: false },
            resetPasswordToken: { type: String, select: false },
            resetPasswordExpires: { type: Date },
        },
        required: true,
    },
    role: { type: String, enum: ["user", "admin"], default: "user"},
    redemptions:       { type: [RedemptionSchema], default: [] },
    ticketRedemptions: { type: [TicketRedemptionSchema], default: [] },
}, { timestamps: true });

export const UserModel = mongoose.model('User', UserSchema);

export const getUsers = () => UserModel.find();
export const getUserByEmail = (email: string) =>{
        
	 console.log("We made it here");
         return	UserModel.findOne({ email });

}

export const getUserById = (id: string) => UserModel.findById(id);
export const createUser = async (values: Record<string, any>) => UserModel.create(values);

export const deleteUserById = (id: string) => UserModel.deleteOne({ _id: id });
export const updateUserById = (id: string, values: Record<string, any>) => UserModel.findByIdAndUpdate(id, values, { returnDocument: 'after', runValidators: true });

export const getUserbyToken = (token: Record<string, any>) => UserModel.findOne(token);

export const deductKnightPoints = async (id: string, amount: number) => {
    const updatedUser = await UserModel.findOneAndUpdate(
        {
            _id: id,
            knightPoints: { $gte: amount } as any
        },
        { $inc: { knightPoints: -amount } },
        { returnDocument: 'after', runValidators: true }
    );
    return updatedUser;
}

export const awardKnightPoints = async (id: string, amount: number) => {
    return updateUserById(id, { $inc: { knightPoints: amount } });
}

export const refund = async (userId: string, amount: number) => {
    const updatedUser = await updateUserById(
        userId,
        { $inc: { knightPoints: amount } },
    );
    if (!updatedUser) return null;
    return updatedUser;
}
