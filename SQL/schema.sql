CREATE DATABASE chat;

USE chat;

CREATE TABLE messages (
 /* Describe your table here.*/
 id integer NOT NULL AUTO_INCREMENT,
 username varchar(15),
 text varchar(140),
 roomname varchar(15),
 PRIMARY KEY (id)
);

/* You can also create more tables, if you need them... */

/*  Execute this file from the command line by typing:
 *    mysql < schema.sql
 *  to create the database and the tables.*/
