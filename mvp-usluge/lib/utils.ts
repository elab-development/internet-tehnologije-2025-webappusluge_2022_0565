import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility funkcija za spajanje Tailwind klasa
 * Koristi se za dinamičko stilizovanje komponenti
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatiranje cene u EUR format
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('sr-RS', {
    style: 'currency',
    currency: 'RSD'
  }).format(price);
}

/**
 * Formatiranje datuma
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('sr-RS', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}