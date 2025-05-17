const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const config = require('./config/database');

// Create MySQL connection pool
const pool = mysql.createPool(config.database);

console.log('simple-routes.js loaded');

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

module.exports = router; 