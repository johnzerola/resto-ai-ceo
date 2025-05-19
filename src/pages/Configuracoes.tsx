import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { startSync } from "@/services/SyncService";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const Configuracoes = () => {
  const [darkMode, setDarkMode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(storedDarkMode);
    if (storedDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleSync = async () => {
    toast({
      title: "Sincronizando dados...",
      description: "Aguarde enquanto os dados são sincronizados.",
    });

    await startSync("configuracoes");

    toast({
      title: "Sincronização concluída",
      description: "Os dados foram sincronizados com sucesso.",
    });
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Configurações</CardTitle>
          <CardDescription>
            Gerencie as configurações do seu restaurante.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <Label htmlFor="dark-mode">Usar modo escuro</Label>
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={toggleDarkMode}
            />
          </div>
          <Button onClick={handleSync}>Sincronizar Dados</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Configuracoes;
