import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Button,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { productService } from '../services/productServiceDeatails';
import { Product, StockAdjustment } from '../../types/product.types';
import * as Print from 'expo-print';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function ProductDetails() {
  const params = useLocalSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [adjustment, setAdjustment] = useState<StockAdjustment>({
    quantity: '',
    warehouseId: '',
  });

  useEffect(() => {
    fetchProductDetails();
  }, [params.id]);

  const fetchProductDetails = async () => {
    try {
      const data = await productService.getProductDetails(params.id as any);
      setProduct(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch product details');
    } finally {
      setLoading(false);
    }
  };

  const handleStockUpdate = async (action: 'add' | 'remove') => {
    if (!product) return;

    const validationError = productService.validateStockAdjustment(adjustment);
    if (validationError) {
      Alert.alert('Error', validationError);
      return;
    }

    try {
      setLoading(true);
      const updatedProduct = await productService.updateProductStock(product, adjustment, action);
      setProduct(updatedProduct);
      setAdjustment({ quantity: '', warehouseId: '' });
      Alert.alert('Success', `Stock ${action === 'add' ? 'added' : 'removed'}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update stock');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintPDF = async () => {
    if (!product) return;

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            .product-image { width: 100%; height: auto; }
            .product-details { margin-top: 20px; }
            .product-details p { margin: 5px 0; }
            .stock-status { margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>${product.name}</h1>
          <div class="product-details">
            <p><strong>Type:</strong> ${product.type}</p>
            <p><strong>Price:</strong> ${product.solde || product.price} DH</p>
            ${product.solde ? `<p><strong>Original Price:</strong> <s>${product.price} DH</s></p>` : ''}
            <p><strong>Barcode:</strong> ${product.barcode}</p>
            <p><strong>Supplier:</strong> ${product.supplier}</p>
            <p><strong>Total Stock:</strong> ${productService.calculateStockStatus(product).totalStock} units</p>
          </div>
        </body>
      </html>
    `;

    try {
      await Print.printAsync({
        html: htmlContent,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  if (loading || !product) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const {
    totalStock,
    status: stockStatus,
    color: stockColor,
  } = productService.calculateStockStatus(product);

  return (
    <SafeAreaView className="flex-1 bg-gray-100 p-2">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="bg-white shadow-sm">
          <TouchableOpacity onPress={() => router.push('/(tabs)')}>
            <ArrowLeft size={32} color="#6b7292" />
          </TouchableOpacity>
          <Image
            source={{ uri: product.image }}
            className="h-64 w-full"
            accessibilityLabel="Product image"
          />
          <View className="p-4">
            <Text className="text-2xl font-bold text-gray-800">{product.name}</Text>

            <Text className="mt-1 text-lg text-gray-600">{product.type}</Text>
            <View className="mt-2 flex-row items-center">
              <Text className="text-xl font-semibold text-green-600">
                {product.solde || product.price} DH
              </Text>
              {product.solde && (
                <Text className="ml-2 text-red-500 line-through">{product.price} DH</Text>
              )}
            </View>
          </View>
        </View>

        <View className="mt-4 bg-white p-4 shadow-sm">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-semibold">Gestion du Stock</Text>
            <View className={`rounded-full px-2 py-1 ${stockColor}`}>
              <Text className="text-sm font-medium">{stockStatus}</Text>
            </View>
          </View>

          {totalStock !== 0 ? (
            <>
              <View className="mb-4">
                <Text className="mb-2 text-gray-600">Sélectionner l'entrepôt:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {product.stocks.map((stock) => (
                    <TouchableOpacity
                      key={stock.id}
                      className={`mr-2 rounded-lg px-4 py-2 ${
                        adjustment.warehouseId === String(stock.id)
                          ? 'bg-yellow-500'
                          : 'bg-gray-200'
                      }`}
                      onPress={() =>
                        setAdjustment((prev) => ({ ...prev, warehouseId: String(stock.id) }))
                      }>
                      <Text
                        className={`font-medium ${
                          adjustment.warehouseId === String(stock.id)
                            ? 'text-white'
                            : 'text-gray-800'
                        }`}>
                        {stock.name}
                      </Text>
                      <Text
                        className={`text-xs ${
                          adjustment.warehouseId === String(stock.id)
                            ? 'text-yellow-100'
                            : 'text-gray-600'
                        }`}>
                        {stock.quantity} unités
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <TextInput
                className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-3"
                placeholder="Quantité à ajuster"
                keyboardType="numeric"
                value={adjustment.quantity}
                onChangeText={(text) => setAdjustment((prev) => ({ ...prev, quantity: text }))}
              />

              <View className="flex-row gap-2">
                <TouchableOpacity
                  className="flex-1 items-center rounded-lg bg-yellow-500 py-3"
                  onPress={() => handleStockUpdate('add')}
                  disabled={loading}>
                  <AntDesign name="pluscircleo" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 items-center rounded-lg bg-red-500 py-3"
                  onPress={() => handleStockUpdate('remove')}
                  disabled={loading || totalStock === 0}>
                  <AntDesign name="minuscircleo" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <Text className="text-center text-red-500">
              Stock épuisé, veuillez réapprovisionner.
            </Text>
          )}
        </View>

        <View className="mt-4 bg-white p-4 shadow-sm">
          <Text className="mb-4 text-lg font-semibold">Détails du Produit</Text>
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-gray-600">Code-barres:</Text>
            <Text className="font-medium">{product.barcode}</Text>
          </View>
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-gray-600">Fournisseur:</Text>
            <Text className="font-medium">{product.supplier}</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600">Stock Total:</Text>
            <Text className="font-medium">{totalStock} unités</Text>
          </View>
        </View>
        <View className="mt-4 bg-white p-4 shadow-sm bg">
          <Button  title="Print Product Details" onPress={handlePrintPDF} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
