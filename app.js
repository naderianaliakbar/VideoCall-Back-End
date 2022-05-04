// init app and plugins
let express      = require('express');
let path         = require('path');
let cookieParser = require('cookie-parser');
let logger       = require('morgan');
const helmet     = require("helmet");
const cors       = require('cors');

// config environments
require('dotenv').config()

// load routes
let usersRouter = require('./routes/users');
let authRouter  = require('./routes/auth');

let app = express();

// add middlewares
app.use(helmet({crossOriginResourcePolicy: false}));
app.use(logger('dev'));
app.use(express.json({limit: '3mb'}));
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// add routes
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/auth', authRouter);

module.exports = app;
