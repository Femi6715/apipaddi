const express = require('express');
const router = express.Router();
const Game = require('../models/game');
require('../config/passport');

router.get('/all', (req, res) => {
  console.log(req);
  Game.find((err, result) => {
    if (err) {
      console.log('Error fetching users');
      res.json({ success: false, message: 'error findinig all tickets' });
    } else {
      res.json({
        success: false,
        data: result
      });
    }
  });
});

router.get('/today/:date/:month/:year', (req, res) => {
  const date = req.params.date;
  const month = req.params.month;
  const year = req.params.year;

  const todaysDate = `${date}-${month}-${year}`;

  Game.find({ draw_date: todaysDate }, (err, result) => {
    if (err) {
      res.json({ success: false, message: 'error findinig all tickets' });
    } else {
      Game.countDocuments(
        { draw_date: todaysDate, ticket_status: 'won' },
        (err1, count) => {
          if (err1) {
            res.json({ success: false, message: 'error findinig all tickets' });
          } else {
            res.json({
              success: true,
              data: result,
              count: count
            });
          }
        }
      );
    }
  });
});

router.get('/month/:month', (req, res) => {
  const month = req.params.month;

  Game.find({ draw_date: { $regex: `${month}-2019` } }, (err, result) => {
    if (err) {
      res.json({ success: false, message: 'error findinig all tickets' });
    } else {
      Game.countDocuments(
        { draw_date: { $regex: `${month}-2019` }, jackpot: 'won' },
        (err1, count) => {
          if (err1) {
            res.json({ success: false, message: 'error findinig all tickets' });
          } else {
            res.json({
              success: true,
              data: result,
              count: count
            });
          }
        }
      );
    }
  });
});

router.post('/updateTicket/:id', (req, res) => {
  const id = req.params.id;

  Game.findByIdAndUpdate(id, { ticket_status: 'won' }, (err, result) => {
    if (err) {
      res.json({ success: false, message: 'error findinig all tickets' });
    } else {
      res.json({
        success: false,
        data: result
      });
    }
  });
});

router.post('/updateJackpotTicket/:id', (req, res) => {
  const id = req.params.id;

  Game.findByIdAndUpdate(id, { jackpot: 'won' }, (err, result) => {
    if (err) {
      res.json({ success: false, message: 'error findinig all tickets' });
    } else {
      res.json({
        success: false,
        data: result
      });
    }
  });
});

module.exports = router;
