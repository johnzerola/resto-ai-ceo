
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { lgpdService } from "@/services/LGPDService";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, Cookie, BarChart3, Mail } from "lucide-react";

export function ConsentBanner() {
  const { user } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consents, setConsents] = useState({
    essential: true, // Sempre verdadeiro - não pode ser desabilitado
    analytics: false,
    marketing: false,
    cookies: false
  });

  useEffect(() => {
    // Verificar se o usuário já deu consentimento
    const hasGivenConsent = localStorage.getItem('lgpd_consent_given');
    if (!hasGivenConsent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = async () => {
    const newConsents = {
      essential: true,
      analytics: true,
      marketing: true,
      cookies: true
    };
    
    await saveConsents(newConsents);
  };

  const handleAcceptSelected = async () => {
    await saveConsents(consents);
  };

  const saveConsents = async (consentChoices: typeof consents) => {
    if (user) {
      try {
        // Registrar cada tipo de consentimento
        await lgpdService.recordConsent(user.id, 'data_processing', true);
        await lgpdService.recordConsent(user.id, 'analytics', consentChoices.analytics);
        await lgpdService.recordConsent(user.id, 'marketing', consentChoices.marketing);
        await lgpdService.recordConsent(user.id, 'cookies', consentChoices.cookies);
      } catch (error) {
        console.error("Erro ao salvar consentimentos:", error);
      }
    }

    // Salvar no localStorage
    localStorage.setItem('lgpd_consent_given', 'true');
    localStorage.setItem('consent_choices', JSON.stringify(consentChoices));
    
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t-2 border-blue-500 shadow-lg">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Shield className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Proteção de Dados - LGPD</h3>
              <p className="text-sm text-gray-600 mb-4">
                Utilizamos cookies e coletamos dados para melhorar sua experiência, realizar análises e personalizar conteúdo. 
                Seus dados são protegidos conforme a Lei Geral de Proteção de Dados (LGPD).
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <Button onClick={handleAcceptAll} size="sm">
                  Aceitar Todos
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowDetails(true)}>
                  Personalizar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowBanner(false)}>
                  Rejeitar Opcionais
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configurações de Privacidade</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Shield className="h-5 w-5 text-green-600 mt-1" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Cookies Essenciais</h4>
                  <Checkbox checked={true} disabled />
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Necessários para o funcionamento básico do site. Não podem ser desabilitados.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-600 mt-1" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Cookies de Análise</h4>
                  <Checkbox 
                    checked={consents.analytics} 
                    onCheckedChange={(checked) => 
                      setConsents(prev => ({ ...prev, analytics: !!checked }))
                    }
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Nos ajudam a entender como você usa o site para melhorar a experiência.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Mail className="h-5 w-5 text-purple-600 mt-1" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Marketing</h4>
                  <Checkbox 
                    checked={consents.marketing} 
                    onCheckedChange={(checked) => 
                      setConsents(prev => ({ ...prev, marketing: !!checked }))
                    }
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Para envio de ofertas personalizadas e comunicações promocionais.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Cookie className="h-5 w-5 text-orange-600 mt-1" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Cookies de Terceiros</h4>
                  <Checkbox 
                    checked={consents.cookies} 
                    onCheckedChange={(checked) => 
                      setConsents(prev => ({ ...prev, cookies: !!checked }))
                    }
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Cookies de parceiros para funcionalidades sociais e publicidade.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button onClick={handleAcceptSelected} className="flex-1">
              Salvar Preferências
            </Button>
            <Button variant="outline" onClick={() => setShowDetails(false)}>
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
