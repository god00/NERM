// Genarate Dict-List for NERM-Project
const fs = require('fs');
var config = require('../config.json');

exports.genarateDictList = async function (selectedDict, email, projectName) {
    var path = `${config.DIR}${email}/${projectName}/current_dictlist.txt`
}