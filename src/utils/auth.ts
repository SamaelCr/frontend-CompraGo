import type { AstroGlobal } from 'astro';

// Lista de rutas que requieren autenticación
const protectedRoutes = [
  '/dashboard',
  '/perfil',
  '/administracion',
  '/compras/nueva', // Proteger la creación de nuevas órdenes
];

export function checkAuth(Astro: AstroGlobal) {
  const currentPath = Astro.url.pathname;
  const isProtectedRoute = protectedRoutes.some((route) =>
    currentPath.startsWith(route)
  );
  const isAuthenticated = Astro.cookies.has('refresh_token');

  // Si es una ruta protegida y no hay cookie de sesión, redirigir al login
  if (isProtectedRoute && !isAuthenticated) {
    return Astro.redirect('/login');
  }
}