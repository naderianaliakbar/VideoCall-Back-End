let express                    = require('express');
let router                     = express.Router();
const {body, validationResult} = require('express-validator');
const db                       = require('../modules/db');


/* GET users listing. */
router.get('/', function (req, res, next) {
    db.getDB().collection('users').find({}).toArray().then((users) => {
        res.json(users);
    });
});

module.exports = router;
