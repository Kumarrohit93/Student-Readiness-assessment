import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginForm from "./Components/LoginForm";
import Dashboard from "./Components/Dashboard";
import AdminLayout from "./Components/AdminLayout";
import Students from "./Components/Student.jsx";
import StudentDetails from "./Components/StudentDetails";
import AddAttempt from "./Components/addAttempt.jsx";
import EditStudent from "./Components/EditStudent";
import AddStudent from "./Components/AddStudent";
import Activity from "./Components/Activity";

const App = () => {
    return (
        <BrowserRouter>
            <Routes>

                {/* Login - NO SIDEBAR */}
                <Route path="/login" element={<LoginForm />} />

                {/* Admin Panel - SIDEBAR */}
                <Route
                    path="/dashboard"
                    element={
                        <AdminLayout>
                            <Dashboard />
                        </AdminLayout>
                    }
                />

                <Route
                    path="/students"
                    element={
                        <AdminLayout>
                            <Students />
                        </AdminLayout>
                    }
                />

                <Route
                    path="/students/:id"
                    element={
                        <AdminLayout>
                            <StudentDetails />
                        </AdminLayout>
                    }
                />

                <Route
                    path="/students/:id/attempt"
                    element={
                        <AdminLayout>
                            <AddAttempt />
                        </AdminLayout>
                    }
                />

                <Route
                    path="/students/:id/edit"
                    element={
                        <AdminLayout>
                            <EditStudent />
                        </AdminLayout>
                    }
                />

                <Route
                    path="/students/add"
                    element={
                        <AdminLayout>
                            <AddStudent />
                        </AdminLayout>
                    }
                />

<Route
                    path="/activity"
                    element={
                        <AdminLayout>
                            <Activity />
                        </AdminLayout>
                    }
                />

                <Route path="*" element={<LoginForm />} />

            </Routes>
        </BrowserRouter>
    );
};

export default App;