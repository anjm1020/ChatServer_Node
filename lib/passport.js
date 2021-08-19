const passport = require('passport');
const User = require('../database/models/user');
module.exports = (app) => {
	app.use(passport.initialize());
	app.use(passport.session());

	passport.use(User.createStrategy());
	passport.serializeUser(User.serializeUser());
	passport.deserializeUser(User.deserializeUser());
};