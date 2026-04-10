const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const RewardSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, enum: ['food', 'merch', 'campus', 'athletics', 'digital', 'experience'], required: true },
    description: { type: String, required: true },
    pointsCost: { type: Number, required: true, min: 1 },
    quantityAvailable: { type: Number, required: true, min: 0 },
    quantityRedeemed: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    eligibility: { type: String, default: '' },
    redemptionInstructions: { type: String, default: '' },
}, { timestamps: true });

const Reward = mongoose.models.Reward || mongoose.model('Reward', RewardSchema);

const rewards = [
    {
        name: "Free Classic Chicken Sandwich",
        category: "food",
        description: "One complimentary classic chicken sandwich at the Chick-fil-A location inside the UCF Student Union. No purchase necessary. One redemption per student per semester.",
        pointsCost: 400,
        quantityAvailable: 200,
        isActive: true,
        eligibility: "Must be an enrolled UCF student with an active NitroPicks account in good standing.",
        redemptionInstructions: "A unique voucher code will be emailed to your UCF email address within 15 minutes. Show the code or email at the Student Union Chick-fil-A register. Valid for 30 days from redemption date."
    },
    {
        name: "$5 Knightro's Dining Credit",
        category: "food",
        description: "A $5 credit added directly to your Knights Kard dining balance at Knightro's in the Student Union. Credit expires 30 days after redemption.",
        pointsCost: 300,
        quantityAvailable: 500,
        isActive: true,
        eligibility: "Must be an enrolled UCF student with an active Knights Kard and NitroPicks account.",
        redemptionInstructions: "Submit your UCF ID number through the redemption screen. Credits are applied to your Knights Kard within 24 hours. You will receive a confirmation email to your UCF address."
    },
    {
        name: "Free Coffee - Starbucks at Ferrell Commons",
        category: "food",
        description: "One complimentary tall (12 oz) hot or iced coffee at the Starbucks location in Ferrell Commons on the UCF main campus.",
        pointsCost: 350,
        quantityAvailable: 150,
        isActive: true,
        eligibility: "Must be an enrolled UCF student with an active NitroPicks account.",
        redemptionInstructions: "A unique barcode voucher will be emailed to your UCF address. Show the barcode at the Starbucks register. Valid for 14 days from redemption."
    },
    {
        name: "UCF Snapback Hat",
        category: "merch",
        description: "Official UCF snapback cap in black and gold. One size fits most. Available at the UCF Campus Store on Memory Mall while supplies last.",
        pointsCost: 900,
        quantityAvailable: 75,
        isActive: true,
        eligibility: "Must be an enrolled UCF student with an active NitroPicks account.",
        redemptionInstructions: "A voucher code and pickup instructions will be emailed to your UCF address within 1 hour. Bring your UCF ID and voucher to the Campus Store on Memory Mall to claim your hat. Valid for 14 days."
    },
    {
        name: "UCF Athletics T-Shirt",
        category: "merch",
        description: "Official UCF Knights short-sleeve t-shirt in your choice of available size (S-2XL). Pickup at the Campus Store on Memory Mall.",
        pointsCost: 700,
        quantityAvailable: 100,
        isActive: true,
        eligibility: "Must be an enrolled UCF student with an active NitroPicks account.",
        redemptionInstructions: "Select your size and submit your redemption. A voucher code will be emailed to your UCF address. Bring your UCF ID and voucher to the Campus Store. Valid 14 days from redemption."
    },
    {
        name: "UCF Knight Lanyard & Keychain Bundle",
        category: "merch",
        description: "An officially licensed UCF lanyard and metallic keychain set in black and gold. A great starter bundle for any Knight.",
        pointsCost: 200,
        quantityAvailable: 300,
        isActive: true,
        eligibility: "Must be an enrolled UCF student with an active NitroPicks account.",
        redemptionInstructions: "A pickup voucher will be emailed to your UCF address. Collect your bundle at the Campus Store on Memory Mall. Valid 30 days from redemption."
    },
    {
        name: "UCF Water Bottle (32 oz)",
        category: "merch",
        description: "Officially licensed UCF stainless steel insulated water bottle in black with gold UCF logo. Holds 32 oz.",
        pointsCost: 600,
        quantityAvailable: 80,
        isActive: true,
        eligibility: "Must be an enrolled UCF student with an active NitroPicks account.",
        redemptionInstructions: "A voucher code and pickup instructions will be emailed to your UCF address. Bring your UCF ID and voucher to the Campus Store on Memory Mall. Valid 14 days from redemption."
    },
    {
        name: "50 Campus Print Credits",
        category: "campus",
        description: "50 pages of print credit added to your UCF student printing account. Credits are valid at all UCF campus library printing stations and are applied within 24 hours.",
        pointsCost: 250,
        quantityAvailable: 1000,
        isActive: true,
        eligibility: "Must be an enrolled UCF student with an active NitroPicks account and a UCF student printing account.",
        redemptionInstructions: "Submit your UCF NID through the redemption screen. Credits are applied to your student printing account within 24 hours. A confirmation email will be sent to your UCF address."
    },
    {
        name: "Parking Pass - Remote Lot B (1 Day)",
        category: "campus",
        description: "A single-day complimentary parking pass for Lot B (remote/shuttle) on the UCF main campus. Valid on any standard weekday.",
        pointsCost: 150,
        quantityAvailable: 500,
        isActive: true,
        eligibility: "Must be an enrolled UCF student with a valid UCF ID and active NitroPicks account.",
        redemptionInstructions: "A daily parking permit code will be emailed to your UCF address. Enter the code in the UCF Parking Services app or present the email to an attendant upon entry. Valid for the selected date only."
    },
    {
        name: "UCF Recreation & Wellness Center Guest Pass",
        category: "campus",
        description: "One complimentary single-day guest pass to the UCF Recreation and Wellness Center for you to bring a friend or family member not enrolled at UCF.",
        pointsCost: 350,
        quantityAvailable: 200,
        isActive: true,
        eligibility: "Must be an enrolled UCF student with an active NitroPicks account. UCF students already have full access; this rewards a guest pass only.",
        redemptionInstructions: "A guest pass authorization code will be emailed to your UCF address. Present the code at the Recreation and Wellness Center front desk along with your UCF student ID. Valid for 30 days from redemption."
    },
    {
        name: "UCF Library Study Room - 2-Hour Priority Booking",
        category: "campus",
        description: "Priority access to book one of the UCF John C. Hitt Library reservable study rooms for a 2-hour session. Bypasses the standard 48-hour advance booking window.",
        pointsCost: 100,
        quantityAvailable: 999,
        isActive: true,
        eligibility: "Must be an enrolled UCF student with an active NitroPicks account.",
        redemptionInstructions: "A priority booking code will be emailed to your UCF address within 1 hour. Use the code in the UCF Library study room reservation system to unlock priority scheduling. Valid for 7 days from redemption."
    },
    {
        name: "Student Section Upgrade - Lower Bowl Seating",
        category: "athletics",
        description: "Upgrade your existing UCF home game student ticket from the student section to an available lower-bowl seat for one UCF football or basketball home game.",
        pointsCost: 1200,
        quantityAvailable: 50,
        isActive: true,
        eligibility: "Must be an enrolled UCF student with a valid game ticket and active NitroPicks account. Valid for home UCF football or basketball games only. Subject to seat availability.",
        redemptionInstructions: "A voucher code will be emailed to your UCF address. Present your original game ticket and voucher code at the UCF Athletics will-call window on game day to receive your upgraded seat. Valid for one game only."
    },
    {
        name: "UCF Athletics Student Concession Credit ($10)",
        category: "athletics",
        description: "A $10 credit for use at UCF Athletics concession stands at CFCFBank Stadium or Addition Financial Arena for any single UCF home game.",
        pointsCost: 500,
        quantityAvailable: 300,
        isActive: true,
        eligibility: "Must be an enrolled UCF student with an active NitroPicks account and a valid game ticket for the event.",
        redemptionInstructions: "A single-use concession voucher will be emailed to your UCF address. Present the voucher code at any concession register at the designated venue on game day. Valid for one event, cannot be combined with other offers."
    },
    {
        name: "UCF Knight Zone Early Entry Pass",
        category: "athletics",
        description: "Priority early entry to the UCF student section (Knight Zone) for one home UCF football game, allowing you and up to one guest to enter 30 minutes before general student section doors open.",
        pointsCost: 800,
        quantityAvailable: 100,
        isActive: true,
        eligibility: "Must be an enrolled UCF student with a valid student football ticket and active NitroPicks account.",
        redemptionInstructions: "An early entry pass will be emailed to your UCF address. Present the pass along with your student ID at the Knight Zone priority entry gate. Valid for one designated home football game."
    },
    {
        name: "UCF vs Florida Softball Reserved Seat",
        category: "athletics",
        description: "One reserved general admission seat at the UCF Softball Complex for the UCF vs Florida home game on April 25, 2026. Includes access to the shaded seating section.",
        pointsCost: 600,
        quantityAvailable: 40,
        isActive: true,
        eligibility: "Must be an enrolled UCF student with an active NitroPicks account.",
        redemptionInstructions: "A reserved seat ticket will be emailed to your UCF address as a mobile ticket. Present the QR code at the UCF Softball Complex gate on April 25, 2026. Valid for this game only."
    },
    {
        name: "UCF Baseball Game Ticket (John Euliano Park)",
        category: "athletics",
        description: "One general admission ticket to a UCF home baseball game at John Euliano Park. Date is subject to availability; redeem early for best selection.",
        pointsCost: 400,
        quantityAvailable: 150,
        isActive: true,
        eligibility: "Must be an enrolled UCF student with an active NitroPicks account.",
        redemptionInstructions: "Select your preferred game date from the available options in the app. A mobile ticket will be emailed to your UCF address. Present the QR code at the John Euliano Park gate on your selected game day."
    },
    {
        name: "NitroPicks Top Predictor Digital Badge",
        category: "digital",
        description: "An exclusive 'Top Predictor' digital badge displayed on your NitroPicks profile, visible on the public leaderboard. Awarded once per season. Marks you as an elite forecaster.",
        pointsCost: 500,
        quantityAvailable: 999,
        isActive: true,
        eligibility: "Must be an enrolled UCF student with an active NitroPicks account.",
        redemptionInstructions: "The badge is applied automatically to your NitroPicks profile within 5 minutes of redemption. It will appear next to your username on the leaderboard and your profile page for the remainder of the active season."
    },
    {
        name: "NitroPicks Gold Status Profile Frame",
        category: "digital",
        description: "A premium animated gold frame applied to your NitroPicks profile avatar, visible to all users. Marks your profile as Gold tier for the season.",
        pointsCost: 300,
        quantityAvailable: 999,
        isActive: true,
        eligibility: "Must be an enrolled UCF student with an active NitroPicks account.",
        redemptionInstructions: "The frame is applied to your profile automatically within 5 minutes of redemption. Visible on your profile page and next to your name in the leaderboard and bet activity feed for the current season."
    },
    {
        name: "NitroPicks Custom Display Name Color",
        category: "digital",
        description: "Unlock a custom gold or black color for your display name across NitroPicks. Cosmetic only - gives your profile a distinctive look in the leaderboard and activity feeds.",
        pointsCost: 150,
        quantityAvailable: 999,
        isActive: true,
        eligibility: "Must be an enrolled UCF student with an active NitroPicks account.",
        redemptionInstructions: "After redemption, go to your account settings in NitroPicks and select your preferred name color from the unlocked palette. Applied instantly."
    },
    {
        name: "UCF Knights Knightro Sticker Pack (Digital)",
        category: "digital",
        description: "A set of 10 exclusive UCF Knightro-themed digital stickers usable in NitroPicks bet reactions and activity feed comments.",
        pointsCost: 75,
        quantityAvailable: 9999,
        isActive: true,
        eligibility: "Must be an enrolled UCF student with an active NitroPicks account.",
        redemptionInstructions: "The sticker pack is added to your NitroPicks account immediately after redemption. Access it from the emoji/sticker panel in the activity feed."
    },
    {
        name: "UCF Athletics Behind-the-Scenes Tour",
        category: "experience",
        description: "A guided behind-the-scenes tour of UCF Athletics facilities including the football locker room, press box, and coaches' offices at CFCFBank Stadium. Groups of up to 4 students.",
        pointsCost: 2500,
        quantityAvailable: 20,
        isActive: true,
        eligibility: "Must be an enrolled UCF student with an active NitroPicks account. Tour dates are assigned by UCF Athletics staff and are subject to availability and scheduling conflicts.",
        redemptionInstructions: "After redemption, a UCF Athletics coordinator will contact you at your UCF email address within 3-5 business days to schedule your tour. Tours are held on select weekdays during the academic semester."
    },
    {
        name: "UCF Baseball Batting Practice Observation Pass",
        category: "experience",
        description: "Access to watch a UCF baseball team batting practice session from field level at John Euliano Park. Valid for one designated session per season. Limited availability.",
        pointsCost: 1500,
        quantityAvailable: 30,
        isActive: true,
        eligibility: "Must be an enrolled UCF student with an active NitroPicks account. Participants must comply with all UCF Athletics media and facility policies.",
        redemptionInstructions: "A UCF Baseball staff member will contact you at your UCF email address within 3-5 business days to schedule your session. You will receive a confirmation with date, time, and instructions."
    },
    {
        name: "Meet a UCF Athlete - Post-Game Access Pass",
        category: "experience",
        description: "Exclusive post-game access to a brief meet-and-greet with participating UCF athletes at a home event. Limited to 10 students per event. Sport and athlete availability varies.",
        pointsCost: 5000,
        quantityAvailable: 10,
        isActive: true,
        eligibility: "Must be an enrolled UCF student with a valid game ticket for the designated event and an active NitroPicks account. Not all events are eligible.",
        redemptionInstructions: "A UCF Athletics coordinator will email you within 2 business days to confirm your access pass and provide event-specific instructions. You must check in at the designated meet-and-greet area within 15 minutes of the final whistle."
    },
    {
        name: "UCF Knight Zone First-Row Pledge - One Season",
        category: "experience",
        description: "Guaranteed front-row access in the UCF Knight Zone student section for every remaining home football game of the current season. Must claim on a game-by-game basis.",
        pointsCost: 3500,
        quantityAvailable: 15,
        isActive: true,
        eligibility: "Must be an enrolled full-time UCF student with a valid season football student ticket and an active NitroPicks account.",
        redemptionInstructions: "A priority pass linked to your UCF ID will be activated within 48 hours. Present your UCF ID at the Knight Zone priority entry gate before each home football game. Valid for the remainder of the current football season."
    },
    {
        name: "UCF Athletics Gameday Parking Pass (Season)",
        category: "athletics",
        description: "A season-long gameday parking pass for UCF Athletics home events, valid for a designated surface lot adjacent to CFCFBank Stadium or Addition Financial Arena.",
        pointsCost: 2000,
        quantityAvailable: 25,
        isActive: true,
        eligibility: "Must be an enrolled UCF student with a valid student vehicle permit and active NitroPicks account.",
        redemptionInstructions: "A physical or digital hang tag will be mailed or emailed to you within 5 business days after redemption. Display the pass in your vehicle when parking in the designated lot on gameday. Valid through the end of the current academic year."
    },
    {
        name: "UCF Volleyball Student Section Ticket Pack (3 Games)",
        category: "athletics",
        description: "A 3-game student ticket voucher pack for UCF volleyball home matches at Addition Financial Arena. Choose any three regular-season home matches.",
        pointsCost: 450,
        quantityAvailable: 80,
        isActive: true,
        eligibility: "Must be an enrolled UCF student with an active NitroPicks account.",
        redemptionInstructions: "Mobile tickets for your selected games will be emailed to your UCF address within 24 hours after you designate your preferred game dates in the app. Present your QR codes at the arena gate."
    },
    {
        name: "NitroPicks Season Stats Report (Premium PDF)",
        category: "digital",
        description: "A personalized end-of-season PDF report summarizing your NitroPicks performance - including win rate, best predictions, KP earned, and a leaderboard ranking breakdown.",
        pointsCost: 200,
        quantityAvailable: 9999,
        isActive: true,
        eligibility: "Must be an enrolled UCF student with an active NitroPicks account and at least 5 completed bets in the current season.",
        redemptionInstructions: "Your personalized stats report is generated automatically and emailed to your UCF address within 24 hours of redemption. The report covers all activity through the current date."
    },
    {
        name: "UCF Spirit Bundle - Foam Finger + Face Stickers",
        category: "merch",
        description: "UCF-branded gameday spirit pack including one oversized foam finger and a sheet of UCF face paint stickers in black and gold.",
        pointsCost: 175,
        quantityAvailable: 400,
        isActive: true,
        eligibility: "Must be an enrolled UCF student with an active NitroPicks account.",
        redemptionInstructions: "A pickup voucher will be emailed to your UCF address within 1 hour. Collect your bundle at the UCF Athletics ticket office or at designated gameday pickup locations at least 1 hour before kickoff/tipoff."
    },
    {
        name: "UCF Hat Trick Bundle - Hat + Shirt + Lanyard",
        category: "merch",
        description: "A curated UCF merchandise bundle including one snapback hat, one t-shirt (size of your choice), and one lanyard. Ideal for the dedicated Knight.",
        pointsCost: 1600,
        quantityAvailable: 40,
        isActive: true,
        eligibility: "Must be an enrolled UCF student with an active NitroPicks account.",
        redemptionInstructions: "A bundle pickup voucher will be emailed to your UCF address within 1 hour. Bring your UCF ID and voucher code to the Campus Store on Memory Mall to claim your bundle. Valid for 14 days."
    },
    {
        name: "NitroPicks Season Bet Limit Boost (+5 Bets)",
        category: "digital",
        description: "Permanently increases your NitroPicks maximum active bet limit by 5 for the current season, allowing you to have more concurrent predictions open at once.",
        pointsCost: 400,
        quantityAvailable: 9999,
        isActive: true,
        eligibility: "Must be an enrolled UCF student with an active NitroPicks account.",
        redemptionInstructions: "The bet limit boost is applied to your account automatically within 5 minutes of redemption. Your updated active bet limit will be visible in your account settings page."
    },
];

async function seed() {
    try {
        const uri = process.env.MONGO_DB_URL || process.env.MONGO_DB_URI || process.env.MONGODB_URI;
        if (!uri) throw new Error('No MongoDB URI found in .env');

        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        await Reward.deleteMany({});
        console.log('Cleared existing rewards.');

        const inserted = await Reward.insertMany(rewards);
        console.log(`\nSeeded ${inserted.length} rewards successfully.\n`);

        const byCategory = inserted.reduce((acc, r) => {
            acc[r.category] = (acc[r.category] || 0) + 1;
            return acc;
        }, {});
        Object.entries(byCategory).forEach(([cat, count]) => {
            console.log(`  ${cat}: ${count}`);
        });

        process.exit(0);
    } catch (err) {
        console.error('Seed failed:', err.message);
        process.exit(1);
    }
}

seed();
