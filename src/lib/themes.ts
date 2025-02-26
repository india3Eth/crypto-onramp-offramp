export const themeConfig = {
  // Color palette
  colors: {
    // Primary branding colors
    primary: {
      light: "#4299E1", // Light blue
      DEFAULT: "#3182CE", // Blue
      dark: "#2C5282",   // Dark blue
    },
    // Secondary color for accents
    secondary: {
      light: "#9AE6B4",  // Light green
      DEFAULT: "#48BB78", // Green
      dark: "#2F855A",   // Dark green
    },
    // Neutrals
    neutral: {
      50: "#F7FAFC",
      100: "#EDF2F7",
      200: "#E2E8F0",
      300: "#CBD5E0",
      400: "#A0AEC0",
      500: "#718096",
      600: "#4A5568",
      700: "#2D3748",
      800: "#1A202C",
      900: "#171923",
    },
    // Semantic colors
    success: "#38A169",
    warning: "#DD6B20",
    error: "#E53E3E",
    info: "#3182CE",
  },
  
  // Border radius
  radius: {
    sm: "0.125rem",   // 2px
    DEFAULT: "0.25rem", // 4px
    md: "0.375rem",   // 6px
    lg: "0.5rem",     // 8px
    xl: "0.75rem",    // 12px
    full: "9999px",   // Fully rounded (circles/pills)
  },
  
  // Shadows
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },
  
  // Typography
  typography: {
    fontFamily: {
      sans: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
    },
    fontSize: {
      xs: "0.75rem",    // 12px
      sm: "0.875rem",   // 14px
      base: "1rem",     // 16px
      lg: "1.125rem",   // 18px
      xl: "1.25rem",    // 20px
      "2xl": "1.5rem",  // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2.25rem", // 36px
    },
  },
  
  // Spacing scale
  spacing: {
    0: "0",
    1: "0.25rem",     // 4px
    2: "0.5rem",      // 8px
    3: "0.75rem",     // 12px
    4: "1rem",        // 16px
    6: "1.5rem",      // 24px
    8: "2rem",        // 32px
    10: "2.5rem",     // 40px
    12: "3rem",       // 48px
    16: "4rem",       // 64px
    20: "5rem",       // 80px
    24: "6rem",       // 96px
  },
  
  // Transition presets
  transitions: {
    DEFAULT: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
    fast: "100ms cubic-bezier(0.4, 0, 0.2, 1)",
    slow: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
  },
}

// Helper function to get theme values (with type safety)
export function getThemeValue<T extends keyof typeof themeConfig>(
  category: T,
  key?: string
): unknown {
  const section = themeConfig[category] as Record<string, unknown>;
  return key ? section[key] : section;
}

/**
 * Example usage:
 * const primaryColor = getThemeValue('colors', 'primary') as string;
 * const borderRadius = getThemeValue('radius', 'md') as string;
 */