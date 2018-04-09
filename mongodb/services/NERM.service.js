
// Gettign the Newly created Mongoose Model we just created 
var NERM = require('../models/NERM.model');
var config = require('../config.json');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');


// Saving the context of this module inside the _the variable
_this = this

// Async function to get the To do List
exports.getUsers = async function (query, page, limit) {


    // Options setup for the mongoose paginate

    var options = {
        page,
        limit
    }

    // Try Catch the awaited promise to handle the error 

    try {
        var users = await NERM.paginate(query, options)

        // Return the users list that was retured by the mongoose promise

        return users;

    } catch (e) {

        // return a Error message describing the reason 

        throw Error('Error while Paginating Nerms')
    }
}

exports.createUser = async function (user) {
    var newPassword = await hashPassword(user.password)

    var newUser = new NERM({
        email: user.email,
        password: newPassword,
        date: new Date(),
        models: {}
    })

    // Creating a new Mongoose Object by using the new keyword


    try {

        // Saving the user 
        var savedUser = await newUser.save()
        return savedUser;
    } catch (e) {

        // return a Error message describing the reason     
        throw Error("Error while Creating Todo")
    }
}

exports.updateUser = async function (user) {
    var id = user.id

    try {
        //Find the old Todo Object by the Id

        var oldNERM = await NERM.findById(id);
    } catch (e) {
        throw Error("Error occured while Finding the Todo")
    }

    //Edit the Todo Object
    oldNERM.email = user.email
    oldNERM.password = user.password
    oldNERM.models = user.models

    console.log(oldNERM)

    try {
        var savedNERM = await oldNERM.save()
        return savedNERM;
    } catch (e) {
        throw Error("And Error occured while updating the Todo");
    }
}

exports.deleteNERM = async function (id) {

    // Delete the Todo
    try {
        var deleted = await NERM.remove({ _id: id })
        if (deleted.result.n === 0) {
            throw Error("Todo Could not be deleted")
        }
        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the Todo")
    }
}

exports.loginNERM = async function (password, id, hash) {

    try {

        return new Promise((resolve, reject) => {
            bcrypt.compare(password, hash).then(bool => {
                if (bool) {
                    let token = jwt.sign({ sub: id }, config.secret)
                    console.log(token)
                    resolve(token);
                }
                else {
                    reject();
                }
            })
                .catch(err => {
                    reject();
                })

        })


    }
    catch (e) {
        throw Error("Error Occured while Login")
    }
}

exports.checkEmail = function (email, objsOfArr) {

    var exist = objsOfArr.filter((nerms) =>
        nerms.email === email
    )

    if (exist.length === 0) {
        return true;    // no duplicate
    }
    else {
        return false;   // duplicate
    }
}

function hashPassword(password) {
    try {
        return bcrypt.hash(password, 10).then(hash => {
            return hash;
        })
    } catch (e) {
        throw Error("And Error occured while hashing Password");
    }
}
