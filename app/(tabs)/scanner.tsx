import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { router, useFocusEffect } from 'expo-router';
import { X, RotateCcw, Loader2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient from '../(utils)/api';

export default function Scanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = React.useState(false);
  const [isChecking, setIsChecking] = React.useState(false);
  const [productDetails, setProductDetails] = React.useState(null);
  useFocusEffect(
    React.useCallback(() => {
      setScanned(false);
      setIsChecking(false);
    }, [])
  );
  React.useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    if (!permission?.granted) {
      const permissionResult = await requestPermission();
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Camera permission is required to scan barcodes',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    }
  };

  const checkBarcodeExists = async (barcode: string) => {
    try {
      setIsChecking(true);
      const response = await apiClient.get(`/products?barcode=${barcode}`);
      console.log(barcode);
      
      if (response.data.length > 0) {
        const product = response.data[0];
        setProductDetails(product);
        return product;
      }
      return null;
    } catch (error) {
      console.error('Error checking barcode:', error);
      Alert.alert('Error', 'Failed to check barcode in database');
      return null;
    } finally {
      setIsChecking(false);
    }
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || isChecking) return;
    setScanned(true);
    
    try {
      const product = await checkBarcodeExists(data);
      
      if (product) {
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
        setTimeout(() => setScanned(false), 500);

      } else {
        Alert.alert(
          'Product Not Found',
          'Would you like to add this product?',
          [
            {
              text: 'Add Product',
              onPress: () => {
                router.push({
                  pathname: "/product/create",
                  params: { scannedBarcode: data }
                });
              }
            },
            {
              text: 'Scan Again',
              onPress: () => setScanned(false),
              style: 'cancel',
            }
          ]
        );
      }
    } catch (error) {
      console.error('Scanning error:', error);
      Alert.alert('Error', 'Failed to process barcode');
      setScanned(false);
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_e', 'upc_a'],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            {isChecking && (
              <View style={styles.loadingContainer}>
                <Loader2 size={40} color="white" />
                <Text style={styles.loadingText}>Checking barcode...</Text>
              </View>
            )}
            <View style={[styles.scanAreaCorner, styles.topLeft]} />
            <View style={[styles.scanAreaCorner, styles.topRight]} />
            <View style={[styles.scanAreaCorner, styles.bottomLeft]} />
            <View style={[styles.scanAreaCorner, styles.bottomRight]} />
          </View>
          <Text style={styles.instructionText}>
            Position the barcode within the frame to scan
          </Text>
        </View>
      </CameraView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  text: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  camera: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 10,
  },
  headerButton: {
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    position: 'relative',
  },
  scanAreaCorner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#007AFF',
    borderWidth: 3,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
    borderRadius: 10,
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  rescanButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    padding: 15,
    paddingHorizontal: 30,
    backgroundColor: 'white',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  rescanText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
});