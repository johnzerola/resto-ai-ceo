
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { AIAssistantPage } from "./pages/AIAssistantPage";
import AiAssistant from './pages/AiAssistant';
import { ProjecoesPagina } from "@/pages/ProjecoesPagina";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<div>Home Page - Configure your routes</div>} />
            <Route path="/ai-assistant" element={<AIAssistantPage />} />
            <Route path="/ai" element={<AiAssistant />} />
            <Route path="/projecoes" element={<ProjecoesPagina />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
