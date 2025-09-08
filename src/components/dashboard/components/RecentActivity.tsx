import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Clock,
  DollarSign,
  TrendingUp,
  Package,
  CheckCircle
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
      return 'bg-green-100 text-green-800 border-green-200';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'info':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getIconColor = (status: string) => {
  switch (status) {
    case 'success':
      return 'text-green-600 bg-green-100';
    case 'warning':
      return 'text-yellow-600 bg-yellow-100';
    case 'info':
      return 'text-blue-600 bg-blue-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const RecentActivity = memo(function RecentActivity() {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div 
              key={activity.id} 
              className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
            >
              <div className={`p-2 rounded-lg ${getIconColor(activity.status)}`}>
                <activity.icon className="h-4 w-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-medium text-gray-900">
                    {activity.title}
                  </h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(activity.status)}`}>
                    {activity.status}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
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