const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const config = require('../config/database');

// Create MySQL connection pool with improved settings
const pool = mysql.createPool({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database,
    port: config.database.port,
    waitForConnections: config.database.pool.waitForConnections,
    connectionLimit: config.database.pool.connectionLimit,
    queueLimit: config.database.pool.queueLimit,
    connectTimeout: config.database.connectTimeout,
    acquireTimeout: config.database.acquireTimeout,
    timeout: config.database.timeout,
    enableKeepAlive: config.database.enableKeepAlive,
    keepAliveInitialDelay: config.database.keepAliveInitialDelay
});

// Convert pool to use promises
const promisePool = pool.promise();

const User = {
    getUserById: async function(id) {
        try {
            const [rows] = await promisePool.query('SELECT * FROM users WHERE id = ?', [id]);
            return rows[0];
        } catch (err) {
            throw err;
        }
    },

    getUserByUsername: async function(username) {
        try {
            const [rows] = await promisePool.query('SELECT * FROM users WHERE username = ?', [username]);
            return rows[0];
        } catch (err) {
            throw err;
        }
    },

    getUserByMobileNo: async function(mobile_no) {
        try {
            const [rows] = await promisePool.query('SELECT * FROM users WHERE mobile_no = ?', [mobile_no]);
            return rows[0];
        } catch (err) {
            throw err;
        }
    },

    addUser: async function(newUser) {
        try {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(newUser.password, salt);
            newUser.password = hash;

            const [result] = await promisePool.query(
                'INSERT INTO users (surname, firstname, gender, dob, state, email, mobile_no, username, password, main_balance, bonus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    newUser.surname,
                    newUser.firstname,
                    newUser.gender,
                    newUser.dob,
                    newUser.state,
                    newUser.email,
                    newUser.mobile_no,
                    newUser.username,
                    newUser.password,
                    newUser.main_balance,
                    newUser.bonus
                ]
            );
            return result;
        } catch (err) {
            throw err;
        }
    },

    comparePassword: async function(candidatePassword, hash) {
        try {
            return await bcrypt.compare(candidatePassword, hash);
        } catch (err) {
            throw err;
        }
    },

    updateUserProfile: async function(updatedData) {
        try {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(updatedData.password, salt);

            const [result] = await promisePool.query(
                'UPDATE users SET state = ?, email = ?, mobile_no = ?, password = ? WHERE id = ?',
                [updatedData.state, updatedData.email, updatedData.mobile_no, hash, updatedData.user_id]
            );
            return result;
        } catch (err) {
            throw err;
        }
    },

    updateUserAcct: async function(balanceInfo) {
        try {
            const [result] = await promisePool.query(
                'UPDATE users SET main_balance = ?, bonus = ? WHERE id = ?',
                [balanceInfo.main_balance, balanceInfo.bonus, balanceInfo.user_id]
            );
            return result;
        } catch (err) {
            throw err;
        }
    },

    updateUserBalance: async function(user_id, new_balance, new_bonus) {
        try {
            const [result] = await promisePool.query(
                'UPDATE users SET main_balance = ?, bonus = ? WHERE id = ?',
                [new_balance, new_bonus, user_id]
            );
            return result;
        } catch (err) {
            throw err;
        }
    },

    updateUserPwd: async function(user_email, new_pwd) {
        try {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(new_pwd, salt);

            const [result] = await promisePool.query(
                'UPDATE users SET password = ? WHERE email = ?',
                [hash, user_email]
            );
            return result;
        } catch (err) {
            throw err;
        }
    },

    updateUserPwdWithSms: async function(mobile_no, new_pwd) {
        try {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(new_pwd, salt);

            const [result] = await promisePool.query(
                'UPDATE users SET password = ? WHERE mobile_no = ?',
                [hash, mobile_no]
            );
            return result;
        } catch (err) {
            throw err;
        }
    },

    payWinner: async function(user_id, new_balance) {
        try {
            const [result] = await promisePool.query(
                'UPDATE users SET main_balance = ? WHERE id = ?',
                [new_balance, user_id]
            );
            return result;
        } catch (err) {
            throw err;
        }
    }
};

module.exports = User;
