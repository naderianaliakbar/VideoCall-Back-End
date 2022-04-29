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

let app = express();

// add middlewares
app.use(helmet());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// add routes
app.use('/api/v1/users', usersRouter);

module.exports = app;
