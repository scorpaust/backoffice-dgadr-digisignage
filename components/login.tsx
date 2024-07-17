import { authenticate } from "@/utils/Auth";
import React, { useContext, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import {
  firebase,
  db,
  auth,
  signInWithEmailAndPassword,
} from "../firebaseConfig"; // Adjust the path as needed
import LoadingOverlay from "./LoadingOverlay";
import { AuthContext } from "../context/AuthContext";

interface NavigationProps {
  navigation: {
    replace: (screen: string) => void;
  };
}

type LoginCredentials = {
  email: string;
  password: string;
};

const LoginScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const authCtx = useContext(AuthContext);

  async function signInHandler(credentials: LoginCredentials) {
    setIsAuthenticating(true);
    try {
      const token = await authenticate(credentials.email, credentials.password);
      authCtx.authenticate(token);
      setIsAuthenticating(false);
    } catch (error) {
      setIsAuthenticating(false);
      alert(
        "Falha na Autenticação! Por favor, verifique as suas credenciais de acesso ou tente aceder, de novo, mais tarde."
      );
    }
  }

  function handlePress() {
    signInHandler({ email, password });
  }

  if (isAuthenticating) {
    return <LoadingOverlay message="Autenticando utilizador..." />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Autenticação para Administração</Text>
      <TextInput
        style={styles.input}
        placeholder="Endereço eletrónico"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Entrar" onPress={handlePress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});

export default LoginScreen;
