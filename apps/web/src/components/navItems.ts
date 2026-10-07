import {
    LayoutDashboard,
    CirclePlus,
    Ticket,
    ClipboardList,
    ChartColumn,
    Settings,
    type LucideIcon,
} from "lucide-react";

import type { Role } from "../types/role";

export type NavItem = {
    label: string;
    to: string;
    role: Role[];
    icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
    {
        label: "Tableau de bord",
        to: "/",
        icon: LayoutDashboard,
        role: ["EMPLOYE", "TECH", "ADMIN"],
    },
    {
        label: "Nouveau ticket",
        to: "/tickets/new",
        icon: CirclePlus,
        role: ["EMPLOYE"],
    },
    {
        label: "Mes tickets",
        to: "/my-tickets",
        icon: Ticket,
        role: ["EMPLOYE"],
    },
    {
        label: "Gestion des tickets",
        to: "/tickets",
        icon: ClipboardList,
        role: ["TECH", "ADMIN"],
    },
    {
        label: "Rapports",
        to: "/reports",
        icon: ChartColumn,
        role: ["ADMIN"],
    },
    {
        label: "Administrateur",
        to: "/admin",
        icon: Settings,
        role: ["ADMIN"],
    },
];