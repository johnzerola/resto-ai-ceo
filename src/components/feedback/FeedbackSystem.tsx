import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Bug, 
  Lightbulb,
  Heart,
  Meh,
  Frown,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FeedbackProps {
  className?: string;
  page?: string;
}

type FeedbackType = 'reaction' | 'survey' | 'bug_report' | 'suggestion';
type ReactionType = 'love' | 'like' | 'neutral' | 'dislike';

export function FeedbackSystem({ className, page }: FeedbackProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('reaction');
  const [selectedReaction, setSelectedReaction] = useState<ReactionType | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitFeedback = async () => {
    if (!selectedReaction && !feedbackText.trim()) {
      toast({
        title: "Feedback necessário",
        description: "Por favor, selecione uma reação ou escreva um comentário.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const feedbackData = {
        user_id: user?.id,
        feedback_type: feedbackType,
        content: {
          reaction: selectedReaction,
          text: feedbackText.trim(),
          page: page || window.location.pathname,
          timestamp: new Date().toISOString()
        },
        page_url: window.location.href,
        user_agent: navigator.userAgent
      };

      const { error } = await supabase
        .from('feedback_submissions')
        .insert(feedbackData);

      if (error) throw error;

      toast({
        title: "Obrigado pelo feedback!",
        description: "Sua opinião é muito importante para nós.",
      });

      // Reset form
      setSelectedReaction(null);
      setFeedbackText('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar seu feedback. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickReaction = async (reaction: ReactionType) => {
    setIsSubmitting(true);
    try {
      const feedbackData = {
        user_id: user?.id,
        feedback_type: 'reaction' as FeedbackType,
        content: {
          reaction,
          page: page || window.location.pathname,
          timestamp: new Date().toISOString()
        },
        page_url: window.location.href,
        user_agent: navigator.userAgent
      };

      const { error } = await supabase
        .from('feedback_submissions')
        .insert(feedbackData);

      if (error) throw error;

      toast({
        title: "Obrigado!",
        description: "Sua reação foi registrada.",
      });
    } catch (error) {
      console.error('Error submitting reaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <div className={cn("fixed bottom-6 right-6 z-50", className)}>
        <div className="flex flex-col gap-2">
          {/* Quick reaction buttons */}
          <div className="flex gap-2 mb-2">
            <Button
              size="sm"
              variant="outline"
              className="w-10 h-10 p-0 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-green-50 hover:border-green-200"
              onClick={() => quickReaction('like')}
              disabled={isSubmitting}
            >
              <ThumbsUp className="h-4 w-4 text-green-600" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-10 h-10 p-0 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-red-50 hover:border-red-200"
              onClick={() => quickReaction('dislike')}
              disabled={isSubmitting}
            >
              <ThumbsDown className="h-4 w-4 text-red-600" />
            </Button>
          </div>
          
          {/* Main feedback button */}
          <Button
            onClick={() => setIsOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white shadow-lg"
            size="sm"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Feedback
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      <Card className="w-80 shadow-2xl border-border/50 bg-background/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Sua opinião importa</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Feedback Type Selection */}
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={feedbackType === 'reaction' ? 'default' : 'outline'}
              onClick={() => setFeedbackType('reaction')}
            >
              <Heart className="h-3 w-3 mr-1" />
              Reação
            </Button>
            <Button
              size="sm"
              variant={feedbackType === 'suggestion' ? 'default' : 'outline'}
              onClick={() => setFeedbackType('suggestion')}
            >
              <Lightbulb className="h-3 w-3 mr-1" />
              Sugestão
            </Button>
            <Button
              size="sm"
              variant={feedbackType === 'bug_report' ? 'default' : 'outline'}
              onClick={() => setFeedbackType('bug_report')}
            >
              <Bug className="h-3 w-3 mr-1" />
              Bug
            </Button>
          </div>

          {/* Reaction Selection */}
          {feedbackType === 'reaction' && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Como você avalia esta página?</p>
              <div className="flex justify-between">
                <Button
                  variant={selectedReaction === 'love' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedReaction('love')}
                  className="flex-1 mx-1"
                >
                  <Heart className="h-4 w-4 mr-1 text-red-500" />
                  Amo
                </Button>
                <Button
                  variant={selectedReaction === 'like' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedReaction('like')}
                  className="flex-1 mx-1"
                >
                  <ThumbsUp className="h-4 w-4 mr-1 text-green-500" />
                  Gosto
                </Button>
                <Button
                  variant={selectedReaction === 'neutral' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedReaction('neutral')}
                  className="flex-1 mx-1"
                >
                  <Meh className="h-4 w-4 mr-1 text-yellow-500" />
                  OK
                </Button>
                <Button
                  variant={selectedReaction === 'dislike' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedReaction('dislike')}
                  className="flex-1 mx-1"
                >
                  <Frown className="h-4 w-4 mr-1 text-red-500" />
                  Não gosto
                </Button>
              </div>
            </div>
          )}

          {/* Feedback Text */}
          <div className="space-y-2">
            <Textarea
              placeholder={
                feedbackType === 'suggestion' 
                  ? "Que melhoria você sugere?"
                  : feedbackType === 'bug_report'
                  ? "Descreva o problema encontrado..."
                  : "Deixe um comentário (opcional)..."
              }
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-2">
            <Button
              onClick={submitFeedback}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <MessageSquare className="h-4 w-4 mr-2" />
              )}
              Enviar
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Seu feedback nos ajuda a melhorar o Lucraí
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Quick Feedback Component for specific areas
export function QuickFeedback({ feature, className }: { feature: string; className?: string }) {
  const { user } = useAuth();
  const { toast } = useToast();

  const submitQuickFeedback = async (reaction: 'helpful' | 'not_helpful') => {
    try {
      const feedbackData = {
        user_id: user?.id,
        feedback_type: 'reaction' as FeedbackType,
        content: {
          reaction,
          feature,
          page: window.location.pathname,
          timestamp: new Date().toISOString()
        },
        page_url: window.location.href,
        user_agent: navigator.userAgent
      };

      const { error } = await supabase
        .from('feedback_submissions')
        .insert(feedbackData);

      if (error) throw error;

      toast({
        title: "Obrigado!",
        description: "Seu feedback foi registrado.",
      });
    } catch (error) {
      console.error('Error submitting quick feedback:', error);
    }
  };

  return (
    <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <span>Esta informação foi útil?</span>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => submitQuickFeedback('helpful')}
        className="h-6 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
      >
        <ThumbsUp className="h-3 w-3 mr-1" />
        Sim
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => submitQuickFeedback('not_helpful')}
        className="h-6 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <ThumbsDown className="h-3 w-3 mr-1" />
        Não
      </Button>
    </div>
  );
}