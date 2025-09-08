import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowRightLeft, Plus, X } from "lucide-react";
import { toast } from "sonner";

interface ConversionRule {
  from: string;
  to: string;
  factor: number;
  description?: string;
}

interface UnitConverterProps {
  currentUnit: string;
  conversions: ConversionRule[];
  onConversionsChange: (conversions: ConversionRule[]) => void;
  availableUnits?: string[];
}

export function UnitConverter({ 
  currentUnit, 
  conversions, 
  onConversionsChange,
  availableUnits = ['kg', 'g', 'l', 'ml', 'unidade', 'caixa', 'pacote', 'saco', 'lata', 'garrafa']
}: UnitConverterProps) {
  const [newConversion, setNewConversion] = useState<Partial<ConversionRule>>({});
  const [testValue, setTestValue] = useState<number>(1);
  const [testFrom, setTestFrom] = useState<string>(currentUnit);
  const [testTo, setTestTo] = useState<string>('');
  const [testResult, setTestResult] = useState<number | null>(null);

  useEffect(() => {
    if (testFrom && testTo && testValue) {
      const result = convertValue(testValue, testFrom, testTo);
      setTestResult(result);
    } else {
      setTestResult(null);
    }
  }, [testValue, testFrom, testTo, conversions]);

  const convertValue = (value: number, fromUnit: string, toUnit: string): number | null => {
    if (fromUnit === toUnit) return value;

    // Procurar conversão direta
    const directConversion = conversions.find(
      c => c.from === fromUnit && c.to === toUnit
    );
    if (directConversion) {
      return value * directConversion.factor;
    }

    // Procurar conversão inversa
    const inverseConversion = conversions.find(
      c => c.from === toUnit && c.to === fromUnit
    );
    if (inverseConversion) {
      return value / inverseConversion.factor;
    }

    // Procurar conversão através da unidade base
    const fromToBase = conversions.find(c => c.from === fromUnit && c.to === currentUnit);
    const toFromBase = conversions.find(c => c.from === currentUnit && c.to === toUnit);
    
    if (fromToBase && toFromBase) {
      return value * fromToBase.factor * toFromBase.factor;
    }

    return null;
  };

  const addConversion = () => {
    if (!newConversion.from || !newConversion.to || !newConversion.factor) {
      toast.error('Preencha todos os campos da conversão');
      return;
    }

    if (newConversion.from === newConversion.to) {
      toast.error('Unidades de origem e destino devem ser diferentes');
      return;
    }

    if (newConversion.factor <= 0) {
      toast.error('Fator de conversão deve ser maior que zero');
      return;
    }

    // Verificar se já existe
    const exists = conversions.some(
      c => c.from === newConversion.from && c.to === newConversion.to
    );

    if (exists) {
      toast.error('Esta conversão já existe');
      return;
    }

    const newRule: ConversionRule = {
      from: newConversion.from!,
      to: newConversion.to!,
      factor: newConversion.factor!,
      description: newConversion.description || `${newConversion.from} → ${newConversion.to}`
    };

    onConversionsChange([...conversions, newRule]);
    setNewConversion({});
    toast.success('Conversão adicionada com sucesso!');
  };

  const removeConversion = (index: number) => {
    const updated = conversions.filter((_, i) => i !== index);
    onConversionsChange(updated);
    toast.success('Conversão removida');
  };

  const getAvailableUnits = (exclude?: string) => {
    return availableUnits.filter(unit => unit !== exclude);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5 text-blue-600" />
          Conversões de Unidades
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Conversões Existentes */}
        {conversions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Conversões Configuradas</h4>
            <div className="space-y-2">
              {conversions.map((conversion, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{conversion.from}</Badge>
                    <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
                    <Badge variant="outline">{conversion.to}</Badge>
                    <span className="text-sm text-muted-foreground">
                      1 {conversion.from} = {conversion.factor} {conversion.to}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeConversion(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Adicionar Nova Conversão */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h4 className="text-sm font-medium">Adicionar Nova Conversão</h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-2">
              <Label htmlFor="from-unit">De:</Label>
              <Select
                value={newConversion.from || ''}
                onValueChange={(value) => setNewConversion(prev => ({ ...prev, from: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unidade" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableUnits(newConversion.to).map(unit => (
                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="to-unit">Para:</Label>
              <Select
                value={newConversion.to || ''}
                onValueChange={(value) => setNewConversion(prev => ({ ...prev, to: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unidade" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableUnits(newConversion.from).map(unit => (
                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="factor">Fator:</Label>
              <Input
                id="factor"
                type="number"
                step="0.001"
                placeholder="1.0"
                value={newConversion.factor || ''}
                onChange={(e) => setNewConversion(prev => ({ 
                  ...prev, 
                  factor: parseFloat(e.target.value) || 0 
                }))}
              />
            </div>

            <div className="flex items-end">
              <Button onClick={addConversion} className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Exemplo: 1 caixa = 12 unidades (fator = 12)
          </div>
        </div>

        {/* Teste de Conversão */}
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900">Testar Conversão</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input
              type="number"
              step="0.001"
              placeholder="Valor"
              value={testValue}
              onChange={(e) => setTestValue(parseFloat(e.target.value) || 0)}
            />

            <Select value={testFrom} onValueChange={setTestFrom}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableUnits.map(unit => (
                  <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={testTo} onValueChange={setTestTo}>
              <SelectTrigger>
                <SelectValue placeholder="Para" />
              </SelectTrigger>
              <SelectContent>
                {availableUnits.filter(u => u !== testFrom).map(unit => (
                  <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center justify-center">
              {testResult !== null ? (
                <Badge variant="default" className="text-center">
                  = {testResult.toFixed(3)} {testTo}
                </Badge>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Conversão não disponível
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}