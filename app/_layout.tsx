import { Stack } from "expo-router";
import { GlobalProvider } from "@/Context/GlobalStates";

export default function RootLayout() {
  return (
    <GlobalProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="home/index" />
      </Stack>
    </GlobalProvider>
  );
}
