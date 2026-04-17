/**
 * seedDemoGames.js
 *
 * Demo setup for presentation:
 *   3 Finished games  — real scores, winner set
 *  10 Upcoming games  — betting closes at 1-hour intervals from now
 *
 * Run from the server/ directory:
 *   node seeds/seedDemoGames.js
 *
 * To wipe all games without re-inserting:
 *   node seeds/seedDemoGames.js --wipe-only
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
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

const hours = h => h * 60 * 60 * 1000;

const SPORT_EMOJI = {
    'Basketball': '🏀',
    'Football':   '🏈',
    'Soccer':     '⚽',
    'Baseball':   '⚾',
    'Softball':   '🥎',
    'Volleyball': '🏐',
};

const now = new Date();

// fromNow(h) — exactly h hours from now
const fromNow = h => new Date(now.getTime() + hours(h));

// ago(dayOffset, hour, min) — e.g. ago(-2, 9) = 2 days ago at 9:00 AM
const ago = (dayOffset, hour, min = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hour, min, 0, 0);
    return d;
};

const demoGames = [

    // ── 3 FINISHED — real scores, winner already decided ─────────────────────
    {
        sport: 'Basketball',
        emoji: SPORT_EMOJI['Basketball'],
        homeTeam: 'UCF Knights',
        awayTeam: 'Florida Gators',
        scoreHome: 82,
        scoreAway: 74,
        winner: 'home',
        status: 'finished',
        bettingOpensAt:  ago(-2, 9),       // 2 days ago 9:00 AM
        bettingClosesAt: ago(-1, 19),      // yesterday 7:00 PM
        homeWin: { label: 'UCF Knights Win', odds: 1.9 },
        awayWin: { label: 'Florida Gators Win', odds: 1.7 },
        betPool: 500, totalBetAmountHome: 300, totalBetAmountAway: 200,
    },
    {
        sport: 'Soccer',
        emoji: SPORT_EMOJI['Soccer'],
        homeTeam: 'UCF Knights',
        awayTeam: 'FSU Seminoles',
        scoreHome: 1,
        scoreAway: 3,
        winner: 'away',
        status: 'finished',
        bettingOpensAt:  ago(-2, 9),       // 2 days ago 9:00 AM
        bettingClosesAt: ago(-1, 17),      // yesterday 5:00 PM
        homeWin: { label: 'UCF Knights Win', odds: 2.1 },
        awayWin: { label: 'FSU Seminoles Win', odds: 1.6 },
        betPool: 400, totalBetAmountHome: 150, totalBetAmountAway: 250,
    },
    {
        sport: 'Baseball',
        emoji: SPORT_EMOJI['Baseball'],
        homeTeam: 'UCF Knights',
        awayTeam: 'FIU Panthers',
        scoreHome: 7,
        scoreAway: 4,
        winner: 'home',
        status: 'finished',
        bettingOpensAt:  ago(-2, 10),      // 2 days ago 10:00 AM
        bettingClosesAt: ago(-1, 14),      // yesterday 2:00 PM
        homeWin: { label: 'UCF Knights Win', odds: 1.8 },
        awayWin: { label: 'FIU Panthers Win', odds: 1.8 },
        betPool: 300, totalBetAmountHome: 150, totalBetAmountAway: 150,
    },

    // ── 10 UPCOMING — bettingClosesAt at 1-hour intervals from now ────────────
    {
        sport: 'Basketball',
        emoji: SPORT_EMOJI['Basketball'],
        homeTeam: 'UCF Knights',
        awayTeam: 'Miami Hurricanes',
        scoreHome: 0, scoreAway: 0, winner: '',
        status: 'upcoming',
        bettingOpensAt:  ago(0, 9),
        bettingClosesAt: fromNow(1),       // now + 1 hr
        homeWin: { label: 'UCF Knights Win', odds: 1.8 },
        awayWin: { label: 'Miami Hurricanes Win', odds: 1.8 },
        betPool: 200, totalBetAmountHome: 100, totalBetAmountAway: 100,
    },
    {
        sport: 'Football',
        emoji: SPORT_EMOJI['Football'],
        homeTeam: 'UCF Knights',
        awayTeam: 'South Florida Bulls',
        scoreHome: 0, scoreAway: 0, winner: '',
        status: 'upcoming',
        bettingOpensAt:  ago(0, 9),
        bettingClosesAt: fromNow(2),       // now + 2 hrs
        homeWin: { label: 'UCF Knights Win', odds: 1.8 },
        awayWin: { label: 'South Florida Bulls Win', odds: 1.8 },
        betPool: 200, totalBetAmountHome: 100, totalBetAmountAway: 100,
    },
    {
        sport: 'Volleyball',
        emoji: SPORT_EMOJI['Volleyball'],
        homeTeam: 'UCF Knights',
        awayTeam: 'Bethune-Cookman',
        scoreHome: 0, scoreAway: 0, winner: '',
        status: 'upcoming',
        bettingOpensAt:  ago(0, 9),
        bettingClosesAt: fromNow(3),       // now + 3 hrs
        homeWin: { label: 'UCF Knights Win', odds: 1.8 },
        awayWin: { label: 'Bethune-Cookman Win', odds: 1.8 },
        betPool: 200, totalBetAmountHome: 100, totalBetAmountAway: 100,
    },
    {
        sport: 'Soccer',
        emoji: SPORT_EMOJI['Soccer'],
        homeTeam: 'UCF Knights',
        awayTeam: 'Florida Atlantic',
        scoreHome: 0, scoreAway: 0, winner: '',
        status: 'upcoming',
        bettingOpensAt:  ago(0, 9),
        bettingClosesAt: fromNow(4),       // now + 4 hrs
        homeWin: { label: 'UCF Knights Win', odds: 1.8 },
        awayWin: { label: 'Florida Atlantic Win', odds: 1.8 },
        betPool: 200, totalBetAmountHome: 100, totalBetAmountAway: 100,
    },
    {
        sport: 'Basketball',
        emoji: SPORT_EMOJI['Basketball'],
        homeTeam: 'UCF Knights',
        awayTeam: 'Kansas Jayhawks',
        scoreHome: 0, scoreAway: 0, winner: '',
        status: 'upcoming',
        bettingOpensAt:  ago(0, 9),
        bettingClosesAt: fromNow(5),       // now + 5 hrs
        homeWin: { label: 'UCF Knights Win', odds: 1.8 },
        awayWin: { label: 'Kansas Jayhawks Win', odds: 1.8 },
        betPool: 200, totalBetAmountHome: 100, totalBetAmountAway: 100,
    },
    {
        sport: 'Baseball',
        emoji: SPORT_EMOJI['Baseball'],
        homeTeam: 'UCF Knights',
        awayTeam: 'Tulane Green Wave',
        scoreHome: 0, scoreAway: 0, winner: '',
        status: 'upcoming',
        bettingOpensAt:  ago(0, 9),
        bettingClosesAt: fromNow(6),       // now + 6 hrs
        homeWin: { label: 'UCF Knights Win', odds: 1.8 },
        awayWin: { label: 'Tulane Green Wave Win', odds: 1.8 },
        betPool: 200, totalBetAmountHome: 100, totalBetAmountAway: 100,
    },
    {
        sport: 'Softball',
        emoji: SPORT_EMOJI['Softball'],
        homeTeam: 'UCF Knights',
        awayTeam: 'Memphis Tigers',
        scoreHome: 0, scoreAway: 0, winner: '',
        status: 'upcoming',
        bettingOpensAt:  ago(0, 9),
        bettingClosesAt: fromNow(7),       // now + 7 hrs
        homeWin: { label: 'UCF Knights Win', odds: 1.8 },
        awayWin: { label: 'Memphis Tigers Win', odds: 1.8 },
        betPool: 200, totalBetAmountHome: 100, totalBetAmountAway: 100,
    },
    {
        sport: 'Soccer',
        emoji: SPORT_EMOJI['Soccer'],
        homeTeam: 'UCF Knights',
        awayTeam: 'USF Bulls',
        scoreHome: 0, scoreAway: 0, winner: '',
        status: 'upcoming',
        bettingOpensAt:  ago(0, 9),
        bettingClosesAt: fromNow(8),       // now + 8 hrs
        homeWin: { label: 'UCF Knights Win', odds: 1.8 },
        awayWin: { label: 'USF Bulls Win', odds: 1.8 },
        betPool: 200, totalBetAmountHome: 100, totalBetAmountAway: 100,
    },
    {
        sport: 'Football',
        emoji: SPORT_EMOJI['Football'],
        homeTeam: 'UCF Knights',
        awayTeam: 'Cincinnati Bearcats',
        scoreHome: 0, scoreAway: 0, winner: '',
        status: 'upcoming',
        bettingOpensAt:  ago(0, 9),
        bettingClosesAt: fromNow(9),       // now + 9 hrs
        homeWin: { label: 'UCF Knights Win', odds: 1.8 },
        awayWin: { label: 'Cincinnati Bearcats Win', odds: 1.8 },
        betPool: 200, totalBetAmountHome: 100, totalBetAmountAway: 100,
    },
    {
        sport: 'Basketball',
        emoji: SPORT_EMOJI['Basketball'],
        homeTeam: 'UCF Knights',
        awayTeam: 'Houston Cougars',
        scoreHome: 0, scoreAway: 0, winner: '',
        status: 'upcoming',
        bettingOpensAt:  ago(0, 9),
        bettingClosesAt: fromNow(10),      // now + 10 hrs
        homeWin: { label: 'UCF Knights Win', odds: 1.8 },
        awayWin: { label: 'Houston Cougars Win', odds: 1.8 },
        betPool: 200, totalBetAmountHome: 100, totalBetAmountAway: 100,
    },
];

async function seed() {
    const uri = process.env.MONGO_DB_URL || process.env.MONGO_DB_URI || process.env.MONGODB_URI;
    if (!uri) { console.error('No MongoDB URI found in .env'); process.exit(1); }

    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const deleted = await Game.deleteMany({});
    console.log(`Deleted ${deleted.deletedCount} existing games`);

    if (process.argv.includes('--wipe-only')) {
        console.log('Wipe-only mode — done.');
        await mongoose.disconnect();
        process.exit(0);
    }

    const inserted = await Game.insertMany(demoGames);
    console.log(`\nSeeded ${inserted.length} demo games:\n`);

    inserted.forEach(g => {
        const tag = g.status === 'finished' ? '🔴 FINISHED' :
                    g.status === 'live'     ? '🟢 LIVE' : '🔵 UPCOMING';
        const score = g.status === 'finished' ? ` (${g.scoreHome}–${g.scoreAway}, winner: ${g.winner})` : '';
        console.log(`  ${tag}  [${g.sport}] ${g.homeTeam} vs ${g.awayTeam}${score}`);
    });

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
