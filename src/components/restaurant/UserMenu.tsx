
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Loader2, LogOut, Settings, User, UserCog } from "lucide-react";
import { UserRole } from "@/services/AuthService";

export function UserMenu() {
  const { user, logout, isLoading, hasPermission } = useAuth();

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled className="w-9 px-0">
        <Loader2 className="h-5 w-5 animate-spin" />
      </Button>
    );
  }

  if (!user) {
    return (
      <Button asChild variant="ghost" size="sm">
        <Link to="/login">
          <User className="h-5 w-5 mr-2" />
          Login
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="md:hidden">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <div className="md:block hidden">
            <p className="text-sm font-medium">Minha conta</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/perfil">
            <User className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/configuracoes">
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurações</span>
          </Link>
        </DropdownMenuItem>
        
        {/* Item visível apenas para administradores */}
        {hasPermission(UserRole.OWNER) && (
          <DropdownMenuItem asChild>
            <Link to="/gerenciar-usuarios">
              <UserCog className="mr-2 h-4 w-4" />
              <span>Gerenciar Usuários</span>
            </Link>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
