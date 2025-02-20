import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ProductFormState, ProductFormErrors, Warehouse, FormattedProduct } from '../../types/product-form.types';
import apiClient from '~/utils/api';
import { productFormService } from '../productFormService';

jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock('~/utils/api', () => ({
  post: jest.fn(() => Promise.resolve({ data: { id: 1 } })),
}));

describe('ProductFormService', () => {
  const warehouses: Warehouse[] = [
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

  const validFormData: ProductFormState = {
    name: 'Test Product',
    barcode: '123456789',
    price: '100',
    supplier: 'Test Supplier',
    stocks: [
      {
        warehouseId: 1999,
        quantity: '50',
      },
    ],
  };

  const invalidFormData: ProductFormState = {
    name: '',
    barcode: '',
    price: '',
    supplier: '',
    stocks: [
      {
        warehouseId: null,
        quantity: '50',
      },
    ],
  };

  describe('validateForm', () => {
    it('should return no errors for valid form data', () => {
      const errors = productFormService.validateForm(validFormData);
      expect(errors).toEqual({});
    });

    it('should return errors for invalid form data', () => {
      const errors = productFormService.validateForm(invalidFormData);
      expect(errors).toEqual({
        name: 'Le nom est requis',
        barcode: 'Le code-barres est requis',
        price: 'Le prix est requis',
        supplier: 'Le fournisseur est requis',
        'stock-0': 'Sélectionnez un entrepôt',
      });
    });
  });

  describe('pickImage', () => {
    it('should return the image URI when image picking is successful', async () => {
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
        canceled: false,
        assets: [{ uri: 'file:///path/to/image.jpg' }],
      });

      const result = await productFormService.pickImage();
    });

    it('should return null when image picking is canceled', async () => {
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
        canceled: true,
      });

      const result = await productFormService.pickImage();
      expect(result).toBeNull();
    });

    it('should alert an error when image picking fails', async () => {
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockRejectedValueOnce(new Error('Mocked error'));

      await productFormService.pickImage();
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to pick image');
    });
  });

  describe('formatProductData', () => {
    it('should format the product data correctly', () => {
      const formattedProduct = productFormService.formatProductData(validFormData);
      expect(formattedProduct).toEqual({
        ...validFormData,
        price: 100,
        solde: undefined,
        stocks: [
          {
            id: 1999,
            name: 'Gueliz B2',
            quantity: 50,
            localisation: {
              city: 'Marrakesh',
              latitude: 31.628674,
              longitude: -7.992047,
            },
          },
        ],
        editedBy: [],
      });
    });
  });

  describe('createProduct', () => {
    it('should create a product successfully', async () => {
      const result = await productFormService.createProduct(validFormData);
      expect(result).toBe(true);
      expect(apiClient.post).toHaveBeenCalledWith('/products', expect.any(Object));
    });

    it('should throw an error when product creation fails', async () => {
      (apiClient.post as jest.Mock).mockRejectedValueOnce(new Error('Mocked error'));

      await expect(productFormService.createProduct(validFormData)).rejects.toThrow('Failed to create product');
    });
  });
});