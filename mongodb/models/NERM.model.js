var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')


var NERMSchema = new mongoose.Schema({
    email: String,
    date: Date,
    modelname: String,
    corpus: Array,                          // Save path of corpus to arr
    dictionary: Array,                      // Save path of dictionary to arr
    // parameter and more...
}, { collection: 'nerms' })

NERMSchema.plugin(mongoosePaginate)
const NERMModel = mongoose.model('NERMModel', NERMSchema)

module.exports = NERMModel;
