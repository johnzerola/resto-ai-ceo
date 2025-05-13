
import { useEffect, useState } from "react";
import { 
  Card,
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Edit, 
  Trash2, 
  Search, 
  Calendar,
  Tag,
  Clock,
  Users
} from "lucide-react";
import { toast } from "sonner";

// Interface for promotion
export interface Promotion {
  id: string;
  name: string;
  type: "rodizio" | "combo" | "discount" | "special";
  description: string;
  startDate: string;
  endDate: string;
  daysOfWeek: string[];
  startTime?: string;
  endTime?: string;
  originalPrice: number;
  promotionalPrice: number;
  isActive: boolean;
  conditions?: string;
  maxRedemptions?: number;
  currentRedemptions: number;
  products: PromotionProduct[];
}

export interface PromotionProduct {
  name: string;
  quantity: number;
  price: number;
}

interface PromotionsListProps {
  onEdit: (promotionId: string) => void;
}

export function PromotionsList({ onEdit }: PromotionsListProps) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  
  // Load promotions data
  useEffect(() => {
    const savedPromotions = localStorage.getItem("promotions");
    if (savedPromotions) {
      setPromotions(JSON.parse(savedPromotions));
    } else {
      // Set sample data if no data in localStorage
      const samplePromotions = generateSamplePromotions();
      localStorage.setItem("promotions", JSON.stringify(samplePromotions));
      setPromotions(samplePromotions);
    }
  }, []);

  // Filter promotions based on search and active/all tabs
  const getFilteredPromotions = () => {
    let filtered = promotions.filter((promotion) =>
      promotion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promotion.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (activeTab === "active") {
      filtered = filtered.filter(promo => {
        const now = new Date();
        const startDate = new Date(promo.startDate);
        const endDate = new Date(promo.endDate);
        return promo.isActive && now >= startDate && now <= endDate;
      });
    }
    
    return filtered;
  };

  // Delete promotion
  const deletePromotion = (promotionId: string) => {
    if (confirm("Tem certeza que deseja excluir esta promoção?")) {
      const updatedPromotions = promotions.filter(promo => promo.id !== promotionId);
      setPromotions(updatedPromotions);
      localStorage.setItem("promotions", JSON.stringify(updatedPromotions));
      toast.success("Promoção excluída com sucesso!");
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  // Get days of week in PT-BR
  const getDaysOfWeek = (days: string[]) => {
    const dayMap: Record<string, string> = {
      "sun": "Dom",
      "mon": "Seg",
      "tue": "Ter",
      "wed": "Qua",
      "thu": "Qui",
      "fri": "Sex",
      "sat": "Sáb"
    };
    
    return days.map(day => dayMap[day]).join(", ");
  };

  // Calculate discount percentage
  const calculateDiscount = (original: number, promotional: number) => {
    return Math.round(((original - promotional) / original) * 100);
  };

  // Check if promotion is currently active
  const isPromotionActive = (promotion: Promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    
    return promotion.isActive && now >= startDate && now <= endDate;
  };

  // Get promotion type label
  const getPromotionTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      "rodizio": "Rodízio",
      "combo": "Combo",
      "discount": "Desconto",
      "special": "Especial"
    };
    
    return typeMap[type] || type;
  };

  const filteredPromotions = getFilteredPromotions();

  return (
    <div className="space-y-6">
      {/* Search and Tabs */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar promoções..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[260px]">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="active">Ativas</TabsTrigger>
              <TabsTrigger value="all">Todas</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Grid of Promotion Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPromotions.length > 0 ? (
          filteredPromotions.map((promotion) => (
            <Card key={promotion.id} className={isPromotionActive(promotion) ? "border-green-200" : "border-gray-200"}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    {promotion.name}
                  </CardTitle>
                  <Badge variant={isPromotionActive(promotion) ? "default" : "secondary"}>
                    {isPromotionActive(promotion) ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
                <div className="flex items-center text-sm mt-1">
                  <Tag className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                  <span className="text-muted-foreground">{getPromotionTypeLabel(promotion.type)}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{promotion.description}</p>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Preço Original</p>
                    <p className="text-sm line-through">{formatCurrency(promotion.originalPrice)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Preço Promocional</p>
                    <p className="text-base font-medium text-green-600">
                      {formatCurrency(promotion.promotionalPrice)}
                      <span className="ml-1 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                        -{calculateDiscount(promotion.originalPrice, promotion.promotionalPrice)}%
                      </span>
                    </p>
                  </div>
                </div>
                
                <div className="space-y-1 mb-4">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    <span>{formatDate(promotion.startDate)} até {formatDate(promotion.endDate)}</span>
                  </div>
                  
                  {promotion.daysOfWeek.length > 0 && (
                    <div className="flex items-center text-sm">
                      <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                      <span>
                        {getDaysOfWeek(promotion.daysOfWeek)}
                        {promotion.startTime && promotion.endTime && (
                          <> ({promotion.startTime} - {promotion.endTime})</>
                        )}
                      </span>
                    </div>
                  )}
                  
                  {promotion.maxRedemptions && (
                    <div className="flex items-center text-sm">
                      <Users className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                      <span>
                        {promotion.currentRedemptions}/{promotion.maxRedemptions} utilizados
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="ghost" size="sm" className="h-8" onClick={() => onEdit(promotion.id)}>
                    <Edit className="h-3.5 w-3.5 mr-1" />
                    Editar
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => deletePromotion(promotion.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-3 py-10 text-center">
            <p className="text-muted-foreground">Nenhuma promoção encontrada</p>
          </div>
        )}
      </div>
      
      {/* Promotions List Table View */}
      <Card>
        <CardHeader>
          <CardTitle>Visão Detalhada</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Dias</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPromotions.length > 0 ? (
                filteredPromotions.map((promotion) => (
                  <TableRow key={`table-${promotion.id}`}>
                    <TableCell className="font-medium">{promotion.name}</TableCell>
                    <TableCell>{getPromotionTypeLabel(promotion.type)}</TableCell>
                    <TableCell>
                      {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                    </TableCell>
                    <TableCell>{getDaysOfWeek(promotion.daysOfWeek)}</TableCell>
                    <TableCell className="font-medium text-green-600">
                      {formatCurrency(promotion.promotionalPrice)}
                      <span className="ml-1 text-xs text-gray-500 font-normal">
                        ({formatCurrency(promotion.originalPrice)})
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={isPromotionActive(promotion) ? "default" : "secondary"}>
                        {isPromotionActive(promotion) ? "Ativa" : "Inativa"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit(promotion.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600"
                        onClick={() => deletePromotion(promotion.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <p className="text-muted-foreground">Nenhuma promoção encontrada</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Generate sample promotions data
function generateSamplePromotions(): Promotion[] {
  const today = new Date();
  
  // Next week date
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  // Last week date
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7);
  
  // Next month date
  const nextMonth = new Date(today);
  nextMonth.setMonth(today.getMonth() + 1);
  
  return [
    {
      id: "1",
      name: "Rodízio Premium",
      type: "rodizio",
      description: "Rodízio completo com carnes nobres e buffet de entradas.",
      startDate: today.toISOString(),
      endDate: nextMonth.toISOString(),
      daysOfWeek: ["mon", "tue", "wed", "thu"],
      startTime: "18:00",
      endTime: "23:00",
      originalPrice: 89.9,
      promotionalPrice: 69.9,
      isActive: true,
      conditions: "Exceto feriados. Bebidas não inclusas.",
      products: [
        { name: "Rodízio de Carnes", quantity: 1, price: 69.9 }
      ],
      currentRedemptions: 45,
      maxRedemptions: 200
    },
    {
      id: "2",
      name: "Combo Casal",
      type: "combo",
      description: "Combo para duas pessoas com entrada, prato principal e sobremesa.",
      startDate: lastWeek.toISOString(),
      endDate: nextWeek.toISOString(),
      daysOfWeek: ["mon", "tue", "wed", "thu", "fri"],
      originalPrice: 149.9,
      promotionalPrice: 119.9,
      isActive: true,
      conditions: "Válido apenas para jantar.",
      products: [
        { name: "Entrada (para compartilhar)", quantity: 1, price: 29.9 },
        { name: "Prato Principal", quantity: 2, price: 49.9 },
        { name: "Sobremesa (para compartilhar)", quantity: 1, price: 19.9 }
      ],
      currentRedemptions: 23,
      maxRedemptions: 100
    },
    {
      id: "3",
      name: "Happy Hour Especial",
      type: "special",
      description: "Bebidas selecionadas com desconto e petiscos a preço promocional.",
      startDate: today.toISOString(),
      endDate: nextMonth.toISOString(),
      daysOfWeek: ["mon", "tue", "wed", "thu", "fri"],
      startTime: "17:00",
      endTime: "20:00",
      originalPrice: 98.8,
      promotionalPrice: 79.9,
      isActive: true,
      conditions: "Promoção válida apenas para consumo no local.",
      products: [
        { name: "Chopp (350ml)", quantity: 2, price: 19.9 },
        { name: "Tábua de petiscos", quantity: 1, price: 39.9 }
      ],
      currentRedemptions: 67,
      maxRedemptions: 0
    },
    {
      id: "4",
      name: "Menu Executivo",
      type: "discount",
      description: "Almoço executivo completo com prato principal, sobremesa e bebida.",
      startDate: lastWeek.toISOString(),
      endDate: today.toISOString(),
      daysOfWeek: ["mon", "tue", "wed", "thu", "fri"],
      startTime: "11:30",
      endTime: "15:00",
      originalPrice: 54.9,
      promotionalPrice: 39.9,
      isActive: false,
      conditions: "Apenas no horário de almoço.",
      products: [
        { name: "Prato do dia", quantity: 1, price: 29.9 },
        { name: "Sobremesa", quantity: 1, price: 5.0 },
        { name: "Bebida não alcoólica", quantity: 1, price: 5.0 }
      ],
      currentRedemptions: 120,
      maxRedemptions: 0
    }
  ];
}
