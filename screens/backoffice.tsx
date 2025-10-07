import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  useWindowDimensions,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenScrollContainer from "../components/ScreenScrollContainer";
import { Ionicons } from "@expo/vector-icons";
import { push, ref, remove, set, update } from "firebase/database";

import { palette, layout, shadowStyles } from "../constants/theme";
import { Employee } from "../constants/Types";
import { db } from "../firebaseConfig";
import { useEmployees } from "../hooks/useEmployees";
import { useNews } from "../hooks/useNews";
import { AuthContext } from "../context/AuthContext";

type SectionKey = "employees" | "news";
type FeedbackTone = "success" | "error";

interface FeedbackState {
  tone: FeedbackTone;
  message: string;
}

interface SectionDescriptor {
  key: SectionKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}

const sections: SectionDescriptor[] = [
  {
    key: "employees",
    label: "Trabalhadores",
    icon: "people-circle-outline",
    description: "Gerir entradas e saídas de colaboradores em segundos.",
  },
  {
    key: "news",
    label: "Notícias de Rodapé",
    icon: "newspaper-outline",
    description: "Atualizar mensagens curtas para o rodapé do ecrã público.",
  },
];

const CAN_USE_NATIVE_DRIVER = Platform.OS !== "web";

const formatDate = (iso?: string) => {
  if (!iso) {
    return "Sem data";
  }

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  const datePart = date.toLocaleDateString("pt-PT");
  const timePart = date.toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${datePart} ${timePart}`;
};

interface ActionButtonProps {
  label: string;
  tone?: "primary" | "secondary" | "danger";
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
}

const ActionButton = memo<ActionButtonProps>(function ActionButton({
  label,
  tone = "primary",
  icon,
  onPress,
  disabled,
}) {
  const iconColor = tone === "secondary" ? palette.accent : palette.textPrimary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.actionButtonBase,
        styles[`actionButton_${tone}`],
        pressed && !disabled && styles.actionButtonPressed,
        disabled && styles.actionButtonDisabled,
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={18}
          color={iconColor}
          style={styles.actionButtonIcon}
        />
      )}
      <Text
        style={[
          styles.actionButtonLabel,
          tone === "secondary" && styles.actionButtonLabelSecondary,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
});

ActionButton.displayName = "ActionButton";

interface SectionSwitcherProps {
  active: SectionKey;
  onChange: (key: SectionKey) => void;
  compact: boolean;
  onLogout: () => void;
}

const SectionSwitcher = memo<SectionSwitcherProps>(function SectionSwitcher({
  active,
  onChange,
  compact,
  onLogout,
}) {
  return (
    <View style={[styles.navPanel, compact && styles.navPanelCompact]}>
      <View style={[styles.navHeader, compact && styles.navHeaderCompact]}>
        <View style={styles.brandBlock}>
          <Text style={styles.brandTitle}>DGADR Backoffice</Text>
          <Text style={styles.brandSubtitle}>
            Monitorize a comunicação interna com rapidez e estilo.
          </Text>
        </View>
        <ActionButton
          label="Terminar sessão"
          tone="secondary"
          icon="log-out-outline"
          onPress={onLogout}
        />
      </View>
      <View
        style={[
          styles.navItemsContainer,
          compact && styles.navItemsContainerCompact,
        ]}
      >
        {sections.map((section) => {
          const selected = section.key === active;
          return (
            <Pressable
              key={section.key}
              onPress={() => onChange(section.key)}
              style={({ pressed }) => [
                styles.navItem,
                selected && styles.navItemActive,
                pressed && styles.navItemPressed,
              ]}
            >
              <Ionicons
                name={section.icon}
                size={22}
                color={selected ? palette.textPrimary : palette.textSecondary}
              />
              <View style={styles.navItemTextWrapper}>
                <Text
                  style={[
                    styles.navItemText,
                    selected && styles.navItemTextActive,
                  ]}
                >
                  {section.label}
                </Text>
                <Text style={styles.navItemDescription}>
                  {section.description}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});

SectionSwitcher.displayName = "SectionSwitcher";

const BackOfficeScreen: React.FC = () => {
  // eslint-disable-next-line no-console
  console.log("BackOfficeScreen mounted");
  const [activeSection, setActiveSection] = useState<SectionKey>("employees");
  const fadeAnim = useRef(new Animated.Value(1));
  const { width, height } = useWindowDimensions();
  const compact = width < 960;
  const authCtx = useContext(AuthContext);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  useEffect(() => {
    fadeAnim.current.setValue(0);
    Animated.timing(fadeAnim.current, {
      toValue: 1,
      duration: 220,
      useNativeDriver: CAN_USE_NATIVE_DRIVER,
    }).start();
  }, [activeSection]);

  const handleFeedback = useCallback((tone: FeedbackTone, message: string) => {
    if (Platform.OS !== "web") {
      Alert.alert(
        tone === "success" ? "Operação concluída" : "Ocorreu um erro",
        message
      );
      // dá um micro-atraso para não concorrer com o modal
      setTimeout(() => setFeedback({ tone, message }), 50);
    } else {
      setFeedback({ tone, message });
    }
  }, []);

  const scrollPadding = compact ? layout.spacing.lg : layout.spacing.xl;
  return (
    <SafeAreaView style={[styles.safeArea, { position: "relative" }]}>
      <View
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          zIndex: 9999,
          backgroundColor: "rgba(0,0,0,0.35)",
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 6,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 12 }}>DEBUG: BO ativo</Text>
      </View>
      {Platform.OS === "web" ? (
        <View
          style={{
            flex: 1,
            width: "100%",
            height: "100%",
            paddingHorizontal: scrollPadding,
            paddingTop: 48,
            paddingBottom: 96,
          }}
        >
          <View style={[styles.surface, compact && styles.surfaceCompact]}>
            <SectionSwitcher
              active={activeSection}
              onChange={setActiveSection}
              compact={compact}
              onLogout={() => {
                authCtx.logout();
                handleFeedback("success", "Sessão terminada.");
              }}
            />
            <Animated.View
              style={[
                styles.sectionContentWrapper,
                { opacity: fadeAnim.current },
              ]}
            >
              {activeSection === "employees" ? (
                <EmployeeSection
                  compact={compact}
                  onFeedback={handleFeedback}
                />
              ) : (
                <NewsSection compact={compact} onFeedback={handleFeedback} />
              )}
            </Animated.View>
          </View>
        </View>
      ) : (
        <ScreenScrollContainer
          contentPadding={scrollPadding}
          spacing={layout.spacing.md}
          padBottom={96}
        >
          <View style={[styles.surface, compact && styles.surfaceCompact]}>
            <SectionSwitcher
              active={activeSection}
              onChange={setActiveSection}
              compact={compact}
              onLogout={() => {
                authCtx.logout();
                handleFeedback("success", "Sessão terminada.");
              }}
            />
            <Animated.View
              style={[
                styles.sectionContentWrapper,
                { opacity: fadeAnim.current },
              ]}
            >
              {activeSection === "employees" ? (
                <EmployeeSection
                  compact={compact}
                  onFeedback={handleFeedback}
                />
              ) : (
                <NewsSection compact={compact} onFeedback={handleFeedback} />
              )}
            </Animated.View>
          </View>
        </ScreenScrollContainer>
      )}
      {feedback && (
        <View
          pointerEvents="box-none"
          style={[StyleSheet.absoluteFillObject, { zIndex: 2147483647 }]}
        >
          <FeedbackSnackbar
            feedback={feedback}
            onDismiss={() => setFeedback(null)}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

interface EmployeeFormState {
  name: string;
  startYear: string;
  startDate: string;
  endDate: string;
  department: string;
}

const emptyEmployeeForm: EmployeeFormState = {
  name: "",
  startYear: "",
  startDate: "",
  endDate: "",
  department: "",
};

const EmployeeSection: React.FC<{
  compact: boolean;
  onFeedback: (tone: FeedbackTone, message: string) => void;
}> = ({ compact, onFeedback }) => {
  const { employees, loading, error } = useEmployees();
  const [form, setForm] = useState<EmployeeFormState>(emptyEmployeeForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof EmployeeFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => {
    setForm(emptyEmployeeForm);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    const trimmedName = form.name.trim();
    const trimmedStartDate = form.startDate.trim();
    const trimmedStartYear = form.startYear.trim();

    if (!trimmedName || !trimmedStartDate || !trimmedStartYear) {
      onFeedback(
        "error",
        "Nome, ano de entrada e data de início são obrigatórios."
      );
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: trimmedName,
      startYear: trimmedStartYear,
      startDate: trimmedStartDate,
      endDate: form.endDate.trim(),
      department: form.department.trim(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (editingId) {
        await update(ref(db, `/employees/${editingId}`), payload);
        onFeedback("success", "Registo de trabalhador atualizado.");
      } else {
        const now = new Date().toISOString();
        const employeesRef = ref(db, "/employees");
        const newRef = push(employeesRef);
        await set(newRef, { ...payload, createdAt: now, updatedAt: now });
        onFeedback("success", "Registo de trabalhador criado.");
      }

      resetForm();
    } catch (submissionError) {
      onFeedback(
        "error",
        "Não foi possível guardar o registo. Tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectEmployee = (employee: Employee) => {
    setEditingId(employee.id);
    setForm({
      name: employee.name ?? "",
      startYear: employee.startYear ?? "",
      startDate: employee.startDate ?? "",
      endDate: employee.endDate ?? "",
      department: employee.department ?? "",
    });
  };

  const handleDelete = (employeeId: string) => {
    console.log("Tentando eliminar trabalhador com ID:", employeeId);
    Alert.alert(
      "Apagar registo",
      "Tem a certeza que pretende remover este trabalhador?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apagar",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("Eliminando trabalhador do Firebase...");
              const employeeRef = ref(db, `/employees/${employeeId}`);
              console.log("Referência do Firebase:", employeeRef.toString());
              await remove(employeeRef);
              console.log("Trabalhador eliminado com sucesso!");
              onFeedback("success", "O trabalhador foi removido.");
              if (editingId === employeeId) {
                resetForm();
              }
            } catch (deletionError) {
              console.error("Erro ao eliminar trabalhador:", deletionError);
              const errorMessage =
                deletionError instanceof Error
                  ? deletionError.message
                  : "Erro desconhecido";
              onFeedback(
                "error",
                `Não foi possível remover o trabalhador. Erro: ${errorMessage}`
              );
            }
          },
        },
      ]
    );
  };

  const helperText = editingId
    ? "A editar registo existente. Guarde para confirmar alterações."
    : "Preencha o formulário para registar novas entradas ou saídas.";

  const scrollPadding = compact ? layout.spacing.lg : layout.spacing.xl;

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Gestão de trabalhadores</Text>
      <Text style={styles.sectionHelper}>{helperText}</Text>

      <View style={[styles.formGrid, compact && styles.formGridCompact]}>
        <LabeledInput
          label="Nome completo"
          value={form.name}
          onChangeText={(value) => handleChange("name", value)}
          placeholder="Maria Santos"
        />
        <LabeledInput
          label="Ano de entrada"
          value={form.startYear}
          onChangeText={(value) => handleChange("startYear", value)}
          keyboardType="numeric"
          placeholder="2024"
        />
        <LabeledInput
          label="Data de início"
          value={form.startDate}
          onChangeText={(value) => handleChange("startDate", value)}
          placeholder="2024-07-01"
        />
        <LabeledInput
          label="Data de fim (opcional)"
          value={form.endDate}
          onChangeText={(value) => handleChange("endDate", value)}
          placeholder="2024-12-31"
        />
        <LabeledInput
          label="Divisão / Direção"
          value={form.department}
          onChangeText={(value) => handleChange("department", value)}
          placeholder="Divisão de Comunicação"
        />
      </View>

      <View style={styles.formActions}>
        <ActionButton
          label={editingId ? "Guardar alterações" : "Guardar registo"}
          onPress={handleSubmit}
          icon="save-outline"
          disabled={isSubmitting}
        />
        <ActionButton
          label="Limpar"
          tone="secondary"
          onPress={resetForm}
          icon="refresh-outline"
          disabled={isSubmitting}
        />
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listHeaderText}>Registos recentes</Text>
        <Text style={styles.listCounter}>
          {employees.length}{" "}
          {employees.length === 1 ? "trabalhador" : "trabalhadores"}
        </Text>
      </View>

      {loading && (
        <Text style={styles.statusText}>A carregar trabalhadores...</Text>
      )}
      {error && <Text style={styles.statusTextError}>{error}</Text>}
      {!loading && !employees.length && (
        <Text style={styles.statusText}>Sem registos guardados.</Text>
      )}

      <View
        style={[styles.cardsContainer, compact && styles.cardsContainerCompact]}
      >
        {employees.map((employee) => (
          <Pressable
            key={employee.id}
            onPress={() => handleSelectEmployee(employee)}
            style={({ pressed }) => [
              styles.card,
              compact && styles.cardCompact,
              pressed && styles.cardPressed,
              editingId === employee.id && styles.cardActive,
            ]}
          >
            <View style={styles.cardHeader}>
              <Ionicons
                name="id-card-outline"
                size={20}
                color={palette.accentSoft}
              />
              <Text style={styles.cardTitle}>{employee.name}</Text>
            </View>
            <View style={styles.cardContent}>
              {/* Espaço vazio para empurrar footer para baixo */}
            </View>
            <View style={styles.cardFooter}>
              <View style={styles.cardMetaContainer}>
                <Text style={styles.cardMeta}>
                  Início: {employee.startDate || "-"}
                </Text>
                <Text style={styles.cardMeta}>
                  Fim: {employee.endDate?.trim() || "A decorrer"}
                </Text>
                <Text style={styles.cardMeta}>
                  Unidade: {employee.department?.trim() || "Não definido"}
                </Text>
              </View>
              <ActionButton
                label="Apagar"
                tone="danger"
                icon="trash-outline"
                onPress={() => handleDelete(employee.id)}
              />
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const NewsSection: React.FC<{
  compact: boolean;
  onFeedback: (tone: FeedbackTone, message: string) => void;
}> = ({ compact, onFeedback }) => {
  const { data, isLoading, error } = useNews();
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmed = title.trim();

    if (!trimmed) {
      onFeedback("error", "Introduza o texto da notícia.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingId) {
        await update(ref(db, `/news/${editingId}`), {
          title: trimmed,
          updatedAt: new Date().toISOString(),
        });
        onFeedback("success", "Notícia atualizada.");
      } else {
        const now = new Date().toISOString();
        const newsRef = ref(db, "/news");
        const newRef = push(newsRef);
        await set(newRef, {
          title: trimmed,
          createdAt: now,
          updatedAt: now,
        });
        onFeedback("success", "Notícia adicionada.");
      }

      setTitle("");
      setEditingId(null);
    } catch (submissionError) {
      onFeedback(
        "error",
        "Não foi possível guardar a notícia. Tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (newsId: string) => {
    console.log("Tentando eliminar notícia com ID:", newsId);
    Alert.alert("Apagar notícia", "Confirma remover a notícia do rodapé?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Apagar",
        style: "destructive",
        onPress: async () => {
          try {
            console.log("Eliminando notícia do Firebase...");
            const newsRef = ref(db, `/news/${newsId}`);
            console.log("Referência do Firebase:", newsRef.toString());
            await remove(newsRef);
            console.log("Notícia eliminada com sucesso!");
            onFeedback("success", "A notícia foi removida.");
            if (editingId === newsId) {
              setTitle("");
              setEditingId(null);
            }
          } catch (deletionError) {
            console.error("Erro ao eliminar notícia:", deletionError);
            const errorMessage =
              deletionError instanceof Error
                ? deletionError.message
                : "Erro desconhecido";
            onFeedback(
              "error",
              `Não foi possível remover a notícia. Erro: ${errorMessage}`
            );
          }
        },
      },
    ]);
  };

  const helperText = editingId
    ? "A editar notícia existente. Guarde para atualizar o rodapé."
    : "Escreva uma mensagem até 180 caracteres para o rodapé.";

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Notícias de rodapé</Text>
      <Text style={styles.sectionHelper}>{helperText}</Text>

      <LabeledInput
        label="Título da notícia"
        value={title}
        onChangeText={setTitle}
        placeholder="Mensagem breve para o rodapé"
        maxLength={180}
        multiline
        numberOfLines={3}
      />
      <Text
        style={[
          styles.charCount,
          title.length > 160 && styles.charCountWarning,
        ]}
      >
        {title.length}/180 caracteres
      </Text>

      <View style={styles.formActions}>
        <ActionButton
          label={editingId ? "Atualizar notícia" : "Publicar notícia"}
          onPress={handleSubmit}
          icon="cloud-upload-outline"
          disabled={isSubmitting}
        />
        <ActionButton
          label="Cancelar"
          tone="secondary"
          onPress={() => {
            setTitle("");
            setEditingId(null);
          }}
          icon="close-circle-outline"
          disabled={isSubmitting}
        />
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listHeaderText}>Notícias guardadas</Text>
        <Text style={styles.listCounter}>
          {data.length} {data.length === 1 ? "entrada" : "entradas"}
        </Text>
      </View>

      {isLoading && (
        <Text style={styles.statusText}>A carregar notícias...</Text>
      )}
      {error && <Text style={styles.statusTextError}>{error}</Text>}
      {!isLoading && !data.length && (
        <Text style={styles.statusText}>Sem notícias guardadas.</Text>
      )}

      <View
        style={[styles.cardsContainer, compact && styles.cardsContainerCompact]}
      >
        {data.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => {
              setTitle(item.title);
              setEditingId(item.id);
            }}
            style={({ pressed }) => [
              styles.card,
              compact && styles.cardCompact,
              pressed && styles.cardPressed,
              editingId === item.id && styles.cardActive,
            ]}
          >
            <View style={styles.cardHeader}>
              <Ionicons
                name="megaphone-outline"
                size={20}
                color={palette.accentSoft}
              />
              <Text style={styles.cardTitle}>{item.title}</Text>
            </View>
            <View style={styles.cardContent}>
              {/* Espaço vazio para empurrar footer para baixo */}
            </View>
            <View style={styles.cardFooter}>
              <View style={styles.cardMetaContainer}>
                <Text style={styles.cardMeta}>
                  Criado: {formatDate(item.createdAt)}
                </Text>
                <Text style={styles.cardMeta}>
                  Atualizado: {formatDate(item.updatedAt)}
                </Text>
              </View>
              <ActionButton
                label="Apagar"
                tone="danger"
                icon="trash-outline"
                onPress={() => handleDelete(item.id)}
              />
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

interface LabeledInputProps
  extends Pick<
    TextInputProps,
    "keyboardType" | "maxLength" | "multiline" | "numberOfLines"
  > {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}

const LabeledInput = memo<LabeledInputProps>(function LabeledInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  maxLength,
  multiline,
  numberOfLines,
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(148, 163, 184, 0.6)"
        keyboardType={keyboardType}
        maxLength={maxLength}
        multiline={multiline}
        numberOfLines={numberOfLines}
        style={[
          styles.inputControl,
          multiline && styles.inputControlMultiline,
          focused && styles.inputControlFocused,
        ]}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
});

LabeledInput.displayName = "LabeledInput";

interface FeedbackSnackbarProps {
  feedback: FeedbackState | null;
  onDismiss: () => void;
}

const AUTO_HIDE_MS = 2600;

const FeedbackSnackbar = memo<FeedbackSnackbarProps>(function FeedbackSnackbar({
  feedback,
  onDismiss,
}) {
  const translateY = useRef(new Animated.Value(80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!feedback) return;

    if (Platform.OS === "web") {
      // WEB: sem animação, mas com auto-hide
      const timer = setTimeout(onDismiss, AUTO_HIDE_MS);
      return () => clearTimeout(timer);
    }

    // NATIVO: anima e auto-hide
    translateY.setValue(80);
    opacity.setValue(0);

    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 80,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(onDismiss);
    }, AUTO_HIDE_MS);

    return () => clearTimeout(timer);
  }, [feedback, onDismiss, opacity, translateY]);

  if (!feedback) return null;

  // WEB: posição fixa e sem "vermelho" hardcoded
  if (Platform.OS === "web") {
    return (
      <View
        pointerEvents="none"
        style={[
          styles.feedbackContainer,
          feedback.tone === "success"
            ? styles.feedbackSuccess
            : styles.feedbackError,
          {
            position: "absolute",
            left: 16,
            right: 16,
            bottom: 16,
            zIndex: 2147483647,
          },
        ]}
      >
        <Ionicons
          name={feedback.tone === "success" ? "checkmark-circle" : "alert"}
          size={18}
          color={palette.textPrimary}
        />
        <Text style={styles.feedbackText}>{feedback.message}</Text>
      </View>
    );
  }

  // NATIVO
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.feedbackContainer,
        feedback.tone === "success"
          ? styles.feedbackSuccess
          : styles.feedbackError,
        { opacity, transform: [{ translateY }] },
      ]}
    >
      <Ionicons
        name={feedback.tone === "success" ? "checkmark-circle" : "alert"}
        size={18}
        color={palette.textPrimary}
      />
      <Text style={styles.feedbackText}>{feedback.message}</Text>
    </Animated.View>
  );
});

FeedbackSnackbar.displayName = "FeedbackSnackbar";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
    position: "relative",
    zIndex: 1,
  },
  surface: {
    backgroundColor: palette.surface,
    borderRadius: layout.radius.lg,
    padding: layout.spacing.xl,
    gap: layout.spacing.lg,
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
    position: "relative",
    zIndex: 2,
    ...shadowStyles.medium,
  },
  surfaceCompact: {
    padding: layout.spacing.lg,
  },
  navPanel: {
    gap: layout.spacing.md,
  },
  navPanelCompact: {
    gap: layout.spacing.sm,
  },
  navHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: layout.spacing.md,
    flexWrap: "wrap",
  },
  navHeaderCompact: {
    alignItems: "flex-start",
  },
  brandBlock: {
    gap: 6,
    flexShrink: 1,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: palette.textPrimary,
  },
  brandSubtitle: {
    color: "rgba(203, 213, 225, 0.8)",
    fontSize: 15,
    maxWidth: 480,
  },
  navItemsContainer: {
    marginTop: layout.spacing.md,
    gap: layout.spacing.sm,
  },
  navItemsContainerCompact: {
    flexDirection: "column",
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.surfaceElevated,
    borderRadius: layout.radius.md,
    paddingVertical: layout.spacing.sm,
    paddingHorizontal: layout.spacing.md,
    borderWidth: 1,
    borderColor: "transparent",
  },
  navItemActive: {
    borderColor: palette.accent,
    backgroundColor: "rgba(79, 70, 229, 0.25)",
  },
  navItemPressed: {
    opacity: 0.85,
  },
  navItemTextWrapper: {
    marginLeft: layout.spacing.sm,
    flex: 1,
  },
  navItemText: {
    color: palette.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },
  navItemTextActive: {
    color: palette.textPrimary,
  },
  navItemDescription: {
    color: "rgba(148, 163, 184, 0.85)",
    fontSize: 13,
    marginTop: 4,
  },
  sectionContentWrapper: {
    width: "100%",
  },
  sectionContainer: {
    backgroundColor: palette.surfaceElevated,
    borderRadius: layout.radius.lg,
    padding: layout.spacing.lg,
    gap: layout.spacing.lg,
    width: "100%",
    ...shadowStyles.soft,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: palette.textPrimary,
  },
  sectionHelper: {
    color: palette.textSecondary,
    fontSize: 15,
  },
  formGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: layout.spacing.md,
    rowGap: layout.spacing.md,
  },
  formGridCompact: {
    flexDirection: "column",
  },
  formActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: layout.spacing.sm,
  },
  listHeader: {
    marginTop: layout.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  listHeaderText: {
    color: palette.textPrimary,
    fontSize: 18,
    fontWeight: "600",
  },
  listCounter: {
    color: palette.textSecondary,
  },
  statusText: {
    color: palette.textSecondary,
    fontSize: 14,
  },
  statusTextError: {
    color: palette.danger,
    fontSize: 14,
  },
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: layout.spacing.md,
    rowGap: layout.spacing.md,
    width: "100%",
  },
  cardsContainerCompact: {
    flexDirection: "column",
    width: "100%",
  },
  card: {
    flexGrow: 1,
    minWidth: 280,
    maxWidth: 420,
    backgroundColor: palette.surface,
    borderRadius: layout.radius.md,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.18)",
    padding: layout.spacing.md,
    display: "flex",
    flexDirection: "column",
    minHeight: 240,
  },
  cardCompact: {
    width: "100%",
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
  },
  cardActive: {
    borderColor: palette.accent,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: layout.spacing.sm,
  },
  cardTitle: {
    color: palette.textPrimary,
    fontSize: 17,
    fontWeight: "600",
    flex: 1,
  },
  cardContent: {
    marginTop: layout.spacing.sm,
    flex: 1,
    justifyContent: "flex-end",
  },
  cardMetaContainer: {
    gap: 6,
    flex: 1,
    maxWidth: "70%",
  },
  cardMeta: {
    color: palette.textSecondary,
    fontSize: 14,
  },
  cardFooter: {
    marginTop: "auto",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingTop: layout.spacing.md,
    flexWrap: "wrap",
    gap: layout.spacing.sm,
  },
  actionButtonBase: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: layout.radius.md,
    paddingHorizontal: layout.spacing.lg,
    paddingVertical: 12,
  },
  actionButton_primary: {
    backgroundColor: palette.accent,
  },
  actionButton_secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: palette.accent,
  },
  actionButton_danger: {
    backgroundColor: palette.danger,
  },
  actionButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonIcon: {
    marginRight: 8,
  },
  actionButtonLabel: {
    color: palette.textPrimary,
    fontWeight: "600",
    fontSize: 15,
  },
  actionButtonLabelSecondary: {
    color: palette.accent,
  },
  inputGroup: {
    flexGrow: 1,
    minWidth: 220,
  },
  inputLabel: {
    color: palette.textSecondary,
    fontSize: 14,
    marginBottom: 6,
  },
  inputControl: {
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.25)",
    borderRadius: layout.radius.md,
    color: palette.textPrimary,
    paddingHorizontal: layout.spacing.md,
    paddingVertical: 12,
    fontSize: 15,
  },
  inputControlFocused: {
    borderColor: palette.accent,
  },
  inputControlMultiline: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  charCount: {
    alignSelf: "flex-end",
    fontSize: 13,
    color: palette.textSecondary,
  },
  charCountWarning: {
    color: palette.accentSoft,
  },
  feedbackContainer: {
    position: "absolute",
    bottom: layout.spacing.xl,
    right: layout.spacing.xl,
    left: layout.spacing.xl,
    alignSelf: "center",
    maxWidth: 420,
    backgroundColor: "rgba(31, 41, 55, 0.95)",
    borderRadius: layout.radius.md,
    paddingHorizontal: layout.spacing.md,
    paddingVertical: layout.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: layout.spacing.sm,
    zIndex: 10, // base
    ...Platform.select({ web: { zIndex: 9999 } }), // web on top
    ...shadowStyles.medium,
  },
  feedbackSuccess: {
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.45)",
  },
  feedbackError: {
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.45)",
  },
  feedbackText: {
    color: palette.textPrimary,
    fontWeight: "600",
    flex: 1,
  },
});

export default BackOfficeScreen;
