const express = require('express');
const router = express.Router();
const transferRecipient = require('../models/transfer_recipient');
const User = require('../models/user');
const axios = require('axios');

router.post('/cashOut', (req, res) => {
  axios({
    method: 'post',
    url: 'https://api.paystack.co/transfer',
    headers: {
      Authorization: 'Bearer sk_live_69690aa61315d92b683ad7afe157db049c3e54c3',
      'Content-Type': 'application/json'
    },
    data: {
      source: 'balance',
      reason: 'I won',
      amount: req.body.amount,
      recipient: req.body.recipient
    }
  })
    .then(response => {
      console.log('withdraw money', response);
      if (response.status) {
        //  console.log(response.data);
        newAcctBalance = {
          user_id: req.body.user_id,
          main_balance: req.body.new_balance,
          bonus: req.body.bonus
        };
        console.log(newAcctBalance);
        User.updateUserAcct(newAcctBalance, (err, resp) => {
          if (err) throw err;
          if (res) res.send({ success: true, msg: 'Withdrawal successful' });
        });
      }
    })
    .catch(error => {
      console.log(error);
      res.send({
        success: false,
        msg: 'Failed! something went wrong in cashout',
        data: error
      });
    });
});

router.post('/newRecipient', (req, res) => {
  axios({
    method: 'post',
    url: 'https://api.paystack.co/transferrecipient',
    headers: {
      Authorization: 'Bearer sk_test_d14751ac8c35c5fc5ed930bdd1494954a2276bf7',
      'Content-Type': 'application/json'
    },
    data: {
      type: 'nuban',
      name: req.body.acct_name,
      description: 'Simple lotto Customer',
      account_number: req.body.acct_no,
      bank_code: req.body.bank_code,
      currency: 'NGN',
      metadata: {
        job: 'Gambling'
      }
    }
  })
    .then(response => {
      console.log(response);

      if (response.status) {
        let newRecipient = new transferRecipient({
          user_id: req.body.user_id,
          acct_name: req.body.acct_name,
          acct_num: req.body.acct_no,
          bank_code: req.body.bank_code,
          recipient_code: response.data.data.recipient_code
        });
        //    console.log(newRecipient.user_id);
        transferRecipient.findRecipientByUserId(
          newRecipient.user_id,
          (error, count) => {
            if (error) throw error;
            if (count > 0) {
              transferRecipient.updateRecipient(newRecipient, response => {
                if (response) {
                  res.json({
                    success: true,
                    msg:
                      'Your withdrawal account has been updated and verified!'
                  });
                } else {
                  res.json({
                    sucess: false,
                    msg: "Looks like we've got a problem updating yuor account."
                  });
                  console.log(response);
                }
              });
            } else {
              transferRecipient.addNewRecipient(newRecipient, err => {
                if (err) {
                  res.json({
                    sucess: false,
                    msg: 'Sorry, we have issues verifying your account details.'
                  });
                  console.log(err);
                } else {
                  res.json({
                    success: true,
                    msg: 'Your withdrawal account has been verified!'
                  });
                }
              });
            }
          }
        );
        //   console.log(response.data.data.recipient_code);
        //   console.log(newRecipient);
      }
      // console.log(response.data);
    })
    .catch(error => {
      console.log(error);
    });
});

router.post('/transferRecipient', (req, res) => {
  let searchKey = req.body.id;
  transferRecipient.fetchRecipientByUserId(searchKey, (err, response) => {
    if (err) console.log(err);
    if (response) res.json(response);
  });
});

module.exports = router;
