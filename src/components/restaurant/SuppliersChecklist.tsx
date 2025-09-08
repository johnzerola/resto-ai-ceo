import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Truck, Calendar, DollarSign, Package, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SupplierData {
  fornecedor: string;
  produtos: {
    nome: string;
    ultima_compra: string | null;
    preco_ultima_compra: number;
    quantidade_ultima: number;
    estoque_atual: number;
    categoria: string;
  }[];
  total_produtos: number;
  produtos_sem_compra: number;
  valor_ultima_compra_total: number;
  dias_desde_ultima_compra: number | null;
}

export function SuppliersChecklist() {
  const { currentRestaurant } = useAuth();
  const [suppliers, setSuppliers] = useState<SupplierData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentRestaurant?.id) {
      loadSuppliersData();
    }
  }, [currentRestaurant]);

  const loadSuppliersData = async () => {
    try {
      // Buscar dados dos insumos com informações de fornecedores
      const { data: insumos, error } = await supabase
        .from('insumos')
        .select('*')
        .eq('restaurant_id', currentRestaurant?.id)
        .not('fornecedor', 'is', null)
        .neq('fornecedor', '');

      if (error) throw error;

      // Agrupar por fornecedor
      const suppliersMap = new Map<string, SupplierData>();

      insumos?.forEach(insumo => {
        const fornecedor = insumo.fornecedor || 'Sem Fornecedor';
        
        if (!suppliersMap.has(fornecedor)) {
          suppliersMap.set(fornecedor, {
            fornecedor,
            produtos: [],
            total_produtos: 0,
            produtos_sem_compra: 0,
            valor_ultima_compra_total: 0,
            dias_desde_ultima_compra: null
          });
        }

        const supplierData = suppliersMap.get(fornecedor)!;
        
        // Calcular dias desde última compra
        let diasDesdeUltimaCompra = null;
        if (insumo.ultima_compra) {
          const ultimaCompra = new Date(insumo.ultima_compra);
          const hoje = new Date();
          diasDesdeUltimaCompra = Math.floor((hoje.getTime() - ultimaCompra.getTime()) / (1000 * 60 * 60 * 24));
        }

        supplierData.produtos.push({
          nome: insumo.nome,
          ultima_compra: insumo.ultima_compra,
          preco_ultima_compra: insumo.preco_ultima_compra || 0,
          quantidade_ultima: insumo.volume_embalagem || 0,
          estoque_atual: insumo.estoque_atual || 0,
          categoria: insumo.categoria || 'Geral'
        });

        supplierData.total_produtos++;
        
        if (!insumo.ultima_compra) {
          supplierData.produtos_sem_compra++;
        } else {
          supplierData.valor_ultima_compra_total += (insumo.preco_ultima_compra || 0);
          
          // Atualizar dias desde última compra do fornecedor (menor valor)
          if (diasDesdeUltimaCompra !== null) {
            if (supplierData.dias_desde_ultima_compra === null || 
                diasDesdeUltimaCompra < supplierData.dias_desde_ultima_compra) {
              supplierData.dias_desde_ultima_compra = diasDesdeUltimaCompra;
            }
          }
        }
      });

      // Converter para array e ordenar
      const suppliersArray = Array.from(suppliersMap.values()).sort((a, b) => {
        // Priorizar fornecedores com produtos sem compra
        if (a.produtos_sem_compra !== b.produtos_sem_compra) {
          return b.produtos_sem_compra - a.produtos_sem_compra;
        }
        // Depois por dias desde última compra (mais antigo primeiro)
        if (a.dias_desde_ultima_compra === null && b.dias_desde_ultima_compra === null) return 0;
        if (a.dias_desde_ultima_compra === null) return 1;
        if (b.dias_desde_ultima_compra === null) return -1;
        return b.dias_desde_ultima_compra - a.dias_desde_ultima_compra;
      });

      setSuppliers(suppliersArray);
    } catch (error) {
      console.error('Erro ao carregar dados dos fornecedores:', error);
      toast.error('Erro ao carregar checklist de fornecedores');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (supplier: SupplierData) => {
    if (supplier.produtos_sem_compra > 0) return 'destructive';
    if (supplier.dias_desde_ultima_compra === null) return 'secondary';
    if (supplier.dias_desde_ultima_compra > 30) return 'secondary';
    if (supplier.dias_desde_ultima_compra > 15) return 'default';
    return 'outline';
  };

  const getStatusText = (supplier: SupplierData) => {
    if (supplier.produtos_sem_compra > 0) {
      return `${supplier.produtos_sem_compra} sem histórico`;
    }
    if (supplier.dias_desde_ultima_compra === null) {
      return 'Sem compras';
    }
    if (supplier.dias_desde_ultima_compra === 0) {
      return 'Compra hoje';
    }
    return `${supplier.dias_desde_ultima_compra} dias atrás`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalSuppliers = suppliers.length;
  const suppliersWithIssues = suppliers.filter(s => s.produtos_sem_compra > 0).length;
  const totalProductsWithoutPurchase = suppliers.reduce((acc, s) => acc + s.produtos_sem_compra, 0);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
        <div className="h-64 bg-muted rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alertas */}
      {suppliersWithIssues > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            <div className="flex flex-col gap-2">
              <span className="font-medium text-yellow-800">
                ⚠️ {suppliersWithIssues} fornecedor(es) com produtos sem histórico de compra
              </span>
              <div className="text-sm text-yellow-700">
                Total de {totalProductsWithoutPurchase} produto(s) precisam ter compras registradas.
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Cards de Resumo */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fornecedores</CardTitle>
            <Truck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSuppliers}</div>
            <p className="text-xs text-muted-foreground">cadastrados no sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Com Problemas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{suppliersWithIssues}</div>
            <p className="text-xs text-muted-foreground">produtos sem histórico</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos s/ Compra</CardTitle>
            <Package className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalProductsWithoutPurchase}</div>
            <p className="text-xs text-muted-foreground">precisam de registro</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Geral</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(((totalSuppliers - suppliersWithIssues) / Math.max(totalSuppliers, 1)) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">fornecedores OK</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Fornecedores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            Checklist Visual de Fornecedores
          </CardTitle>
          <CardDescription>
            Histórico de compras e status por fornecedor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {suppliers.map((supplier, index) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{supplier.fornecedor}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-muted-foreground">
                        {supplier.total_produtos} produto(s)
                      </span>
                      {supplier.valor_ultima_compra_total > 0 && (
                        <span className="text-sm font-medium text-green-600">
                          Última compra: {formatCurrency(supplier.valor_ultima_compra_total)}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge variant={getStatusColor(supplier)}>
                    {getStatusText(supplier)}
                  </Badge>
                </div>

                {/* Produtos do Fornecedor */}
                <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {supplier.produtos.map((produto, prodIndex) => (
                    <div 
                      key={prodIndex} 
                      className={`p-2 rounded text-sm ${
                        !produto.ultima_compra ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{produto.nome}</p>
                          <p className="text-xs text-muted-foreground">{produto.categoria}</p>
                        </div>
                        {!produto.ultima_compra ? (
                          <AlertTriangle className="h-4 w-4 text-red-500 ml-2 flex-shrink-0" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500 ml-2 flex-shrink-0" />
                        )}
                      </div>
                      
                      {produto.ultima_compra ? (
                        <div className="mt-1 space-y-1">
                          <p className="text-xs">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {new Date(produto.ultima_compra).toLocaleDateString('pt-BR')}
                          </p>
                          {produto.preco_ultima_compra > 0 && (
                            <p className="text-xs">
                              <DollarSign className="h-3 w-3 inline mr-1" />
                              {formatCurrency(produto.preco_ultima_compra)}
                            </p>
                          )}
                          <p className="text-xs">
                            <Package className="h-3 w-3 inline mr-1" />
                            Estoque: {produto.estoque_atual}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-red-600 mt-1">
                          Sem histórico de compra
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {suppliers.length === 0 && (
            <div className="text-center py-10">
              <div className="flex flex-col items-center gap-2">
                <Truck className="h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Nenhum fornecedor cadastrado
                </p>
                <p className="text-sm text-muted-foreground">
                  Cadastre fornecedores nos seus insumos para acompanhar compras
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}