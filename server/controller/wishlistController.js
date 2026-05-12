import db from '../config/db.js';

export const addToWishlist = async (req, res) => {
    const { bookId } = req.body;
    const memberId = req.user.id;

    if (!bookId) {
        return res.status(400).json({ message: "Book ID is required" });
    }

    try {
        // Check if already in wishlist
        const [existing] = await db.query(
            "SELECT * FROM wishlist WHERE memberId = ? AND bookId = ?",
            [memberId, bookId]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: "Book already in wishlist" });
        }

        await db.query(
            "INSERT INTO wishlist (memberId, bookId) VALUES (?, ?)",
            [memberId, bookId]
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
            `SELECT w.id as wishlistId, b.* 
             FROM wishlist w 
             JOIN books b ON w.bookId = b.id 
             WHERE w.memberId = ?`,
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
            "DELETE FROM wishlist WHERE memberId = ? AND bookId = ?",
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
