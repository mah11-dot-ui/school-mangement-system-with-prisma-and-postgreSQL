"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: {
    value: number;
    label: string;
  };
  color?: "blue" | "green" | "yellow" | "red" | "purple" | "orange";
  index?: number;
}

const colorMap = {
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950",
    icon: "bg-blue-500",
    text: "text-blue-600 dark:text-blue-400",
  },
  green: {
    bg: "bg-green-50 dark:bg-green-950",
    icon: "bg-green-500",
    text: "text-green-600 dark:text-green-400",
  },
  yellow: {
    bg: "bg-yellow-50 dark:bg-yellow-950",
    icon: "bg-yellow-500",
    text: "text-yellow-600 dark:text-yellow-400",
  },
  red: {
    bg: "bg-red-50 dark:bg-red-950",
    icon: "bg-red-500",
    text: "text-red-600 dark:text-red-400",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-950",
    icon: "bg-purple-500",
    text: "text-purple-600 dark:text-purple-400",
  },
  orange: {
    bg: "bg-orange-50 dark:bg-orange-950",
    icon: "bg-orange-500",
    text: "text-orange-600 dark:text-orange-400",
  },
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "blue",
  index = 0,
}: StatsCardProps) {
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold tracking-tight">{value}</p>
              {trend && (
                <div className="flex items-center gap-1 text-xs">
                  {trend.value >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span
                    className={cn(
                      "font-medium",
                      trend.value >= 0 ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {trend.value >= 0 ? "+" : ""}
                    {trend.value}%
                  </span>
                  <span className="text-muted-foreground">{trend.label}</span>
                </div>
              )}
            </div>
            <div className={cn("p-3 rounded-xl", colors.bg)}>
              <Icon className={cn("h-6 w-6", colors.text)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
