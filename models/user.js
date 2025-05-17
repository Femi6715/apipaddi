const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');

mongoose.set('useFindAndModify', false);

// user schema

const UserSchema = mongoose.Schema({
  surname: {
    type: String,
    required: true
  },
  firstname: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  dob: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  mobile_no: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  main_balance: {
    type: Number,
    required: true
  },
  bonus: {
    type: Number,
    required: true
  }
});

const User = (module.exports = mongoose.model('User', UserSchema));

module.exports.getUserById = function(id, callback) {
  User.findById(id, callback);
};

module.exports.getUserByUsername = function(username, callback) {
  const query = { username: username };
  User.findOne(query, callback);
};

module.exports.getUserByMobileNo = function(mobile_no, callback) {
  const query = { mobile_no: mobile_no };
  User.findOne(query, callback);
};

module.exports.addUser = function(newUser, callback) {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) throw err;
      newUser.password = hash;
      newUser.save(callback);
    });
  });
};

module.exports.comparePassword = function(candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if (err) throw err;
    callback(null, isMatch);
  });
};

module.exports.updateUserProfile = function(updatedData, callback) {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(updatedData.password, salt, (err, hash) => {
      if (err) throw err;
      User.findOneAndUpdate(
        {
          _id: updatedData.user_id
        },
        {
          $set: {
            state: updatedData.state,
            email: updatedData.email,
            mobile_no: updatedData.mobile_no,
            password: hash
          }
        },
        { new: true }
      ).then(result => {
        callback(result);
      });
    });
  });
};

// the function below update the bonus and main acct after
// a new ticket is added

module.exports.updateUserAcct = function(balanceInfo, cb) {
  User.findOneAndUpdate(
    {
      _id: balanceInfo.user_id
    },
    {
      $set: {
        main_balance: balanceInfo.main_balance,
        bonus: balanceInfo.bonus
      }
    },
    { new: true }
  ).then(result => {
    cb(result);
  });
};

// this function updates the acct after successfull verification
// of payment by paystack
module.exports.updateUserBalance = function(user_id, new_balance, cb) {
  User.findOneAndUpdate(
    {
      _id: user_id
    },
    {
      $set: {
        main_balance: new_balance,
        bonus: new_bonus
      }
    },
    { new: true }
  ).then(result => {
    cb(result);
  });
};

module.exports.updateUserPwd = function(user_email, new_pwd, cb) {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(new_pwd, salt, (err, hash) => {
      if (err) throw err;
      User.findOneAndUpdate(
        {
          email: user_email
        },
        {
          $set: {
            password: hash
          }
        },
        { new: true }
      ).then(result => {
        cb(result);
      });
    });
  });
};

module.exports.updateUserPwdWithSms = function(mobile_no, new_pwd, cb) {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(new_pwd, salt, (err, hash) => {
      if (err) throw err;
      User.findOneAndUpdate(
        {
          mobile_no: mobile_no
        },
        {
          $set: {
            password: hash
          }
        },
        { new: true }
      ).then(result => {
        cb(result);
      });
    });
  });
};

module.exports.payWinner = function(user_id, new_balance, cb) {
  User.findOneAndUpdate(
    {
      _id: user_id
    },
    {
      $set: {
        main_balance: new_balance
      }
    },
    { new: true }
  ).then(result => {
    cb(result);
  });
};

module.exports.CreditBonus = function(user_id, new_balance, cb) {
  User.findOneAndUpdate(
    {
      _id: user_id
    },
    {
      $set: {
        bonus: new_balance
      }
    },
    { new: true }
  ).then(result => {
    cb(result);
  });
};

module.exports.allUsers = function(callback) {
  User.countDocuments(callback);
};

module.exports.getAllUsers = function(callback) {
  User.find(callback);
};

module.exports.checkUsername = function(username, callback) {
  const query = { username: username };
  User.countDocuments(query, callback);
};

module.exports.checkMobileNo = function(mobile_no, callback) {
  const query = { mobile_no: mobile_no };
  User.countDocuments(query, callback);
};
