import React, { useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import { AuthContext } from "../../context/AuthContext";
import LoginScreen from "../../components/login";

export default function HomeScreen() {
  const authCtx = useContext(AuthContext);

  if (!authCtx.isAuthenticated) {
    return <LoginScreen navigation={{ replace: () => {} }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo ao Backoffice DGADR</Text>
      <Text style={styles.subtitle}>
        Sistema de gestão de funcionários e conteúdos
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
  },
});
