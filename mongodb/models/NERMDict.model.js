var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')


var NERMSchema = new mongoose.Schema({
    email: String,
    dictionary: Array,
}, { collection: 'dictionary' })

NERMSchema.plugin(mongoosePaginate)
const NERMDict = mongoose.model('NERMDict', NERMSchema)

module.exports = NERMDict;