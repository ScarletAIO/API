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
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    age INT NOT NULL DEFAULT 13,
    email VARCHAR(255) NOT NULL,
    password TEXT NOT NULL,
    max_apps INT NOT NULL DEFAULT 5,
    last_login DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    token TEXT,
    permission_level INT NOT NULL DEFAULT 1,
    messageHistory TEXT NOT NULL DEFAULT '',
    PRIMARY KEY (id),
    UNIQUE KEY (username),
    UNIQUE KEY (email)
);