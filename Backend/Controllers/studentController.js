import pool from "../Config/db.js";
import crypto from "crypto";
import Event from "../Models/Events.js";
import {
    createAttemptSuccessEvent,
    createAttemptRejectedEvent,
} from "../Utils/eventLogger.js";
import { errorResponse } from "../Utils/errorResponse.js";

export const createStudent = async (req, res) => {
    try {
        const { name, email } = req.body;
        const tenantId = req.user.tenantId;

        if (!name || !tenantId) {
            return errorResponse(
                res,
                400,
                "VALIDATION_ERROR",
                "Name and tenantId are required",
                req.requestId,
                {
                    name: !name ? "Name is required" : undefined,
                    tenantId: !tenantId ? "Tenant ID is required" : undefined,
                }
            );
        }

        // Check organisation
        const tenant = await pool.query(
            "SELECT id FROM tenants WHERE id = $1",
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

        // Create student
        const result = await pool.query(
            `INSERT INTO students (name, email, tenant_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
            [name, email, tenantId]
        );

        res.status(201).json({
            message: "Student created successfully",
            student: result.rows[0],
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

export const getStudents = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;

        const {
            search = "",
            status = "",
            page = 1,
            limit = 10,
            sortBy = "id",
            sortOrder = "desc",
        } = req.query;

        const pageNumber = Math.max(Number(page), 1);
        const limitNumber = Math.min(
            Math.max(Number(limit), 1),
            50
        );

        const offset = (pageNumber - 1) * limitNumber;

        // Only allow these columns for sorting
        const allowedSortFields = {
            id: "id",
            name: "name",
            email: "email",
            created_at: "created_at",
            overall_score: "overall_score",
            status: "readiness_status",
        };

        const sortColumn =
            allowedSortFields[sortBy] || "id";

        const order =
            sortOrder.toLowerCase() === "asc"
                ? "ASC"
                : "DESC";

        const searchValue = search.trim();

        const query = `
            WITH latest_attempts AS (
                SELECT DISTINCT ON (a.student_id, a.competency_id)
                    a.student_id,
                    a.competency_id,
                    a.score
                FROM attempts a
                WHERE a.is_voided = false
                ORDER BY
                    a.student_id,
                    a.competency_id,
                    a.attempted_at DESC,
                    a.id DESC
            ),

            student_scores AS (
                SELECT
                    s.id,
                    s.name,
                    s.email,
                    s.tenant_id,
                    s.version,
                    s.created_at,

                    MAX(
                        CASE
                            WHEN la.competency_id = 1
                            THEN la.score
                        END
                    ) AS frontend_score,

                    MAX(
                        CASE
                            WHEN la.competency_id = 2
                            THEN la.score
                        END
                    ) AS backend_score,

                    MAX(
                        CASE
                            WHEN la.competency_id = 3
                            THEN la.score
                        END
                    ) AS database_score,

                    MAX(
                        CASE
                            WHEN la.competency_id = 4
                            THEN la.score
                        END
                    ) AS problem_solving_score

                FROM students s

                LEFT JOIN latest_attempts la
                    ON la.student_id = s.id

                WHERE s.tenant_id = $1

                AND (
                    $2 = ''
                    OR s.name ILIKE '%' || $2 || '%'
                    OR s.email ILIKE '%' || $2 || '%'
                )

                GROUP BY
                    s.id,
                    s.name,
                    s.email,
                    s.tenant_id,
                    s.version,
                    s.created_at
            ),

            calculated_students AS (
                SELECT
                    *,
                    CASE
                        WHEN frontend_score IS NULL
                          OR backend_score IS NULL
                          OR database_score IS NULL
                          OR problem_solving_score IS NULL
                        THEN NULL

                        ELSE
                            frontend_score * 0.30 +
                            backend_score * 0.30 +
                            database_score * 0.25 +
                            problem_solving_score * 0.15
                    END AS overall_score

                FROM student_scores
            ),

            final_students AS (
                SELECT
                    *,
                    CASE
                        WHEN overall_score IS NULL
                        THEN 'INCOMPLETE'

                        WHEN overall_score >= 80
                        THEN 'READY'

                        WHEN overall_score >= 65
                        THEN 'NEARLY_READY'

                        WHEN overall_score >= 50
                        THEN 'DEVELOPING'

                        ELSE 'NEEDS_PREPARATION'
                    END AS readiness_status

                FROM calculated_students
            )

            SELECT *
            FROM final_students

            WHERE
                $3 = ''
                OR readiness_status = $3

            ORDER BY ${sortColumn} ${order}, id DESC

            LIMIT $4
            OFFSET $5;
        `;

        const result = await pool.query(query, [
            tenantId,
            searchValue,
            status,
            limitNumber,
            offset,
        ]);

        // Total count
        const countQuery = `
            WITH latest_attempts AS (
                SELECT DISTINCT ON (a.student_id, a.competency_id)
                    a.student_id,
                    a.competency_id,
                    a.score
                FROM attempts a
                WHERE a.is_voided = false
                ORDER BY
                    a.student_id,
                    a.competency_id,
                    a.attempted_at DESC,
                    a.id DESC
            ),

            student_scores AS (
                SELECT
                    s.id,
                    s.name,
                    s.email,

                    MAX(
                        CASE
                            WHEN la.competency_id = 1
                            THEN la.score
                        END
                    ) AS frontend_score,

                    MAX(
                        CASE
                            WHEN la.competency_id = 2
                            THEN la.score
                        END
                    ) AS backend_score,

                    MAX(
                        CASE
                            WHEN la.competency_id = 3
                            THEN la.score
                        END
                    ) AS database_score,

                    MAX(
                        CASE
                            WHEN la.competency_id = 4
                            THEN la.score
                        END
                    ) AS problem_solving_score

                FROM students s

                LEFT JOIN latest_attempts la
                    ON la.student_id = s.id

                WHERE s.tenant_id = $1

                AND (
                    $2 = ''
                    OR s.name ILIKE '%' || $2 || '%'
                    OR s.email ILIKE '%' || $2 || '%'
                )

                GROUP BY
                    s.id,
                    s.name,
                    s.email
            ),

            calculated_students AS (
                SELECT
                    *,
                    CASE
                        WHEN frontend_score IS NULL
                          OR backend_score IS NULL
                          OR database_score IS NULL
                          OR problem_solving_score IS NULL
                        THEN NULL

                        ELSE
                            frontend_score * 0.30 +
                            backend_score * 0.30 +
                            database_score * 0.25 +
                            problem_solving_score * 0.15
                    END AS overall_score

                FROM student_scores
            ),

            final_students AS (
                SELECT
                    *,
                    CASE
                        WHEN overall_score IS NULL
                        THEN 'INCOMPLETE'

                        WHEN overall_score >= 80
                        THEN 'READY'

                        WHEN overall_score >= 65
                        THEN 'NEARLY_READY'

                        WHEN overall_score >= 50
                        THEN 'DEVELOPING'

                        ELSE 'NEEDS_PREPARATION'
                    END AS readiness_status

                FROM calculated_students
            )

            SELECT COUNT(*)
            FROM final_students
            WHERE
                $3 = ''
                OR readiness_status = $3;
        `;

        const countResult = await pool.query(
            countQuery,
            [
                tenantId,
                searchValue,
                status,
            ]
        );

        const total = Number(countResult.rows[0].count);

        return res.status(200).json({
            students: result.rows,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total,
                totalPages: Math.ceil(
                    total / limitNumber
                ),
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

export const createAttempt = async (req, res) => {
    const client = await pool.connect();

    try {
        const studentId = req.params.id;
        const evaluatorId = req.user.userId;
        const tenantId = req.user.tenantId;
        const requestId = req.requestId;

        const { competencyId, score } = req.body;

        // Idempotency key required
        const idempotencyKey = req.headers["idempotency-key"];

        if (!idempotencyKey) {
            return errorResponse(
                res,
                400,
                "VALIDATION_ERROR",
                "Idempotency-Key header is required",
                req.requestId,
                {
                    idempotencyKey: "Idempotency-Key header is required",
                }
            );
        }

        // Basic validation
        if (!competencyId || score === undefined) {
            return errorResponse(
                res,
                400,
                "VALIDATION_ERROR",
                "competencyId and score are required",
                req.requestId,
                {
                    competencyId: !competencyId ? "Competency ID is required" : undefined,
                    score: score === undefined ? "Score is required" : undefined,
                }
            );
        }

        if (score < 0 || score > 100) {

            try {
                await createAttemptRejectedEvent({
                    tenantId,
                    studentId: Number(studentId),
                    requestId,
                    metadata: {
                        reason: "INVALID_SCORE",
                        competencyId,
                        score,
                    },
                });
            } catch (eventError) {
                console.log("Rejected event error:", eventError);
            }

            return errorResponse(
                res,
                400,
                "INVALID_SCORE",
                "Score must be between 0 and 100",
                req.requestId,
                {
                    score: "Score must be between 0 and 100",
                }
            );
        }

        // Create request hash
        const requestData = JSON.stringify({
            studentId,
            competencyId,
            score,
        });

        const requestHash = crypto
            .createHash("sha256")
            .update(requestData)
            .digest("hex");

        await client.query("BEGIN");

        // Check existing idempotency record
        const existingRecord = await client.query(
            `SELECT *
             FROM idempotency_records
             WHERE tenant_id = $1
             AND idempotency_key = $2
             FOR UPDATE`,
            [tenantId, idempotencyKey]
        );

        // ==========================================
        // EXISTING REQUEST
        // ==========================================

        if (existingRecord.rows.length > 0) {
            const record = existingRecord.rows[0];

            // Same key but different request
            if (record.request_hash !== requestHash) {
                await client.query("ROLLBACK");

                return errorResponse(
                    res,
                    409,
                    "IDEMPOTENCY_CONFLICT",
                    "Idempotency key already used with different request",
                    req.requestId
                );
            }

            // Same request → return existing attempt
            const existingAttempt = await client.query(
                `SELECT *
                 FROM attempts
                 WHERE id = $1`,
                [record.attempt_id]
            );

            await client.query("COMMIT");

            return res.status(200).json({
                message: "Request already processed",
                attempt: existingAttempt.rows[0],
                requestId,
            });
        }

        // ==========================================
        // CHECK STUDENT
        // ==========================================

        const student = await client.query(
            `SELECT id
             FROM students
             WHERE id = $1
             AND tenant_id = $2`,
            [studentId, tenantId]
        );

        if (student.rows.length === 0) {
            await client.query("ROLLBACK");

            return errorResponse(
                res,
                404,
                "STUDENT_NOT_FOUND",
                "Student not found",
                req.requestId
            );
        }

        // ==========================================
        // CHECK COMPETENCY
        // ==========================================

        const competency = await client.query(
            `SELECT id, name
             FROM competencies
             WHERE id = $1`,
            [competencyId]
        );

        if (competency.rows.length === 0) {
            await client.query("ROLLBACK");

            return errorResponse(
                res,
                404,
                "VALIDATION_ERROR",
                "Competency not found",
                req.requestId,
                {
                    competencyId: "Competency not found",
                }
            );
        }

        // ==========================================
        // CREATE ATTEMPT
        // ==========================================

        const attemptResult = await client.query(
            `INSERT INTO attempts
             (student_id, competency_id, score, evaluator_id)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [
                studentId,
                competencyId,
                score,
                evaluatorId,
            ]
        );

        const attempt = attemptResult.rows[0];

        // ==========================================
        // SAVE IDEMPOTENCY RECORD
        // ==========================================

        await client.query(
            `INSERT INTO idempotency_records
             (tenant_id, idempotency_key, request_hash, attempt_id)
             VALUES ($1, $2, $3, $4)`,
            [
                tenantId,
                idempotencyKey,
                requestHash,
                attempt.id,
            ]
        );

        // ==========================================
        // COMMIT POSTGRES
        // ==========================================

        await client.query("COMMIT");

        // ==========================================
        // CREATE MONGODB SUCCESS EVENT
        // ==========================================

        try {
            await createAttemptSuccessEvent({
                tenantId,
                studentId: Number(studentId),
                attemptId: attempt.id,
                requestId,
                idempotencyKey,
                metadata: {
                    competencyId,
                    score,
                },
            });

            console.log("Mongo success event created");

        } catch (mongoError) {
            console.log("Mongo event error:", mongoError);

            return errorResponse(
                res,
                503,
                "INTERNAL_ERROR",
                "Attempt created but event publishing is pending",
                req.requestId
            );
        }

        // ==========================================
        // FINAL RESPONSE
        // ==========================================

        return res.status(201).json({
            message: "Attempt created successfully",
            attempt,
            requestId,
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.log(error);

        return errorResponse(
            res,
            500,
            "INTERNAL_ERROR",
            "Something went wrong",
            req.requestId
        );

    } finally {
        client.release();
    }
};

export const getStudentById = async (req, res) => {
    try {
        const studentId = req.params.id;
        const tenantId = req.user.tenantId;

        // Student check
        const studentResult = await pool.query(
            `SELECT id, name, email, tenant_id, version, created_at
       FROM students
       WHERE id = $1 AND tenant_id = $2`,
            [studentId, tenantId]
        );

        if (studentResult.rows.length === 0) {
            return errorResponse(
                res,
                404,
                "STUDENT_NOT_FOUND",
                "Student not found",
                req.requestId
            );
        }

        const student = studentResult.rows[0];

        // Latest non-voided attempt for each competency
        const attemptsResult = await pool.query(
            `SELECT DISTINCT ON (a.competency_id)
          a.id,
          a.competency_id,
          c.name AS competency,
          a.score,
          a.attempted_at
       FROM attempts a
       JOIN competencies c
         ON c.id = a.competency_id
       WHERE a.student_id = $1
         AND a.is_voided = false
       ORDER BY a.competency_id, a.attempted_at DESC, a.id DESC`,
            [studentId]
        );

        const attempts = attemptsResult.rows;

        // Required competencies
        const requiredCompetencies = [
            {
                id: 1,
                name: "Frontend",
                weight: 0.30,
            },
            {
                id: 2,
                name: "Backend",
                weight: 0.30,
            },
            {
                id: 3,
                name: "Databases",
                weight: 0.25,
            },
            {
                id: 4,
                name: "Problem Solving",
                weight: 0.15,
            },
        ];

        let overallScore = 0;
        let missingCompetency = false;

        const competencyScores = requiredCompetencies.map((competency) => {
            const attempt = attempts.find(
                (item) => item.competency_id === competency.id
            );

            if (!attempt) {
                missingCompetency = true;

                return {
                    name: competency.name,
                    score: null,
                    weight: competency.weight,
                };
            }

            overallScore += Number(attempt.score) * competency.weight;

            return {
                name: competency.name,
                score: Number(attempt.score),
                weight: competency.weight,
            };
        });

        // Readiness status
        let status;

        if (missingCompetency) {
            status = "INCOMPLETE";
        } else if (overallScore >= 80) {
            status = "READY";
        } else if (overallScore >= 65) {
            status = "NEARLY_READY";
        } else if (overallScore >= 50) {
            status = "DEVELOPING";
        } else {
            status = "NEEDS_PREPARATION";
        }

        res.status(200).json({
            student,
            competencies: competencyScores,
            overallScore: Number(overallScore.toFixed(2)),
            status,
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

export const updateStudent = async (req, res) => {
    const client = await pool.connect();

    try {
        const studentId = req.params.id;
        const tenantId = req.user.tenantId;

        const { name, email, expectedVersion } = req.body;

        if (!expectedVersion) {
            return errorResponse(
                res,
                400,
                "VALIDATION_ERROR",
                "expectedVersion is required",
                req.requestId,
                {
                    expectedVersion: "expectedVersion is required",
                }
            );
        }

        if (!name && !email) {
            return errorResponse(
                res,
                400,
                "VALIDATION_ERROR",
                "Nothing to update",
                req.requestId,
                {
                    name: "Nothing to update",
                }
            );
        }

        await client.query("BEGIN");

        const result = await client.query(
            `UPDATE students
       SET
         name = COALESCE($1, name),
         email = COALESCE($2, email),
         version = version + 1
       WHERE id = $3
         AND tenant_id = $4
         AND version = $5
       RETURNING id, name, email, tenant_id, version, created_at`,
            [
                name || null,
                email || null,
                studentId,
                tenantId,
                expectedVersion,
            ]
        );

        // Version match nahi hui
        if (result.rows.length === 0) {
            await client.query("ROLLBACK");

            return errorResponse(
                res,
                409,
                "VERSION_CONFLICT",
                "Student was modified by another request",
                req.requestId
            );
        }

        await client.query("COMMIT");

        res.status(200).json({
            message: "Student updated successfully",
            student: result.rows[0],
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.log(error);

        return errorResponse(
            res,
            500,
            "INTERNAL_ERROR",
            "Something went wrong",
            req.requestId
        );

    } finally {
        client.release();
    }
};

export const getStudentActivity = async (req, res) => {
    try {
        const studentId = Number(req.params.id);
        const tenantId = req.user.tenantId;

        // First verify student belongs to this tenant
        const student = await pool.query(
            `SELECT id
             FROM students
             WHERE id = $1
             AND tenant_id = $2`,
            [studentId, tenantId]
        );

        if (student.rows.length === 0) {
            return errorResponse(
                res,
                404,
                "STUDENT_NOT_FOUND",
                "Student not found",
                req.requestId
            );
        }

        // Get events from MongoDB
        const events = await Event.find({
            tenantId,
            studentId,
        })
            .sort({ occurredAt: -1 })
            .limit(50)
            .lean();

        return res.status(200).json({
            activities: events,
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

export const getDashboardStats = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;

        const result = await pool.query(
            `
      WITH latest_attempts AS (
        SELECT DISTINCT ON (a.student_id, a.competency_id)
          a.student_id,
          a.competency_id,
          a.score
        FROM attempts a
        JOIN students s ON s.id = a.student_id
        WHERE s.tenant_id = $1
          AND a.is_voided = false
        ORDER BY a.student_id, a.competency_id,
                 a.attempted_at DESC, a.id DESC
      ),

      student_scores AS (
        SELECT
          s.id,
          MAX(CASE WHEN la.competency_id = 1 THEN la.score END) AS frontend,
          MAX(CASE WHEN la.competency_id = 2 THEN la.score END) AS backend,
          MAX(CASE WHEN la.competency_id = 3 THEN la.score END) AS databases,
          MAX(CASE WHEN la.competency_id = 4 THEN la.score END) AS problem_solving
        FROM students s
        LEFT JOIN latest_attempts la
          ON la.student_id = s.id
        WHERE s.tenant_id = $1
        GROUP BY s.id
      ),

      calculated_students AS (
        SELECT
          *,
          CASE
            WHEN frontend IS NULL
              OR backend IS NULL
              OR databases IS NULL
              OR problem_solving IS NULL
            THEN NULL
            ELSE
              (frontend * 0.30) +
              (backend * 0.30) +
              (databases * 0.25) +
              (problem_solving * 0.15)
          END AS overall_score
        FROM student_scores
      )

      SELECT
        COUNT(*) AS total_students,

        COUNT(*) FILTER (
          WHERE overall_score >= 80
        ) AS ready,

        COUNT(*) FILTER (
          WHERE overall_score >= 65
            AND overall_score < 80
        ) AS nearly_ready,

        COUNT(*) FILTER (
          WHERE overall_score >= 50
            AND overall_score < 65
        ) AS developing,

        COUNT(*) FILTER (
          WHERE overall_score < 50
        ) AS needs_preparation,

        COUNT(*) FILTER (
          WHERE overall_score IS NULL
        ) AS incomplete

      FROM calculated_students;
      `,
            [tenantId]
        );

        const stats = result.rows[0];

        res.status(200).json({
            totalStudents: Number(stats.total_students),
            ready: Number(stats.ready),
            nearlyReady: Number(stats.nearly_ready),
            developing: Number(stats.developing),
            needsPreparation: Number(stats.needs_preparation),
            incomplete: Number(stats.incomplete),
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            code: "INTERNAL_ERROR",
            message: "Something went wrong",
            requestId: req.requestId,
            fields: {},
        });
    }
};

export const getAllActivity = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;

        const events = await Event.find({
            tenantId,
        })
            .sort({ occurredAt: -1 })
            .limit(50)
            .lean();

        return res.status(200).json({
            activities: events,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            code: "INTERNAL_ERROR",
            message: "Something went wrong",
            requestId: req.requestId,
            fields: {},
        });
    }
};