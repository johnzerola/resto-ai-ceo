
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  BarChart3,
  Calculator,
  FileText,
  Package,
  Wallet
} from "lucide-react";
import { Link } from "react-router-dom";

const quickAccessCards = [
  {
    title: "Sistema Financeiro",
    description: "DRE + KPIs + Alertas",
    icon: Calculator,
    href: "/financeiro",
    gradient: "from-blue-500 to-blue-600",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    badge: "NOVO"
  },
  {
    title: "Ficha Técnica", 
    description: "Receitas e custos",
    icon: FileText,
    href: "/ficha-tecnica",
    gradient: "from-green-500 to-green-600",
    iconBg: "bg-green-100 dark:bg-green-900/30", 
    iconColor: "text-green-600 dark:text-green-400"
  },
  {
    title: "Precificação",
    description: "Calcular preços ideais",
    icon: DollarSign,
    href: "/precificacao", 
    gradient: "from-purple-500 to-purple-600",
    iconBg: "bg-purple-100 dark:bg-purple-900/30",
    iconColor: "text-purple-600 dark:text-purple-400"
  },
  {
    title: "DRE & CMV",
    description: "Análise financeira",
    icon: BarChart3,
    href: "/dre-cmv",
    gradient: "from-orange-500 to-orange-600", 
    iconBg: "bg-orange-100 dark:bg-orange-900/30",
    iconColor: "text-orange-600 dark:text-orange-400"
  },
  {
    title: "Fluxo de Caixa",
    description: "Entradas e saídas",
    icon: Wallet,
    href: "/fluxo-caixa",
    gradient: "from-emerald-500 to-emerald-600",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-600 dark:text-emerald-400"
  },
  {
    title: "Estoque",
    description: "Controle de ingredientes",
    icon: Package,
    href: "/estoque",
    gradient: "from-amber-500 to-amber-600",
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400"
  }
];

export default function QuickAccessGrid() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Acesso Rápido
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Principais funcionalidades
        </p>
      </div>
      
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {quickAccessCards.map((card) => (
          <Link key={card.href} to={card.href} className="group">
            <Card className="h-full border border-slate-200/60 dark:border-slate-700/60 shadow-sm hover:shadow-lg transition-all duration-300 transform group-hover:scale-[1.02] bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                      <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                    </div>
                    {card.badge && (
                      <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full font-medium">
                        {card.badge}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {card.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
