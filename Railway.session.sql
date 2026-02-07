CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status ENUM('unverified', 'active', 'blocked') NOT NULL DEFAULT 'unverified',
    last_login DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ;

CREATE UNIQUE INDEX users_email_unique_idx ON users (email);

--@block
SELECT * FROM users;

SHOW INDEX from users;