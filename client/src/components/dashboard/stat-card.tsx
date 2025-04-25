import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease" | "neutral" | "status";
  icon: ReactNode;
  bgColor: string;
  textColor: string;
}

export default function StatCard({
  label,
  value,
  change,
  changeType,
  icon,
  bgColor,
  textColor,
}: StatCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case "increase":
        return "text-green-500 dark:text-green-400";
      case "decrease":
        return "text-red-500 dark:text-red-400";
      case "status":
        return "text-green-500 dark:text-green-400";
      default:
        return "text-slate-500 dark:text-slate-400";
    }
  };

  const getChangePrefix = () => {
    switch (changeType) {
      case "increase":
        return "↑ ";
      case "decrease":
        return "↓ ";
      case "status":
        return "● ";
      default:
        return "";
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-5">
          <div className="flex items-center">
            <div className={`flex-shrink-0 ${bgColor} rounded-md p-3`}>
              {icon}
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">{label}</dt>
                <dd>
                  <div className="text-lg font-medium text-slate-900 dark:text-white">{value}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-700 px-5 py-3">
          <div className="text-sm">
            <span className={`font-medium ${getChangeColor()}`}>
              {getChangePrefix()}{change}
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              {changeType === "increase" || changeType === "decrease" 
                ? " from yesterday" 
                : changeType === "status" 
                  ? " All systems operational" 
                  : ""}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
