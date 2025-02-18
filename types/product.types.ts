export interface Stock {
    id: number;
    name: string;
    quantity: number;
  }
  
  export interface Product {
    id: number;
    name: string;
    type: string;
    barcode: string;
    price: number;
    solde?: number;
    supplier: string;
    image: string;
    stocks: Stock[];
  }
  
  export interface StockAdjustment {
    quantity: string;
    warehouseId: string;
  }
  
  export interface StockStatus {
    totalStock: number;
    status: string;
    color: string;
  }