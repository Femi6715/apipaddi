const express = require('express');
const router = express.Router();
const Game = require('../models/game');
require('../config/passport');


router.post('/newticket', (req, res) => {
    let newGame = new Game({
        mobile_no : req.body.mobile_no,
        game_id : req.body.game_id,
        user_id : req.body.user_id,
        ticket_id : req.body.ticket_id,
        time_stamp : req.body.time_stamp,
        stake_amt : req.body.stake_amt,
        draw_time : req.body.draw_time,
        draw_date : req.body.draw_date,
        potential_winning : req.body.potential_winning,
        ticket_status : req.body.ticket_status
    })
    Game.addTicket(newGame, (err) => {
        if (err) {
            res.json({ sucess: false, msg: 'Sorry, your bet could not be placed.' });
        } else {
            res.json({ success: true, 
                msg :`Your bet has been placed successfully! Your Ticket Number
                    is ${newGame.ticket_id}. Check your dashboard to view your ticket.
                    Play multiple times to increase your chances!`
             });
        }
        console.log(err);
    })
});

router.post('/alltickets', (req, res) => {
    let searchKey = req.body.id;
    Game.getGameByUserId(searchKey, (err, my_tickets) => {
        if(err) {
            res.json({success: false, msg: 'Could not fetch your tickets at this time.'});
        } else {
            res.send(my_tickets);
        }
    });
});

router.post('/last5tickets', (req, res) => {
    let searchKey = req.body.id;
    Game.getLast5GamesByUserId(searchKey, (err, my_tickets) => {
        if(err) {
            res.json({success: false, msg: 'Could not fetch your tickets at this time.'});
        } else {
            res.send(my_tickets);
        }
    });
});

router.get('/winning-tickets-signal/:draw_date/:ticket_status', (req, res) => {
    
    let draw_date = req.params.draw_date;
    let ticket_status = req.params.ticket_status;

        Game.todayWinners(draw_date, ticket_status, (err, winning_tickets) => {
    if(err) {
            res.json({success: false, msg: 'Could not fetch winners at this time.'});
            console.log(err);
        } else {
            if (winning_tickets === null) {
                console.log('no ticket to select');
                res.json('Today\'s tickets are too few to shuffle!');
            } else {
                res.json(winning_tickets);
            }
        }
    });
});


router.get('/pastWinningTickets/:ticket_status/:stake_amt', (req, res) => {
    let ticket_status = req.params.ticket_status;
    let stake_amt = req.params.stake_amt;
    Game.pastWinningTickets(ticket_status, stake_amt, (err, result) => {
        if(err) {
            res.json({success: false});
        } else {
            res.json(result);
        }
    })
});

currentDay = new Date(new Date().getTime());
year = currentDay.getFullYear();


selector = (selectedDate, stake_amt, cb) => {
    Game.selectBystake(selectedDate, stake_amt, (err, result) => {
        if(err) {
            return cb({success: false});
        } else {
            return cb(result);
        }
    })
}

router.post('/stats', (req, res) => {
    day = req.body.day;
    month = req.body.month;
    let selectedDate = `${day}-${month}-${year}`;
    Game.selectBy(selectedDate, (err, result) => {
        if(err) {
            res.json({success: false});
        } else {
            res.json(result);
        }
    });
});

router.post('/statstoday', (req, res) => {
    selectedDate = req.body.today;
    Game.selectBy(selectedDate, (err, result) => {
        if(err) {
            res.json({success: false});
        } else {
            res.json(result);
        }
    })
});

router.post('/statsBy25k', (req, res) => {
    day = req.body.day;
    month = req.body.month;
    let selectedDate = `${day}-${month}-${year}`;
    let stake_amt = '25';
    selector(selectedDate, stake_amt, (cb) => {
        res.json(cb);
    });
});



router.post('/statstoday25k', (req, res) => {
    selector(req.body.today, '25', (cb) => {
        res.json(cb);
    });
});


router.post('/statsBy50k', (req, res) => {
    day = req.body.day;
    month = req.body.month;
    let selectedDate = `${day}-${month}-${year}`;
    let stake_amt = '50';
    selector(selectedDate, stake_amt, (cb) => {
        res.json(cb);
    });
});

router.post('/statstoday50k', (req, res) => {
    selector(req.body.today, '50', (cb) => {
        res.json(cb);
    });
});

router.post('/statsBy100k', (req, res) => {
    day = req.body.day;
    month = req.body.month;
    let selectedDate = `${day}-${month}-${year}`;
    let stake_amt = '100';
    selector(selectedDate, stake_amt, (cb) => {
        res.json(cb);
    });
});

router.post('/statstoday100k', (req, res) => {
    selector(req.body.today, '100', (cb) => {
        res.json(cb);
    });
});

router.post('/totalstakes', (req, res) => {
    Game.totalStakes((err, result) => {
        if(err) {
            res.json({success: false});
        } else {
            sum = 0;
             for (let i = 0; i < result.length; i++) {
                sum += result[i].stake_amt;
              }
            res.json(sum);
        }
    });
});

router.post('/totalstakesToday', (req, res) => {
    selectedDate = req.body.today
    Game.totalStakesByDate(selectedDate, (err, result) => {
        if(err) {
            res.json({success: false});
        } else {
            sum = 0;
             for (let i = 0; i < result.length; i++) {
                sum += result[i].stake_amt;
              }
            res.json(sum);
        }
    });
});

router.post('/totalstakesByDate', (req, res) => {
    day = req.body.day;
    month = req.body.month;
    let selectedDate = `${day}-${month}-${year}`;
    Game.totalStakesByDate(selectedDate, (err, result) => {
        if(err) {
            res.json({success: false});
        } else {
            sum = 0;
             for (let i = 0; i < result.length; i++) {
                sum += result[i].stake_amt;
              }
            res.json(sum);
        }
    });
});

router.post('/getOneUserTickets', (req, res) => {
    user_id = req.body.user_id;
    Game.getOneUserTickets(user_id, (err, UserTickets) => {
        if (err) {
            console.log('Error fetching users');
        } else {
            res.json(UserTickets);
            // console.log(UserDetails);
        }
    });
});

router.post('/getOneUserTicketsWon', (req, res) => {
    user_id = req.body.user_id;
    ticket_status = 'won';
    Game.getOneUserTicketsWon(user_id, ticket_status, (err, UserTicketsWon) => {
        if (err) {
            console.log('Error fetching users');
        } else {
            res.json(UserTicketsWon);
            // console.log(UserTicketsWon);
        }
    });
});

module.exports = router;