import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import Card from '../ui/Card';

export default function UserProfile() {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <Card title="Cargando...">
        <p>Cargando información del perfil...</p>
      </Card>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Mi Perfil</h1>
      <Card title="Información de la Cuenta">
        <dl>
          <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-slate-500">ID de Usuario</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">{user.id}</dd>
          </div>
          <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-slate-500">Correo Electrónico</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">{user.email}</dd>
          </div>
        </dl>
      </Card>

      <div className="mt-8">
        <Card title="Cambiar Contraseña">
          <p className="text-sm text-slate-600">
            (Funcionalidad para cambiar la contraseña se implementará aquí en el futuro.)
          </p>
        </Card>
      </div>
    </div>
  );
}