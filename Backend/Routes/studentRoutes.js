import express from "express";

import {
    createStudent,
    getStudents,
    createAttempt,
    getStudentById,
    updateStudent,
    getStudentActivity,
    getDashboardStats,
    getAllActivity
} from "../Controllers/studentController.js";

import { authMiddleware } from "../Middleware/authMiddleware.js";
import { requireRole } from "../Middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, requireRole("admin"), createStudent);

router.get("/", authMiddleware, getStudents);

router.get("/dashboard/stats", authMiddleware, getDashboardStats);

router.get("/activity", authMiddleware, getAllActivity);

router.post("/:id/attempts", authMiddleware, requireRole("admin"), createAttempt);

router.get(
    "/:id/activity",
    authMiddleware,
    getStudentActivity
);

router.get("/:id", authMiddleware, getStudentById);

router.patch(
    "/:id",
    authMiddleware,
    requireRole("admin"),
    updateStudent
);

export default router;