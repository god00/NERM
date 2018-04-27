// Genarate Template for NERM-Project
const fs = require('fs');
var config = require('../config.json');

// Counter
var count = 0;

exports.genarateTemplate = function (featureSelection, email, projectName) {
  var path = `${config.templatePath}${email}/${projectName}/current_template.txt`
  try {
    checkDirectory(`${config.templatePath}`).then(() => {
      checkDirectory(`${config.templatePath}${email}`).then(() => {
        checkDirectory(`${config.templatePath}${email}/${projectName}`).then(() => {
          initTemplate(path);
          // genarate vocab template
          featureSelection.vocabFeature.forEach(item => {
            if (item.selected) {
              generateTemplateWithLine(item.id, 1, count, path).then();
            }
          });

          // genarate dict template
          let dictFeature = featureSelection.dictFeature.sort(function (a, b) {
            return a.dictionary - b.dictionary;
          })
          for (let i = 0; i < dictFeature.length; i++) {
            for (let key in dictFeature[i]) {
              if (dictFeature[i][key] == true) {
                generateTemplateWithLine(key, 26 + i, count, path).then(); // 26 is the first index of dictfeature from extract_table 
              }
            }
          }

          // genarate word template
          featureSelection.wordFeature.forEach((item, index) => {
            if (item['0']) {
              generateTemplateWithLine(item.id, 12 + index, count, path).then(); // 12 is the first index of wordfeature from extract_table 
            }
          });

          // genarate advance template
          advanceFeature(path, featureSelection.advanceFeature);

          // add bigram
          addBigram(path);

          return path;
        })
      })
    })

  }
  catch (e) {
    throw Error('Error while genarate template')
  }
}

async function generateTemplateWithLine(row, column, count, path) {
  fs.appendFile(path, `U${count}:%x[${row},${column}]\n`, 'utf8', (err) => {
    if (err) {
      throw err;
    } else {
      console.log("Template saved : ", `U${count}:%x[${row},${column}]`);
      count += 1;
    }
  })
}

async function initTemplate(path) {
  fs.writeFileSync(path, `# Unigram\n`, 'utf8', (err) => {
    if (err) {
      throw err;
    } else {
      console.log(`# Unigram`)
    }
  })
}

async function addBigram(path) {
  fs.appendFile(path, `\n# Bigram\nB`, 'utf8', (err) => {
    if (err) {
      throw err;
    } else {
      console.log(`# Bigram`)
    }
  })
}

function advanceFeature(path, advanceFeature, count) {
  if (advanceFeature.length != 0) {
    advanceFeature.forEach(item => {
      let str = `U${count}:`
      if (item.vocabFeature.length != 0) {
        item.vocabFeature.forEach(vocab => {
          str = `${str}%x[${vocab.id},1]/`
        })
      }
      if (item.dictFeature.length != 0) {
        let dictFeature = item.dictFeature.sort(function (a, b) {
          return a.dictionary - b.dictionary;
        })
        for (let i = 0; i < dictFeature.length; i++) {
          for (let key in dictFeature[i]) {
            if (dictFeature[i][key] == true) {
              str = `${str}%x[${key},${26 + i}]/` // 26 is the first index of dict from extract_table 
            }
          }
        }
      }
      str = `${str.slice(0, -1)}\n`
      fs.appendFile(path, str, 'utf8', (err) => {
        if (err) {
          throw err;
        } else {
          console.log("Template saved : ", str);
          count += 1;
        }
      })
    })
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

