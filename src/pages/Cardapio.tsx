
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/services/AuthService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Cardapio() {
  return (
    <ProtectedRoute requiredRole={UserRole.EMPLOYEE}>
      <ModernLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Utensils className="h-8 w-8 text-orange-600" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Gestão do Cardápio</h1>
                <p className="text-muted-foreground">
                  Gerencie pratos, categorias e preços do seu cardápio
                </p>
              </div>
            </div>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Prato
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Hambúrguer Clássico
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">
                  Hambúrguer artesanal com queijo, alface, tomate e molho especial
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-green-600">R$ 25,90</span>
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                    Disponível
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Pizza Margherita
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">
                  Pizza tradicional com molho de tomate, mussarela e manjericão
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-green-600">R$ 45,00</span>
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                    Disponível
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Salada Caesar
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">
                  Alface americana, croutons, parmesão e molho caesar
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-green-600">R$ 18,90</span>
                  <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
                    Indisponível
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ModernLayout>
    </ProtectedRoute>
  );
}
