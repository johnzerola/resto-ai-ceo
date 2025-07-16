import React from "react";
import { AuthButton } from "@/components/auth/AuthButton";
import { OptimizedHero } from "@/components/landing/OptimizedHero";
import { PersuasiveAbout } from "@/components/landing/PersuasiveAbout";
import { OptimizedPricing } from "@/components/landing/OptimizedPricing";
import { PersuasiveCTA } from "@/components/landing/PersuasiveCTA";
import { 
  ChefHat, 
  Menu,
  X,
  Star,
  Shield,
  Clock,
  Users
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function OptimizedIndex() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Optimized Header with sticky navigation */}
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
                <ChefHat className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Lucraí CEO
                </h1>
                <p className="text-xs text-muted-foreground">Gestão Inteligente</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a 
                href="#sobre" 
                className="text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                Sobre
              </a>
              <a 
                href="#precos" 
                className="text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                Preços
              </a>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>4.9/5</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-primary" />
                  <span>+200 clientes</span>
                </div>
              </div>
            </nav>
            
            {/* Auth Button + Mobile Menu */}
            <div className="flex items-center gap-4">
              <AuthButton />
              
              {/* Mobile menu button */}
              <button
                className="md:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-border pt-4">
              <nav className="flex flex-col gap-4">
                <a 
                  href="#sobre" 
                  className="text-muted-foreground hover:text-primary transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sobre
                </a>
                <a 
                  href="#precos" 
                  className="text-muted-foreground hover:text-primary transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Preços
                </a>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>4.9/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-primary" />
                    <span>+200 clientes</span>
                  </div>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <OptimizedHero />

      {/* Trust Indicators Band */}
      <section className="py-8 bg-card border-y border-border">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center items-center gap-8 text-center">
            <div className="text-muted-foreground font-medium text-sm">
              CONFIADO POR:
            </div>
            <div className="flex flex-wrap justify-center gap-8 opacity-60 hover:opacity-100 transition-opacity">
              <div className="text-lg font-bold text-muted-foreground">ABRASEL</div>
              <div className="text-lg font-bold text-muted-foreground">SEBRAE</div>
              <div className="text-lg font-bold text-muted-foreground">ECOA</div>
              <div className="text-lg font-bold text-muted-foreground">BIA FOOD</div>
              <div className="text-lg font-bold text-muted-foreground">REPEDIU</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <PersuasiveAbout />

      {/* Pricing Section */}
      <OptimizedPricing />

      {/* Final CTA Section */}
      <PersuasiveCTA />

      {/* Optimized Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <ChefHat className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Lucraí CEO
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                A primeira plataforma brasileira de gestão financeira inteligente para restaurantes.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Recursos</a></li>
                <li><a href="#precos" className="hover:text-primary transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Integrações</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">WhatsApp</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Treinamentos</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Termos</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Segurança</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">LGPD</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 Lucraí CEO. Todos os direitos reservados.
            </p>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>Dados Seguros</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>Suporte 24/7</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>4.9/5 Satisfação</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}