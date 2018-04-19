// Accessing the Service that we just created

var NERMService = require('../services/NERM.service')
var NERMProject = require('../models/NERM.model')
var NERMDict = require('../models/NERMDict.model')
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
            var query = NERMProject.find({ email: req.param('email') });
            query.exec(async function (err, items) {
                if (err) {
                    return res.status(400).json({ status: 400, message: err });
                }
                else if (items) {
                    return res.status(200).json({ status: 200, data: items, message: "Succesfully nermsdb Recieved" });
                }
                else {
                    return res.status(200).json({ status: 200, message: "No Project in database" });
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
                return res.status(400).json({ status: 400., message: err });
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
        return res.status(400).json({ status: 400, message: "Project Creation was Unsuccesfull" });
    }
}

exports.createProject = async function (req, res, next) {

    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 99999999;

    var nerm = {
        email: req.body.email,
        projectName: req.body.projectName,
        date: req.body.date,
        selectedDict: req.body.selectedDict,
        corpus: req.body.corpus
    }

    try {
        var query = NERMProject.findOne({ email: nerm.email, projectName: nerm.projectName });
        query.exec(async function (err, project) {
            if (err)
                return res.status(400).json({ status: 400., message: err });
            else if (project) {
                return res.status(202).json({ status: 202., duplicate: true, message: "This project name already exists" });
            }
            else {
                var nermTmp = await NERMService.createProject(nerm);
                return res.status(202).json({ status: 202, message: "Succesfully Create Project" });
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
        //     checkDirectory(DIR + req.body.email[0] + '/' + req.body.projectName[0]);
        // });
        if (req.body.mode == 'dictionary') {
            var storage = await multer.diskStorage({
                destination: function (req, file, cb) {
                    cb(null, `${DIR}${req.body.email}/dictionary`)
                },
                filename: function (req, file, cb) {
                    cb(null, file.originalname)
                }
            });
        }
        else {
            var storage = await multer.diskStorage({
                destination: function (req, file, cb) {
                    cb(null, `${DIR}${req.body.email}/${req.body.projectName}/${req.body.mode}`)
                },
                filename: function (req, file, cb) {
                    cb(null, file.originalname)
                }
            });
        }
        var upload = multer({ storage: storage }).any();
        upload(req, res, async function (err) {
            checkDirectory(DIR + req.body.email)
                .then(() => {
                    if (req.body.mode == 'dictionary') {
                        checkDirectory(DIR + req.body.email + '/' + req.body.mode)
                            .then(() => {
                                console.log('uploading...')
                                if (err) {
                                    console.log(err.toString())
                                    return res.status(400).json({ status: 400, message: err.toString() })
                                }
                                var query = NERMDict.findOne({ email: req.body.email });
                                query.exec(async function (err, dictionary) {
                                    if (err) {
                                        return res.status(400).json({ status: 400., message: err });
                                    }
                                    if (dictionary) {
                                        var mode = req.body.mode;
                                        var p = `${path.dirname(process.cwd())}/storage/uploads/${req.body.email}/${req.body.mode}/${req.files[0].originalname}`
                                        if (dictionary[mode].indexOf(p) == -1) {    //check if for no duplication path file in db
                                            dictionary[mode].push(p);
                                        }
                                        NERMService.updateDict(dictionary);
                                        return res.status(201).json({ status: 201, message: "File is uploaded" });
                                    }
                                })
                            })
                    }
                    else {
                        checkDirectory(DIR + req.body.email + '/' + req.body.projectName)
                            .then(() => {
                                checkDirectory(DIR + req.body.email + '/' + req.body.projectName + '/' + req.body.mode)
                                    .then(() => {
                                        console.log('uploading...')
                                        if (err) {
                                            console.log(err.toString())
                                            return res.status(400).json({ status: 400, message: err.toString() })
                                        }
                                        var query = NERMProject.findOne({ email: req.body.email, projectName: req.body.projectName });
                                        query.exec(async function (err, project) {
                                            if (err) {
                                                return res.status(400).json({ status: 400., message: err });
                                            }
                                            else if (project) {
                                                var mode = req.body.mode;
                                                var p = `${path.dirname(process.cwd())}/storage/uploads/${req.body.email}/${req.body.projectName}/${req.body.mode}/${req.files[0].originalname}`
                                                // if (mode == 'corpus') {
                                                //     var data = runPython(p)
                                                //     console.log("test data : ", data.toString('utf8'))
                                                // }
                                                if (project[mode].indexOf(p) == -1) {    //check if for no duplication path file in db
                                                    project[mode].push(p);
                                                }
                                                NERMService.updateProject(project);
                                                return res.status(201).json({ status: 201, message: "File is uploaded" });
                                            }
                                            else {
                                                return res.status(204).json({ status: 204, message: "Please create project before upload" });
                                            }
                                        })

                                    })




                            })
                    }
                })
        });
    } catch (e) {
        return res.status(400).json({ status: 400, message: e.message })
    }

}

exports.getProject = async function (req, res, next) {
    try {
        var query = NERMProject.findOne({ email: req.param('email'), projectName: decodeURI(req.param('projectName')) });
        query.exec(async function (err, project) {
            if (err) {
                return res.status(400).json({ status: 400, message: err });
            }
            else if (project) {
                let data = project;
                await getDictByUser(data.email)
                    .then(async (dictionary) => {
                        console.log(dictionary)
                        data['dictionary'] = dictionary;
                        await beforeSendToFront(data);
                        return res.status(200).json({ status: 200, data: data, message: "Succesfully nermsdb Recieved" });
                    })
                    .catch(err => {
                        return res.status(200).json({ status: 200, message: "Cannot found dictionary. Please create new project" });
                    })
            }
            else {
                return res.status(200).json({ status: 200, message: "Please create project first" });
            }
        })
    } catch (e) {
        return res.status(400).json({ status: 400, message: e.message });
    }
}

exports.updateProject = async function (req, res, next) {
    try {
        var query = NERMProject.findOne({ email: req.body.email, projectName: decodeURI(req.body.projectName) });
        query.exec(async function (err, project) {
            if (err) {
                return res.status(400).json({ status: 400, message: err });
            }
            else if (project) {
                let selectedDict = await req.body.selectedDict.map(item => { return item.fileName })
                await getDictByUser(data.email)
                    .then(async (dictionary) => {
                        console.log(dictionary)
                        project['dictionary'] = dictionary;
                        await beforeSendToFront(data);
                        addPathsFromFileNames(selectedDict, project.dictionary)
                            .then((pathsList) => {
                                project['selectedDict'] = pathsList;
                                NERMService.updateProject(project);
                                beforeSendToFront(project).then(data => {
                                    if (data)
                                        return res.status(201).json({ status: 201, data: data, message: `${decodeURI(req.body.projectName)} Updated` });
                                })
                            })
                    })
                    .catch(err => {
                        return res.status(200).json({ status: 200, message: "Cannot found dictionary. Please create new project" });
                    })
            }
            else {
                return res.status(204).json({ status: 204, message: "Please create project first" });
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
        var query = NERMProject.findOne({ _id: id });
        query.exec(async function (err, project) {
            if (err) {
                return res.status(400).json({ status: 400, message: err });
            }
            else if (project) {
                var list = []
                matchFileNameFromPathsToArr(filename, project.corpus, list)
                    .then(() => {
                        if (list.length != 0) {
                            project.corpus.map((corpusPath, index) => {
                                if (corpusPath == list[0]) {
                                    project.corpus.splice(index, 1);
                                }
                            })
                            deleteFile(list[0]).then(() => {
                                NERMService.updateProject(project)
                                beforeSendToFront(project).then(project => {
                                    if (project)
                                        return res.status(200).json({ status: 200, corpus: project.corpus, message: `${filename} was deleted from database & storage` });
                                })
                            }).catch((err) => {
                                return res.status(204).json({ status: 204, corpus: project.corpus, message: `ERROR: While delete ${filename}` });
                            })
                        }
                        else {
                            return res.status(204).json({ status: 204, corpus: project.corpus, message: `ERROR: Cannot found ${filename}` });
                        }
                    })
            }
            else {
                return res.status(204).json({ status: 204, message: "Please create project first" });
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

async function beforeSendToFront(project) {
    if (project.dictionary.length != 0) {
        await getDataFromPaths(project.dictionary).then(item => {
            project.dictionary = item
        })
    }
    if (project.corpus.length != 0) {
        await getDataFromPaths(project.corpus).then(item => {
            project.corpus = item
        })
    }
    if (project.selectedDict.length != 0) {
        await getDataFromPaths(project.selectedDict).then(item => {
            project.selectedDict = item
        })
    }
    return project;
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

async function getDictByUser(email) {
    return new Promise((resolve, reject) => {
        var query = NERMDict.findOne({ email: email });
        query.exec(async function (err, dictionary) {
            if (err) {
                reject(err);
            }
            else if (dictionary) {
                resolve(dictionary);
            }
            else {
                reject();
            }
        })
    })
}


function getFileName(fullpath) {
    let fileName = fullpath.split('/')
    return fileName[fileName.length - 1];
}
