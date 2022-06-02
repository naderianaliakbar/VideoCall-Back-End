const {Server}    = require("socket.io");
const socketIoJwt = require('socketio-jwt');
const db          = require('../modules/db');
const {ObjectID}  = require("mongodb");

// init variables
let io;
let clients = [];

module.exports = {
    createServer: function (server, callback) {

        // create socket io server
        io = new Server(server, {
            serveClient: false, // serve socket io files
            transports : ['websocket'], // only websocket can connect
            allowEIO3: true
        });

        // add jwt auth
        io.use(socketIoJwt.authorize({
            secret   : process.env.TOKEN_SECRET,
            handshake: true
        }));

        // create handler
        io.on('connection', (socket) => {

            // get access to user
            let socketUserId = socket.decoded_token.data.id;
            if (clients[socketUserId]) {
                // user has active session but wants to connect
                socket.emit('userConnect', {
                    status : false,
                    message: 'hasActiveSession'
                });
                // destroy connection
                socket.disconnect();
            } else {
                // new user connected
                socket.nikname  = socketUserId;
                clients[socketUserId] = {
                    email   : socket.decoded_token.data.email,
                    socketId: socket.id,
                    room    : null,
                };

                // give access to connect
                socket.emit('userConnect', {
                    status : true,
                    message: 'userConnected'
                });
            }

            console.log(clients[socketUserId]['email'] + " is connected");

            socket.on('prepareCall', function (userId, roomId) {
                // validate
                if (userId) {
                    // check exists
                    if (clients[userId]) {

                        // check user room
                        if (!clients[userId]['room']) {
                            // update db status (started)
                            db.getDB().collection('calls').updateOne(
                                {_id: ObjectID(roomId)},
                                {$set: {status: 1}}
                            );

                            socket.to(clients[userId]['socketId']).emit('notifyCall', socket.nikname);
                            socket.emit('prepareCall', {
                                status : true,
                                message: 'ringing'
                            });
                        } else {
                            // update db status (busy)
                            db.getDB().collection('calls').updateOne(
                                {_id: ObjectID(roomId)},
                                {$set: {status: 4}}
                            );

                            // user is busy
                            socket.emit('prepareCall', {
                                status : false,
                                message: 'user is busy'
                            });
                        }

                    } else {
                        socket.emit('prepareCall', {
                            status : false,
                            message: 'offline'
                        });
                    }
                } else {
                    socket.emit('prepareCall', {
                        status : false,
                        message: 'user id is wrong'
                    });
                }
            });

            socket.on('acceptCall', function (callerId, peerId, roomId) {
                // update db status (accepted)
                db.getDB().collection('calls').updateOne(
                    {_id: ObjectID(roomId)},
                    {$set: {status: 2}}
                );

                // update user status
                clients[socket.nikname]['room'] = roomId;
                clients[callerId]['room']       = roomId;

                if (clients[callerId]) {
                    socket.to(clients[callerId]['socketId']).emit('callAccepted', peerId);
                }

            });

            socket.on('rejectCall', function (userId, roomId) {
                // update db status (rejected)
                db.getDB().collection('calls').updateOne(
                    {_id: ObjectID(roomId)},
                    {$set: {status: 3}}
                );
                if (clients[userId]) {
                    socket.to(clients[userId]['socketId']).emit('callDeclined');
                }
            });

            socket.on('streamAction', function (userId, configs) {
                if (clients[userId]) {
                    socket.to(clients[userId]['socketId']).emit('getRemoteStreamConfigs', configs);
                }
            });

            socket.on('endCall', function (userId) {
                // update db status (ended)
                db.getDB().collection('calls').updateOne(
                    {_id: ObjectID(clients[socket.nikname]['room'])},
                    {$set: {status: 5, endDate: new Date()}}
                );

                if (clients[userId]) {
                    socket.to(clients[userId]['socketId']).emit('endCall');
                    clients[userId]['room'] = null;
                }

                // update user status
                clients[socket.nikname]['room'] = null;

            });

            // Send Offer To Start Connection
            socket.on('offer', (userId, description) => {
                if (clients[userId]) {
                    socket.to(clients[userId]['socketId']).emit('offer', socket.nikname, description);
                }
            });

            // Send Answer From Offer Request
            socket.on('answer', (userId, description) => {
                if (clients[userId]) {
                    socket.to(clients[userId]['socketId']).emit('answer', socket.nikname, description);
                }
            });

            // Send Signals to Establish the Communication Channel
            socket.on('candidate', (userId, signal) => {
                if (clients[userId]) {
                    socket.to(clients[userId]['socketId']).emit('candidate', socket.nikname, signal);
                }
            });

            socket.on("disconnect", function () {

                console.log(clients);
                console.log(socket.nikname);

                if (clients[socket.nikname] && clients[socket.nikname]['room']) {

                    // get room users
                    db.getDB().collection('users').findOne({
                        _id: ObjectID(clients[socket.nikname]['room'])
                    }).then(function (room) {

                        // update db status (ended)
                        db.getDB().collection('calls').updateOne(
                            {_id: ObjectID(clients[socket.nikname]['room'])},
                            {$set: {status: 5, endDate: new Date()}}
                        );

                        let peerUser = '';

                        if (socket.nikname === room.caller.toString()) {
                            peerUser = room.receiver.toString();
                        } else {
                            peerUser = room.caller.toString();
                        }

                        if (clients[peerUser]) {
                            socket.to(clients[peerUser]['socketId']).emit('endCall');
                        }

                        clients[room.caller.toString()]['room']   = null;
                        clients[room.receiver.toString()]['room'] = null;

                        delete clients[socket.nikname];
                    });
                }

            });

        });

        if (typeof callback === 'function')
            return callback();
    },
    getIO       : function () {
        return io;
    }
};