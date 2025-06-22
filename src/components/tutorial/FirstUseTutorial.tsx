
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  ChevronRight, 
  ChevronLeft, 
  Settings,
  Calculator,
  FileText,
  BarChart3,
  CheckCircle
} from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  href: string;
  completed: boolean;
}

interface FirstUseTutorialProps {
  onClose?: () => void;
}

export function FirstUseTutorial({ onClose }: FirstUseTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const tutorialSteps: TutorialStep[] = [
    {
      id: 'config',
      title: 'Configure seu Restaurante',
      description: 'Defina as informações básicas: despesas, markup, margem desejada e meta de receita mensal.',
      icon: <Settings className="h-6 w-6 text-blue-600" />,
      action: 'Configurar Agora',
      href: '/configuracoes',
      completed: completedSteps.includes('config')
    },
    {
      id: 'ingredients',
      title: 'Cadastre seus Ingredientes',
      description: 'Adicione os insumos principais com preços atualizados para cálculos precisos.',
      icon: <FileText className="h-6 w-6 text-green-600" />,
      action: 'Cadastrar Ingredientes',
      href: '/ficha-tecnica-inteligente-completa',
      completed: completedSteps.includes('ingredients')
    },
    {
      id: 'dishes',
      title: 'Crie suas Fichas Técnicas',
      description: 'Monte a receita dos seus pratos principais com quantidades e rendimento.',
      icon: <Calculator className="h-6 w-6 text-purple-600" />,
      action: 'Criar Fichas',
      href: '/ficha-tecnica-inteligente-completa',
      completed: completedSteps.includes('dishes')
    },
    {
      id: 'prices',
      title: 'Analise Preços e Margens',
      description: 'Revise os preços sugeridos e ajuste conforme sua estratégia de mercado.',
      icon: <BarChart3 className="h-6 w-6 text-orange-600" />,
      action: 'Ver Relatórios',
      href: '/dre',
      completed: completedSteps.includes('prices')
    }
  ];

  const markStepCompleted = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps(prev => [...prev, stepId]);
    }
  };

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

  const progress = (completedSteps.length / tutorialSteps.length) * 100;
  const currentStepData = tutorialSteps[currentStep];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-blue-600" />
            Tutorial de Primeiro Uso
          </CardTitle>
          <Badge variant="outline">
            {currentStep + 1} de {tutorialSteps.length}
          </Badge>
        </div>
        <Progress value={(currentStep + 1) / tutorialSteps.length * 100} className="mt-2" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Step atual */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            {currentStepData.icon}
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2">{currentStepData.title}</h3>
            <p className="text-muted-foreground mb-4">
              {currentStepData.description}
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <Button asChild>
              <a href={currentStepData.href} onClick={() => markStepCompleted(currentStepData.id)}>
                {currentStepData.action}
              </a>
            </Button>
            
            {currentStepData.completed && (
              <Button variant="outline" className="text-green-600 border-green-200">
                <CheckCircle className="h-4 w-4 mr-2" />
                Concluído
              </Button>
            )}
          </div>
        </div>

        {/* Navegação */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>

          <div className="text-sm text-muted-foreground">
            Progresso geral: {Math.round(progress)}%
          </div>

          {currentStep < tutorialSteps.length - 1 ? (
            <Button onClick={nextStep}>
              Próximo
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={onClose} variant="default">
              Finalizar Tutorial
            </Button>
          )}
        </div>

        {/* Lista de todos os passos */}
        <div className="space-y-2 pt-4 border-t">
          <h4 className="font-medium text-sm text-muted-foreground">Todos os Passos:</h4>
          {tutorialSteps.map((step, index) => (
            <div 
              key={step.id}
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                index === currentStep ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
              }`}
              onClick={() => setCurrentStep(index)}
            >
              <div className="flex-shrink-0">
                {step.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <div className={`w-5 h-5 rounded-full border-2 ${
                    index === currentStep ? 'border-blue-600 bg-blue-100' : 'border-gray-300'
                  }`} />
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{step.title}</div>
                <div className="text-xs text-muted-foreground">{step.description}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
