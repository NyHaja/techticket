import { NavLink, useNavigate } from "react-router";
import { LogOut } from "lucide-react";
import { NAV_ITEMS } from "./navItems";
import { useLogout, type AuthUser } from "../features/auth/useAuth";
import type { Role } from "../types/role";

type Props = {
  user: AuthUser;
};

const ROLE_LABELS: Record<Role, string> = {
  EMPLOYE: "Employé",
  TECH: "Technicien",
  ADMIN: "Administrateur",
};

export default function Sidebar({ user }: Props) {
  const logout = useLogout();
  const navigate = useNavigate();

  // Seuls les liens autorisés pour le rôle de l'utilisateur connecté
  const items = NAV_ITEMS.filter((item) => item.role.includes(user.role));

  function handleLogout() {
    logout.mutate(undefined, {
      onSuccess: () => navigate("/login", { replace: true }),
    });
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* Logo / titre */}
      <div className="px-6 py-5 text-xl font-bold text-blue-700">TechTicket</div>

      {/* Navigation */}
      <nav aria-label="Navigation principale" className="flex-1 space-y-1 px-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Utilisateur connecté + déconnexion */}
      <div className="border-t border-gray-200 p-4">
        <p className="truncate text-sm font-medium text-gray-900" title={user.name}>
          {user.name}
        </p>
        <p className="text-xs text-gray-500">{ROLE_LABELS[user.role]}</p>

        <button
          type="button"
          onClick={handleLogout}
          disabled={logout.isPending}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          {logout.isPending ? "Déconnexion…" : "Se déconnecter"}
        </button>

        {logout.isError && (
          <p role="alert" className="mt-2 text-xs text-red-600">
            Échec de la déconnexion, réessayez.
          </p>
        )}
      </div>
    </aside>
  );
}