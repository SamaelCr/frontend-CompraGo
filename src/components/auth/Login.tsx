import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import Card from '../ui/Card';
import Input from '../ui/Input';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login({ email, password });
      // CAMBIO: Redirigir al dashboard después de que el login haya tenido éxito
      // y el estado del store se haya actualizado.
      window.location.href = '/dashboard';
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al iniciar sesión.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title="Acceso al Sistema">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Correo Electrónico"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-slate-400"
          >
            {isLoading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </div>
      </form>
    </Card>
  );
}