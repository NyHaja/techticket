import { Navigate, Outlet } from 'react-router';
import type { Role } from '../../types/role';
import { useCurrentUser } from './useAuth';

type Props = { roles: Role[] }

/**
 * À placer sous RequireAuth : l'utilisateur est forcément connecté ici.
 * Rôle non autorisé → retour au tableau de bord (accessible à tous les rôles).
 */
export default function RequireRole({ roles }: Props) {
    const user = useCurrentUser();

    if (!roles.includes(user.role)) return <Navigate to="/" replace />;
    return <Outlet />;
}
