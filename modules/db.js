const MongoClient = require('mongodb').MongoClient;
const url         = process.env.MongoDB_URL;
let _db;

module.exports = {

    connect: function (callback) {
        MongoClient.connect(url, function (err, client) {
            _db = client.db(process.env.MongoDB_DATABASE);
            return callback(err);
        });
    },

    getDB: function () {
        return _db;
    }
};