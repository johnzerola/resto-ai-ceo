
import { toast } from "sonner";

// Tipos para auditoria de segurança
export interface SecurityEvent {
  id: string;
  userId: string;
  eventType: 'login' | 'logout' | 'data_access' | 'data_export' | 'failed_login' | 'permission_denied';
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  details?: any;
}

export interface DataAccessLog {
  id: string;
  userId: string;
  dataType: string;
  action: 'read' | 'write' | 'delete' | 'export';
  timestamp: string;
  ipAddress?: string;
}

// Classe principal de segurança
export class SecurityService {
  private static instance: SecurityService;
  private securityLogs: SecurityEvent[] = [];
  private dataAccessLogs: DataAccessLog[] = [];
  private failedLoginAttempts: Map<string, number> = new Map();
  private blockedIPs: Set<string> = new Set();

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  constructor() {
    // Carregar dados do localStorage na inicialização
    this.loadFromStorage();
  }

  // Carregar dados do localStorage
  private loadFromStorage(): void {
    try {
      const securityLogs = localStorage.getItem('security_logs');
      if (securityLogs) {
        this.securityLogs = JSON.parse(securityLogs);
      }

      const dataAccessLogs = localStorage.getItem('data_access_logs');
      if (dataAccessLogs) {
        this.dataAccessLogs = JSON.parse(dataAccessLogs);
      }

      const failedAttempts = localStorage.getItem('failed_login_attempts');
      if (failedAttempts) {
        this.failedLoginAttempts = new Map(JSON.parse(failedAttempts));
      }

      const blockedIPs = localStorage.getItem('blocked_ips');
      if (blockedIPs) {
        this.blockedIPs = new Set(JSON.parse(blockedIPs));
      }
    } catch (error) {
      console.error("Erro ao carregar dados de segurança:", error);
    }
  }

  // Salvar dados no localStorage
  private saveToStorage(): void {
    try {
      localStorage.setItem('security_logs', JSON.stringify(this.securityLogs));
      localStorage.setItem('data_access_logs', JSON.stringify(this.dataAccessLogs));
      localStorage.setItem('failed_login_attempts', JSON.stringify(Array.from(this.failedLoginAttempts.entries())));
      localStorage.setItem('blocked_ips', JSON.stringify(Array.from(this.blockedIPs)));
    } catch (error) {
      console.error("Erro ao salvar dados de segurança:", error);
    }
  }

  // Criptografia de dados sensíveis
  async encryptSensitiveData(data: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      
      // Gerar chave para criptografia
      const key = await crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
      );
      
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encryptedData = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        dataBuffer
      );
      
      // Salvar chave no localStorage de forma segura (em produção, usar vault)
      const keyData = await crypto.subtle.exportKey("raw", key);
      const keyArray = Array.from(new Uint8Array(keyData));
      localStorage.setItem("encKey", JSON.stringify({ key: keyArray, iv: Array.from(iv) }));
      
      return btoa(String.fromCharCode(...new Uint8Array(encryptedData)));
    } catch (error) {
      console.error("Erro na criptografia:", error);
      throw new Error("Falha na criptografia de dados");
    }
  }

  // Descriptografia de dados
  async decryptSensitiveData(encryptedData: string): Promise<string> {
    try {
      const keyInfo = localStorage.getItem("encKey");
      if (!keyInfo) throw new Error("Chave de criptografia não encontrada");
      
      const { key: keyArray, iv: ivArray } = JSON.parse(keyInfo);
      const keyBuffer = new Uint8Array(keyArray).buffer;
      const iv = new Uint8Array(ivArray);
      
      const key = await crypto.subtle.importKey(
        "raw",
        keyBuffer,
        { name: "AES-GCM" },
        false,
        ["decrypt"]
      );
      
      const encryptedBuffer = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
      const decryptedData = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        encryptedBuffer
      );
      
      const decoder = new TextDecoder();
      return decoder.decode(decryptedData);
    } catch (error) {
      console.error("Erro na descriptografia:", error);
      throw new Error("Falha na descriptografia de dados");
    }
  }

  // Log de eventos de segurança
  logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent
    };

    this.securityLogs.push(securityEvent);
    this.saveToStorage();
    
    // Verificar tentativas de login falhadas
    if (event.eventType === 'failed_login') {
      this.handleFailedLogin(event.userId);
    }
  }

  // Obter IP do cliente (simulado)
  private getClientIP(): string {
    // Em produção, isso seria obtido do servidor
    return '0.0.0.0';
  }

  // Gerenciar tentativas de login falhadas
  private handleFailedLogin(identifier: string): void {
    const attempts = this.failedLoginAttempts.get(identifier) || 0;
    this.failedLoginAttempts.set(identifier, attempts + 1);
    
    if (attempts >= 5) {
      this.blockedIPs.add(identifier);
      toast.error("Muitas tentativas de login falhadas. IP bloqueado temporariamente.");
      
      // Desbloquear após 15 minutos
      setTimeout(() => {
        this.blockedIPs.delete(identifier);
        this.failedLoginAttempts.delete(identifier);
        this.saveToStorage();
      }, 15 * 60 * 1000);
    }
    
    this.saveToStorage();
  }

  // Verificar se IP está bloqueado
  isIPBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  // Log de acesso a dados
  logDataAccess(userId: string, dataType: string, action: 'read' | 'write' | 'delete' | 'export'): void {
    const accessLog: DataAccessLog = {
      id: crypto.randomUUID(),
      userId,
      dataType,
      action,
      timestamp: new Date().toISOString(),
      ipAddress: this.getClientIP()
    };

    this.dataAccessLogs.push(accessLog);
    this.saveToStorage();
  }

  // Validação de entrada para prevenir XSS
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  }

  // Validação de SQL Injection
  validateSQLInput(input: string): boolean {
    const sqlPatterns = [
      /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b)/i,
      /(\bUNION\b|\bWHERE\b|\bOR\b|\bAND\b)/i,
      /(--|\/\*|\*\/|;)/
    ];
    
    return !sqlPatterns.some(pattern => pattern.test(input));
  }

  // Obter logs de segurança
  getSecurityLogs(): SecurityEvent[] {
    return [...this.securityLogs];
  }

  // Obter logs de acesso a dados
  getDataAccessLogs(): DataAccessLog[] {
    return [...this.dataAccessLogs];
  }

  // Limpar logs antigos (manter apenas dos últimos 30 dias)
  cleanOldLogs(): void {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    this.securityLogs = this.securityLogs.filter(log => 
      new Date(log.timestamp) > thirtyDaysAgo
    );
    
    this.dataAccessLogs = this.dataAccessLogs.filter(log => 
      new Date(log.timestamp) > thirtyDaysAgo
    );
    
    this.saveToStorage();
  }
}

// Instância singleton
export const securityService = SecurityService.getInstance();
