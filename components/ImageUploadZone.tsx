import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { palette, layout } from "../constants/theme";

interface ImageUploadZoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const ImageUploadZone: React.FC<ImageUploadZoneProps> = ({
  onFileSelect,
  disabled,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback(
    (e: any) => {
      if (disabled) return;
      e.preventDefault();
      setIsDragOver(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback(
    (e: any) => {
      if (disabled) return;
      e.preventDefault();
      setIsDragOver(false);
    },
    [disabled]
  );

  const handleDrop = useCallback(
    (e: any) => {
      if (disabled) return;
      e.preventDefault();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        onFileSelect(files[0]);
      }
    },
    [disabled, onFileSelect]
  );

  const handleClick = useCallback(() => {
    if (disabled) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/jpg,image/png";
    input.onchange = (event: any) => {
      const file = event.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    };
    input.click();
  }, [disabled, onFileSelect]);

  if (Platform.OS !== "web") {
    return null;
  }

  return (
    <View
      style={[
        styles.uploadZone,
        isDragOver && styles.uploadZoneDragOver,
        disabled && styles.uploadZoneDisabled,
      ]}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <Ionicons
        name="cloud-upload-outline"
        size={48}
        color={disabled ? palette.textSecondary : palette.accent}
      />
      <Text style={[styles.uploadText, disabled && styles.uploadTextDisabled]}>
        {disabled
          ? "Selecione uma pasta primeiro"
          : "Arraste uma imagem aqui ou clique para selecionar"}
      </Text>
      <Text
        style={[styles.uploadSubtext, disabled && styles.uploadTextDisabled]}
      >
        Formatos suportados: JPG, PNG (máx. 5MB)
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  uploadZone: {
    borderWidth: 2,
    borderColor: palette.accent,
    borderStyle: "dashed",
    borderRadius: layout.radius.lg,
    padding: layout.spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    gap: layout.spacing.md,
    minHeight: 200,
    cursor: "pointer",
    backgroundColor: "rgba(79, 70, 229, 0.05)",
  },
  uploadZoneDragOver: {
    borderColor: palette.accentSoft,
    backgroundColor: "rgba(79, 70, 229, 0.15)",
  },
  uploadZoneDisabled: {
    borderColor: palette.textSecondary,
    backgroundColor: "rgba(148, 163, 184, 0.05)",
    cursor: "not-allowed",
  },
  uploadText: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  uploadSubtext: {
    color: palette.textSecondary,
    fontSize: 14,
    textAlign: "center",
  },
  uploadTextDisabled: {
    color: palette.textSecondary,
  },
});

export default ImageUploadZone;
