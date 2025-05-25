
import { toast } from "sonner";
import { securityService } from "./SecurityService";

// Tipos para testes de segurança
export interface SecurityTest {
  id: string;
  name: string;
  type: 'penetration' | 'vulnerability' | 'log_validation' | 'access_control';
  status: 'pending' | 'running' | 'passed' | 'failed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  result?: string;
  timestamp: string;
  duration?: number;
}

export interface VulnerabilityReport {
  id: string;
  vulnerability: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
  affected_components: string[];
  timestamp: string;
}

export interface PenetrationTestResult {
  id: string;
  test_type: string;
  target: string;
  success: boolean;
  vulnerabilities_found: VulnerabilityReport[];
  timestamp: string;
}

// Classe para testes de segurança
export class SecurityTestingService {
  private static instance: SecurityTestingService;
  private securityTests: SecurityTest[] = [];
  private vulnerabilityReports: VulnerabilityReport[] = [];
  private penetrationResults: PenetrationTestResult[] = [];

  public static getInstance(): SecurityTestingService {
    if (!SecurityTestingService.instance) {
      SecurityTestingService.instance = new SecurityTestingService();
    }
    return SecurityTestingService.instance;
  }

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const tests = localStorage.getItem('security_tests');
      if (tests) this.securityTests = JSON.parse(tests);

      const reports = localStorage.getItem('vulnerability_reports');
      if (reports) this.vulnerabilityReports = JSON.parse(reports);

