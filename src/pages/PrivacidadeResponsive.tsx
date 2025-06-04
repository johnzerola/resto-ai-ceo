
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, Database } from "lucide-react";

export function PrivacidadeResponsive() {
  const privacyFeatures = [
    {
      icon: Shield,
      title: "Proteção de Dados",
      description: "Seus dados são protegidos com criptografia de ponta a ponta e armazenados em servidores seguros."
    },
    {
      icon: Lock,
      title: "Acesso Controlado",
      description: "Sistema de autenticação robusto com controle de acesso baseado em funções e permissões."
    },
    {
      icon: Eye,
      title: "Transparência",
      description: "Você tem total controle sobre quais dados são coletados e como são utilizados."
    },
    {
      icon: Database,
      title: "Backup Seguro",
      description: "Backups automáticos e redundância de dados para garantir que suas informações nunca sejam perdidas."
    }
  ];

  return (
    <ModernLayout>
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-6 bg-background min-h-screen">
        <div className="text-center space-y-2 sm:space-y-4">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
            Privacidade e Segurança de Dados
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
            Sua privacidade é nossa prioridade. Conheça como protegemos seus dados.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto">
          {privacyFeatures.map((feature, index) => (
            <Card key={index} className="h-full">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-12 h-12 bg-restauria-green-profit/10 rounded-lg flex items-center justify-center mb-3">
                  <feature.icon className="h-6 w-6 text-restauria-green-profit" />
                </div>
                <CardTitle className="text-lg sm:text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-xs sm:text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Política de Privacidade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs sm:text-sm">
            <div>
              <h3 className="font-semibold mb-2">Coleta de Dados</h3>
              <p className="text-muted-foreground leading-relaxed">
                Coletamos apenas os dados necessários para o funcionamento do sistema, incluindo informações do restaurante, 
                dados financeiros e de estoque que você inserir voluntariamente.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Uso dos Dados</h3>
              <p className="text-muted-foreground leading-relaxed">
                Seus dados são utilizados exclusivamente para fornecer os serviços da plataforma, gerar relatórios e 
                análises para seu restaurante, e melhorar nossa solução.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Compartilhamento</h3>
              <p className="text-muted-foreground leading-relaxed">
                Não compartilhamos, vendemos ou distribuímos seus dados para terceiros. Seus dados permanecem privados e 
                sob seu controle.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModernLayout>
  );
}
