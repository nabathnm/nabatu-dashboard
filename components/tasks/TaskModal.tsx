"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trash2, ListTodo, FileText, Tag, CalendarDays, Target } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createTask, updateTask, deleteTask } from "@/lib/services/task-service";
import { getErrorMessage } from "@/hooks/use-task";
import type { CreateTaskInput, Task, TaskCategory } from "@/types/task";
import { format } from "date-fns";
import { TASK_CATEGORY_OPTIONS } from "@/constants/tasks/task-category";

const taskSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi"),
  description: z.string(),
  category: z.enum(["Kuliah", "Organisasi", "Praktikum", "Personal", "Lainnya"]),
  progress: z.number().int().min(0).max(100),
  due_date: z.string(), // format yyyy-MM-dd dari <input type="date">
});

type TaskFormValues = z.infer<typeof taskSchema>;

const EMPTY_VALUES: TaskFormValues = {
  title: "",
  description: "",
  category: "Lainnya",
  progress: 0,
  due_date: "",
};

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  /** Tanggal awal (yyyy-MM-dd) untuk tugas baru, mis. saat sel kalender diklik */
  defaultDueDate?: string | null;
  /** Dipanggil setelah tugas berhasil dibuat/diubah/dihapus, mis. () => refresh({ silent: true }) */
  onSuccess?: () => void | Promise<void>;
}

export default function TaskModal({
  open,
  onOpenChange,
  task,
  defaultDueDate,
  onSuccess,
}: TaskModalProps) {
  const isEditing = !!task;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema) as any,
    defaultValues: EMPTY_VALUES,
  });

  const watchCategory = watch("category");
  const watchProgress = watch("progress");

  useEffect(() => {
    if (!open) return;
    setSubmitError(null);

    if (task) {
      reset({
        title: task.title,
        description: task.description || "",
        category: task.category,
        progress: task.progress,
        due_date: task.due_date ? format(new Date(task.due_date), "yyyy-MM-dd") : "",
      });
    } else {
      reset({ ...EMPTY_VALUES, due_date: defaultDueDate ?? "" });
    }
  }, [task, open, defaultDueDate, reset]);

  const onSubmit = useCallback(
    async (values: TaskFormValues) => {
      setSubmitError(null);

      const payload: CreateTaskInput = {
        title: values.title,
        description: values.description,
        category: values.category,
        progress: values.progress,
        due_date: values.due_date || null,
      };

      try {
        if (isEditing && task) {
          await updateTask(task.id, payload);
        } else {
          await createTask(payload);
        }
        await onSuccess?.();
        onOpenChange(false);
      } catch (err) {
        setSubmitError(getErrorMessage(err));
      }
    },
    [isEditing, task, onSuccess, onOpenChange]
  );

  const handleDelete = useCallback(async () => {
    if (!task) return;
    setIsDeleting(true);
    setSubmitError(null);

    try {
      await deleteTask(task.id);
      setDeleteDialogOpen(false);
      await onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      setDeleteDialogOpen(false);
      setSubmitError(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  }, [task, onSuccess, onOpenChange]);

  const isPending = isSubmitting || isDeleting;

  const progressValue = Number(watchProgress) || 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              <ListTodo className="h-3.5 w-3.5" />
              {isEditing ? "Edit Task" : "New Task"}
            </div>
            <DialogTitle className="text-xl font-bold">
              {isEditing ? "Update Activity" : "Add Activity"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-6 py-5">
            {/* Title */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <ListTodo className="h-3.5 w-3.5" /> Title
              </Label>
              <Input
                placeholder="What needs to be done?"
                className="h-11 rounded-xl border-input bg-muted/40 shadow-sm focus-visible:ring-1 focus-visible:ring-ring/40"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-xs text-rose-500">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> Detail
              </Label>
              <Textarea
                placeholder="Add details, notes, or context..."
                rows={3}
                className="min-h-[90px] resize-none rounded-xl border-input bg-muted/40 shadow-sm focus-visible:ring-1 focus-visible:ring-ring/40"
                {...register("description")}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" /> Category
              </Label>
              <Select value={watchCategory} onValueChange={(val) => setValue("category", val as TaskCategory)}>
                <SelectTrigger className="h-11 rounded-xl border-input bg-muted/40 shadow-sm focus:ring-1 focus:ring-ring/40">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {TASK_CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${opt.dotColor}`} />
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Progress & Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Target className="h-3.5 w-3.5" /> Progress</span>
                  <span className={`font-bold ${progressValue >= 100
                    ? "text-emerald-500"
                    : progressValue >= 60
                      ? "text-blue-500"
                      : "text-slate-500"
                    }`}>
                    {progressValue}%
                  </span>
                </Label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    {...register("progress", { valueAsNumber: true })}
                  />
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${progressValue >= 100
                        ? "bg-emerald-400"
                        : progressValue >= 60
                          ? "bg-blue-400"
                          : "bg-amber-400"
                        }`}
                      style={{ width: `${progressValue}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" /> Tenggat
                </Label>
                <Input
                  type="date"
                  className="h-11 rounded-xl border-input bg-muted/40 shadow-sm focus-visible:ring-1 focus-visible:ring-ring/40 text-sm"
                  {...register("due_date")}
                />
              </div>
            </div>

            {/* Error dari server */}
            {submitError && (
              <p role="alert" className="text-sm text-rose-500">
                {submitError}
              </p>
            )}

            {/* Actions */}
            <DialogFooter className="flex-row justify-between sm:justify-between gap-2 px-6 pb-6 pt-4 border-t border-border/50 bg-muted/10">
              {isEditing && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isPending}
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-rose-400 hover:text-rose-500 hover:bg-rose-50"
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Delete
                </Button>
              )}
              <div className={`flex gap-2 ${!isEditing ? "ml-auto" : ""}`}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                >
                  {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Task"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl border-none p-0 overflow-hidden bg-background">
          <AlertDialogHeader className="px-6 py-5 border-b border-border/50 bg-muted/30">
            <AlertDialogTitle className="text-xl font-bold">Delete Task</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete &quot;{task?.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="px-6 py-4 bg-muted/10">
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault(); // tahan dialog tetap terbuka sampai proses hapus selesai
                handleDelete();
              }}
              className="bg-rose-500 hover:bg-rose-600 border-0"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}