"use strict"

var pictionary = function() {
    var socket = io();
    var canvas, context;

    var draw = function(position) {
        //beginPath() tells the context that you are about to start drawing a new object.
        context.beginPath();
        //used to draw arcs. In this case we tell it to draw an entire circle, centered at position, with a radius of 6px.
        context.arc(position.x, position.y,
            6, 0, 2 * Math.PI);
        //fills the path in to create a solid black circle.
        context.fill();
    };

    canvas = $('canvas');
    //context function createa a drawing context for the canvas. This context object allows you to draw simple graphics to the canvas.
    context = canvas[0].getContext('2d');
    //The width and height of the canvas object are set to be equal to its offsetWidth and offsetHeight.
    //This makes what is drawn to the context object display with the correct resolutions.
    canvas[0].width = canvas[0].offsetWidth;
    canvas[0].height = canvas[0].offsetHeight;


    let drawing = false;
    let drawer = false;

    socket.on('totalUsers', function(message) {
        $('#count').text(message);
        console.log(message);
    });

    $("#userName").on('keydown', function(event) {
        if (event.keyCode == 13) {
            $("#hide").hide();
            // read the username from the input field
            // send the username to the server
            socket.emit('login', $("#userName").val());

        }
    });
    //add a mousemove listener to the canvas.
    canvas.on('mousemove', function(event) {
        //find the offset of the canvas on the page, and subtract this from the event pageX and pageY attributes.
        //The page attributes give the position of the mouse relative to the whole page, so by subtracting the offset
        //we obtain the position of the mouse relative to the top-left of the canvas.
        //Ex. if mouse in farthest top left corner: {x: 0, y: 0}. If farthest bottom right: {x: 800, y: 600}.
        if (!drawing) return;

        var offset = canvas.offset();
        var position = {
            x: event.pageX - offset.left,
            y: event.pageY - offset.top
        };
        draw(position);
        socket.emit('newDraw', position);
    });

    //receives updated drawing from the server
    socket.on('updateDraw', function(position) {
        draw(position);
    });

    //these two .on's let the curser only draw is the mouse button is held down.
    canvas.on('mousedown', function() {
        if (drawer) drawing = true;
    })
    canvas.on('mouseup', function() {
        drawing = false;
    })

    var guessBox;

    //When there is a keydown event fired by the input you check to see whether
    //the enter key was pressed. If it was pressed, then you log the value to
    //the console and reset the input to be empty.
    var onKeyDown = function(event) {
        if (event.keyCode != 13) { // Enter
            return;
        }

        console.log(guessBox.val());

        //sends the uessbox input value to the server.
        socket.emit('guess', guessBox.val());
        $("#guessList").append(guessBox.val());
        guessBox.val('');
    };

    guessBox = $('#guess input');
    guessBox.on('keydown', onKeyDown);

    //updates the guessbox
    socket.on('updateGuessList', function(userGuess) {
        $("#guessList").append("<p>" + userGuess + "</p>");
    });

    socket.on('drawerDesignation', function(randomWord) {
        drawer = true;
        $("#guess").hide();
        $("#word").show();
        $("#drawWord").text(randomWord);
        console.log(randomWord);
    })
};

$(document).ready(function() {
    pictionary();
});
