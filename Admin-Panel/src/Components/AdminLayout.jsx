import AdminSidebar from "./AdminSidebar";

function AdminLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col bg-slate-100 lg:flex-row">
            <AdminSidebar />

            <main className="flex-1 overflow-x-hidden">
                {children}
            </main>
        </div>
    );
}

export default AdminLayout;