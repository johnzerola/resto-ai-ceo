
import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { EnhancedSecurityService } from '@/services/EnhancedSecurityService';

interface PasswordStrengthValidatorProps {
  password: string;
  onValidationChange?: (isValid: boolean) => void;
  showDetails?: boolean;
}

export function PasswordStrengthValidator({ 
  password, 
  onValidationChange, 
  showDetails = true 
}: PasswordStrengthValidatorProps) {
  const [validation, setValidation] = useState<{
    score: number;
    max_score: number;
    is_strong: boolean;
    issues: string[];
  } | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    const validatePassword = async () => {
      if (!password) {
        setValidation(null);
        onValidationChange?.(false);
        return;
      }

      setIsValidating(true);
      const result = await EnhancedSecurityService.validatePasswordStrength(password);
      
      if (result) {
        setValidation(result);
        onValidationChange?.(result.is_strong);
      }
      
      setIsValidating(false);
    };

    const debounceTimeout = setTimeout(validatePassword, 300);
    return () => clearTimeout(debounceTimeout);
  }, [password, onValidationChange]);

  if (!password || !validation) {
    return null;
  }

  const getStrengthColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStrengthText = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'Muito forte';
    if (percentage >= 60) return 'Forte';
    if (percentage >= 40) return 'Média';
    return 'Fraca';
  };

  const progressValue = (validation.score / validation.max_score) * 100;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Força da senha:</span>
          <span className={`font-medium ${validation.is_strong ? 'text-green-600' : 'text-red-600'}`}>
            {getStrengthText(validation.score, validation.max_score)}
          </span>
        </div>
        
        <Progress 
          value={progressValue} 
          className="h-2"
        />
      </div>

      {showDetails && validation.issues.length > 0 && (
        <Alert variant={validation.is_strong ? "default" : "destructive"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {validation.issues.map((issue, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <XCircle className="h-3 w-3" />
                  {issue}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {validation.is_strong && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Senha segura! Atende a todos os critérios de segurança.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
