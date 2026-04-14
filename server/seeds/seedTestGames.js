/**
 * seedTestGames.js
 *
 * Clears all existing games (that haven't been resolved) and inserts
 * a fresh set of test games at controlled timing relative to NOW:
 *
 *   Upcoming  — bettingClosesAt is tomorrow/the day after (shows in Upcoming tab)
 *   Open      — bettingClosesAt is later today              (shows in Open tab)
 *   Closing   — bettingClosesAt is in ~8 minutes            (shows in Closing tab)
 *   Closed    — bettingClosesAt is already in the past      (shows in Admin as resolvable)
 *
 * Run from the server/ directory:
 *   node seeds/seedTestGames.js
 *
 * To wipe only (no re-insert):
 *   node seeds/seedTestGames.js --wipe-only
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const GameSchema = new mongoose.Schema({
    sport:              { type: String, default: '' },
    emoji:              { type: String, default: '🏅' },
    homeTeam:           { type: String, required: true },
    awayTeam:           { type: String, required: true },
    numBettorsHome:     { type: Number, default: 0 },
    numBettorsAway:     { type: Number, default: 0 },
    totalBetAmountHome: { type: Number, default: 100 },
    totalBetAmountAway: { type: Number, default: 100 },
    betPool:            { type: Number, default: 200 },
    homeWin:  { label: { type: String, default: '' }, odds: { type: Number, default: 1.8 } },
    awayWin:  { label: { type: String, default: '' }, odds: { type: Number, default: 1.8 } },
    scoreHome:      { type: Number, default: 0 },
    scoreAway:      { type: Number, default: 0 },
    bettingOpensAt:  { type: Date, required: true },
    bettingClosesAt: { type: Date, required: true },
    winner: { type: String, default: '' },
    status: { type: String, enum: ['upcoming', 'live', 'finished', 'cancelled'], default: 'upcoming' },
}, { timestamps: true });

const Game = mongoose.models.Game || mongoose.model('Game', GameSchema);

const mins  = m => m * 60 * 1000;
const hours = h => h * 60 * 60 * 1000;
const days  = d => d * 24 * 60 * 60 * 1000;

const SPORT_EMOJI = {
    'Basketball': '🏀',
    'Football':   '🏈',
    'Soccer':     '⚽',
    'Baseball':   '⚾',
    'Softball':   '🥎',
    'Volleyball': '🏐',
    'Hockey':     '🏒',
    'Tennis':     '🎾',
    'Golf':       '⛳',
};

function getStatus(closesFromNow) {
    const now = new Date();
    const closeTime = new Date(Date.now() + closesFromNow);
    if (closesFromNow < 0) return 'finished';
    // same calendar day = live
    if (closeTime.toDateString() === now.toDateString()) return 'live';
    return 'upcoming';
}

function game(sport, home, away, closesFromNow) {
    const bettingClosesAt = new Date(Date.now() + closesFromNow);
    const bettingOpensAt  = new Date(bettingClosesAt.getTime() - days(2));
    return {
        sport,
        emoji: SPORT_EMOJI[sport] ?? '🏅',
        homeTeam: home,
        awayTeam: away,
        bettingOpensAt,
        bettingClosesAt,
        status: getStatus(closesFromNow),
        homeWin: { label: `${home} Win`, odds: 1.8 },
        awayWin: { label: `${away} Win`, odds: 1.8 },
        betPool: 200,
        totalBetAmountHome: 100,
        totalBetAmountAway: 100,
    };
}

const testGames = [
    // ── Upcoming (future days) ────────────────────────────────────────────────
    game('Basketball', 'UCF Knights', 'Florida Gators',        days(1) + hours(6)),
    game('Football',   'UCF Knights', 'FSU Seminoles',         days(2) + hours(2)),
    game('Soccer',     'UCF Knights', 'FIU Panthers',          days(1) + hours(10)),
    game('Hockey',     'UCF Knights', 'Miami Hurricanes',      days(3) + hours(4)),
    game('Volleyball', 'UCF Knights', 'Florida Atlantic',      days(2) + hours(8)),

    // ── Live today ────────────────────────────────────────────────────────────
    game('Softball',   'UCF Knights', 'Stetson Hatters',       hours(5)),
    game('Basketball', 'UCF Knights', 'Bethune-Cookman',       hours(8)),
    game('Baseball',   'UCF Knights', 'South Florida Bulls',   hours(4)),
    game('Soccer',     'UCF Knights', 'Tulane Green Wave',     hours(6)),
    game('Hockey',     'UCF Knights', 'Cincinnati Bearcats',   hours(3)),

    // ── Closing soon (within 10 min) ─────────────────────────────────────────
    game('Baseball',   'UCF Knights', 'Baylor Bears',          mins(7)),

    // ── Finished — resolvable via Admin tab ───────────────────────────────────
    game('Basketball', 'UCF Knights', 'Kansas Jayhawks',       -hours(1)),
    game('Football',   'UCF Knights', 'Memphis Tigers',        -hours(3)),
    game('Baseball',   'UCF Knights', 'East Carolina Pirates', -hours(5)),
    game('Soccer',     'UCF Knights', 'Temple Owls',           -hours(2)),
    game('Volleyball', 'UCF Knights', 'Wichita State Shockers',-hours(4)),
    game('Hockey',     'UCF Knights', 'Baylor Bears',          -hours(6)),
];

async function seed() {
    const uri = process.env.MONGO_DB_URL || process.env.MONGO_DB_URI || process.env.MONGODB_URI;
    if (!uri) { console.error('No MongoDB URI in .env'); process.exit(1); }

    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Remove all unresolved games (winner is empty — leaves already-resolved ones intact)
    const deleted = await Game.deleteMany({ winner: '' });
    console.log(`Removed ${deleted.deletedCount} unresolved games`);

    if (process.argv.includes('--wipe-only')) {
        console.log('Wipe-only mode — done.');
        process.exit(0);
    }

    const inserted = await Game.insertMany(testGames);
    console.log(`\nSeeded ${inserted.length} test games:\n`);

    inserted.forEach(g => {
        const now    = new Date();
        const closed = g.bettingClosesAt < now;
        const tag    = closed ? '🔴 CLOSED (resolvable)' :
                       (g.bettingClosesAt - now) < mins(10) ? '🟡 CLOSING' :
                       g.bettingClosesAt.toDateString() === now.toDateString() ? '🟢 OPEN today' :
                       '🔵 UPCOMING';
        console.log(`  ${tag}  [${g.sport}] ${g.homeTeam} vs ${g.awayTeam} — closes ${g.bettingClosesAt.toLocaleTimeString()}`);
    });

    process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
