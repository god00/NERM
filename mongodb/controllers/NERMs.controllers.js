// Accessing the Service that we just created

var NERMService = require('../services/NERM.service')
var NERMModel = require('../models/NERMUser.model')
var NERM = require('../models/NERMUser.model')
var config = require('../config.json');
var multer = require('multer');
var upload = multer();

var DIR = `.${config.DIR}`;


// Saving the context of this module inside the _the variable

_this = this


// Async Controller function to get the To do List

exports.getUsers = async function (req, res, next) {

    // Check the existence of the query parameters, If the exists doesn't exists assign a default value

    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 99999999;

    try {
        var nerms = await NERMService.getItemFromDB({}, page, limit, 'user')

        // Return the todos list with the appropriate HTTP Status Code and Message.

        return res.status(200).json({ status: 200, data: nerms, message: "Succesfully nermsdb Recieved" });

    } catch (e) {

        //Return an Error Response Message with Code and the Error Message.

        return res.status(400).json({ status: 400, message: e.message });

    }
}

exports.createUser = async function (req, res, next) {

    // Req.Body contains the form submit values.
    var user = {
        email: req.body.email,
        password: req.body.password,
    }

    var page = req.query.page ? req.query.page : 1;
    var limit = req.query.limit ? req.query.limit : 99999999;

    try {
        // Calling the Service function with the new object from the Request Body
        var query = NERM.findOne({ email: user.email });
        query.exec(async function (err, user) {
            if (err)
                return res.status(400).json({ status: 400., message: err.message });
            else if (model) {
                return res.status(201).json({ status: 201, data: false, message: "This user already exists" })
            }
            else {
                var createdNERM = await NERMService.createUser(user)
                return res.status(201).json({ status: 201, data: true, message: "Succesfully Created User" })
            }
        })
    } catch (e) {

        //Return an Error Response Message with Code and the Error Message.
        return res.status(400).json({ status: 400, message: "Model Creation was Unsuccesfull" });
    }
}

exports.createModel = async function (req, res, next) {

    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 99999999;

    var nerm = {
        email: req.body.email,
        modelName: req.body.modelName,
    }

    try {
        var query = NERMModel.find({ email: nerm.email, modelName: nerm.email });
        query.exec(async function (err, model) {
            if (err)
                return res.status(400).json({ status: 400., message: err.message });
            else if (model) {
                return res.status(202).json({ status: 202., duplicate: true, message: "This model name already exists" });
            }
            else {
                var nerm = await NERMService.createModel(nerm);
                return res.status(202).json({ status: 202, message: "Succesfully Create Model" });
            }
        })
    } catch (e) {
        return res.status(400).json({ status: 400., message: e.message });
    }
}

exports.removeNERM = async function (req, res, next) {

    var id = req.params.id;

    try {
        var deleted = await NERMService.deleteNERM(id)
        return res.status(204).json({ status: 204, message: "Succesfully Todo Deleted" })
    } catch (e) {
        return res.status(400).json({ status: 400, message: e.message })
    }

}

exports.loginNERM = async function (req, res, next) {

    var user = {
        email: req.body.email,
        password: req.body.password,
    }

    var page = req.query.page ? req.query.page : 1;
    var limit = req.query.limit ? req.query.limit : 99999999;

    try {
        var query = NERM.find({ email: nerm.email });
        query.exec(function (err, userDB) {
            console.log(userDB)
            if (err)
                return res.status(400).json({ status: 400., message: err.message });
            else if (userDB) {
                NERMService.loginNERM(user.password, userDB._id, userDB.password)
                    .then((token) => {
                        var usertmp = {
                            email: user.email,
                            token
                        }
                        if (token !== undefined)
                            return res.status(201).json({ status: 201, data: usertmp, message: "Succesfully Login" })
                        else
                            return res.status(201).json({ status: 201, data: usertmp, message: "Wrong password. Try again" })
                    })
                    .catch((err) => {
                        return res.status(201).json({ status: 201, data: err, message: "Login Failed" })
                    });
            }
            else {
                return res.status(202).json({ status: 201, message: "Please create user before login" });
            }
        })

    } catch (e) {

        //Return an Error Response Message with Code and the Error Message.

        return res.status(400).json({ status: 400, message: "Login was Unsuccesfull" })
    }

}

exports.uploadsFile = async function (req, res, next) {
    var userDIR = `${DIR}${req.body.email}`;
    var storage = await NERMService.uploadsFile(userDIR);
    upload = await multer({ storage: storage });
    try {
        upload(req, res, function (err) {
            if (err) {
                return res.status(205).json({ status: 205, message: err.toString() })
            }

            return res.status(205).json({ status: 205, message: "File is uploaded" })
        });

    } catch (e) {
        return res.status(400).json({ status: 400, message: e.message })
    }

}
