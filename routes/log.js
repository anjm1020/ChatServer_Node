const express = require('express');
const router = express.Router();

const tB = require('../database/models/talkBubble');
const tL = require('../database/models/talkLog');
const User = require('../database/models/user');

var loglist = [];

function saveUnexist(users, cnt, me, res) {
	if (!users) return 0;
	var oid = {
		user: String,
		partner: String,
		log: String,
	};
	var log;
	if (cnt == users.length) {
		res.send({logs:loglist});
		return undefined;
	}

	User.findOne({ id: me })
		.select('_id')
		.exec()
		.then((uid) => {
			oid.user = uid;
			return User.findOne({ id: users[cnt].id }).select('_id').exec();
		})
		.then((pid) => {
			oid.partner = pid;
			return tL.findOne({ user: oid.user, partner: oid.partner }).populate('bubbles').exec();
		})
		.then((searched) => {
			console.log('**searched** : ' + searched);
			if (searched) {
				let bubbles = searched.bubbles;
				let partner = users[cnt].id;
				let entry = { bubbles: bubbles, partner: partner };
				loglist.push(entry);
				saveUnexist(users, cnt + 1, me, res);
			} else {
				log = new tL({
					user: oid.user,
					partner: oid.partner,
				});
				return log.save();
			}
		})
		.then((saved) => {
			if (saved) {
				oid.log = saved._id;
				return User.findOne({ _id: oid.user }).exec();
			}
		})
		.then((user) => {
			if (user) {
				user.talks.push(oid.log);
				return user.save();
			}
		})
		.then((saved_User) => {
			if (saved_User) saveUnexist(users, cnt + 1, me, res);
		});
}

router.post('/check-logdb', (req, res) => {
	if (!req.user) return undefined;
	var plist = req.body.partnerList;
	var user = req.user.id;
	loglist = [];
	saveUnexist(plist, 0, user, res);
});

router.post('/save-talkLog', (req, res) => {
	var log = req.body.log;
	var oid = {
		bubble: String,
		log: String,
		user: String,
		partner: String,
	};
	var bubble = new tB({
		isMine: log.msg.isMine,
		text: log.msg.text,
	});
	bubble
		.save()
		.then((saved) => {
			// GET USER
			console.log('bubble : ' + saved);
			oid.bubble = saved._id;
			return User.findOne({ id: log.user_id }).select('_id').exec();
		})
		.then((u_oid) => {
			// GET PARTNER
			console.log('user : ' + u_oid);
			oid.user = u_oid;
			return User.findOne({ id: log.partner_id }).select('_id').exec();
		})
		.then((p_oid) => {
			// GET USER TALKS
			oid.partner = p_oid;
			return tL.findOne({ user: oid.user }).exec();
		})
		.then((chatlog) => {
			// SAVE CHATLOG
			console.log('chatlog : ' + chatlog);
			chatlog.bubbles.push(oid.bubble);
			console.log('chatlog : ' + chatlog);
			return chatlog.save();
		});
	// !-- ASSUME THAT LOG IS ALREADY EXIST --!
	res.send({ process: 'success' });
});

router.post('/load-talkLog', (req, res) => {});

module.exports = router;