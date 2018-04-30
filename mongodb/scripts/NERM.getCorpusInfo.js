// Get corpus info 
const fs = require('fs');
var path = require('path')

exports.getCorpusInfo = async function (project, modelname) {
    return new Promise((resolve, reject) => {
        filePath = `${path.dirname(process.cwd())}/storage/uploads/${project.email}/${project.projectName}/corpus_info.txt`
        fs.readFile(filePath, { encoding: 'utf-8' }, async function (err, data) {
            if (!err) {
                str = data;
                rows = str.split('\n');
                rows.splice(-1, 1);
                vocabcount = (rows.splice(0, 1))[0];
                tags = []
                rows.forEach(row => {
                    tags.push(row);
                });
                resolve({ vocabcount, tags });
            } else {
                reject();
            }
        })
    })

}