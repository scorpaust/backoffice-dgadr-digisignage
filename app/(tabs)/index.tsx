import React, { useContext, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { AuthContext } from "../../context/AuthContext";
import LoginScreen from "../../screens/login";
import BackOfficeScreen from "../../screens/backoffice";

export default function HomeScreen() {
  const authCtx = useContext(AuthContext);
  const isAuthed = !!authCtx.isAuthenticated;

  useMemo(() => {
    // eslint-disable-next-line no-console
    console.log("HomeScreen mounted. isAuthenticated:", isAuthed);
  }, [isAuthed]);

  if (!isAuthed) {
    return <LoginScreen />;
  }

  return (
    <View style={{ flex: 1 }}>
      {/*<Text style={styles.diagText}>Autenticado • Diagnóstico</Text>*/}
      <BackOfficeScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  diagText: {
    position: "absolute",
    top: 8,
    left: 8,
    zIndex: 9999,
    color: "#fff",
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
  },
});
