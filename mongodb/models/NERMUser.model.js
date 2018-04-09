var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')


var NERMSchema = new mongoose.Schema({
    email: String,
    password: String,
    date: Date,
}, { collection: 'users' })

NERMSchema.plugin(mongoosePaginate)
const NERM = mongoose.model('User', NERMSchema)

module.exports = NERM;