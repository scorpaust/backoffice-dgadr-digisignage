import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { palette, layout, shadowStyles } from "@/constants/theme";

interface LoadingOverlayProps {
  message: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message }) => {
  return (
    <View style={styles.rootContainer}>
      <View style={styles.panel}>
        <ActivityIndicator size="large" color={palette.accent} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
};

export default LoadingOverlay;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(5, 8, 22, 0.8)",
  },
  panel: {
    backgroundColor: palette.surface,
    borderRadius: layout.radius.lg,
    paddingVertical: layout.spacing.lg,
    paddingHorizontal: layout.spacing.xl,
    alignItems: "center",
    gap: layout.spacing.sm,
    ...shadowStyles.medium,
  },
  message: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
});
