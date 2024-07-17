import { Alert, Platform } from "react-native";

interface AlertOption {
  text?: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

const alertPolyfill = (
  title: string,
  description?: string,
  options?: AlertOption[],
  extra?: any
) => {
  const result = window.confirm(
    [title, description].filter(Boolean).join("\n")
  );

  if (result) {
    const confirmOption = options?.find(({ style }) => style !== "cancel");
    confirmOption && confirmOption.onPress && confirmOption.onPress();
  } else {
    const cancelOption = options?.find(({ style }) => style === "cancel");
    cancelOption && cancelOption.onPress && cancelOption.onPress();
  }
};

const alert = Platform.OS === "web" ? alertPolyfill : Alert.alert;

export default alert;
