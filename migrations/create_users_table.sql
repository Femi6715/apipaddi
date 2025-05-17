CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    surname VARCHAR(255) NOT NULL,
    firstname VARCHAR(255) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    dob VARCHAR(20) NOT NULL,
    state VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    mobile_no VARCHAR(20) NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    main_balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    bonus DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_mobile_no (mobile_no),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 