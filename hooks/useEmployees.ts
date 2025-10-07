import { useState, useEffect, useCallback, useMemo } from 'react';
import { getDatabase, ref, onValue, off, remove } from 'firebase/database';
import { Employee } from '../constants/Types';

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const db = getDatabase();
    const employeesRef = ref(db, '/employees');
    
    const listener = onValue(
      employeesRef,
      (snapshot) => {
        try {
          const data = snapshot.val();
          const employeesList = data
            ? Object.keys(data).map((key) => ({ ...data[key], id: key }))
            : [];
          setEmployees(employeesList);
          setError(null);
        } catch (err) {
          setError('Erro ao carregar funcionários');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError('Erro ao conectar com a base de dados');
        setLoading(false);
      }
    );

    return () => {
      off(employeesRef, 'value', listener);
    };
  }, []);

  const deleteEmployee = useCallback(async (id: string): Promise<boolean> => {
    try {
      const db = getDatabase();
      await remove(ref(db, `/employees/${id}`));
      return true;
    } catch (error) {
      console.error('Erro ao remover funcionário:', error);
      return false;
    }
  }, []);

  // Memoização para filtros e ordenação
  const sortedEmployees = useMemo(() => {
    return [...employees].sort((a, b) => a.name.localeCompare(b.name));
  }, [employees]);

  const employeesByDepartment = useMemo(() => {
    return employees.reduce((acc, employee) => {
      const dept = employee.department || 'Sem Departamento';
      if (!acc[dept]) {
        acc[dept] = [];
      }
      acc[dept].push(employee);
      return acc;
    }, {} as Record<string, Employee[]>);
  }, [employees]);

  return {
    employees: sortedEmployees,
    employeesByDepartment,
    loading,
    error,
    deleteEmployee,
    totalEmployees: employees.length,
  };
};