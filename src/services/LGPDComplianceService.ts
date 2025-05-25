
import { toast } from "sonner";
import { lgpdService } from "./LGPDService";

// Tipos para conformidade LGPD
export interface LGPDComplianceCheck {
  id: string;
  requirement: string;
  status: 'compliant' | 'non_compliant' | 'partial';
  description: string;
  evidence?: string;
  action_required?: string;
  deadline?: string;
  responsible?: string;
  timestamp: string;
}

export interface DPOReport {
  id: string;
  report_type: 'monthly' | 'incident' | 'audit' | 'request_response';
  summary: string;
  details: any;
  recommendations: string[];
  next_actions: string[];
  created_at: string;
  created_by: string;
}

export interface IncidentResponse {
  id: string;
  incident_type: 'data_breach' | 'unauthorized_access' | 'data_loss' | 'privacy_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affected_data_subjects: number;
  containment_actions: string[];
  notification_required: boolean;
  authorities_notified: boolean;
  data_subjects_notified: boolean;
  status: 'open' | 'investigating' | 'contained' | 'resolved';
  reported_at: string;
  resolved_at?: string;
}

// Classe para conformidade LGPD
export class LGPDComplianceService {
  private static instance: LGPDComplianceService;
  private complianceChecks: LGPDComplianceCheck[] = [];
  private dpoReports: DPOReport[] = [];
  private incidents: IncidentResponse[] = [];

  public static getInstance(): LGPDComplianceService {
    if (!LGPDComplianceService.instance) {
      LGPDComplianceService.instance = new LGPDComplianceService();
    }
    return LGPDComplianceService.instance;
  }

  constructor() {
    this.loadFromStorage();
    this.initializeComplianceChecks();
  }

