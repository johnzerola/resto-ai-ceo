
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useState } from "react";

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="fixed bottom-4 right-4 z-40">
      {isOpen ? (
        <div className="w-80 h-96 bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col overflow-hidden transition-all">
          <div className="p-4 bg-resto-blue-500 text-white flex justify-between items-center">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center mr-2">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Gerente IA</p>
                <p className="text-xs opacity-80">Online</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18"></path>
                <path d="M6 6L18 18"></path>
              </svg>
            </Button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
            <div className="flex items-start">
              <div className="h-8 w-8 rounded-full bg-resto-blue-100 flex items-center justify-center text-resto-blue-500 mr-2">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm max-w-[80%]">
                <p className="text-sm">Olá! Como posso ajudar você a gerenciar seu restaurante hoje?</p>
              </div>
            </div>
          </div>
          
          <div className="p-3 border-t border-gray-200 bg-white">
            <div className="flex items-center rounded-full bg-gray-100 px-3 focus-within:ring-2 focus-within:ring-resto-blue-500">
              <input
                type="text"
                placeholder="Digite sua mensagem..."
                className="flex-1 bg-transparent py-2 outline-none text-sm"
              />
              <Button size="sm" className="rounded-full h-8 w-8 p-0 bg-resto-blue-500 hover:bg-resto-blue-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m5 12 14-7-7 14v-7H5Z" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg bg-resto-blue-500 hover:bg-resto-blue-600 animate-pulse-slow"
          onClick={() => setIsOpen(true)}
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
