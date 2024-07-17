import { Tabs } from "expo-router";
import React, { useContext } from "react";

import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../../context/AuthContext";

const colorScheme = useColorScheme();

function AuthTabStack() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
      }}
    >
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
    </Tabs>
  );
}

function AuthenticatedTabStack() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="employees"
        options={{
          title: "Trabalhadores",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? "man" : "man-sharp"} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  const authCtx = useContext(AuthContext);

  return (
    <>
      {authCtx.isAuthenticated == false && <AuthTabStack />}
      {authCtx.isAuthenticated == true && <AuthenticatedTabStack />}
    </>
  );
}
