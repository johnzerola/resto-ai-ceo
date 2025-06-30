
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Utensils, 
  Calculator, 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign,
  Target,
  TrendingUp
} from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  margin: number;
  category: string;
  image?: string;
}

const mockMenuItems: MenuItem[] = [
  {
    id: "1",
    name: "Hambúrguer Artesanal",
    description: "Hambúrguer 180g com queijo, alface e tomate",
    price: 28.90,
    cost: 12.50,
    margin: 56.7,
    category: "Hambúrgueres"
  },
  {
    id: "2", 
    name: "Pizza Margherita",
    description: "Pizza tradicional com molho de tomate, mussarela e manjericão",
    price: 35.00,
    cost: 14.20,
    margin: 59.4,
    category: "Pizzas"
  }
];

export function CardapioPrecificacao() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(mockMenuItems);
  const [activeTab, setActiveTab] = useState("cardapio");

  const calculateMargin = (price: number, cost: number) => {
    return ((price - cost) / price) * 100;
  };

  const getMarginColor = (margin: number) => {
    if (margin >= 60) return "text-green-600 bg-green-50";
    if (margin >= 40) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cardápio & Precificação</h1>
          <p className="text-gray-600 mt-1">
            Gerencie seu cardápio e calcule preços inteligentemente
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Novo Item
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cardapio" className="flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            Cardápio
          </TabsTrigger>
          <TabsTrigger value="precificacao" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Precificação
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Análises
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cardapio" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {item.description}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {item.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-green-600">
                        R$ {item.price.toFixed(2)}
                      </span>
                      <Badge className={getMarginColor(item.margin)}>
                        {item.margin.toFixed(1)}% margem
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="precificacao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Calculadora de Preços
              </CardTitle>
              <CardDescription>
                Calcule o preço ideal baseado nos custos e margem desejada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Custo Total (R$)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Margem Desejada (%)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Preço Sugerido (R$)
                  </label>
                  <div className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-lg font-bold text-green-600">
                    R$ 0.00
                  </div>
                </div>
              </div>
              
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Target className="h-4 w-4 mr-2" />
                Calcular Preço
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menuItems.map((item) => (
              <Card key={item.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Custo:</span>
                      <span className="font-medium">R$ {item.cost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Preço:</span>
                      <span className="font-medium">R$ {item.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Margem:</span>
                      <Badge className={getMarginColor(item.margin)}>
                        {item.margin.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600">Lucro:</span>
                      <span className="font-bold text-green-600">
                        R$ {(item.price - item.cost).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Margem Média
                    </p>
                    <p className="text-2xl font-bold text-blue-600">58.1%</p>
                  </div>
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Ticket Médio
                    </p>
                    <p className="text-2xl font-bold text-green-600">R$ 31.95</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Itens no Cardápio
                    </p>
                    <p className="text-2xl font-bold text-purple-600">{menuItems.length}</p>
                  </div>
                  <Utensils className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recomendações Inteligentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Oportunidade:</strong> Considere ajustar o preço do Hambúrguer Artesanal para R$ 32.50 
                    e aumentar a margem para 61.5%
                  </p>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Destaque:</strong> Pizza Margherita tem excelente margem (59.4%). 
                    Considere criar variações similares.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
