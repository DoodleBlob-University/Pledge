CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(345) NOT NULL,
    username VARCHAR(30) NOT NULL,
    password VARCHAR(60) NOT NULL,
    admin BOOLEAN NOT NULL CHECK (admin IN (0,1))
);

SELECT COUNT(id) AS count FROM users WHERE username = '${username}';
SELECT COUNT(id) AS count FROM users WHERE email = '${email}';
INSERT INTO users(email, username, password, admin) VALUES (\
'${email}', '${username}', '${password}', 0);

UPDATE users SET admin = 1 WHERE username = 'admin';

SELECT username, password, admin FROM users WHERE username = '${username}';