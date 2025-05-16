
import { formatCurrency } from "@/lib/utils";

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
  return (
    <div className="space-y-4">
      {products.map((product, i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              {i + 1}
            </div>
            <div>
              <p className="font-medium text-gray-900">{product.name}</p>
              <p className="text-sm text-gray-500">{product.sales} vendas</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium text-gray-900">
              {formatCurrency(product.revenue)}
            </p>
            <p className={`text-sm ${product.margin >= 30 ? "text-green-600" : "text-amber-500"}`}>
              {product.margin}% margem
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
