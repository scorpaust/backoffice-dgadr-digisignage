import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useState, ReactNode, useEffect } from "react";

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  authenticate: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  isAuthenticated: false,
  authenticate: () => {},
  logout: () => {},
});

interface AuthContextProviderProps {
  children: ReactNode;
}

const AuthContextProvider: React.FC<AuthContextProviderProps> = ({
  children,
}) => {
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    async function loadStoredToken() {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        if (storedToken) {
          setAuthToken(storedToken);
        }
      } catch (error) {
        console.error("Failed to load stored token:", error);
      }
    }

    loadStoredToken();
  }, []);

  function authenticate(token: string) {
    setAuthToken(token);
    AsyncStorage.setItem("token", token);
  }

  function logout() {
    setAuthToken(null);
    AsyncStorage.removeItem("token");
  }

  const value: AuthContextType = {
    token: authToken,
    isAuthenticated: !!authToken,
    authenticate: authenticate,
    logout: logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContextProvider;
