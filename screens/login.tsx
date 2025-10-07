import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  // ScrollView,  // no longer used in web fallback
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { palette, layout, shadowStyles } from "../constants/theme";
import { AuthContext } from "../context/AuthContext";
import { authenticate } from "../utils/Auth";
import LoadingOverlay from "../components/LoadingOverlay";

// Robust web detection (works in RN Web builds)
const IS_WEB = typeof document !== "undefined" && typeof window !== "undefined";

// Use a simple View on web to avoid KeyboardAvoidingView layout offsets
const Wrapper: any = IS_WEB ? View : KeyboardAvoidingView;

type LoginCredentials = {
  email: string;
  password: string;
};

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const fadeAnim = useRef(new Animated.Value(IS_WEB ? 1 : 0)).current;
  const authCtx = useContext(AuthContext);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("LoginScreen mounted (IS_WEB=", IS_WEB, ")");
    if (IS_WEB) return;
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 320,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, [fadeAnim]);

  async function signInHandler(credentials: LoginCredentials) {
    setIsAuthenticating(true);
    try {
      const token = await authenticate(credentials.email, credentials.password);
      authCtx.authenticate(token);
    } catch (error) {
      Alert.alert(
        "Falha na autenticacao",
        "Verifique as credenciais ou tente novamente mais tarde." ||
          String(error)
      );
    } finally {
      setIsAuthenticating(false);
    }
  }

  function handlePress() {
    signInHandler({ email, password });
  }

  if (isAuthenticating) {
    return <LoadingOverlay message="Autenticando utilizador..." />;
  }

  // WEB: simplified fallback to ensure visibility (force path on web)
  if (IS_WEB) {
    // eslint-disable-next-line no-console
    console.log("Rendering WEB fallback login UI (forced)");
    const canSubmit = email.trim().length > 0 && password.trim().length > 0;
    return (
      <View style={styles.rootWeb}>
        <View style={styles.webDebugBanner}>
          <Text style={{ color: "#fff", fontSize: 12 }}>
            WEB fallback ativo
          </Text>
        </View>
        <View
          onLayout={(e) => {
            // eslint-disable-next-line no-console
            console.log("webCard layout:", e.nativeEvent.layout);
          }}
          style={styles.webCard}
        >
          <Text style={styles.brandTitle}>Entrada segura</Text>
          <Text style={styles.brandSubtitle}>DGADR Backoffice</Text>
          <View style={{ height: 12 }} />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="utilizador@dgadr.gov.pt"
            placeholderTextColor="rgba(148, 163, 184, 0.6)"
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.webInput}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Introduza a senha"
            placeholderTextColor="rgba(148, 163, 184, 0.6)"
            autoCapitalize="none"
            secureTextEntry={!showPassword}
            style={styles.webInput}
          />
          <Pressable
            onPress={handlePress}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
              !canSubmit && styles.primaryButtonDisabled,
            ]}
            disabled={!canSubmit}
          >
            <Text style={styles.primaryButtonLabel}>Entrar</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // NATIVE / default rich UI
  const canSubmit = email.trim().length > 0 && password.trim().length > 0;

  return (
    <View style={styles.screen}>
      <Animated.View
        style={[
          styles.backgroundGlow,
          {
            opacity: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.2, 0.9],
            }),
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [40, 0],
                }),
              },
            ],
          },
        ]}
      />
      <Wrapper
        {...(!IS_WEB ? { behavior: "padding" as const } : {})}
        style={styles.contentWrapper}
      >
        <Animated.View
          style={[styles.card, { opacity: fadeAnim }]}
          onLayout={(e) => {
            // eslint-disable-next-line no-console
            console.log("Login card layout:", e.nativeEvent.layout);
          }}
        >
          <View style={styles.brandBlock}>
            <Text style={styles.brandKicker}>DGADR Backoffice</Text>
            <Text style={styles.brandTitle}>Entrada segura</Text>
            <Text style={styles.brandSubtitle}>
              Aceda ao painel administrativo para gerir trabalhadores e noticias
              de rodape.
            </Text>
          </View>

          <View style={styles.formBlock}>
            <AuthInput
              label="Email institucional"
              icon="mail-outline"
              placeholder="utilizador@dgadr.gov.pt"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <AuthInput
              label="Senha"
              icon="lock-closed-outline"
              placeholder="Introduza a senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              onToggleSecure={() => setShowPassword((prev) => !prev)}
              secureVisible={showPassword}
            />
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
                !canSubmit && styles.primaryButtonDisabled,
              ]}
              onPress={handlePress}
              disabled={!canSubmit}
            >
              <Text style={styles.primaryButtonLabel}>Entrar</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Wrapper>
    </View>
  );
};

