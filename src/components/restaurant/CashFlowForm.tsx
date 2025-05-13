
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, AlertCircle, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { CashFlowEntry } from "./CashFlowOverview";

interface CashFlowFormProps {
  entryId: string | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export function CashFlowForm({ entryId, onCancel, onSuccess }: CashFlowFormProps) {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<CashFlowEntry>();
  const [isIncome, setIsIncome] = useState(true);
  
  // Watch the type value to update form fields
  const typeValue = watch("type");
  
  useEffect(() => {
    setIsIncome(typeValue === "income");
  }, [typeValue]);
  
  // Categories based on type
  const incomeCategories = [
    "Vendas", 
    "Delivery", 
    "Eventos", 
    "Aplicativos", 
    "Outras receitas"
  ];
  
  const expenseCategories = [
    "Fornecedores", 
    "Folha de pagamento", 
    "Aluguel", 
    "Utilidades", 
    "Marketing", 
    "Manutenção", 
    "Impostos", 
    "Outras despesas"
  ];
  
  // Payment methods
  const paymentMethods = [
    "Dinheiro", 
    "Cartão de crédito", 
    "Cartão de débito", 
    "Transferência", 
    "PIX", 
    "App", 
    "Cheque", 
    "Débito automático"
  ];
  
  // Status options
  const statusOptions = [
    { value: "completed", label: "Concluído" },
    { value: "pending", label: "Pendente" },
    { value: "canceled", label: "Cancelado" }
  ];

  // Load entry data if in edit mode
  useEffect(() => {
    if (entryId) {
      const loadEntry = async () => {
        try {
          const savedCashFlow = localStorage.getItem("cashFlow");
          if (savedCashFlow) {
            const entries = JSON.parse(savedCashFlow);
            const entry = entries.find((e: CashFlowEntry) => e.id === entryId);
            
            if (entry) {
              // Pre-fill form with entry data
              Object.keys(entry).forEach((key) => {
                setValue(key as keyof CashFlowEntry, entry[key as keyof CashFlowEntry]);
              });
              
              // Format date for input field
              if (entry.date) {
                const date = new Date(entry.date);
                const formattedDate = date.toISOString().split('T')[0];
                setValue("date", formattedDate);
              }
              
              setIsIncome(entry.type === "income");
            }
          }
        } catch (error) {
          console.error("Error loading cash flow entry:", error);
          toast.error("Erro ao carregar dados da transação");
        }
      };
      
      loadEntry();
    } else {
      // Set default values for new entry
      setValue("date", new Date().toISOString().split('T')[0]);
      setValue("type", "income");
      setValue("status", "completed");
    }
  }, [entryId, setValue]);

  // Save cash flow entry
  const onSubmit = (data: CashFlowEntry) => {
    const entryToSave: CashFlowEntry = {
      ...data,
      id: entryId || Date.now().toString(),
      date: new Date(data.date).toISOString(),
      amount: Number(data.amount)
    };
    
    try {
      // Save to localStorage
      const savedCashFlow = localStorage.getItem("cashFlow") || "[]";
      const entries = JSON.parse(savedCashFlow);
      
      if (entryId) {
        // Update existing entry
        const index = entries.findIndex((e: CashFlowEntry) => e.id === entryId);
        if (index >= 0) {
          entries[index] = entryToSave;
        }
      } else {
        // Add new entry
        entries.push(entryToSave);
      }
      
      localStorage.setItem("cashFlow", JSON.stringify(entries));
      
      toast.success(entryId ? "Transação atualizada com sucesso!" : "Nova transação adicionada com sucesso!");
      onSuccess();
    } catch (error) {
      console.error("Error saving cash flow entry:", error);
      toast.error("Erro ao salvar transação");
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4 flex items-center">
          <Button variant="ghost" onClick={onCancel} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h2 className="text-xl font-semibold">
            {entryId ? "Editar Transação" : "Nova Transação"}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Type Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div 
              className={`p-4 border rounded-md cursor-pointer flex items-center ${isIncome ? "bg-green-50 border-green-200" : "bg-gray-50"}`}
              onClick={() => {
                setValue("type", "income");
                setIsIncome(true);
              }}
            >
              <div className={`h-10 w-10 rounded-full ${isIncome ? "bg-green-100" : "bg-gray-100"} flex items-center justify-center mr-4`}>
                <TrendingUp className={`h-6 w-6 ${isIncome ? "text-green-600" : "text-gray-400"}`} />
              </div>
              <div>
                <p className="font-medium">Entrada</p>
                <p className="text-sm text-muted-foreground">Receitas, vendas, etc.</p>
              </div>
            </div>
            
            <div 
              className={`p-4 border rounded-md cursor-pointer flex items-center ${!isIncome ? "bg-red-50 border-red-200" : "bg-gray-50"}`}
              onClick={() => {
                setValue("type", "expense");
                setIsIncome(false);
              }}
            >
              <div className={`h-10 w-10 rounded-full ${!isIncome ? "bg-red-100" : "bg-gray-100"} flex items-center justify-center mr-4`}>
                <TrendingDown className={`h-6 w-6 ${!isIncome ? "text-red-600" : "text-gray-400"}`} />
              </div>
              <div>
                <p className="font-medium">Saída</p>
                <p className="text-sm text-muted-foreground">Despesas, pagamentos, etc.</p>
              </div>
            </div>
            <input type="hidden" {...register("type")} />
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                placeholder="Ex: Vendas do dia"
                {...register("description", { required: "Descrição é obrigatória" })}
              />
              {errors.description && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" /> 
                  {errors.description.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                {...register("date", { required: "Data é obrigatória" })}
              />
              {errors.date && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" /> 
                  {errors.date.message}
                </p>
              )}
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <div className="flex">
                <span className="inline-flex h-10 items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                </span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  className="rounded-l-none"
                  placeholder="0.00"
                  {...register("amount", { 
                    required: "Valor é obrigatório",
                    min: { value: 0.01, message: "Valor deve ser maior que zero" }
                  })}
                />
              </div>
              {errors.amount && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" /> 
                  {errors.amount.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select 
                onValueChange={(value) => setValue("category", value)}
                defaultValue={watch("category")}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {(isIncome ? incomeCategories : expenseCategories).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" /> 
                  {errors.category.message}
                </p>
              )}
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Método de Pagamento</Label>
              <Select 
                onValueChange={(value) => setValue("paymentMethod", value)}
                defaultValue={watch("paymentMethod")}
              >
                <SelectTrigger id="paymentMethod">
                  <SelectValue placeholder="Selecione um método" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                onValueChange={(value: "completed" | "pending" | "canceled") => setValue("status", value)}
                defaultValue={watch("status")}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reference">Referência (opcional)</Label>
            <Input
              id="reference"
              placeholder="Ex: Nota Fiscal 12345"
              {...register("reference")}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <textarea
              id="notes"
              className="w-full min-h-[80px] p-2 rounded-md border border-input bg-background text-sm"
              placeholder="Informações adicionais sobre a transação"
              {...register("notes")}
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" className={isIncome ? "bg-green-600 hover:bg-green-700" : ""}>
              {entryId ? "Atualizar" : "Adicionar"} {isIncome ? "Entrada" : "Saída"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

import { TrendingUp, TrendingDown } from "lucide-react";
