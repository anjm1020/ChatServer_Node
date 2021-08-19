const session = require('express-session');
const mongoose = require('mongoose');
module.exports = (app) => {
	app.use(
		session({
			saveUninitialized: true,
			resave: false,
			secret: 'secretsessionkey',
			store: require('mongoose-session')(mongoose),
		})
	);
};