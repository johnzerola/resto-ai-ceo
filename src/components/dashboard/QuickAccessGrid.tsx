
import React, { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, DollarSign, Target, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const quickAccessCards = [
  {
    title: "Projeções",
    description: "Planejamento estratégico",
    icon: TrendingUp,
    href: "/projecoes",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600"
  },
  {
    title: "Fluxo de Caixa", 
    description: "Gestão financeira",
    icon: DollarSign,
    href: "/fluxo-de-caixa",
    iconBg: "bg-green-100", 
    iconColor: "text-green-600"
  },
  {
    title: "Metas",
    description: "Objetivos e resultados",
    icon: Target,
    href: "/metas", 
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600"
  },
  {
    title: "Relatórios",
    description: "Análises detalhadas",
    icon: BarChart3,
    href: "/dre",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600"
  }
];

const QuickAccessGrid = memo(() => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {quickAccessCards.map((card) => (
        <Link key={card.href} to={card.href} className="group">
          <Card className="h-full border-0 shadow-sm hover:shadow-lg transition-all duration-300 transform group-hover:scale-[1.02] bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                  <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 group-hover:text-slate-700 transition-colors truncate">
                    {card.title}
                  </h3>
                  <p className="text-sm text-slate-600 truncate">
                    {card.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
});

export default QuickAccessGrid;
