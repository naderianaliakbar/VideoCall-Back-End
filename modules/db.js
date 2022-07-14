const {MongoClient, ServerApiVersion} = require('mongodb');
const url                             = process.env.MongoDB_URL;
let _db;

module.exports = {
    connect: function (callback) {
        const uri    = "mongodb+srv://exoroya:<f5lQmGwM1RjoAXAb>@exoroya.dq090yy.mongodb.net/?retryWrites=true&w=majority";
        const client = new MongoClient(uri, {
            useNewUrlParser   : true,
            useUnifiedTopology: true,
            serverApi         : ServerApiVersion.v1
        });
        client.connect(err => {
            _db = client.db(process.env.MongoDB_DATABASE);
            return callback(err);
        });
    },

    getDB: function () {
        return _db;
    }
};