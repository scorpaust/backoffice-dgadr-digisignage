import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../../components/login";
import EmployeeListScreen from "../../screens/employees";
import EmployeeEditScreen from "../../components/employees_edit";
import { Employee } from "../../constants/Types"; // Ensure you have a types file for shared types
import React, { useContext, useEffect, useState } from "react";
import AuthContextProvider from "@/context/AuthContext";
import { AuthContext } from "../../context/AuthContext";
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppLoading from "expo-app-loading";

export type RootStackParamList = {
  Login?: undefined;
  Employees?: undefined;
  EditEmployee?: { employee?: Employee };
};

const Stack = createStackNavigator<RootStackParamList>();

function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

function AuthenticatedStack() {
  return (
    <Stack.Navigator
      initialRouteName="Employees"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Employees" component={EmployeeListScreen} />

      <Stack.Screen name="EditEmployee" component={EmployeeEditScreen} />
    </Stack.Navigator>
  );
}

function Navigation() {
  const authCtx = useContext(AuthContext);

  if (authCtx.isAuthenticated) {
    return <AuthenticatedStack />;
  }

  return <AuthStack />;
}

function Root() {
  const [isTryingLogin, setIsTryingLogin] = useState(false);

  const authCtx = useContext(AuthContext);

  useEffect(() => {
    async function fetchToken() {
      const storedToken = await AsyncStorage.getItem("token");

      if (storedToken) {
        authCtx.authenticate(storedToken);
      }

      setIsTryingLogin(false);
    }

    fetchToken();
  }, []);

  if (isTryingLogin) {
    return <AppLoading />;
  }

  return <Navigation />;
}

function App() {
  return (
    <AuthContextProvider>
      <Root />
    </AuthContextProvider>
  );
}

export default App;
