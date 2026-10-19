import { Navigate,Outlet, useLocation } from 'react-router';
import { useMe } from './useAuth';

/**
 * Ce composant gère trois états, et chacun a son affichage :
 * 1. isPending : on ne sait pas encore si l'utilisateur est connecté ou non
 * 2. isError : on a une erreur lors de la connexion
 * 3. !user : Pas connecté
 */
export default function RequireAuth() {
    const { data: user, isPending, isError } = useMe();
    const location = useLocation();

    if (isPending) return <p className="grid min-h-screen place-items-center text-gray-500">Chargement…</p>;
    
    if (isError) return <p className="grid min-h-screen place-items-center text-red-600">Impossible de joindre le serveur. Réessayer dans quelques instants.</p>;

    if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    return <Outlet />;
}