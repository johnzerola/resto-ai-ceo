import React from 'react';
import { OptimizedDashboardLayout } from '@/components/layout/OptimizedDashboardLayout';
import { WhatsAppDashboard } from '@/components/whatsapp/WhatsAppDashboard';

export default function WhatsAppIntegrationPage() {
  return (
    <OptimizedDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integração WhatsApp</h1>
          <p className="text-muted-foreground">
            Controle seu estoque e fluxo de caixa diretamente pelo WhatsApp
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
          <h2 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
            🚀 Como usar o WhatsApp Bot
          </h2>
          <div className="text-sm text-green-700 dark:text-green-300 space-y-2">
            <p><strong>💰 Registrar transações:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>"Receita venda R$ 450" - Registra uma receita</li>
              <li>"Gasto energia R$ 120" - Registra uma despesa</li>
              <li>"Pagou fornecedor R$ 300" - Registra despesa operacional</li>
            </ul>
            
            <p><strong>📦 Controlar estoque:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>"Entrada frango 5kg R$ 45" - Registra entrada no estoque</li>
              <li>"Saída tomate 2kg" - Registra saída do estoque</li>
              <li>"Recebeu carne 10kg R$ 80" - Entrada com custo</li>
            </ul>
            
            <p><strong>📊 Consultar dados:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>"resumo" - Ver painel completo com KPIs</li>
              <li>"estoque" - Ver itens em estoque crítico</li>
              <li>"dre" - Ver DRE do mês atual</li>
              <li>"saldo" - Ver saldo atual do caixa</li>
            </ul>
          </div>
        </div>

        <WhatsAppDashboard />
      </div>
    </OptimizedDashboardLayout>
  );
}