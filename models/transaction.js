const mongoose = require('mongoose');
const config = require('../config/database');

const TransactionSchema = mongoose.Schema({

    transaction_type: {
        type: String,
        required: true,
    },
    amount_involved: {
        type: Number,
        required: true
    },
    user_id: {
        type: String,
        required: true
    },
    acct_balance: {
        type: Number,
        required: true
    },
    time_stamp: {
        type: Date,
        required: true
    },
    trans_date: {
        type: String,
        required: true
    }
});

const Transactions = module.exports = mongoose.model('Transactions', TransactionSchema);

module.exports.addNewTransaction = function(newTransaction, callback) {
    newTransaction.save(callback);
}

module.exports.getTransactionByUserId = function(user_id, callback){
    const query = {user_id: user_id}
    Transactions.find(query, callback);
}

module.exports.checkUserTransaction = function(user_id, callback){
    const query = {user_id: user_id}
    Transactions.findOne(query, callback);
}

module.exports.checkTransaction = function(time_stamp, callback){
    const query = {time_stamp: time_stamp}
    Transactions.find(query, callback);
}

module.exports.totalTransactions = function(transaction_type, callback) {
    const query = {transaction_type: transaction_type}
    Transactions.find(query, callback);
}

module.exports.transactionFetcher = function(transaction_type, trans_date, callback) {
    const query = {
        transaction_type: transaction_type,
        trans_date: trans_date
    }
    Transactions.find(query, callback);
}

