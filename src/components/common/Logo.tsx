import { Image } from "react-native";

type LogoProps = {
  size?: number;
};

export function Logo({ size = 110 }: LogoProps) {
  return (
    <Image
      source={require("../../../assets/brand/splash-logo.png")}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
}