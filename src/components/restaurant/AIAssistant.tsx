
import { Button } from "@/components/ui/button";
import { MessageSquare, X } from "lucide-react";
import { useState } from "react";
import { UnifiedAIAssistant } from "./UnifiedAIAssistant";
import { useIsMobile } from "@/hooks/use-mobile";

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`${isMobile ? 'fixed bottom-4 right-4 z-40 w-full max-w-[calc(100vw-32px)]' : 'fixed bottom-4 right-4 z-40'}`}>
      {isOpen ? (
        <div className={`${isMobile ? 'w-full h-[80vh] max-h-[550px]' : 'w-[900px] h-[600px]'} bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transition-all`}>
          <div className="p-3 sm:p-4 bg-resto-blue-500 text-white flex justify-between items-center">
            <div className="flex items-center">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white/20 flex items-center justify-center mr-2">
                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-medium">Assistente IA</p>
                <p className="text-xs opacity-80 hidden sm:block">OpenAI • Stability AI • Google Analytics</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleChat}
              className="text-white hover:bg-white/20 h-7 w-7 sm:h-8 sm:w-8"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
          
          <div className="h-[calc(100%-56px)] sm:h-[calc(100%-80px)] overflow-auto p-2 sm:p-4">
            <UnifiedAIAssistant />
          </div>
        </div>
      ) : (
        <Button
          size="lg"
          className="h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg bg-resto-blue-500 hover:bg-resto-blue-600 animate-pulse-slow"
          onClick={toggleChat}
        >
          <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
      )}
    </div>
  );
}
