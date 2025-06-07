
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { UnifiedAIAssistant } from "@/components/restaurant/UnifiedAIAssistant";

export function AIAssistantPage() {
  return (
    <ModernLayout>
      <div className="main-content-padding">
        <UnifiedAIAssistant />
      </div>
    </ModernLayout>
  );
}
