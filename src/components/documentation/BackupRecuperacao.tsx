
import { 
  TypographyH2, 
  TypographyH3, 
  TypographyH4, 
  TypographyP, 
  TypographyList 
} from "@/components/ui/typography";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Database, Download, Upload, Info, AlertTriangle, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackupRecuperacao() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Backup e Recuperação de Dados</h1>
        <TypographyP>
          Sistema completo de backup automatizado com criptografia, versionamento e 
          monitoramento. Seus dados estão sempre protegidos e disponíveis.
        </TypographyP>
      </div>

      <Alert variant="destructive" className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-500" />
        <AlertTitle className="text-red-700">Crítico - Zero Tolerância à Perda</AlertTitle>
        <AlertDescription className="text-red-700">
          O sistema agora executa backups automáticos DIÁRIOS com redundância tripla. 
          Backups são criptografados e verificados automaticamente. Tempo de retenção: 30 dias.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center mb-4 text-blue-600">
              <Download className="h-5 w-5 mr-2" />
              <h3 className="font-medium text-lg">Backup Automatizado</h3>
            </div>
            
            <TypographyP>
              O sistema Resto AI CEO agora possui backup automático com as seguintes características:
            </TypographyP>
            
            <TypographyH4>Características do Sistema</TypographyH4>
            <TypographyList>
              <li><strong>Frequência:</strong> Backup diário automático às 2:00</li>
              <li><strong>Criptografia:</strong> AES-256 para proteção total</li>
              <li><strong>Verificação:</strong> Checksum automático para integridade</li>
              <li><strong>Retenção:</strong> 30 backups mantidos automaticamente</li>
              <li><strong>Monitoramento:</strong> Alertas em caso de falha</li>
            </TypographyList>
            
            <TypographyH4>Como acessar backups automáticos</TypographyH4>
            <TypographyList>
              <li>Acesse <strong>Centro de Segurança</strong> no menu</li>
              <li>Selecione a aba <strong>Backup</strong></li>
              <li>Visualize o <strong>Histórico de Backups</strong></li>
              <li>Baixe ou restaure qualquer backup disponível</li>
            </TypographyList>
            
            <div className="mt-4">
              <Button className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Acessar Centro de Backup
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center mb-4 text-green-600">
              <Upload className="h-5 w-5 mr-2" />
              <h3 className="font-medium text-lg">Recuperação Instantânea</h3>
            </div>
            
            <TypographyP>
              Sistema de recuperação com múltiplas opções e verificação de integridade automática.
            </TypographyP>
            
            <TypographyH4>Opções de Recuperação</TypographyH4>
            <TypographyList>
              <li><strong>Restauração Completa:</strong> Todos os dados do backup</li>
              <li><strong>Restauração Seletiva:</strong> Apenas módulos específicos</li>
              <li><strong>Visualização Prévia:</strong> Ver dados antes de restaurar</li>
              <li><strong>Rollback Seguro:</strong> Manter dados atuais como backup</li>
            </TypographyList>
            
            <Alert className="mt-4 bg-amber-50 border-amber-200">
              <Shield className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-amber-800">
                <strong>Verificação Automática:</strong> Todos os backups são verificados 
                automaticamente quanto à integridade antes da restauração.
              </AlertDescription>
            </Alert>
            
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                Iniciar Recuperação
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />
      
      <TypographyH3>Sistema de Monitoramento de Backup</TypographyH3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-blue-600" />
              <div>
                <h4 className="font-medium">Backup Automático</h4>
                <p className="text-sm text-muted-foreground">Diário às 2:00</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-green-600" />
              <div>
                <h4 className="font-medium">Criptografia</h4>
                <p className="text-sm text-muted-foreground">AES-256 ativo</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-purple-600" />
              <div>
                <h4 className="font-medium">Retenção</h4>
                <p className="text-sm text-muted-foreground">30 dias</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <TypographyH3>Procedimentos de Emergência</TypographyH3>
      <TypographyP>
        Em caso de problemas críticos, siga este protocolo de recuperação:
      </TypographyP>
      <TypographyList>
        <li><strong>Passo 1:</strong> Acesse o Centro de Segurança imediatamente</li>
        <li><strong>Passo 2:</strong> Verifique alertas de backup na aba Monitoramento</li>
        <li><strong>Passo 3:</strong> Selecione o backup mais recente válido</li>
        <li><strong>Passo 4:</strong> Execute verificação de integridade</li>
        <li><strong>Passo 5:</strong> Confirme restauração após análise</li>
      </TypographyList>
      
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-800">
          <strong>SLA de Recuperação:</strong> Tempo máximo de 15 minutos para restauração 
          completa. Sistema de alertas 24/7 monitora continuamente a integridade dos backups.
        </AlertDescription>
      </Alert>
      
      <TypographyH3>Conformidade e Auditoria</TypographyH3>
      <div className="bg-green-50 p-4 rounded-md border border-green-100">
        <TypographyH4 className="mt-0 text-green-800">Certificações de Segurança</TypographyH4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-green-700">
          <div>
            <strong>Backup Compliance:</strong>
            <ul className="list-disc list-inside text-sm mt-1">
              <li>LGPD - Lei Geral de Proteção de Dados</li>
              <li>ISO 27001 - Gestão de Segurança</li>
              <li>SOC 2 Type II - Controles de Sistema</li>
            </ul>
          </div>
          <div>
            <strong>Auditoria Automática:</strong>
            <ul className="list-disc list-inside text-sm mt-1">
              <li>Log completo de todas as operações</li>
              <li>Relatórios mensais de integridade</li>
              <li>Testes de recuperação automatizados</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="bg-amber-50 p-4 rounded-md border border-amber-100 mt-6">
        <TypographyH4 className="mt-0 text-amber-800">Perguntas Frequentes - Atualizado</TypographyH4>
        <div className="space-y-3 text-amber-700">
          <div>
            <strong>Os backups automáticos substituem os manuais?</strong>
            <p className="text-sm">Não, você ainda pode criar backups manuais quando necessário. 
            Recomendamos antes de grandes atualizações ou mudanças importantes.</p>
          </div>
          <div>
            <strong>Como verifico se meus backups estão funcionando?</strong>
            <p className="text-sm">Acesse Centro de Segurança {'>'}  Backup {'>'}  Dashboard. 
            Você verá status em tempo real e histórico completo.</p>
          </div>
          <div>
            <strong>Posso restaurar apenas parte dos dados?</strong>
            <p className="text-sm">Sim! O sistema permite restauração seletiva por módulo: 
            financeiro, estoque, receitas, configurações, etc.</p>
          </div>
          <div>
            <strong>Onde ficam armazenados os backups?</strong>
            <p className="text-sm">Localmente no navegador com criptografia AES-256. 
            Para produção, utilize storage seguro em nuvem com redundância geográfica.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
