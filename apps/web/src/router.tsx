import { createBrowserRouter } from "react-router";
import AppLayout from "./layout/AppLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import NewTicketPage from "./pages/NewTicketPage";
import TicketsPage from "./pages/TicketsPage";
import MyTicketsPage from "./pages/MyTicketsPage";
import TicketDetailsPage from "./pages/TicketDetailsPage";
import ReportsPage from "./pages/ReportsPage";
import AdminPage from "./pages/AdminPage";
import NotFoundPage from "./pages/NotFoundPage";
import RequireAuth from "./features/auth/RequireAuth";
import RequireRole from "./features/auth/RequireRole";

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        element: <RequireAuth />,
        children: [
            { 
                path: "/",
                element: <AppLayout />,
                children: [
                    { index: true, element: <DashboardPage /> },
                    { path: "tickets/:id", element: <TicketDetailsPage /> },
                    {
                        element: <RequireRole roles={["EMPLOYE"]} />,
                        children: [
                            { path: "tickets/new", element: <NewTicketPage /> },
                            { path: "my-tickets", element: <MyTicketsPage /> },
                        ],
                    },
                    { 
                        element: <RequireRole roles={["TECH", "ADMIN"]} />,
                        children: [{ path: "tickets", element: <TicketsPage /> }],   
                    },
                    {
                        element: <RequireRole roles={["ADMIN"]} />,
                        children: [
                            { path: "reports", element: <ReportsPage /> },
                            { path: "admin", element: <AdminPage /> }
                        ],
                    },
                ],
            },
        ],
    },
    {
        path: "*", element: <NotFoundPage />,
    },
]);

/**
 * La notion clé : les routes sans chemin (pathless layout routes).
 * RequireAuth et RequireRole n’ont pas de path.
 * Elles n’ajoutent rien à l’URL, elles enveloppent leurs enfants.
 * On empile ainsi les contrôles comme des couches : connecté ? → mise en page → bon rôle ? → page.
 * C’est le même principe que la chaîne de guards côté API.
 */
        