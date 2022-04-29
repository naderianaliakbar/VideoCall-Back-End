let express                                    = require('express');
let router                                     = express.Router();
const {body, validationResult}                 = require('express-validator');
const db                                       = require('../modules/db');
const {checkValidation, check}                 = require("../modules/helper");
const {generateAccessToken, authenticateToken} = require("../modules/auth");
const md5                                      = require('md5');
const {ObjectID}                               = require("mongodb");


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
                    id       : user._id.toString(),
                    firstName: user.firstName,
                    lastName : user.lastName,
                    email    : user.email,
                });

                // send token and user info
                res.json({
                    token: token
                });
            }
        });

    }
);

router.post(
    '/register',
    body('email').isEmail(), // check E-mail
    body('firstName').isString().isLength({max: 20}), // check first name
    body('lastName').isString().isLength({max: 20}), // check last name
    body('password').isLength({min: 8}), // check password is 8 character
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
                // add user to db
                let resultInsert = await db.getDB().collection('users').insertOne({
                    firstName: req.body.firstName,
                    lastName : req.body.lastName,
                    email    : req.body.email,
                    password : md5(req.body.password),
                    role     : 0
                });

                // create token
                let token = generateAccessToken({
                    id       : resultInsert.insertedId.toString(),
                    firstName: req.body.firstName,
                    lastName : req.body.lastName,
                    email    : req.body.email,
                });

                // send token and user info
                res.json({
                    token: token
                });
            } else {
                return res.status(406).json({
                    message: 'There is a user with this email. Please enter another email.',
                });
            }
        });

    }
);

router.get(
    '/me',
    authenticateToken,
    function (req, res) {
        // search in db for user
        res.json({
            user: {
                firstName: req.user.data.firstName,
                lastName : req.user.data.lastName,
                email    : req.user.data.email
            }
        });
    }
);

module.exports = router;
