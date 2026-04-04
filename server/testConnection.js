const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    family: 4
}).then(() => {
    console.log('CONNECTED!');
    process.exit(0);
}).catch(err => {
    console.log('Full error:', err);
    process.exit(1);
});