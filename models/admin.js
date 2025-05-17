const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.set('useFindAndModify', false);

// user schema

const AdminUserSchema = mongoose.Schema({
    firstname:{
        type: String,
        required: true
    },
    lastname:{
        type: String,
        required: true
    },
    email:{
        type: String
    },
    mobile_no:{
        type: Number,
        required: true
    },
    username:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    }
});

const AdminUser = module.exports = mongoose.model('AdminUser', AdminUserSchema);

module.exports.getAdminUserById = function(id, callback){
    AdminUser.findById(id, callback);
}

module.exports.getAdminUserByUsername = function(username, callback){
    const query = {username: username}
    AdminUser.findOne(query, callback);
}

module.exports.addAdminUser = function(newAdminUser, callback){
    bcrypt.genSalt(10,(err, salt) => {
        bcrypt.hash(newAdminUser.password, salt, (err, hash) => {
            if(err) throw err;
            newAdminUser.password = hash;
            newAdminUser.save(callback);
        });
    });
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if(err) throw err;
        callback(null, isMatch);
    });
}

module.exports.checkUsername = function(username, callback) {
    const query = {username: username}
    AdminUser.countDocuments(query, callback);
}