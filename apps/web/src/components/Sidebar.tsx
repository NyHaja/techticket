// Importation des composants
import { NavLink } from "react-router";
import type { Role } from "../types/role";
import { NAV_ITEMS } from "./navItems";

// Le composant reçoit le rôle en props
type SidebarProps = {
    role: Role;
    onRoleChange: (role: Role) => void;
};

const ROLE_LABELS: Record<Role, string> = {
    EMPLOYE: "Employé",
    TECH: "Technicien",
    ADMIN: "Administrateur",
};

// Le composant affiche les éléments de navigation
export default function Sidebar({ role, onRoleChange }: SidebarProps) {
    // On ne garde que les éléments de navigation pour lequel le rôle est valide
    const items = NAV_ITEMS.filter((item) => item.role.includes(role));

    // Chaque lien est un composant NavLink de react-router qui affiche un lien
    // avec son label et sa destination
    return (
        <aside className="flex w-60 shrink-0 flex-col border-r border-gray-200 bg-white">
            {/* Logo / titre*/}
            <div className="px-6 py-5 text-xl font-bold text-blue-700">TechTicket</div>
            {/* <h1 className="mb-6 text-xl font-bold">TechTicket</h1> */}
            <nav aria-label="Navigation Principale" className="flex-1 space-y-1 px-3">
                {items.map((item) => {
                    const Icon = item.icon
                    return (
                        <NavLink
                        key={item.label}
                        to={item.to}
                        end
                        className={({ isActive }) =>        // NavLink appelle la fonction isActive si l'URL correspond
                        `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                            isActive        // On affiche le label en gras si l'URL correspond
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 hover:bg-gray-50 hover:text-blue-700"
                        }`}
                        >
                            <Icon className="h-4 w-4 shrink-0"  aria-hidden="true" />
                            {item.label}
                        </NavLink>
                    );
                }
            )}
        
            </nav>

            {/* Bloc utilisateur en bas de la sidebar */}
            <div className="border-t border-gray-200 px-6 py-5 text-sm">
                <p className="font-medium text-gray-900">Utilisateur de test</p>
                <p className="mt-1 text-gray-500">{ROLE_LABELS[role]}</p>

                {/* Bouton pour changer le rôle */}
                {import.meta.env.DEV && (
                    <label className="mt-3 block">
                        <span className="text-xs uppercase tracking-wide text-gray-400">
                            Rôle: {ROLE_LABELS[role]}
                        </span>
                        <select
                            value={role}
                            onChange={(e) => onRoleChange(e.target.value as Role)}
                            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3"
                        >
                            {(Object.keys(ROLE_LABELS) as Role[]).map((value) => (
                                <option key={value} value={value}>
                                    {ROLE_LABELS[value]}
                                </option>
                                )
                            )}
                        </select>
                    </label>
                )}
            </div>
        </aside>
    );
}
