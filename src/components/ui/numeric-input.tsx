
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface NumericInputProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  helpText?: string;
  id?: string;
}

export function NumericInput({
  label,
  value,
  onChange,
  placeholder,
  min,
  max,
  step = 0.01,
  required = false,
  disabled = false,
  className,
  helpText,
  id
}: NumericInputProps) {
  const [displayValue, setDisplayValue] = React.useState(value.toString());
  const [isFocused, setIsFocused] = React.useState(false);

  React.useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value.toString());
    }
  }, [value, isFocused]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    // Se o valor for 0, limpar o campo para facilitar a digitação
    if (value === 0) {
      setDisplayValue('');
      e.target.select();
    } else {
      e.target.select();
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Se o campo estiver vazio, definir como 0
    if (displayValue === '' || isNaN(Number(displayValue))) {
      const newValue = 0;
      setDisplayValue(newValue.toString());
      onChange(newValue);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);

    // Permitir valor vazio durante a digitação
    if (inputValue === '') {
      return;
    }

    const numericValue = Number(inputValue);
    if (!isNaN(numericValue)) {
      // Aplicar limites se definidos
      let finalValue = numericValue;
      if (min !== undefined && finalValue < min) {
        finalValue = min;
      }
      if (max !== undefined && finalValue > max) {
        finalValue = max;
      }
      onChange(finalValue);
    }
  };

  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={inputId} className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <Input
        id={inputId}
        type="number"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={cn(
          "transition-all duration-200",
          "focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        )}
      />
      {helpText && (
        <p className="text-xs text-muted-foreground">
          {helpText}
        </p>
      )}
    </div>
  );
}
