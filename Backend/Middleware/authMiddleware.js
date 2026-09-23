import jwt from "jsonwebtoken";
import { errorResponse } from "../Utils/errorResponse.js";

export const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return errorResponse(
                res,
                401,
                "AUTHENTICATION_REQUIRED",
                "Authentication required",
                req.requestId
            );
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        next();
    } catch (error) {
        return errorResponse(
            res,
            401,
            "INVALID_TOKEN",
            "Invalid or expired token",
            req.requestId
        );
    }
};