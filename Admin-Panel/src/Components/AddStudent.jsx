import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    UserPlus,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";

const AddStudent = () => {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        // Frontend validation
        if (!name.trim()) {
            setError("Student name is required.");
            return;
        }

        if (name.trim().length < 2) {
            setError("Student name must contain at least 2 characters.");
            return;
        }

        if (email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(email.trim())) {
                setError("Please enter a valid email address.");
                return;
            }
        }

        try {
            setSaving(true);

            const token = localStorage.getItem("token");

            if (!token) {
                setError("Authentication required. Please login again.");
                return;
            }

            const response = await fetch(
                "http://localhost:5000/api/students",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                        name: name.trim(),
                        email: email.trim() || null,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to create student"
                );
            }

            setSuccess("Student created successfully.");

            // Go to student details after successful creation
            setTimeout(() => {
                if (data.student?.id) {
                    navigate(`/students/${data.student.id}`);
                } else {
                    navigate("/students");
                }
            }, 700);

        } catch (error) {
            console.error("Create student error:", error);

            setError(error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">

            {/* Back */}
            <button
                onClick={() => navigate("/students")}
                className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
                <ArrowLeft size={18} />
                Back to Students
            </button>

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">
                    Add Student
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Create a new student in your organisation.
                </p>
            </div>

            {/* Form */}
            <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

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
                            <p className="font-semibold text-red-700">
                                Unable to create student
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
                            <p className="font-semibold text-green-700">
                                Student Created
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
                            htmlFor="student-name"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Student Name
                        </label>

                        <input
                            id="student-name"
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setError("");
                            }}
                            disabled={saving}
                            maxLength={100}
                            placeholder="Enter student name"
                            autoComplete="name"
                            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                        />
                    </div>

                    {/* Email */}
                    <div className="mt-5">
                        <label
                            htmlFor="student-email"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Email
                            <span className="ml-1 font-normal text-slate-400">
                                (optional)
                            </span>
                        </label>

                        <input
                            id="student-email"
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError("");
                            }}
                            disabled={saving}
                            maxLength={150}
                            placeholder="student@example.com"
                            autoComplete="email"
                            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                        />
                    </div>

                    {/* Organisation info */}
                    <div className="mt-5 rounded-lg bg-slate-50 p-4">
                        <p className="text-xs leading-5 text-slate-500">
                            The student will automatically be assigned to
                            your authenticated organisation. Organisation ID
                            is not accepted from the browser.
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="mt-7 flex gap-3">

                        <button
                            type="button"
                            onClick={() => navigate("/students")}
                            disabled={saving}
                            className="flex-1 rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving || !name.trim()}
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <RefreshCw
                                        size={18}
                                        className="animate-spin"
                                    />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <UserPlus size={18} />
                                    Create Student
                                </>
                            )}
                        </button>

                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStudent;