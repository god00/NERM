var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')


var NERMSchema = new mongoose.Schema({
    email: String,
    password: String,
    date: Date,
    models: Object,
}, { collection: 'users' })

NERMSchema.plugin(mongoosePaginate)
const NERM = mongoose.model('NERM', NERMSchema)

module.exports = NERM;
