
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  className
}) => {
  return (
    <Card className={cn("stat-card", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-white/70">
          {title}
        </CardTitle>
        {icon && <div className="text-volta-accent">{icon}</div>}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-white/70 mt-1">{description}</p>
        )}
        {trend && (
          <div 
            className={cn(
              "flex items-center text-xs mt-2",
              trend.positive 
                ? "text-volta-chart-green" 
                : "text-volta-chart-red"
            )}
          >
            {trend.positive ? 
              <ArrowUpIcon className="h-3 w-3 mr-1" /> : 
              <ArrowDownIcon className="h-3 w-3 mr-1" />
            }
            {Math.abs(trend.value)}%
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
