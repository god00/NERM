var express = require('express')

var router = express.Router()

// Getting the Todo Controller that we just created

var NERMController = require('../../controllers/NERMs.controllers');


// Map each API to the Controller FUnctions

router.get('/', NERMController.getUsers)

router.post('/', NERMController.createUser)

router.put('/', NERMController.updateUser)

router.delete('/:id',NERMController.removeNERM)

router.post('/login',NERMController.loginNERM)

router.post('/uploads',NERMController.uploadNERM)


// Export the Router

module.exports = router;
