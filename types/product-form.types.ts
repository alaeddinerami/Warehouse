export interface Localisation {
    city: string;
    latitude: number;
    longitude: number;
  }
  
  export interface Warehouse {
    id: number;
    name: string;
    localisation: Localisation;
  }
  
  export interface ProductStock {
    warehouseId: number;
    quantity: string;
  }
  
  export interface ProductFormState {
    name: string;
    type: string;
    barcode: string;
    price: string;
    solde?: string;
    supplier: string;
    image: string;
    stocks: ProductStock[];
  }
  
  export interface ProductFormErrors {
    [key: string]: string;
  }
  
  export interface FormattedStock {
    id: number;
    name: string;
    quantity: number;
    localisation: Localisation;
  }
  
  export interface FormattedProduct {
    name: string;
    type: string;
    barcode: string;
    price: number;
    solde?: number;
    supplier: string;
    image: string;
    stocks: FormattedStock[];
    editedBy: any[];
  }