import { CameraType, useCameraPermissions } from "expo-camera";
import { useState } from 'react';
import { router } from 'expo-router';

export default function useScanner() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    router.back();
    router.setParams({ scannedBarcode: data });
  };

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  return {
    facing,
    permission,
    scanned,
    requestPermission,
    handleBarCodeScanned,
    toggleCameraFacing,
  }
}