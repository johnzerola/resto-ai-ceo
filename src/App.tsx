
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FichaTecnica from './pages/FichaTecnica';
import DreCmv from './pages/DreCmv';
import FluxoCaixa from './pages/FluxoCaixa';
import Estoque from './pages/Estoque';
import Configuracoes from './pages/Configuracoes';
import SystemAuditPage from './pages/SystemAuditPage';
import Onboarding from './pages/Onboarding';
import { DataSync } from './components/restaurant/DataSync';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FinancialDashboardPage from './pages/FinancialDashboardPage';
import { DRE } from './pages/DRE';
import PrecificacaoCompleta from './pages/PrecificacaoCompleta';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <DataSync>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/onboarding" element={<Onboarding />} />
              
              {/* Rota principal - Dashboard */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              {/* Rota dashboard - mesmo conteúdo que a principal */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              {/* Sistema Financeiro Completo */}
              <Route path="/financeiro" element={
                <ProtectedRoute>
                  <FinancialDashboardPage />
                </ProtectedRoute>
              } />
              
              {/* Rotas existentes mantidas */}
              <Route path="/ficha-tecnica" element={
                <ProtectedRoute>
                  <FichaTecnica />
                </ProtectedRoute>
              } />
              
              <Route path="/precificacao" element={
                <ProtectedRoute>
                  <PrecificacaoCompleta />
                </ProtectedRoute>
              } />
              
              <Route path="/dre-cmv" element={
                <ProtectedRoute>
                  <DreCmv />
                </ProtectedRoute>
              } />
              
              <Route path="/dre" element={
                <ProtectedRoute>
                  <DRE />
                </ProtectedRoute>
              } />
              
              <Route path="/fluxo-caixa" element={
                <ProtectedRoute>
                  <FluxoCaixa />
                </ProtectedRoute>
              } />
              
              <Route path="/estoque" element={
                <ProtectedRoute>
                  <Estoque />
                </ProtectedRoute>
              } />
              
              <Route path="/configuracoes" element={
                <ProtectedRoute>
                  <Configuracoes />
                </ProtectedRoute>
              } />
              
              <Route path="/auditoria" element={
                <ProtectedRoute>
                  <SystemAuditPage />
                </ProtectedRoute>
              } />
            </Routes>
          </DataSync>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
