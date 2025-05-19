
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
import { Database, Download, Upload, Info, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackupRecuperacao() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Backup e Recuperação de Dados</h1>
        <TypographyP>
          Informações essenciais sobre como realizar backups periódicos dos seus dados
          e recuperá-los em caso de necessidade. Mantenha seus dados seguros!
        </TypographyP>
      </div>

      <Alert variant="destructive" className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-500" />
        <AlertTitle className="text-red-700">Importante</AlertTitle>
        <AlertDescription className="text-red-700">
          Faça backups regulares para evitar perda de dados importantes. Recomendamos backups semanais,
          especialmente antes de atualizações do sistema.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center mb-4 text-blue-600">
              <Download className="h-5 w-5 mr-2" />
              <h3 className="font-medium text-lg">Backup de Dados</h3>
            </div>
            
            <TypographyP>
              O sistema Resto AI CEO armazena seus dados localmente no navegador.
              Para garantir a segurança dos dados, é importante exportá-los regularmente.
            </TypographyP>
            
            <TypographyH4>Como realizar um backup</TypographyH4>
            <TypographyList>
              <li>Acesse <strong>Configurações</strong> no menu lateral</li>
              <li>Selecione a aba <strong>Backups</strong></li>
              <li>Clique em <strong>Exportar Dados</strong></li>
              <li>Escolha onde salvar o arquivo JSON gerado</li>
              <li>Guarde o arquivo em local seguro e de preferência em mais de um dispositivo</li>
            </TypographyList>
            
            <TypographyH4>Backups automáticos</TypographyH4>
            <TypographyP>
              O sistema também realiza backups automáticos semanais que ficam armazenados por 30 dias.
              Você pode acessá-los na tela de Configurações {'>'}  Backups {'>'}  Histórico de Backups.
            </TypographyP>
            
            <div className="mt-4">
              <Button className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Realizar Backup Agora
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center mb-4 text-green-600">
              <Upload className="h-5 w-5 mr-2" />
              <h3 className="font-medium text-lg">Recuperação de Dados</h3>
            </div>
            
            <TypographyP>
              Em caso de problemas, perda de dados ou ao migrar para um novo dispositivo,
              você pode restaurar seus dados a partir de um backup anterior.
            </TypographyP>
            
            <TypographyH4>Como restaurar um backup</TypographyH4>
            <TypographyList>
              <li>Acesse <strong>Configurações</strong> no menu lateral</li>
              <li>Selecione a aba <strong>Backups</strong></li>
              <li>Clique em <strong>Importar Dados</strong></li>
              <li>Selecione o arquivo JSON do backup</li>
              <li>Confirme a operação para restaurar os dados</li>
            </TypographyList>
            
            <Alert className="mt-4 bg-amber-50 border-amber-200">
              <Info className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-amber-800">
                A restauração de um backup substituirá todos os dados atuais.
                Certifique-se de ter um backup recente dos dados atuais antes de proceder.
              </AlertDescription>
            </Alert>
            
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                Restaurar Backup
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />
      
      <TypographyH3>Boas Práticas de Backup</TypographyH3>
      <TypographyList>
        <li><strong>Regularidade</strong> - Realize backups pelo menos uma vez por semana</li>
        <li><strong>Múltiplos locais</strong> - Guarde cópias em diferentes dispositivos ou serviços na nuvem</li>
        <li><strong>Versões</strong> - Mantenha múltiplas versões de backup, não apenas a mais recente</li>
        <li><strong>Teste</strong> - Periodicamente, teste a restauração para garantir que seus backups funcionam</li>
        <li><strong>Proteção</strong> - Proteja seus arquivos de backup com senha se contiverem dados sensíveis</li>
      </TypographyList>
      
      <TypographyH3>Migração entre Dispositivos</TypographyH3>
      <TypographyP>
        Para migrar seus dados para um novo computador ou navegador, siga estes passos:
      </TypographyP>
      <TypographyList>
        <li>Realize um backup completo no dispositivo original</li>
        <li>Instale o Resto AI CEO no novo dispositivo</li>
        <li>Acesse Configurações {'>'}  Backups {'>'}  Importar Dados</li>
        <li>Selecione o arquivo de backup para restaurar todos os dados</li>
      </TypographyList>
      
      <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mt-6">
        <TypographyH4 className="mt-0">Dúvidas frequentes</TypographyH4>
        <div className="space-y-2">
          <div>
            <strong>O que é armazenado no backup?</strong>
            <p className="text-sm text-muted-foreground">
              Todos os dados do sistema: financeiros, estoque, receitas, configurações e preferências do usuário.
            </p>
          </div>
          <div>
            <strong>Posso editar manualmente o arquivo de backup?</strong>
            <p className="text-sm text-muted-foreground">
              Não recomendamos. A edição manual pode corromper o arquivo e torná-lo inutilizável.
            </p>
          </div>
          <div>
            <strong>Quanto espaço ocupam os backups?</strong>
            <p className="text-sm text-muted-foreground">
              O tamanho varia conforme a quantidade de dados, mas geralmente são arquivos pequenos (menos de 5MB).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
