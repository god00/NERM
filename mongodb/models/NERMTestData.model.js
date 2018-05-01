var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')


var NERMSchema = new mongoose.Schema({
    email: String,
    projectName: String,
    modelname: String,
    testData: Array,
    output: String,
    testing: Boolean
}, { collection: 'testdata' })

NERMSchema.plugin(mongoosePaginate)
const NERMTestData = mongoose.model('NERMTestData', NERMSchema)

module.exports = NERMTestData;