export interface Statistics {
    totalProducts: number;
    totalCities: number;
    outOfStock: number;
    totalStockValue: number;
    mostAddedProducts: {
      productId: number;
      productName: string;
      quantity: number;
    }[];
    mostRemovedProducts: {
      productId: number;
      productName: string;
      quantity: number;
    }[];
    stocksByCity: {
      city: string;
      totalProducts: number;
      totalQuantity: number;
    }[];
  }
  