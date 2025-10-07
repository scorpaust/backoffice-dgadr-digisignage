import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { getDatabase, ref, set, push } from "firebase/database";
import { Employee } from "../constants/Types";

interface EmployeeEditSimpleProps {
  employee?: Employee | null;
  onClose: () => void;
}

const EmployeeEditSimple: React.FC<EmployeeEditSimpleProps> = ({
  employee,
  onClose,
}) => {
  const [name, setName] = useState("");
  const [startYear, setStartYear] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [department, setDepartment] = useState("");

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
          Alert.alert("Sucesso", "Trabalhador editado com sucesso.");
          onClose();
        })
        .catch((error) => {
          console.error(error);
          Alert.alert("Erro", "Erro na edição de trabalhador.");
        });
    } else {
      // Add new employee
      const newEmployeeRef = push(employeesRef);
      set(newEmployeeRef, newEmployee)
        .then(() => {
          Alert.alert("Sucesso", "Trabalhador adicionado com sucesso.");
          onClose();
        })
        .catch((error) => {
          console.error(error);
          Alert.alert("Erro", "Erro ao adicionar trabalhador.");
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
      <View style={styles.buttonContainer}>
        <Button title="Guardar" onPress={handleSave} />
        <Button title="Cancelar" onPress={onClose} color="#ff6b6b" />
      </View>
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
    fontWeight: "bold",
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    marginTop: 20,
    gap: 10,
  },
});

export default EmployeeEditSimple;