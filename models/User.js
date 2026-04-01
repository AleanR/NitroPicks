const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        minlength: 1,
        maxlength: 50
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        minlength: 1,
        maxlength: 50
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    passwordHash: {
        type: String,
        required: [true, 'Password is required']
    },
    ucfStudentId: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    major: {
        type: String,
        trim: true,
        default: ''
    },

    // email verification
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String,
        default: null
    },
    emailVerificationExpires: {
        type: Date,
        default: null
    },

    // password reset
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    },

    // Points system 
    pointsBalance: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true
});


userSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });

module.exports = mongoose.model('User', userSchema);