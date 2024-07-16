import { Tabs } from "expo-router";
import React, { useContext } from "react";

import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { AuthContext, AuthProvider, useAuth } from "../../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const ctx = useContext(AuthContext);

  return (
    <AuthProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          headerShown: false,
        }}
      >
        {!ctx?.user?.getIdToken() && (
          <Tabs.Screen
            name="index"
            options={{
              title: "Página Inicial",
              tabBarIcon: ({ color, focused }) => (
                <TabBarIcon
                  name={focused ? "home" : "home-outline"}
                  color={color}
                />
              ),
            }}
          />
        )}
        {ctx?.user?.getIdToken() && (
          <Tabs.Screen
            name="employees"
            options={{
              title: "Trabalhadores",
              tabBarIcon: ({ color, focused }) => (
                <TabBarIcon
                  name={focused ? "man" : "man-sharp"}
                  color={color}
                />
              ),
            }}
          />
        )}
      </Tabs>
    </AuthProvider>
  );
}
