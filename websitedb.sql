CREATE TABLE users(
    email VARCHAR(345) NOT NULL,
    username VARCHAR(30) NOT NULL,
    password VARCHAR(60) NOT NULL,
    admin BOOLEAN NOT NULL CHECK (admin IN (0,1)),
    PRIMARY KEY (email, username, password)
);

