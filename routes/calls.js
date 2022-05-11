let express                    = require('express');
let router                     = express.Router();
const {body, validationResult} = require('express-validator');
const db                       = require('../modules/db');
const {authenticateToken}      = require("../modules/auth");
const {ObjectID}               = require("mongodb");

router.post(
    '/',
    authenticateToken,
    body('email').isEmail(),
    function (req, res) {

    });

module.exports = router;