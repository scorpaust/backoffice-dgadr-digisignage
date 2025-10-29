import React, { useState, useCallback, useRef, useEffect } from "react";
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
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleDragEnter = useCallback(
    (e: DragEvent) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(true);
    },
    [disabled]
  );

  const handleDragOver = useCallback(
    (e: DragEvent) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();
    },
    [disabled]
  );

  const handleDragLeave = useCallback(
    (e: DragEvent) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();

      // Só remove o highlight se realmente saiu da zona de drop
      const rect = dropZoneRef.current?.getBoundingClientRect();
      if (rect) {
        const { clientX, clientY } = e;
        if (
          clientX < rect.left ||
          clientX > rect.right ||
          clientY < rect.top ||
          clientY > rect.bottom
        ) {
          setIsDragOver(false);
        }
      }
    },
    [disabled]
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        const file = files[0];
        // Verificar se é uma imagem
        if (file.type.match(/^image\/(jpeg|jpg|png)$/)) {
          onFileSelect(file);
        }
      }
    },
    [disabled, onFileSelect]
  );

  useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (!dropZone || Platform.OS !== "web") return;

    dropZone.addEventListener("dragenter", handleDragEnter);
    dropZone.addEventListener("dragover", handleDragOver);
    dropZone.addEventListener("dragleave", handleDragLeave);
    dropZone.addEventListener("drop", handleDrop);

    return () => {
      dropZone.removeEventListener("dragenter", handleDragEnter);
      dropZone.removeEventListener("dragover", handleDragOver);
      dropZone.removeEventListener("dragleave", handleDragLeave);
      dropZone.removeEventListener("drop", handleDrop);
    };
  }, [handleDragEnter, handleDragOver, handleDragLeave, handleDrop]);

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
    <div
      ref={dropZoneRef}
      style={{
        ...styles.uploadZone,
        ...(isDragOver && styles.uploadZoneDragOver),
        ...(disabled && styles.uploadZoneDisabled),
      }}
      onClick={handleClick}
    >
      <View style={styles.uploadContent}>
        <Ionicons
          name="cloud-upload-outline"
          size={48}
          color={disabled ? palette.textSecondary : palette.accent}
        />
        <Text
          style={[styles.uploadText, disabled && styles.uploadTextDisabled]}
        >
          {disabled
            ? "Selecione uma pasta primeiro"
            : isDragOver
            ? "Solte a imagem aqui"
            : "Arraste uma imagem aqui ou clique para selecionar"}
        </Text>
        <Text
          style={[styles.uploadSubtext, disabled && styles.uploadTextDisabled]}
        >
          Formatos suportados: JPG, PNG (máx. 5MB)
        </Text>
      </View>
    </div>
  );
};

const styles = StyleSheet.create({
  uploadZone: {
    border: `2px dashed ${palette.accent}`,
    borderRadius: layout.radius.lg,
    padding: layout.spacing.xl,
    minHeight: 200,
    cursor: "pointer",
    backgroundColor: "rgba(79, 70, 229, 0.05)",
    transition: "all 0.2s ease-in-out",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadZoneDragOver: {
    borderColor: palette.accentSoft,
    backgroundColor: "rgba(79, 70, 229, 0.15)",
    transform: "scale(1.02)",
  },
  uploadZoneDisabled: {
    borderColor: palette.textSecondary,
    backgroundColor: "rgba(148, 163, 184, 0.05)",
    cursor: "not-allowed",
  },
  uploadContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: layout.spacing.md,
    pointerEvents: "none", // Evita interferência nos eventos de drag
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
