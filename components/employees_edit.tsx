import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { getDatabase, ref, set, push } from "firebase/database";
import { RouteProp, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../app/(tabs)/index";

interface EmployeeEditScreenProps {
  route: RouteProp<RootStackParamList, "EditEmployee">;
  navigation: NavigationProp<RootStackParamList, "EditEmployee">;
}

const EmployeeEditScreen: React.FC<EmployeeEditScreenProps> = ({
  route,
  navigation,
}) => {
  const [name, setName] = useState("");
  const [startYear, setStartYear] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [department, setDepartment] = useState("");

  const employee = route.params?.employee;

  useEffect(() => {
    if (employee) {
      setName(employee.name);
      setStartDate(employee.startDate);
      setEndDate(employee.endDate || "");
      setDepartment(employee.department || "");
      setStartYear(employee.startYear || "");
    }
  }, [employee]);

  const handleSave = () => {
    const db = getDatabase();
    const employeesRef = ref(db, "/employees");
    const newEmployee = { name, startYear, startDate, endDate, department };

    if (employee) {
      // Update existing employee
      set(ref(db, `/employees/${employee.id}`), newEmployee)
        .then(() => {
          alert("Trabalhador editado com sucesso.");
          navigation.goBack();
        })
        .catch((error) => {
          console.error(error);
          Alert.alert("Erro na edição de trabalhador.");
        });
    } else {
      // Add new employee
      const newEmployeeRef = push(employeesRef);
      set(newEmployeeRef, newEmployee)
        .then(() => {
          Alert.alert("Trabalhador adicionado com sucesso.");
          navigation.goBack();
        })
        .catch((error) => {
          console.error(error);
          Alert.alert("Erro ao adicionar trabalhador.");
        });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {employee ? "Editar Trabalhador" : "Adicionar Trabalhador"}
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Ano de Entrada na DGADR"
        value={startYear}
        onChangeText={setStartYear}
      />
      <TextInput
        style={styles.input}
        placeholder="Data de Início de Funções"
        value={startDate}
        onChangeText={setStartDate}
      />
      <TextInput
        style={styles.input}
        placeholder="Data de Fim de Funções"
        value={endDate}
        onChangeText={setEndDate}
      />
      <TextInput
        style={styles.input}
        placeholder="Divisão ou Direção de Serviços"
        value={department}
        onChangeText={setDepartment}
      />
      <Button title="Guardar" onPress={handleSave} />
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

export default EmployeeEditScreen;
