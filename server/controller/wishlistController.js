import db from '../config/db.js';

export const addToWishlist = async (req, res) => {
    const { bookId } = req.body;
    const memberId = req.user.id;

    if (!bookId) {
        return res.status(400).json({ message: "Book ID is required" });
    }

    try {
        // Fetch corresponding PK_Product_KEY for the bookId
        const [product] = await db.query('SELECT PK_Product_KEY FROM Product WHERE PK_Product_id = ?', [bookId]);
        if (product.length === 0) {
            return res.status(404).json({ message: "Book not found" });
        }
        const productKey = product[0].PK_Product_KEY;

        // Check if already in wishlist
        const [existing] = await db.query(
            "SELECT * FROM Wishlist WHERE FK_Member_id = ? AND FK_Product_KEY = ?",
            [memberId, productKey]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: "Book already in wishlist" });
        }

        await db.query(
            "INSERT INTO Wishlist (FK_Member_id, FK_Product_KEY) VALUES (?, ?)",
            [memberId, productKey]
        );

        res.status(201).json({ message: "Added to wishlist successfully" });
    } catch (error) {
        console.error("Error adding to wishlist:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getWishlist = async (req, res) => {
    const memberId = req.user.id;

    try {
        const [wishlist] = await db.query(
            `SELECT w.PK_Wishlist_id as wishlistId, p.PK_Product_id as id, p.Product_name as title, p.Product_short_desc as author, p.Product_long_desc as description, p.PK_Product_KEY, p.isbn, p.category, p.shelfLocation, p.document, p.status, p.createdAt, p.updatedAt, ps.QTY as quantity, ps.Available as availableQuantity
             FROM Wishlist w 
             JOIN Product p ON w.FK_Product_KEY = p.PK_Product_KEY 
             LEFT JOIN Product_Stock ps ON p.PK_Product_id = ps.Product_ID
             WHERE w.FK_Member_id = ?`,
            [memberId]
        );

        res.status(200).json(wishlist);
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const removeFromWishlist = async (req, res) => {
    const { id } = req.params; // bookId
    const memberId = req.user.id;

    try {
        const [result] = await db.query(
            "DELETE FROM Wishlist WHERE FK_Member_id = ? AND FK_Product_KEY = (SELECT PK_Product_KEY FROM Product WHERE PK_Product_id = ?)",
            [memberId, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Book not found in wishlist" });
        }

        res.status(200).json({ message: "Removed from wishlist successfully" });
    } catch (error) {
        console.error("Error removing from wishlist:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
