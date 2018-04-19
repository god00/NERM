var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')


var NERMSchema = new mongoose.Schema({
    email: String,
    date: Date,
    projectName: String,
    corpus: Array,                          // Save path of corpus to arr
    selectedDict : Array,
    extractFeature : Array,
    // parameter and more...
}, { collection: 'nerms' })

NERMSchema.plugin(mongoosePaginate)
const NERMProject = mongoose.model('NERMProject', NERMSchema)

module.exports = NERMProject;
