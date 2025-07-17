import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock,
  DollarSign,
  TrendingUp,
  Package,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const recentActivities = [
  {
    id: 1,
    type: 'revenue',
    title: 'Receita atualizada',
    description: 'R$ 1.250,00 adicionados ao fluxo de caixa',
    time: '2 min atrás',
    icon: DollarSign,
    status: 'success'
  },
  {
    id: 2,
    type: 'goal',
    title: 'Meta atingida',
    description: 'Meta de vendas do dia alcançada (105%)',
    time: '15 min atrás',
    icon: TrendingUp,
    status: 'success'
  },
  {
    id: 3,
    type: 'stock',
    title: 'Estoque baixo',
    description: 'Tomate cereja abaixo do limite mínimo',
    time: '1 hora atrás',
    icon: Package,
    status: 'warning'
  },
  {
    id: 4,
    type: 'system',
    title: 'Backup realizado',
    description: 'Backup automático dos dados concluído',
    time: '2 horas atrás',
    icon: CheckCircle,
    status: 'info'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'success':
      return 'bg-success/10 text-success border-success/20';
    case 'warning':
      return 'bg-warning/10 text-warning border-warning/20';
    case 'info':
      return 'bg-info/10 text-info border-info/20';
    default:
      return 'bg-muted/10 text-muted-foreground border-muted/20';
  }
};

const getIconColor = (status: string) => {
  switch (status) {
    case 'success':
      return 'text-success bg-success/10';
    case 'warning':
      return 'text-warning bg-warning/10';
    case 'info':
      return 'text-info bg-info/10';
    default:
      return 'text-muted-foreground bg-muted/10';
  }
};

const RecentActivity = memo(function RecentActivity() {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div 
              key={activity.id} 
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors duration-200"
            >
              <div className={`p-2 rounded-lg ${getIconColor(activity.status)}`}>
                <activity.icon className="h-4 w-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-medium text-foreground">
                    {activity.title}
                  </h4>
                  <Badge variant="secondary" className={getStatusColor(activity.status)}>
                    {activity.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {activity.description}
                </p>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

export default RecentActivity;