const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const User = new Schema({
  id : String,
	nickname : String,
	talks:[{
		type:Schema.Types.ObjectId,
		ref:'TalkLog'
	}]
});

User.plugin(passportLocalMongoose, {usernameField: 'id'});

module.exports = mongoose.model('User', User);