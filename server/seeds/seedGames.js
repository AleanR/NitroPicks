const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const GameSchema = new mongoose.Schema({
    sport: { type: String, required: true },
    homeTeam: { type: String, required: true },
    awayTeam: { type: String, required: true },
    numBettorsHome: { type: Number, default: 0 },
    numBettorsAway: { type: Number, default: 0 },
    totalBetAmountHome: { type: Number, default: 0 },
    totalBetAmountAway: { type: Number, default: 0 },
    spread:    { label: { type: String, default: '' }, odds: { type: String, default: '' } },
    moneyline: { label: { type: String, default: '' }, odds: { type: String, default: '' } },
    total:     { label: { type: String, default: '' }, odds: { type: String, default: '' } },
    scoreHome: { type: Number, default: 0 },
    scoreAway: { type: Number, default: 0 },
    bettingOpensAt:  { type: Date, required: true },
    bettingClosesAt: { type: Date, required: true },
    winner: { type: String, default: '' },
    status: { type: String, enum: ['upcoming', 'open', 'closed', 'finished'], default: 'upcoming' },
    venue:    { type: String, default: '' },
    location: { type: String, default: '' },
    homeAway: { type: String, enum: ['home', 'away', 'neutral'], default: 'home' },
}, { timestamps: true });

const Game = mongoose.models.Game || mongoose.model('Game', GameSchema);

