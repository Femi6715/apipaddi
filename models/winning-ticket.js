const mongoose = require('mongoose');

const WinningGameSchema = mongoose.Schema({
    game_id:{
        type: String,
        required: true
    },
    user_id:{
        type: String,
        required: true
    },
    draw_date: {
        type: String,
        required: true
    },
    amount_won:{
        type: Number,
        required: true
    },
    ticket_status:{
        type: String,
        required: true
    }
});

const WinningGames = module.exports = mongoose.model('WinningGames', WinningGameSchema);

module.exports.addWinningTicket = function(newWinningGame, callback){
    newWinningGame.save(callback);
}

module.exports.pastWinningTickets = function(callback){
    WinningGames.find(callback);
}