// Genarate Template for NERM-Project
const fs = require('fs');
var config = require('../config.json');

// Counter
var count = 0;

exports.genarateTemplate = async function (featureSelection, email, projectName) {
  var path = `${config.templatePath}${email}/${projectName}/current_template.txt`
  try {
    checkDirectory(`${config.templatePath}`).then(() => {
      checkDirectory(`${config.templatePath}${email}`).then(() => {
        checkDirectory(`${config.templatePath}${email}/${projectName}`).then(async () => {
          initTemplate(path);
          // genarate vocab template
          featureSelection.vocabFeature.forEach(item => {
            if (item.selected) {
              generateTemplateWithLine(item.id, 1, path);
              count += 1;
            }
          });

          // genarate dict template
          let dictFeature = featureSelection.dictFeature.sort(function (a, b) {
            return a.dictionary - b.dictionary;
          })
          for (let i = 0; i < dictFeature.length; i++) {
            for (let key in dictFeature[i]) {
              if (dictFeature[i][key] == true) {
                await generateTemplateWithLine(key, 26 + i, path); // 26 is the first index of dictfeature from extract_table
                count += 1;
              }
            }
          }

          // genarate word template
          featureSelection.wordFeature.forEach((item, index) => {
            if (item['0']) {
              generateTemplateWithLine(0, 12 + index, path) // 12 is the first index of wordfeature from extract_table 
              count += 1;
            }
          });

          // genarate advance template
          await advanceFeature(path, featureSelection.advanceFeature);

          // add bigram
          await addBigram(path);

          return path;
        })
      })
    })

  }
  catch (e) {
    throw Error('Error while genarate template')
  }
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
        }
      })
      count += 1;
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

