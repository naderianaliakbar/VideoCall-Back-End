let express                                    = require('express');
let router                                     = express.Router();
const {body, validationResult}                 = require('express-validator');
const db                                       = require('../modules/db');
const {generateRandomColor}                    = require("../modules/helper");
const {generateAccessToken, authenticateToken} = require("../modules/auth");
const md5                                      = require('md5');
const {ObjectID}                               = require("mongodb");

// LOGIN POST
router.post(
    '/login',
    body('email').isEmail(), // check E-mail
    body('password').isLength({min: 8}), // check password is 8 character
    function (req, res) {
        // check validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        // search in db for user
        db.getDB().collection('users').findOne({
            email   : req.body.email,
            password: md5(req.body.password)
        }).then((user) => {

            // not found
            if (!user) {
                return res.sendStatus(401);
            } else {

                // create token
                let token = generateAccessToken({
                    id   : user._id,
                    email: user.email,
                    role : user.role
                });

                // send token and user info
                res.json({
                    token       : token,
                    refreshToken: token
                });
            }
        });

    }
);

// LOGOUT POST
router.post(
    '/logout',
    authenticateToken,
    function (req, res) {
        res.sendStatus(200);
    }
);

// GET ME INFO
router.get(
    '/me',
    authenticateToken,
    function (req, res) {
        // search in db for user
        db.getDB().collection('users').findOne({
            _id: ObjectID(req.user.data.id)
        }).then((user) => {

            // not found
            if (!user) {
                return res.sendStatus(401);
            } else {
                res.json({
                    user: {
                        id       : user._id,
                        firstName: user.firstName,
                        lastName : user.lastName,
                        email    : user.email,
                        color    : user.color,
                        avatar   : user.avatar,
                        phone    : user.phone ?? '',
                        validate : user.validate ?? false,
                    }
                });
            }
        });

    }
);

// GET ME INFO
router.get(
    '/refreshToken',
    function (req, res) {
        res.sendStatus(200);
    }
);

// REGISTER POST
router.post(
    '/register',
    body('email').isEmail(), // check E-mail
    body('firstName').isString().isLength({max: 20}), // check first name
    body('lastName').isString().isLength({max: 20}), // check last name
    body('password').isLength({min: 8}), // check password is 8 character
    body('phone').isNumeric().isLength({max: 11}), // check phone is 11 character
    function (req, res) {
        // check validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        // search in db for user
        db.getDB().collection('users').findOne({
            email: req.body.email
        }).then(async (user) => {

            // not found
            if (!user) {
                // generate color for user
                let color = generateRandomColor();

                // add user to db
                let resultInsert = await db.getDB().collection('users').insertOne({
                    firstName: req.body.firstName,
                    lastName : req.body.lastName,
                    email    : req.body.email,
                    password : md5(req.body.password),
                    phone    : req.body.phone,
                    validate : false,
                    color    : color,
                    role     : 0
                });

                // create token
                let token = generateAccessToken({
                    id   : resultInsert.insertedId,
                    email: req.body.email,
                    role : 0
                });

                // send token and user info
                res.json({
                    token       : token,
                    refreshToken: token,
                });
            } else {
                return res.status(406).json({
                    message: 'There is a user with this email. Please enter another email.',
                });
            }
        });

    }
);

module.exports = router;