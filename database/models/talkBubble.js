const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TalkBubble = new Schema({
  isMine:Boolean,
	text:String
});

module.exports = mongoose.model('TalkBubble', TalkBubble);