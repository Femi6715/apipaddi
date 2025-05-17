const express = require('express');
const router = express.Router();
const WinningGames = require('../models/winning-ticket');

require('../config/passport');

router.post('/newWinningTicket', (req, res) => {
    let newWinningGame = new WinningGames({
        game_id : req.body.game_id,
        user_id : req.body.user_id,
        draw_date : req.body.draw_date,
        amount_won : req.body.amount_won,
        ticket_status : req.body.ticket_status
    })
    WinningGames.addWinningTicket(newWinningGame, (err) => {
        if (err) {
            res.json({ sucess: false, msg: 'Sorry, could not pull aside new winning ticket.' });
            // console.log(err);
        } else {
            res.json({ success: true, msg: "Your ticket has been was Successfully moved as WON"});
        }
    })
});

router.get('/pastWinningTickets', (req, res) => {
    WinningGames.pastWinningTickets((err, result) => {
        if(err) {
            res.json({success: false});
        } else {
            res.json(result);
        }
    })
});


module.exports = router;