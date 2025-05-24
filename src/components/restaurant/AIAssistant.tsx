
import { Button } from "@/components/ui/button";
import { MessageSquare, X } from "lucide-react";
import { useState } from "react";
import { UnifiedAIAssistant } from "./UnifiedAIAssistant";

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {isOpen ? (
        <div className="w-[900px] h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transition-all">
          <div className="p-4 bg-resto-blue-500 text-white flex justify-between items-center">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center mr-2">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Assistente IA Unificado</p>
                <p className="text-xs opacity-80">OpenAI • Stability AI • Google Analytics • Social Media</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleChat}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="h-[calc(100%-80px)] overflow-auto p-4">
            <UnifiedAIAssistant />
          </div>
        </div>
      ) : (
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg bg-resto-blue-500 hover:bg-resto-blue-600 animate-pulse-slow"
          onClick={toggleChat}
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
