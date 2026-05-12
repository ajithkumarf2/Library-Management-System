import express from "express";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import "dotenv/config";
import "./config/db.js";
import { 
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
import aiRoutes from "./routes/aiRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173', 
    credentials: true
}));

// Initialize database tables
const initializeTables = async () => {
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
app.use("/api/ai", aiRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});