export const palette = {
  background: "#050816",
  surface: "#0f172a",
  surfaceElevated: "#111c36",
  accent: "#4f46e5",
  accentSoft: "#6366f1",
  textPrimary: "#f8fafc",
  textSecondary: "#cbd5f5",
  border: "rgba(99, 102, 241, 0.25)",
  success: "#22c55e",
  danger: "#ef4444",
};

export const layout = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    sm: 8,
    md: 14,
    lg: 24,
  },
};

type ShadowLevel = "soft" | "medium";

export const shadowStyles: Record<ShadowLevel, object> = {
  soft: {
    shadowColor: "#1f2937",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
    elevation: 12,
  },
};
