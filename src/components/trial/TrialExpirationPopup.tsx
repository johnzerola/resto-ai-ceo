import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrialCountdown } from './TrialCountdown';
import { Link } from 'react-router-dom';
import { 
  Crown, 
  CheckCircle, 
  X, 
  Zap,
  TrendingUp,
  Shield,
  Clock
} from 'lucide-react';

interface TrialExpirationPopupProps {
  daysRemaining: number;
  isTrialActive: boolean;
  onClose: () => void;
}

export function TrialExpirationPopup({ daysRemaining, isTrialActive, onClose }: TrialExpirationPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Mostrar popup quando restam 2 dias ou menos E ainda não foi mostrado
    const shouldShow = isTrialActive && daysRemaining <= 2 && !hasShown;
    
    if (shouldShow) {
      // Delay de 3 segundos para não ser muito agressivo
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasShown(true);
        localStorage.setItem('trial-popup-shown', 'true');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [daysRemaining, isTrialActive, hasShown]);

  // Verificar se já foi mostrado na sessão
  useEffect(() => {
    const shown = localStorage.getItem('trial-popup-shown');
    if (shown) {
      setHasShown(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  const features = [
    'CMV e DRE automáticos',
    'Precificação inteligente', 
    'Controle de estoque',
    'Relatórios em tempo real',
    'Suporte prioritário',
    'Sem limite de produtos'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg border-0 p-0 overflow-hidden">
        <div className="relative">
          {/* Header com gradiente */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 text-center relative">
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="space-y-2">
              <Badge className="bg-white/20 text-white border-white/30">
                <Clock className="mr-1 h-4 w-4" />
                OFERTA LIMITADA
              </Badge>
              
              <h2 className="text-2xl font-bold">
                {daysRemaining <= 1 ? '⚠️ Último Dia!' : '⏰ Tempo Esgotando!'}
              </h2>
              
              <p className="text-white/90">
                Seu trial expira em breve. Não perca seus dados!
              </p>
            </div>
          </div>

          {/* Countdown */}
          <div className="p-6 bg-gradient-to-b from-gray-50 to-white">
            <TrialCountdown 
              daysRemaining={daysRemaining} 
              isTrialActive={isTrialActive} 
              variant="popup"
            />
          </div>

          {/* Features */}
          <div className="px-6 pb-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="h-5 w-5 text-yellow-600" />
                <h3 className="font-bold text-green-800">Ative agora e ganhe:</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Special offer */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 mb-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span className="font-bold text-blue-800">OFERTA ESPECIAL</span>
              </div>
              <div className="text-2xl font-bold text-blue-900 mb-1">
                50% OFF
              </div>
              <div className="text-sm text-blue-700">
                Apenas para quem está no trial!
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3">
              <Link to="/assinatura" className="block">
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-lg font-bold animate-pulse"
                >
                  <TrendingUp className="mr-2 h-5 w-5" />
                  ATIVAR PLANO AGORA - 50% OFF
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                onClick={handleClose}
                className="w-full border-gray-300 text-gray-600 hover:text-gray-800"
              >
                Lembrar depois
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                <span>Pagamento seguro</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                <span>Cancele a qualquer momento</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}