import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, ApiError } from '../../lib/api'
import type { Role } from '../../types/role'

export type AuthUser = { id: number, name: string, email: string, role: Role }
type Credentials = { email: string, password: string }

const ME_KEY = ["me"] as const;

/**
 * Utilisateur connecté ou null s'il ne l'est pas 
 */
export function useMe() {
    return useQuery({
        queryKey: ME_KEY,
        queryFn: async (): Promise<AuthUser | null> => {
            try {
                const { user } = await api<{ user: AuthUser }>('/auth/me');
                return user;
            } catch (err) {
                if (err instanceof ApiError && err.status === 401) return null;
                throw err;  // vraie erreur (serveur arrêté...)
            }
        },
        staleTime: 5 * 60_000,  // mise à jour toutes les 5 minutes
        retry: false,           // ne pas relancer la requête si une erreur survient    
    });
}

export function useLogin() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (credentials: Credentials) => 
            api<{ user: AuthUser }>('/auth/login', {
                method: 'POST',
                body: JSON.stringify(credentials),
            }),
        onSuccess: ({ user }) => {
            queryClient.setQueryData(ME_KEY, user);
        },
    });
}

export function useLogout() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => api<void>('/auth/logout', { method: 'POST' }),
        onSuccess: () => {
            queryClient.setQueryData(ME_KEY, null);
            queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== "me" });    // efface toutes les autres requêtes
        },
    });
}

export function useCurrentUser(): AuthUser {
    const { data } = useMe();
    if (!data) throw new Error('Utilisateur non connecté');
    return data;
}