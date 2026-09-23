import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    User,
    Mail,
    Trophy,
    Code2,
    Server,
    Database,
    Brain,
    Plus,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Clock,
} from "lucide-react";

const StudentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [studentData, setStudentData] = useState(null);
    const [activity, setActivity] = useState([]);

    const [loading, setLoading] = useState(true);
    const [activityLoading, setActivityLoading] = useState(true);
    const [error, setError] = useState("");

    // =========================
    // FETCH STUDENT
    // =========================
    const fetchStudent = async () => {
        try {
            setLoading(true);
            setError("");

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
                throw new Error(data.message || "Failed to fetch student");
            }

            // Exact backend response:
            // {
            //   student,
            //   competencies,
            //   overallScore,
            //   status
            // }

            setStudentData(data);
        } catch (error) {
            console.error(error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // FETCH ACTIVITY
    // =========================
    const fetchActivity = async () => {
        try {
            setActivityLoading(true);

            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/students/${id}/activity`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch activity"
                );
            }

            setActivity(data.activities || []);
        } catch (error) {
            console.error("Activity error:", error);
        } finally {
            setActivityLoading(false);
        }
    };

    useEffect(() => {
        fetchStudent();
        fetchActivity();
    }, [id]);

    // =========================
    // HELPERS
    // =========================

    const getStatusStyle = (status) => {
        switch (status) {
            case "READY":
                return "bg-green-100 text-green-700 border-green-200";

            case "NEARLY_READY":
                return "bg-blue-100 text-blue-700 border-blue-200";

            case "DEVELOPING":
                return "bg-yellow-100 text-yellow-700 border-yellow-200";

            case "NEEDS_PREPARATION":
                return "bg-red-100 text-red-700 border-red-200";

            case "INCOMPLETE":
            default:
                return "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    const formatStatus = (status) => {
        if (!status) return "Incomplete";

        return status
            .replaceAll("_", " ")
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const getScoreColor = (score) => {
        if (score === null || score === undefined) {
            return "text-slate-400";
        }

        if (score >= 80) return "text-green-600";
        if (score >= 65) return "text-blue-600";
        if (score >= 50) return "text-yellow-600";

        return "text-red-600";
    };

    const getCompetencyIcon = (name) => {
        switch (name) {
            case "Frontend":
                return Code2;

            case "Backend":
                return Server;

            case "Databases":
                return Database;

            case "Problem Solving":
                return Brain;

            default:
                return Trophy;
        }
    };

    const formatDate = (date) => {
        if (!date) return "Unknown date";

        return new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // =========================
    // LOADING
    // =========================

    if (loading) {
        return (
            <div className="flex min-h-[80vh] items-center justify-center">
                <div className="text-center">
                    <RefreshCw
                        size={32}
                        className="mx-auto animate-spin text-slate-400"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                        Loading student...
                    </p>
                </div>
            </div>
        );
    }

    // =========================
    // ERROR
    // =========================

    if (error) {
        return (
            <div className="p-6">
                <button
                    onClick={() => navigate("/students")}
                    className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft size={18} />
                    Back to Students
                </button>

                <div className="rounded-xl border border-red-200 bg-red-50 p-10 text-center">
                    <XCircle
                        size={40}
                        className="mx-auto text-red-500"
                    />

                    <h2 className="mt-4 text-lg font-semibold text-red-700">
                        Failed to load student
                    </h2>

                    <p className="mt-2 text-sm text-red-600">
                        {error}
                    </p>

                    <button
                        onClick={fetchStudent}
                        className="mt-5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!studentData) {
        return null;
    }

    // Exact backend data
    const { student, competencies, overallScore, status } =
        studentData;

    return (
        <div className="min-h-screen bg-slate-50 p-6">

            {/* =========================
          BACK
      ========================= */}

            <button
                onClick={() => navigate("/students")}
                className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
                <ArrowLeft size={18} />
                Back to Students
            </button>

            {/* =========================
          STUDENT HEADER
      ========================= */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                    <div className="flex items-center gap-4">

                        {/* Avatar */}
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-xl font-bold text-white">
                            {student.name?.charAt(0)?.toUpperCase()}
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">
                                {student.name}
                            </h1>

                            <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">

                                <span className="flex items-center gap-1.5">
                                    <Mail size={15} />
                                    {student.email || "No email"}
                                </span>

                                <span className="flex items-center gap-1.5">
                                    <User size={15} />
                                    Student #{student.id}
                                </span>

                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                            onClick={() =>
                                navigate(`/students/${student.id}/edit`)
                            }
                            className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            Edit Student
                        </button>

                        <button
                            onClick={() =>
                                navigate(`/students/${student.id}/attempt`)
                            }
                            className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700"
                        >
                            <Plus size={18} />
                            Add Attempt
                        </button>
                    </div>

                </div>
            </div>

            {/* =========================
          OVERALL SCORE + STATUS
      ========================= */}

            <div className="mt-6 grid gap-6 md:grid-cols-3">

                {/* Overall Score */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2">

                    <div className="flex items-start justify-between">

                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Overall Readiness Score
                            </p>

                            <div className="mt-2 flex items-end gap-2">

                                <span className="text-4xl font-bold text-slate-900">
                                    {overallScore}
                                </span>

                                <span className="mb-1 text-lg text-slate-400">
                                    / 100
                                </span>

                            </div>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100">
                            <Trophy
                                size={24}
                                className="text-yellow-600"
                            />
                        </div>

                    </div>

                    {/* Score Progress */}

                    <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">

                        <div
                            className="h-full rounded-full bg-slate-900 transition-all"
                            style={{
                                width: `${Math.min(
                                    Math.max(overallScore, 0),
                                    100
                                )}%`,
                            }}
                        />

                    </div>

                </div>

                {/* Status */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    <p className="text-sm font-medium text-slate-500">
                        Readiness Status
                    </p>

                    <div className="mt-4">
                        <span
                            className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${getStatusStyle(
                                status
                            )}`}
                        >
                            {formatStatus(status)}
                        </span>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-slate-500">
                        Status is calculated from the latest valid attempt
                        for each required competency.
                    </p>

                </div>

            </div>

            {/* =========================
          COMPETENCIES
      ========================= */}

            <div className="mt-8">

                <div className="mb-4">
                    <h2 className="text-lg font-bold text-slate-800">
                        Competency Performance
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Latest non-voided attempt for each competency
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    {competencies.map((competency) => {

                        const Icon = getCompetencyIcon(
                            competency.name
                        );

                        return (
                            <div
                                key={competency.name}
                                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                            >

                                <div className="flex items-center justify-between">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                                        <Icon
                                            size={20}
                                            className="text-slate-700"
                                        />
                                    </div>

                                    <span
                                        className={`text-2xl font-bold ${getScoreColor(
                                            competency.score
                                        )}`}
                                    >
                                        {competency.score !== null
                                            ? competency.score
                                            : "—"}
                                    </span>

                                </div>

                                <h3 className="mt-4 font-semibold text-slate-800">
                                    {competency.name}
                                </h3>

                                <p className="mt-1 text-xs text-slate-500">
                                    Weight: {competency.weight * 100}%
                                </p>

                                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">

                                    <div
                                        className="h-full rounded-full bg-slate-900"
                                        style={{
                                            width:
                                                competency.score !== null
                                                    ? `${competency.score}%`
                                                    : "0%",
                                        }}
                                    />

                                </div>

                            </div>
                        );
                    })}

                </div>
            </div>

            {/* =========================
          ACTIVITY
      ========================= */}

            <div className="mt-8">

                <div className="mb-4">
                    <h2 className="text-lg font-bold text-slate-800">
                        Recent Activity
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Assessment events for this student
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                    {activityLoading ? (

                        <div className="p-8 text-center">

                            <RefreshCw
                                size={24}
                                className="mx-auto animate-spin text-slate-400"
                            />

                            <p className="mt-2 text-sm text-slate-500">
                                Loading activity...
                            </p>

                        </div>

                    ) : activity.length === 0 ? (

                        <div className="p-8 text-center">

                            <Clock
                                size={32}
                                className="mx-auto text-slate-300"
                            />

                            <p className="mt-3 text-sm font-medium text-slate-600">
                                No activity yet
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Assessment attempts will appear here.
                            </p>

                        </div>

                    ) : (

                        <div className="divide-y divide-slate-100">

                            {activity.map((event) => {

                                const isSuccess =
                                    event.eventType === "attempt.succeeded";

                                return (
                                    <div
                                        key={event.eventId}
                                        className="flex gap-4 p-5"
                                    >

                                        <div
                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isSuccess
                                                ? "bg-green-100"
                                                : "bg-red-100"
                                                }`}
                                        >
                                            {isSuccess ? (
                                                <CheckCircle2
                                                    size={20}
                                                    className="text-green-600"
                                                />
                                            ) : (
                                                <XCircle
                                                    size={20}
                                                    className="text-red-600"
                                                />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">

                                            <div className="flex flex-col justify-between gap-1 sm:flex-row">

                                                <h3 className="text-sm font-semibold text-slate-800">
                                                    {isSuccess
                                                        ? "Assessment attempt succeeded"
                                                        : "Assessment attempt rejected"}
                                                </h3>

                                                <span className="text-xs text-slate-400">
                                                    {formatDate(event.occurredAt)}
                                                </span>

                                            </div>

                                            <p className="mt-1 text-xs text-slate-500">
                                                Request ID: {event.requestId}
                                            </p>

                                            {event.attemptId && (
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Attempt ID: #{event.attemptId}
                                                </p>
                                            )}

                                        </div>

                                    </div>
                                );
                            })}

                        </div>
                    )}

                </div>
            </div>

        </div>
    );
};

export default StudentDetails;