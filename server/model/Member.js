import db from '../config/db.js';

export const createMembersTable = async () => {
    const createTable = `
        CREATE TABLE IF NOT EXISTS members (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            phone VARCHAR(15),
            membershipType VARCHAR(50) DEFAULT 'standard',
            address TEXT,
            status ENUM('active', 'inactive') DEFAULT 'active',
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `;
    
    try {
        await db.query(createTable);
        console.log("Members table created/verified");
    } catch (error) {
        console.error("Error creating members table:", error.message);
    }
};

export const createBooksTable = async () => {
    const createTable = `
        CREATE TABLE IF NOT EXISTS books (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            author VARCHAR(255) NOT NULL,
            isbn VARCHAR(20) UNIQUE,
            category VARCHAR(100),
            quantity INT NOT NULL DEFAULT 1,
            availableQuantity INT NOT NULL DEFAULT 1,
            description TEXT,
            shelfLocation VARCHAR(100),
            status ENUM('available', 'unavailable') DEFAULT 'available',
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `;
    
    try {
        await db.query(createTable);
        console.log("Books table created/verified");
    } catch (error) {
        console.error("Error creating books table:", error.message);
    }
};

export const createIssueHistoryTable = async () => {
    const createTable = `
        CREATE TABLE IF NOT EXISTS issueHistory (
            id INT AUTO_INCREMENT PRIMARY KEY,
            memberId INT NOT NULL,
            bookId INT NOT NULL,
            issueDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            dueDate DATE NOT NULL,
            returnDate DATE,
            status ENUM('issued', 'returned', 'overdue') DEFAULT 'issued',
            fine DECIMAL(10, 2) DEFAULT 0,
            FOREIGN KEY (memberId) REFERENCES members(id) ON DELETE CASCADE,
            FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE
        )
    `;
    
    try {
        await db.query(createTable);
        console.log("Issue History table created/verified");
    } catch (error) {
        console.error("Error creating issueHistory table:", error.message);
    }
};

export const createStudyroomTable = async () => {
    const createTable = `
        CREATE TABLE IF NOT EXISTS studyrooms (
            id INT AUTO_INCREMENT PRIMARY KEY,
            roomNumber VARCHAR(50) NOT NULL UNIQUE,
            capacity INT NOT NULL,
            availableSeats INT NOT NULL,
            status ENUM('available', 'occupied', 'maintenance') DEFAULT 'available',
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `;
    
    try {
        await db.query(createTable);
        console.log("Study Rooms table created/verified");
    } catch (error) {
        console.error("Error creating studyrooms table:", error.message);
    }
};

export const createAdminsTable = async () => {
    const createTable = `
        CREATE TABLE IF NOT EXISTS admins (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role ENUM('superadmin', 'admin') DEFAULT 'admin',
            status ENUM('active', 'inactive') DEFAULT 'active',
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `;
    
    try {
        await db.query(createTable);
        console.log("Admins table created/verified");
    } catch (error) {
        console.error("Error creating admins table:", error.message);
    }
};

export const createStudyroomBookingsTable = async () => {
    const createTable = `
        CREATE TABLE IF NOT EXISTS studyroom_bookings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            roomId INT NOT NULL,
            bookingDate DATE NOT NULL,
            startTime TIME NOT NULL,
            endTime TIME NOT NULL,
            status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'confirmed',
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (roomId) REFERENCES studyrooms(id) ON DELETE CASCADE
        )
    `;
    
    try {
        await db.query(createTable);
        console.log("Study Room Bookings table created/verified");
    } catch (error) {
        console.error("Error creating studyroom_bookings table:", error.message);
    }
};

export const createWishlistTable = async () => {
    const createTable = `
        CREATE TABLE IF NOT EXISTS wishlist (
            id INT AUTO_INCREMENT PRIMARY KEY,
            memberId INT NOT NULL,
            bookId INT NOT NULL,
            addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (memberId) REFERENCES members(id) ON DELETE CASCADE,
            FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE,
            UNIQUE KEY unique_wishlist (memberId, bookId)
        )
    `;
    
    try {
        await db.query(createTable);
        console.log("Wishlist table created/verified");
    } catch (error) {
        console.error("Error creating wishlist table:", error.message);
    }
};
