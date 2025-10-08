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
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.background = "rgba(0,0,0,0.45)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = "2147483647";

  const modal = document.createElement("div");
  modal.style.width = "min(92vw, 420px)";
  modal.style.background = "#111827";
  modal.style.border = "1px solid rgba(99, 102, 241, 0.35)";
  modal.style.borderRadius = "12px";
  modal.style.padding = "16px";
  modal.style.boxShadow = "0 20px 45px rgba(0,0,0,0.35)";
  modal.style.color = "#fff";
  modal.style.fontFamily =
    "SpaceMono, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif";

  const h = document.createElement("div");
  h.textContent = title || "Confirmação";
  h.style.fontWeight = "700";
  h.style.marginBottom = "8px";

  const p = document.createElement("div");
  p.textContent = description || "";
  p.style.opacity = "0.85";
  p.style.fontSize = "14px";

  const row = document.createElement("div");
  row.style.display = "flex";
  row.style.gap = "8px";
  row.style.justifyContent = "flex-end";
  row.style.marginTop = "16px";

  const makeBtn = (
    label: string,
    variant: "primary" | "secondary",
    onClick?: () => void
  ) => {
    const b = document.createElement("button");
    b.textContent = label;
    b.style.padding = "10px 14px";
    b.style.borderRadius = "10px";
    b.style.border = variant === "secondary" ? "1px solid #6366f1" : "none";
    b.style.background = variant === "secondary" ? "transparent" : "#4f46e5";
    b.style.color = variant === "secondary" ? "#6366f1" : "#fff";
    b.style.cursor = "pointer";
    b.style.fontFamily = modal.style.fontFamily;
    b.style.fontWeight = "600";
    b.onmouseenter = () => (b.style.opacity = "0.9");
    b.onmouseleave = () => (b.style.opacity = "1");
    b.onclick = () => {
      document.body.removeChild(overlay);
      onClick && onClick();
    };
    return b;
  };

  const cancel = options?.find(({ style }) => style === "cancel");
  const confirm = options?.find(({ style }) => style !== "cancel");

  if (cancel)
    row.appendChild(
      makeBtn(cancel.text || "Cancelar", "secondary", cancel.onPress)
    );
  row.appendChild(
    makeBtn(confirm?.text || "Confirmar", "primary", confirm?.onPress)
  );

  modal.appendChild(h);
  if (p.textContent) modal.appendChild(p);
  modal.appendChild(row);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
};

const alert = Platform.OS === "web" ? alertPolyfill : Alert.alert;

export default alert;
