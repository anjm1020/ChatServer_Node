const express = require('express');
const router = express.Router();

const passport = require('passport');
const User = require('../database/models/user');

router.get('/login', (req, res) => {
	console.log(req.user);
	res.render('login');
});

router.post(
	'/login_process',
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/auth/login',
	})
);

router.get('/signup', (req, res) => {
	res.render('signup');
});

router.post('/signup_process', (req, res) => {
	var body = req.body;
	if (body.password != body.verify_pwd) {
		res.render('signup', { errMsg: 'err : Password is not same' });
		return;
	}
	var user = new User({ id: body.id, nickname: body.nickname });
	User.register(user, body.password, (err, user) => {
		if (err) {
			if (err.name === 'UserExistsError')
				res.render('signup', { errMsg: 'err : Same ID exist' });
			else res.json({ success: false, message: 'Your account could not be saved. Error: ', err });
		} else {
			res.render('login');
		}
	});
});

router.get('/logout',(req,res)=>{``
	res.redirect(`/logout/destroy_socket/${req.user.id}`);
});

module.exports=router;