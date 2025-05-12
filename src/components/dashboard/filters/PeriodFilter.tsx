import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CalendarIcon, CheckIcon, ChevronDownIcon, Loader2 } from "lucide-react";
import { useState } from "react";

export type PeriodType = "daily" | "monthly" | "yearly";

interface PeriodFilterProps {
  onChange: (period: PeriodType) => void;
  defaultValue?: PeriodType;
  isLoading?: boolean;
}

export function PeriodFilter({ 
  onChange, 
  defaultValue = "monthly", 
  isLoading = false 
}: PeriodFilterProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>(defaultValue);

  const handlePeriodChange = (period: PeriodType) => {
    if (isLoading) return; // Jangan izinkan perubahan saat loading
    setSelectedPeriod(period);
    onChange(period);
  };

  // Get display text for the current period type
  const getPeriodDisplayText = (period: PeriodType): string => {
    switch (period) {
      case "daily":
        return "Harian";
      case "monthly":
        return "Bulanan";
      case "yearly":
        return "Tahunan";
      default:
        return "Bulanan";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-1" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          )}
          <span>Tampilan {getPeriodDisplayText(selectedPeriod)}</span>
          <ChevronDownIcon className="h-4 w-4 text-muted-foreground ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuItem 
            className={`flex items-center justify-between ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onClick={() => handlePeriodChange("daily")}
            disabled={isLoading}
          >
            Harian
            {selectedPeriod === "daily" && (
              <CheckIcon className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem 
            className={`flex items-center justify-between ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onClick={() => handlePeriodChange("monthly")}
            disabled={isLoading}
          >
            Bulanan
            {selectedPeriod === "monthly" && (
              <CheckIcon className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem 
            className={`flex items-center justify-between ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onClick={() => handlePeriodChange("yearly")}
            disabled={isLoading}
          >
            Tahunan
            {selectedPeriod === "yearly" && (
              <CheckIcon className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 