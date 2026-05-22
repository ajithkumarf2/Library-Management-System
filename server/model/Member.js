import db from '../config/db.js';

// Reusable helper to execute schema definitions cleanly
const executeSchemaQuery = async (query, tableName) => {
    try {
        await db.query(query);
        console.log(` ${tableName} table verified/created successfully`);
    } catch (error) {
        console.error(` Error setting up ${tableName} table:`, error.message);
    }
};

// Create member_address table for normalized address storage
export const createMemberAddressTable = async () => {
    const createTable = `
        CREATE TABLE IF NOT EXISTS member_address (
            id INT AUTO_INCREMENT PRIMARY KEY,
            street VARCHAR(255),
            city VARCHAR(100) NOT NULL,
            state VARCHAR(100) NOT NULL,
            pincode VARCHAR(6) NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `;
    await executeSchemaQuery(createTable, "Member Address");
};

export const createMembersTable = async () => {
    const createTable = `
        CREATE TABLE IF NOT EXISTS members (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            phone VARCHAR(15),
            membershipType VARCHAR(50) DEFAULT 'standard',
            address_id INT UNIQUE,
            status ENUM('active', 'inactive') DEFAULT 'active',
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (address_id) REFERENCES member_address(id) ON DELETE SET NULL
        )
    `;
    await executeSchemaQuery(createTable, "Members");
};

export const createBooksTable = async () => {
    const createProductTable = `
        CREATE TABLE IF NOT EXISTS Product (
            PK_Product_id INT AUTO_INCREMENT PRIMARY KEY,
            Product_name VARCHAR(255) NOT NULL,
            Product_short_desc VARCHAR(255),
            Product_long_desc TEXT,
            PK_Product_KEY VARCHAR(16) NOT NULL UNIQUE,
            isbn VARCHAR(20) UNIQUE,
            category VARCHAR(100),
            shelfLocation VARCHAR(100),
            document VARCHAR(255),
            status ENUM('available', 'unavailable') DEFAULT 'available',
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `;
    const createStockTable = `
        CREATE TABLE IF NOT EXISTS Product_Stock (
            PS_ID INT AUTO_INCREMENT PRIMARY KEY,
            Product_ID INT NOT NULL UNIQUE,
            QTY INT NOT NULL DEFAULT 0,
            Available INT NOT NULL DEFAULT 0,
            FOREIGN KEY (Product_ID) REFERENCES Product(PK_Product_id) ON DELETE CASCADE
        )
    `;
    const createInwardsTable = `
        CREATE TABLE IF NOT EXISTS Inwards (
            PK_I_ID INT AUTO_INCREMENT PRIMARY KEY,
            I_Date DATE NOT NULL,
            I_Time TIME NOT NULL,
            FK_Product_KEY VARCHAR(16) NOT NULL,
            I_Qty INT NOT NULL,
            I_Price DECIMAL(10, 2) NOT NULL,
            FOREIGN KEY (FK_Product_KEY) REFERENCES Product(PK_Product_KEY) ON DELETE CASCADE
        )
    `;
    const createOutwardsTable = `
        CREATE TABLE IF NOT EXISTS Outwards (
            PK_O_ID INT AUTO_INCREMENT PRIMARY KEY,
            O_Date DATE NOT NULL,
            O_Time TIME NOT NULL,
            FK_Product_KEY VARCHAR(16) NOT NULL,
            O_Qty INT NOT NULL,
            O_Price DECIMAL(10, 2) NOT NULL,
            FOREIGN KEY (FK_Product_KEY) REFERENCES Product(PK_Product_KEY) ON DELETE CASCADE
        )
    `;

    await executeSchemaQuery(createProductTable, "Product");
    await executeSchemaQuery(createStockTable, "Product Stock");
    await executeSchemaQuery(createInwardsTable, "Inwards");
    await executeSchemaQuery(createOutwardsTable, "Outwards");
};

export const createIssueHistoryTable = async () => {
    const createTable = `
        CREATE TABLE IF NOT EXISTS issueHistory (
            id INT AUTO_INCREMENT PRIMARY KEY,
            memberId INT NOT NULL,
            bookId INT NOT NULL,
            issueDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            dueDate DATE NOT NULL,
            returnDate DATETIME,
            status ENUM('issued', 'returned', 'overdue') DEFAULT 'issued',
            FOREIGN KEY (memberId) REFERENCES members(id) ON DELETE CASCADE,
            FOREIGN KEY (bookId) REFERENCES Product(PK_Product_id) ON DELETE CASCADE
        )
    `;
    await executeSchemaQuery(createTable, "Issue History");
};

export const createStudyroomTable = async () => {
    const createTable = `
        CREATE TABLE IF NOT EXISTS Study_Room (
            PK_Study_Room_id INT AUTO_INCREMENT PRIMARY KEY,
            Study_Room_Number VARCHAR(50) NOT NULL UNIQUE,
            Study_Room_Capacity INT NOT NULL,
            Study_Room_Available_Seats INT NOT NULL,
            PK_Study_Room_KEY VARCHAR(16) NOT NULL UNIQUE,
            status ENUM('available', 'occupied', 'maintenance') DEFAULT 'available',
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `;
    await executeSchemaQuery(createTable, "Study Rooms");
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
    await executeSchemaQuery(createTable, "Admins");
};

export const createStudyroomBookingsTable = async () => {
    const createTable = `
        CREATE TABLE IF NOT EXISTS Study_Room_Booking (
            PK_SRB_ID INT AUTO_INCREMENT PRIMARY KEY,
            FK_Member_id INT NOT NULL,
            FK_Study_Room_KEY VARCHAR(16) NOT NULL,
            SRB_Date DATE NOT NULL,
            SRB_Start_Time TIME NOT NULL,
            SRB_End_Time TIME NOT NULL,
            status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'confirmed',
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT chk_valid_member_id CHECK (FK_Member_id > 0),
            FOREIGN KEY (FK_Member_id) REFERENCES members(id) ON DELETE CASCADE,
            FOREIGN KEY (FK_Study_Room_KEY) REFERENCES Study_Room(PK_Study_Room_KEY) ON DELETE CASCADE
        )
    `;
    await executeSchemaQuery(createTable, "Study Room Bookings");
};

export const createWishlistTable = async () => {
    const createTable = `
        CREATE TABLE IF NOT EXISTS Wishlist (
            PK_Wishlist_id INT AUTO_INCREMENT PRIMARY KEY,
            FK_Member_id INT NOT NULL,
            FK_Product_KEY VARCHAR(16) NOT NULL,
            addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (FK_Member_id) REFERENCES members(id) ON DELETE CASCADE,
            FOREIGN KEY (FK_Product_KEY) REFERENCES Product(PK_Product_KEY) ON DELETE CASCADE,
            UNIQUE KEY unique_wishlist (FK_Member_id, FK_Product_KEY)
        )
    `;
    await executeSchemaQuery(createTable, "Wishlist");
};
