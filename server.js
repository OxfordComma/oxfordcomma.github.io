var express = require('express');
var app = express();
var path = require('path');

var router = express.Router();

app.get('/', function(req, res) {
    res.redirect('/music2018');
});

// musicYearController = require('musicviz/controllers/musicYearController.js')
// guitarTabImporterController = require('guitarTabImporter/controllers/guitarTabImporterController.js')

app.get('/guitartabimporter', function(req, res) {
    res.sendFile(path.join(__dirname + '/guitartabimporter/guitartabimporter.html'))
})

app.get('/guitartabimporter/styles.css', function(req, res) {
    res.sendFile(path.join(__dirname + '/guitartabimporter/styles.css'))
})

app.get('/guitartabimporter/import.js', function(req, res) {
    res.sendFile(path.join(__dirname + '/guitartabimporter/import.js'))
})

app.get('/music2019', function(req, res) {
    res.sendFile(path.join(__dirname + '/musicviz/music2019.html'))
})

app.get('/music2018', function(req, res) {
    res.sendFile(path.join(__dirname + '/musicviz/music2018.html'))
})

app.get('/music2017', function(req, res) {
    res.sendFile(path.join(__dirname + '/musicviz/music2017.html'))
})

app.get('/music2016', function(req, res) {
    res.sendFile(path.join(__dirname + '/musicviz/music2016.html'))
})

app.get('/music2015', function(req, res) {
    res.sendFile(path.join(__dirname + '/musicviz/music2015.html'))
})

app.get('/stackedAreaVertical.js', function(req, res) {
    res.sendFile(path.join(__dirname + '/musicviz/stackedAreaVertical.js'))
})

app.get('/tree', function(req, res) {
	res.sendFile(path.join(__dirname + '/musicviz/tree.html'))
})

app.get('/navbar.html', function(req, res) {
	res.sendFile(path.join(__dirname + '/musicviz/navbar.html'))
})

app.get('/footer.html', function(req, res) {
	res.sendFile(path.join(__dirname + '/musicviz/footer.html'))
})

app.get('/bundle.js', function(req, res) {
    res.sendFile(path.join(__dirname + '/musicviz/bundle.js'));
});

// app.get('/music2019bundle.js', function(req, res) {
//     res.sendFile(path.join(__dirname + '/musicviz/music2019bundle.js'));
// });

// app.get('/music2018bundle.js', function(req, res) {
//     res.sendFile(path.join(__dirname + '/musicviz/music2018bundle.js'));
// });

// app.get('/music2017bundle.js', function(req, res) {
//     res.sendFile(path.join(__dirname + '/musicviz/music2017bundle.js'));
// });

app.get('/musicStackedAreaBundle.js', function(req, res) {
    res.sendFile(path.join(__dirname + '/musicviz/musicStackedAreaBundle.js'));
});

app.get('/treebundle.js', function(req, res) {
    res.sendFile(path.join(__dirname + '/musicviz/treebundle.js'));
});

app.get('/data', function(req, res) {
    res.sendFile(path.join(__dirname + '/data/'));
});

app.get('/data/artists.json', function(req, res) {
    res.sendFile(path.join(__dirname + '/musicviz/data/artists.json'));
});

app.get('/data/tracks.json', function(req, res) {
    res.sendFile(path.join(__dirname + '/musicviz/data/tracks.json'));
});

app.get('/genreHierarchy.json', function(req, res) {
    res.sendFile(path.join(__dirname + '/musicviz/data/genreHierarchy.json'));
});

app.get('/styles.css', function(req, res) {
    res.sendFile(path.join(__dirname + '/musicviz/styles.css'));
});

app.get('/js/bootstrap.min.js', function(req, res) {
    res.sendFile(path.join(__dirname + '/musicviz/js/bootstrap.min.js'));
});

app.get('/css/bootstrap.min.css', function(req, res) {
    res.sendFile(path.join(__dirname + '/musicviz/css/bootstrap.min.css'));
});

app.get('/hapn', function(req, res) {
    res.sendFile(path.join(__dirname + '/HAPN/hapn.html'));
});

app.get('/background.jpeg', function(req, res) {
    res.sendFile(path.join(__dirname + '/HAPN/background.jpeg'))
})


app.get('/data/16Jun2019_214451.csv', function(req, res) {
    res.sendFile(path.join(__dirname + '/musicviz/data/16Jun2019_214451.csv'));
});

app.listen(3000);
