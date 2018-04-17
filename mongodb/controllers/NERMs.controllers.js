// Accessing the Service that we just created

var NERMService = require('../services/NERM.service')
var NERMModel = require('../models/NERM.model')
var NERM = require('../models/NERMUser.model')
var config = require('../config.json');
var multer = require('multer');
var fs = require('fs');
var path = require('path')
// var PythonShell = require('python-shell');
const { spawn } = require('child_process');

var DIR = `${config.DIR}`;
var extractScriptPath = config.extractScriptPath;

// Saving the context of this module inside the _the variable

_this = this


// Async Controller function to get the To do List

exports.getItems = async function (req, res, next) {
    // Check the existence of the query parameters, If the exists doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 99999999;

    try {
        if (req.param('collections') == 'nerms') {
            var query = NERMModel.find({ email: req.param('email') });
            query.exec(async function (err, items) {
                if (err) {
                    return res.status(400).json({ status: 400, message: err.message });
                }
                else if (items) {
                    return res.status(200).json({ status: 200, data: items, message: "Succesfully nermsdb Recieved" });
                }
                else {
                    return res.status(200).json({ status: 200, message: "No model in database" });
                }
            })
        }
        else {
            var items = await NERMService.getItemFromDB({}, page, limit, req.param('collections'));
            return res.status(200).json({ status: 200, data: items, message: "Succesfully nermsdb Recieved" });
        }
        // Return the todos list with the appropriate HTTP Status Code and Message.



    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.

        return res.status(400).json({ status: 400, message: e.message });

    }
}

exports.createUser = async function (req, res, next) {

    // Req.Body contains the form submit values.
    var user = {
        email: req.body.email,
        password: req.body.password,
    }

    var page = req.query.page ? req.query.page : 1;
    var limit = req.query.limit ? req.query.limit : 99999999;

    try {
        // Calling the Service function with the new object from the Request Body
        var query = NERM.findOne({ email: user.email });
        query.exec(async function (err, userDB) {
            if (err)
                return res.status(400).json({ status: 400., message: err.message });
            else if (userDB) {
                return res.status(201).json({ status: 201, data: false, message: "This user already exists" })
            }
            else {
                var createdNERM = await NERMService.createUser(user)
                return res.status(201).json({ status: 201, data: true, message: "Succesfully Created User" })
            }
        })
    } catch (e) {

        //Return an Error Response Message with Code and the Error Message.
        return res.status(400).json({ status: 400, message: "Model Creation was Unsuccesfull" });
    }
}

exports.createModel = async function (req, res, next) {

    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 99999999;

    var nerm = {
        email: req.body.email,
        ModelName: req.body.modelName,
        date: req.body.date,
        dictionary: req.body.dictionary,
        corpus: req.body.corpus
    }

    try {
        var query = NERMModel.findOne({ email: nerm.email, ModelName: nerm.ModelName });
        query.exec(async function (err, model) {
            if (err)
                return res.status(400).json({ status: 400., message: err.message });
            else if (model) {
                return res.status(202).json({ status: 202., duplicate: true, message: "This model name already exists" });
            }
            else {
                var nermTmp = await NERMService.createModel(nerm);
                return res.status(202).json({ status: 202, message: "Succesfully Create Model" });
            }
        })
    } catch (e) {
        return res.status(400).json({ status: 400., message: e.message });
    }
}

exports.removeNERM = async function (req, res, next) {

    var id = req.params.id;

    try {
        var deleted = await NERMService.deleteNERM(id)
        return res.status(204).json({ status: 204, message: "Succesfully User Deleted" })
    } catch (e) {
        return res.status(400).json({ status: 400, message: e.message })
    }

}

exports.loginNERM = async function (req, res, next) {
    try {
        await NERM.findOne({ email: req.body.email }, async function (err, userDB) {
            if (err) {
                return res.status(400).json({ status: 400., message: err.message });
            }
            else if (userDB) {
                NERMService.loginNERM(req.body.password, userDB._id, userDB.password)
                    .then((token) => {
                        var usertmp = {
                            email: req.body.email,
                            token
                        }
                        if (token !== undefined)
                            return res.status(201).json({ status: 201, data: usertmp, message: "Succesfully Login" })
                        else
                            return res.status(201).json({ status: 201, data: usertmp, message: "Wrong password. Try again" })
                    })
                    .catch((err) => {
                        return res.status(400).json({ status: 400, data: err, message: "Login Failed" })
                    });
            }
            else {
                return res.status(201).json({ status: 201, message: "Please create user before login" });
            }
        });

    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.

        return res.status(400).json({ status: 400, message: "Login as unsuccesfull" })
    }

}

