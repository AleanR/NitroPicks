const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    homeTeam: { type: String, required: true },
    awayTeam: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    status: { type: String, enum: ['Open', 'Closed', 'Live'], default: 'Open' },
    homeEmoji: { type: String, default: '🏀' },
    awayEmoji: { type: String, default: '🏀' },
    moneyline: {
        home: { label: String, odds: String },
        away: { label: String, odds: String },
    },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
