import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';
import { ApexOptions } from 'apexcharts';

// Import ApexCharts secara dinamis karena ini adalah komponen client-side
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface RevenueChartProps {
  title?: string;
  description?: string;
  data: {
    categories: string[];
    series: number[];
  };
  isLoading?: boolean;
  percentIncrease?: number;
}

export const RevenueChart = ({
  title = "Pendapatan Bulanan",
  description = "Pendapatan dari seluruh cabang dalam 6 bulan terakhir",
  data,
  isLoading = false,
  percentIncrease = 12.5
}: RevenueChartProps) => {
  // Pastikan data tidak undefined dan series tidak berisi nilai NaN
  const validData = {
    categories: data?.categories || [],
    series: (data?.series || []).map(val => (isNaN(val) ? 0 : val))
  };

  // Cek apakah semua data adalah 0 untuk menampilkan pesan
  const hasValidData = validData.series.some(val => val > 0);

  const options: ApexOptions = {
    chart: {
      id: 'revenue-chart',
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false
        }
      },
      zoom: {
        enabled: false,
      },
      dropShadow: {
        enabled: true,
        top: 0,
        left: 0,
        blur: 3,
        opacity: 0.2,
        color: '#10b981',
      },
      animations: {
        enabled: true,
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        }
      }
    },
    xaxis: {
      categories: validData.categories,
      labels: {
        style: {
          colors: Array(validData.categories.length).fill('#94a3b8'),
          fontSize: '12px'
        },
        rotate: 0
      },
      axisBorder: {
        show: true,
        color: '#f1f5f9'
      },
      axisTicks: {
        show: true,
        color: '#f1f5f9'
      }
    },
    yaxis: {
      labels: {
        formatter: (value) => {
          return `Rp ${value.toLocaleString('id-ID')}`;
        }
      }
    },
    colors: ['#10b981'],
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'vertical',
        shadeIntensity: 0.5,
        gradientToColors: ['#3b82f6'],
        opacityFrom: 1,
        opacityTo: 0.9,
        stops: [0, 100],
      },
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      y: {
        formatter: (value: number) => `Rp ${value.toLocaleString('id-ID')}`,
      },
      theme: 'dark',
      style: {
        fontSize: '12px',
      }
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 5,
      xaxis: {
        lines: {
          show: true
        }
      }
    },
    markers: {
      size: 5,
      colors: ['#10b981'],
      strokeColors: '#ffffff',
      strokeWidth: 2,
      hover: {
        size: 7,
      }
    }
  };

  const series = [
    {
      name: 'Pendapatan',
      data: validData.series,
    },
  ];

  // Fungsi helper untuk menentukan apakah ada kenaikan atau penurunan
  const isIncreasing = percentIncrease > 0;
  const absolutePercentage = Math.abs(percentIncrease);

  return (
    <Card className="overflow-hidden border shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <Badge 
            variant="outline" 
            className={`${isIncreasing ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'} flex items-center gap-1`}
          >
            <TrendingUp className={`h-3 w-3 ${!isIncreasing && 'transform rotate-180'}`} /> 
            {absolutePercentage}% {isIncreasing ? 'Naik' : 'Turun'}
          </Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-80 w-full flex items-center justify-center">
            <div className="space-y-4 w-full">
              <div className="h-2 bg-slate-200 rounded animate-pulse w-full"></div>
              <div className="h-2 bg-slate-200 rounded animate-pulse w-3/4"></div>
              <div className="h-2 bg-slate-200 rounded animate-pulse w-1/2"></div>
              <div className="h-40 bg-slate-100 rounded-lg animate-pulse w-full"></div>
            </div>
          </div>
        ) : validData.categories.length > 0 && hasValidData ? (
          <div className="h-80 w-full">
            {typeof window !== 'undefined' && (
              <Chart
                options={options}
                series={series}
                type="area"
                height="100%"
                width="100%"
              />
            )}
          </div>
        ) : (
          <div className="h-80 w-full flex items-center justify-center">
            <p className="text-muted-foreground">Tidak ada data pendapatan untuk ditampilkan</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 