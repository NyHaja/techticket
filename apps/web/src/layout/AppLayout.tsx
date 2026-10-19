import { Outlet } from "react-router";
import Sidebar from "../components/Sidebar";
import { useCurrentUser } from "../features/auth/useAuth";

export default function AppLayout() {

    const user = useCurrentUser();
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar user={ user } />
            <main className="flex-1 p-6">
                <Outlet />
            </main>
        </div>
    );
}