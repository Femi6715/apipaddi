const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const config = require('./config/database');

// Create MySQL connection pool
const pool = mysql.createPool(config.database);

console.log('simple-routes.js loaded');

// Simple account update without any authentication or validation
router.post('/update-account', async (req, res) => {
  try {
    console.log('Simple account update called with:', req.body);
    
    const { user_id, main_balance, bonus } = req.body;
    
    if (!user_id || main_balance === undefined || bonus === undefined) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Missing required fields: user_id, main_balance, bonus' 
      });
    }
    
    const connection = await pool.getConnection();
    
    // Update user balance directly without any checks
    await connection.query(
      'UPDATE users SET main_balance = ?, bonus = ? WHERE id = ?',
      [main_balance, bonus, user_id]
    );
    
    // Get updated user data
    const [updatedRows] = await connection.query(
      'SELECT id, main_balance, bonus FROM users WHERE id = ?',
      [user_id]
    );
    
    connection.release();
    
    if (updatedRows.length === 0) {
      return res.status(404).json({ success: false, msg: 'User not found after update' });
    }
    
    console.log('Account updated successfully. New balance:', {
      main_balance: updatedRows[0].main_balance,
      bonus: updatedRows[0].bonus
    });
    
    res.json({
      success: true,
      msg: 'Account balance updated successfully',
      user: {
        id: updatedRows[0].id,
        main_balance: updatedRows[0].main_balance,
        bonus: updatedRows[0].bonus
      }
    });
  } catch (error) {
    console.error('Simple account update error:', error);
    res.status(500).json({ success: false, msg: 'Error updating account balance' });
  }
});

// Get user profile without authentication
router.get('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    console.log('Simple get user profile called for ID:', userId);
    
    const connection = await pool.getConnection();
    
    // Get user data
    const [rows] = await connection.query(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    
    connection.release();
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }
    
    // Remove sensitive data
    const user = rows[0];
    const { password, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Simple get user profile error:', error);
    res.status(500).json({ success: false, msg: 'Error fetching user profile' });
  }
});

// Direct endpoint to get transactions for a user (no auth required)
router.post('/transactions', async (req, res) => {
  try {
    const { user_id } = req.body;
    console.log('Simple routes - transactions endpoint called for user_id:', user_id);
    
    if (!user_id) {
      return res.status(400).json({ 
        success: false, 
        msg: 'User ID is required' 
      });
    }
    
    const connection = await pool.getConnection();
    
    // Get transactions for the specified user
    const [rows] = await connection.query(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY time_stamp DESC',
      [user_id]
    );
    
    connection.release();
    
    console.log(`Found ${rows.length} transactions for user ${user_id}`);
    
    res.json({ 
      success: true, 
      transactions: rows
    });
  } catch (error) {
    console.error('Transactions endpoint error:', error);
    res.status(500).json({ success: false, msg: 'Error fetching transactions' });
  }
});

// Direct endpoint to get tickets for a user (no auth required)
router.post('/tickets', async (req, res) => {
  console.log('POST /api/simple/tickets called');
  try {
    const { user_id } = req.body;
    if (!user_id) {
      return res.status(400).json({ success: false, msg: 'User ID is required' });
    }
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      `SELECT 
        id, ticket_id, user_id, game_id, mobile_no, 
        stake_amt, potential_winning, time_stamp,
        draw_time, draw_date, ticket_status,
        created_at, updated_at
      FROM tickets 
      WHERE user_id = ? 
      ORDER BY time_stamp DESC`,
      [user_id]
    );
    connection.release();
    res.json({ success: true, tickets: rows });
  } catch (error) {
    console.error('Tickets endpoint error:', error);
    res.status(500).json({ success: false, msg: 'Error fetching tickets' });
  }
});

// Add a GET handler for /tickets to support both GET and POST requests
router.get('/tickets', async (req, res) => {
  console.log('GET /api/simple/tickets called');
  res.status(405).json({ success: false, msg: 'Use POST with user_id in the body' });
});

// Direct endpoint to record a transaction (no auth required)
router.post('/transaction', async (req, res) => {
  try {
    console.log('Simple routes - transaction recording endpoint called with:', req.body);
    
    const { user_id, amount_involved, transaction_type, acct_balance, time_stamp, trans_date } = req.body;
    
    if (!user_id || !transaction_type || acct_balance === undefined) {
      return res.status(400).json({
        success: false,
        msg: 'Missing required fields for transaction'
      });
    }
    
    // Validate transaction_type to ensure it's one of the allowed values
    const validTransactionTypes = ['deposit', 'withdrawal', 'winning', 'ticket_purchase'];
    if (!validTransactionTypes.includes(transaction_type)) {
      console.error(`Invalid transaction_type: ${transaction_type}. Must be one of: ${validTransactionTypes.join(', ')}`);
      return res.status(400).json({
        success: false,
        msg: `Invalid transaction type. Must be one of: ${validTransactionTypes.join(', ')}`
      });
    }
    
    const connection = await pool.getConnection();
    
    // Create the query and parameters - use only the essential fields and rely on database defaults
    const query = 'INSERT INTO transactions (user_id, transaction_type, amount_involved, acct_balance, time_stamp, trans_date) VALUES (?, ?, ?, ?, ?, ?)';
    const params = [
      user_id,
      transaction_type,
      amount_involved,
      acct_balance,
      time_stamp || Date.now(),
      trans_date
    ];
    
    // Log the actual query and parameters for debugging
    console.log('Executing query:', query);
    console.log('With parameters:', params);
    
    // Insert transaction
    const [result] = await connection.query(query, params);
    
    connection.release();
    
    console.log('Transaction recorded successfully:', {
      id: result.insertId,
      user_id,
      transaction_type,
      amount_involved
    });
    
    res.json({
      success: true,
      msg: 'Transaction recorded successfully',
      transaction_id: result.insertId
    });
  } catch (error) {
    console.error('Transaction recording error:', error);
    res.status(500).json({ success: false, msg: 'Error recording transaction', error: error.message });
  }
});

// Direct endpoint to get all tickets with optional filtering by stake_amt (no auth required)
router.get('/all-tickets', async (req, res) => {
  try {
    console.log('Simple routes - all-tickets endpoint called with query params:', req.query);
    
    const connection = await pool.getConnection();
    let query = `
      SELECT 
        id, ticket_id, user_id, game_id, mobile_no, 
        stake_amt, potential_winning, time_stamp,
        draw_time, draw_date, ticket_status,
        created_at, updated_at
      FROM tickets
    `;
    const params = [];
    
    // Add optional filter by stake_amt if provided
    if (req.query.stake_amt) {
      query += ' WHERE stake_amt = ?';
      params.push(req.query.stake_amt);
    }
    
    // Order by most recent first
    query += ' ORDER BY time_stamp DESC';
    
    // Get all tickets with optional filtering
    const [rows] = await connection.query(query, params);
    
    connection.release();
    
    console.log(`Found ${rows.length} tickets${req.query.stake_amt ? ` with stake_amt ${req.query.stake_amt}` : ''}`);
    
    res.json({ 
      success: true, 
      tickets: rows
    });
  } catch (error) {
    console.error('All tickets endpoint error:', error);
    res.status(500).json({ success: false, msg: 'Error fetching tickets' });
  }
});

module.exports = router; 