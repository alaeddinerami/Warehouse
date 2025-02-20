import React from 'react';
import { Button, View, Alert } from 'react-native';
import * as Print from 'expo-print';
import apiClient from '~/utils/api';

const fetchProducts = async () => {
  try {
    const response = await apiClient.get('/products');
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

const generateHtml = ({products}:any) => `
  <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { text-align: center; color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid black; padding: 10px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
      </style>
    </head>
    <body>
      <h1>Product Report</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Type</th>
            <th>Barcode</th>
            <th>Price ($)</th>
            <th>Supplier</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          ${products.map((product: any)  => `
            <tr>
              <td>${product.id}</td>
              <td>${product.name}</td>
              <td>${product.type}</td>
              <td>${product.barcode}</td>
              <td>${product.price.toFixed(2)}</td>
              <td>${product.supplier}</td>
              <td>${product.stocks ? product.stocks.reduce((total: any, stock: { quantity: any; }) => total + stock.quantity, 0) : 0}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
  </html>
`;

const ExportPDF = () => {
  const generatePDF = async () => {
    const products = await fetchProducts();
    if (products.length === 0) {
      Alert.alert('Error', 'No products available to export.');
      return;
    }

    const htmlContent = generateHtml(products);
    try {
      await Print.printAsync({ html: htmlContent });
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'An error occurred while generating the PDF.');
    }
  };

  return (
    <View style={{ margin: 20 }}>
      <Button title="Print PDF" onPress={generatePDF} />
    </View>
  );
};

export default ExportPDF;
