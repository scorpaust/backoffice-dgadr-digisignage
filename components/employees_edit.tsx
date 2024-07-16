import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { getDatabase, ref, set, push } from "firebase/database";
import { RouteProp, NavigationProp } from "@react-navigation/native";
import { Employee } from "../constants/Types"; // Ensure you have a types file for shared types
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
    }
  }, [employee]);

  const handleSave = () => {
    const db = getDatabase();
    const employeesRef = ref(db, "/employees");
    const newEmployee = { name, startDate, endDate, department };

    if (employee) {
      // Update existing employee
      set(ref(db, `/employees/${employee.id}`), newEmployee)
        .then(() => {
          Alert.alert("Success", "Employee updated successfully");
          navigation.goBack();
        })
        .catch((error) => {
          console.error(error);
          Alert.alert("Error", "Failed to update employee");
        });
    } else {
      // Add new employee
      const newEmployeeRef = push(employeesRef);
      set(newEmployeeRef, newEmployee)
        .then(() => {
          Alert.alert("Success", "Employee added successfully");
          navigation.goBack();
        })
        .catch((error) => {
          console.error(error);
          Alert.alert("Error", "Failed to add employee");
        });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {employee ? "Edit Employee" : "Add Employee"}
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Start Date"
        value={startDate}
        onChangeText={setStartDate}
      />
      <TextInput
        style={styles.input}
        placeholder="End Date"
        value={endDate}
        onChangeText={setEndDate}
      />
      <TextInput
        style={styles.input}
        placeholder="Department"
        value={department}
        onChangeText={setDepartment}
      />
      <Button title="Save" onPress={handleSave} />
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
