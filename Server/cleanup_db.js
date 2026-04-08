const mongoose = require('mongoose');
require('dotenv').config();

const cleanDatabases = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/Team22Events');
        console.log('✅ Connected to MongoDB');

        const dbs = await mongoose.connection.db.admin().listDatabases();

        const keepDbs = ['admin', 'config', 'local', 'Team22Events'];

        for (const db of dbs.databases) {
            if (!keepDbs.includes(db.name)) {
                console.log(`🗑️  Dropping database: ${db.name}`);
                const dbToDrop = mongoose.connection.useDb(db.name);
                await dbToDrop.dropDatabase();
                console.log(`✅ Dropped ${db.name}`);
            } else {
                console.log(`🛡️  Keeping database: ${db.name}`);
            }
        }

        console.log('Cleanup complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error during cleanup:', err);
        process.exit(1);
    }
};

cleanDatabases();
