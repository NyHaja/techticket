export class ApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`/api${path}`, {
        ...options,
        credentials: 'same-origin',     // envoie le cookie de session
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (response.status === 204) return undefined as T;     // pas de corps de réponse

    const data = await response.json().catch(() => null);

    if(!response.ok) {
        // NestJS renvoie une erreur pour les erreurs HTTP 4xx et 5xx
        const message = Array.isArray(data?.message) 
            ? data.message.join(', ') 
            : data?.message ?? 'Erreur inattendue';
            throw new ApiError(response.status, message);
    }

    return data as T;
}