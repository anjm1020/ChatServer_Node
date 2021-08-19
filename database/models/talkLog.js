const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TalkLog = new Schema({
	user:{
		type:Schema.Types.ObjectId,
		ref:'User'
	},
	partner:{
		type:Schema.Types.ObjectId,
		ref:'User'
	},
	bubbles:[{
		type:Schema.Types.ObjectId,
		ref:'TalkBubble'
	}]
});

module.exports = mongoose.model('TalkLog', TalkLog);