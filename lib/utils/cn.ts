import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines clsx and tailwind-merge for optimal class name composition.
 *
 * - clsx: Handles conditional class logic (arrays, objects, falsy values)
 * - tailwind-merge: Resolves Tailwind CSS class conflicts intelligently
 *
 * @example
 * cn('px-4 py-2', isActive && 'bg-neonAccent text-black', className)
 * cn('text-sm', 'text-lg') // → 'text-lg' (tailwind-merge resolves conflict)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
