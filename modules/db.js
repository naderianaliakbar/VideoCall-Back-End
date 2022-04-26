const MongoClient = require('mongodb').MongoClient;
const url         = "mongodb://localhost:27017";
let _db;

module.exports = {

    connect: function (callback) {
        MongoClient.connect(url, function (err, client) {
            _db = client.db('exoroya');
            return callback(err);
        });
    },

    getDB: function () {
        return _db;
    }
};