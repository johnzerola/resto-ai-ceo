import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient } from 'react-query';
import { AuthProvider } from './contexts/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import LoginPage from './pages/LoginPage';
import RestaurantPage from './pages/RestaurantPage';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import FinancialPage from './pages/FinancialPage';
import SettingsPage from './pages/SettingsPage';
import PricingPage from './pages/PricingPage';
import GoalsPage from './pages/GoalsPage';
import AIAssistantPage from './pages/AIAssistantPage';
import AiAssistant from './pages/AiAssistant';
import { ProjecoesPagina } from "@/pages/ProjecoesPagina";

function App() {
  return (
    <QueryClient>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/restaurants" element={<RestaurantPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/financial" element={<FinancialPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/ai-assistant" element={<AIAssistantPage />} />
          <Route path="/ai" element={<AiAssistant />} />
          <Route path="/projecoes" element={<ProjecoesPagina />} />
        </Routes>
      </Router>
    </QueryClient>
  );
}

export default App;
