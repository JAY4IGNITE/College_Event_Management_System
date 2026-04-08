const mongoose = require('mongoose');
require('dotenv').config();

console.log('URI:', process.env.MONGO_URI ? 'Exists' : 'Missing');

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Connected');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Connection failed:', err.message);
        process.exit(1);
    });
