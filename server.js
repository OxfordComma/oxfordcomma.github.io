var express = require('express');
var app = express();
var path = require('path');

app.get('/', function(req, res) {
    res.redirect('/music2018');
});

app.get('/music2018', function(req, res) {
	res.sendFile(path.join(__dirname + '/music2018.html'))
})

app.get('/music2017', function(req, res) {
	res.sendFile(path.join(__dirname + '/music2017.html'))
})

app.get('/tree', function(req, res) {
	res.sendFile(path.join(__dirname + '/tree.html'))
})

app.get('/navbar.html', function(req, res) {
	res.sendFile(path.join(__dirname + '/navbar.html'))
})

app.get('/bundle.js', function(req, res) {
    res.sendFile(path.join(__dirname + '/bundle.js'));
});

app.get('/music2018bundle.js', function(req, res) {
    res.sendFile(path.join(__dirname + '/music2018bundle.js'));
});

app.get('/treebundle.js', function(req, res) {
    res.sendFile(path.join(__dirname + '/treebundle.js'));
});

app.get('/data.json', function(req, res) {
    res.sendFile(path.join(__dirname + '/data.json'));
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
