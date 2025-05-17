const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const User = require('../models/user');
const paystack = require('paystack')(
  'sk_live_69690aa61315d92b683ad7afe157db049c3e54c3'
);
const nodemailer = require('nodemailer');
const fetch = require('node-fetch');
const EmailTemplate = require('email-templates').EmailTemplate,
  path = require('path'),
  Promise = require('bluebird');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'mailgun',
  auth: {
    user: process.env.MAILGUN_USER || 'postmaster@simplelotto.ng',
    pass: process.env.MAILGUN_API_KEY || 'your_mailgun_api_key'
  },
  tls: {
    rejectUnauthorized: false
  }
});

sendMail = async cb => {
  return await transporter.sendMail(cb, function(res) {
    console.log(res);
  });
};

sendTemplate = (templateName, contexts) => {
  let template = new EmailTemplate(
    path.join(__dirname, 'templates', templateName)
  );
  return Promise.all(
    contexts.map(context => {
      return new Promise((resolve, reject) => {
        template.render(context, (err, result) => {
          if (err) reject(err);
          else
            resolve({
              email: result,
              context
            });
        });
      });
    })
  );
};

// Passport middleware
require('../config/passport');

//Register
router.post('/register', (req, res) => {
  let newUser = new User({
    surname: req.body.surname,
    firstname: req.body.firstname,
    gender: req.body.gender,
    dob: req.body.dob,
    state: req.body.state,
    email: req.body.email,
    mobile_no: req.body.mobile_no,
    username: req.body.username.replace(/ +/g, ''),
    password: req.body.password,
    main_balance: req.body.main_balance,
    bonus: req.body.bonus
  });
  user_mail_info = [
    {
      fisrtname: req.body.firstname,
      surname: req.body.surname
    }
  ];

  User.checkUsername(req.body.username, (err, checkUser) => {
    if (err) {
      console.log('There was an error matching username');
    }
    User.checkMobileNo(req.body.mobile_no, (err, checkMobile) => {
      if (err) {
        console.log('There was an error matching username');
      }
      if (checkUser < 1 && checkMobile < 1) {
        User.addUser(newUser, (err, user) => {
          if (err) {
            res.json({ success: false, msg: 'User Registration Failed' });
            // console.log(err);
          } else {
            res.json({ success: true, msg: 'User Registration Successfull' });

            if (req.body.email !== undefined) {
              sendTemplate('welcome', user_mail_info)
                .then(results => {
                  // console.log(JSON.stringify(results, null, 4));
                  return Promise.all(
                    results.map(result => {
                      sendMail({
                        from: 'welcome@simplelotto.ng',
                        to: newUser.email,
                        subject: 'Simplelotto Welcome Email',
                        html: result.email.html,
                        text: result.email.text
                      });
                    })
                  );
                })
                .then(() => {
                  console.log('Mail Sent!');
                });
            }
          }
        });
      } else {
        res.json({
          success: false,
          msg: 'Oops! looks like that username / mobile number is taken'
        });
      }
    });
  });
});

router.post('/reset', (req, res) => {
  email = req.body.username;
  new_pwd = req.body.new_pwd;
  pwdReset = [
    {
      user_new_pwd: new_pwd,
      user_email: email
    }
  ];
  User.updateUserPwd(email, new_pwd, callback => {
    if (callback) {
      res.json({
        success: true,
        msg: 'A new password has been sent to your e-mail address'
      });

      sendTemplate('resetPassword', pwdReset)
        .then(results => {
          // console.log(JSON.stringify(results, null, 4));
          return Promise.all(
            results.map(result => {
              sendMail({
                from: 'info@simplelotto.ng',
                to: result.context.user_email,
                subject: 'Simplelotto Password Reset',
                html: result.email.html,
                text: result.email.text
              });
            })
          );
        })
        .then(() => {
          console.log('Mail Sent!');
        });
    } else {
      res.json({ success: false, msg: 'Invalid e-mail address' });
    }
  });
});

