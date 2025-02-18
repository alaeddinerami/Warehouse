import { CameraType, useCameraPermissions } from "expo-camera";
import { useState } from 'react';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import apiClient from "~/(utils)/api";

export default function useScanner() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const checkBarcodeExists = async (barcode: string) => {
    try {
      setIsChecking(true);
      const response = await apiClient.get(`/products?barcode=${barcode}`);
      if (response.data.length > 0) {
        return { exists: true, product: response.data[0] };
      }
      return { exists: false, product: null };
    } catch (error) {
      console.error('Error checking barcode:', error);
      return { exists: false, product: null };
    } finally {
      setIsChecking(false);
    }
  };

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned || isChecking) return;
    
    setScanned(true);
    
    try {
      const { exists, product } = await checkBarcodeExists(data);
      
      if (exists && product) {
        router.push({
          pathname: "/product/[id]",
          params: {
            id: product.id,
            name: product.name,
            image: product.image,
            price: product.solde ?? product.price,
            type: product.type,
            stocks: JSON.stringify(product.stocks),
          }
        });
      } else {
        router.back();
        router.setParams({ scannedBarcode: data });
      }
      
      setTimeout(() => setScanned(false), 500);
      
    } catch (error) {
      console.error('Scanning error:', error);
      Alert.alert(
        'Error',
        'An error occurred while checking the barcode.',
        [
          {
            text: 'OK',
            onPress: () => {
              setScanned(false);
              router.back();
            }
          }
        ]
      );
    }
  };

  return {
    facing,
    permission,
    scanned,
    isChecking,
    requestPermission,
    handleBarCodeScanned,
  };
}