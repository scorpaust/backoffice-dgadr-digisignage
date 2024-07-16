import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { getDatabase, ref, onValue, off, remove } from "firebase/database";
import { NavigationProp } from "@react-navigation/native";
import { Employee } from "../../constants/Types"; // Ensure you have a types file for shared types
import { RootStackParamList } from "./index";
import { db } from "@/firebaseConfig";
import { useAuth } from "@/context/AuthContext";

interface EmployeeListScreenProps {
  navigation: NavigationProp<RootStackParamList, "Employees">;
}

const EmployeeListScreen: React.FC<EmployeeListScreenProps> = ({
  navigation,
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const { signOut } = useAuth();

  useEffect(() => {
    const db = getDatabase();
    const employeesRef = ref(db, "/employees");
    const listener = onValue(employeesRef, (snapshot) => {
      const data = snapshot.val();
      const employeesList = data
        ? Object.keys(data).map((key) => ({ ...data[key], id: key }))
        : [];
      setEmployees(employeesList);
    });

    // Cleanup listener on unmount
    return () => {
      off(employeesRef, "value", listener);
    };
  }, []);

  const handleDelete = async (id: string) => {
    console.log(`handleDelete called for id: ${id}`);
    try {
      await remove(ref(db, `/employees/${id}`));
      console.log(`Successfully deleted employee with id: ${id}`);
      Alert.alert("Success", "Employee deleted successfully");
    } catch (error) {
      console.error(`Failed to delete employee with id: ${id}`, error);
      Alert.alert("Error", `Failed to delete employee`);
    }
  };

  return (
    <View style={styles.container}>
      <Button
        title="Adicionar Entrada/Saída de Trabalhador"
        onPress={() =>
          navigation.navigate("EditEmployee", { employee: undefined })
        }
      />
      <Button title="Sair" onPress={() => signOut} />
      <FlatList
        data={employees}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.employeeContainer}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("EditEmployee", { employee: item })
              }
            >
              <Text style={styles.employeeName}>{item.name}</Text>
            </TouchableOpacity>
            <Button
              title="Delete"
              onPress={() => {
                console.log(`Delete button pressed for id: ${item.id}`);
                Alert.alert("Test", "This is a test alert");
                handleDelete(item.id);
              }}
            />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  employeeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  employeeName: {
    fontSize: 18,
  },
});

export default EmployeeListScreen;
