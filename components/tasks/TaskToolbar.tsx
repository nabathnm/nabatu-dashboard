"use client";

import {
  LayoutList,
  CalendarDays,
  Search,
  ChevronLeft,
  ChevronRight,
    Plus,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TaskFilters, TaskCategory } from "@/types/task";
import { categoryOptions } from "@/constants/tasks/category-style";

export type TaskView = "list" | "calendar";

interface TaskToolbarProps {
  view: TaskView;
  onViewChange: (view: TaskView) => void;
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onCreateTask: () => void;
  // Navigasi kalender
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

type StatusValue = "all" | "todo" | "done";

function getStatusValue(isCompleted: boolean | undefined): StatusValue {
  if (isCompleted === undefined) return "all";
  return isCompleted ? "done" : "todo";
}

export default function TaskToolbar({
  view,
  onViewChange,
  filters,
  onFiltersChange,
  searchTerm,
  onSearchChange,
  currentMonth,
  onPrevMonth,
  onNextMonth,
  onToday,
  onCreateTask,
}: TaskToolbarProps) {
  const nextView: TaskView = view === "list" ? "calendar" : "list";
  const NextViewIcon = nextView === "list" ? LayoutList : CalendarDays;
  const nextViewLabel = nextView === "list" ? "List" : "Calendar";

  return (
    <div className="flex items-center gap-4 rounded-full border bg-card p-3">
      {/* View Toggle */}
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => onViewChange(nextView)}
        aria-label={`Switch to ${nextViewLabel} view`}
        title={`Switch to ${nextViewLabel} view`}
        className="h-9 w-9 shrink-0 rounded-full"
      >
        <NextViewIcon className="h-4 w-4" />
      </Button>

      {/* Search */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search tasks..."
          className="h-9 rounded-full pl-9 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      {view === "list" ? (
        <>
          {/* Status */}
          <Select
            value={getStatusValue(filters.is_completed)}
            onValueChange={(value: string | null) =>
              onFiltersChange({
                ...filters,
                is_completed:
                  value === "done"
                    ? true
                    : value === "todo"
                      ? false
                      : undefined,
              })
            }
          >
            <SelectTrigger className="h-9 w-full xl:w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="done">Completed</SelectItem>
            </SelectContent>
          </Select>

          {/* Category */}
          <Select
            value={
              filters.category && filters.category !== "all"
                ? filters.category
                : "all"
            }
            onValueChange={(value: string | null) =>
              onFiltersChange({
                ...filters,
                category:
                  !value || value === "all"
                    ? undefined
                    : (value as TaskCategory),
              })
            }
          >
            <SelectTrigger className="h-9 w-full xl:w-36">
              <SelectValue placeholder="Category" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>

              {categoryOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            onClick={onCreateTask}
            className="h-9 shrink-0 rounded-full"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add task
          </Button>
        </>
      ) : (
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 rounded-full"
            onClick={onToday}
          >
            Hari ini
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full"
            aria-label="Bulan sebelumnya"
            onClick={onPrevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="min-w-32 text-center text-sm font-semibold">
            {format(currentMonth, "MMMM yyyy")}
          </span>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full"
            aria-label="Bulan berikutnya"
            onClick={onNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}