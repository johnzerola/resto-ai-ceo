
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";

const quickAccessCards = [
  {
    title: "Projeções",
    description: "Planejamento estratégico",
    icon: TrendingUp,
    href: "/projecoes",
    gradient: "from-purple-500 to-purple-600",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600"
  },
  {
    title: "Fluxo de Caixa", 
    description: "Gestão financeira",
    icon: DollarSign,
    href: "/fluxo-de-caixa",
    gradient: "from-green-500 to-green-600",
    iconBg: "bg-green-100", 
    iconColor: "text-green-600"
  },
  {
    title: "Metas",
    description: "Objetivos e resultados",
    icon: Target,
    href: "/metas", 
    gradient: "from-blue-500 to-blue-600",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600"
  },
  {
    title: "Relatórios",
    description: "Análises detalhadas",
    icon: BarChart3,
    href: "/dre",
    gradient: "from-orange-500 to-orange-600", 
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600"
  }
];

export default function QuickAccessGrid() {
  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
      {quickAccessCards.map((card) => (
        <Link key={card.href} to={card.href} className="group">
          <Card className="h-full border-0 shadow-sm hover:shadow-lg transition-all duration-300 transform group-hover:scale-[1.02] bg-white/70 backdrop-blur-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className={`p-2 sm:p-2.5 rounded-xl ${card.iconBg}`}>
                  <card.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${card.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base text-slate-900 group-hover:text-slate-700 transition-colors truncate">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 truncate">
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
}
