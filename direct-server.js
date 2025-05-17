const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const config = require('./config/database');

// Create MySQL connection pool
const pool = mysql.createPool(config.database);

// Direct tickets endpoint
router.post('/tickets', async (req, res) => {
  try {
    const { user_id } = req.body;
    console.log('Tickets endpoint called with user_id:', user_id);

    if (!user_id) {
      return res.status(400).json({
        success: false,
        msg: 'User ID is required'
      });
    }

    const connection = await pool.getConnection();

    // Get tickets for the specified user with all relevant fields
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

    console.log(`Found ${rows.length} tickets for user ${user_id}`);

    res.json({
      success: true,
      tickets: rows
    });
  } catch (error) {
    console.error('Tickets endpoint error:', error);
    res.status(500).json({ success: false, msg: 'Error fetching tickets' });
  }
});

module.exports = router; 