router.post('/resetWithSms', (req, res) => {
  mobile_no = req.body.username;
  new_pwd = req.body.new_pwd;
  User.updateUserPwdWithSms(
    mobile_no,
    new_pwd,
    callback => {
      if (callback) {
        res.json({
          success: true,
          msg: 'A new password has been sent to your mobile number'
        });
        const url = `http://api.ebulksms.com:8080/sendsms?username=${process.env.SMS_USERNAME || 'management@simplelotto.ng'}&apikey=${process.env.SMS_API_KEY || '8521a8fc22fa85a013f63e724086420447b7b907'}&sender=${process.env.SMS_SENDER || 'Simplelotto'}&messagetext=Your%20new%20simplelotto%20password%20is%20${new_pwd}&flash=0&recipients=${mobile_no}`;
        const getData = async url => {
          try {
            const response = await fetch(url);
            const json = await response.json();
            //   console.log(json);
          } catch (error) {
            //    console.log(error);
          }
        };

        getData(url);
      } else {
        res.json({ success: false, msg: 'Invalid phone number' });
      }
    },
    error => {
      console.log(error);
    }
  );
});

//Autheticate - here is the user authentication and log in
router.post('/authenticate', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  console.log('testing', username, password);

  User.getUserByUsername(username, (err, user) => {
    if (err) throw err;

    if (!user) {
      return res.json({ success: false, msg: 'User not Found' });
    }

    //this can be done in ur model FYI
    User.comparePassword(password, user.password, (err, isMatch) => {
      if (err) throw err;

      if (isMatch) {
        const token = jwt.sign({ data: user }, config.secret, {
          expiresIn: 86400 // token expires in one day
        });

        res.json({
          success: true,
          token: 'jwt ' + token
        });
      } else {
        return res.json({ success: false, msg: 'Wrong password' });
      }
    });
  });
});

router.post('/authenticateWithPhoneNumber', (req, res) => {
  const mobile_no = req.body.username;
  const password = req.body.password;

  User.getUserByMobileNo(mobile_no, (err, user) => {
    if (err) throw err;

    if (!user) {
      return res.json({ success: false, msg: 'User not Found' });
    }

    //this can be done in ur model FYI
    User.comparePassword(password, user.password, (err, isMatch) => {
      if (err) throw err;

      if (isMatch) {
        const token = jwt.sign({ data: user }, config.secret, {
          expiresIn: 86400 // token expires in one day
        });

        res.json({
          success: true,
          token: 'jwt ' + token
        });
      } else {
        return res.json({ success: false, msg: 'Wrong password' });
      }
    });
  });
});

//User Profile
router.get(
  '/profile',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    // console.log('HEADER AUTHORIZATION: ' + req.headers.authorization);
    // console.log('USER INFO: ' + req.user);
    res.json({ user: req.user });
  }
);

//  UPDATE USER PROFILE
router.patch('/updateUserProfile', (req, res) => {
  const updatedData = {
    user_id: req.body.user_id,
    state: req.body.state,
    email: req.body.email,
    mobile_no: req.body.mobile_no,
    old_password: req.body.old_password,
    username: req.body.username,
    password: req.body.password
  };
  // console.log(updatedData);
  // console.log(req.body.username);
  User.getUserByUsername(req.body.username, (err, user) => {
    if (err) throw err;

    if (!user) {
      return res.json({ success: false, msg: 'User not Found' });
    }
    // console.log(user);
    //this can be done in ur model FYI
    User.comparePassword(
      req.body.old_password,
      user.password,
      (err, isMatch) => {
        if (err) throw err;

        if (isMatch) {
          User.updateUserProfile(updatedData, response => {
            if (!response) {
              res.json({
                success: false,
                msg: 'Ooops! we seem to have issues updating your profile'
              });
            } else {
              res.json({
                success: true,
                msg:
                  'Success! Your profile has been updated. Remember to use your new password on your next log in.'
              });
            }
          });
        } else {
          return res.json({ success: false, msg: 'Wrong password' });
        }
      }
    );
  });
});

router.patch('/reset', (req, res) => {
  let resetData = {
    new_pwd: req.body.new_pwd,
    username: req.body.username
  };
  User.updateUserPwd(resetData.username, resetData.new_pwd, cb => {
    if (!cb) {
      res.json({
        success: false,
        msg: 'Ooops! we couldn\t reset your password!'
      });
    } else {
      // send the email here.
      res.json({
        success: true,
        msg: 'Check E-mail address for your new password'
      });
    }
  });
});

