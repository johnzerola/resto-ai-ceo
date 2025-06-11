
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
    <div className={`${isMobile ? 'fixed bottom-3 right-3 z-40 w-[calc(100vw-24px)] max-w-[calc(100vw-24px)]' : 'fixed bottom-4 right-4 z-40'}`}>
      {isOpen ? (
        <div className={`${isMobile ? 'w-full h-[75vh] max-h-[500px]' : 'w-[900px] h-[600px]'} bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transition-all`}>
          <div className="p-2 sm:p-3 lg:p-4 bg-resto-blue-500 text-white flex justify-between items-center">
            <div className="flex items-center min-w-0 flex-1">
              <div className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 rounded-full bg-white/20 flex items-center justify-center mr-2 flex-shrink-0">
                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm lg:text-base font-medium truncate">Assistente IA</p>
                <p className="text-xs opacity-80 hidden sm:block truncate">OpenAI • Stability AI • Google Analytics</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleChat}
              className="text-white hover:bg-white/20 h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 flex-shrink-0"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
          
          <div className="h-[calc(100%-48px)] sm:h-[calc(100%-56px)] lg:h-[calc(100%-80px)] overflow-auto p-2 sm:p-3 lg:p-4">
            <UnifiedAIAssistant />
          </div>
        </div>
      ) : (
        <Button
          size="lg"
          className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 rounded-full shadow-lg bg-resto-blue-500 hover:bg-resto-blue-600 animate-pulse-slow"
          onClick={toggleChat}
        >
          <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
        </Button>
      )}
    </div>
  );
}
