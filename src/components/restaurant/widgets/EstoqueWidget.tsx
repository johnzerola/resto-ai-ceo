
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, AlertTriangle } from "lucide-react";

interface EstoqueWidgetProps {
  insumos: any[];
}

export function EstoqueWidget({ insumos }: EstoqueWidgetProps) {
  const getStatusEstoque = (insumo: any) => {
    if (insumo.estoque_atual <= 0) return 'zerado';
    if (insumo.estoque_atual <= insumo.estoque_minimo) return 'baixo';
    if (insumo.estoque_atual <= insumo.estoque_minimo * 2) return 'atencao';
    return 'ok';
  };

  const alertasEstoque = insumos.filter(i => {
    const status = getStatusEstoque(i);
    return status === 'baixo' || status === 'zerado';
  });

  const estatisticas = {
    total: insumos.length,
    zerado: insumos.filter(i => getStatusEstoque(i) === 'zerado').length,
    baixo: insumos.filter(i => getStatusEstoque(i) === 'baixo').length,
    ok: insumos.filter(i => getStatusEstoque(i) === 'ok').length
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-4 w-4" />
            Status do Estoque
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Total:</span>
              <Badge variant="secondary">{estatisticas.total}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>OK:</span>
              <Badge className="bg-green-100 text-green-800">{estatisticas.ok}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Baixo:</span>
              <Badge className="bg-orange-100 text-orange-800">{estatisticas.baixo}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Zerado:</span>
              <Badge className="bg-red-100 text-red-800">{estatisticas.zerado}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {alertasEstoque.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-orange-600">
              <AlertTriangle className="h-4 w-4" />
              Alertas de Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {alertasEstoque.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{item.nome}</span>
                  <Badge 
                    variant="outline" 
                    className={getStatusEstoque(item) === 'zerado' 
                      ? 'border-red-500 text-red-700' 
                      : 'border-orange-500 text-orange-700'
                    }
                  >
                    {item.estoque_atual} {item.unidade_medida}
                  </Badge>
                </div>
              ))}
              {alertasEstoque.length > 5 && (
                <div className="text-xs text-muted-foreground text-center">
                  ... e mais {alertasEstoque.length - 5} itens
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
