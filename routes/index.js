const express = require('express');
const router = express.Router();

const authCheck = require('../lib/authCheck');

router.get('*', (req, res, next) => {
	authCheck(req, res, next);
});

router.get('/', (req, res) => {
	console.log(req.user);
	res.render('index', {
		nickname: req.user.nickname,
		id: req.user.id,
	});
});

module.exports = router;