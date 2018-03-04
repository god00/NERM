// Accessing the Service that we just created

var NERMService = require('../services/NERM.service')

// Saving the context of this module inside the _the variable

_this = this


// Async Controller function to get the To do List

exports.getNERM = async function (req, res, next) {

    // Check the existence of the query parameters, If the exists doesn't exists assign a default value

    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 99999999;

    try {

        var nerms = await NERMService.getNERMs({}, page, limit)

        // Return the todos list with the appropriate HTTP Status Code and Message.

        return res.status(200).json({ status: 200, data: nerms, message: "Succesfully nermsdb Recieved" });

    } catch (e) {

        //Return an Error Response Message with Code and the Error Message.

        return res.status(400).json({ status: 400, message: e.message });

    }
}

exports.createNERM = async function (req, res, next) {

    // Req.Body contains the form submit values.

    var user = {
        email: req.body.email,
        password: req.body.password,
    }

    var page = req.query.page ? req.query.page : 1;
    var limit = req.query.limit ? req.query.limit : 99999999;

    try {
        // Calling the Service function with the new object from the Request Body
        var nerms = await NERMService.getNERMs({}, page, limit);
        var NERMsList = nerms.docs;
        console.log("before user.email")
        console.log(user.email)
        console.log(NERMService.checkEmail(user.email, NERMsList))
        if (await NERMService.checkEmail(user.email, NERMsList)) {
            var createdNERM = await NERMService.createNERM(user)
            return res.status(201).json({ status: 201, data: true, message: "Succesfully Created User" })
        }
        else {
            return res.status(400).json({ status: 400, data: false, message: "This user already exists" })
        }


    } catch (e) {

        //Return an Error Response Message with Code and the Error Message.
        return res.status(400).json({ status: 400, message: "User Creation was Unsuccesfull" })
    }
}

exports.updateNERM = async function (req, res, next) {

    // Id is necessary for the update

    if (!req.body._id) {
        return res.status(400).json({ status: 400., message: "Id must be present" })
    }

    var id = req.body._id;

    console.log(req.body)

    var nerm = {
        id,
        email: req.body.email ? req.body.email : null,
        password: req.body.password ? req.body.password : null,
    }

    try {
        var updatedNERM = await NERMService.updateNERM(nerm)
        return res.status(200).json({ status: 200, data: updatedNERM, message: "Succesfully Updated NERM" })
    } catch (e) {
        return res.status(400).json({ status: 400., message: e.message })
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
        var nerms = await NERMService.getNERMs({}, page, limit);
        var NERMsList = nerms.docs;
        var hash = await NERMsList.filter((nerms) =>
            nerms.email === user.email
        )
        // Calling the Service function with the new object from the Request Body

        NERMService.loginNERM(user.password, hash[0].password)
            .then((status) => {
                return res.status(201).json({ status: 201, data: status, message: "Succesfully Login" })
            })
            .catch((err) => {
                return res.status(201).json({ status: 201, data: err, message: "Login Failed" })
            });

    } catch (e) {

        //Return an Error Response Message with Code and the Error Message.

        return res.status(400).json({ status: 400, message: "Login was Unsuccesfull" })
    }

}
