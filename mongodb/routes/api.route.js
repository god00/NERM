var express = require('express')

var router = express.Router()
var nerms = require('./api/NERMs.route')


router.use('/nerms', nerms);


module.exports = router;
