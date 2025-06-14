
import React, { memo } from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  Shield, 
  Terminal, 
  Brain, 
  Settings, 
  Wrench 
} from "lucide-react";

interface MobileTabsNavigationProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const MobileTabsNavigation = memo(function MobileTabsNavigation({ 
  activeTab, 
  onTabChange 
}: MobileTabsNavigationProps) {
  const tabs = [
    { value: "overview", label: "Geral", icon: BarChart3 },
    { value: "audit", label: "Auditoria", icon: Shield },
    { value: "logs", label: "Logs", icon: Terminal },
    { value: "ai", label: "IA", icon: Brain },
    { value: "plans", label: "Planos", icon: Settings },
    { value: "tools", label: "Tools", icon: Wrench }
  ];

  return (
    <div className="overflow-x-auto pb-2">
      <TabsList className="grid w-max grid-cols-6 gap-1 bg-muted/30">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <TabsTrigger 
              key={tab.value} 
              value={tab.value}
              className="flex flex-col items-center gap-1 px-2 py-2 text-xs min-w-[60px]"
              onClick={() => onTabChange(tab.value)}
            >
              <IconComponent className="h-3 w-3" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </div>
  );
});
