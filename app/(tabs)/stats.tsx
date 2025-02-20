import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchStatistics } from '../services/statistics';

interface Statistics {
  totalProducts: number;
  totalCities: number;
  outOfStock: number;
  totalStockValue: number;
  mostAddedProducts: {
    productId: number;
    productName: string;
    quantity: number;
  }[];
  mostRemovedProducts: {
    productId: number;
    productName: string;
    quantity: number;
  }[];
  stocksByCity: {
    city: string;
    totalProducts: number;
    totalQuantity: number;
  }[];
}

export default function Statistics() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const stats = await fetchStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View>
        <Text>Loading statistics...</Text>
      </View>
    );
  }

  if (!statistics) {
    return (
      <View>
        <Text>No statistics available</Text>
      </View>
    );
  }

  const pickProduct = (city: string) => {
    setSelectedCity(city);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView className="p-2">
        <View className="bg-white rounded-xl p-4 shadow-lg m-2">
          <Text className="text-xl font-bold text-gray-800 mb-4">Résumé des Stocks</Text>
          
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-600 text-base">Produits totaux:</Text>
            <Text className="text-gray-800 font-semibold text-base">{statistics.totalProducts}</Text>
          </View>

          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-600 text-base">Nombre de villes:</Text>
            <Text className="text-gray-800 font-semibold text-base">{statistics.totalCities}</Text>
          </View>

          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-600 text-base">Produits en rupture:</Text>
            <Text className="text-red-500 font-semibold text-base">{statistics.outOfStock}</Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-gray-600 text-base">Valeur totale des stocks:</Text>
            <Text className="text-green-600 font-semibold text-base">
              {statistics.totalStockValue.toLocaleString()} MAD
            </Text>
          </View>
        </View>

        <View className="bg-white rounded-xl p-4 shadow-lg m-2">
          <Text className="text-xl font-bold text-gray-800 mb-4">Stocks par Ville</Text>
          {statistics.stocksByCity.map(cityStats => (
            <View key={cityStats.city} className="mb-3">
              <View className='bg-yellow-600 text-white '>
                <TouchableOpacity className=" font-semibold p-5"
                  onPress={() => pickProduct(cityStats.city)}
                >
                  <Text className='text-white'>{cityStats.city}</Text>
                </TouchableOpacity>
              </View>
              {selectedCity === cityStats.city && (
                <Text className="text-gray-500 text-sm">
                  {cityStats.totalProducts} produits ({cityStats.totalQuantity} unités)
                </Text>
              )}
            </View>
          ))}
        </View>

        <View className="bg-white rounded-xl p-4 shadow-lg m-2">
          <Text className="text-xl font-bold text-gray-800 mb-4">Produits Récemment Modifiés</Text>
          {statistics.mostAddedProducts.map(product => (
            <View key={product.productId} className="mb-3">
              <Text className="text-gray-800 font-medium text-base">{product.productName}</Text>
              <Text className="text-gray-500 text-sm">Quantité: {product.quantity}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}