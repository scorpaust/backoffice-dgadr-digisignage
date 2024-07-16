import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../../components/login";
import EmployeeListScreen from "./employees";
import EmployeeEditScreen from "../../components/employees_edit";
import { Employee } from "../../constants/Types"; // Ensure you have a types file for shared types
import { AuthProvider } from "@/context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export type RootStackParamList = {
  Login: undefined;
  Employees: undefined;
  EditEmployee: { employee?: Employee };
};

function App() {
  const Stack = createStackNavigator<RootStackParamList>();

  const ctx = useContext(AuthContext);

  return (
    <AuthProvider>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        {!ctx?.user && <Stack.Screen name="Login" component={LoginScreen} />}
        {ctx?.user && (
          <Stack.Screen name="Employees" component={EmployeeListScreen} />
        )}
        <Stack.Screen name="EditEmployee" component={EmployeeEditScreen} />
      </Stack.Navigator>
    </AuthProvider>
  );
}

export default App;
