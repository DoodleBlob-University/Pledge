CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(345) NOT NULL,
    username VARCHAR(30) NOT NULL,
    password VARCHAR(60) NOT NULL,
    admin BOOLEAN NOT NULL CHECK (admin IN (0,1))
);

SELECT COUNT(id) AS count FROM users WHERE username = '${username}';
SELECT COUNT(id) AS count FROM users WHERE email = '${email}';

INSERT INTO users(email, username, password, admin) 
VALUES ('${email}', '${username}', '${password}', 0);

UPDATE users SET admin = 1 WHERE username = 'admin';

SELECT username, password, admin FROM users WHERE username = '${username}';

CREATE TABLE IF NOT EXISTS pledges(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(60) NOT NULL,
    image BLOB NOT NULL,
    moneyRaised INTEGER,
    moneyTarget INTEGER NOT NULL,
    deadline INTEGER NOT NULL,
    description VARCHAR(600) NOT NULL,
    longitude INTEGER,
    latitude INTEGER,
    creator VARCHAR(30) NOT NULL,
    approved BOOLEAN NOT NULL CHECK (approved IN (0,1)),
    FOREIGN KEY(creator) REFERENCES users(username)
);

INSERT INTO pledges(title, image, moneyRaised, moneyTarget, deadline, description, 
    longitude, latitude, creator, approved) 
    VALUES ('${body.pledgename}', '${imagename}', 0, ${body.fundgoal}, ${body.deadline}, '${body.desc}',
    ${long}, ${lat}, '${body.creator}', 0);