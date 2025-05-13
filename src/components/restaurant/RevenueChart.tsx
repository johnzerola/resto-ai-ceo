
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface RevenueChartProps {
  data: {
    name: string;
    revenue: number;
  }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="h-[300px] bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Receita Mensal</h3>
        <p className="text-sm text-gray-500">Valores em reais (R$)</p>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <LineChart data={data}>
          <XAxis
            dataKey="name"
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value / 1000}k`}
          />
          <Tooltip
            formatter={(value: number) => [formatCurrency(value), "Receita"]}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
            }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#2E7FE8"
            strokeWidth={2}
            activeDot={{ r: 6, fill: "#2E7FE8", strokeWidth: 0 }}
            dot={{ r: 4, fill: "#2E7FE8", strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
