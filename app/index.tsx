import React, { useContext, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Input from "@/components/Input";
import Button from "@/components/Button";
import axios from "axios";
import { router } from "expo-router";
import { GlobalContext } from "@/Context/GlobalStates";
import { API_URLS } from "@/API/urls";

export default function Index() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { setUserStatus, setUserId } = useContext(GlobalContext);
  const handleLogin = async () => {
    console.log(username);
    console.log(password);
    try {
      const response = await axios.post(API_URLS.LOGIN, {
        username,
        password,
      });
      console.log(response.data);
      if (response.status === 200) {
        console.log(response.data.status);
        setUserStatus(response.data.status);
        setUserId(response.data.userId);
        router.push("home");
      } else {
        console.log("Hata");
      }
    } catch (error) {
      console.log("Error", error);
    }
  };
  return (
    <View style={styles.loginContainer}>
      <View>
        <Text style={styles.loginTextTitle}>Giriş Yap</Text>
      </View>
      <View style={styles.inputInformationsContainer}>
        <Input
          placeholder="Kullanıcı Adı"
          textAlign="center"
          value={username}
          onChangeText={setUsername}
        />
        <Input
          placeholder="Şifre"
          textAlign="center"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
        />

        <Button
          text="Giriş Yap"
          backgroundColor="#FFFFFF"
          borderRadius={15}
          borderWidth={1}
          padding={15}
          onPress={handleLogin}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loginContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loginTextTitle: {
    fontSize: 24,
    fontWeight: "500",
  },
  inputInformationsContainer: {
    flexDirection: "column",
    width: "100%",
    paddingHorizontal: 32,
    gap: 12,
  },
});
