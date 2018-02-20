var express = require('express')

var router = express.Router()
var NERMs = require('./api/NERMs.route')


router.use('/NERMs', NERMs);


module.exports = router;
