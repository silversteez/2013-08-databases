var fs = require('fs');
var path = require('path');
var sql = require('../SQL/persistent_server');

var handleStaticRequests = function(request, response) {
  var filePath = './client' + request.url;
  console.log(filePath);
  console.log(__dirname);

  if (filePath == './client/') {
    filePath = __dirname + '/client/index.html';
  } else {
    filePath = __dirname + '/client/' + request.url;
  }

  console.log(filePath);

  var extname = path.extname(filePath);
  var contentType = 'text/html';
  switch (extname) {
    case '.js':
    contentType = 'text/javascript';
    break;
    case '.css':
    contentType = 'text/css';
    break;
  }

  fs.exists(filePath, function(exists) {
    if (exists) {
      fs.readFile(filePath, function(error, content) {
        if (error) {
          response.writeHead(500);
          response.end();
        }
        else {
          response.writeHead(200, { 'Content-Type': contentType });
          response.end(content, 'utf-8');
        }
      });
    }
    else {
      console.log("404!");
      response.writeHead(404);
      response.end();
    }
  });
};

var handlePostMessage = function(request, roomName){
  roomName = roomName.replace('%20', ' ');

  var messageData = '';

  request.on('data', function(data){
     messageData+=data;
  });

  request.on('end', function(){
    var messageObj = JSON.parse(messageData);
    messageObj.roomname = roomName;
    messageObj.createdAt = new Date();
    saveToFile(messageObj);
  });
};

var handleGetMessages = function(request, response, roomName){
  roomName = roomName.replace('%20', ' ');

  request.on("error", function(){
    console.log("There was an error. Frick");
  });
  var messages = {};
  var queryString = "SELECT username, text, roomname FROM messages WHERE roomname = " + "'" + roomName + "';";
  sql.executeQuery(queryString, function(err, rows, fields){
    messages.results = rows;
    response.write(JSON.stringify(messages));
    response.end();
  });
};

var saveToFile = function(messageObj) {
  var queryString = "INSERT INTO messages (username, text, roomname) values (" +
    "'" + messageObj.username + "', '" + messageObj.text + "', '" + messageObj.roomname + "');";

  console.log(queryString);
  sql.executeQuery(queryString);
};

var handleGetChatrooms = function(request, response){
  var queryString = "SELECT DISTINCT(roomname) FROM messages";

  sql.executeQuery(queryString, function(err, rows, fields){
    response.write(JSON.stringify(rows));
    response.end();
  });
};

exports.handlePostMessage = handlePostMessage;
exports.handleGetMessages = handleGetMessages;
exports.handleGetChatrooms = handleGetChatrooms;
exports.handleStaticRequests = handleStaticRequests;