import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import FichaTecnica from './pages/FichaTecnica';
import Precificacao from './pages/Precificacao';
import DreCmv from './pages/DreCmv';
import FluxoCaixa from './pages/FluxoCaixa';
import Estoque from './pages/Estoque';
import Metas from './pages/Metas';
import Relatorios from './pages/Relatorios';
import Configuracoes from './pages/Configuracoes';
import SystemAuditPage from './pages/SystemAuditPage';
import AuthCallback from './pages/AuthCallback';
import Onboarding from './pages/Onboarding';
import { DataSync } from './components/restaurant/DataSync';
import { QueryClient } from 'react-query';
import FinancialDashboardPage from './pages/FinancialDashboardPage';
import { DRE } from './pages/DRE';

function App() {
  return (
    <QueryClient>
      <AuthProvider>
        <BrowserRouter>
          <DataSync>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/onboarding" element={<Onboarding />} />
              
              {/* Rota principal - Dashboard */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              {/* Sistema Financeiro Completo - NOVA ROTA */}
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
                  <Precificacao />
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
              
              <Route path="/metas" element={
                <ProtectedRoute>
                  <Metas />
                </ProtectedRoute>
              } />
              
              <Route path="/relatorios" element={
                <ProtectedRoute>
                  <Relatorios />
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
    </QueryClient>
  );
}

export default App;
