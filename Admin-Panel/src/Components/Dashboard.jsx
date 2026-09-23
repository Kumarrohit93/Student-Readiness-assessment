import { useEffect, useState } from "react";
import {
    Users,
    CheckCircle,
    Clock,
    AlertCircle,
} from "lucide-react";

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:5000/api/students/dashboard/stats",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to load dashboard");
            }

            setStats(data);
        } catch (error) {
            console.log(error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-6">

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    Dashboard
                </h1>

                <p className="text-gray-500 mt-1">
                    Student Readiness Control Center
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-red-600">
                    {error}
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

                {/* Total Students */}
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">
                                Total Students
                            </p>

                            <h2 className="text-3xl font-bold text-gray-800 mt-2">
                                {loading ? "..." : stats?.totalStudents ?? 0}
                            </h2>
                        </div>

                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Users className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>

                {/* Ready */}
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">
                                Ready
                            </p>

                            <h2 className="text-3xl font-bold text-gray-800 mt-2">
                                {loading ? "..." : stats?.ready ?? 0}
                            </h2>
                        </div>

                        <div className="p-3 bg-green-100 rounded-lg">
                            <CheckCircle className="text-green-600" size={24} />
                        </div>
                    </div>
                </div>

                {/* Nearly Ready */}
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">
                                Nearly Ready
                            </p>

                            <h2 className="text-3xl font-bold text-gray-800 mt-2">
                                {loading ? "..." : stats?.nearlyReady ?? 0}
                            </h2>
                        </div>

                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <Clock className="text-yellow-600" size={24} />
                        </div>
                    </div>
                </div>

                {/* Needs Preparation */}
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">
                                Needs Preparation
                            </p>

                            <h2 className="text-3xl font-bold text-gray-800 mt-2">
                                {loading ? "..." : stats?.needsPreparation ?? 0}
                            </h2>
                        </div>

                        <div className="p-3 bg-red-100 rounded-lg">
                            <AlertCircle className="text-red-600" size={24} />
                        </div>
                    </div>
                </div>

            </div>

            {/* Additional Stats */}
            <div className="bg-white rounded-xl shadow-sm mt-8 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-5">
                    Readiness Overview
                </h2>

                {loading ? (
                    <p className="text-gray-500">
                        Loading...
                    </p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        <div className="border rounded-lg p-4">
                            <p className="text-sm text-gray-500">
                                Developing
                            </p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">
                                {stats?.developing ?? 0}
                            </p>
                        </div>

                        <div className="border rounded-lg p-4">
                            <p className="text-sm text-gray-500">
                                Incomplete
                            </p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">
                                {stats?.incomplete ?? 0}
                            </p>
                        </div>

                    </div>
                )}
            </div>

        </div>
    );
}

export default Dashboard;