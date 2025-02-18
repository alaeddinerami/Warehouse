import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Plus, Save, X, Image as ImageIcon } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCameraPermissions } from 'expo-camera';
import { productFormService, warehouses } from '../services/productFormService';
import { ProductFormState, ProductFormErrors } from '../../types/product-form.types';

export default function ProductFormScreen() {
  const [formData, setFormData] = useState<ProductFormState>({
    name: '',
    type: '',
    barcode: '',
    price: '',
    solde: '',
    supplier: '',
    image: '',
    stocks: [],
  });
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const params = useLocalSearchParams();

  
  useEffect(() => {
    if (params.scannedBarcode) {
      setFormData(prev => ({
        ...prev,
        barcode: params.scannedBarcode as string
      }));
      setErrors(prev => ({ ...prev, barcode: '' }));
    }
  }, [params.scannedBarcode]);

  const handleScanPress = async () => {
    if (!permission?.granted) {
      const permissionResult = await requestPermission();
      if (permissionResult.granted) {        
        router.push('/qr-scanner');
      } else {
        Alert.alert('Permission Required', 'Camera permission is required to scan QR codes', [
          { text: 'OK' },
        ]);
      }
    } else {
      router.push('/qr-scanner');
    }
  };

  const handleImagePick = async () => {
    const imageUri = await productFormService.pickImage();
    if (imageUri) {
      setFormData({ ...formData, image: imageUri });
    }
  };

  const handleAddStock = () => {
    setFormData({
      ...formData,
      stocks: [...formData.stocks, { warehouseId: 0, quantity: '' }],
    });
  };

  const handleStockChange = (index: number, field: string, value: string | number) => {
    const newStocks = [...formData.stocks];
    newStocks[index] = { ...newStocks[index], [field]: value };
    setFormData({ ...formData, stocks: newStocks });
  };

  const handleSubmit = async () => {
    const validationErrors = productFormService.validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await productFormService.createProduct(formData);
      router.push('/(tabs)');
      Alert.alert('Succès', 'Produit créé avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la création du produit');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <SafeAreaView className="h-full p-4">
      <ScrollView className="flex bg-gray-100 " showsVerticalScrollIndicator={false}>
        <View className="mb-6 flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-gray-900"> créer Produit</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)')}>
            <X size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <View className="mb-6 items-center">
          <TouchableOpacity
            onPress={handleImagePick}
            className="h-32 w-32 items-center justify-center rounded-lg bg-gray-200">
            <ImageIcon size={40} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <View className="space-y-4">
          <View>
            <Text className="mb-1 text-sm font-medium text-gray-700">Nom du produit *</Text>
            <TextInput
              className={`rounded-lg bg-white p-3 ${errors.name ? 'border border-red-500' : ''}`}
              placeholder="Nom du produit"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
            {errors.name && <Text className="mt-1 text-sm text-red-500">{errors.name}</Text>}
          </View>

          <View>
            <Text className="mb-1 text-sm font-medium text-gray-700">Type de produit *</Text>
            <View className="rounded-lg bg-white">
              <TextInput
              value={formData.type}
              placeholder="Type du produit"
              onChangeText={(text) => setFormData({ ...formData, type: text })}>
                

              </TextInput>
            </View>
          </View>
          <View>
            <Text className="mb-1 text-sm font-medium text-gray-700">Code-barres *</Text>
            <View className="flex-row-reverse justify-between space-x-2 px-5">
              <TouchableOpacity
                onPress={handleScanPress}
                className="rounded-lg bg-yellow-500 px-4 py-2">
                <Text className="font-medium text-white">Scan QR Code</Text>
              </TouchableOpacity>
              <TextInput
                className={`min-w-44 rounded-lg bg-white p-3 ${errors.barcode ? 'border border-red-500' : ''}`}
                placeholder="AD54653V"
                value={formData.barcode}
                onChangeText={(text) => setFormData({ ...formData, barcode: text })}
                keyboardType="numeric"
              />
            </View>
            {errors.barcode && <Text className="mt-1 text-sm text-red-500">{errors.barcode}</Text>}
          </View>

          <View>
            <Text className="mb-1 text-sm font-medium text-gray-700">Prix (DH) *</Text>
            <TextInput
              className={`rounded-lg bg-white p-3 ${errors.price ? 'border border-red-500' : ''}`}
              placeholder="Prix"
              value={formData.price}
              onChangeText={(text) => setFormData({ ...formData, price: text })}
              keyboardType="decimal-pad"
            />
            {errors.price && <Text className="mt-1 text-sm text-red-500">{errors.price}</Text>}
          </View>

          <View>
            <Text className="mb-1 text-sm font-medium text-gray-700">Prix soldé (DH)</Text>
            <TextInput
              className="rounded-lg bg-white p-3"
              placeholder="Prix soldé"
              value={formData.solde}
              onChangeText={(text) => setFormData({ ...formData, solde: text })}
              keyboardType="decimal-pad"
            />
          </View>

          <View>
            <Text className="mb-1 text-sm font-medium text-gray-700">Fournisseur *</Text>
            <TextInput
              className={`rounded-lg bg-white p-3 ${errors.supplier ? 'border border-red-500' : ''}`}
              placeholder="Fournisseur"
              value={formData.supplier}
              onChangeText={(text) => setFormData({ ...formData, supplier: text })}
            />
            {errors.supplier && (
              <Text className="mt-1 text-sm text-red-500">{errors.supplier}</Text>
            )}
          </View>

          {/* Stock Management */}
          <View className="mt-6">
            <Text className="mb-4 text-lg font-semibold">Gestion du Stock</Text>

            {formData.stocks.map((stock, index) => (
              <View key={index} className="mb-4 rounded-lg bg-white p-4">
                <Text className="mb-2 text-sm font-medium text-gray-700">Entrepôt {index + 1}</Text>
                <View className="mb-3">
                  <Picker
                    selectedValue={stock.warehouseId}
                    onValueChange={(value) => handleStockChange(index, 'warehouseId', value)}>
                    <Picker.Item label="Sélectionner un entrepôt" value={0} />
                    {warehouses.map((warehouse) => (
                      <Picker.Item
                        key={warehouse.id}
                        label={`${warehouse.name} (${warehouse.localisation.city})`}
                        value={warehouse.id}
                      />
                    ))}
                  </Picker>
                </View>

                <TextInput
                  className="rounded-lg bg-gray-100 p-3"
                  placeholder="Quantité"
                  value={stock.quantity}
                  onChangeText={(text) => handleStockChange(index, 'quantity', text)}
                  keyboardType="numeric"
                />

                {errors[`stock-${index}`] && (
                  <Text className="mt-1 text-sm text-red-500">{errors[`stock-${index}`]}</Text>
                )}
              </View>
            ))}

            <TouchableOpacity
              className="items-center rounded-lg bg-yellow-100 p-3"
              onPress={handleAddStock}>
              <Text className="font-medium text-yellow-600">+ Ajouter un entrepôt</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          className="mt-8 flex-row items-center justify-center rounded-lg bg-yellow-500 p-4"
          onPress={handleSubmit}
          disabled={isSubmitting}>
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Save size={20} color="white" className="mr-2" />
              <Text className="text-lg font-medium text-white">Enregistrer le produit</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
