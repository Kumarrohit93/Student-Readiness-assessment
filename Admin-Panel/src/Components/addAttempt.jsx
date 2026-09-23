import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    Send,
    Code2,
    Server,
    Database,
    Brain,
} from "lucide-react";

const AddAttempt = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [student, setStudent] = useState(null);

    const [competencyId, setCompetencyId] = useState("");
    const [score, setScore] = useState("");

    const [loadingStudent, setLoadingStudent] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Keep the same key if request needs to be retried
    const [idempotencyKey, setIdempotencyKey] = useState(() =>
        crypto.randomUUID()
    );

    // =========================
    // COMPETENCIES
    // =========================

    const competencies = [
        {
            id: 1,
            name: "Frontend",
            description: "React, JavaScript and UI development",
            icon: Code2,
        },
        {
            id: 2,
            name: "Backend",
            description: "Node.js, Express and API development",
            icon: Server,
        },
        {
            id: 3,
            name: "Databases",
            description: "SQL, PostgreSQL and MongoDB",
            icon: Database,
        },
        {
            id: 4,
            name: "Problem Solving",
            description: "DSA and logical problem solving",
            icon: Brain,
        },
    ];

    // =========================
    // FETCH STUDENT
    // =========================

    const fetchStudent = async () => {
        try {
            setLoadingStudent(true);

            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/students/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch student"
                );
            }

            setStudent(data.student);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoadingStudent(false);
        }
    };

    useEffect(() => {
        fetchStudent();
    }, [id]);

    // =========================
    // HANDLE SCORE
    // =========================

    const handleScoreChange = (e) => {
        const value = e.target.value;

        // Allow empty input
        if (value === "") {
            setScore("");
            return;
        }

        // Only numbers
        if (!/^\d+$/.test(value)) {
            return;
        }

        const numericValue = Number(value);

        // Don't allow more than 100
        if (numericValue > 100) {
            return;
        }

        setScore(value);
    };

    // =========================
    // SUBMIT ATTEMPT
    // =========================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        // Frontend validation
        if (!competencyId) {
            setError("Please select a competency.");
            return;
        }

        if (score === "") {
            setError("Please enter a score.");
            return;
        }

        const numericScore = Number(score);

        if (
            Number.isNaN(numericScore) ||
            numericScore < 0 ||
            numericScore > 100
        ) {
            setError("Score must be between 0 and 100.");
            return;
        }

        try {
            setSubmitting(true);

            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/students/${id}/attempts`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,

                        // Important for backend idempotency
                        "Idempotency-Key": idempotencyKey,
                    },

                    body: JSON.stringify({
                        competencyId: Number(competencyId),
                        score: numericScore,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to create attempt"
                );
            }

            // Backend can return 201 for new attempt
            // or 200 for an idempotent replay.
            setSuccess(
                data.message || "Attempt submitted successfully."
            );

            /*
              Wait a little so user can see success,
              then go back to student details.
            */
            setTimeout(() => {
                navigate(`/students/${id}`);
            }, 800);
        } catch (error) {
            console.error(error);

            setError(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    // =========================
    // NEW ATTEMPT KEY
    // =========================

    const generateNewKey = () => {
        setIdempotencyKey(crypto.randomUUID());
    };

    // =========================
    // LOADING STUDENT
    // =========================

    if (loadingStudent) {
        return (
            <div className="flex min-h-[80vh] items-center justify-center">
                <div className="text-center">
                    <RefreshCw
                        size={30}
                        className="mx-auto animate-spin text-slate-400"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                        Loading student...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6">

            {/* =========================
          BACK
      ========================= */}

            <button
                onClick={() => navigate(`/students/${id}`)}
                className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
                <ArrowLeft size={18} />
                Back to Student
            </button>

            {/* =========================
          HEADER
      ========================= */}

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">
                    Add Assessment Attempt
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Record a new competency attempt for this student.
                </p>
            </div>

            {/* =========================
          STUDENT INFO
      ========================= */}

            {student && (
                <div className="mb-6 flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 font-bold text-white">
                        {student.name?.charAt(0)?.toUpperCase()}
                    </div>

                    <div>
                        <h2 className="font-semibold text-slate-800">
                            {student.name}
                        </h2>

                        <p className="text-sm text-slate-500">
                            {student.email || "No email"}
                        </p>
                    </div>

                </div>
            )}

            {/* =========================
          FORM
      ========================= */}

            <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <form onSubmit={handleSubmit}>

                    {/* Error */}
                    {error && (
                        <div
                            role="alert"
                            className="mb-5 flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4"
                        >
                            <AlertCircle
                                size={20}
                                className="shrink-0 text-red-600"
                            />

                            <div>
                                <p className="text-sm font-semibold text-red-700">
                                    Submission failed
                                </p>

                                <p className="mt-1 text-sm text-red-600">
                                    {error}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div
                            role="status"
                            className="mb-5 flex gap-3 rounded-lg border border-green-200 bg-green-50 p-4"
                        >
                            <CheckCircle2
                                size={20}
                                className="shrink-0 text-green-600"
                            />

                            <div>
                                <p className="text-sm font-semibold text-green-700">
                                    Success
                                </p>

                                <p className="mt-1 text-sm text-green-600">
                                    {success}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* =========================
              COMPETENCY
          ========================= */}

                    <div>
                        <label
                            htmlFor="competency"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Competency
                        </label>

                        <select
                            id="competency"
                            value={competencyId}
                            onChange={(e) => {
                                setCompetencyId(e.target.value);
                                setError("");
                            }}
                            disabled={submitting}
                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                        >
                            <option value="">
                                Select competency
                            </option>

                            {competencies.map((competency) => (
                                <option
                                    key={competency.id}
                                    value={competency.id}
                                >
                                    {competency.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* =========================
              COMPETENCY CARDS
          ========================= */}

                    <div className="mt-4 grid grid-cols-2 gap-3">

                        {competencies.map((competency) => {
                            const Icon = competency.icon;

                            const selected =
                                Number(competencyId) === competency.id;

                            return (
                                <button
                                    type="button"
                                    key={competency.id}
                                    disabled={submitting}
                                    onClick={() => {
                                        setCompetencyId(String(competency.id));
                                        setError("");
                                    }}
                                    className={`rounded-xl border p-4 text-left transition ${selected
                                            ? "border-slate-900 bg-slate-50 ring-2 ring-slate-200"
                                            : "border-slate-200 hover:border-slate-400"
                                        }`}
                                >
                                    <Icon
                                        size={20}
                                        className="text-slate-700"
                                    />

                                    <p className="mt-2 text-sm font-semibold text-slate-800">
                                        {competency.name}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        {competency.description}
                                    </p>
                                </button>
                            );
                        })}

                    </div>

                    {/* =========================
              SCORE
          ========================= */}

                    <div className="mt-6">

                        <label
                            htmlFor="score"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Score
                        </label>

                        <div className="relative">

                            <input
                                id="score"
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={score}
                                onChange={handleScoreChange}
                                disabled={submitting}
                                placeholder="Enter score"
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 pr-14 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                            />

                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                                / 100
                            </span>

                        </div>

                        <p className="mt-2 text-xs text-slate-500">
                            Enter a score between 0 and 100.
                        </p>

                    </div>

                    {/* =========================
              SUBMIT
          ========================= */}

                    <button
                        type="submit"
                        disabled={submitting || !competencyId || score === ""}
                        className="mt-7 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {submitting ? (
                            <>
                                <RefreshCw
                                    size={18}
                                    className="animate-spin"
                                />

                                Submitting...
                            </>
                        ) : (
                            <>
                                <Send size={18} />

                                Submit Attempt
                            </>
                        )}
                    </button>

                </form>

                {/* =========================
            RETRY INFORMATION
        ========================= */}

                <div className="mt-5 rounded-lg bg-slate-50 p-4">

                    <p className="text-xs leading-5 text-slate-500">
                        <strong className="text-slate-700">
                            Safe retry:
                        </strong>{" "}
                        This submission uses an Idempotency-Key. If the
                        request needs to be retried, the same key is
                        reused so the backend does not create a duplicate
                        attempt.
                    </p>

                </div>

            </div>
        </div>
    );
};

export default AddAttempt;