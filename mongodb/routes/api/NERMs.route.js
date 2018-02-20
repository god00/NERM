var express = require('express')

var router = express.Router()

// Getting the Todo Controller that we just created

var NERMController = require('../../controllers/NERMs.controllers');


// Map each API to the Controller FUnctions

router.get('/', NERMController.getNERM)

router.post('/', NERMController.createNERM)

router.put('/', NERMController.updateNERM)

router.delete('/:id',NERMController.removeNERM)


// Export the Router

module.exports = router;
