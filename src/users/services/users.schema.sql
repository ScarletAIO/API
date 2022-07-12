/**
    * Permission Levels:
    * 0 = No Access
    * 1 = Standard
    * 2 = Beta Tester
    * 3 = Admin
    * 4 = Developer
 --------------------------- 
    * 1.5 = Bot Account
*/

-- Create a table for users
CREATE TABLE IF NOT EXISTS `users.table` (
    id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password TEXT NOT NULL,
    max_apps INT(5) NOT NULL,
    last_login DATETIME NOT NULL,
    token text not null,
    permission_level INT NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY (username),
    UNIQUE KEY (email)
);

-- Create a table containing the user biography
CREATE TABLE IF NOT EXISTS `users.biography` (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    bio TEXT NOT NULL DEFAULT "Hi there! I'm new here :D",
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES `users.table`(id)
);