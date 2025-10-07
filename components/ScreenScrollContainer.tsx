import React from "react";
import { Platform, ScrollView, View, ViewStyle } from "react-native";

type Props = {
  contentPadding?: number;
  spacing?: number;
  padBottom?: number;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
};

export default function ScreenScrollContainer({
  children,
  contentPadding = 0,
  spacing = 0,
  padBottom = 0,
  style,
  contentContainerStyle,
}: React.PropsWithChildren<Props>) {
  if (Platform.OS === "web") {
    return (
      <View
        style={[
          {
            flex: 1,
            width: "100%",
            height: "100%",
            overflow: "auto",
          },
          style,
        ]}
      >
        <View
          style={[
            {
              padding: contentPadding,
              paddingBottom: padBottom,
              minHeight: "100%",
              display: "flex",
              flexDirection: "column",
            },
            contentContainerStyle,
          ]}
        >
          {children}
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[{ flex: 1 }, style]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator
      contentContainerStyle={[
        {
          padding: contentPadding,
          paddingBottom: padBottom,
        },
        contentContainerStyle,
      ]}
    >
      {children}
    </ScrollView>
  );
}
