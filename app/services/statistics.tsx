import apiClient from "../../utils/api";

 interface Stock {
  id: number;
  name: string;
  quantity: number;
  localisation: {
    city: string;
    latitude: number;
    longitude: number;
  };
}

interface Product {
  id: number;
  name: string;
  type: string;
  price: number;
  solde?: number;
  stocks: Stock[];
  editedBy: {
    warehousemanId: number;
    at: string;
  }[];
}

interface Statistics {
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

export const fetchStatistics = async (): Promise<Statistics> => {
  try {
    const response = await apiClient.get('/products');
    const products: Product[] = response.data;

    const cities = new Set<string>();
    products.forEach(product => {
      product.stocks.forEach(stock => {
        cities.add(stock.localisation.city);
      });
    });

    const outOfStock = products.filter(product => {
      const totalQuantity = product.stocks.reduce((sum, stock) => sum + stock.quantity, 0);
      return product.stocks.length === 0 || totalQuantity === 0;
    }).length;

    let totalStockValue = 0;
    products.forEach(product => {
      const price = product.solde || product.price;
      const totalQuantity = product.stocks.reduce((sum, stock) => sum + stock.quantity, 0);
      totalStockValue += price * totalQuantity;
    });

    const stocksByCity = Array.from(cities).map(city => {
      let cityStats = {
        city,
        totalProducts: 0,
        totalQuantity: 0,
      };

      products.forEach(product => {
        const cityStocks = product.stocks.filter(stock => stock.localisation.city === city);
        if (cityStocks.length > 0) {
          cityStats.totalProducts += 1;
          cityStats.totalQuantity += cityStocks.reduce((sum, stock) => sum + stock.quantity, 0);
        }
      });

      return cityStats;
    });

    const sortedProducts = products
      .map(product => {
        const latestEdit = product.editedBy.sort((a, b) => 
          new Date(b.at).getTime() - new Date(a.at).getTime()
        )[0];
        
        return {
          productId: product.id,
          productName: product.name,
          quantity: product.stocks.reduce((sum, stock) => sum + stock.quantity, 0),
          lastEditDate: latestEdit ? new Date(latestEdit.at) : new Date(0),
        };
      })
      .sort((a, b) => b.lastEditDate.getTime() - a.lastEditDate.getTime());

    return {
      totalProducts: products.length,
      totalCities: cities.size,
      outOfStock,
      totalStockValue,
      mostAddedProducts: sortedProducts.slice(0, 5),
      mostRemovedProducts: sortedProducts
        .filter(p => p.quantity === 0)
        .slice(0, 5),
      stocksByCity,
    };
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw error;
  }
};