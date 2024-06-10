import React from "react";
import { TextInput, View, StyleSheet } from "react-native";

type InputProps = {
  placeholder?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  textAlign?: "left" | "center" | "right";
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  maxLength?: number;
  value: string;
};

export default function Input({
  placeholder,
  onChangeText,
  secureTextEntry = false,
  textAlign = "left",
  keyboardType = "default",
  maxLength,
  value,
}: InputProps) {
  return (
    <View>
      <TextInput
        style={styles.inputInformation}
        placeholder={placeholder}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        textAlign={textAlign}
        keyboardType={keyboardType}
        maxLength={maxLength}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputInformation: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderColor: "black",
    width: "100%",
    marginTop: 10,
    padding: 10,
  },
});
