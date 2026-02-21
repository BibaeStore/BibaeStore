import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | number | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export function isRedirectError(error: unknown): boolean {
  if (error instanceof Error && error.message === 'NEXT_REDIRECT') return true;
  if (typeof error !== 'object' || error === null || !('digest' in error)) return false;
  const digest = (error as any).digest;
  return typeof digest === 'string' && digest.startsWith('NEXT_REDIRECT');
}
