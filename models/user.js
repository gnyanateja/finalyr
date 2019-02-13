var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

var schema = new Schema({
    email: {type:String},
    first_name: {type:String},
    last_name: {type:String},
    phone_no: {type:String},
    gender: {type:String},
    password:{type:String},
    creation_dt:{type:Date}
},
{collection:'pmail_users'});

schema.statics.hashPassword = function hashPassword(password){
    return bcrypt.hashSync(password,10);
}

schema.methods.isValid = function(hashedpassword){
    return  bcrypt.compareSync(hashedpassword, this.password);
}

module.exports = mongoose.model('User',schema);
