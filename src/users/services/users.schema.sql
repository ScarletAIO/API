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
CREATE TABLE IF NOT EXISTS users_table (
    id VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    age INT NOT NULL DEFAULT 13,
    email VARCHAR(255) NOT NULL,
    password TEXT NOT NULL,
    max_apps INT NOT NULL DEFAULT 5,
    last_login DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    token TEXT,
    permission_level INT NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    UNIQUE KEY (username),
    UNIQUE KEY (email)
);

-- Create a table containing the user biography
CREATE TABLE IF NOT EXISTS users_biography (
    id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    bio TEXT NOT NULL DEFAULT "Hi there! I'm new here :D",
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users_table(id)
);