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

const IN_GAME_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function formatInGameDate(
  currentMonth: number,
  startYear: number,
  startMonth: number
): string {
  const totalIndex = (startMonth - 1) + (currentMonth - 1);
  const year = startYear + Math.floor(totalIndex / 12);
  const month = IN_GAME_MONTHS[totalIndex % 12];
  return `${month} ${year}`;
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
