import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getInitials = (name: string): string =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

export const formatDate = (value?: string | Date | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const getDueLabel = (dueDate?: string | Date | null) => {
  if (!dueDate) return "Due date unavailable";

  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return "Due date unavailable";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const diff = Math.round((due.getTime() - today.getTime()) / 86_400_000);

  if (diff > 1) return `${diff} days left to return`;
  if (diff === 1) return "Due tomorrow";
  if (diff === 0) return "Due today";
  if (diff === -1) return "1 day overdue";
  return `${Math.abs(diff)} days overdue`;
};
