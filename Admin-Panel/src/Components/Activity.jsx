import { useEffect, useState } from "react";
import {
    CheckCircle,
    XCircle,
    Activity as ActivityIcon,
} from "lucide-react";

function Activity() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await fetch(
                    "http://localhost:5000/api/students/activity",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to load activity"
                    );
                }

                setActivities(data.activities || []);
            } catch (error) {
                console.log(error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchActivity();
    }, []);

    const formatDate = (date) => {
        return new Date(date).toLocaleString();
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    Activity
                </h1>

                <p className="text-gray-500 mt-1">
                    Recent assessment and system activity
                </p>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm p-6">

                {loading ? (
                    <p className="text-gray-500">
                        Loading activity...
                    </p>
                ) : activities.length === 0 ? (
                    <div className="text-center py-12">
                        <ActivityIcon
                            className="mx-auto text-gray-400"
                            size={40}
                        />

                        <p className="text-gray-500 mt-3">
                            No activity found
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5">

                        {activities.map((activity) => (
                            <div
                                key={activity.eventId}
                                className="flex items-start gap-4 border-b pb-5 last:border-b-0"
                            >

                                <div className="p-3 bg-gray-100 rounded-lg">
                                    {activity.eventType === "attempt.succeeded" ? (
                                        <CheckCircle
                                            className="text-green-600"
                                            size={22}
                                        />
                                    ) : (
                                        <XCircle
                                            className="text-red-600"
                                            size={22}
                                        />
                                    )}
                                </div>

                                <div className="flex-1">

                                    <p className="font-medium text-gray-800">
                                        {activity.eventType ===
                                            "attempt.succeeded"
                                            ? "Assessment attempt submitted"
                                            : "Assessment attempt rejected"}
                                    </p>

                                    <p className="text-sm text-gray-500 mt-1">
                                        Student ID: {activity.studentId ?? "N/A"}
                                    </p>

                                    {activity.attemptId && (
                                        <p className="text-sm text-gray-500">
                                            Attempt ID: {activity.attemptId}
                                        </p>
                                    )}

                                    <p className="text-xs text-gray-400 mt-2">
                                        {formatDate(activity.occurredAt)}
                                    </p>

                                </div>

                            </div>
                        ))}

                    </div>
                )}

            </div>
        </div>
    );
}

export default Activity;