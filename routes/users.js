let express                    = require('express');
let router                     = express.Router();
const {body, validationResult} = require('express-validator');
const db                       = require('../modules/db');
const {checkValidation, check} = require("../modules/helper");
const {generateAccessToken}    = require("../modules/auth");
const md5                      = require('md5');


router.post(
    '/login',
    body('email').isEmail(), // check E-mail
    body('password').isLength({min: 8}), // check password is 8 character
    function (req, res) {
        // check validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(406).json({errors: errors.array()});
        }

        // search in db for user
        db.getDB().collection('users').findOne({
            email   : req.body.email,
            password: md5(req.body.password)
        }).then((user) => {

            // not found
            if (!user) {
                return res.status(401).json({
                    message: 'E-mail or Password is Wrong!',
                });
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
                    firstName: user.firstName,
                    lastName : user.lastName,
                    email    : user.email,
                    token    : token
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
            return res.status(406).json({errors: errors.array()});
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
                    password : md5(req.body.password)
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
                    firstName: req.body.firstName,
                    lastName : req.body.lastName,
                    email    : req.body.email,
                    token    : token
                });
            } else {
                return res.status(406).json({
                    message: 'There is already a user with this email!',
                });
            }
        });

    }
);

module.exports = router;
