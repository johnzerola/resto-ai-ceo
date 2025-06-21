
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface MobileFriendlyInputProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: 'text' | 'number' | 'email';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  helpText?: string;
}

export function MobileFriendlyInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  className,
  helpText
}: MobileFriendlyInputProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label 
        className="text-sm font-medium text-gray-700 dark:text-gray-200"
        htmlFor={label.toLowerCase().replace(/\s+/g, '-')}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id={label.toLowerCase().replace(/\s+/g, '-')}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          // Mobile-friendly sizing
          "h-12 text-base",
          // Better touch targets
          "min-h-[48px]",
          // Improved focus states
          "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          // Dark mode support
          "dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        )}
        // Mobile optimizations
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />
      {helpText && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {helpText}
        </p>
      )}
    </div>
  );
}