      const results = localStorage.getItem('penetration_results');
      if (results) this.penetrationResults = JSON.parse(results);
    } catch (error) {
      console.error("Erro ao carregar dados de testes:", error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('security_tests', JSON.stringify(this.securityTests));
      localStorage.setItem('vulnerability_reports', JSON.stringify(this.vulnerabilityReports));
      localStorage.setItem('penetration_results', JSON.stringify(this.penetrationResults));
    } catch (error) {
      console.error("Erro ao salvar dados de testes:", error);
    }
  }

  // Teste de penetração básico
  async runBasicPenetrationTest(): Promise<PenetrationTestResult> {
    const testId = crypto.randomUUID();
    console.log("Iniciando teste de penetração básico...");

    const vulnerabilities: VulnerabilityReport[] = [];

    // Teste 1: Verificar headers de segurança
    const securityHeaders = this.checkSecurityHeaders();
    if (!securityHeaders.passed) {
      vulnerabilities.push({
        id: crypto.randomUUID(),
        vulnerability: "Headers de Segurança Ausentes",
        severity: "medium",
        description: "Headers de segurança importantes estão ausentes",
        recommendation: "Implementar Content-Security-Policy, X-Frame-Options, etc.",
        affected_components: ["Frontend"],
        timestamp: new Date().toISOString()
      });
    }

    // Teste 2: Verificar localStorage seguro
    const localStorageSecurity = this.checkLocalStorageSecurity();
    if (!localStorageSecurity.passed) {
      vulnerabilities.push({
        id: crypto.randomUUID(),
        vulnerability: "Dados Sensíveis no LocalStorage",
        severity: "high",
        description: "Dados potencialmente sensíveis armazenados sem criptografia",
        recommendation: "Implementar criptografia para dados sensíveis",
        affected_components: ["Cliente"],
        timestamp: new Date().toISOString()
      });
    }

    // Teste 3: Verificar validação de entrada
    const inputValidation = this.checkInputValidation();
    if (!inputValidation.passed) {
      vulnerabilities.push({
        id: crypto.randomUUID(),
        vulnerability: "Validação de Entrada Insuficiente",
        severity: "medium",
        description: "Alguns campos não têm validação adequada",
        recommendation: "Implementar validação robusta em todos os inputs",
        affected_components: ["Forms", "Inputs"],
        timestamp: new Date().toISOString()
      });
    }

    const result: PenetrationTestResult = {
      id: testId,
      test_type: "Basic Penetration Test",
      target: "Frontend Application",
      success: vulnerabilities.length === 0,
      vulnerabilities_found: vulnerabilities,
      timestamp: new Date().toISOString()
    };

    this.penetrationResults.push(result);
    this.vulnerabilityReports.push(...vulnerabilities);
    this.saveToStorage();

    toast.success(`Teste de penetração concluído. ${vulnerabilities.length} vulnerabilidades encontradas.`);
    return result;
  }

  // Auditoria de vulnerabilidades
  async runVulnerabilityAudit(): Promise<VulnerabilityReport[]> {
    console.log("Iniciando auditoria de vulnerabilidades...");
    
    const vulnerabilities: VulnerabilityReport[] = [];

    // Verificar dependências desatualizadas
    const outdatedDeps = this.checkOutdatedDependencies();
    if (outdatedDeps.length > 0) {
      vulnerabilities.push({
        id: crypto.randomUUID(),
        vulnerability: "Dependências Desatualizadas",
        severity: "medium",
        description: `${outdatedDeps.length} dependências podem ter vulnerabilidades conhecidas`,
        recommendation: "Atualizar dependências para versões mais recentes",
        affected_components: outdatedDeps,
        timestamp: new Date().toISOString()
      });
    }

    // Verificar configurações de CORS
    const corsConfig = this.checkCORSConfiguration();
    if (!corsConfig.secure) {
      vulnerabilities.push({
        id: crypto.randomUUID(),
        vulnerability: "Configuração CORS Permissiva",
        severity: "low",
        description: "Configuração CORS muito permissiva pode expor dados",
        recommendation: "Restringir origins permitidos",
        affected_components: ["API"],
        timestamp: new Date().toISOString()
      });
    }

    // Verificar exposição de informações sensíveis
    const infoExposure = this.checkInformationExposure();
    if (infoExposure.exposed) {
      vulnerabilities.push({
        id: crypto.randomUUID(),
        vulnerability: "Exposição de Informações",
        severity: "high",
        description: "Informações sensíveis podem estar expostas nos logs ou console",
        recommendation: "Remover logs de debug e informações sensíveis",
        affected_components: ["Logging", "Console"],
        timestamp: new Date().toISOString()
      });
    }

    this.vulnerabilityReports.push(...vulnerabilities);
    this.saveToStorage();

    toast.success(`Auditoria concluída. ${vulnerabilities.length} vulnerabilidades identificadas.`);
    return vulnerabilities;
  }

  // Validação do sistema de logs
  async validateLoggingSystem(): Promise<SecurityTest> {
    const test: SecurityTest = {
      id: crypto.randomUUID(),
      name: "Validação do Sistema de Logs",
      type: "log_validation",
      status: "running",
      severity: "medium",
      description: "Verificando integridade e completude do sistema de logs",
      timestamp: new Date().toISOString()
    };

    const startTime = Date.now();

    try {
      // Verificar se logs estão sendo gerados
      const securityLogs = securityService.getSecurityLogs();
      const dataAccessLogs = securityService.getDataAccessLogs();

      let issues: string[] = [];

      if (securityLogs.length === 0) {
        issues.push("Nenhum log de segurança encontrado");
      }

      if (dataAccessLogs.length === 0) {
        issues.push("Nenhum log de acesso a dados encontrado");
      }

      // Verificar se logs têm campos obrigatórios
      if (securityLogs.length > 0) {
        const incompleteLog = securityLogs.find(log => 
          !log.userId || !log.eventType || !log.timestamp
        );
        if (incompleteLog) {
          issues.push("Logs de segurança com campos obrigatórios ausentes");
        }
      }

      test.status = issues.length === 0 ? "passed" : "failed";
      test.result = issues.length === 0 
        ? "Sistema de logs funcionando corretamente"
        : `Problemas encontrados: ${issues.join(", ")}`;
      test.duration = Date.now() - startTime;

    } catch (error) {
      test.status = "failed";
      test.result = `Erro na validação: ${error}`;
      test.duration = Date.now() - startTime;
    }

    this.securityTests.push(test);
    this.saveToStorage();

    return test;
  }

  // Métodos auxiliares de verificação
  private checkSecurityHeaders(): { passed: boolean; details: string[] } {
    const issues: string[] = [];
    
    // Verificar se CSP está configurado (simulado)
    if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
      issues.push("Content-Security-Policy ausente");
    }

    return { passed: issues.length === 0, details: issues };
  }

  private checkLocalStorageSecurity(): { passed: boolean; details: string[] } {
    const issues: string[] = [];
    
    // Verificar se há dados sensíveis não criptografados
    const sensitiveKeys = ['password', 'token', 'api_key', 'secret'];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        const value = localStorage.getItem(key);
        if (value && !value.startsWith('encrypted:')) {
          issues.push(`Chave sensível não criptografada: ${key}`);
        }
      }
    }

    return { passed: issues.length === 0, details: issues };
  }

  private checkInputValidation(): { passed: boolean; details: string[] } {
    // Simulação de verificação de validação de entrada
    const issues: string[] = [];
    
    // Verificar se há inputs sem validação (simulado)
    const forms = document.querySelectorAll('form');
    let unvalidatedInputs = 0;
    
    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, textarea');
      inputs.forEach(input => {
        if (!input.hasAttribute('required') && !input.hasAttribute('pattern')) {
          unvalidatedInputs++;
        }
      });
    });

    if (unvalidatedInputs > 0) {
      issues.push(`${unvalidatedInputs} inputs sem validação adequada`);
    }

    return { passed: issues.length === 0, details: issues };
  }

  private checkOutdatedDependencies(): string[] {
    // Simulação - em produção, isso seria feito por ferramentas como npm audit
    return ["react-router-dom", "lodash"];
  }

  private checkCORSConfiguration(): { secure: boolean; details: string[] } {
    // Simulação de verificação CORS
    return { secure: true, details: [] };
  }

  private checkInformationExposure(): { exposed: boolean; details: string[] } {
    const issues: string[] = [];
    
    // Verificar se há console.logs em produção
    if (process.env.NODE_ENV === 'production') {
      // Em produção, isso deveria ser verificado
      issues.push("Console logs detectados em produção");
    }

    return { exposed: issues.length > 0, details: issues };
  }

  // Getters
  getSecurityTests(): SecurityTest[] {
    return [...this.securityTests];
  }

  getVulnerabilityReports(): VulnerabilityReport[] {
    return [...this.vulnerabilityReports];
  }

  getPenetrationResults(): PenetrationTestResult[] {
    return [...this.penetrationResults];
  }

  // Gerar relatório completo
  generateSecurityReport(): any {
    return {
      summary: {
        total_tests: this.securityTests.length,
        passed_tests: this.securityTests.filter(t => t.status === 'passed').length,
        failed_tests: this.securityTests.filter(t => t.status === 'failed').length,
        total_vulnerabilities: this.vulnerabilityReports.length,
        critical_vulnerabilities: this.vulnerabilityReports.filter(v => v.severity === 'critical').length,
        high_vulnerabilities: this.vulnerabilityReports.filter(v => v.severity === 'high').length
      },
      tests: this.securityTests,
      vulnerabilities: this.vulnerabilityReports,
      penetration_results: this.penetrationResults,
      generated_at: new Date().toISOString()
    };
  }
}

export const securityTestingService = SecurityTestingService.getInstance();