interface AuthInputProps
  extends Pick<
    TextInputProps,
    "keyboardType" | "secureTextEntry" | "autoCapitalize"
  > {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  placeholder?: string;
  value: string;
  onChangeText: (value: string) => void;
  onToggleSecure?: () => void;
  secureVisible?: boolean;
}

const AuthInput: React.FC<AuthInputProps> = ({
  label,
  icon,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  secureTextEntry,
  autoCapitalize,
  onToggleSecure,
  secureVisible,
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View
        style={[styles.inputWrapper, focused && styles.inputWrapperFocused]}
      >
        <Ionicons name={icon} size={18} color={palette.textSecondary} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(148, 163, 184, 0.6)"
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={styles.inputControl}
        />
        {onToggleSecure && (
          <Pressable onPress={onToggleSecure} hitSlop={12}>
            <Ionicons
              name={secureVisible ? "eye-outline" : "eye-off-outline"}
              size={18}
              color={palette.textSecondary}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.background,
  },
  rootWeb: {
    flex: 1,
    backgroundColor: palette.background,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: layout.spacing.lg,
    paddingVertical: layout.spacing.lg,
    paddingTop: layout.spacing.xl * 2, // push content into view on large desktop
  },
  screen: {
    flex: 1,
    backgroundColor: palette.background,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  webContainer: {
    flexGrow: 1,
    minHeight: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: layout.spacing.lg,
    paddingVertical: layout.spacing.lg,
  },
  backgroundGlow: {
    position: "absolute",
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: "rgba(99, 102, 241, 0.35)",
    top: "20%",
    alignSelf: "center",
    zIndex: 0,
  },
  contentWrapper: {
    width: "100%",
    paddingHorizontal: layout.spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: layout.radius.lg,
    padding: layout.spacing.xl,
    gap: layout.spacing.lg,
    ...shadowStyles.medium,
    zIndex: 1,
    width: "100%",
    maxWidth: 520,
    minHeight: 200,
  },
  brandBlock: {
    gap: 6,
  },
  brandKicker: {
    color: palette.accentSoft,
    fontWeight: "600",
    letterSpacing: 1,
  },
  brandTitle: {
    color: palette.textPrimary,
    fontSize: 28,
    fontWeight: "700",
  },
  brandSubtitle: {
    color: palette.textSecondary,
    fontSize: 15,
  },
  formBlock: {
    gap: layout.spacing.md,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    color: palette.textSecondary,
    fontSize: 14,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: layout.spacing.sm,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    borderRadius: layout.radius.md,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.25)",
    paddingHorizontal: layout.spacing.md,
    paddingVertical: 12,
  },
  inputWrapperFocused: {
    borderColor: palette.accent,
  },
  inputControl: {
    flex: 1,
    color: palette.textPrimary,
    fontSize: 15,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: layout.radius.md,
    backgroundColor: palette.accent,
    paddingVertical: 14,
  },
  primaryButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonLabel: {
    color: palette.textPrimary,
    fontWeight: "600",
    fontSize: 16,
  },
  // WEB fallback minimal styles
  webDebugBanner: {
    position: "absolute",
    top: 8,
    left: 8,
    zIndex: 10000,
    backgroundColor: "rgba(239,68,68,0.8)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  webCard: {
    backgroundColor: palette.surface,
    borderRadius: layout.radius.lg,
    padding: layout.spacing.xl,
    width: "100%",
    maxWidth: 520,
  },
  webInput: {
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.25)",
    borderRadius: layout.radius.md,
    color: palette.textPrimary,
    paddingHorizontal: layout.spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 12,
  },
});

export default LoginScreen;
