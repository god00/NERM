var express = require('express')

var router = express.Router()

// Getting the Todo Controller that we just created

var NERMController = require('../../controllers/NERMs.controllers');


// Map each API to the Controller FUnctions

router.get('/', NERMController.getItems)

router.post('/', NERMController.createUser)

router.post('/model', NERMController.createModel)

router.get('/model', NERMController.getModel)

router.put('/model', NERMController.updateModel)

router.delete('/:id',NERMController.removeNERM)

router.delete('/corpus/:id',NERMController.removeCorpus)

router.post('/login',NERMController.loginNERM)

router.post('/uploads',NERMController.uploadsFile)


// Export the Router

module.exports = router;
