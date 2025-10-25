import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useImages } from "../hooks/useImages";
import { useNewsletters } from "../hooks/useNewsletters";
import { palette, layout, shadowStyles } from "../constants/theme";
import { ImageItem } from "../constants/Types";
import ImageUploadZone from "./ImageUploadZone";
import niceAlert from "./ui/Alert";

type TabKey = "gallery" | "highlights" | "newsletters";

interface ImageManagerProps {
  compact: boolean;
  onFeedback: (tone: "success" | "error", message: string) => void;
}

const ImageManager: React.FC<ImageManagerProps> = ({ compact, onFeedback }) => {
  const [activeTab, setActiveTab] = useState<TabKey>("gallery");
  const [selectedNewsletter, setSelectedNewsletter] = useState<string | null>(
    null
  );
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);

  const { newsletters } = useNewsletters();

  // Determinar o caminho da pasta baseado na aba ativa
  const getFolderPath = () => {
    switch (activeTab) {
      case "gallery":
        return "photos";
      case "highlights":
        return "destaques_biblio";
      case "newsletters":
        return selectedNewsletter ? `newsletters/${selectedNewsletter}` : "";
      default:
        return "";
    }
  };

  const folderPath = getFolderPath();
  const { images, loading, uploadImage, deleteImage } = useImages(folderPath);

  const tabs = [
    { key: "gallery" as TabKey, label: "Galeria", icon: "images-outline" },
    {
      key: "highlights" as TabKey,
      label: "Destaques Biblioteca",
      icon: "library-outline",
    },
    {
      key: "newsletters" as TabKey,
      label: "Newsletters",
      icon: "mail-outline",
    },
  ];

  const handleFileSelect = async (file: File) => {
    // Validar tipo de arquivo
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      onFeedback("error", "Apenas imagens JPG e PNG são permitidas.");
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      onFeedback("error", "A imagem deve ter no máximo 5MB.");
      return;
    }

    const fileName = `${Date.now()}_${file.name}`;
    const success = await uploadImage(file, fileName);

    if (success) {
      onFeedback("success", "Imagem carregada com sucesso.");
    } else {
      onFeedback("error", "Erro ao carregar imagem.");
    }
  };

  const handleDeleteImage = (image: ImageItem) => {
    if (deletingImageId) {
      return;
    }

    niceAlert(
      "Apagar Imagem",
      `Tem certeza que deseja apagar "${image.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apagar",
          style: "destructive",
          onPress: async () => {
            setDeletingImageId(image.id);
            try {
              const success = await deleteImage(image.path);
              if (success) {
                onFeedback("success", "Imagem apagada com sucesso.");
              } else {
                onFeedback("error", "Erro ao apagar imagem.");
              }
            } catch (error) {
              onFeedback("error", "Erro ao apagar imagem.");
            } finally {
              setDeletingImageId(null);
            }
          },
        },
      ]
    );
  };

  const renderTabContent = () => {
    if (activeTab === "newsletters" && !selectedNewsletter) {
      return (
        <View style={styles.selectionContainer}>
          <Text style={styles.selectionTitle}>Selecione uma Newsletter</Text>
          {newsletters.map((newsletter) => (
            <TouchableOpacity
              key={newsletter.id}
              style={styles.selectionItem}
              onPress={() => setSelectedNewsletter(newsletter.name)}
            >
              <Ionicons name="mail-outline" size={20} color={palette.accent} />
              <Text style={styles.selectionText}>{newsletter.displayName}</Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    return (
      <View style={styles.imagesContainer}>
        <View style={styles.imagesHeader}>
          <Text style={styles.imagesTitle}>
            {loading ? "A carregar..." : `${images.length} imagens`}
          </Text>
        </View>

        <ImageUploadZone
          onFileSelect={handleFileSelect}
          disabled={!folderPath}
        />

        <ScrollView
          style={styles.imagesList}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.imagesGrid}>
            {images.map((image) => (
              <View key={image.id} style={styles.imageCard}>
                <Image
                  source={{ uri: image.url }}
                  style={styles.imagePreview}
                />
                <View style={styles.imageInfo}>
                  <Text style={styles.imageName} numberOfLines={1}>
                    {image.name}
                  </Text>
                  <Text style={styles.imageSize}>
                    {(image.size / 1024).toFixed(1)} KB
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.deleteButton,
                    deletingImageId === image.id && styles.deleteButtonLoading,
                  ]}
                  onPress={() => handleDeleteImage(image)}
                  activeOpacity={0.7}
                  disabled={deletingImageId === image.id}
                >
                  <Ionicons
                    name={
                      deletingImageId === image.id
                        ? "hourglass-outline"
                        : "trash-outline"
                    }
                    size={16}
                    color={palette.danger}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestão de Imagens</Text>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.tabActive,
              compact && styles.tabCompact,
            ]}
            onPress={() => {
              setActiveTab(tab.key);
              setSelectedNewsletter(null);
            }}
          >
            <Ionicons
              name={tab.icon as any}
              size={18}
              color={
                activeTab === tab.key
                  ? palette.textPrimary
                  : palette.textSecondary
              }
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Breadcrumb */}
      {selectedNewsletter && (
        <View style={styles.breadcrumb}>
          <TouchableOpacity
            onPress={() => {
              setSelectedNewsletter(null);
            }}
          >
            <Text style={styles.breadcrumbLink}>Newsletters</Text>
          </TouchableOpacity>
          <Text style={styles.breadcrumbSeparator}> / </Text>
          <Text style={styles.breadcrumbCurrent}>{selectedNewsletter}</Text>
        </View>
      )}

      {/* Content */}
      {renderTabContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.surfaceElevated,
    borderRadius: layout.radius.lg,
    padding: layout.spacing.lg,
    gap: layout.spacing.lg,
    width: "100%",
    ...shadowStyles.soft,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: palette.textPrimary,
  },
  tabsContainer: {
    flexDirection: "row",
    gap: layout.spacing.sm,
    flexWrap: "wrap",
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.surface,
    borderRadius: layout.radius.md,
    paddingVertical: layout.spacing.sm,
    paddingHorizontal: layout.spacing.md,
    borderWidth: 1,
    borderColor: "transparent",
    gap: layout.spacing.xs,
  },
  tabActive: {
    borderColor: palette.accent,
    backgroundColor: "rgba(79, 70, 229, 0.25)",
  },
  tabCompact: {
    flex: 1,
    minWidth: 120,
  },
  tabText: {
    color: palette.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  tabTextActive: {
    color: palette.textPrimary,
  },
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: layout.spacing.sm,
  },
  breadcrumbLink: {
    color: palette.accent,
    fontSize: 14,
  },
  breadcrumbSeparator: {
    color: palette.textSecondary,
    fontSize: 14,
  },
  breadcrumbCurrent: {
    color: palette.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  selectionContainer: {
    gap: layout.spacing.md,
  },
  selectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: palette.textPrimary,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.accent,
    borderRadius: layout.radius.md,
    paddingVertical: layout.spacing.sm,
    paddingHorizontal: layout.spacing.md,
    gap: layout.spacing.xs,
  },
  addButtonText: {
    color: palette.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  selectionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.surface,
    borderRadius: layout.radius.md,
    padding: layout.spacing.md,
    gap: layout.spacing.sm,
  },
  selectionText: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: "500",
  },

  imagesContainer: {
    flex: 1,
  },
  imagesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: layout.spacing.md,
  },
  imagesTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: palette.textPrimary,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.accent,
    borderRadius: layout.radius.md,
    paddingVertical: layout.spacing.sm,
    paddingHorizontal: layout.spacing.md,
    gap: layout.spacing.xs,
  },
  uploadButtonDisabled: {
    opacity: 0.5,
  },
  uploadButtonText: {
    color: palette.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  imagesList: {
    maxHeight: 400,
  },
  imagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: layout.spacing.md,
  },
  imageCard: {
    width: 150,
    backgroundColor: palette.surface,
    borderRadius: layout.radius.md,
    padding: layout.spacing.sm,
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: 100,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: palette.surface,
    borderRadius: layout.radius.lg,
    padding: layout.spacing.xl,
    width: "90%",
    maxWidth: 400,
    gap: layout.spacing.md,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: palette.textPrimary,
    textAlign: "center",
  },
  modalInput: {
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.25)",
    borderRadius: layout.radius.md,
    color: palette.textPrimary,
    paddingHorizontal: layout.spacing.md,
    paddingVertical: 12,
    fontSize: 15,
  },
  modalButtons: {
    flexDirection: "row",
    gap: layout.spacing.sm,
  },
  modalButton: {
    flex: 1,
    backgroundColor: palette.accent,
    borderRadius: layout.radius.md,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalButtonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: palette.accent,
  },
  modalButtonText: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  modalButtonTextSecondary: {
    color: palette.accent,
  },
});

export default ImageManager;
