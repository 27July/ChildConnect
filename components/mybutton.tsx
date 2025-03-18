import { TouchableOpacity, Text } from "react-native";

type MyButtonProps = {
  title: string;
  onPress: () => void;
};

export function MyButton({ title, onPress }: MyButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-primary-400 px-6 py-3 rounded-full"
    >
      <Text className="text-white text-lg font-bold">{title}</Text>
    </TouchableOpacity>
  );
}
