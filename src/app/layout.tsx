import React from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import { useAuth } from './auth';
import { Dog, Users, HeartHandshake, LogOut, LogIn } from 'lucide-react';

export function Layout() {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/pets', label: 'Pets', icon: <Dog className="w-5 h-5" /> },
    { path: '/adotantes', label: 'Adotantes', icon: <Users className="w-5 h-5" /> },
    { path: '/adocoes', label: 'Adoções', icon: <HeartHandshake className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl">
                  <Dog className="w-8 h-8 text-blue-600" />
                  <span className="text-gray-900">PetConnect</span>
                </Link>
              </div>
              <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      location.pathname.startsWith(item.path) || (location.pathname === '/' && item.path === '/pets')
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center">
              {isAuthenticated ? (
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-2 px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition ease-in-out duration-150"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition ease-in-out duration-150"
                >
                  <LogIn className="w-4 h-4" />
                  Entrar
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
