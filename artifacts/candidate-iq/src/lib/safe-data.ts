import React from "react";

/**
 * Safely render an array with fallback
 */
export function SafeArray<T>({
  data,
  render,
  empty,
  fallback = [],
}: {
  data: T[] | null | undefined;
  render: (items: T[], isEmpty: boolean) => React.ReactNode;
  empty?: React.ReactNode;
  fallback?: T[];
}): React.ReactNode {
  const items = Array.isArray(data) ? data : fallback;
  const isEmpty = items.length === 0;

  if (isEmpty && empty) {
    return empty;
  }

  return render(items, isEmpty);
}

/**
 * Safely access nested API response data with defaults
 */
export function useApiData<T>(
  data: T | null | undefined,
  defaultValue: T
): T {
  return data ?? defaultValue;
}

/**
 * Type guard: ensure value is an array
 */
export function ensureArray<T>(value: T[] | T | null | undefined): T[] {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  return [value];
}

/**
 * Type guard: ensure value is a string
 */
export function ensureString(
  value: string | null | undefined,
  fallback = ""
): string {
  return typeof value === "string" ? value : fallback;
}

/**
 * Type guard: ensure value is a number
 */
export function ensureNumber(
  value: number | null | undefined,
  fallback = 0
): number {
  return typeof value === "number" ? value : fallback;
}
