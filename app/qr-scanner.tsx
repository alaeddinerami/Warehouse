import { CameraView } from 'expo-camera';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { router } from 'expo-router';
import useScanner from '~/hooks/camera/useScanner';

export default function QRScannerScreen() {
  const {
    facing,
    permission,
    scanned,
    requestPermission,
    handleBarCodeScanned,
  } = useScanner();

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={styles.permissionButton}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeButton}
          >
            <X size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.scanFrame}>
          <View style={styles.scanOverlay}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />
          </View>
        </View>

        <View style={styles.controls}>
          
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>
              Position the QR code within the frame
            </Text>
          </View>
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
  camera: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  message: {
    color: 'white',
    textAlign: 'center',
    paddingBottom: 10,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 20,
  },
  permissionButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  scanFrame: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanOverlay: {
    width: 280,
    height: 280,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 32,
    height: 32,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: 'white',
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 32,
    height: 32,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: 'white',
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 32,
    height: 32,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: 'white',
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: 'white',
  },
  controls: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  flipButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  flipButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 16,
    borderRadius: 8,
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});