var http = require('http');
var express = require('express');
var socket_io = require('socket.io');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

var allUsernames = {};

var allConnectedSockets = [];

var WORDS = [
    "word", "letter", "number", "person", "pen", "class", "people",
    "sound", "water", "side", "place", "man", "men", "woman", "women", "boy",
    "girl", "year", "day", "week", "month", "name", "sentence", "line", "air",
    "land", "home", "hand", "house", "picture", "animal", "mother", "father",
    "brother", "sister", "world", "head", "page", "country", "question",
    "answer", "school", "plant", "food", "sun", "state", "eye", "city", "tree",
    "farm", "story", "sea", "night", "day", "life", "north", "south", "east",
    "west", "child", "children", "example", "paper", "music", "river", "car",
    "foot", "feet", "book", "science", "room", "friend", "idea", "fish",
    "mountain", "horse", "watch", "color", "face", "wood", "list", "bird",
    "body", "dog", "family", "song", "door", "product", "wind", "ship", "area",
    "rock", "order", "fire", "problem", "piece", "top", "bottom", "king",
    "space"
];

function randomWord() {
    var max = WORDS.length-1;
    var rand = Math.random() * max;
    return WORDS[rand];
};

io.on('connection', function(socket) {

    allConnectedSockets.push(socket);

    socket.on('message', function(message) {
        console.log('Received message:', message);
        var username = allUsernames[socket.id];
        //Finally you need to broadcast the message to any other clients who are connected.
        socket.broadcast.emit('message', username + ": " + message);
    });
    //when a new client provides a username, it is added to the users object.
    socket.on('login', function(username) {
        allUsernames[socket.id] = username;
        socket.broadcast.emit('message', username);
        socket.broadcast.emit('totalUsers', Object.keys(allUsernames).length);
        socket.emit('totalUsers', Object.keys(allUsernames).length);
    });
    if (Object.keys(io.sockets.connected).length == 1) {
        socket.emit("drawerDesignation", randomWord());
    }

    socket.on('guess', function(userGuess) {
        socket.broadcast.emit('updateGuessList', userGuess);
    });
    socket.on('newDraw', function(position) {
        socket.broadcast.emit('updateDraw', position);
    })
    socket.on('disconnect', function() {
        var allConnectedClients = Object.keys(io.sockets.connected);
        var newDrawer = allConnectedClients[0];
        socket.broadcast.emit('message', 'Client Disonnected' + socket.id);
        delete allUsernames[socket.id];
        socket.broadcast.emit('totalUsers', Object.keys(allUsernames).length);
        io.sockets.connected[newDrawer].emit('drawerDesignation', randomWord());
        console.log(socket.id + ' has disconnected');
    });
})

server.listen(8080);
