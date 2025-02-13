import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Plus, Save, X, Image as ImageIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import apiClient from '../(utils)/api';
import { router } from 'expo-router';

// Predefined warehouse data based on db.json
const warehouses = [
  {
    id: 1999,
    name: 'Gueliz B2',
    localisation: {
      city: 'Marrakesh',
      latitude: 31.628674,
      longitude: -7.992047,
    },
  },
  {
    id: 2991,
    name: 'Lazari H2',
    localisation: {
      city: 'Oujda',
      latitude: 34.689404,
      longitude: -1.912823,
    },
  },
];

interface ProductFormState {
  name: string;
  type: string;
  barcode: string;
  price: string;
  solde?: string;
  supplier: string;
  image: string;
  stocks: Array<{
    warehouseId: number;
    quantity: string;
  }>;
}

export default function ProductFormScreen() {
  const [formData, setFormData] = useState<ProductFormState>({
    name: '',
    type: 'Informatique',
    barcode:  '',
    price: '',
    solde: '',
    supplier: '',
    image: '',
    stocks: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const productTypes = ['Informatique', 'Accessoires', 'Électronique', 'Autre'];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Le nom est requis';
    if (!formData.barcode) newErrors.barcode = 'Le code-barres est requis';
    if (!formData.price) newErrors.price = 'Le prix est requis';
    if (!formData.supplier) newErrors.supplier = 'Le fournisseur est requis';

    formData.stocks.forEach((stock, index) => {
      if (stock.quantity && !stock.warehouseId) {
        newErrors[`stock-${index}`] = 'Sélectionnez un entrepôt';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setFormData({ ...formData, image: result.assets[0].uri });
    }
  };

  const handleAddStock = () => {
    setFormData({
      ...formData,
      stocks: [...formData.stocks, { warehouseId: 0, quantity: '' }]
    });
  };

  const handleStockChange = (index: number, field: string, value: string | number) => {
    const newStocks = [...formData.stocks];
    newStocks[index] = { ...newStocks[index], [field]: value };
    setFormData({ ...formData, stocks: newStocks });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Transform stocks data to match db.json structure
      const formattedStocks = formData.stocks
        .filter(stock => stock.warehouseId && stock.quantity)
        .map(stock => {
          const warehouse = warehouses.find(w => w.id === stock.warehouseId);
          return {
            id: warehouse!.id,
            name: warehouse!.name,
            quantity: parseInt(stock.quantity),
            localisation: warehouse!.localisation
          };
        });

      const newProduct = {
        ...formData,
        price: parseFloat(formData.price),
        solde: formData.solde ? parseFloat(formData.solde) : undefined,
        stocks: formattedStocks,
        editedBy: [] // Will be populated by server
      };

      await apiClient.post('/products', newProduct);
      router.back();
      Alert.alert('Succès', 'Produit créé avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la création du produit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-100 p-4">
      <View className="mb-6 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-gray-900">Nouveau Produit</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Image Upload */}
      <View className="mb-6 items-center">
        <TouchableOpacity 
          onPress={handleImagePick}
          className="h-32 w-32 rounded-lg bg-gray-200 items-center justify-center"
        >
         
            <ImageIcon size={40} color="#9ca3af" />
          
        </TouchableOpacity>
      </View>

      {/* Form Fields */}
      <View className="space-y-4">
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">Nom du produit *</Text>
          <TextInput
            className={`bg-white p-3 rounded-lg ${errors.name ? 'border border-red-500' : ''}`}
            placeholder="Laptop HP Pavilion"
            value={formData.name}
            onChangeText={text => setFormData({ ...formData, name: text })}
          />
          {errors.name && <Text className="text-red-500 text-sm mt-1">{errors.name}</Text>}
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">Type de produit *</Text>
          <View className="bg-white rounded-lg">
            <Picker
              selectedValue={formData.type}
              onValueChange={value => setFormData({ ...formData, type: value })}
            >
              {productTypes.map(type => (
                <Picker.Item key={type} label={type} value={type} />
              ))}
            </Picker>
          </View>
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">Code-barres *</Text>
          <TextInput
            className={`bg-white p-3 rounded-lg ${errors.barcode ? 'border border-red-500' : ''}`}
            placeholder="1234567890123"
            value={formData.barcode}
            onChangeText={text => setFormData({ ...formData, barcode: text })}
            keyboardType="numeric"
          />
          {errors.barcode && <Text className="text-red-500 text-sm mt-1">{errors.barcode}</Text>}
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">Prix (DH) *</Text>
          <TextInput
            className={`bg-white p-3 rounded-lg ${errors.price ? 'border border-red-500' : ''}`}
            placeholder="1200"
            value={formData.price}
            onChangeText={text => setFormData({ ...formData, price: text })}
            keyboardType="decimal-pad"
          />
          {errors.price && <Text className="text-red-500 text-sm mt-1">{errors.price}</Text>}
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">Prix soldé (DH)</Text>
          <TextInput
            className="bg-white p-3 rounded-lg"
            placeholder="1100"
            value={formData.solde}
            onChangeText={text => setFormData({ ...formData, solde: text })}
            keyboardType="decimal-pad"
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">Fournisseur *</Text>
          <TextInput
            className={`bg-white p-3 rounded-lg ${errors.supplier ? 'border border-red-500' : ''}`}
            placeholder="HP"
            value={formData.supplier}
            onChangeText={text => setFormData({ ...formData, supplier: text })}
          />
          {errors.supplier && <Text className="text-red-500 text-sm mt-1">{errors.supplier}</Text>}
        </View>

        {/* Stock Management */}
        <View className="mt-6">
          <Text className="text-lg font-semibold mb-4">Gestion du Stock</Text>
          
          {formData.stocks.map((stock, index) => (
            <View key={index} className="mb-4 bg-white p-4 rounded-lg">
              <Text className="text-sm font-medium text-gray-700 mb-2">Entrepôt {index + 1}</Text>
              <View className="mb-3">
                <Picker
                  selectedValue={stock.warehouseId}
                  onValueChange={value=> handleStockChange(index, 'warehouseId', value)}
                >
                  <Picker.Item label="Sélectionner un entrepôt" value={0} />
                  {warehouses.map(warehouse => (
                    <Picker.Item 
                      key={warehouse.id} 
                      label={`${warehouse.name} (${warehouse.localisation.city})`} 
                      value={warehouse.id} 
                    />
                  ))}
                </Picker>
              </View>
              
              <TextInput
                className="bg-gray-100 p-3 rounded-lg"
                placeholder="Quantité"
                value={stock.quantity}
                onChangeText={text => handleStockChange(index, 'quantity', text)}
                keyboardType="numeric"
              />
              
              {errors[`stock-${index}`] && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors[`stock-${index}`]}
                </Text>
              )}
            </View>
          ))}

          <TouchableOpacity
            className="bg-blue-100 p-3 rounded-lg items-center"
            onPress={handleAddStock}
          >
            <Text className="text-blue-600 font-medium">+ Ajouter un entrepôt</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        className="mt-8 bg-blue-500 p-4 rounded-lg flex-row items-center justify-center"
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <Save size={20} color="white" className="mr-2" />
            <Text className="text-white font-medium text-lg">Enregistrer le produit</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}