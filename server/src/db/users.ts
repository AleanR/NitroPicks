import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    ucfID: { type: String, required: true },
    pointBalance: { type: Number, default: 2000 },
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
}, { timestamps: true });

export const UserModel = mongoose.model('User', UserSchema);

export const getUsers = () => UserModel.find();
export const getUserByEmail = (email: string) => UserModel.findOne({ email });

export const getUserById = (id: string) => UserModel.findById(id);
export const createUser = async (values: Record<string, any>) => UserModel.create(values);

export const deleteUserById = (id: string) => UserModel.deleteOne({ _id: id });
export const updateUserById = (id: string, values: Record<string, any>) => UserModel.findByIdAndUpdate(id, values, { new: true, runValidators: true });

export const getUserbyToken = (token: Record<string, any>) => UserModel.findOne(token);
