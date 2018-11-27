var express = require('express');
var app = express();
var path = require('path');

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/html/index.html'));
});

app.get('/bundle.js', function(req, res) {
    res.sendFile(path.join(__dirname + '/bundle.js'));
});

app.get('/index.js', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.js'));
});

app.get('/data.json', function(req, res) {
    res.sendFile(path.join(__dirname + '/data/data.json'));
});

app.get('/styles.css', function(req, res) {
    res.sendFile(path.join(__dirname + '/styles.css'));
});

app.get('/js/bootstrap.min.js', function(req, res) {
    res.sendFile(path.join(__dirname + '/js/bootstrap.min.js'));
});

app.get('/css/bootstrap.min.css', function(req, res) {
    res.sendFile(path.join(__dirname + '/css/bootstrap.min.css'));
});

app.listen(3000);
