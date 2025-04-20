import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import MainScreen from "./src/screens/main.screen";
import "./src/navigation/gesture-handler";

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <MainScreen />
    </SafeAreaView>
  );
}