const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
require('dotenv').config();

const seedDatabase = async () => {
    try {
        await connectDB(); // calling connectDB function
        console.log('\nNitroBets Database Seeder\n');

        // clearing the existing users -> re-run safely
        await User.deleteMany({});
        console.log('Cleared existing users.');

        // salt -> random string that gets mixed into the password before hashing
        const salt = await bcrypt.genSalt(10); // hashing a test password
        const hashedPassword = await bcrypt.hash('Test1234!', salt);

        // test users 
        const users = [
            {
                firstName: 'Marcus',
                lastName: 'Johnson',
                email: 'marcus.johnson@knights.ucf.edu',
                passwordHash: hashedPassword,
                ucfStudentId: 'UCF1001',
                major: 'Computer Science',
                isEmailVerified: true,
                pointsBalance: 2450
            },
            {
                firstName: 'Sophia',
                lastName: 'Martinez',
                email: 'sophia.martinez@knights.ucf.edu',
                passwordHash: hashedPassword,
                ucfStudentId: 'UCF1002',
                major: 'Biomedical Sciences',
                isEmailVerified: true,
                pointsBalance: 4100
            },
            {
                firstName: 'Tyler',
                lastName: 'Chen',
                email: 'tyler.chen@knights.ucf.edu',
                passwordHash: hashedPassword,
                ucfStudentId: 'UCF1003',
                major: 'Information Technology',
                isEmailVerified: true,
                pointsBalance: 850
            },
            {
                firstName: 'Aisha',
                lastName: 'Patel',
                email: 'aisha.patel@knights.ucf.edu',
                passwordHash: hashedPassword,
                ucfStudentId: 'UCF1004',
                major: 'Mechanical Engineering',
                isEmailVerified: true,
                pointsBalance: 1800
            },
            {
                firstName: 'Jordan',
                lastName: 'Williams',
                email: 'jordan.williams@knights.ucf.edu',
                passwordHash: hashedPassword,
                ucfStudentId: 'UCF1005',
                major: 'Finance',
                isEmailVerified: false,
                emailVerificationToken: 'abc123def456verifytoken',
                emailVerificationExpires: new Date('2026-03-15'),
                pointsBalance: 500
            },
            {
                firstName: 'Emily',
                lastName: 'Brooks',
                email: 'emily.brooks@knights.ucf.edu',
                passwordHash: hashedPassword,
                ucfStudentId: 'UCF1006',
                major: 'Psychology',
                isEmailVerified: true,
                pointsBalance: 3300
            }
        ];

        const seeded = await User.insertMany(users);
        console.log(`\n${seeded.length} users seeded successfully!\n`);

        console.log('Seeded users:');
        seeded.forEach(u => {
            const verified = u.isEmailVerified ? '✅' : '❌';
            console.log(`  ${verified} ${u.firstName} ${u.lastName} | ${u.email} | ${u.pointsBalance} pts`);
        });

        console.log('\nTest password for all users: Test1234!\n');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error.message);
        process.exit(1);
    }
};

seedDatabase();