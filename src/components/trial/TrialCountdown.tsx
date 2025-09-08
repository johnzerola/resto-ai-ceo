import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface TrialCountdownProps {
  daysRemaining: number;
  isTrialActive: boolean;
  variant?: 'hero' | 'compact' | 'popup';
}

export function TrialCountdown({ daysRemaining, isTrialActive, variant = 'compact' }: TrialCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    if (!isTrialActive || daysRemaining <= 0) return;

    const interval = setInterval(() => {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      
      const diff = endOfDay.getTime() - now.getTime();
      
      if (diff > 0) {
        setTimeLeft({
          hours: Math.floor(diff / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isTrialActive, daysRemaining]);

  if (!isTrialActive || daysRemaining <= 0) return null;

  const isUrgent = daysRemaining <= 2;
  const isCritical = daysRemaining <= 1;

  if (variant === 'hero') {
    return (
      <div className={`bg-gradient-to-r ${isCritical ? 'from-red-500 to-red-600' : isUrgent ? 'from-orange-500 to-red-500' : 'from-blue-500 to-purple-600'} text-white rounded-xl p-6 shadow-2xl animate-pulse`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-white/20 rounded-full p-2">
            <Clock className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold">
            {isCritical ? '⚠️ TRIAL EXPIRA HOJE!' : `${daysRemaining} ${daysRemaining === 1 ? 'DIA' : 'DIAS'} RESTANTES`}
          </h3>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
            <div className="text-sm opacity-80">Horas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
            <div className="text-sm opacity-80">Min</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
            <div className="text-sm opacity-80">Seg</div>
          </div>
        </div>

        <Link to="/assinatura">
          <Button 
            size="lg" 
            className="w-full bg-white text-gray-900 hover:bg-gray-100 font-bold group"
          >
            <ArrowRight className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            ATIVAR PLANO AGORA - 50% OFF
          </Button>
        </Link>
      </div>
    );
  }

  if (variant === 'popup') {
    return (
      <div className={`bg-gradient-to-br ${isCritical ? 'from-red-50 to-red-100 border-red-200' : 'from-orange-50 to-orange-100 border-orange-200'} border-2 rounded-2xl p-6 shadow-xl`}>
        <div className="text-center space-y-4">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${isCritical ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'} font-semibold`}>
            <AlertTriangle className="h-4 w-4" />
            {isCritical ? 'TRIAL EXPIRA HOJE!' : `${daysRemaining} ${daysRemaining === 1 ? 'DIA' : 'DIAS'} RESTANTES`}
          </div>
          
          <h3 className="text-xl font-bold text-gray-900">
            Não perca acesso aos seus dados!
          </h3>
          
          <p className="text-gray-600">
            Seu trial expira em{' '}
            <span className="font-bold text-red-600">
              {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
            </span>
          </p>

          <div className="flex gap-3">
            <Link to="/assinatura" className="flex-1">
              <Button size="lg" className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                Ativar Agora - 50% OFF
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Compact variant
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium animate-pulse ${
      isCritical 
        ? 'bg-red-100 text-red-700 border border-red-200' 
        : isUrgent 
          ? 'bg-orange-100 text-orange-700 border border-orange-200'
          : 'bg-blue-100 text-blue-700 border border-blue-200'
    }`}>
      <Clock className="h-4 w-4" />
      <span>
        Trial: {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'} • {timeLeft.hours}h {timeLeft.minutes}m
      </span>
    </div>
  );
}