import express from "express";
import { createTenant } from "../Controllers/CreateTennats.js";

const router = express.Router();

router.post("/", createTenant);

export default router;