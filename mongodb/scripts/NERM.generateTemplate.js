// Genarate Template for NERM-Project
const fs = require('fs');
var config = require('../config.json');

exports.genarateTemplate = function (featureSelection, email, projectName) {
  var count = 0;
  var path = `${config.DIR}${email}/${projectName}/current_template.txt`
  initTemplate(path);
  featureSelection.vocabFeature.forEach(item => {
    if (item.selected) {
      generateTemplateWithLine(item.id, 1, count, path);
    }
  });
  let dictFeature = featureSelection.dictFeature.sort(function (a, b) {
    return a.dictionary - b.dictionary;
  })
  for (let i = 0; i < dictFeature.length; i++) {
    for (let key in dictFeature[i]) {
      if (dictFeature[i][key] == true) {
        generateTemplateWithLine(key, 26 + i, count, path); // 26 is the first index of dict from extract_table 
      }
    }
  }
  addBigram(path);
}

async function generateTemplateWithLine(row, columm, count, path) {
  fs.appendFile(path, `U${count}:%x[${row},${columm}]\n`, 'utf8', (err) => {
    if (err) {
      throw err;
    } else {
      console.log("Template saved : ", `U${count}:%x[${row},${columm}]`);
      ++count;
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
          count++;
        }
      })
    })
  }


}

