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

const LOWERCASE_CONTRACT_WORDS = new Set(["of"]);

export function formatContractType(type: string): string {
  return type
    .split("_")
    .map((w) => {
      const lower = w.toLowerCase();
      return LOWERCASE_CONTRACT_WORDS.has(lower) ? lower : lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}
