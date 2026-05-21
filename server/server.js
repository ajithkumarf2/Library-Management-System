import express from "express";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import "dotenv/config";
import "./config/db.js";
import { 
    createMemberAddressTable,
    createMembersTable, 
    createBooksTable, 
    createIssueHistoryTable, 
    createStudyroomTable, 
    createAdminsTable, 
    createStudyroomBookingsTable,
    createWishlistTable
} from "./model/Member.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import issueRoutes from "./routes/issueRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import studyRoomRoutes from "./routes/studyRoomRoutes.js";

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173', 
    credentials: true
}));

// Custom route for serving uploads with inline disposition
app.get('/uploads/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.params.filename);
    res.setHeader('Content-Disposition', 'inline');
    res.sendFile(filePath);
});

// Fallback for other files in uploads
app.use('/uploads', express.static('uploads'));

// Initialize database tables
const initializeTables = async () => {
    await createMemberAddressTable();
    await createMembersTable();
    await createBooksTable();
    await createIssueHistoryTable();
    await createStudyroomTable();
    await createAdminsTable();
    await createStudyroomBookingsTable();
    await createWishlistTable();
};

initializeTables();

// Routes
app.get("/", (req, res) => {
    res.send("Library Management System Backend is running");
});

app.use("/api/members", memberRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/studyroom", studyRoomRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});