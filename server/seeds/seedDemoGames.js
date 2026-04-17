/**
 * seedDemoGames.js
 *
 * Demo setup for presentation:
 *   3 Finished games  — real scores, winner set
 *   3 Live games      — open for betting right now
 *   4 Upcoming games  — future dates
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
const days  = d => d * 24 * 60 * 60 * 1000;

const SPORT_EMOJI = {
    'Basketball': '🏀',
    'Football':   '🏈',
    'Soccer':     '⚽',
    'Baseball':   '⚾',
    'Softball':   '🥎',
    'Volleyball': '🏐',
};

const now = new Date();

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
        bettingOpensAt:  new Date(now.getTime() - hours(48)),
        bettingClosesAt: new Date(now.getTime() - hours(3)),
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
        bettingOpensAt:  new Date(now.getTime() - hours(48)),
        bettingClosesAt: new Date(now.getTime() - hours(5)),
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
        bettingOpensAt:  new Date(now.getTime() - hours(48)),
        bettingClosesAt: new Date(now.getTime() - hours(2)),
        homeWin: { label: 'UCF Knights Win', odds: 1.8 },
        awayWin: { label: 'FIU Panthers Win', odds: 1.8 },
        betPool: 300, totalBetAmountHome: 150, totalBetAmountAway: 150,
    },

    // ── 3 LIVE — bettingClosesAt is in the past so getPublicGames computes status='live'
    //            (the controller sets live when now >= bettingClosesAt)
    {
        sport: 'Basketball',
        emoji: SPORT_EMOJI['Basketball'],
        homeTeam: 'UCF Knights',
        awayTeam: 'Miami Hurricanes',
        scoreHome: 0,
        scoreAway: 0,
        winner: '',
        status: 'live',
        bettingOpensAt:  new Date(now.getTime() - hours(6)),
        bettingClosesAt: new Date(now.getTime() - hours(1)),
        homeWin: { label: 'UCF Knights Win', odds: 1.8 },
        awayWin: { label: 'Miami Hurricanes Win', odds: 1.8 },
        betPool: 200, totalBetAmountHome: 100, totalBetAmountAway: 100,
    },
    {
        sport: 'Football',
        emoji: SPORT_EMOJI['Football'],
        homeTeam: 'UCF Knights',
        awayTeam: 'South Florida Bulls',
        scoreHome: 0,
        scoreAway: 0,
        winner: '',
        status: 'live',
        bettingOpensAt:  new Date(now.getTime() - hours(5)),
        bettingClosesAt: new Date(now.getTime() - hours(2)),
        homeWin: { label: 'UCF Knights Win', odds: 1.8 },
        awayWin: { label: 'South Florida Bulls Win', odds: 1.8 },
        betPool: 200, totalBetAmountHome: 100, totalBetAmountAway: 100,
    },
    {
        sport: 'Volleyball',
        emoji: SPORT_EMOJI['Volleyball'],
        homeTeam: 'UCF Knights',
        awayTeam: 'Bethune-Cookman',
        scoreHome: 0,
        scoreAway: 0,
        winner: '',
        status: 'live',
        bettingOpensAt:  new Date(now.getTime() - hours(4)),
        bettingClosesAt: new Date(now.getTime() - hours(1)),
        homeWin: { label: 'UCF Knights Win', odds: 1.8 },
        awayWin: { label: 'Bethune-Cookman Win', odds: 1.8 },
        betPool: 200, totalBetAmountHome: 100, totalBetAmountAway: 100,
    },

    // ── 4 UPCOMING — future days ──────────────────────────────────────────────
    {
        sport: 'Soccer',
        emoji: SPORT_EMOJI['Soccer'],
        homeTeam: 'UCF Knights',
        awayTeam: 'Florida Atlantic',
        scoreHome: 0, scoreAway: 0, winner: '',
        status: 'upcoming',
        bettingOpensAt:  new Date(now.getTime() + hours(12)),
        bettingClosesAt: new Date(now.getTime() + days(1) + hours(2)),
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
        bettingOpensAt:  new Date(now.getTime() + hours(18)),
        bettingClosesAt: new Date(now.getTime() + days(2) + hours(4)),
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
        bettingOpensAt:  new Date(now.getTime() + days(1)),
        bettingClosesAt: new Date(now.getTime() + days(3) + hours(1)),
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
        bettingOpensAt:  new Date(now.getTime() + days(2)),
        bettingClosesAt: new Date(now.getTime() + days(4) + hours(3)),
        homeWin: { label: 'UCF Knights Win', odds: 1.8 },
        awayWin: { label: 'Memphis Tigers Win', odds: 1.8 },
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
