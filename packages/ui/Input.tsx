import { TextInput } from "react-native";
import { cn } from "./utils";


export type InputProps = {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  className?: string;
  secureTextEntry?: boolean;
};

export function Input({
  placeholder,
  value,
  onChangeText,
  className,
  secureTextEntry,
}: InputProps) {
  return (
    <TextInput
      className={cn(
        "border border-gray-300 rounded-xl px-4 py-3 text-base bg-white",
        className
      )}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
    />
  );
}