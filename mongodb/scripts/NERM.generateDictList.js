// Genarate Dict-List for NERM-Project
const fs = require('fs');
var config = require('../config.json');

exports.genarateDictList = async function (selectedDict, email, projectName) {
    var path = `${config.DIR}${email}/${projectName}/current_dictlist.txt`;
    return new Promise((resolve, reject) => {

        // var selectedDictsort = selectedDict.sort((a, b) => { return a - b })
        selectedDict.forEach((item, index) => {
            console.log(item)
            generateDictListWithLine(item, index, selectedDict.length - 1, path);
        });

        resolve();
    })
}

async function generateDictListWithLine(item, index, lastItemIndex, path) {
    if (index = lastItemIndex) {
        fs.appendFile(path, `${item}`, 'utf8', (err) => {
            if (err)
                throw err;
        })
    }
    else
        fs.appendFile(path, `${item}\n`, 'utf8', (err) => {
            if (err)
                throw err;
        })
}