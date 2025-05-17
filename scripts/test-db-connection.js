const mysql = require('mysql2/promise');
const config = require('../config/database');

async function testConnection() {
    console.log('Testing database connection...');
    console.log('Configuration:', {
        host: config.database.host,
        port: config.database.port,
        user: config.database.user,
        database: config.database.database
    });

    let connection;
    try {
        connection = await mysql.createConnection({
            host: config.database.host,
            port: config.database.port,
            user: config.database.user,
            password: config.database.password,
            database: config.database.database,
            connectTimeout: 10000 // 10 seconds timeout
        });

        console.log('Successfully connected to the database!');
        
        // Test a simple query
        const [rows] = await connection.query('SELECT 1');
        console.log('Query test successful:', rows);

    } catch (error) {
        console.error('Database connection error:', {
            code: error.code,
            errno: error.errno,
            sqlState: error.sqlState,
            sqlMessage: error.sqlMessage
        });
        
        if (error.code === 'ETIMEDOUT') {
            console.error('\nConnection timed out. Please check:');
            console.error('1. If the database server is running');
            console.error('2. If the port is correct and not blocked by firewall');
            console.error('3. If the host is reachable (try pinging it)');
        }
    } finally {
        if (connection) {
            await connection.end();
            console.log('Connection closed');
        }
    }
}

testConnection(); 