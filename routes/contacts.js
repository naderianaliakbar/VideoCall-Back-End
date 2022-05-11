let express                           = require('express');
let router                            = express.Router();
const {body, validationResult, param} = require("express-validator");
const {authenticateToken}             = require("../modules/auth");
const db                              = require("../modules/db");
const {ObjectID}                      = require("mongodb");

// Add Contact
router.post(
    '/',
    body('email').isEmail(),
    authenticateToken,
    function (req, res) {

        // check validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        // check user email
        if (req.body.email === req.user.data.email) {
            return res.sendStatus(403);
        }

        //get user contacts
        db.getDB().collection('users').findOne({
            _id: ObjectID(req.user.data.id)
        }).then(function (user) {
            let userContacts = user.contacts ?? [];

            // convert to string userContacts
            userContacts.forEach(function (contact, index) {
                userContacts[index] = contact.toString();
            });

            // check email
            db.getDB().collection('users').findOne({
                email: req.body.email
            }).then(function (contact) {
                // user not found
                if (!contact) {
                    return res.status(406).json({
                        message: 'No users found with this email'
                    });
                } else {
                    // check exists
                    if (userContacts.includes(contact._id.toString(), 0)) {
                        return res.status(400).json({
                            message: 'The contact already exists'
                        });
                    } else {
                        // add contact
                        db.getDB().collection('users').updateOne(
                            {_id: ObjectID(req.user.data.id)},
                            {$push: {'contacts': contact._id}}
                        ).then(function () {
                            return res.json({
                                message: 'done'
                            });
                        });
                    }
                }
            });
        });
    });

// get Contacts
router.get(
    '/',
    authenticateToken,
    function (req, res) {

        //get user contacts
        db.getDB().collection('users').findOne(
            {_id: ObjectID(req.user.data.id)}
        ).then(function (user) {

            // get contacts detail
            db.getDB().collection('users').find(
                {_id: {$in: user.contacts}}
            ).project(
                {firstName: 1, lastName: 1, email: 1, avatar: 1, color: 1, _id: 1}
            ).toArray(function (err, contacts) {
                if (err) console.log(err);
                return res.json({
                    contacts: contacts ?? []
                });
            });

        });

    });

// Add Contact
router.delete(
    '/:id',
    param('id').isMongoId(),
    authenticateToken,
    function (req, res) {

        // check validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        // remove contact
        db.getDB().collection('users').updateOne(
            {_id: ObjectID(req.user.data.id)},
            {$pull: {'contacts': ObjectID(req.params.id)}}
        ).then(function () {
            return res.json({
                message: 'done'
            });
        });

    });

module.exports = router;