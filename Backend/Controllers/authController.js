import pool from "../Config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { errorResponse } from "../Utils/errorResponse.js";

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check fields
        if (!email || !password) {
            return errorResponse(
                res,
                400,
                "VALIDATION_ERROR",
                "Email and password are required",
                req.requestId,
                {
                    email: !email ? "Email is required" : undefined,
                    password: !password ? "Password is required" : undefined,
                }
            );
        }

        // 2. Find user
        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return errorResponse(
                res,
                401,
                "AUTHENTICATION_REQUIRED",
                "Invalid email or password",
                req.requestId
            );
        }

        const user = result.rows[0];

        // 3. Check password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return errorResponse(
                res,
                401,
                "AUTHENTICATION_REQUIRED",
                "Invalid email or password",
                req.requestId
            );
        }

        // 4. Create JWT
        const token = jwt.sign(
            {
                userId: user.id,
                tenantId: user.tenant_id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d",
            }
        );

        // 5. Send response
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                tenantId: user.tenant_id,
            },
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
};