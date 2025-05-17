const mongoose = require('mongoose');
const config = require('../config/database');

// game schema

const GameSchema = mongoose.Schema({
  mobile_no: {
    type: Number,
    required: true,
    minlength: 11,
    maxlength: 11
  },
  game_id: {
    type: String,
    required: true
  },
  user_id: {
    type: String,
    required: true
  },
  ticket_id: {
    type: String,
    required: true
  },
  time_stamp: {
    type: Date,
    required: true
  },
  stake_amt: {
    type: Number,
    required: true
  },
  draw_time: {
    type: String,
    required: true
  },
  draw_date: {
    type: String,
    required: true
  },
  potential_winning: {
    type: Number,
    required: true
  },
  ticket_status: {
    type: String,
    required: true
  },
  jackpot: {
    type: String
  }
});

const Game = (module.exports = mongoose.model('Game', GameSchema));

module.exports.getGameByUserId = function(user_id, callback) {
  const query = { user_id: user_id };
  Game.find(query, callback);
};

module.exports.getLast5GamesByUserId = function(user_id, callback) {
  const query = { user_id: user_id };
  Game.find(query, callback)
    .sort({ _id: -1 })
    .limit(5);
};

module.exports.addTicket = function(newGame, callback) {
  newGame.save(callback);
};

module.exports.todayWinners = function(draw_date, ticket_status, callback) {
  const query = {
    draw_date: draw_date,
    ticket_status: ticket_status
  };
  Game.find(query, callback);
};

module.exports.pastWinningTickets = function(
  ticket_status,
  stake_amt,
  callback
) {
  const query = { ticket_status: ticket_status, stake_amt: stake_amt };
  Game.find(query, callback);
};

module.exports.selectBystake = function(selectedDate, stake_amt, callback) {
  const query = { draw_date: selectedDate, stake_amt: stake_amt };
  Game.countDocuments(query, callback);
};

module.exports.selectBy = function(selectedDate, callback) {
  const query = { draw_date: selectedDate };
  Game.countDocuments(query, callback);
};

module.exports.totalStakes = function(callback) {
  Game.find(callback);
};

module.exports.totalStakesByDate = function(selectedDate, callback) {
  const query = { draw_date: selectedDate };
  Game.find(query, callback);
};
module.exports.getOneUserTickets = function(user_id, callback) {
  const query = { user_id };
  Game.countDocuments(query, callback);
};
module.exports.getOneUserTicketsWon = function(
  user_id,
  ticket_status,
  callback
) {
  const query = { user_id, ticket_status };
  Game.countDocuments(query, callback);
};
