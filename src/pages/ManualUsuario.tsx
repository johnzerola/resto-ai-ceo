
import { Layout } from "@/components/restaurant/Layout";
import { ManualUsuario as ManualUsuarioContent } from "@/components/documentation/ManualUsuario";

const ManualUsuario = () => {
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Manual do Usuário</h1>
        <p className="text-muted-foreground">
          Instruções completas para uso eficiente do sistema
        </p>
      </div>
      
      <div className="space-y-8">
        <ManualUsuarioContent />
      </div>
    </Layout>
  );
};

export default ManualUsuario;
