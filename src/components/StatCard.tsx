import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  percentage?: number;
  icon: LucideIcon;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, percentage, icon: Icon }) => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-zinc-400 text-sm font-medium">{label}</span>
        <Icon className="w-4 h-4 text-zinc-500" />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight">{value}</span>
        {percentage !== undefined && (
          <span className="text-xs text-zinc-500">{percentage.toFixed(1)}%</span>
        )}
      </div>
      {percentage !== undefined && (
        <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
          <div
            className="bg-blue-500 h-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
};
