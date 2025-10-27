import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Aurora Theme Utilities
 * Provides consistent theme color utilities for the Aurora theme
 */

// Theme color variants
export const themeColors = {
  primary: {
    50: "oklch(0.98 0.01 240)",
    100: "oklch(0.96 0.02 240)",
    200: "oklch(0.92 0.03 240)",
    300: "oklch(0.85 0.05 240)",
    400: "oklch(0.75 0.08 260)",
    500: "oklch(0.55 0.15 260)", // Main primary color
    600: "oklch(0.65 0.15 260)",
    700: "oklch(0.45 0.12 260)",
    800: "oklch(0.35 0.10 260)",
    900: "oklch(0.25 0.08 260)",
  },
  success: {
    50: "oklch(0.98 0.02 140)",
    100: "oklch(0.95 0.03 140)",
    200: "oklch(0.90 0.05 140)",
    300: "oklch(0.80 0.08 140)",
    400: "oklch(0.70 0.12 140)",
    500: "oklch(0.60 0.15 140)", // Main success color
    600: "oklch(0.65 0.15 140)",
    700: "oklch(0.50 0.12 140)",
    800: "oklch(0.40 0.10 140)",
    900: "oklch(0.30 0.08 140)",
  },
  warning: {
    50: "oklch(0.99 0.01 70)",
    100: "oklch(0.97 0.02 70)",
    200: "oklch(0.93 0.04 70)",
    300: "oklch(0.87 0.07 70)",
    400: "oklch(0.80 0.11 70)",
    500: "oklch(0.70 0.15 70)", // Main warning color
    600: "oklch(0.75 0.15 70)",
    700: "oklch(0.60 0.12 70)",
    800: "oklch(0.50 0.10 70)",
    900: "oklch(0.40 0.08 70)",
  },
  info: {
    50: "oklch(0.98 0.01 220)",
    100: "oklch(0.95 0.02 220)",
    200: "oklch(0.90 0.04 220)",
    300: "oklch(0.82 0.07 220)",
    400: "oklch(0.75 0.11 220)",
    500: "oklch(0.65 0.15 220)", // Main info color
    600: "oklch(0.70 0.15 220)",
    700: "oklch(0.55 0.12 220)",
    800: "oklch(0.45 0.10 220)",
    900: "oklch(0.35 0.08 220)",
  },
} as const

// Utility function to get theme colors
export function getThemeColor(color: keyof typeof themeColors, shade: keyof typeof themeColors.primary = 500): string {
  return themeColors[color][shade]
}

// Theme-aware class utilities
export const themeClasses = {
  // Semantic colors
  success: "bg-success text-success-foreground border-success/20",
  warning: "bg-warning text-warning-foreground border-warning/20",
  info: "bg-info text-info-foreground border-info/20",
  destructive: "bg-destructive text-destructive-foreground border-destructive/20",

  // Interactive states
  interactive: "hover:bg-accent hover:text-accent-foreground transition-colors",
  focus: "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",

  // Layout
  card: "bg-card text-card-foreground border border-border rounded-lg shadow-soft",
  surface: "bg-background text-foreground",

  // Text utilities
  textGradient: "bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent",
} as const

// Theme validation utility
export function validateThemeColors() {
  const requiredColors = [
    '--background', '--foreground', '--primary', '--primary-foreground',
    '--secondary', '--secondary-foreground', '--muted', '--muted-foreground',
    '--accent', '--accent-foreground', '--destructive', '--destructive-foreground',
    '--border', '--input', '--ring'
  ]

  const missingColors = requiredColors.filter(color =>
    !document.documentElement.style.getPropertyValue(color)
  )

  if (missingColors.length > 0) {
    console.warn('Aurora Theme: Missing CSS custom properties:', missingColors)
    return false
  }

  return true
}
