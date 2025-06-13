
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { SubscriptionTester } from "@/components/subscription/SubscriptionTester";

const TestePage = () => {
  return (
    <ModernLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Teste de Sistema</h1>
          <p className="text-muted-foreground">
            Verificação da integração com Supabase e sistema de planos
          </p>
        </div>

        <SubscriptionTester />
      </div>
    </ModernLayout>
  );
};

export default TestePage;
