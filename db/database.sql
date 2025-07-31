Create database IF NOT EXISTS gastosdb;

USE gastosdb;

CREATE TABLE users (
    id INT(11) NOT NULL AUTO_INCREMENT,
    name VARCHAR(45) DEFAULT NULL,
    PRIMARY KEY (id)
);

DESCRIBE users;


INSERT INTO users VALUES
(1,'JOE'),
(2,'Henry'),
(3,'Sam'),
(4,'Max'),
(5,'Val');