  private loadFromStorage(): void {
    try {
      const checks = localStorage.getItem('lgpd_compliance_checks');
      if (checks) this.complianceChecks = JSON.parse(checks);

      const reports = localStorage.getItem('dpo_reports');
      if (reports) this.dpoReports = JSON.parse(reports);

      const incidents = localStorage.getItem('privacy_incidents');
      if (incidents) this.incidents = JSON.parse(incidents);
    } catch (error) {
      console.error("Erro ao carregar dados de conformidade:", error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('lgpd_compliance_checks', JSON.stringify(this.complianceChecks));
      localStorage.setItem('dpo_reports', JSON.stringify(this.dpoReports));
      localStorage.setItem('privacy_incidents', JSON.stringify(this.incidents));
    } catch (error) {
      console.error("Erro ao salvar dados de conformidade:", error);
    }
  }

  // Inicializar verificações de conformidade
  private initializeComplianceChecks(): void {
    if (this.complianceChecks.length === 0) {
      const defaultChecks: Omit<LGPDComplianceCheck, 'id' | 'timestamp'>[] = [
        {
          requirement: "Política de Privacidade",
          status: "compliant",
          description: "Política de privacidade clara e acessível implementada",
          evidence: "Página /privacidade disponível"
        },
        {
          requirement: "Consentimento Explícito",
          status: "compliant",
          description: "Sistema de consentimento implementado com banner LGPD",
          evidence: "ConsentBanner implementado"
        },
        {
          requirement: "Registro de Atividades de Tratamento",
          status: "partial",
          description: "Inventário de dados pessoais parcialmente documentado",
          action_required: "Completar documentação de todos os tipos de dados"
        },
        {
          requirement: "Direitos dos Titulares",
          status: "compliant",
          description: "Mecanismos para exercício de direitos implementados",
          evidence: "Funcionalidades de exportação e solicitações implementadas"
        },
        {
          requirement: "Segurança da Informação",
          status: "partial",
          description: "Medidas básicas de segurança implementadas",
          action_required: "Implementar criptografia end-to-end e backup seguro"
        },
        {
          requirement: "DPO Designado",
          status: "non_compliant",
          description: "Data Protection Officer não designado formalmente",
          action_required: "Designar DPO e registrar junto à ANPD",
          deadline: "30 dias"
        },
        {
          requirement: "Avaliação de Impacto",
          status: "non_compliant",
          description: "DPIA não realizada",
          action_required: "Realizar Data Protection Impact Assessment",
          deadline: "60 dias"
        },
        {
          requirement: "Contratos com Terceiros",
          status: "non_compliant",
          description: "Contratos com processadores de dados não adequados",
          action_required: "Revisar e adequar contratos existentes",
          deadline: "45 dias"
        }
      ];

      this.complianceChecks = defaultChecks.map(check => ({
        ...check,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString()
      }));

      this.saveToStorage();
    }
  }

  // Auditoria de conformidade
  async runComplianceAudit(): Promise<LGPDComplianceCheck[]> {
    console.log("Iniciando auditoria de conformidade LGPD...");

    // Verificar consentimentos registrados
    const personalDataInventory = lgpdService.getPersonalDataInventory();
    
    // Atualizar status baseado em verificações automáticas
    this.complianceChecks.forEach(check => {
      if (check.requirement === "Consentimento Explícito") {
        const hasConsents = localStorage.getItem('consent_records');
        check.status = hasConsents ? "compliant" : "non_compliant";
      }
      
      if (check.requirement === "Registro de Atividades de Tratamento") {
        check.status = personalDataInventory.length >= 4 ? "compliant" : "partial";
      }
    });

    this.saveToStorage();
    toast.success("Auditoria de conformidade LGPD concluída");
    return this.complianceChecks;
  }

  // Gerar relatório DPO
  async generateDPOReport(type: DPOReport['report_type']): Promise<DPOReport> {
    const report: DPOReport = {
      id: crypto.randomUUID(),
      report_type: type,
      summary: this.generateReportSummary(type),
      details: this.generateReportDetails(type),
      recommendations: this.generateRecommendations(),
      next_actions: this.generateNextActions(),
      created_at: new Date().toISOString(),
      created_by: "Sistema DPO"
    };

    this.dpoReports.push(report);
    this.saveToStorage();

    toast.success(`Relatório DPO ${type} gerado com sucesso`);
    return report;
  }

  private generateReportSummary(type: string): string {
    const compliantChecks = this.complianceChecks.filter(c => c.status === 'compliant').length;
    const totalChecks = this.complianceChecks.length;
    const complianceRate = Math.round((compliantChecks / totalChecks) * 100);

    switch (type) {
      case 'monthly':
        return `Relatório mensal de conformidade LGPD. Taxa de conformidade: ${complianceRate}%. ${this.incidents.length} incidentes reportados no período.`;
      case 'audit':
        return `Auditoria de conformidade LGPD realizada. ${compliantChecks}/${totalChecks} requisitos em conformidade.`;
      case 'incident':
        return `Relatório de incidentes de privacidade. ${this.incidents.filter(i => i.status === 'open').length} incidentes em aberto.`;
      default:
        return "Relatório de conformidade LGPD";
    }
  }

  private generateReportDetails(type: string): any {
    return {
      compliance_status: this.complianceChecks,
      data_subject_requests: lgpdService.getUserRequests('system'),
      privacy_incidents: this.incidents,
      data_inventory: lgpdService.getPersonalDataInventory(),
      consent_records: JSON.parse(localStorage.getItem('consent_records') || '[]')
    };
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    const nonCompliant = this.complianceChecks.filter(c => c.status === 'non_compliant');
    const partial = this.complianceChecks.filter(c => c.status === 'partial');

    if (nonCompliant.length > 0) {
      recommendations.push(`Priorizar regularização de ${nonCompliant.length} requisitos não conformes`);
    }

    if (partial.length > 0) {
      recommendations.push(`Completar implementação de ${partial.length} requisitos parciais`);
    }

    recommendations.push("Realizar treinamento de conscientização em privacidade para equipe");
    recommendations.push("Implementar revisões trimestrais de conformidade");
    recommendations.push("Estabelecer procedimentos de resposta a incidentes");

    return recommendations;
  }

  private generateNextActions(): string[] {
    const actions: string[] = [];
    
    this.complianceChecks
      .filter(c => c.action_required)
      .forEach(check => {
        actions.push(`${check.requirement}: ${check.action_required}`);
      });

    return actions;
  }

  // Registrar incidente de privacidade
  async reportPrivacyIncident(incident: Omit<IncidentResponse, 'id' | 'reported_at' | 'status'>): Promise<IncidentResponse> {
    const newIncident: IncidentResponse = {
      ...incident,
      id: crypto.randomUUID(),
      reported_at: new Date().toISOString(),
      status: 'open'
    };

    this.incidents.push(newIncident);
    this.saveToStorage();

    // Verificar se notificação é obrigatória
    if (incident.severity === 'high' || incident.severity === 'critical') {
      toast.warning("Incidente de alta severidade! Notificação à ANPD pode ser necessária em 72h.");
    }

    return newIncident;
  }

  // Getters
  getComplianceChecks(): LGPDComplianceCheck[] {
    return [...this.complianceChecks];
  }

  getDPOReports(): DPOReport[] {
    return [...this.dpoReports];
  }

  getPrivacyIncidents(): IncidentResponse[] {
    return [...this.incidents];
  }

  // Gerar relatório completo de conformidade
  generateComplianceReport(): any {
    const compliant = this.complianceChecks.filter(c => c.status === 'compliant').length;
    const partial = this.complianceChecks.filter(c => c.status === 'partial').length;
    const nonCompliant = this.complianceChecks.filter(c => c.status === 'non_compliant').length;

    return {
      summary: {
        compliance_rate: Math.round((compliant / this.complianceChecks.length) * 100),
        total_requirements: this.complianceChecks.length,
        compliant_requirements: compliant,
        partial_requirements: partial,
        non_compliant_requirements: nonCompliant,
        open_incidents: this.incidents.filter(i => i.status === 'open').length,
        total_incidents: this.incidents.length
      },
      requirements: this.complianceChecks,
      incidents: this.incidents,
      dpo_reports: this.dpoReports,
      generated_at: new Date().toISOString()
    };
  }
}

export const lgpdComplianceService = LGPDComplianceService.getInstance();
