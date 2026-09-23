import {
    LayoutDashboard,
    Users,
    Activity,
    LogOut,
} from "lucide-react";
import { NavLink } from "react-router-dom";

function AdminSidebar() {
    const navItemClass = ({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
            isActive
                ? "bg-slate-800 text-white shadow-lg shadow-slate-900/20"
                : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
        }`;

    return (
        <aside className="w-full border-b border-slate-800 bg-slate-900 p-4 text-white lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r lg:p-5">
            <div className="mb-6 flex items-center justify-between gap-3 lg:mb-10 lg:block">
                <div>
                    <h1 className="text-lg font-bold lg:text-xl">
                        Student Readiness
                    </h1>
                    <p className="mt-1 text-xs text-slate-400 lg:text-sm">
                        Control Center
                    </p>
                </div>
            </div>

            <nav className="flex flex-wrap gap-2 lg:block lg:space-y-2">
                <NavLink to="/dashboard" className={navItemClass}>
                    <LayoutDashboard size={18} />
                    Dashboard
                </NavLink>

                <NavLink to="/students" className={navItemClass}>
                    <Users size={18} />
                    Students
                </NavLink>

                <NavLink to="/activity" className={navItemClass}>
                    <Activity size={18} />
                    Activity
                </NavLink>
            </nav>

            <div className="mt-6 border-t border-slate-800 pt-4 lg:mt-auto lg:pt-10">
                <button
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-slate-800"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </aside>
    );
}

export default AdminSidebar;