// Gettign the Newly created Mongoose Model we just created 
var NERM = require('../models/NERM.model')
var bcrypt = require('bcrypt')

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the To do List
exports.getNERMs = async function (query, page, limit) {

    // Options setup for the mongoose paginate

    var options = {
        page,
        limit
    }

    // Try Catch the awaited promise to handle the error 

    try {
        var nerms = await NERM.paginate(query, options)

        // Return the todod list that was retured by the mongoose promise

        return nerms;

    } catch (e) {

        // return a Error message describing the reason 

        throw Error('Error while Paginating Todos')
    }
}

exports.createNERM = async function (nerm) {
    var newPassword = await hashPassword(nerm.password)
    
    var newNERM = new NERM({
        email: nerm.email,
        password: newPassword,
        date: new Date(),
    })

    // Creating a new Mongoose Object by using the new keyword


    try {

        // Saving the Todo 
        var savedNERM = await newNERM.save()
        console.log(savedNERM)

        return savedNERM;
    } catch (e) {

        // return a Error message describing the reason     
        throw Error("Error while Creating Todo")
    }
}

exports.updateNERM = async function (nerm) {
    var id = nerm.id

    try {
        //Find the old Todo Object by the Id

        var oldNERM = await NERM.findById(id);
    } catch (e) {
        throw Error("Error occured while Finding the Todo")
    }

    // If no old Todo Object exists return false
    if (!oldNERM) {
        return false;
    }

    console.log(oldNERM)

    //Edit the Todo Object
    oldNERM.email = nerm.email
    oldNERM.password = nerm.password

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

async function hashPassword(password) {
    try {
        var hash = bcrypt.hash(password, 10).then(hash => {
            return hash;
        })
    } catch (e) {
        throw Error("And Error occured while hashing Password");
    }

}
