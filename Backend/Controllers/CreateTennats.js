import pool from "../Config/db.js";
import { errorResponse } from "../Utils/errorResponse.js";

export const createTenant = async (req, res) => {
    try {
        const { name } = req.body;

        // Check name
        if (!name) {
            return errorResponse(
                res,
                400,
                "VALIDATION_ERROR",
                "Organisation name is required",
                req.requestId,
                {
                    name: "Organisation name is required",
                }
            );
        }

        // Insert organisation
        const result = await pool.query(
            "INSERT INTO tenants (name) VALUES ($1) RETURNING *",
            [name]
        );

        res.status(201).json({
            message: "Organisation created successfully",
            tenant: result.rows[0],
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