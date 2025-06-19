
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react";

interface FinancialSummaryProps {
  movimentos: any[];
}

export function FinancialSummary({ movimentos }: FinancialSummaryProps) {
  const totalEntradas = movimentos
    .filter(m => m.type === 'entrada')
    .reduce((acc, m) => acc + m.amount, 0);

  const totalSaidas = movimentos
    .filter(m => m.type === 'saida')
    .reduce((acc, m) => acc + m.amount, 0);

  const saldoLiquido = totalEntradas - totalSaidas;

  const contasAPagar = movimentos.filter(m => 
    m.type === 'saida' && 
    m.status === 'pending' && 
    m.vencimento && 
    new Date(m.vencimento) >= new Date()
  );

  const contasVencidas = movimentos.filter(m => 
    m.type === 'saida' && 
    m.status === 'pending' && 
    m.vencimento && 
    new Date(m.vencimento) < new Date()
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Entradas</p>
              <p className="text-2xl font-bold text-green-600">
                R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Saídas</p>
              <p className="text-2xl font-bold text-red-600">
                R$ {totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Saldo Líquido</p>
              <p className={`text-2xl font-bold ${saldoLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {saldoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <DollarSign className={`h-8 w-8 ${saldoLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Contas a Pagar</p>
              <p className="text-2xl font-bold text-orange-600">{contasAPagar.length}</p>
              {contasVencidas.length > 0 && (
                <p className="text-sm text-red-600">{contasVencidas.length} vencidas</p>
              )}
            </div>
            <Calendar className="h-8 w-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
