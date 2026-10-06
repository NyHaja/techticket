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

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        path: "/",
        element: <AppLayout />,
        children: [
            { index: true, element: <DashboardPage /> },
            { path: "tickets", element: <TicketsPage /> },
            { path: "tickets/new", element: <NewTicketPage /> },
            { path: "tickets/:id", element: <TicketDetailsPage /> },
            { path: "my-tickets", element: <MyTicketsPage /> },
            { path: "reports", element: <ReportsPage /> },
            { path: "admin", element: <AdminPage /> },
        ],
    },
    {
        path: "*", element: <NotFoundPage />,
    },
]);
        