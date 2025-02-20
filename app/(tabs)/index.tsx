import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'react-native';
import { Plus, Search, SlidersHorizontal } from 'lucide-react-native';
import apiClient from '../../utils/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Product } from '~/types/product.types';
import FilterModal from '~/components/filter';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get('/products');
      setProducts(response.data);
      setFilteredProducts(response.data);
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

  const handleFiltersApplied = (filters: {
    name: string;
    type: string;
    price: string;
    supplier: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }) => {
    let filtered = products;

    if (filters.name) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    if (filters.type) {
      filtered = filtered.filter((product) =>
        product.type.toLowerCase().includes(filters.type.toLowerCase())
      );
    }
    if (filters.price) {
      filtered = filtered.filter((product) => product.price.toString().includes(filters.price));
    }
    if (filters.supplier) {
      filtered = filtered.filter((product) =>
        product.supplier.toLowerCase().includes(filters.supplier.toLowerCase())
      );
    }

    switch (filters.sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'quantity':
        filtered
        .sort(
          (a, b) =>
            a.stocks.reduce((sum, stock) => sum + stock.quantity, 0) -
            b.stocks.reduce((sum, stock) => sum + stock.quantity, 0)
        );
        break;
      default:
        break;
    }

    if (filters.sortOrder === 'desc') {
      filtered = filtered.reverse();
    }

    setFilteredProducts(filtered);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(text.toLowerCase()) ||
        product.type.toLowerCase().includes(text.toLowerCase()) ||
        product.price.toString().includes(text) ||
        product.supplier.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="flex-row items-center justify-between bg-white px-4 py-2 shadow-sm">
        <View className="mr-2 flex-1 flex-row items-center rounded-lg border border-gray-200 px-2 py-1">
          <Search size={20} color="#666" />
          <TextInput
            className="ml-2 flex-1 text-gray-700"
            placeholder="Rechercher un produit..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
        <TouchableOpacity
          onPress={() => setIsModalVisible(true)}
          className="rounded-lg bg-gray-200 p-2">
          <SlidersHorizontal size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <FilterModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onApplyFilters={handleFiltersApplied}
      />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      ) : (
        <ScrollView
          className="px-4 py-2"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          {filteredProducts.map((product) => (
            <TouchableOpacity
              key={product.id}
              onPress={() =>
                router.push({
                  pathname: '/product/[id]',
                  params: {
                    id: product.id,
                    name: product.name,
                    image: product.image,
                    price: product.solde ?? product.price,
                    type: product.type,
                    stocks: JSON.stringify(product.stocks),
                  },
                })
              }
              className="mb-4 rounded-lg bg-white p-4 shadow-sm">
              <View className="flex-row">
                <Image source={{ uri: product.image }} className="h-20 w-20 rounded-lg" />
                <View className="ml-4 flex-1">
                  <Text className="text-lg font-bold text-gray-800">{product.name}</Text>
                  <Text className="text-base text-gray-600">{product.type}</Text>
                  <View className="mt-2 flex-row items-center">
                    <Text className="text-base font-bold text-gray-800">
                      {product.solde ?? product.price} $
                    </Text>
                    {product.solde && product.solde < product.price && (
                      <Text className="ml-2 text-base text-red-500 line-through">
                        {product.price} $
                      </Text>
                    )}
                  </View>
                  <View className="mt-2 flex-row items-center">
                    <Text
                      className={[
                        'rounded-lg px-2 py-1 text-sm font-bold',
                        product.stocks.reduce((sum, stock) => sum + stock.quantity, 0) > 10
                          ? 'bg-green-100 text-green-700'
                          : product.stocks.reduce((sum, stock) => sum + stock.quantity, 0) > 0
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700',
                      ].join(' ')}>
                      {product.stocks.reduce((sum, stock) => sum + stock.quantity, 0) > 0
                        ? 'En Stock'
                        : 'Rupture de Stock'}
                    </Text>
                    <Text className="ml-2 text-sm text-gray-600">
                      Total: {product.stocks.reduce((sum, stock) => sum + stock.quantity, 0)} unités
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity
        className="absolute bottom-6 right-6 rounded-full bg-yellow-400 p-4 shadow-lg"
        onPress={() => router.push('/product/create')}>
        <Plus size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
