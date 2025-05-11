import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sortArrayByProperties(
  array: Array<{ [key: string]: any }>,
  properties: string[],
) {
  return array.sort((a, b) => {
    for (const property of properties) {
      const aValue = a[property];
      const bValue = b[property];

      if (typeof aValue === "string" && typeof bValue === "string") {
        const cmp = aValue.localeCompare(bValue, undefined, {
          sensitivity: "base",
        });
        if (cmp !== 0) return cmp;
      } else {
        if (aValue < bValue) return -1;
        if (aValue > bValue) return 1;
      }
    }
    return 0;
  });
}
