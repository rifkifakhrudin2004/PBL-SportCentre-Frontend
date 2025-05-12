import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  colorClass?: string;
  isLoading?: boolean;
  trend?: {
    value: number;
    isUp: boolean;
  };
}

export const StatCard = ({ 
  title, 
  value, 
  icon, 
  colorClass = 'bg-primary/10',
  isLoading = false,
  trend
}: StatCardProps) => (
  <Card className="overflow-hidden transition-all duration-300 hover:shadow-md hover:translate-y-[-4px] border-b-4 hover:border-primary">
    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
      <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
      {icon && <div className={`p-2 rounded-full ${colorClass} animate-pulse-slow`}>{icon}</div>}
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Skeleton className="h-9 w-3/4" />
      ) : (
        <div className="flex flex-col">
          <div className="text-2xl font-bold tracking-tight">
            {value}
          </div>
          {trend && (
            <div className="flex items-center mt-1 text-sm">
              <span className={trend.isUp ? "text-green-500" : "text-red-500"}>
                {trend.isUp ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              <span className="ml-1 text-gray-500">dari bulan lalu</span>
            </div>
          )}
        </div>
      )}
    </CardContent>
  </Card>
); 