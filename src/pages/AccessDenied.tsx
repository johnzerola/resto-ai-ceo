
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const AccessDenied = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-4">Acesso Negado</h1>
        <p className="text-gray-600 mb-8">
          Você não tem permissão para acessar esta página. 
          Esta funcionalidade é restrita a usuários com nível de acesso mais elevado.
        </p>
        
        {user && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
            <p className="text-amber-800">
              Você está conectado como <span className="font-medium">{user.name}</span> ({user.role}).
            </p>
          </div>
        )}
        
        <div className="space-y-4">
          <Button asChild>
            <Link to="/">Voltar ao Início</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
