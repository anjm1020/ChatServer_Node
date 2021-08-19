const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();

const db = require('./database/process/connection');
db();

app.set('view engine', 'pug');
app.set('views', './views');

app.use(express.static(__dirname + '/public'));

const session = require('./lib/session');
session(app);

const bodyParser = require('./lib/bodyparser');
bodyParser(app);

const passport = require('./lib/passport');
passport(app);

const authRouter = require('./routes/auth');
const indexRouter = require('./routes/index');
const logRouter = require('./routes/log');
app.use('/auth',authRouter);
app.use('/', indexRouter);
app.use('/log',logRouter);

const PORT = process.env.PORT;

var server = app.listen(PORT);

const socketServer = require('./lib/server-socket');
socketServer(server,app);