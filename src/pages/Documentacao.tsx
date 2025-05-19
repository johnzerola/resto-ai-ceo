
import React from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

const Documentacao = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Documentação Técnica</h1>

      <Tabs defaultValue="introducao">
        <TabsList>
          <TabsTrigger value="introducao">Introdução</TabsTrigger>
          <TabsTrigger value="arquitetura">Arquitetura</TabsTrigger>
          <TabsTrigger value="integracao">Integração</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>
        <TabsContent value="introducao">
          <div>
            <h2 className="text-xl font-semibold mb-2">Introdução</h2>
            <p>
              Bem-vindo à documentação técnica do Resto AI CEO. Aqui você encontrará informações detalhadas sobre a arquitetura, integração e API do sistema.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="arquitetura">
          <div>
            <h2 className="text-xl font-semibold mb-2">Arquitetura</h2>
            <p>
              O sistema é construído utilizando uma arquitetura modular, com componentes independentes que se comunicam através de APIs.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="integracao">
          <div>
            <h2 className="text-xl font-semibold mb-2">Integração de Módulos</h2>
            <p>
              Para integrar novos módulos, siga os seguintes passos:
            </p>
            <ol className="list-decimal pl-5">
              <li>Crie um novo componente React para o módulo.</li>
              <li>Defina as rotas de API necessárias.</li>
              <li>Adicione o módulo ao menu principal.</li>
            </ol>
          </div>
        </TabsContent>
        <TabsContent value="api">
          <div>
            <h2 className="text-xl font-semibold mb-2">API</h2>
            <p>
              A API do sistema é RESTful e utiliza JSON para comunicação.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Documentacao;
