import pool from "../Config/db.js";
import bcrypt from "bcryptjs";
import { errorResponse } from "../Utils/errorResponse.js";

export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, tenantId } = req.body;

    // Basic validation
    if (!name || !email || !password || !tenantId) {
      return errorResponse(
        res,
        400,
        "VALIDATION_ERROR",
        "All fields are required",
        req.requestId,
        {
          name: !name ? "Name is required" : undefined,
          email: !email ? "Email is required" : undefined,
          password: !password ? "Password is required" : undefined,
          tenantId: !tenantId ? "Tenant ID is required" : undefined,
        }
      );
    }

    // Check organisation exists
    const tenant = await pool.query(
      "SELECT * FROM tenants WHERE id = $1",
      [tenantId]
    );

    if (tenant.rows.length === 0) {
      return errorResponse(
        res,
        404,
        "ORGANISATION_NOT_FOUND",
        "Organisation not found",
        req.requestId
      );
    }

    // Check email already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return errorResponse(
        res,
        409,
        "VALIDATION_ERROR",
        "Email already exists",
        req.requestId,
        {
          email: "Email already exists",
        }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const result = await pool.query(
      `INSERT INTO users
       (name, email, password, role, tenant_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, tenant_id, created_at`,
      [name, email, hashedPassword, "admin", tenantId]
    );

    res.status(201).json({
      message: "Admin created successfully",
      admin: result.rows[0],
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