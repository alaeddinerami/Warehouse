import apiClient from '../../(utils)/api';
import { Product, StockAdjustment, StockStatus } from '../../types/product.types';

class ProductService {
  async getProductDetails(productId: string | number): Promise<Product> {
    const response = await apiClient.get(`/products/${productId}`);
    return response.data;
  }

  async updateProductStock(
    product: Product,
    adjustment: StockAdjustment,
    action: 'add' | 'remove'
  ): Promise<Product> {
    const quantity = parseInt(adjustment.quantity);
    
    const updatedStocks = product.stocks.map((stock) =>
      stock.id === parseInt(adjustment.warehouseId)
        ? {
            ...stock,
            quantity: action === 'add' ? stock.quantity + quantity : stock.quantity - quantity,
          }
        : stock
    );

    const response = await apiClient.patch(`/products/${product.id}`, {
      stocks: updatedStocks,
    });

    return response.data;
  }

  calculateStockStatus(product: Product): StockStatus {
    const totalStock = this.calculateTotalStock(product);
    
    return {
      totalStock,
      status: totalStock > 10 ? 'En stock' : totalStock > 0 ? 'Stock faible' : 'Rupture de stock',
      color: totalStock > 10
        ? 'bg-green-100 text-green-800'
        : totalStock > 0
          ? 'bg-yellow-100 text-yellow-800'
          : 'bg-red-100 text-red-800'
    };
  }

  calculateTotalStock(product: Product): number {
    return product.stocks.reduce((sum, stock) => sum + stock.quantity, 0);
  }

  validateStockAdjustment(adjustment: StockAdjustment): string | null {
    if (!adjustment.quantity || !adjustment.warehouseId) {
      return 'Please select warehouse and enter quantity';
    }

    const quantity = parseInt(adjustment.quantity);
    if (isNaN(quantity)) {
      return 'Please enter valid quantity';
    }

    return null;
  }
}

export const productService = new ProductService();