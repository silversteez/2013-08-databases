var fs = require('fs');
var path = require('path');
var sql = require('../SQL/persistent_server');

var messages = {};
messages.general = {};
var messageKey = 0;

var handleStaticRequests = function(request, response) {
  var filePath = './client' + request.url;
  console.log(filePath);
  console.log(__dirname);

  if (filePath == './client/') {
    // filePath = './client/index.html';
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
  var messageData = '';

  request.on('data', function(data){
     messageData+=data;
  });

  request.on('end', function(){
    var parsedData = JSON.parse(messageData);
    var roomObj = messages[roomName] || {};
    var messageKey = Object.keys(roomObj).length;
    var messageObj = {};
    messageObj.username = parsedData.username;
    messageObj.text = parsedData.text;
    messageObj.roomname = roomName;
    messageObj.createdAt = new Date();
    roomObj[messageKey] = messageObj;
    messages[roomName] = roomObj;
    saveToFile(messageObj);
  });
  console.log("after postMessage messages: ", messages);
};

var handleGetMessages = function(request, response, roomName){
  request.on("error", function(){
    console.log("There was an error. Frick");
  });
  var messageObject = {};
  messageObject.results = messages[roomName] || {};
  response.write(JSON.stringify(messageObject));
};

var firstConnection = function(){

  var data = '';
  fs.readFile('./messageData.txt','utf8', function(err, data){
    if(!err){
    console.log("DATA" , data);
    messages = JSON.parse(data);
  }
  });
  console.log("after firstConnection messages: ", messages);
};

var saveToFile = function(messageObj) {
  // fs.writeFile("./messageData.txt", JSON.stringify(messages), function(err){
  //   if(err){
  //     console.log('there was an error');
  //   } else{
  //     console.log('Successfully wrote to file');
  //   }
  // });
  var queryString = "INSERT INTO messages (username, text, roomname) values (" +
    "'" + messageObj.username + "', '" + messageObj.text + "', '" + messageObj.roomname + "');";

  console.log(queryString);
  sql.executeQuery(queryString);
};

var handleGetChatrooms = function(request, response){
  var keys = Object.keys(messages);
  response.write(JSON.stringify(keys));
};

exports.handlePostMessage = handlePostMessage;
exports.handleGetMessages = handleGetMessages;
exports.firstConnection = firstConnection;
exports.handleGetChatrooms = handleGetChatrooms;
exports.handleStaticRequests = handleStaticRequests;