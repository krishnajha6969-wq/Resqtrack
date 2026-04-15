require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
    console.log('Connecting to database...');
    // We explicitly pass the connection string from process.env to ensure it connects to Neon
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('Dropping existing tables to prevent conflicts...');
        await pool.query(`
            DROP TABLE IF EXISTS road_blockages CASCADE;
            DROP TABLE IF EXISTS missions CASCADE;
            DROP TABLE IF EXISTS congestion CASCADE;
            DROP TABLE IF EXISTS incidents CASCADE;
            DROP TABLE IF EXISTS teams CASCADE;
            DROP TABLE IF EXISTS users CASCADE;
        `);

        // Read SQL files
        const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
        const seedPath = path.join(__dirname, '..', 'database', 'seed.sql');
        
        console.log('Reading schema.sql...');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('Reading seed.sql...');
        const seedSql = fs.readFileSync(seedPath, 'utf8');

        console.log('Executing schema...');
        await pool.query(schemaSql);
        
        console.log('Executing seed data...');
        await pool.query(seedSql);

        console.log('✅ Database successfully initialized with tables and seed data!');
    } catch (err) {
        console.error('❌ Error initializing database:', err.message);
        if (err.position) {
            console.error(`Error near character ${err.position}`);
        }
    } finally {
        await pool.end();
    }
}

initializeDatabase();
