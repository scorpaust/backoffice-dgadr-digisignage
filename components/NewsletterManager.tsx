import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNewsletters } from "../hooks/useNewsletters";
import { useImages } from "../hooks/useImages";
import { palette, layout, shadowStyles } from "../constants/theme";
import { Newsletter, NewsletterIssue } from "../constants/Types";
import niceAlert from "./ui/Alert";

interface NewsletterManagerProps {
  compact: boolean;
  onFeedback: (tone: "success" | "error", message: string) => void;
}

const NewsletterManager: React.FC<NewsletterManagerProps> = ({
  compact,
  onFeedback,
}) => {
  const [selectedNewsletter, setSelectedNewsletter] =
    useState<Newsletter | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<NewsletterIssue | null>(
    null
  );
  const [showNewsletterModal, setShowNewsletterModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [editingNewsletter, setEditingNewsletter] = useState<Newsletter | null>(
    null
  );
  const [editingIssue, setEditingIssue] = useState<NewsletterIssue | null>(
    null
  );
  const [uploadingImage, setUploadingImage] = useState(false);

  // Newsletter form
  const [newsletterForm, setNewsletterForm] = useState({
    name: "",
    displayName: "",
    color: "#3F51B5",
  });

  // Issue form
  const [issueForm, setIssueForm] = useState({
    title: "",
    description: "",
    publishedAt: "",
    url: "",
    coverImagePath: "",
  });

  const {
    newsletters,
    loading,
    addNewsletter,
    updateNewsletter,
    deleteNewsletter,
    addIssue,
    updateIssue,
    deleteIssue,
  } = useNewsletters();

  const folderPath = selectedNewsletter
    ? `newsletters/${selectedNewsletter.name}`
    : "";
  const { images, uploadImage, deleteImage } = useImages(folderPath);

  const handleImageUploadForIssue = async (file: File) => {
    if (!selectedNewsletter) {
      onFeedback("error", "Selecione uma newsletter primeiro.");
      return;
    }

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

    setUploadingImage(true);

    try {
      const fileName = `${selectedNewsletter.name}_${Date.now()}_${file.name}`;
      const success = await uploadImage(file, fileName);

      if (success) {
        // Construir o caminho da imagem
        const imagePath = `newsletters/${selectedNewsletter.name}/${fileName}`;

        // Atualizar o formulário com o caminho da imagem
        setIssueForm((prev) => ({ ...prev, coverImagePath: imagePath }));

        onFeedback(
          "success",
          "Imagem carregada e caminho preenchido automaticamente."
        );
      } else {
        onFeedback("error", "Erro ao carregar imagem.");
      }
    } catch (error) {
      onFeedback("error", "Erro ao carregar imagem.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddNewsletter = () => {
    setEditingNewsletter(null);
    setNewsletterForm({ name: "", displayName: "", color: "#3F51B5" });
    setShowNewsletterModal(true);
  };

  const handleEditNewsletter = (newsletter: Newsletter) => {
    setEditingNewsletter(newsletter);
    setNewsletterForm({
      name: newsletter.name,
      displayName: newsletter.displayName,
      color: newsletter.color,
    });
    setShowNewsletterModal(true);
  };

  const handleSaveNewsletter = async () => {
    if (!newsletterForm.name.trim() || !newsletterForm.displayName.trim()) {
      onFeedback("error", "Nome e nome de exibição são obrigatórios.");
      return;
    }

    const success = editingNewsletter
      ? await updateNewsletter(
          editingNewsletter.id,
          newsletterForm.displayName,
          newsletterForm.color
        )
      : await addNewsletter(
          newsletterForm.name.trim(),
          newsletterForm.displayName.trim(),
          newsletterForm.color
        );

    if (success) {
      onFeedback(
        "success",
        editingNewsletter ? "Newsletter atualizada." : "Newsletter criada."
      );
      setShowNewsletterModal(false);
    } else {
      onFeedback("error", "Erro ao salvar newsletter.");
    }
  };

  const handleDeleteNewsletter = (newsletter: Newsletter) => {
    niceAlert(
      "Apagar Newsletter",
      `Tem certeza que deseja apagar "${newsletter.displayName}"? Todos os issues serão perdidos.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apagar",
          style: "destructive",
          onPress: async () => {
            const success = await deleteNewsletter(newsletter.id);
            if (success) {
              onFeedback("success", "Newsletter apagada.");
              if (selectedNewsletter?.id === newsletter.id) {
                setSelectedNewsletter(null);
              }
            } else {
              onFeedback("error", "Erro ao apagar newsletter.");
            }
          },
        },
      ]
    );
  };

  const handleAddIssue = () => {
    if (!selectedNewsletter) return;

    setEditingIssue(null);
    setIssueForm({
      title: "",
      description: "",
      publishedAt: "",
      url: "",
      coverImagePath: "",
    });
    setShowIssueModal(true);
  };

  const handleEditIssue = (issue: NewsletterIssue) => {
    setEditingIssue(issue);
    setIssueForm({
      title: issue.title,
      description: issue.description,
      publishedAt: issue.publishedAt,
      url: issue.url,
      coverImagePath: issue.coverImagePath,
    });
    setShowIssueModal(true);
  };

  const handleSaveIssue = async () => {
    if (
      !selectedNewsletter ||
      !issueForm.title.trim() ||
      !issueForm.publishedAt.trim()
    ) {
      onFeedback("error", "Título e data de publicação são obrigatórios.");
      return;
    }

    const success = editingIssue
      ? await updateIssue(selectedNewsletter.id, editingIssue.id, issueForm)
      : await addIssue(selectedNewsletter.id, issueForm);

    if (success) {
      onFeedback(
        "success",
        editingIssue ? "Issue atualizado." : "Issue criado."
      );
      setShowIssueModal(false);
    } else {
      onFeedback("error", "Erro ao salvar issue.");
    }
  };

  const handleDeleteIssue = (issue: NewsletterIssue) => {
    if (!selectedNewsletter) return;

    niceAlert(
      "Apagar Issue",
      `Tem certeza que deseja apagar "${issue.title}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apagar",
          style: "destructive",
          onPress: async () => {
            const success = await deleteIssue(selectedNewsletter.id, issue.id);
            if (success) {
              onFeedback("success", "Issue apagado.");
            } else {
              onFeedback("error", "Erro ao apagar issue.");
            }
          },
        },
      ]
    );
  };

  if (!selectedNewsletter) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Newsletters</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddNewsletter}
          >
            <Ionicons name="add" size={20} color={palette.textPrimary} />
            <Text style={styles.addButtonText}>Nova Newsletter</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <Text style={styles.loadingText}>A carregar newsletters...</Text>
        ) : (
          <ScrollView style={styles.newslettersList}>
            {newsletters.map((newsletter) => (
              <View key={newsletter.id} style={styles.newsletterCard}>
                <View style={styles.newsletterHeader}>
                  <View style={styles.newsletterInfo}>
                    <View
                      style={[
                        styles.colorIndicator,
                        { backgroundColor: newsletter.color },
                      ]}
                    />
                    <View>
                      <Text style={styles.newsletterTitle}>
                        {newsletter.displayName}
                      </Text>
                      <Text style={styles.newsletterSubtitle}>
                        {Object.keys(newsletter.issues || {}).length} issues
                      </Text>
                    </View>
                  </View>
                  <View style={styles.newsletterActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleEditNewsletter(newsletter)}
                    >
                      <Ionicons
                        name="pencil-outline"
                        size={16}
                        color={palette.accent}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeleteNewsletter(newsletter)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color={palette.danger}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => setSelectedNewsletter(newsletter)}
                >
                  <Text style={styles.selectButtonText}>
                    Gerir Issues e Imagens
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={palette.accent}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Newsletter Modal */}
        <Modal
          visible={showNewsletterModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowNewsletterModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {editingNewsletter ? "Editar Newsletter" : "Nova Newsletter"}
              </Text>

              <TextInput
                style={styles.modalInput}
                placeholder="Nome (ex: raiz-digital)"
                placeholderTextColor="rgba(148, 163, 184, 0.6)"
                value={newsletterForm.name}
                onChangeText={(value) =>
                  setNewsletterForm((prev) => ({ ...prev, name: value }))
                }
                editable={!editingNewsletter}
              />

              <TextInput
                style={styles.modalInput}
                placeholder="Nome de exibição"
                placeholderTextColor="rgba(148, 163, 184, 0.6)"
                value={newsletterForm.displayName}
                onChangeText={(value) =>
                  setNewsletterForm((prev) => ({ ...prev, displayName: value }))
                }
              />

              <TextInput
                style={styles.modalInput}
                placeholder="Cor (ex: #3F51B5)"
                placeholderTextColor="rgba(148, 163, 184, 0.6)"
                value={newsletterForm.color}
                onChangeText={(value) =>
                  setNewsletterForm((prev) => ({ ...prev, color: value }))
                }
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleSaveNewsletter}
                >
                  <Text style={styles.modalButtonText}>Salvar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonSecondary]}
                  onPress={() => setShowNewsletterModal(false)}
                >
                  <Text
                    style={[
                      styles.modalButtonText,
                      styles.modalButtonTextSecondary,
                    ]}
                  >
                    Cancelar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  const issues = Object.values(selectedNewsletter.issues || {}).sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setSelectedNewsletter(null)}
        >
          <Ionicons name="arrow-back" size={20} color={palette.accent} />
          <Text style={styles.backButtonText}>Newsletters</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{selectedNewsletter.displayName}</Text>
      </View>

      {/* Issues Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Issues</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddIssue}>
            <Ionicons name="add" size={20} color={palette.textPrimary} />
            <Text style={styles.addButtonText}>Novo Issue</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.issuesList}>
          {issues.map((issue) => (
            <View key={issue.id} style={styles.issueCard}>
              <View style={styles.issueHeader}>
                <View style={styles.issueMainInfo}>
                  <Text style={styles.issueTitle}>{issue.title}</Text>
                  <Text style={styles.issueDescription} numberOfLines={2}>
                    {issue.description}
                  </Text>
                  <Text style={styles.issueDate}>
                    Publicado: {issue.publishedAt}
                  </Text>
                  {issue.url && (
                    <Text style={styles.issueUrl}>URL: {issue.url}</Text>
                  )}
                </View>
                <View style={styles.issueActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEditIssue(issue)}
                  >
                    <Ionicons
                      name="pencil-outline"
                      size={16}
                      color={palette.accent}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteIssue(issue)}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={16}
                      color={palette.danger}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              {issue.coverImagePath && (
                <View style={styles.coverImageSection}>
                  <Text style={styles.coverImageLabel}>Imagem de Capa:</Text>
                  <View style={styles.coverImageContainer}>
                    <Image
                      source={{
                        uri: `https://firebasestorage.googleapis.com/v0/b/dgadr-digisignage-app.appspot.com/o/${encodeURIComponent(
                          issue.coverImagePath
                        )}?alt=media`,
                      }}
                      style={styles.coverImage}
                      onError={() =>
                        console.log(
                          "Erro ao carregar imagem:",
                          issue.coverImagePath
                        )
                      }
                    />
                    <Text style={styles.coverImagePath} numberOfLines={1}>
                      {issue.coverImagePath}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Issue Modal */}
      <Modal
        visible={showIssueModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowIssueModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingIssue ? "Editar Issue" : "Novo Issue"}
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Título"
              placeholderTextColor="rgba(148, 163, 184, 0.6)"
              value={issueForm.title}
              onChangeText={(value) =>
                setIssueForm((prev) => ({ ...prev, title: value }))
              }
            />

            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Descrição"
              placeholderTextColor="rgba(148, 163, 184, 0.6)"
              value={issueForm.description}
              onChangeText={(value) =>
                setIssueForm((prev) => ({ ...prev, description: value }))
              }
              multiline
              numberOfLines={3}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Data de publicação (YYYY-MM-DD)"
              placeholderTextColor="rgba(148, 163, 184, 0.6)"
              value={issueForm.publishedAt}
              onChangeText={(value) =>
                setIssueForm((prev) => ({ ...prev, publishedAt: value }))
              }
            />

            <TextInput
              style={styles.modalInput}
              placeholder="URL (opcional)"
              placeholderTextColor="rgba(148, 163, 184, 0.6)"
              value={issueForm.url}
              onChangeText={(value) =>
                setIssueForm((prev) => ({ ...prev, url: value }))
              }
            />

            <View style={styles.imageUploadSection}>
              <Text style={styles.imageUploadLabel}>Imagem de Capa:</Text>

              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  uploadingImage && styles.uploadButtonDisabled,
                ]}
                onPress={() => {
                  if (uploadingImage) return;

                  // Criar input file temporário
                  if (typeof window !== "undefined") {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/jpeg,image/jpg,image/png";
                    input.onchange = async (event: any) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        await handleImageUploadForIssue(file);
                      }
                    };
                    input.click();
                  }
                }}
                disabled={uploadingImage}
              >
                <Ionicons
                  name={
                    uploadingImage
                      ? "hourglass-outline"
                      : "cloud-upload-outline"
                  }
                  size={20}
                  color={
                    uploadingImage ? palette.textSecondary : palette.textPrimary
                  }
                />
                <Text
                  style={[
                    styles.uploadButtonText,
                    uploadingImage && styles.uploadButtonTextDisabled,
                  ]}
                >
                  {uploadingImage ? "A carregar..." : "Carregar Imagem"}
                </Text>
              </TouchableOpacity>

              <TextInput
                style={styles.modalInput}
                placeholder="Caminho da imagem (preenchido automaticamente)"
                placeholderTextColor="rgba(148, 163, 184, 0.6)"
                value={issueForm.coverImagePath}
                onChangeText={(value) =>
                  setIssueForm((prev) => ({ ...prev, coverImagePath: value }))
                }
              />

              {issueForm.coverImagePath && (
                <View style={styles.imagePreviewContainer}>
                  <Text style={styles.imagePreviewLabel}>Preview:</Text>
                  <Image
                    source={{
                      uri: `https://firebasestorage.googleapis.com/v0/b/dgadr-digisignage-app.appspot.com/o/${encodeURIComponent(
                        issueForm.coverImagePath
                      )}?alt=media`,
                    }}
                    style={styles.imagePreview}
                    onError={() =>
                      console.log("Erro ao carregar preview da imagem")
                    }
                  />
                </View>
              )}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleSaveIssue}
              >
                <Text style={styles.modalButtonText}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowIssueModal(false)}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    styles.modalButtonTextSecondary,
                  ]}
                >
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: palette.textPrimary,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: layout.spacing.xs,
  },
  backButtonText: {
    color: palette.accent,
    fontSize: 16,
    fontWeight: "600",
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
  loadingText: {
    color: palette.textSecondary,
    fontSize: 14,
    textAlign: "center",
    padding: layout.spacing.xl,
  },
  newslettersList: {
    maxHeight: 400,
  },
  newsletterCard: {
    backgroundColor: palette.surface,
    borderRadius: layout.radius.md,
    padding: layout.spacing.md,
    marginBottom: layout.spacing.sm,
  },
  newsletterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: layout.spacing.sm,
  },
  newsletterInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: layout.spacing.sm,
    flex: 1,
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  newsletterTitle: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  newsletterSubtitle: {
    color: palette.textSecondary,
    fontSize: 14,
  },
  newsletterActions: {
    flexDirection: "row",
    gap: layout.spacing.sm,
  },
  actionButton: {
    padding: layout.spacing.sm,
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(79, 70, 229, 0.1)",
    borderRadius: layout.radius.sm,
    padding: layout.spacing.sm,
  },
  selectButtonText: {
    color: palette.accent,
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    gap: layout.spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: palette.textPrimary,
  },
  issuesList: {
    maxHeight: 300,
  },
  issueCard: {
    backgroundColor: palette.surface,
    borderRadius: layout.radius.md,
    padding: layout.spacing.md,
    marginBottom: layout.spacing.sm,
  },
  issueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: layout.spacing.sm,
  },
  issueMainInfo: {
    flex: 1,
    gap: layout.spacing.xs,
  },
  issueTitle: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  issueActions: {
    flexDirection: "row",
    gap: layout.spacing.sm,
  },
  issueDescription: {
    color: palette.textSecondary,
    fontSize: 14,
  },
  issueDate: {
    color: palette.textSecondary,
    fontSize: 12,
  },
  issueUrl: {
    color: palette.accent,
    fontSize: 12,
  },
  coverImageSection: {
    marginTop: layout.spacing.md,
    paddingTop: layout.spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(99, 102, 241, 0.2)",
  },
  coverImageLabel: {
    color: palette.textSecondary,
    fontSize: 14,
    marginBottom: layout.spacing.sm,
  },
  coverImageContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: layout.spacing.md,
  },
  coverImage: {
    width: 80,
    height: 60,
    borderRadius: layout.radius.sm,
    backgroundColor: palette.surfaceElevated,
  },
  coverImagePath: {
    color: palette.textSecondary,
    fontSize: 12,
    flex: 1,
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
    maxWidth: 500,
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
  modalTextArea: {
    minHeight: 80,
    textAlignVertical: "top",
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
  imageUploadSection: {
    gap: layout.spacing.sm,
  },
  imageUploadLabel: {
    color: palette.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.accent,
    borderRadius: layout.radius.md,
    paddingVertical: layout.spacing.sm,
    paddingHorizontal: layout.spacing.md,
    gap: layout.spacing.xs,
    justifyContent: "center",
  },
  uploadButtonDisabled: {
    opacity: 0.6,
    backgroundColor: palette.textSecondary,
  },
  uploadButtonText: {
    color: palette.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  uploadButtonTextDisabled: {
    color: palette.textSecondary,
  },
  imagePreviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: layout.spacing.md,
    padding: layout.spacing.sm,
    backgroundColor: "rgba(79, 70, 229, 0.1)",
    borderRadius: layout.radius.sm,
  },
  imagePreviewLabel: {
    color: palette.textSecondary,
    fontSize: 12,
  },
  imagePreview: {
    width: 60,
    height: 45,
    borderRadius: layout.radius.sm,
    backgroundColor: palette.surfaceElevated,
  },
});

export default NewsletterManager;
