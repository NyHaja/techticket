import { useState } from "react";
import { Outlet } from "react-router";
import Sidebar from "../components/Sidebar";
import type { Role } from "../types/role";

export default function AppLayout() {
    // TODO: remplacer par le rôle de l'utilisateur connecté (GET /auth/me)
    const [role, setRole] = useState<Role>("EMPLOYE");

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar role={role} onRoleChange={setRole} />
            <main className="flex-1 p-6">
                <Outlet />
            </main>
        </div>
    );
}
