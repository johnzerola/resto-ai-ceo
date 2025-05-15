
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface OnboardingFormProps {
  onComplete: () => void;
}

export function OnboardingForm({ onComplete }: OnboardingFormProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    averageMonthlySales: "",
    fixedExpenses: "",
    variableExpenses: "30", // Default value
    desiredProfitMargin: "50", // Default value
  });

  const businessTypes = [
    "Restaurante Casual",
    "Restaurante Fino",
    "Fast Food",
    "Pizzaria",
    "Cafeteria",
    "Bar",
    "Padaria",
    "Outro"
  ];

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.businessName || !formData.businessType) {
        toast.error("Por favor, preencha todos os campos antes de continuar.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.fixedExpenses || !formData.variableExpenses || !formData.desiredProfitMargin) {
        toast.error("Por favor, preencha todos os campos financeiros.");
        return;
      }
      
      // Save to localStorage
      const savedData = localStorage.getItem("restaurantData") || "{}";
      const existingData = JSON.parse(savedData);
      
      const updatedData = {
        ...existingData,
        ...formData,
      };
      
      localStorage.setItem("restaurantData", JSON.stringify(updatedData));
      
      toast.success("Configuração concluída! Seus dados foram salvos com sucesso.");
      
      // Redirect to dashboard after configuration is complete
      onComplete();
      navigate("/");
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  return (
    <div className="space-y-6">
      {step === 1 ? (
        // Step 1: Business Information
        <>
          <h2 className="text-xl font-semibold mb-4">Informações do Negócio</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Nome do seu restaurante</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => handleChange("businessName", e.target.value)}
                placeholder="Ex: Restaurante Sabor & Arte"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="businessType">Tipo de negócio</Label>
              <Select 
                value={formData.businessType}
                onValueChange={(value) => handleChange("businessType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de negócio" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      ) : (
        // Step 2: Financial Information
        <>
          <h2 className="text-xl font-semibold mb-4">Dados Financeiros</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fixedExpenses">Despesas fixas mensais (R$)</Label>
              <Input
                id="fixedExpenses"
                type="number"
                value={formData.fixedExpenses}
                onChange={(e) => handleChange("fixedExpenses", e.target.value)}
                placeholder="Ex: 10000"
              />
              <p className="text-sm text-muted-foreground">
                Inclua aluguel, salários, contas fixas e outros custos mensais fixos.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="variableExpenses">Despesas variáveis (%)</Label>
              <Input
                id="variableExpenses"
                type="number"
                value={formData.variableExpenses}
                onChange={(e) => handleChange("variableExpenses", e.target.value)}
                placeholder="Ex: 30"
              />
              <p className="text-sm text-muted-foreground">
                Percentual sobre o valor de venda (impostos, comissões, taxas de cartão, etc).
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="desiredProfitMargin">Margem de lucro desejada (%)</Label>
              <Input
                id="desiredProfitMargin"
                type="number"
                value={formData.desiredProfitMargin}
                onChange={(e) => handleChange("desiredProfitMargin", e.target.value)}
                placeholder="Ex: 50"
              />
              <p className="text-sm text-muted-foreground">
                Percentual de lucro desejado após cobrir todos os custos (fixos e variáveis).
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="averageMonthlySales">Média de vendas mensais (R$)</Label>
              <Input
                id="averageMonthlySales"
                type="number"
                value={formData.averageMonthlySales}
                onChange={(e) => handleChange("averageMonthlySales", e.target.value)}
                placeholder="Ex: 30000"
              />
              <p className="text-sm text-muted-foreground">
                Este valor é usado para calcular o impacto dos custos fixos em cada prato.
              </p>
            </div>
          </div>
        </>
      )}
      
      <div className="flex justify-between pt-4">
        {step === 2 && (
          <Button type="button" variant="outline" onClick={handleBack}>
            Voltar
          </Button>
        )}
        <Button 
          onClick={handleNext} 
          className={step === 1 ? "ml-auto" : ""}
        >
          {step === 1 ? "Próximo" : "Concluir"}
        </Button>
      </div>
    </div>
  );
}
