
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

export function OnboardingForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    averageMonthlySales: "",
    fixedExpenses: "",
    variableExpenses: "",
    desiredProfitMargin: ""
  });

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save form data to localStorage or context for use in the app
    localStorage.setItem("restaurantData", JSON.stringify(formData));
    // Navigate to dashboard
    navigate("/");
  };

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

  return (
    <div className="max-w-md w-full mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Bem-vindo ao Resto AI CEO</h2>
        <p className="text-gray-600 mt-2">
          {step === 1
            ? "Vamos começar configurando os dados do seu negócio."
            : "Agora, vamos configurar os dados financeiros."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {step === 1 ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="businessName">Nome do negócio</Label>
              <Input
                id="businessName"
                placeholder="Ex: Restaurante Bella Italia"
                value={formData.businessName}
                onChange={(e) => updateFormData("businessName", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessType">Tipo de negócio</Label>
              <Select
                value={formData.businessType}
                onValueChange={(value) => updateFormData("businessType", value)}
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

            <div className="space-y-2">
              <Label htmlFor="averageMonthlySales">Média de vendas mensais (R$)</Label>
              <Input
                id="averageMonthlySales"
                type="number"
                placeholder="Ex: 50000"
                value={formData.averageMonthlySales}
                onChange={(e) => updateFormData("averageMonthlySales", e.target.value)}
                required
              />
            </div>

            <Button type="button" className="w-full" onClick={handleNext}>
              Próximo
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="fixedExpenses">Despesas fixas mensais (R$)</Label>
              <Input
                id="fixedExpenses"
                type="number"
                placeholder="Ex: 15000"
                value={formData.fixedExpenses}
                onChange={(e) => updateFormData("fixedExpenses", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="variableExpenses">Despesas variáveis (%)</Label>
              <Input
                id="variableExpenses"
                type="number"
                placeholder="Ex: 30"
                value={formData.variableExpenses}
                onChange={(e) => updateFormData("variableExpenses", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desiredProfitMargin">Margem de lucro desejada (%)</Label>
              <Input
                id="desiredProfitMargin"
                type="number"
                placeholder="Ex: 20"
                value={formData.desiredProfitMargin}
                onChange={(e) => updateFormData("desiredProfitMargin", e.target.value)}
                required
              />
            </div>

            <div className="flex space-x-3">
              <Button type="button" variant="outline" className="w-full" onClick={() => setStep(1)}>
                Voltar
              </Button>
              <Button type="submit" className="w-full">
                Concluir
              </Button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
