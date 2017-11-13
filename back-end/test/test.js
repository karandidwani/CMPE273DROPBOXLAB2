var assert = require('assert');
var request = require('request');

describe('Login test', function () {
    describe('login', function () {
        it('Wrong username and Password', function () {

            request.post({
                url: 'http://localhost:3001/login',
                form: {username: 'fifthuser', password: 'fifthuser'}
            }, function (err, httpResponse, body) {
                assert.equal(response.message, 'TEST Successful');
            })
        });

        it('Check for incorrect Password', function () {

            request.post({
                url: 'http://localhost:3001/login',
                form: {username: 'fifthuser', password: 'fifthuserWrong'}
            }, function (err, httpResponse, body) {
                assert.equal(response.error, 'Incorrect PASSWORD')
            })
        });

    });

    describe('signup', function () {
        it('Check User Integrity', function () {

            request.post({
                    url: 'http://localhost:3001/signup', form: {
                        username: 'fifthuser',
                        password: 'fifthuser',
                        firstname: 'fifthuser',
                        lastname: 'fifthuser'
                    }
                },
                function (err, httpResponse, body) {
                    assert.equal(response.data.error.error, 'User data EXISTS in the database')
                })
        });

    });
});

describe('Files test', function () {
    describe('file upload', function () {
        it('should return success on file upload', function () {
            var fs = require("fs");
            var request = require("request");

            var options = {
                method: 'POST',
                url: 'http://localhost:3001/uploadfile',
                headers:
                    {
                        'postman-token': '46160068-c588-3cb5-a77e-9b1e4f2e9fad',
                        'cache-control': 'no-cache',
                        'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
                    },
                formData: {
                        username: 'fifthuser',
                        path: 'fifthuser',
                        file: {
                                value: 'fs.createReadStream("/Users/fifthuser@gmail.com/Assignment2 CMPE 283 SS.png")',
                                options:
                                    {
                                        filename: '/Users/fifthuser@gmail.com/Assignment2 CMPE 283 SS.png',
                                        contentType: null
                                    }
                            }
                    }
            };

            request(options, function (error, response, body) {
                assert.equal(body.message, "Success");
            });

        });


        it('should not process without file', function () {
            var fs = require("fs");
            var request = require("request");
            var options = {
                method: 'POST',
                url: 'http://localhost:3001/uploadfile',
                headers: {
                        'postman-token': '46160068-c588-3cb5-a77e-9b1e4f2e9fad',
                        'cache-control': 'no-cache',
                        'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'},
                formData: {
                        username: 'fifthuser',
                        path: 'fifthuser',
                        file: {
                                value: 'fs.createReadStream("/Users/fifthuser@gmail.com/Assignment2 CMPE 283 SS.png")',
                                options:
                                    {}}}};

            request(options, function (error, response, body) {
                assert.equal(body.Message, "");
            });});});


});