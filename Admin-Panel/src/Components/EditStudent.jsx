import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Save,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
} from "lucide-react";

const EditStudent = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [student, setStudent] = useState(null);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =========================
    // GET STUDENT
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
                throw new Error(
                    data.message || "Failed to fetch student"
                );
            }

            const currentStudent = data.student;

            setStudent(currentStudent);
            setName(currentStudent.name || "");
            setEmail(currentStudent.email || "");
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudent();
    }, [id]);

    // =========================
    // UPDATE STUDENT
    // =========================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!name.trim()) {
            setError("Student name is required.");
            return;
        }

        try {
            setSaving(true);

            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/students/${id}`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                        name: name.trim(),
                        email: email.trim(),
                        expectedVersion: student.version,
                    }),
                }
            );

            const data = await response.json();

            // =========================
            // STALE VERSION
            // =========================

            if (response.status === 409) {
                setError(
                    "This student was modified by another request. Your form contains an older version."
                );

                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to update student"
                );
            }

            // Update local version/data
            setStudent(data.student);

            setName(data.student.name || "");
            setEmail(data.student.email || "");

            setSuccess("Student updated successfully.");

            // Go back after short delay
            setTimeout(() => {
                navigate(`/students/${id}`);
            }, 700);
        } catch (error) {
            console.error(error);
            setError(error.message);
        } finally {
            setSaving(false);
        }
    };

    // =========================
    // LOADING
    // =========================

    if (loading) {
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

    // =========================
    // PAGE
    // =========================

    return (
        <div className="min-h-screen bg-slate-50 p-6">

            {/* Back */}
            <button
                onClick={() => navigate(`/students/${id}`)}
                className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
                <ArrowLeft size={18} />
                Back to Student
            </button>

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">
                    Edit Student
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Update student information.
                </p>
            </div>

            {/* Form */}
            <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                {/* Error */}
                {error && (
                    <div
                        role="alert"
                        className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4"
                    >
                        <div className="flex gap-3">

                            <AlertCircle
                                size={20}
                                className="shrink-0 text-red-600"
                            />

                            <div>
                                <p className="font-semibold text-red-700">
                                    Update failed
                                </p>

                                <p className="mt-1 text-sm text-red-600">
                                    {error}
                                </p>
                            </div>

                        </div>

                        {/* Conflict refresh */}
                        {error.includes("modified by another request") && (
                            <button
                                onClick={fetchStudent}
                                className="mt-4 flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                            >
                                <RefreshCw size={16} />
                                Load Latest Version
                            </button>
                        )}
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
                            <p className="font-semibold text-green-700">
                                Success
                            </p>

                            <p className="mt-1 text-sm text-green-600">
                                {success}
                            </p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    {/* Name */}
                    <div>
                        <label
                            htmlFor="name"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Student Name
                        </label>

                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={saving}
                            maxLength={100}
                            placeholder="Enter student name"
                            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                        />
                    </div>

                    {/* Email */}
                    <div className="mt-5">
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={saving}
                            maxLength={150}
                            placeholder="Enter student email"
                            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                        />
                    </div>

                    {/* Version */}
                    <div className="mt-5 rounded-lg bg-slate-50 p-4">
                        <p className="text-xs text-slate-500">
                            Current record version
                        </p>

                        <p className="mt-1 font-semibold text-slate-700">
                            v{student?.version}
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="mt-7 flex gap-3">

                        <button
                            type="button"
                            onClick={() => navigate(`/students/${id}`)}
                            disabled={saving}
                            className="flex-1 rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <RefreshCw
                                        size={18}
                                        className="animate-spin"
                                    />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Changes
                                </>
                            )}
                        </button>

                    </div>

                </form>
            </div>
        </div>
    );
};

export default EditStudent;