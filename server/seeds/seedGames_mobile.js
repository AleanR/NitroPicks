/**
 * seedGames_mobile.js
 *
 * Test seed with four predictable scenarios for mobile development:
 *   1. Open      – betting window wide open, game is today
 *   2. Closing   – betting closes in ~9 minutes, game is today
 *   3. Closed    – game already started (betting closed 2 h ago), past
 *   4. Upcoming  – game is tomorrow, betting open now
 *
 * Run from server/:
 *   node seeds/seedGames_mobile.js
 *
 * Adds on top of existing data (no wipe). Run the clear one-liner first if you
 * want a clean slate.
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const GameSchema = new mongoose.Schema({
    sport: { type: String, default: '' },
    homeTeam: { type: String, required: true },
    awayTeam: { type: String, required: true },
    numBettorsHome: { type: Number, default: 0 },
    numBettorsAway: { type: Number, default: 0 },
    totalBetAmountHome: { type: Number, default: 100 },
    totalBetAmountAway: { type: Number, default: 100 },
    betPool: { type: Number, default: 200 },
    homeWin: { type: { label: String, odds: Number }, required: true },
    awayWin: { type: { label: String, odds: Number }, required: true },
    scoreHome: { type: Number, default: 0 },
    scoreAway: { type: Number, default: 0 },
    bettingOpensAt:  { type: Date, required: true },
    bettingClosesAt: { type: Date, required: true },
    winner: { type: String, default: '' },
    status: { type: String, enum: ['upcoming', 'live', 'finished', 'cancelled'], default: 'upcoming' },
}, { timestamps: true });

const Game = mongoose.models.Game || mongoose.model('Game', GameSchema);

const INIT_ODDS = 1.8; // 50/50, 10 % house margin

function mins(n) { return n * 60 * 1000; }
function hours(n) { return n * 60 * 60 * 1000; }
function days(n)  { return n * 24 * 60 * 60 * 1000; }

async function seed() {
    const uri = process.env.MONGO_DB_URL || process.env.MONGO_DB_URI || process.env.MONGODB_URI;
    if (!uri) throw new Error('No MongoDB URI found in .env');

    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Wipe all existing games so the list is clean for testing
    const { deletedCount } = await Game.deleteMany({});
    console.log(`Cleared ${deletedCount} existing game(s).\n`);

    const now = new Date();
    console.log(`Seeding relative to: ${now.toLocaleString()}\n`);

    const games = [
        {
            label: '🟢 OPEN — today, betting closes in 90 min',
            doc: {
                sport: 'Basketball',
                homeTeam: 'UCF Knights',
                awayTeam: 'Florida Gators',
                homeWin: { label: 'UCF Knights Win', odds: INIT_ODDS },
                awayWin: { label: 'Florida Gators Win', odds: INIT_ODDS },
                totalBetAmountHome: 100,
                totalBetAmountAway: 100,
                betPool: 200,
                bettingOpensAt:  new Date(now.getTime() - hours(3)),
                bettingClosesAt: new Date(now.getTime() + mins(90)),
            },
        },
        {
            label: '🟡 CLOSING — today, betting closes in 8 min',
            doc: {
                sport: 'Baseball',
                homeTeam: 'UCF Knights',
                awayTeam: 'Miami Hurricanes',
                homeWin: { label: 'UCF Knights Win', odds: INIT_ODDS },
                awayWin: { label: 'Miami Hurricanes Win', odds: INIT_ODDS },
                totalBetAmountHome: 100,
                totalBetAmountAway: 100,
                betPool: 200,
                bettingOpensAt:  new Date(now.getTime() - hours(4)),
                bettingClosesAt: new Date(now.getTime() + mins(8)),
            },
        },
        {
            label: '⚫ CLOSED / PAST — game started 1 h ago',
            doc: {
                sport: 'Softball',
                homeTeam: 'UCF Knights',
                awayTeam: 'FSU Seminoles',
                homeWin: { label: 'UCF Knights Win', odds: INIT_ODDS },
                awayWin: { label: 'FSU Seminoles Win', odds: INIT_ODDS },
                totalBetAmountHome: 100,
                totalBetAmountAway: 100,
                betPool: 200,
                bettingOpensAt:  new Date(now.getTime() - hours(4)),
                bettingClosesAt: new Date(now.getTime() - hours(1)),
            },
        },
        {
            label: '🔵 UPCOMING — game tomorrow afternoon',
            doc: {
                sport: "Women's Tennis",
                homeTeam: 'UCF Knights',
                awayTeam: 'Cincinnati Bearcats',
                homeWin: { label: 'UCF Knights Win', odds: INIT_ODDS },
                awayWin: { label: 'Cincinnati Bearcats Win', odds: INIT_ODDS },
                totalBetAmountHome: 100,
                totalBetAmountAway: 100,
                betPool: 200,
                bettingOpensAt:  new Date(now.getTime() - hours(2)),
                bettingClosesAt: new Date(now.getTime() + days(1) + hours(4)),
            },
        },
        {
            label: '🔵 UPCOMING — game in 2 days',
            doc: {
                sport: 'Baseball',
                homeTeam: 'UCF Knights',
                awayTeam: 'Kansas Jayhawks',
                homeWin: { label: 'UCF Knights Win', odds: INIT_ODDS },
                awayWin: { label: 'Kansas Jayhawks Win', odds: INIT_ODDS },
                totalBetAmountHome: 100,
                totalBetAmountAway: 100,
                betPool: 200,
                bettingOpensAt:  new Date(now.getTime() - hours(1)),
                bettingClosesAt: new Date(now.getTime() + days(2) + hours(2)),
            },
        },
    ];

    for (const { label, doc } of games) {
        const inserted = await Game.create(doc);
        console.log(`  [${label}]`);
        console.log(`    ${doc.homeTeam} vs ${doc.awayTeam}`);
        console.log(`    opens:  ${doc.bettingOpensAt.toISOString()}`);
        console.log(`    closes: ${doc.bettingClosesAt.toISOString()}`);
        console.log(`    id: ${inserted._id}`);
    }

    console.log('\nSeeded 4 test games.');
    process.exit(0);
}

seed().catch(err => {
    console.error('Seed failed:', err.message);
    process.exit(1);
});
