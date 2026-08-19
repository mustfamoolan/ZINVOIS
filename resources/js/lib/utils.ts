import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * تنسيق المبالغ المالية بالدينار العراقي بدون اعشار ومع فوارز ألوف
 * مثال: 1000000 -> 1,000,000
 */
export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') return '0';
  const num = Math.round(Number(amount));
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('en-US').format(num);
}
