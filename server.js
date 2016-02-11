
var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var POSTS_FILE = path.join(__dirname, 'posts.json');

app.set('port', (process.env.PORT || 3000));
app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

function printError(error) {
    if (error) {
        console.error(error);
        process.exit(1);
    }
}

// Routing

/* We will post different JSON output to our file depending on the current
   web page. We declare variables to keep track of this */
   
var currentPage = '';
var postNumber = 1;

app.get('/', function(req, res) {
    currentPage = 'home';
});

app.get('/posts/:id', function(req, res) {
    currentPage = 'post',
    postNumber = req.path.split('/')[2];
    res.sendFile(path.join(__dirname, "public/post.html"));
});

app.get('/api/posts', function(req, res) {
  fs.readFile(POSTS_FILE, function(err, data) {
    printError(err);
    res.json(JSON.parse(data));
  });
});

app.post('/api/posts', function(req, res) {
  fs.readFile(POSTS_FILE, function(err, data) {
    printError(err);
    var posts = JSON.parse(data);
    var post = posts[postNumber - 1];

    if (currentPage === 'post') {
        var newComment = {
          user: req.body.user,
          message: req.body.message
        };
    }
    else {
        var now = new Date();
        var month = (now.getMonth() < 10) ? "0" + (now.getMonth() + 1) : now.getMonth() + 1;
        var day = (now.getDate() < 10) ? "0" + now.getDate() : now.getDate();
        var newPost = {
            id: posts.length + 1,
            date: now.getFullYear() + '-' + month + '-' + day,
            title: req.body.title,
            author: req.body.author,
            text: req.body.text,
            comments: []
        };
    }
    
    currentPage === 'post' ? post.comments.push(newComment) : posts.push(newPost);
    
    fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 4), function(err) {
      printError(err);
      res.json(posts);
    });
  });
});

// Start the server

app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
