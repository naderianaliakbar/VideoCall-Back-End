let express                    = require('express');
let router                     = express.Router();
const {body, validationResult} = require('express-validator');
const db                       = require('../modules/db');
const {authenticateToken}      = require("../modules/auth");
const {ObjectID}               = require("mongodb");

// USER PUT
router.put(
    '/me',
    authenticateToken,
    body('email').isEmail(), // check E-mail
    body('firstName').isString().isLength({max: 20}), // check first name
    body('lastName').isString().isLength({max: 20}), // check last name
    body('color').isString(), // check password is 8 character
    function (req, res) {
        // check validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        let updateUserData = () => {
            db.getDB().collection('users').updateOne(
                {
                    _id: ObjectID(req.user.data.id)
                },
                {
                    $set: {
                        firstName: req.body.firstName,
                        lastName : req.body.lastName,
                        email    : req.body.email,
                        color    : req.body.color,
                    }
                }, function (err, res) {
                    if (err) throw err;
                    return {message: 'done'};
                });
        };

        // email not change
        if (req.user.data.email === req.body.email) {
            return res.json(updateUserData());
        } else {
            // search in db
            db.getDB().collection('users').findOne({
                email: req.body.email
            }).then((user) => {

                // not found
                if (!user) {
                    return res.json(updateUserData());
                } else {
                    return res.status(406).json({
                        message: 'There is a user with this email. Please enter another email.',
                    });
                }
            });
        }

    }
);

module.exports = router;
