import { useLocalSearchParams } from "expo-router";
import { View, Text, Image, SafeAreaView, ScrollView } from "react-native";

export default function ProductDetails() {
  const params = useLocalSearchParams();

  const id = params.id as string;
  const name = params.name as string;
  const image = params.image as string;
  const type = params.type as string;
  const price = Number(params.price); 

  return (
    <SafeAreaView className="flex-1 bg-gray-100 p-4">

    <ScrollView>
      <Image source={{ uri: image }} style={{ width: "100%", height: 300, borderRadius: 10 }} />
      <Text className="text-2xl font-bold mt-4">{name}</Text>
      <Text className="text-gray-600">{type}</Text>
      <Text className="text-lg font-semibold mt-2">{price.toFixed(2)} DH</Text>
    </ScrollView>
    </SafeAreaView>
  );
}
