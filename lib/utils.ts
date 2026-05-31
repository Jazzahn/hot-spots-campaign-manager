import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSP(sp: number): string {
  return sp.toLocaleString() + " SP";
}

export function formatBV(bv: number): string {
  return bv.toLocaleString() + " BV";
}
