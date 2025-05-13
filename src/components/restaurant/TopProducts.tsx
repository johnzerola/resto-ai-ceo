
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Product {
  name: string;
  sales: number;
  revenue: number;
  margin: number;
}

interface TopProductsProps {
  products: Product[];
}

export function TopProducts({ products }: TopProductsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produtos Mais Vendidos</CardTitle>
        <CardDescription>Top produtos por volume de vendas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.map((product, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-md bg-resto-blue-100 text-resto-blue-700 flex items-center justify-center font-bold">
                  {i + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.sales} vendas</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">{formatCurrency(product.revenue)}</p>
                <p className={`text-sm ${product.margin >= 30 ? "text-resto-green-600" : "text-amber-500"}`}>
                  {product.margin}% margem
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
