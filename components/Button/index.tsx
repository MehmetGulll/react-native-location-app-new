import { View, Text, TouchableOpacity } from "react-native";
import React from "react";

type ButtonProps = {
  text?: string;
  onPress?: () => void;
  backgroundColor?: string;
  color?: string;
  padding?: number;
  fontSize?:number;
  fontWeight?: string;
  alignItems?: "flex-start" | "flex-end" | "center" | "stretch" ;
  flex?: number;
  borderRadius:number;
  borderWidth:number
};

export default function Button({
  text,
  onPress,
  padding,
  backgroundColor,
  color,
  fontSize,
  alignItems = "center",
  flex,
  borderRadius,
  borderWidth

}: ButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} style={{ padding, backgroundColor, alignItems, flex,borderWidth, borderRadius }}>
      <Text style={{ color, fontSize,  }}>{text}</Text>
    </TouchableOpacity>
  );
}
