import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import { Badge } from '@/components/ui/badge';
import { BarChart3 } from 'lucide-react';
import { ApexOptions } from 'apexcharts';

// Import ApexCharts secara dinamis karena ini adalah komponen client-side
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface BookingChartProps {
  title?: string;
  description?: string;
  data: {
    categories: string[];
    series: number[];
  };
  isLoading?: boolean;
  percentIncrease?: number;
}

export const BookingChart = ({
  title = "Jumlah Booking Bulanan",
  description = "Jumlah booking di seluruh cabang dalam 6 bulan terakhir",
  data,
  isLoading = false,
  percentIncrease = 8.3
}: BookingChartProps) => {
  // Pastikan data tidak undefined dan series tidak berisi nilai NaN
  const validData = {
    categories: data?.categories || [],
    series: (data?.series || []).map(val => (isNaN(val) ? 0 : val))
  };

  // Cek apakah semua data adalah 0 untuk menampilkan pesan
  const hasValidData = validData.series.some(val => val > 0);

  const options: ApexOptions = {
    chart: {
      id: 'booking-chart',
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
        color: '#8b5cf6',
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
    colors: ['#8b5cf6'],
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'vertical',
        shadeIntensity: 0.5,
        gradientToColors: ['#ec4899'],
        opacityFrom: 1,
        opacityTo: 0.9,
        stops: [0, 100],
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '60%',
        distributed: true,
        dataLabels: {
          position: 'top'
        }
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${value} booking`,
      },
      theme: 'dark',
      style: {
        fontSize: '12px',
      }
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 5,
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    states: {
      hover: {
        filter: {
          type: 'lighten',
        }
      },
      active: {
        filter: {
          type: 'darken',
        }
      }
    }
  };

  const series = [
    {
      name: 'Booking',
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
            className={`${isIncreasing ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-red-50 text-red-600 border-red-200'} flex items-center gap-1`}
          >
            <BarChart3 className={`h-3 w-3 ${!isIncreasing && 'transform rotate-180'}`} /> 
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
                type="bar"
                height="100%"
                width="100%"
              />
            )}
          </div>
        ) : (
          <div className="h-80 w-full flex items-center justify-center">
            <p className="text-muted-foreground">Tidak ada data booking untuk ditampilkan</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 