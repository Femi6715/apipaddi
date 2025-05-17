const express = require('express');
const router = express.Router();
const Transactions = require('../models/transaction');


router.post('/allTransactions', (req, res) => {
    let searchKey = req.body.id;
    Transactions.getTransactionByUserId(searchKey, (err, my_transactions) => {
        if(err) {
            res.json({success: false, msg: 'Could not fetch your transactions at this time.'});
        } else {
            res.send(my_transactions);
        }
    });
});

router.post('/checkTransaction', (req, res) => {
    let searchKey = req.body.id;
    Transactions.checkUserTransaction(searchKey, (err, transactionStatus) => {
        if(transactionStatus == undefined){
           res.json({success: false ,msg: 'There has been no previous transaction on this acct'});
        } else {
            res.json({success: true ,msg: 'There has been a previous transaction on this acct'});
        }
        // console.log(transactionStatus);
    });
});

router.post('/newTransaction',(req, res) => {
    let newTransaction = new Transactions({
        transaction_type: req.body.transaction_type,
        amount_involved: req.body.amount_involved,
        user_id: req.body.user_id,
        acct_balance: req.body.acct_balance,
        time_stamp: req.body.time_stamp,
        trans_date: req.body.trans_date
    });
    Transactions.addNewTransaction(newTransaction, (resp) => {

    });
});

router.post('/allDeposits', (req, res) => {
    Transactions.totalTransactions('deposit', (err, result) => {
        if(err) {
            res.json({success: false});
        } else {
            sum = 0;
             for (let i = 0; i < result.length; i++) {
                sum += result[i].amount_involved;
              }
            res.json(sum);
        }
    });
});

transactionSelector = (trans_type, selectedDate, callback) => {
    Transactions.transactionFetcher(trans_type,selectedDate, (err, result) => {
        if(err) {
            return callback({success: false});
        } else {
           sum = 0;
           for (let i = 0; i < result.length; i++) {
            sum += result[i].amount_involved;
          }
          return callback(JSON.stringify(sum));
        }
    });
}

router.post('/todaysdeposits', (req, res) => {
    let selectedDate = req.body.today;
    transactionSelector('deposit', selectedDate, (callback) => {
        res.json(callback);
    });
});

router.post('/todaysWithdrawals', (req, res) => {
    let selectedDate = req.body.today;
    transactionSelector('withdrawal', selectedDate, (callback) => {
        res.json(callback);
    });
});


currentDay = new Date(new Date().getTime());
year = currentDay.getFullYear();

router.post('/depositByDate', (req, res) => {
    day = req.body.day;
    month = req.body.month;
    let selectedDate = `${day}-${month}-${year}`;
    transactionSelector('deposit', selectedDate, (callback) => {
        res.json(callback);
    });
});

router.post('/withdrawalsByDate', (req, res) => {
    day = req.body.day;
    month = req.body.month;
    let selectedDate = `${day}-${month}-${year}`;
    transactionSelector('withdrawal', selectedDate, (callback) => {
        res.json(callback);
    });
});

module.exports = router;