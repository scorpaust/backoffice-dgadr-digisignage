import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { palette, layout } from "../constants/theme";
import { ImageItem } from "../constants/Types";

function normalizeBibliotecaLink(url: string): string {
  const trimmed = url.trim();
  if (!trimmed.includes("biblioteca.dgadr.pt")) return trimmed;
  const match = trimmed.match(/[?&]biblionumber=([^&#?]+)/);
  if (match) {
    return `https://biblioteca.dgadr.pt/cgi-bin/koha/opac-detail.pl?biblionumber=${match[1]}`;
  }
  return trimmed;
}

interface ImageCardProps {
  image: ImageItem;
  showLinkField?: boolean;
  onDelete: (image: ImageItem) => void;
  onUpdateLink?: (image: ImageItem, link: string) => void;
  isDeleting?: boolean;
  isOld?: boolean;
}

const ImageCard: React.FC<ImageCardProps> = ({
  image,
  showLinkField = false,
  onDelete,
  onUpdateLink,
  isDeleting = false,
  isOld = false,
}) => {
  const [linkValue, setLinkValue] = useState(image.link || "");
  const [isEditingLink, setIsEditingLink] = useState(false);

  useEffect(() => {
    if (!isEditingLink) {
      setLinkValue(image.link || "");
    }
  }, [image.link]);

  const handleSaveLink = () => {
    const normalized = normalizeBibliotecaLink(linkValue);
    setLinkValue(normalized);
    if (onUpdateLink) {
      onUpdateLink(image, normalized);
    }
    setIsEditingLink(false);
  };

  const handleCancelLink = () => {
    setLinkValue(image.link || "");
    setIsEditingLink(false);
  };

  return (
    <View style={[styles.imageCard, isOld && styles.imageCardOld]}>
      <Image source={{ uri: image.url }} style={styles.imagePreview} />
      {isOld && (
        <View style={styles.oldOverlay}>
          <Ionicons name="warning-outline" size={30} color="#fff" />
          <Text style={styles.oldOverlayText}>Capa antiga</Text>
          <Text style={styles.oldOverlaySubText}>a remover</Text>
        </View>
      )}

      <View style={styles.imageInfo}>
        <Text style={styles.imageName} numberOfLines={1}>
          {image.name}
        </Text>
        <Text style={styles.imageSize}>
          {(image.size / 1024).toFixed(1)} KB
        </Text>
      </View>

      {showLinkField && (
        <View style={styles.linkSection}>
          <Text style={styles.linkLabel}>Link:</Text>
          {isEditingLink ? (
            <View style={styles.linkEditContainer}>
              <TextInput
                style={styles.linkInput}
                value={linkValue}
                onChangeText={setLinkValue}
                placeholder="https://exemplo.com"
                placeholderTextColor={palette.textSecondary}
                autoFocus
              />
              <View style={styles.linkButtons}>
                <TouchableOpacity
                  style={[styles.linkButton, styles.linkButtonSave]}
                  onPress={handleSaveLink}
                >
                  <Ionicons
                    name="checkmark"
                    size={14}
                    color={palette.textPrimary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.linkButton, styles.linkButtonCancel]}
                  onPress={handleCancelLink}
                >
                  <Ionicons
                    name="close"
                    size={14}
                    color={palette.textPrimary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.linkDisplay}
              onPress={() => setIsEditingLink(true)}
            >
              <Text style={styles.linkText} numberOfLines={1}>
                {linkValue || "Clique para adicionar link"}
              </Text>
              <Ionicons name="pencil" size={14} color={palette.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      )}

      <TouchableOpacity
        style={[styles.deleteButton, isDeleting && styles.deleteButtonLoading]}
        onPress={() => onDelete(image)}
        activeOpacity={0.7}
        disabled={isDeleting}
      >
        <Ionicons
          name={isDeleting ? "hourglass-outline" : "trash-outline"}
          size={16}
          color={palette.danger}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  imageCard: {
    width: 200,
    backgroundColor: palette.surface,
    borderRadius: layout.radius.md,
    padding: layout.spacing.sm,
    position: "relative",
  },
  imageCardOld: {
    borderWidth: 1.5,
    borderColor: "rgba(239, 68, 68, 0.7)",
    backgroundColor: "rgba(239, 68, 68, 0.06)",
  },
  oldOverlay: {
    position: "absolute",
    top: layout.spacing.sm,
    left: layout.spacing.sm,
    right: layout.spacing.sm,
    height: 120,
    backgroundColor: "rgba(180, 20, 20, 0.62)",
    borderRadius: layout.radius.sm,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    pointerEvents: "none" as any,
    zIndex: 1,
  },
  oldOverlayText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  oldOverlaySubText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
  },
  imagePreview: {
    width: "100%",
    height: 120,
    borderRadius: layout.radius.sm,
    backgroundColor: palette.surfaceElevated,
  },
  imageInfo: {
    marginTop: layout.spacing.sm,
  },
  imageName: {
    color: palette.textPrimary,
    fontSize: 12,
    fontWeight: "500",
  },
  imageSize: {
    color: palette.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  linkSection: {
    marginTop: layout.spacing.sm,
    gap: layout.spacing.xs,
  },
  linkLabel: {
    color: palette.textPrimary,
    fontSize: 12,
    fontWeight: "600",
  },
  linkDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: palette.surfaceElevated,
    borderRadius: layout.radius.sm,
    paddingHorizontal: layout.spacing.sm,
    paddingVertical: layout.spacing.xs,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.25)",
  },
  linkText: {
    color: palette.textSecondary,
    fontSize: 11,
    flex: 1,
    marginRight: layout.spacing.xs,
  },
  linkEditContainer: {
    gap: layout.spacing.xs,
  },
  linkInput: {
    backgroundColor: palette.surfaceElevated,
    borderWidth: 1,
    borderColor: palette.accent,
    borderRadius: layout.radius.sm,
    color: palette.textPrimary,
    paddingHorizontal: layout.spacing.sm,
    paddingVertical: layout.spacing.xs,
    fontSize: 11,
  },
  linkButtons: {
    flexDirection: "row",
    gap: layout.spacing.xs,
  },
  linkButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: layout.spacing.xs,
    borderRadius: layout.radius.sm,
  },
  linkButtonSave: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.5)",
  },
  linkButtonCancel: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.5)",
  },
  deleteButton: {
    position: "absolute",
    top: layout.spacing.sm,
    right: layout.spacing.sm,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 12,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.5)",
  },
  deleteButtonLoading: {
    opacity: 0.6,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
});

export default ImageCard;
