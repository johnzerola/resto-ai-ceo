
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FolderOpen, Plus, FileText, Settings } from "lucide-react";

export default function AkgunsAbasPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <FolderOpen className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Akguns Abas</h1>
            <p className="text-slate-600">Gerenciamento de abas e organização de conteúdo</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Abas</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 desde ontem</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Abas Ativas</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">66% do total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documentos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45</div>
              <p className="text-xs text-muted-foreground">Organizados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Badge variant="default" className="bg-green-100 text-green-800">Ativo</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">100%</div>
              <p className="text-xs text-muted-foreground">Operacional</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Abas Recentes</CardTitle>
                  <CardDescription>Últimas abas criadas ou modificadas</CardDescription>
                </div>
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Aba
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { nome: "Dashboard Principal", status: "Ativa", modificado: "2 min atrás" },
                  { nome: "Relatórios Financeiros", status: "Ativa", modificado: "15 min atrás" },
                  { nome: "Configurações", status: "Inativa", modificado: "1 hora atrás" },
                  { nome: "Backup de Dados", status: "Ativa", modificado: "2 horas atrás" },
                ].map((aba, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FolderOpen className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-slate-900">{aba.nome}</p>
                        <p className="text-sm text-slate-500">{aba.modificado}</p>
                      </div>
                    </div>
                    <Badge variant={aba.status === "Ativa" ? "default" : "secondary"}>
                      {aba.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Organização de Conteúdo</CardTitle>
              <CardDescription>Estrutura e organização das abas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border-2 border-dashed border-slate-200 rounded-lg text-center">
                  <FolderOpen className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-600 mb-2">Arraste e solte arquivos aqui</p>
                  <Button variant="outline" size="sm">
                    Selecionar Arquivos
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-slate-900">Categorias</h4>
                  <div className="flex flex-wrap gap-2">
                    {["Financeiro", "Operacional", "Marketing", "RH", "Vendas"].map((categoria) => (
                      <Badge key={categoria} variant="outline">
                        {categoria}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Ferramentas para gerenciar suas abas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button variant="outline" className="flex items-center gap-2 h-20">
                <Plus className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Criar Nova Aba</div>
                  <div className="text-sm text-muted-foreground">Adicionar nova seção</div>
                </div>
              </Button>
              
              <Button variant="outline" className="flex items-center gap-2 h-20">
                <Settings className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Configurar Abas</div>
                  <div className="text-sm text-muted-foreground">Gerenciar configurações</div>
                </div>
              </Button>
              
              <Button variant="outline" className="flex items-center gap-2 h-20">
                <FileText className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Exportar Dados</div>
                  <div className="text-sm text-muted-foreground">Baixar relatórios</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
