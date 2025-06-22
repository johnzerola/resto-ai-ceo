
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, Brain } from 'lucide-react';
import { technicalQuestions } from '@/data/technicalQuestions';
import { TechnicalQuestionItem } from './TechnicalQuestionItem';
import { TechnicalAuditSummary } from './TechnicalAuditSummary';

export function TechnicalQuestionsAudit() {
  const [showDetails, setShowDetails] = useState(false);

  const excellentCount = technicalQuestions.filter(q => q.status === 'excellent').length;
  const goodCount = technicalQuestions.filter(q => q.status === 'good').length;
  const attentionCount = technicalQuestions.filter(q => q.status === 'needs_attention').length;

  const overallScore = (excellentCount * 100 + goodCount * 85 + attentionCount * 70) / technicalQuestions.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Análise Técnica: 10 Perguntas Essenciais
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Ocultar Detalhes' : 'Ver Detalhes Técnicos'}
          </Button>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>{excellentCount} Excelente</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <span>{goodCount} Muito Bom</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span>{attentionCount} Atenção</span>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-center">
            Nota Técnica Final: {Math.round(overallScore)}/100
          </div>
          <div className="text-sm text-center text-muted-foreground">
            {overallScore >= 95 ? 'Sistema Excepcional - Pronto para Produção' :
             overallScore >= 85 ? 'Sistema Robusto - Lançamento Recomendado' :
             'Sistema Sólido - Pequenos Ajustes Recomendados'}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {technicalQuestions.map((question, index) => (
          <TechnicalQuestionItem
            key={index}
            question={question}
            showDetails={showDetails}
          />
        ))}
        
        <TechnicalAuditSummary overallScore={overallScore} />
      </CardContent>
    </Card>
  );
}
