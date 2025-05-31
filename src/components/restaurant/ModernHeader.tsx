
import React from "react";
import { RestaurantSelector } from "./RestaurantSelector";
import { UserMenu } from "./UserMenu";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ModernHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-xl border-b border-gray-200/60 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 md:px-8">
        {/* Left side - Search on desktop */}
        <div className="hidden md:flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pesquisar..."
              className="pl-10 pr-4 py-2 bg-gray-50/80 border-gray-200 rounded-xl focus:border-[#00D887] focus:ring-2 focus:ring-[#00D887]/20 transition-all duration-200"
            />
          </div>
        </div>

        {/* Center - Brand on mobile */}
        <div className="flex md:hidden items-center">
          <h1 className="text-lg font-bold bg-gradient-to-r from-[#1B2C4F] to-[#00D887] bg-clip-text text-transparent">
            RestaurIA
          </h1>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          {/* Search icon for mobile */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#00D887] rounded-full border-2 border-white"></span>
          </Button>

          {/* Restaurant Selector */}
          <RestaurantSelector />

          {/* User Menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
