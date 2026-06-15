import React, { ReactNode } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router';
import { Layout } from './layout';
import { AuthProvider, useAuth } from './auth';

import { Login } from './pages/Login';
import { PetsList } from './pages/PetsList';
import { PetForm } from './pages/PetForm';
import { AdotantesList } from './pages/AdotantesList';
import { AdotanteForm } from './pages/AdotanteForm';
import { AdocoesList } from './pages/AdocoesList';
import { AdocaoForm } from './pages/AdocaoForm';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function Root() {
  return (
    <AuthProvider>
      <Layout />
    </AuthProvider>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      { index: true, element: <Navigate to="/pets" replace /> },
      { path: 'login', element: <Login /> },
      
      // Pets
      { path: 'pets', element: <PetsList /> },
      { 
        path: 'pets/new', 
        element: <ProtectedRoute><PetForm /></ProtectedRoute> 
      },
      { 
        path: 'pets/:id/edit', 
        element: <ProtectedRoute><PetForm /></ProtectedRoute> 
      },
      
      // Adotantes
      { 
        path: 'adotantes', 
        element: <ProtectedRoute><AdotantesList /></ProtectedRoute> 
      },
      { 
        path: 'adotantes/new', 
        element: <ProtectedRoute><AdotanteForm /></ProtectedRoute> 
      },
      { 
        path: 'adotantes/:id/edit', 
        element: <ProtectedRoute><AdotanteForm /></ProtectedRoute> 
      },
      
      // Adoções
      { 
        path: 'adocoes', 
        element: <ProtectedRoute><AdocoesList /></ProtectedRoute> 
      },
      { 
        path: 'adocoes/new', 
        element: <ProtectedRoute><AdocaoForm /></ProtectedRoute> 
      },
      
      { path: '*', element: <Navigate to="/pets" replace /> },
    ],
  },
]);
