var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')


var NERMSchema = new mongoose.Schema({
    email: String,
    date: Date,
    modelname: String,
    corpus: Object[],
    dictionary: Object[],
    // parameter and more...
}, { collection: 'nerms' })

NERMSchema.plugin(mongoosePaginate)
const NERMModel = mongoose.model('Model', NERMSchema)

module.exports = NERMModel;
