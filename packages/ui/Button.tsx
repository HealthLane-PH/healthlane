import { TouchableOpacity, Text } from "react-native";
import { cn } from "./utils";

export type ButtonProps = {
  title: string;
  onPress?: () => void;
  className?: string;
};

export function Button({ title, onPress, className }: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={cn(
        "bg-[#1bae69] py-3 px-5 rounded-xl items-center justify-center",
        className
      )}
    >
      <Text className="text-white font-semibold">{title}</Text>
    </TouchableOpacity>
  );
}