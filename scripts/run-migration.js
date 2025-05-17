const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config/database');

async function runMigration() {
    let connection;
    try {
        // Create connection
        connection = await mysql.createConnection({
            host: config.database.host,
            user: config.database.user,
            password: config.database.password,
            database: config.database.database,
            port: config.database.port,
            multipleStatements: true // Allow multiple statements
        });

        console.log('Connected to MySQL database');

        // Read migration file
        const migrationPath = path.join(__dirname, '../migrations/create_users_table.sql');
        const migrationSQL = await fs.readFile(migrationPath, 'utf8');

        // Execute migration
        await connection.query(migrationSQL);
        console.log('Migration completed successfully');

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Database connection closed');
        }
    }
}

runMigration(); 