const rawGames = [
  { sport: "Baseball", title: "UCF vs Stetson", opponent: "Stetson Hatters", eventDate: "2026-04-07T22:00:00.000Z", homeAway: "home", venue: "John Euliano Park", location: "Orlando, FL" },
  { sport: "Softball", title: "UCF vs Arizona State", opponent: "Arizona State Sun Devils", eventDate: "2026-04-10T13:00:00.000Z", homeAway: "away", venue: "Alberta B. Farrington Softball Stadium", location: "Tempe, AZ" },
  { sport: "Softball", title: "UCF at Arizona State", opponent: "Arizona State Sun Devils", eventDate: "2026-04-11T23:00:00.000Z", homeAway: "away", venue: "Alberta B. Farrington Softball Stadium", location: "Tempe, AZ" },
  { sport: "Softball", title: "UCF at Arizona State", opponent: "Arizona State Sun Devils", eventDate: "2026-04-12T20:00:00.000Z", homeAway: "away", venue: "Alberta B. Farrington Softball Stadium", location: "Tempe, AZ" },
  { sport: "Baseball", title: "UCF at Kansas", opponent: "Kansas Jayhawks", eventDate: "2026-04-10T23:00:00.000Z", homeAway: "away", venue: "Hoglund Ballpark", location: "Lawrence, KS" },
  { sport: "Baseball", title: "UCF at Kansas", opponent: "Kansas Jayhawks", eventDate: "2026-04-11T19:00:00.000Z", homeAway: "away", venue: "Hoglund Ballpark", location: "Lawrence, KS" },
  { sport: "Baseball", title: "UCF at Kansas", opponent: "Kansas Jayhawks", eventDate: "2026-04-12T17:00:00.000Z", homeAway: "away", venue: "Hoglund Ballpark", location: "Lawrence, KS" },
  { sport: "Men's Tennis", title: "UCF at Arizona", opponent: "Arizona Wildcats", eventDate: "2026-04-09T22:00:00.000Z", homeAway: "away", venue: "Robson Tennis Center", location: "Tucson, AZ" },
  { sport: "Women's Tennis", title: "UCF vs Cincinnati", opponent: "Cincinnati Bearcats", eventDate: "2026-04-10T17:00:00.000Z", homeAway: "away", venue: "Lindner Family Tennis Center", location: "Cincinnati, OH" },
  { sport: "Women's Tennis", title: "UCF at West Virginia", opponent: "West Virginia Mountaineers", eventDate: "2026-04-12T14:00:00.000Z", homeAway: "away", venue: "WVU Tennis Complex", location: "Morgantown, WV" },
  { sport: "Baseball", title: "UCF vs Jacksonville", opponent: "Jacksonville Dolphins", eventDate: "2026-04-14T22:00:00.000Z", homeAway: "home", venue: "John Euliano Park", location: "Orlando, FL" },
  { sport: "Softball", title: "UCF vs Stetson", opponent: "Stetson Hatters", eventDate: "2026-04-15T22:00:00.000Z", homeAway: "home", venue: "UCF Softball Complex", location: "Orlando, FL" },
  { sport: "Women's Tennis", title: "UCF Big 12 Championship", opponent: "TBD (Big 12 Championship)", eventDate: "2026-04-15T00:00:00.000Z", homeAway: "home", venue: "USTA National Campus", location: "Lake Nona, Orlando, FL" },
  { sport: "Baseball", title: "UCF vs Cincinnati", opponent: "Cincinnati Bearcats", eventDate: "2026-04-17T22:00:00.000Z", homeAway: "home", venue: "John Euliano Park", location: "Orlando, FL" },
  { sport: "Baseball", title: "UCF vs Cincinnati", opponent: "Cincinnati Bearcats", eventDate: "2026-04-18T22:00:00.000Z", homeAway: "home", venue: "John Euliano Park", location: "Orlando, FL" },
  { sport: "Baseball", title: "UCF vs Cincinnati", opponent: "Cincinnati Bearcats", eventDate: "2026-04-19T17:00:00.000Z", homeAway: "home", venue: "John Euliano Park", location: "Orlando, FL" },
  { sport: "Softball", title: "UCF vs Kansas", opponent: "Kansas Jayhawks", eventDate: "2026-04-17T22:00:00.000Z", homeAway: "home", venue: "UCF Softball Complex", location: "Orlando, FL" },
  { sport: "Softball", title: "UCF vs Kansas", opponent: "Kansas Jayhawks", eventDate: "2026-04-18T21:00:00.000Z", homeAway: "home", venue: "UCF Softball Complex", location: "Orlando, FL" },
  { sport: "Softball", title: "UCF vs Kansas", opponent: "Kansas Jayhawks", eventDate: "2026-04-19T15:00:00.000Z", homeAway: "home", venue: "UCF Softball Complex", location: "Orlando, FL" },
  { sport: "Baseball", title: "UCF at Bethune-Cookman", opponent: "Bethune-Cookman Wildcats", eventDate: "2026-04-21T22:00:00.000Z", homeAway: "away", venue: "Jackie Robinson Ballpark", location: "Daytona Beach, FL" },
  { sport: "Softball", title: "UCF vs North Florida", opponent: "North Florida Ospreys", eventDate: "2026-04-22T22:00:00.000Z", homeAway: "home", venue: "UCF Softball Complex", location: "Orlando, FL" },
  { sport: "Baseball", title: "UCF at Utah", opponent: "Utah Utes", eventDate: "2026-04-24T22:00:00.000Z", homeAway: "away", venue: "America First Field", location: "Salt Lake City, UT" },
  { sport: "Baseball", title: "UCF at Utah", opponent: "Utah Utes", eventDate: "2026-04-25T22:00:00.000Z", homeAway: "away", venue: "America First Field", location: "Salt Lake City, UT" },
  { sport: "Baseball", title: "UCF at Utah", opponent: "Utah Utes", eventDate: "2026-04-26T22:00:00.000Z", homeAway: "away", venue: "America First Field", location: "Salt Lake City, UT" },
  { sport: "Softball", title: "UCF at Florida", opponent: "Florida Gators", eventDate: "2026-04-24T22:00:00.000Z", homeAway: "away", venue: "Katie Seashole Pressly Stadium", location: "Gainesville, FL" },
  { sport: "Softball", title: "UCF vs Florida", opponent: "Florida Gators", eventDate: "2026-04-25T22:00:00.000Z", homeAway: "home", venue: "UCF Softball Complex", location: "Orlando, FL" },
  { sport: "Baseball", title: "UCF vs Stetson", opponent: "Stetson Hatters", eventDate: "2026-04-29T00:00:00.000Z", homeAway: "neutral", venue: "TBD", location: "TBD" },
  { sport: "Softball", title: "UCF at Iowa State", opponent: "Iowa State Cyclones", eventDate: "2026-05-01T00:00:00.000Z", homeAway: "away", venue: "Cyclone Sports Complex", location: "Ames, IA" },
  { sport: "Softball", title: "UCF at Iowa State", opponent: "Iowa State Cyclones", eventDate: "2026-05-02T00:00:00.000Z", homeAway: "away", venue: "Cyclone Sports Complex", location: "Ames, IA" },
  { sport: "Softball", title: "UCF at Iowa State", opponent: "Iowa State Cyclones", eventDate: "2026-05-03T00:00:00.000Z", homeAway: "away", venue: "Cyclone Sports Complex", location: "Ames, IA" },
  { sport: "Baseball", title: "UCF vs Arizona State", opponent: "Arizona State Sun Devils", eventDate: "2026-05-01T00:00:00.000Z", homeAway: "home", venue: "John Euliano Park", location: "Orlando, FL" },
  { sport: "Baseball", title: "UCF vs Arizona State", opponent: "Arizona State Sun Devils", eventDate: "2026-05-02T00:00:00.000Z", homeAway: "home", venue: "John Euliano Park", location: "Orlando, FL" },
  { sport: "Baseball", title: "UCF vs Arizona State", opponent: "Arizona State Sun Devils", eventDate: "2026-05-03T00:00:00.000Z", homeAway: "home", venue: "John Euliano Park", location: "Orlando, FL" },
  { sport: "Baseball", title: "UCF at FAU", opponent: "Florida Atlantic Owls", eventDate: "2026-05-05T00:00:00.000Z", homeAway: "away", venue: "FAU Baseball Stadium", location: "Boca Raton, FL" },
  { sport: "Softball", title: "UCF Big 12 Softball Tournament", opponent: "TBD (Big 12 Tournament)", eventDate: "2026-05-07T00:00:00.000Z", homeAway: "neutral", venue: "Devon Park", location: "Oklahoma City, OK" },
  { sport: "Baseball", title: "UCF at Baylor", opponent: "Baylor Bears", eventDate: "2026-05-08T00:00:00.000Z", homeAway: "away", venue: "Baylor Ballpark", location: "Waco, TX" },
];

