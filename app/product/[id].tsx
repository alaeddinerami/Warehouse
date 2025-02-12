import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import apiClient from '../(utils)/api';

interface Product {
  id: number;
  name: string;
  type: string;
  barcode: string;
  price: number;
  solde?: number;
  supplier: string;
  image: string;
  stocks: {
    id: number;
    name:string,
    quantity: number;
  }[];
}

export default function ProductDetails() {
  const params = useLocalSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [adjustment, setAdjustment] = useState({
    quantity: '',
    warehouseId: ''
  });

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await apiClient.get(`/products/${params.id}`);
        setProduct(response.data);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [params.id]);

  const handleStockUpdate = async (action: 'add' | 'remove') => {
    if (!product) return;

    if (!adjustment.quantity || !adjustment.warehouseId) {
      Alert.alert('Error', 'Please select warehouse and enter quantity');
      return;
    }

    const quantity = parseInt(adjustment.quantity);
    if (isNaN(quantity)) {
      Alert.alert('Error', 'Please enter valid quantity');
      return;
    }

    try {
      setLoading(true);
      const updatedStocks = product.stocks.map(stock => 
        stock.id === parseInt(adjustment.warehouseId)
          ? { ...stock, quantity: action === 'add' ? stock.quantity + quantity : stock.quantity - quantity }
          : stock
      );

      const response = await apiClient.patch(`/products/${product.id}`, {
        stocks: updatedStocks
      });

      setProduct({ ...product, stocks: response.data.stocks });
      setAdjustment({ quantity: '', warehouseId: '' });
      Alert.alert('Success', `Stock ${action === 'add' ? 'added' : 'removed'}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update stock');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !product) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const totalStock = product.stocks.reduce((sum, stock) => sum + stock.quantity, 0);
  const stockStatus = totalStock > 10 ? 'En stock' : totalStock > 0 ? 'Stock faible' : 'Rupture de stock';
  const stockColor = totalStock > 10 ? 'bg-green-100 text-green-800' : 
                    totalStock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800';

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView className="flex-1">
        <View className="bg-white shadow-sm">
          <Image
            source={{ uri: product.image }}
            className="w-full h-64"
            accessibilityLabel="Product image"
          />
          <View className="p-4">
            <Text className="text-2xl font-bold text-gray-800">{product.name}</Text>
            <Text className="text-lg text-gray-600 mt-1">{product.type}</Text>
            <View className="flex-row items-center mt-2">
              <Text className="text-xl font-semibold text-blue-600">
                {product.solde || product.price} DH
              </Text>
              {product.solde && (
                <Text className="ml-2 text-red-500 line-through">{product.price} DH</Text>
              )}
            </View>
          </View>
        </View>

        <View className="mt-4 p-4 bg-white shadow-sm">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold">Gestion du Stock</Text>
            <View className={`px-2 py-1 rounded-full ${stockColor}`}>
              <Text className="text-sm font-medium">{stockStatus}</Text>
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-gray-600 mb-2">Sélectionner l'entrepôt:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {product.stocks.map(stock => (
                <TouchableOpacity
                  key={stock.id}
                  className={`px-4 py-2 rounded-lg mr-2 ${
                    adjustment.warehouseId === String(stock.id)
                      ? 'bg-blue-500'
                      : 'bg-gray-200'
                  }`}
                  onPress={() => setAdjustment(prev => ({
                    ...prev,
                    warehouseId: String(stock.id)
                  }))}
                >
                  <Text className={`font-medium ${
                    adjustment.warehouseId === String(stock.id)
                      ? 'text-white'
                      : 'text-gray-800'
                  }`}>
                     {stock.name}
                  </Text>
                  <Text className={`text-xs ${
                    adjustment.warehouseId === String(stock.id)
                      ? 'text-blue-100'
                      : 'text-gray-600'
                  }`}>
                    {stock.quantity} unités
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TextInput
            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4"
            placeholder="Quantité à ajuster"
            keyboardType="numeric"
            value={adjustment.quantity}
            onChangeText={text => setAdjustment(prev => ({ ...prev, quantity: text }))}
          />

          <View className="flex-row gap-2">
            <TouchableOpacity
              className="flex-1 bg-green-500 py-3 rounded-lg items-center"
              onPress={() => handleStockUpdate('add')}
              disabled={loading}
            >
              <Text className="text-white font-semibold">Réapprovisionner</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-red-500 py-3 rounded-lg items-center"
              onPress={() => handleStockUpdate('remove')}
              disabled={loading}
            >
              <Text className="text-white font-semibold">Décharger</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mt-4 p-4 bg-white shadow-sm">
          <Text className="text-lg font-semibold mb-4">Détails du Produit</Text>
          
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-600">Code-barres:</Text>
            <Text className="font-medium">{product.barcode}</Text>
          </View>

          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-600">Fournisseur:</Text>
            <Text className="font-medium">{product.supplier}</Text>
          </View>

          <View className="flex-row justify-between items-center">
            <Text className="text-gray-600">Stock Total:</Text>
            <Text className="font-medium">{totalStock} unités</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}