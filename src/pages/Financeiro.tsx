
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { FinancialInsights } from "@/components/restaurant/FinancialInsights";
import { AccountsManager } from "@/components/restaurant/AccountsManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, CreditCard } from "lucide-react";

export function Financeiro() {
  return (
    <ModernLayout>
      <div className="main-content-padding space-y-4 sm:space-y-6 bg-background min-h-screen">
        <div className="flex flex-col space-y-2 sm:space-y-0 sm:justify-between sm:items-start">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
              Gestão Financeira
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Insights completos e gestão de contas do seu restaurante
            </p>
          </div>
        </div>
        
        <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
          <Tabs defaultValue="insights" className="w-full">
            <div className="border-b px-4 py-2">
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="insights" className="flex items-center gap-2 text-xs sm:text-sm">
                  <TrendingUp className="h-4 w-4" />
                  Insights
                </TabsTrigger>
                <TabsTrigger value="contas" className="flex items-center gap-2 text-xs sm:text-sm">
                  <CreditCard className="h-4 w-4" />
                  Contas
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="insights" className="p-4 sm:p-6">
              <FinancialInsights />
            </TabsContent>

            <TabsContent value="contas" className="p-4 sm:p-6">
              <AccountsManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ModernLayout>
  );
}
