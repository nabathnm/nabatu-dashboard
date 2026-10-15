"use client";

import { Skeleton } from "@/components/ui/skeleton";
import type { TaskStats as TaskStatsData } from "@/types/task";
import { taskStatStyles } from "@/constants/tasks/task-stat-styles";

interface TaskStatsProps {
  stats: TaskStatsData;
  isLoading: boolean;
}

export default function TaskStats({ stats, isLoading }: TaskStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  const { total, inProgress, completed, overdue } = stats;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const statValues = [total, inProgress, completed, overdue, `${completionRate}%`];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {taskStatStyles.map((item, index) => (
        <div
          key={item.label}
          className={`rounded-xl shadow-sm border border-card-border border-t-2 p-4 duration-200 `}
          style={{
            background:
              "linear-gradient(145deg, #394352 6.17%, #343C49 93.83%)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium ">{item.label}</p>
            {/* <div
              className={`w-8 h-8 rounded-xl ${item.iconBg} flex items-center justify-center`}
            >
              <item.icon className={`h-4 w-4 ${item.iconColor}`} />
            </div> */}
          </div>
          <p className="text-2xl font-bold tracking-tight">
            {statValues[index]}
          </p>
        </div>
      ))}
    </div>
  );
}