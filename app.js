// init app and plugins
let express      = require('express');
let path         = require('path');
let cookieParser = require('cookie-parser');
let logger       = require('morgan');
const helmet     = require("helmet");

// load routes
let usersRouter = require('./routes/users');

let app = express();

// add middlewares
app.use(helmet());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// add routes
app.use('/users', usersRouter);

module.exports = app;
