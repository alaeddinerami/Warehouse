import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import apiClient from '~/(utils)/api';
import { productFormService } from '../productFormService';

jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

jest.mock('~/(utils)/api', () => ({
  post: jest.fn(() => Promise.resolve({ data: { id: 1 } })),
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('ProductFormService', () => {
  describe('validateForm', () => {
    it('should return errors for missing required fields', () => {
      const formData = {
        name: '',
        barcode: '',
        price: '',
        supplier: '',
        stocks: [{ warehouseId: null, quantity: '' }],
      };

    
    });

    it('should return no errors for valid form data', () => {
      const formData = {
        name: 'Test Product',
        barcode: '123456789',
        price: '100',
        supplier: 'Test Supplier',
        stocks: [{ warehouseId: 1999, quantity: '10' }],
      };

    
    });
  });
  

  describe('formatProductData', () => {
    it('should format the product data correctly', () => {
      const formData = {
        name: 'Test Product',
        barcode: '123456789',
        price: '100',
        supplier: 'Test Supplier',
        stocks: [{ warehouseId: 1999, quantity: '10' }],
      };

      const formattedProduct = productFormService.formatProductData(formData);
      expect(formattedProduct).toEqual({
        ...formData,
        price: 100,
        solde: undefined,
        stocks: [
          {
            id: 1999,
            name: 'Gueliz B2',
            quantity: 10,
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
      const formData = {
        name: 'Test Product',
        barcode: '123456789',
        price: '100',
        supplier: 'Test Supplier',
        stocks: [{ warehouseId: 1999, quantity: '10' }],
      };

      mockApiClient.post.mockResolvedValue({ data: { id: 1 } });

      const result = await productFormService.createProduct(formData);
      expect(result).toBe(true);
      expect(mockApiClient.post).toHaveBeenCalledWith('/products', expect.any(Object));
    });

    it('should throw an error when product creation fails', async () => {
      const formData = {
        name: 'Test Product',
        barcode: '123456789',
        price: '100',
        supplier: 'Test Supplier',
        stocks: [{ warehouseId: 1999, quantity: '10' }],
      };

      mockApiClient.post.mockRejectedValue(new Error('Mock error'));

      await expect(productFormService.createProduct(formData)).rejects.toThrow('Failed to create product');
    });
  });
});