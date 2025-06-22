
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { TechnicalQuestion } from '@/data/technicalQuestions';

interface TechnicalQuestionItemProps {
  question: TechnicalQuestion;
  showDetails: boolean;
}

export function TechnicalQuestionItem({ question, showDetails }: TechnicalQuestionItemProps) {
  const getStatusIcon = (status: TechnicalQuestion['status']) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'good': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'needs_attention': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusBadge = (status: TechnicalQuestion['status']) => {
    switch (status) {
      case 'excellent': return <Badge className="bg-green-100 text-green-800">Excelente</Badge>;
      case 'good': return <Badge className="bg-blue-100 text-blue-800">Muito Bom</Badge>;
      case 'needs_attention': return <Badge variant="secondary">Atenção</Badge>;
      default: return <Badge variant="destructive">Crítico</Badge>;
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {getStatusIcon(question.status)}
            <h4 className="font-medium text-sm">{question.question}</h4>
          </div>
          <p className="text-sm text-green-700 font-medium">{question.answer}</p>
        </div>
        {getStatusBadge(question.status)}
      </div>
      
      {showDetails && (
        <div className="space-y-2 border-t pt-3">
          <div>
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Detalhamento Técnico
            </h5>
            <p className="text-sm">{question.technicalDetails}</p>
          </div>
          
          {question.recommendation && (
            <div>
              <h5 className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
                Recomendação
              </h5>
              <p className="text-sm text-blue-700">{question.recommendation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
