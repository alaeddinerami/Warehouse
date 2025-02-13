import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, RefreshControl, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'react-native';
import { Plus, Search } from 'lucide-react-native';
import apiClient from '../(utils)/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

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
    quantity: number;
  }[];
}

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="bg-white px-4 py-3 shadow-sm">
        <View className="flex-row products-center rounded-lg bg-gray-100 px-3 py-2">
          <Search size={20} color="#666" />
          <TextInput
            className="ml-2 flex-1 text-gray-700"
            placeholder="Rechercher un produit..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4 py-2"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          {filteredProducts.map((product) => {
            const totalStock = product.stocks.reduce((sum, stock) => sum + stock.quantity, 0);
            const hasDiscount = product.solde && product.solde < product.price;
            // console.log('Image URL:', product.image); 
            // {console.log(product.id)}
            return (
              <TouchableOpacity 
              key={product.id} 
              
              
              onPress={() => router.push({
                pathname: "/product/[id]",
                params: {
                  id: product.id,
                  name: product.name,
                  image: product.image,
                  price: product.solde ?? product.price,
                  type: product.type,
                  stocks: JSON.stringify(product.stocks),
                }
              })}
              className="mb-4 rounded-lg bg-white p-4 shadow-md">
                <View className="flex-row">
                  <Image source={{uri:product.image}} style={{ width: 80, height: 80 }} />
                  <View className="ml-4 flex-1">
                    <Text className="text-lg font-semibold text-gray-900">{product.name}</Text>
                    <Text className="text-gray-600">{product.type}</Text>
                    <View className="mt-1 flex-row products-center">
                      <Text className="font-bold text-gray-900">{product.solde ?? product.price} DH</Text>
                      {hasDiscount && (
                        <Text className="ml-2 text-red-500 line-through">{product.price} DH</Text>
                      )}
                    </View>
                    <View className="mt-2 flex-row products-center justify-between">
                      <Text
                        className={`rounded-full px-2 py-1 text-xs ${
                         totalStock > 10 ? "text-green-600" : totalStock > 0 ? "text-yellow-600" : "text-red-600"
                        }`}>
                        {totalStock > 0 ? 'En Stock' : 'Rupture de Stock'}
                      </Text>
                      <Text className="text-sm text-gray-500">Total: {totalStock} unités</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
       <TouchableOpacity
        className="absolute bottom-6 right-6 bg-yellow-600 p-4 rounded-full shadow-lg"
        onPress={() => {
          router.push('/product/create')
        }}
      >
        <Plus size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
