import React from 'react';
import { useRestaurantSecurity } from '@/hooks/useRestaurantSecurity';
import { DataIsolationTest } from '@/components/security/DataIsolationTest';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle, RefreshCw, Eye, Lock } from 'lucide-react';
import { SEOOptimizations } from '@/components/seo/SEOOptimizations';

export function SecurityDashboard() {
  const { 
    securityChecks, 
    isChecking, 
    lastCheck, 
    runSecurityCheck,
    getSecurityScore,
    getCriticalIssues,
    hasSecurityIssues
  } = useRestaurantSecurity();

  const securityScore = getSecurityScore();
  const criticalIssues = getCriticalIssues();

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return CheckCircle;
    if (score >= 70) return AlertTriangle;
    return Shield;
  };

  const ScoreIcon = getScoreIcon(securityScore);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <SEOOptimizations 
        title="Dashboard de Segurança - RestauranteCMV"
        description="Monitoramento e teste de segurança do sistema de gestão de restaurantes"
        noIndex={true}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Segurança</h1>
          <p className="text-muted-foreground">
            Monitoramento e testes de isolamento de dados
          </p>
        </div>
        
        <Button 
          onClick={runSecurityCheck} 
          disabled={isChecking}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
          {isChecking ? 'Verificando...' : 'Verificar Segurança'}
        </Button>
      </div>

      {/* Score Geral de Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScoreIcon className="h-5 w-5" />
            Score de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-4xl font-bold ${getScoreColor(securityScore)}`}>
                {securityScore}%
              </div>
              <p className="text-sm text-muted-foreground">
                {lastCheck ? `Última verificação: ${lastCheck.toLocaleString()}` : 'Nunca verificado'}
              </p>
            </div>
            
            <div className="text-right">
              <Badge variant={securityScore >= 90 ? 'default' : 'destructive'}>
                {securityScore >= 90 ? 'Seguro' : 'Atenção Necessária'}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                {securityChecks.length} verificações realizadas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas Críticos */}
      {criticalIssues.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>ATENÇÃO:</strong> {criticalIssues.length} problema(s) crítico(s) de segurança detectado(s)!
            <ul className="mt-2 space-y-1">
              {criticalIssues.map((issue, index) => (
                <li key={index} className="text-sm">
                  • <strong>{issue.tableName}:</strong> {issue.error}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Resumo das Verificações */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {securityChecks.map((check, index) => (
          <Card key={index} className={`${
            check.hasIsolation ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
          }`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2">
                  {check.hasIsolation ? (
                    <Lock className="h-4 w-4 text-green-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-red-600" />
                  )}
                  {check.tableName}
                </span>
                <Badge variant={check.hasIsolation ? 'default' : 'destructive'} className="text-xs">
                  {check.hasIsolation ? 'Seguro' : 'Falha'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Seus dados:</span>
                  <span className="font-medium">{check.userDataCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total visível:</span>
                  <span className={`font-medium ${
                    check.userDataCount === check.totalDataCount ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {check.totalDataCount}
                  </span>
                </div>
                {check.error && (
                  <div className="text-xs p-2 bg-white/50 rounded border">
                    {check.error}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Teste Detalhado de Isolamento */}
      <DataIsolationTest />

      {/* Informações sobre Segurança */}
      <Card>
        <CardHeader>
          <CardTitle>Sobre a Segurança dos Dados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">🔒 Row Level Security (RLS)</h4>
              <p className="text-sm text-muted-foreground">
                Cada usuário só pode acessar dados dos seus próprios restaurantes.
                Proteção implementada no nível do banco de dados.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">🏢 Isolamento por Tenant</h4>
              <p className="text-sm text-muted-foreground">
                Dados financeiros, receitas e estoque são isolados por restaurante.
                Impossível acessar informações de outros usuários.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">🛡️ Autenticação Segura</h4>
              <p className="text-sm text-muted-foreground">
                Sistema de autenticação baseado em JWT com expiração automática.
                Sessões são validadas em tempo real.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">📊 Monitoramento Contínuo</h4>
              <p className="text-sm text-muted-foreground">
                Verificações automáticas de segurança e logs de auditoria.
                Detecta e previne acessos não autorizados.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}