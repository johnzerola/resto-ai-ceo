
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/restaurant/Layout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-7xl font-bold text-resto-blue-500">404</h1>
        <p className="text-xl text-gray-600 mt-4 mb-6">Página não encontrada</p>
        <p className="text-gray-500 mb-8 max-w-md text-center">
          A página que você está procurando não existe ou foi movida para outro local.
        </p>
        <Button asChild>
          <a href="/">Voltar para o Dashboard</a>
        </Button>
      </div>
    </Layout>
  );
};

export default NotFound;
