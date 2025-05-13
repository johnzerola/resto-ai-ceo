
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, PlusCircle, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Promotion, PromotionProduct } from "./PromotionsList";

interface PromotionFormProps {
  promotionId: string | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export function PromotionForm({ promotionId, onCancel, onSuccess }: PromotionFormProps) {
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<Promotion>({
    defaultValues: {
      products: [{ name: "", quantity: 1, price: 0 }],
      daysOfWeek: [],
      isActive: true,
      currentRedemptions: 0
    }
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "products"
  });
  
  // Watch values for calculations
  const products = watch("products");
  const [selectedDays, setSelectedDays] = useState<Record<string, boolean>>({
    sun: false, mon: false, tue: false, wed: false, thu: false, fri: false, sat: false
  });
  
  // Promotion types
  const promotionTypes = [
    { value: "rodizio", label: "Rodízio" },
    { value: "combo", label: "Combo" },
    { value: "discount", label: "Desconto" },
    { value: "special", label: "Especial" }
  ];
  
  // Days of week
  const daysOfWeek = [
    { value: "sun", label: "Domingo" },
    { value: "mon", label: "Segunda" },
    { value: "tue", label: "Terça" },
    { value: "wed", label: "Quarta" },
    { value: "thu", label: "Quinta" },
    { value: "fri", label: "Sexta" },
    { value: "sat", label: "Sábado" }
  ];

  // Calculate original price based on products
  useEffect(() => {
    if (products && products.length > 0) {
      const originalPrice = products.reduce((total, product) => 
        total + (Number(product.price) * Number(product.quantity)), 0);
      setValue("originalPrice", Number(originalPrice.toFixed(2)));
    }
  }, [products, setValue]);

  // Handle days of week changes
  const handleDayChange = (day: string, checked: boolean) => {
    setSelectedDays(prev => ({ ...prev, [day]: checked }));
    
    // Update form value
    const updatedDays = Object.entries({ ...selectedDays, [day]: checked })
      .filter(([_, isSelected]) => isSelected)
      .map(([dayValue]) => dayValue);
    
    setValue("daysOfWeek", updatedDays);
  };

  // Load promotion data if in edit mode
  useEffect(() => {
    if (promotionId) {
      const loadPromotion = async () => {
        try {
          const savedPromotions = localStorage.getItem("promotions");
          if (savedPromotions) {
            const promotions = JSON.parse(savedPromotions);
            const promotion = promotions.find((p: Promotion) => p.id === promotionId);
            
            if (promotion) {
              // Format dates for input fields
              if (promotion.startDate) {
                const startDate = new Date(promotion.startDate);
                promotion.startDate = startDate.toISOString().split('T')[0];
              }
              
              if (promotion.endDate) {
                const endDate = new Date(promotion.endDate);
                promotion.endDate = endDate.toISOString().split('T')[0];
              }
              
              // Set form values
              Object.keys(promotion).forEach((key) => {
                if (key !== "products" && key !== "daysOfWeek") {
                  setValue(key as keyof Promotion, promotion[key as keyof Promotion]);
                }
              });
              
              // Set selected days
              if (promotion.daysOfWeek && promotion.daysOfWeek.length > 0) {
                const daysObj = { sun: false, mon: false, tue: false, wed: false, thu: false, fri: false, sat: false };
                promotion.daysOfWeek.forEach(day => {
                  daysObj[day as keyof typeof daysObj] = true;
                });
                setSelectedDays(daysObj);
              }
              
              // Set products
              if (promotion.products && promotion.products.length > 0) {
                setValue("products", promotion.products);
              }
            }
          }
        } catch (error) {
          console.error("Error loading promotion:", error);
          toast.error("Erro ao carregar dados da promoção");
        }
      };
      
      loadPromotion();
    } else {
      // Set default values for new promotion
      setValue("startDate", new Date().toISOString().split('T')[0]);
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setValue("endDate", nextMonth.toISOString().split('T')[0]);
      setValue("isActive", true);
    }
  }, [promotionId, setValue]);

  // Save promotion
  const onSubmit = (data: Promotion) => {
    const promotionToSave: Promotion = {
      ...data,
      id: promotionId || Date.now().toString(),
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString()
    };
    
    try {
      // Save to localStorage
      const savedPromotions = localStorage.getItem("promotions") || "[]";
      const promotions = JSON.parse(savedPromotions);
      
      if (promotionId) {
        // Update existing promotion
        const index = promotions.findIndex((p: Promotion) => p.id === promotionId);
        if (index >= 0) {
          promotions[index] = promotionToSave;
        }
      } else {
        // Add new promotion
        promotions.push(promotionToSave);
      }
      
      localStorage.setItem("promotions", JSON.stringify(promotions));
      
      toast.success(promotionId ? "Promoção atualizada com sucesso!" : "Nova promoção adicionada com sucesso!");
      onSuccess();
    } catch (error) {
      console.error("Error saving promotion:", error);
      toast.error("Erro ao salvar promoção");
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
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
            {promotionId ? "Editar Promoção" : "Nova Promoção"}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Promoção</Label>
              <Input
                id="name"
                placeholder="Ex: Rodízio Premium"
                {...register("name", { required: "Nome é obrigatório" })}
              />
              {errors.name && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" /> 
                  {errors.name.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Promoção</Label>
              <Select 
                onValueChange={(value: "rodizio" | "combo" | "discount" | "special") => setValue("type", value)}
                defaultValue={watch("type")}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Selecione um tipo" />
                </SelectTrigger>
                <SelectContent>
                  {promotionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" /> 
                  {errors.type.message}
                </p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <textarea
              id="description"
              className="w-full min-h-[80px] p-2 rounded-md border border-input bg-background text-sm"
              placeholder="Descreva os detalhes da promoção"
              {...register("description", { required: "Descrição é obrigatória" })}
            ></textarea>
            {errors.description && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" /> 
                {errors.description.message}
              </p>
            )}
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início</Label>
              <Input
                id="startDate"
                type="date"
                {...register("startDate", { required: "Data de início é obrigatória" })}
              />
              {errors.startDate && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" /> 
                  {errors.startDate.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">Data de Término</Label>
              <Input
                id="endDate"
                type="date"
                {...register("endDate", { required: "Data de término é obrigatória" })}
              />
              {errors.endDate && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" /> 
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Dias da Semana</Label>
            <div className="grid grid-cols-7 gap-2">
              {daysOfWeek.map((day) => (
                <div key={day.value} className="flex flex-col items-center space-y-1">
                  <div className={`h-9 w-9 rounded-md flex items-center justify-center border 
                    ${selectedDays[day.value] ? 'bg-primary text-white border-primary' : 'border-gray-200'}`}>
                    {day.label.charAt(0)}
                  </div>
                  <Checkbox
                    id={`day-${day.value}`}
                    checked={selectedDays[day.value]}
                    onCheckedChange={(checked) => handleDayChange(day.value, checked === true)}
                  />
                  <input 
                    type="hidden" 
                    {...register("daysOfWeek")} 
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startTime">Horário de Início (opcional)</Label>
              <Input
                id="startTime"
                type="time"
                {...register("startTime")}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endTime">Horário de Término (opcional)</Label>
              <Input
                id="endTime"
                type="time"
                {...register("endTime")}
              />
            </div>
          </div>
          
          {/* Products Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Produtos Inclusos</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: "", quantity: 1, price: 0 })}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Adicionar Produto
              </Button>
            </div>
            
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-6 space-y-2">
                  <Label htmlFor={`products.${index}.name`}>Item</Label>
                  <Input
                    id={`products.${index}.name`}
                    placeholder="Nome do item"
                    {...register(`products.${index}.name` as const, { required: "Nome do item é obrigatório" })}
                  />
                </div>
                
                <div className="col-span-2 space-y-2">
                  <Label htmlFor={`products.${index}.quantity`}>Qtd</Label>
                  <Input
                    id={`products.${index}.quantity`}
                    type="number"
                    min="1"
                    {...register(`products.${index}.quantity` as const, {
                      valueAsNumber: true,
                      required: "Quantidade é obrigatória",
                      min: { value: 1, message: "Mínimo 1" }
                    })}
                  />
                </div>
                
                <div className="col-span-3 space-y-2">
                  <Label htmlFor={`products.${index}.price`}>Preço (R$)</Label>
                  <Input
                    id={`products.${index}.price`}
                    type="number"
                    step="0.01"
                    min="0"
                    {...register(`products.${index}.price` as const, {
                      valueAsNumber: true,
                      required: "Preço é obrigatório",
                      min: { value: 0, message: "Preço inválido" }
                    })}
                  />
                </div>
                
                <div className="col-span-1">
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="h-10 w-10 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Pricing Section */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="originalPrice">Preço Original (R$)</Label>
              <div className="flex h-10 items-center rounded-md border bg-gray-50 px-3">
                <span className="text-muted-foreground">R$</span>
                <span className="ml-1 font-medium">
                  {watch("originalPrice") ? watch("originalPrice").toFixed(2) : "0.00"}
                </span>
                <input type="hidden" {...register("originalPrice")} />
              </div>
              <p className="text-xs text-muted-foreground">
                Calculado automaticamente baseado nos produtos
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="promotionalPrice">Preço Promocional (R$)</Label>
              <div className="flex">
                <span className="inline-flex h-10 items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-muted-foreground">
                  R$
                </span>
                <Input
                  id="promotionalPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  className="rounded-l-none"
                  placeholder="0.00"
                  {...register("promotionalPrice", { 
                    valueAsNumber: true,
                    required: "Preço promocional é obrigatório"
                  })}
                />
              </div>
              {watch("originalPrice") && watch("promotionalPrice") && (
                <p className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded inline-block">
                  Desconto de {Math.round(((watch("originalPrice") - watch("promotionalPrice")) / watch("originalPrice")) * 100)}%
                </p>
              )}
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="conditions">Condições (opcional)</Label>
              <Input
                id="conditions"
                placeholder="Ex: Exceto feriados. Bebidas não inclusas."
                {...register("conditions")}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxRedemptions">Limite de Utilização (0 = ilimitado)</Label>
              <Input
                id="maxRedemptions"
                type="number"
                min="0"
                placeholder="Ex: 100"
                {...register("maxRedemptions", { valueAsNumber: true })}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={watch("isActive")}
              onCheckedChange={(checked) => setValue("isActive", checked)}
            />
            <Label htmlFor="isActive">Promoção Ativa</Label>
            <input type="hidden" {...register("isActive")} />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              {promotionId ? "Atualizar Promoção" : "Criar Promoção"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
