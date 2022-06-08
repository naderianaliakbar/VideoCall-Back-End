let express                           = require('express');
let router                            = express.Router();
const {body, validationResult, param} = require('express-validator');
const db                              = require('../modules/db');
const {authenticateToken}             = require("../modules/auth");
const {ObjectID}                      = require("mongodb");

/*
 * STATUS OF CALLS
 *  0 => created
 *  1 => started
 *  2 => accepted
 *  3 => rejected
 *  4 => busy
 *  5 => ended
 *  */

/*
 * TYPE OF CALLS
 *  0 => voice
 *  1 => video
 *  */

router.post(
    '/',
    authenticateToken,
    body('contactId').notEmpty().isMongoId(),
    body('callType').custom((value, {req}) => {
        if (![0, 1].includes(value)) {
            throw new Error('call type must be integer');
        }
        return true;
    }),
    function (req, res) {

        // check validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        // check user id
        if (req.body.contactId === req.user.data.id) {
            res.sendStatus(403);
        }

        // check user exists
        db.getDB().collection('users').findOne({
            _id: ObjectID(req.body.contactId)
        }).then(function (user) {
            if (user) {
                // create call
                db.getDB().collection('calls').insertOne({
                    caller   : ObjectID(req.user.data.id),
                    receiver : ObjectID(req.body.contactId),
                    type     : req.body.callType,
                    startDate: new Date(),
                    status   : 0
                }).then((result) => {
                    return res.json({
                        message: 'done',
                        callId : result.insertedId
                    });
                });
            } else {
                // forbidden
                return res.status(400).json({
                    message: 'contact is not found'
                });
            }
        });

    });

router.get(
    '/:id',
    param('id').isMongoId(),
    authenticateToken,
    function (req, res) {
        // check validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        // get room users
        db.getDB().collection('calls').findOne({
            _id: ObjectID(req.params.id)
        }).then(function (room) {
            // convert peer ids
            room.receiver = room.receiver.toString();
            room.caller = room.caller.toString();

            // check permission
            if(room.receiver !== req.user.data.id && room.caller !== req.user.data.id) {
                return res.sendStatus(403);
            }

            res.json(room);
        });
    }
);

module.exports = router;