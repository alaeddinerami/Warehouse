import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import apiClient from '../../(utils)/api';
import {
  ProductFormState,
  ProductFormErrors,
  Warehouse,
  FormattedProduct,
} from '../../types/product-form.types';

export const warehouses: Warehouse[] = [
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

export const productTypes = ['Informatique', 'Accessoires', 'Électronique', 'Autre'];

class ProductFormService {
  validateForm(formData: ProductFormState): ProductFormErrors {
    const errors: ProductFormErrors = {};

    if (!formData.name) errors.name = 'Le nom est requis';
    if (!formData.barcode) errors.barcode = 'Le code-barres est requis';
    if (!formData.price) errors.price = 'Le prix est requis';
    if (!formData.supplier) errors.supplier = 'Le fournisseur est requis';

    formData.stocks.forEach((stock, index) => {
      if (stock.quantity && !stock.warehouseId) {
        errors[`stock-${index}`] = 'Sélectionnez un entrepôt';
      }
    });

    return errors;
  }

  async pickImage(): Promise<string | null> {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
      return null;
    }
  }

  formatProductData(formData: ProductFormState): FormattedProduct {
    const formattedStocks = formData.stocks
      .filter((stock) => stock.warehouseId && stock.quantity)
      .map((stock) => {
        const warehouse = warehouses.find((w) => w.id === stock.warehouseId);
        return {
          id: warehouse!.id,
          name: warehouse!.name,
          quantity: parseInt(stock.quantity),
          localisation: warehouse!.localisation,
        };
      });

    return {
      ...formData,
      price: parseFloat(formData.price),
      solde: formData.solde ? parseFloat(formData.solde) : undefined,
      stocks: formattedStocks,
      editedBy: [],
    };
  }

  async createProduct(formData: ProductFormState): Promise<boolean> {
    try {
      const formattedProduct = this.formatProductData(formData);
      await apiClient.post('/products', formattedProduct);
      return true;
    } catch (error) {
      throw new Error('Failed to create product');
    }
  }
}

export const productFormService = new ProductFormService();