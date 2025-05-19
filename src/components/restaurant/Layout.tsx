import React from "react";
import { Sidebar } from "./Sidebar";
import { UserMenu } from "./UserMenu";
import { RestaurantSelector } from "./RestaurantSelector";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

export function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, currentRestaurant, userRestaurants } = useAuth();
  
  // Se estiver carregando, mostra spinner
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  // Se não estiver autenticado, redireciona para login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Se não tiver restaurante, redireciona para onboarding
  if (userRestaurants.length === 0) {
    return <Navigate to="/onboarding" />;
  }
  
  // Se não tiver restaurante atual selecionado, mas tiver restaurantes disponíveis
  if (!currentRestaurant && userRestaurants.length > 0) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex grow flex-col md:flex-row">
        <Sidebar />
        <main className="grow p-4 md:p-8 pt-20 md:pt-8 max-w-7xl mx-auto">
          <div className="flex justify-between items-start mb-4">
            <div>
              {/* Espaço reservado para que a largura do conteúdo não mude dependendo da presença do seletor */}
            </div>
            <div className="flex items-center gap-2">
              <RestaurantSelector />
              <UserMenu />
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