exports.uploadsFile = async function (req, res, next) {
    try {
        // var test = await multer({}).any();
        // await test(req, res, function (err) {
        //     if (err) {
        //         return res.status(400).json({ status: 400, message: err.toString() })
        //     }

        //     checkDirectory(DIR + req.body.email[0]);
        //     checkDirectory(DIR + req.body.email[0] + '/' + req.body.modelName[0]);
        // });

        var storage = await multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, `${DIR}${req.body.email}/${req.body.modelName}/${req.body.mode}`)
            },
            filename: function (req, file, cb) {
                cb(null, file.originalname)
            }
        })
        var upload = multer({ storage: storage }).any();
        upload(req, res, async function (err) {
            checkDirectory(DIR + req.body.email)
                .then(() => {
                    checkDirectory(DIR + req.body.email + '/' + req.body.modelName)
                        .then(() => {
                            checkDirectory(DIR + req.body.email + '/' + req.body.modelName + '/' + req.body.mode)
                                .then(() => {
                                    console.log('uploading...')
                                    if (err) {
                                        console.log(err.toString())
                                        return res.status(400).json({ status: 400, message: err.toString() })
                                    }
                                    var query = NERMModel.findOne({ email: req.body.email, ModelName: req.body.modelName });
                                    query.exec(async function (err, model) {
                                        if (err) {
                                            return res.status(400).json({ status: 400., message: err.message });
                                        }
                                        else if (model) {
                                            var mode = req.body.mode;
                                            var p = `${path.dirname(process.cwd())}/storage/uploads/${req.body.email}/${req.body.modelName}/${req.body.mode}/${req.files[0].originalname}`
                                            if (mode == 'corpus') {
                                                var data = runPython(p)
                                                console.log("test data : ", data.toString('utf8'))
                                            }
                                            if (model[mode].indexOf(p) == -1) {    //check if for no duplication path file in db
                                                model[mode].push(p);
                                                // if (mode == 'corpus') {
                                                //     options.args.push(p);
                                                //     PythonShell.run('/extract_feature/extract_features.py', options, function (err, results) {
                                                //         console.log('if')
                                                //         if (err) {
                                                //             console.log(err)
                                                //             return res.status(204).json({ status: 204, message: "ERROR: Please check your corpus" });
                                                //         }
                                                //         // results is an array consisting of messages collected during execution
                                                //         console.log('results: %j', results);
                                                //         options.args = [];
                                                //     });
                                                // }
                                            }
                                            NERMService.updateModel(model);
                                            return res.status(201).json({ status: 201, message: "File is uploaded" });
                                        }
                                        else {
                                            return res.status(204).json({ status: 204, message: "Please create model before upload" });
                                        }
                                    })

                                })

                        })
                })
        });
    } catch (e) {
        return res.status(400).json({ status: 400, message: e.message })
    }

}

exports.getModel = async function (req, res, next) {
    try {
        var query = NERMModel.findOne({ email: req.param('email'), ModelName: decodeURI(req.param('modelName')) });
        query.exec(async function (err, model) {
            if (err) {
                return res.status(400).json({ status: 400, message: err.message });
            }
            else if (model) {
                let data = await beforeSendToFront(model)
                return res.status(200).json({ status: 200, data: data, message: "Succesfully nermsdb Recieved" });
            }
            else {
                return res.status(200).json({ status: 200, message: "Please create model first" });
            }
        })
    } catch (e) {
        return res.status(400).json({ status: 400, message: e.message });
    }
}

exports.updateModel = async function (req, res, next) {
    try {
        var query = NERMModel.findOne({ email: req.body.email, ModelName: decodeURI(req.body.modelName) });
        query.exec(async function (err, model) {
            if (err) {
                return res.status(400).json({ status: 400, message: err.message });
            }
            else if (model) {
                let selectedDict = await req.body.selectedDict.map(item => { return item.fileName })
                addPathsFromFileNames(selectedDict, model.dictionary)
                    .then((pathsList) => {
                        model['selectedDict'] = pathsList;
                        NERMService.updateModel(model);
                        beforeSendToFront(model).then(data => {
                            if (data)
                                return res.status(201).json({ status: 201, data: data, message: `${decodeURI(req.body.modelName)} Updated` });
                        })
                    })
            }
            else {
                return res.status(204).json({ status: 204, message: "Please create model first" });
            }
        })

    } catch (e) {
        return res.status(400).json({ status: 400, message: e.message });
    }
}

