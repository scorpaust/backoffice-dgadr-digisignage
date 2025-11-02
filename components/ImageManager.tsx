import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useImages } from "../hooks/useImages";
import { palette, layout, shadowStyles } from "../constants/theme";
import { ImageItem } from "../constants/Types";
import ImageUploadZone from "./ImageUploadZone";
import ImageCard from "./ImageCard";
import niceAlert from "./ui/Alert";
import NewsletterManager from "./NewsletterManager";

type TabKey = "gallery" | "highlights" | "newsletters";

interface ImageManagerProps {
  compact: boolean;
  onFeedback: (tone: "success" | "error", message: string) => void;
}

const ImageManager: React.FC<ImageManagerProps> = ({ compact, onFeedback }) => {
  const [activeTab, setActiveTab] = useState<TabKey>("gallery");
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);

  // Determinar o caminho da pasta baseado na aba ativa
  const getFolderPath = () => {
    switch (activeTab) {
      case "gallery":
        return "photos";
      case "highlights":
        return "destaques_biblio";
      default:
        return "";
    }
  };

  const folderPath = getFolderPath();
  const { images, loading, uploadImage, deleteImage, updateImageMetadata } =
    useImages(folderPath);

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

  const handleUpdateImageLink = async (image: ImageItem, link: string) => {
    try {
      const success = await updateImageMetadata(image.path, { link });
      if (success) {
        onFeedback("success", "Link atualizado com sucesso.");
      } else {
        onFeedback("error", "Erro ao atualizar link.");
      }
    } catch (error) {
      onFeedback("error", "Erro ao atualizar link.");
    }
  };

  const renderTabContent = () => {
    if (activeTab === "newsletters") {
      return <NewsletterManager compact={compact} onFeedback={onFeedback} />;
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
              <ImageCard
                key={image.id}
                image={image}
                showLinkField={activeTab === "highlights"}
                onDelete={handleDeleteImage}
                onUpdateLink={handleUpdateImageLink}
                isDeleting={deletingImageId === image.id}
              />
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
            onPress={() => setActiveTab(tab.key)}
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
