const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const AdminUser = require('../models/admin');

require('../config/passport');

router.post('/register', (req, res) => {
  let newAdminUser = new AdminUser({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    mobile_no: req.body.mobile_no,
    username: req.body.username,
    password: req.body.password
  });

  AdminUser.checkUsername(req.body.username, (err, adminUser) => {
    if (err) {
      console.log('There was an error matching username');
    }

    if (adminUser < 1) {
      AdminUser.addAdminUser(newAdminUser, (err, adminUser) => {
        if (err) {
          res.json({ success: false, msg: 'Admin Registration Failed' });
        } else {
          res.json({ success: true, msg: 'Admin Registration Successfull' });
        }
      });
    } else {
      res.json({ success: false, msg: 'Username exsists already' });
    }
  });
});

//Autheticate - here is the user authentication and log in
router.post('/authenticate', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  console.log(username, password);

  AdminUser.getAdminUserByUsername(username, (err, adminUser) => {
    if (err) throw err;

    if (!adminUser) {
      return res.json({ success: false, msg: 'User not Found' });
    }

    //this can be done in ur model FYI
    AdminUser.comparePassword(password, adminUser.password, (err, isMatch) => {
      if (err) throw err;

      if (isMatch) {
        const token = jwt.sign({ data: adminUser }, config.secret, {
          expiresIn: 604800 // token expires in one week
        });

        res.json({
          success: true,
          token: 'jwt4admin ' + token
          // adminUser: {
          //     id: adminUser._id,
          //     firstname: adminUser.firstname,
          //     lastname: adminUser.lastname,
          //     email: adminUser.email,
          //     mobile_no: adminUser.mobile_no,
          //     username: adminUser.username
          // }
        });
      } else {
        return res.json({ success: false, msg: 'Wrong password' });
      }
    });
  });
});

module.exports = router;
