const {Server}    = require("socket.io");
const socketIoJwt = require('socketio-jwt');

// init variables
let io;
let Clients = [];
let Rooms   = [];

module.exports = {
    createServer: function (server, callback) {

        // create socket io server
        io = new Server(server, {
            serveClient: false, // serve socket io files
            transports : ['websocket'], // only websocket can connect
        });

        // add jwt auth
        io.use(socketIoJwt.authorize({
            secret   : process.env.TOKEN_SECRET,
            handshake: true
        }));

        // create handler
        io.on('connection', (socket) => {

            socket.on("userConnect", function (username) {

                if (Clients.find((client) => client.username === username)) {
                    socket.emit('userConnect', {
                        status : false,
                        message: 'isOnline'
                    });
                } else {
                    socket.nikname = username;
                    Clients.push({
                        username: username,
                        socketId: socket.id
                    });
                    socket.emit('userConnect', {
                        status : true,
                        message: 'userConnected'
                    });
                }
                // console.log();
                // console.log(Clients);
                // console.log(Clients[socket.id] + " is connected");
            });

            socket.on('checkCall', function (username) {
                let findUser = Clients.find((client) => client.username === username);
                if (findUser) {
                    let findRoomCaller   = Rooms.find((room) => room.caller == username);
                    let findRoomReceiver = Rooms.find((room) => room.receiver == username);
                    if (!findRoomCaller && !findRoomReceiver) {
                        socket.to(findUser.socketId).emit('someOneCallYou', socket.nikname);
                        socket.emit('checkCall', {
                            status : true,
                            message: 'calling'
                        });
                    } else {
                        socket.emit('checkCall', {
                            status : false,
                            message: 'busy'
                        });
                    }
                } else {
                    socket.emit('checkCall', {
                        status : false,
                        message: 'offline'
                    });
                }
            });

            socket.on('acceptCall', function (callerUsername, peerId) {
                let findUser = Clients.find((client) => client.username === callerUsername);
                socket.to(findUser.socketId).emit('callAccepted', peerId);
                Rooms.push({
                    caller  : callerUsername,
                    receiver: socket.nikname
                });
                // console.log('room added', Rooms);
            });


            // // Send Offer To Start Connection
            // socket.on('offer', (username, description) => {
            //     let findUser = Clients.find((client) => client.username === username);
            //     socket.to(findUser.socketId).emit('offer', socket.nikname, description);
            // });
            //
            // // Send Answer From Offer Request
            // socket.on('answer', (username, description) => {
            //     let findUser = Clients.find((client) => client.username === username);
            //     socket.to(findUser.socketId).emit('answer', socket.nikname, description);
            // });
            //
            // // Send Signals to Establish the Communication Channel
            // socket.on('candidate', (username, signal) => {
            //     let findUser = Clients.find((client) => client.username === username);
            //     socket.to(findUser.socketId).emit('candidate', socket.nikname, signal);
            // });

            socket.on('declineCall', function (callerUsername) {
                let findUser = Clients.find((client) => client.username === callerUsername);
                socket.to(findUser.socketId).emit('callDeclined');
            });

            socket.on('getRemoteStreamConfigs', function (username, configs) {
                let findUser = Clients.find((client) => client.username === username);
                socket.to(findUser.socketId).emit('getRemoteStreamConfigs', configs);
            });

            socket.on('finishCall', function (username) {
                let findUser = Clients.find((client) => client.username === username);
                socket.to(findUser.socketId).emit('finishCall');

                // removing room
                let findRoomCaller   = Rooms.find((room) => room.caller == username);
                let findRoomReceiver = Rooms.find((room) => room.receiver == username);
                if (findRoomCaller) {
                    Rooms.splice(Rooms.indexOf(findRoomCaller), 1);
                    // console.log('room removed', Rooms);
                }
                if (findRoomReceiver) {
                    Rooms.splice(Rooms.indexOf(findRoomReceiver), 1);
                    // console.log('room removed', Rooms);
                }

            });

            socket.on("disconnect", function () {
                let findUser = Clients.find((client) => client.socketId === socket.id);
                if (findUser) {
                    let findRoomCaller   = Rooms.find((room) => room.caller == findUser.username);
                    let findRoomReceiver = Rooms.find((room) => room.receiver == findUser.username);
                    if (findRoomCaller) {
                        Rooms.splice(Rooms.indexOf(findRoomCaller), 1);
                        let findReceiver = Clients.find((client) => client.username === findRoomCaller.receiver);
                        socket.to(findReceiver.socketId).emit('finishCall');
                        // console.log('room removed', Rooms);
                    }
                    if (findRoomReceiver) {
                        Rooms.splice(Rooms.indexOf(findRoomReceiver), 1);
                        let findCaller = Clients.find((client) => client.username === findRoomReceiver.caller);
                        socket.to(findCaller.socketId).emit('finishCall');
                        // console.log('room removed', Rooms);
                    }

                    Clients.splice(Clients.indexOf(findUser), 1);
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