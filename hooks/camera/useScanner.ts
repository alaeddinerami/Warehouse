import { CameraType, useCameraPermissions } from "expo-camera";
import { useState } from 'react';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import apiClient from "~/app/(utils)/api";

export default function useScanner() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const checkBarcodeExists = async (barcode: string): Promise<boolean> => {
    try {
      setIsChecking(true);
      const response = await apiClient.get(`/products?barcode=${barcode}`);
      return response.data.length > 0;
    } catch (error) {
      console.error('Error checking barcode:', error);
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned || isChecking) return;
    setScanned(true);
    
    try {
      const exists = await checkBarcodeExists(data);
      
      if (exists) {
        router.back();
        Alert.alert(
          'Code-barres existant',
          'Ce code-barres existe déjà dans la base de données.'
        );
        return;
      }
      router.setParams({ scannedBarcode: data });
      
    } catch (error) {
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la vérification du code-barres.',
        [
          {
            text: 'OK',
            onPress: () => {
              setScanned(false); 
            }
          }
        ]
      );
    }
  };

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  return {
    facing,
    permission,
    scanned,
    isChecking,
    requestPermission,
    handleBarCodeScanned,
    toggleCameraFacing,
  }
}