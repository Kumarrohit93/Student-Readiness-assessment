import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./Config/db.js";
import connectMongoDB from "./Config/mongo.js";
import tenantRoutes from "./Routes/TennatRoute.js";
import adminRoutes from "./Routes/adminRoutes.js";
import authRoutes from "./Routes/authRoutes.js";
import studentRoutes from "./Routes/studentRoutes.js";
import { requestIdMiddleware } from "./Middleware/requestIdMiddleware.js";
import { errorResponse } from "./Utils/errorResponse.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestIdMiddleware)

connectMongoDB()

app.get("/", (req, res) => {
    res.json({
        message: "Backend is running",
    });
});

app.get("/api/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            message: "PostgreSQL connected successfully",
            time: result.rows[0].now,
        });
    } catch (error) {
        console.log(error);

        return errorResponse(
            res,
            500,
            "INTERNAL_ERROR",
            "Something went wrong",
            req.requestId
        );
    }
});

app.use("/api/Create-tenants", tenantRoutes);
app.use("/api/create-admins", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});