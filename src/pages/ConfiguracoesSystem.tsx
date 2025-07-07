import React from 'react';
import { ModernLayout } from "@/components/restaurant/ModernLayout";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Settings, 
  Bell, 
  Shield, 
  User, 
  Palette, 
  Database,
  Clock,
  Globe,
  Phone,
  Mail,
  MapPin,
  DollarSign
} from "lucide-react";

export default function ConfiguracoesSystem() {
  return (
    <ModernLayout>
      <div className="main-content-padding space-y-4 sm:space-y-6 bg-background min-h-screen">
        <div className="flex flex-col space-y-2 sm:space-y-0 sm:justify-between sm:items-start">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              Configurações do Sistema
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Personalize e configure seu restaurante no Lucraí
            </p>
          </div>
        </div>
        
        <Tabs defaultValue="geral" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="restaurante">Restaurante</TabsTrigger>
            <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
            <TabsTrigger value="conta">Conta</TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Interface
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Modo de Visualização</div>
                    <div className="text-sm text-muted-foreground">Interface clara padrão</div>
                  </div>
                  <Badge variant="secondary">Claro</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Idioma e Região
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Idioma</div>
                    <div className="text-sm text-muted-foreground">Português (Brasil)</div>
                  </div>
                  <Badge variant="secondary">Padrão</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Fuso Horário</div>
                    <div className="text-sm text-muted-foreground">America/Sao_Paulo (GMT-3)</div>
                  </div>
                  <Badge variant="secondary">Auto</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="restaurante" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Informações do Restaurante
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="font-medium mb-1">Nome do Restaurante</div>
                    <div className="text-sm text-muted-foreground">Meu Restaurante</div>
                  </div>
                  <div>
                    <div className="font-medium mb-1">CNPJ</div>
                    <div className="text-sm text-muted-foreground">00.000.000/0001-00</div>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Telefone</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      (11) 99999-9999
                    </div>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Email</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      contato@restaurante.com
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="mt-4">
                  Editar Informações
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Configurações Financeiras
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="font-medium mb-1">Moeda</div>
                    <div className="text-sm text-muted-foreground">Real Brasileiro (R$)</div>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Markup Padrão</div>
                    <div className="text-sm text-muted-foreground">250%</div>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Margem CMV Ideal</div>
                    <div className="text-sm text-muted-foreground">30%</div>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Taxa de Impostos</div>
                    <div className="text-sm text-muted-foreground">15%</div>
                  </div>
                </div>
                <Button variant="outline" className="mt-4">
                  Configurar Margens
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notificacoes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Alertas do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Estoque Baixo</div>
                    <div className="text-sm text-muted-foreground">Alertas quando ingredientes estão acabando</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">CMV Alto</div>
                    <div className="text-sm text-muted-foreground">Avisos quando CMV passa de 35%</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Contas a Pagar</div>
                    <div className="text-sm text-muted-foreground">Lembrete de vencimentos próximos</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Relatórios Semanais</div>
                    <div className="text-sm text-muted-foreground">Resumo semanal por email</div>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conta" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações da Conta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="font-medium mb-1">Nome</div>
                    <div className="text-sm text-muted-foreground">Usuário do Sistema</div>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Email</div>
                    <div className="text-sm text-muted-foreground">usuario@email.com</div>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Plano Atual</div>
                    <Badge className="bg-green-100 text-green-800">Trial - 7 dias</Badge>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Membro desde</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Janeiro 2024
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 mt-4">
                  <Button variant="outline">
                    Editar Perfil
                  </Button>
                  <Button variant="outline">
                    Alterar Senha
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Autenticação de Dois Fatores</div>
                    <div className="text-sm text-muted-foreground">Proteja sua conta com 2FA</div>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Logout Automático</div>
                    <div className="text-sm text-muted-foreground">Sair automaticamente após inatividade</div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ModernLayout>
  );
}