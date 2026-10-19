import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { LogIn } from 'lucide-react'
import { useLogin } from '../features/auth/useAuth'
import { ApiError } from '../lib/api'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const login = useLogin()
    const navigate = useNavigate()

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        login.mutate(
            { email: email.trim(), password },
            { onSuccess: () => navigate('/', { replace: true}) },
        );
    }

    const errorMessage = 
        login.error instanceof ApiError && login.error.status === 429
            ? 'Le nombre de tentatives est limité'
            : login.error?.message;

    return (
        <main className="grid min-h-screen place-items-center bg-gray-50 px-4">
            <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
                <h1 className="text-center text-2xl font-bold text-blue-700">TechTicket</h1>
                <p className="mt-1 text-center text-sm text-gray-500">
                    Connectez-vous pour accéder à votre espace
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    {errorMessage && (
                        <div
                            role="alert"
                            className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                        >
                            {errorMessage}
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Adresse e-mail
                        </label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="username"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={login.isPending}
                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-100"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Mot de passe
                        </label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={login.isPending}
                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-100"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={login.isPending}
                        className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <LogIn className="h-4 w-4" aria-hidden="true" />
                        {login.isPending ? "Connexion…" : "Se connecter"}
                    </button>
                </form>
            </div>
        </main>
    );
}
