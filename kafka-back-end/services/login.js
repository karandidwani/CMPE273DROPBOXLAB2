var mongo = require("./mongo");
var mongoURL = "mongodb://localhost:27017/dropbox";
var multer = require('multer');
var shell = require('shelljs');
var bcrypt = require('bcrypt');
var fs = require('fs');
var path = require('path');
var glob = require('glob');
var rn = require('random-number');
var session = require('client-sessions');
var options = {
    min: 0,
    max: 10000,
    integer: true
}

function handle_request(msg, callback) {

    var res = {};
    console.log("In handle request:" + JSON.stringify(msg));
    if (msg.type == 'login') {
        mongo.connect(mongoURL, function () {
            console.log('Connected to mongo at: ' + mongoURL);
            var coll = mongo.collection('users');

            coll.findOne({"email": msg.username}, function (err, user) {
                if (bcrypt.compareSync(msg.password, user.password)) {
                    console.log("Data found in database:", user)
                    session.username = msg.username;
                    console.log("Session initialized with username: ", session.username);
                    res.code = "200";
                    res.value = {username: session.username, status: 201};
                    callback(null, res);
                } else {
                    console.log("User Data not found in the database.");
                    res.code = "401";
                    res.value = {message: "Login failed", status: 401};
                    callback(null, res);
                }
            });
        });
    }
    else if (msg.type == 'register') {
        mongo.connect(mongoURL, function () {
            console.log('Connected to mongo at: ' + mongoURL);
            var coll = mongo.collection('users');
            // generating salt.
            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(msg.password, salt);

            coll.insert({
                firstname: msg.firstname,
                lastname: msg.lastname,
                email: msg.email,
                password: hash
            }, function (err, users) {
                if (users) {
                    console.log("data inserted");
                    var folder = "././public/uploads/Userfiles/" + msg.email;

                    fs.mkdir(folder, function (err) {
                        if (!err) {
                            console.log("user folder created");
                            res.code = "200";
                            res.value = {status: 201};
                            callback(null, res);
                        }
                        else {
                            res.code = "401";
                            res.value = {status: 401};
                            callback(null, res);
                        }
                    })

                } else {
                    console.log("User data insertion failed");
                    res.code = "401";
                    res.value = {status: 401};
                    callback(null, res);
                }
            });
        });

    }
    else if (msg.type == 'list') {
        var userPath = session.username;
        var resArr = [];

        glob('public/uploads/Userfiles/' + userPath + '/' + '*', function (er, files) {

            var userPath = session.username;
            var resArr = files.map(function (file) {
                var receivedImage = {};
                console.log('file:', file);
                receivedImage.img = 'uploads/Userfiles/' + userPath + '/' + file.split('/')[4];
                console.log('imgJson.img:', receivedImage.img);
                receivedImage.cols = 2;
                receivedImage.starred = false;
                receivedImage.myfileName = file.toString().split('/')[4];
                return receivedImage;
            });

            console.log('resArr:', resArr);
            var objSession = session.username;
            resObj = {resArray: resArr, objectSession: objSession};

            console.log('resObj:', resObj);
            res.code = "200";
            res.value = resObj;
            callback(null, res);
        });


    }
    else if (msg.type == 'logout') {
        session.username = "";
        console.log('Session destroyed');
        res.code = "200";
        res.value = {message: 'Logout Successful'};
        callback(null, res);
    }
    else if (msg.type == 'createFolder') {
        var userPath = session.username;
        var newFolder = '././public/uploads/Userfiles/' + userPath + '/' + msg.foldername;

        fs.mkdir(newFolder, function (err) {
            if (!err) {
                console.log('Directory created');
                res.code = "200";
                res.value = {message: 'Directory created'};
                callback(null, res);
            }
            else {
                res.code = "401";
                res.value = {message: 'Logout Successful'};
                callback(null, res);
            }
        });
    }
    else if (msg.type == 'createSharedFolder') {
        var userPath = session.username;
        var newSharedFolder = '././public/uploads/Userfiles/' + userPath + '/' + msg.sharedfoldername;
        fs.mkdir(newSharedFolder, function (err) {
            if (!err) {
                console.log('user folder created');
            }
            else {
                console.log('user folder not created');
                res.code = '401';
                res.value = {message: "Shared Folder creation failed"};
                callback(null, res);
            }
        });

        var rand = rn(options);
        console.log(rand);
        // insert data about group into the collection(groups).
        mongo.connect(mongoURL, function () {
            console.log('Connected to mongo at: ' + mongoURL);
            var coll = mongo.collection('groups');

            coll.insert({GID: rand, admin: session.username}, function (err, users) {
                if (users) {
                    console.log("Data inserted");

                } else {
                    console.log("Data Insertion failed");
                }
            });
        });

        mongo.connect(mongoURL, function () {
            console.log('Connected to mongo at: ' + mongoURL);
            var coll = mongo.collection('groupDetails');

            coll.insert({GID: rand, admin: session.username, username: session.username}, function (err, users) {
                if (users) {
                    console.log("Data inserted");

                } else {
                    console.log("Data Insertion failed");
                }
            });
        });

        console.log("listOfUserss shared folder ", msg.listOfUsers);
        var listOfUsers = msg.listOfUsers;
        listOfUserss = listOfUsers.split(',');
        listOfUsers
        for (var i = 0; i < listOfUserss.length; i++) {
            var newSharedFolder = '././public/uploads/Userfiles/' + listOfUserss[i] + '/' + msg.sharedfoldername;
            fs.mkdir(newSharedFolder, function (err) {

                if (!err) {
                    console.log('Directory created');
                    //  res.status(201).end();
                }
                else {
                    res.code = '401';
                    res.value = {message: "not created"};
                    callback(null, res);
                }
            });
        }
        // inserting details about group and its members in groupDetails collection.
        console.log("length of listOfUsers array :  ", listOfUserss.length);
        console.log("contents of listOfUserss array:   ", listOfUserss);


        for (var j = 0; j < listOfUserss.length; j++) {
            mongo.connect(mongoURL, function () {
                console.log('Connected to mongo at: ' + mongoURL);
                var coll = mongo.collection('groupDetails');

                console.log("user deails:--------- ", listOfUserss[j]);

                coll.insert({
                    GID: rand,
                    admin: session.username,
                    username: JSON.stringify(listOfUserss[j])
                }, function (err, users) {
                    if (users) {
                        console.log("Data inserted into the groups collection for group description.");
                    } else {
                        console.log("data insertion error in groups collection.");
                    }
                });
            });
        }
        // logic to insert data into groupDetails ends here.
        res.code = '200';
        res.value = {message: "directory successfully created"};
        callback(null, res);

    }
    else if (msg.type == 'upload') {
        var userPath = session.username;

        var homeDir = '././public/uploads/Userfiles/' + userPath + '/' + msg.filename;
        fs.writeFile(homeDir, msg.data, function (err) {
            if (err) {
                return console.log(err);
            }

            console.log("The file was saved!");
        });

        console.log('Req.body=> backend upload file=>', userPath);

        res.code = "200";
        res.value = {message: "File uploaded"};
        callback(null, res);
    }
    else if (msg.type == "uploader") {
        var obj = shell.ls('../');
        console.log(obj);
        mongo.connect(mongoURL, function () {
            console.log('Connected to mongo at: ' + mongoURL);

            var coll = mongo.collection('files');
            coll.find({}).toArray(function (err, user) {
                if (user) {
                    filelist = user;
                    console.log(filelist);
                    res.code = "200";
                    res.value = {
                        status: 201,
                        files: msg.file,
                        filelist: JSON.parse(JSON.stringify(filelist)),
                        obj: JSON.parse(JSON.stringify(obj))
                    };
                    callback(null, res);
                } else {
                    res.code = "401";
                    res.value = "Failed Check Session";
                    callback(null, res);
                }
            })


        });


    }
    else if (msg.type == "delete") {
        console.log("Deleting file");
        fs.unlinkSync('/Users/Santosh/Downloads/mundhe_Dropbox_Lab_2/kafka-back-end/public/' + msg.delt);

        res.code = "200";
        res.value = {};
        callback(null, res);
    }
}

exports.handle_request = handle_request;