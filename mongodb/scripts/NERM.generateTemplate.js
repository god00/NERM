// Genarate Template for NERM-Project
const fs = require('fs');
var config = require('../config.json');

// Counter
var count = 0;

exports.genarateTemplate = async function (featureSelection, email, projectName) {
  var path = `${config.templatePath}${email}/${projectName}/current_template.txt`
  return new Promise((resolve, reject) => {
    try {
      checkDirectory(`${config.templatePath}`).then(() => {
        checkDirectory(`${config.templatePath}${email}`).then(() => {
          checkDirectory(`${config.templatePath}${email}/${projectName}`).then(() => {
            initTemplate(path);
            // genarate vocab template
            featureSelection.vocabFeature.forEach(item => {
              if (item.selected) {
                var id = returnVocabIndexFromTable(item.id)
                generateTemplateWithLine(0, id, path);
                count += 1;
              }
            });

            // genarate dict template
            // let dictFeature = featureSelection.dictFeature.sort(function (a, b) {
            //   return a.dictionary - b.dictionary;
            // })
            for (let i = 0; i < featureSelection.dictFeature.length; i++) {
              for (let key in featureSelection.dictFeature[i]) {
                if (featureSelection.dictFeature[i][key] == true) {
                  generateTemplateWithLine(key, 18 + i, path); // 18 is the first index of dictfeature from extract_table (start from common dict)
                  count += 1;
                }
              }
            }

            // genarate word template
            featureSelection.wordFeature.forEach((item, index) => {
              if (item['0']) {
                generateTemplateWithLine(0, 12 + index, path) // 12 is the first index of wordfeature from extract_table (start from alphanum)
                count += 1;
              }
            });

            // genarate advance template
            advanceFeature(path, featureSelection.advanceFeature);

            // add bigram
            addBigram(path);

            resolve(path);
          })
        })
      })
    }
    catch (e) {
      reject(Error('Error while genarate template'));
    }
  })
}

async function generateTemplateWithLine(row, column, path) {
  fs.appendFile(path, `U${count}:%x[${row},${column}]\n`, 'utf8', (err) => {
    if (err)
      throw err;
  })
}

function initTemplate(path) {
  fs.writeFile(path, `# Unigram\n`, 'utf8', (err) => {
    if (err) {
      throw err;
    } else {
    }
  })
}

function addBigram(path) {
  fs.appendFile(path, `\n# Bigram\nB`, 'utf8', (err) => {
    if (err) {
      throw err;
    } else {
      count = 0;
    }
  })
}

function advanceFeature(path, advanceFeature) {
  if (advanceFeature.length != 0) {
    advanceFeature.forEach(item => {
      let str = `U${count}:`
      if (item.vocabFeature.length != 0) {
        item.vocabFeature.forEach(id => {
          var _id = returnVocabIndexFromTable(id);
          str = `${str}%x[0,${_id}]/`
        })
      }
      if (item.dictFeature.length != 0) {
        item.dictFeature.forEach(obj => {
          str = `${str}%x[${obj.row},${Number(obj.column) + 18}]/`; // 18 is the first index of dictfeature from extract_table (start from common dict)
        })
      }
      if (item.wordFeature.length != 0) {
        item.wordFeature.forEach(obj => {
          str = `${str}%x[${obj.row},${Number(obj.column) + 12}]/`; // 12 is the first index of wordfeature from extract_table (start from alphanum)
        })
      }
      // if (item.dictFeature.length != 0) {
      //   for (let i = 0; i < item.dictFeature.length; i++) {
      //     for (let key in item.dictFeature[i]) {
      //       if (item.dictFeature[i][key] == true) {
      //         str = `${str}%x[${key},${18 + i}]/` // 18 is the first index of dictfeature from extract_table (start from common dict)
      //       }
      //     }
      //   }
      // }
      // if (item.wordFeature.length != 0) {
      //   item.wordFeature.forEach((item, index) => {
      //     if (item['0']) {
      //       str = `${str}%x[${0},${12 + index}]/`  // 12 is the first index of wordfeature from extract_table (start from alphanum)
      //     }
      //   })
      // }
      str = `${str.slice(0, -1)}\n`;
      fs.appendFile(path, str)
      count += 1;
    })
  }
}

function returnVocabIndexFromTable(id) {
  if (id <= 0) {
    return 1 + Math.abs(id);        // 1 is the first index of vocab from extract_table (start from W0)
  }
  else {
    return 7 + id;                  // 7 is the first index of vocab from extract_table (start from W+1)
  }
}

async function checkDirectory(directory) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory);
    }
    resolve();
  })
}