router.patch('/resetWithSms', (req, res) => {
  let resetData = {
    new_pwd: req.body.new_pwd,
    username: req.body.username
  };
  User.updateUserPwdWithSms(resetData.username, resetData.new_pwd, cb => {
    if (!cb) {
      res.json({
        success: false,
        msg: 'Ooops! we couldn\t reset your password!'
      });
    } else {
      // send the sms here.
      res.json({
        success: true,
        msg: 'Your new password has been sent to your phone!'
      });
    }
  });
});

// update user balance

router.patch('/updateAcct', (req, res) => {
  let balanceInfo = {
    user_id: req.body.user_id,
    main_balance: req.body.main_balance,
    bonus: req.body.bonus
  };

  User.updateUserAcct(balanceInfo, callback => {
    if (!callback) {
      res.json({ success: false, msg: 'Could not update user balance' });
    } else {
      res.json({ success: true, msg: 'update done' });
    }
  });
});

router.post('/deposit/:reference', (req, res) => {
  let reference = req.params.reference;
  paystack.transaction.verify(reference, function(error, body) {
    if (error) {
      console.log(error);
      res.json({ success: false, msg: 'Deposit Failed, Something went wrong' });
    } else {
      depositAmount = req.body.depositAmount / 100;
      bonus = req.body.new_bonus / 100;
      user_id = req.body.user_id;
      new_balance = req.body.main_balance;
      new_bonus = req.body.bonus + bonus;

      User.updateUserBalance(user_id, new_balance, (err, response) => {
        if (err) {
          res.json({ success: false, msg: 'Deposit Failed, Please try later' });
        } else {
          res.json({
            success: true,
            msg: 'Successfull! Your account has been credited'
          });
        }
      });
    }
  });
});

router.post('/payWinner', (req, res) => {
  user_id = req.body.user_id;
  new_balance = req.body.new_balance;

  User.payWinner(user_id, new_balance, err => {
    if (err) {
      res.json({
        success: false,
        msg: 'Amount Won could not reflect, Please try later'
      });
    } else {
      res.json({
        success: true,
        msg: 'Successfull! Your account has been credited with your winnings'
      });
    }
  });
});

router.post('/allusers', (req, res) => {
  User.allUsers((err, allusers) => {
    if (err) {
      console.log('Error fetching users');
    } else {
      res.json(allusers);
    }
  });
});

router.post('/getAllusers', (req, res) => {
  User.getAllUsers((err, allUsersDetails) => {
    if (err) {
      console.log('Error fetching users');
    } else {
      res.json(allUsersDetails);
      // console.log(allUsersDetails);
    }
  });
});

router.post('/getOneUser', (req, res) => {
  user_id = req.body.user_id;
  User.getUserById(user_id, (err, UserDetails) => {
    if (err) {
      console.log('Error fetching users');
    } else {
      res.json(UserDetails);
      // console.log(UserDetails);
    }
  });
});

router.post('/creditUser', (req, res) => {
  user_id = req.body.user_id;
  credit_amt = req.body.credit_amt;
  User.CreditBonus(user_id, credit_amt, success => {
    if (success) {
      res.json({ msg: 'User has been credited!' });
    } else {
      res.json({ msg: 'Error: Unable to credit user!' });
      // console.log(UserDetails);
    }
  });
});

// USER CRUD
router.delete('/deleteUser/:id', (req, res) => {
  user_id = req.params.id;

  User.findByIdAndRemove(user_id, (err, success) => {
    console.log(user_id, success);

    if (err) return res.status(500).send(err);
    // We'll create a simple object to send back with a message and the id of the document that was removed
    // You can really do this however you want, though.
    const response = {
      message: 'Todo successfully deleted',
      id: user_id
    };
    return res.status(200).send(response);
    // if (success) {
    //   res.json({ msg: 'User has been Deleted!' });
    // } else {
    //   res.json({ msg: 'Error: Unable to delete user!' });
    //   // console.log(UserDetails);
    // }
  });
});

router.patch('/updateUser/:id', (req, res) => {
  user_id = req.params.id;
  data = req.body;

  User.findByIdAndUpdate(user_id, data, (err, success) => {
    if (err) return res.status(500).send(err);
    const response = {
      message: 'User successfully Updated',
      id: user_id
    };
    return res.status(200).send(response);
  });
});

module.exports = router;
