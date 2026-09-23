import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    RefreshCw,
    Users,
} from "lucide-react";

const Students = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = Number(searchParams.get("page")) || 1;
    const sortBy = searchParams.get("sortBy") || "name";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const [searchInput, setSearchInput] = useState(search);

    const limit = 10;

    const fetchStudents = async () => {
        try {
            setError("");

            if (students.length > 0) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const token = localStorage.getItem("token");

            const params = new URLSearchParams({
                search,
                status,
                page,
                limit,
                sortBy,
                sortOrder,
            });

            const response = await fetch(
                `http://localhost:5000/api/students?${params.toString()}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch students");
            }

            setStudents(data.students || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [search, status, page, sortBy, sortOrder]);

    // Search with small delay
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== search) {
                updateParams({
                    search: searchInput,
                    page: 1,
                });
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [searchInput]);

    const updateParams = (updates) => {
        const newParams = new URLSearchParams(searchParams);

        Object.entries(updates).forEach(([key, value]) => {
            if (value === "" || value === null || value === undefined) {
                newParams.delete(key);
            } else {
                newParams.set(key, value);
            }
        });

        setSearchParams(newParams);
    };

    const handleStatusChange = (e) => {
        updateParams({
            status: e.target.value,
            page: 1,
        });
    };

    const handleSort = (field) => {
        let newOrder = "asc";

        if (sortBy === field) {
            newOrder = sortOrder === "asc" ? "desc" : "asc";
        }

        updateParams({
            sortBy: field,
            sortOrder: newOrder,
            page: 1,
        });
    };

    const handlePrevious = () => {
        if (page > 1) {
            updateParams({
                page: page - 1,
            });
        }
    };

    const handleNext = () => {
        if (students.length === limit) {
            updateParams({
                page: page + 1,
            });
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "READY":
                return "bg-green-100 text-green-700";

            case "NEARLY_READY":
                return "bg-blue-100 text-blue-700";

            case "DEVELOPING":
                return "bg-yellow-100 text-yellow-700";

            case "NEEDS_PREPARATION":
                return "bg-red-100 text-red-700";

            case "INCOMPLETE":
                return "bg-gray-100 text-gray-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const formatStatus = (status) => {
        if (!status) return "Incomplete";

        return status
            .replaceAll("_", " ")
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        Students
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage students and monitor their readiness
                    </p>
                </div>

                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/students/add')}
                        className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 bg-black-500"
                    >
                        Add Student
                    </button>

                    <button
                        onClick={fetchStudents}
                        disabled={refreshing}
                        className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
                    >
                        <RefreshCw
                            size={16}
                            className={refreshing ? "animate-spin" : ""}
                        />

                        Refresh
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="mt-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row">
                {/* Search */}
                <div className="relative flex-1">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search student name or email..."
                        className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400"
                    />
                </div>

                {/* Status */}
                <select
                    value={status}
                    onChange={handleStatusChange}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-400"
                >
                    <option value="">All Status</option>
                    <option value="READY">Ready</option>
                    <option value="NEARLY_READY">Nearly Ready</option>
                    <option value="DEVELOPING">Developing</option>
                    <option value="NEEDS_PREPARATION">
                        Needs Preparation
                    </option>
                    <option value="INCOMPLETE">Incomplete</option>
                </select>
            </div>

            {/* Error */}
            {error && (
                <div className="mt-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <span>{error}</span>

                    <button
                        onClick={fetchStudents}
                        className="font-semibold underline"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Loading */}
            {loading ? (
                <div className="mt-6 rounded-xl border border-slate-200 bg-white p-12 text-center">
                    <RefreshCw
                        size={28}
                        className="mx-auto animate-spin text-slate-400"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                        Loading students...
                    </p>
                </div>
            ) : students.length === 0 ? (
                /* Empty */
                <div className="mt-6 rounded-xl border border-slate-200 bg-white p-12 text-center">
                    <Users
                        size={40}
                        className="mx-auto text-slate-300"
                    />

                    <h3 className="mt-4 font-semibold text-slate-700">
                        No students found
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        Try changing your search or filters.
                    </p>
                </div>
            ) : (
                <>
                    {/* Table */}
                    <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px] text-left">
                                <thead className="border-b border-slate-200 bg-slate-50">
                                    <tr>
                                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            #
                                        </th>

                                        <th className="px-5 py-4">
                                            <button
                                                onClick={() => handleSort("name")}
                                                className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"
                                            >
                                                Student
                                                <ArrowUpDown size={14} />
                                            </button>
                                        </th>

                                        <th className="px-5 py-4">
                                            <button
                                                onClick={() => handleSort("email")}
                                                className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"
                                            >
                                                Email
                                                <ArrowUpDown size={14} />
                                            </button>
                                        </th>

                                        <th className="px-5 py-4">
                                            <button
                                                onClick={() => handleSort("overall_score")}
                                                className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"
                                            >
                                                Score
                                                <ArrowUpDown size={14} />
                                            </button>
                                        </th>

                                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Status
                                        </th>

                                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {students.map((student, index) => (
                                        <tr
                                            key={student.id}
                                            className="transition hover:bg-slate-50"
                                        >
                                            <td className="px-5 py-4 text-sm text-slate-500">
                                                {(page - 1) * limit + index + 1}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="font-medium text-slate-800">
                                                    {student.name}
                                                </div>

                                                <div className="mt-1 text-xs text-slate-400">
                                                    Student #{student.id}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {student.email || "—"}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="font-semibold text-slate-800">
                                                    {student.overall_score !== null &&
                                                        student.overall_score !== undefined
                                                        ? `${student.overall_score}%`
                                                        : "—"}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                                                        student.readiness_status
                                                    )}`}
                                                >
                                                    {formatStatus(student.readiness_status)}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <button
                                                    onClick={() =>
                                                        navigate(`/students/${student.id}`)
                                                    }
                                                    className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-700"
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
                            <p className="text-sm text-slate-500">
                                Page <span className="font-semibold">{page}</span>
                            </p>

                            <div className="flex gap-2">
                                <button
                                    onClick={handlePrevious}
                                    disabled={page === 1}
                                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronLeft size={16} />
                                    Previous
                                </button>

                                <button
                                    onClick={handleNext}
                                    disabled={students.length < limit}
                                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Students;