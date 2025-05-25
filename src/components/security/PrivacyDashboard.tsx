
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { lgpdService, DataSubjectRequest, PersonalDataInventory } from "@/services/LGPDService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Download, Trash2, Edit, Eye, Shield, FileText } from "lucide-react";

export function PrivacyDashboard() {
  const { user } = useAuth();
  const [userRequests, setUserRequests] = useState<DataSubjectRequest[]>([]);
  const [showDataRequest, setShowDataRequest] = useState(false);
  const [requestType, setRequestType] = useState<DataSubjectRequest['requestType']>('access');
  const [dataInventory] = useState<PersonalDataInventory[]>(lgpdService.getPersonalDataInventory());

  useEffect(() => {
    if (user) {
      setUserRequests(lgpdService.getUserRequests(user.id));
    }
  }, [user]);

  const handleDataRequest = async (type: DataSubjectRequest['requestType']) => {
    if (!user) return;

    try {
      const requestId = await lgpdService.createDataSubjectRequest(user.id, type);
      setUserRequests(lgpdService.getUserRequests(user.id));
      setShowDataRequest(false);
      toast.success(`Solicitação ${type} criada com ID: ${requestId}`);
    } catch (error) {
      toast.error("Erro ao criar solicitação");
    }
  };

  const handleExportData = async () => {
    if (!user) return;

    try {
      const userData = await lgpdService.exportUserData(user.id);
      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meus_dados_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success("Dados exportados com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar dados");
    }
  };

  const getStatusBadge = (status: DataSubjectRequest['status']) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Pendente" },
      in_progress: { color: "bg-blue-100 text-blue-800", text: "Em Andamento" },
      completed: { color: "bg-green-100 text-green-800", text: "Concluído" },
      rejected: { color: "bg-red-100 text-red-800", text: "Rejeitado" }
    };

    const config = statusConfig[status];
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  const getRequestTypeLabel = (type: DataSubjectRequest['requestType']) => {
    const labels = {
      access: "Acesso aos Dados",
      rectification: "Correção de Dados",
      erasure: "Exclusão de Dados",
      portability: "Portabilidade de Dados",
      restriction: "Restrição de Processamento"
    };
    return labels[type];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Painel de Privacidade</h2>
          <p className="text-muted-foreground">Gerencie seus dados pessoais e direitos de privacidade</p>
        </div>
        <Shield className="h-8 w-8 text-blue-600" />
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Download className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-medium">Exportar Meus Dados</h3>
                <p className="text-sm text-muted-foreground">Baixe uma cópia de todos os seus dados</p>
              </div>
            </div>
            <Button className="w-full mt-3" onClick={handleExportData}>
              Exportar Dados
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Edit className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-medium">Solicitar Correção</h3>
                <p className="text-sm text-muted-foreground">Corrija informações incorretas</p>
              </div>
            </div>
            <Button 
              className="w-full mt-3" 
              variant="outline"
              onClick={() => handleDataRequest('rectification')}
            >
              Solicitar Correção
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Trash2 className="h-8 w-8 text-red-600" />
              <div>
                <h3 className="font-medium">Excluir Dados</h3>
                <p className="text-sm text-muted-foreground">Solicite a exclusão dos seus dados</p>
              </div>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full mt-3" variant="destructive">
                  Solicitar Exclusão
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmar Exclusão de Dados</DialogTitle>
                </DialogHeader>
                <p className="text-sm">
                  Esta ação solicitará a exclusão permanente de todos os seus dados. 
                  Esta ação não pode ser desfeita. Tem certeza?
                </p>
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="destructive" 
                    onClick={() => handleDataRequest('erasure')}
                    className="flex-1"
                  >
                    Confirmar Exclusão
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Inventário de Dados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Como Usamos Seus Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo de Dado</TableHead>
                <TableHead>Finalidade</TableHead>
                <TableHead>Base Legal</TableHead>
                <TableHead>Tempo de Retenção</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataInventory.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.dataType}</TableCell>
                  <TableCell>{item.purpose}</TableCell>
                  <TableCell>{item.legalBasis}</TableCell>
                  <TableCell>{item.retentionPeriod}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Minhas Solicitações */}
      <Card>
        <CardHeader>
          <CardTitle>Minhas Solicitações</CardTitle>
        </CardHeader>
        <CardContent>
          {userRequests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data da Solicitação</TableHead>
                  <TableHead>Data de Conclusão</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{getRequestTypeLabel(request.requestType)}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>{new Date(request.requestDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {request.completionDate 
                        ? new Date(request.completionDate).toLocaleDateString()
                        : '-'
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              Nenhuma solicitação encontrada
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