function toGameDoc(raw) {
    const eventDate = new Date(raw.eventDate);
    const bettingOpensAt  = new Date(eventDate.getTime() - 48 * 60 * 60 * 1000); // 48h before
    const bettingClosesAt = new Date(eventDate.getTime() -  1 * 60 * 60 * 1000); //  1h before

    const ucf = 'UCF Knights';
    const homeTeam = raw.homeAway === 'home' ? ucf : (raw.homeAway === 'neutral' ? ucf : raw.opponent);
    const awayTeam = raw.homeAway === 'home' ? raw.opponent : (raw.homeAway === 'neutral' ? raw.opponent : ucf);

    return {
        sport: raw.sport,
        homeTeam,
        awayTeam,
        bettingOpensAt,
        bettingClosesAt,
        status: 'upcoming',
        venue: raw.venue,
        location: raw.location,
        homeAway: raw.homeAway,
        moneyline: { label: `${homeTeam} Win`, odds: '-110' },
        spread:    { label: '', odds: '' },
        total:     { label: '', odds: '' },
    };
}

async function seed() {
    try {
        const uri = process.env.MONGO_DB_URL || process.env.MONGO_DB_URI || process.env.MONGODB_URI;
        if (!uri) throw new Error('No MongoDB URI found in .env');

        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const docs = rawGames.map(toGameDoc);
        const inserted = await Game.insertMany(docs);
        console.log(`Seeded ${inserted.length} games successfully.`);

        inserted.forEach(g => console.log(`  [${g.sport}] ${g.homeTeam} vs ${g.awayTeam} — ${g.bettingClosesAt.toDateString()}`));
        process.exit(0);
    } catch (err) {
        console.error('Seed failed:', err.message);
        process.exit(1);
    }
}

seed();
