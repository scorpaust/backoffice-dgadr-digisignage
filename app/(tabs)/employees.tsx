import React, { useState, useEffect, useContext } from "react";
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
import { Employee } from "../../constants/Types";
import { AuthContext } from "../../context/AuthContext";
import EmployeeEditSimple from "../../components/EmployeeEditSimple";

const EmployeesScreen: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const authCtx = useContext(AuthContext);

  useEffect(() => {
    const db = getDatabase();
    const employeesRef = ref(db, `/employees`);
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
      const db = getDatabase();
      await remove(ref(db, `/employees/${id}`));
      console.log(`Removido trabalhador com id: ${id}`);
      Alert.alert("Trabalhador removido com sucesso.");
    } catch (error) {
      console.error(`Falha na remoção de trabalhador com id: ${id}`, error);
      Alert.alert("Falha a remover o trabalhador.");
    }
  };

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setIsEditing(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditing(true);
  };

  const handleCloseEdit = () => {
    setIsEditing(false);
    setSelectedEmployee(null);
  };

  if (isEditing) {
    return (
      <EmployeeEditSimple
        employee={selectedEmployee}
        onClose={handleCloseEdit}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestão de Funcionários</Text>
      <Button
        title="Adicionar Entrada/Saída de Trabalhador"
        onPress={handleAddEmployee}
      />
      <View style={styles.exitButton}>
        <Button title="Sair" onPress={authCtx.logout} />
      </View>
      <FlatList
        data={employees}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.employeeContainer}>
            <TouchableOpacity onPress={() => handleEditEmployee(item)}>
              <Text style={styles.employeeName}>{item.name}</Text>
              {item.department && (
                <Text style={styles.employeeDepartment}>{item.department}</Text>
              )}
            </TouchableOpacity>
            <Button
              title="Apagar"
              onPress={() => {
                console.log(`Delete button pressed for id: ${item.id}`);
                Alert.alert(
                  "Confirmar eliminação",
                  `Tem certeza que deseja eliminar ${item.name}?`,
                  [
                    {
                      text: "Cancelar",
                      style: "cancel",
                    },
                    {
                      text: "Eliminar",
                      style: "destructive",
                      onPress: () => handleDelete(item.id),
                    },
                  ]
                );
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  exitButton: {
    marginTop: 16,
    marginBottom: 20,
  },
  employeeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  employeeName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  employeeDepartment: {
    fontSize: 14,
    color: "#666",
  },
});

export default EmployeesScreen;
