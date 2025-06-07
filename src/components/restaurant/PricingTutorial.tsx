
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronLeft, CheckCircle, Play } from "lucide-react";

interface PricingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyExample: (example: any) => void;
}

export function PricingTutorial({ isOpen, onClose, onApplyExample }: PricingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      title: "Bem-vindo ao Simulador de Precificação",
      content: "Este simulador calcula o preço ideal para seus pratos considerando todos os custos e impostos do seu restaurante.",
      tip: "Dica: Use dados reais para obter resultados precisos!"
    },
    {
      title: "Modelo de Negócio",
      content: "Escolha entre Rodízio (preço fixo por pessoa), Buffet por Peso (preço por kg) ou Tradicional (porções individuais).",
      tip: "Cada modelo tem suas particularidades de cálculo."
    },
    {
      title: "Custos e Desperdício",
      content: "Inclua o custo real dos ingredientes e considere o desperdício (média: 8-15%). Seja realista com estes números.",
      tip: "Desperdício elevado impacta diretamente sua margem!"
    },
    {
      title: "Impostos e Regime Tributário",
      content: "O simulador calcula automaticamente ISS, ICMS e impostos baseados no seu regime tributário (Simples Nacional ou Lucro Presumido).",
      tip: "Impostos podem representar 15-25% do seu faturamento."
    },
    {
      title: "Alertas Inteligentes",
      content: "O sistema avisa quando seu food cost passa de 35% ou quando a margem está abaixo do recomendado para sustentabilidade.",
      tip: "Siga as recomendações para manter seu negócio saudável."
    }
  ];

  const examples = [
    {
      name: "Buffet Self-Service",
      data: {
        model: "buffet_peso",
        costPerKg: 18,
        wastePercentage: 10,
        operationalCostPercentage: 25,
        desiredMarginPercentage: 30,
        expectedMonthlySales: 2000,
        taxRegime: "simples_nacional"
      }
    },
    {
      name: "Rodízio de Pizza",
      data: {
        model: "rodizio",
        costPerKg: 12,
        averageConsumptionPerPerson: 0.6,
        wastePercentage: 8,
        operationalCostPercentage: 30,
        desiredMarginPercentage: 35,
        expectedMonthlySales: 800,
        taxRegime: "simples_nacional"
      }
    },
    {
      name: "Restaurante Tradicional",
      data: {
        model: "traditional",
        costPerKg: 25,
        wastePercentage: 12,
        operationalCostPercentage: 28,
        desiredMarginPercentage: 32,
        expectedMonthlySales: 1200,
        taxRegime: "lucro_presumido"
      }
    }
  ];

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleApplyExample = (example: any) => {
    onApplyExample(example);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-blue-600" />
            Tutorial do Simulador
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          <div className="flex items-center gap-2">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded ${
                  index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {tutorialSteps[currentStep].title}
            </h3>
            <p className="text-muted-foreground">
              {tutorialSteps[currentStep].content}
            </p>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 {tutorialSteps[currentStep].tip}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>

            {currentStep === tutorialSteps.length - 1 ? (
              <Button onClick={onClose} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-1" />
                Concluir Tutorial
              </Button>
            ) : (
              <Button onClick={nextStep}>
                Próximo
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>

          {/* Examples Section */}
          {currentStep === tutorialSteps.length - 1 && (
            <div className="border-t pt-4 space-y-3">
              <h4 className="font-medium">Exemplos Práticos</h4>
              <p className="text-sm text-muted-foreground">
                Comece com um exemplo pré-configurado:
              </p>
              <div className="grid gap-3">
                {examples.map((example) => (
                  <div
                    key={example.name}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleApplyExample(example)}
                  >
                    <div>
                      <p className="font-medium">{example.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Modelo: {example.data.model === 'buffet_peso' ? 'Buffet por Peso' : 
                                example.data.model === 'rodizio' ? 'Rodízio' : 'Tradicional'}
                      </p>
                    </div>
                    <Badge variant="outline">Aplicar</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
