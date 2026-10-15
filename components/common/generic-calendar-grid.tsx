import React from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addDays,
} from "date-fns";
import { cn } from "@/lib/utils";

export interface GenericCalendarGridProps {
  currentMonth: Date;
  renderDay: (day: Date) => React.ReactNode;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  classNames?: {
    root?: string;
    headerRow?: string;
    headerCell?: string;
    grid?: string;
  };
}

export function GenericCalendarGrid({
  currentMonth,
  renderDay,
  weekStartsOn = 0,
  classNames,
}: GenericCalendarGridProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  
  // Define start and end of the grid
  const startDate = startOfWeek(monthStart, { weekStartsOn });
  const endDate = endOfWeek(monthEnd, { weekStartsOn });

  // Generate days to render
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  // Generate weekday headers
  const weekDays = [];
  let startDateForWeek = startOfWeek(new Date(), { weekStartsOn });
  for (let i = 0; i < 7; i++) {
    weekDays.push(format(addDays(startDateForWeek, i), "EEE"));
  }

  return (
    <div className={cn("flex flex-col w-full", classNames?.root)}>
      {/* Header Row */}
      <div className={cn("grid grid-cols-7 w-full bg-card-foreground", classNames?.headerRow)}>
        {weekDays.map((dayName, idx) => (
          <div key={idx} className={classNames?.headerCell}>
            {dayName}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className={cn("grid grid-cols-7 w-full", classNames?.grid)}>
        {calendarDays.map((day, idx) => (
          <React.Fragment key={idx}>{renderDay(day)}</React.Fragment>
        ))}
      </div>
    </div>
  );
}