exports.removeCorpus = async function (req, res, next) {

    var id = req.params.id;
    var filename = req.param('fileName')

    try {
        var query = NERMModel.findOne({ _id: id });
        query.exec(async function (err, model) {
            if (err) {
                return res.status(400).json({ status: 400, message: err.message });
            }
            else if (model) {
                var list = []
                matchFileNameFromPathsToArr(filename, model.corpus, list)
                    .then(() => {
                        if (list.length != 0) {
                            model.corpus.map((corpusPath, index) => {
                                if (corpusPath == list[0]) {
                                    model.corpus.splice(index, 1);
                                }
                            })
                            deleteFile(list[0]).then(() => {
                                NERMService.updateModel(model)
                                beforeSendToFront(model).then(model => {
                                    if (model)
                                        return res.status(200).json({ status: 200, corpus: model.corpus, message: `${filename} was deleted from database & storage` });
                                })
                            }).catch((err) => {
                                return res.status(204).json({ status: 204, corpus: model.corpus, message: `ERROR: While delete ${filename}` });
                            })
                        }
                        else {
                            return res.status(204).json({ status: 204, corpus: model.corpus, message: `ERROR: Cannot found ${filename}` });
                        }
                    })
            }
            else {
                return res.status(204).json({ status: 204, message: "Please create model first" });
            }
        })
    } catch (e) {
        return res.status(400).json({ status: 400, message: e.message })
    }

}

async function addPathsFromFileNames(fileNames, paths) {
    return new Promise((resolve, reject) => {
        let promise = [];
        let pathsList = [];
        for (let fileName of fileNames) {
            promise.push(matchFileNameFromPathsToArr(fileName, paths, pathsList));
        }
        Promise.all(promise).then(() => {
            resolve(pathsList)
        })
    })
}

async function matchFileNameFromPathsToArr(fileName, paths, pathsList) {
    return new Promise((resolve, reject) => {
        paths.forEach(path => {
            let filename = path.split('/');
            filename = filename[filename.length - 1]
            if (filename == fileName) {
                pathsList.push(path);
                resolve();
            }
        })
    });
}

async function checkDirectory(directory) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory);
        }
        resolve();
    })
}

async function deleteFile(directory) {
    return new Promise((resolve, reject) => {
        fs.unlink(directory, (err) => {
            if (err) {
                reject(err)
            }
            else {
                console.log(directory + ' was deleted');
                resolve()
            }
        });

    })
}

async function getDataFromPaths(paths) {
    return new Promise((resolve, reject) => {
        let files = [];
        let promise = [];
        for (let filePath of paths) {
            promise.push(readFile(filePath, files));
        }
        Promise.all(promise).then(() => {
            resolve(files)
        })
    })
}

async function readFile(filePath, files) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, { encoding: 'utf-8' }, async function (err, data) {
            if (!err) {
                // console.log('received data: ' + data);
                let dataObj = {
                    data: data,
                    fileName: await getFileName(filePath)
                }
                await files.push(dataObj)
                resolve()
            } else {
                // files.push('ERROR : cannot read this' + filePath)
                // console.log(err);
                resolve()
            }
        });
    }
    )
}

async function beforeSendToFront(model) {
    if (model.dictionary.length != 0) {
        await getDataFromPaths(model.dictionary).then(item => {
            model.dictionary = item
        })
    }
    if (model.corpus.length != 0) {
        await getDataFromPaths(model.corpus).then(item => {
            model.corpus = item
        })
    }
    if (model.selectedDict.length != 0) {
        await getDataFromPaths(model.selectedDict).then(item => {
            model.selectedDict = item
        })
    }
    return model;
}

async function runPython(filePath) {
    const py = spawn('python', [extractScriptPath, filePath]);
    await py.stdout.on('data', (data) => {
        // console.log(`stdout: ${data}`);
        return data
    });

    // await py.stderr.on('data', (data) => {
    //     console.log(`stderr: ${data}`);
    //     return (data)
    // });

    await py.on('exit', (code) => {
        console.log(`child process exited with code ${code}`);
        py.kill()
    });
}



function getFileName(fullpath) {
    let fileName = fullpath.split('/')
    return fileName[fileName.length - 1];
}
