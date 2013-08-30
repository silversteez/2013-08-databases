var mysql = require('mysql');

var dbConnection = mysql.createConnection({
  user: "root",
  password: "",
  database: "chat"
});

dbConnection.connect();

module.exports.executeQuery = function(queryString, cb){
  dbConnection.query(queryString, cb);
};


