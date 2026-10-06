import { Outlet } from "react-router";

export default function AppLayout() {
    return (
        <div className="flex min-h-screen">
            <aside className="w-60 shrink-0 border-r p-4">
                <h1 className="text-xl font-bold">TechTicket</h1>
            </aside>
            <main className="flex-1 p-6">
                <Outlet />
            </main>
        </div>
    );
}
