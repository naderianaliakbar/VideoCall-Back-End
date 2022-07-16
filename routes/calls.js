let express                           = require('express');
let router                            = express.Router();
const {body, validationResult, param} = require('express-validator');
const db                              = require('../modules/db');
const {authenticateToken}             = require("../modules/auth");
const {ObjectID}                      = require("mongodb");
const persianDate                     = require('persian-date');

/*
 * STATUS OF CALLS
 *  0 => created
 *  1 => started
 *  2 => accepted
 *  3 => rejected
 *  4 => busy
 *  5 => ended
 *  6 => offline
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

            if (!room) {
                res.sendStatus(400);
            }

            // convert peer ids
            room.receiver = room.receiver.toString();
            room.caller   = room.caller.toString();

            // check permission
            if (room.receiver !== req.user.data.id && room.caller !== req.user.data.id) {
                return res.sendStatus(403);
            }

            // get contacts detail
            db.getDB().collection('users').findOne(
                {_id: (room.caller === req.user.data.id) ? ObjectID(room.receiver) : ObjectID(room.caller)}
            ).then(function (user) {
                if (user) {
                    room.user = {
                        firstName: user.firstName,
                        lastName : user.lastName,
                        avatar   : user.avatar,
                        color    : user.color,
                        _id      : user._id
                    };
                    res.json(room);
                }
            });

        });
    }
);

router.get(
    '/',
    authenticateToken,
    function (req, res) {

        // get room users
        db.getDB().collection('calls').find({
            $or: [{receiver: ObjectID(req.user.data.id)}, {caller: ObjectID(req.user.data.id)}]
        }).limit(20).sort( { startDate: -1 } ).toArray((error, calls) => {
            let users = [];

            if (calls.length) {
                // find peer user in calls
                calls.forEach((call, index) => {
                    let peerUser             = call.caller.toString() === req.user.data.id ? call.receiver : call.caller;
                    calls[index]['peerUser'] = peerUser.toString();
                    if (!users.includes(peerUser)) {
                        users.push(peerUser);
                    }
                });


                // find users data
                db.getDB().collection('users').find({
                    _id: {$in: users}
                }).project({firstName: 1, lastName: 1, avatar: 1, color: 1, _id: 1}).toArray((error, users) => {
                    users.forEach((user) => {
                        calls.forEach((call, index) => {
                            if (call.peerUser === user._id.toString()) {
                                calls[index]['user'] = user;

                                let startDateTime = ' ' + call.startDate.getHours() + ':' + call.startDate.getMinutes();

                                let startDate                   = new persianDate(call.startDate);
                                calls[index]['startDateJalali'] = startDate.toLocale('fa').format('D MMMM') + startDateTime;
                                startDate.toCalendar('gregorian');
                                calls[index]['startDate'] = startDate.toLocale('en').format('D MMMM') + startDateTime;
                                calls[index]['creator'] = call.caller.toString() === req.user.data.id;

                                delete calls[index]['receiver'];
                                delete calls[index]['caller'];
                                delete calls[index]['peerUser'];
                                delete calls[index]['endDate'];
                                delete calls[index]['status'];
                            }
                        });
                    });
                    res.json({
                        calls: calls
                    });
                });
            } else {
                res.json({
                    calls: []
                });
            }

        });
    }
);

module.exports = router;