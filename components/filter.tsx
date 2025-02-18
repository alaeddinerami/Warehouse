// FilterModal.tsx
import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';

interface FilterModalProps {
  isVisible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: { 
    name: string; 
    type: string; 
    price: string; 
    supplier: string; 
    sortBy: string; 
    sortOrder: 'asc' | 'desc' 
  }) => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isVisible,
  onClose,
  onApplyFilters,
}) => {
  const [filterName, setFilterName] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterPrice, setFilterPrice] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');
  const [sortBy, setSortBy] = useState('name'); // Default sort by name
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // Default sort order ascending

  const handleApplyFilters = () => {
    onApplyFilters({
      name: filterName,
      type: filterType,
      price: filterPrice,
      supplier: filterSupplier,
      sortBy,
      sortOrder,
    });
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Filter Options</Text>
          
          <Text style={styles.label}>Sort by:</Text>
          <Picker
            selectedValue={sortBy}
            style={styles.picker}
            onValueChange={(itemValue) => setSortBy(itemValue)}
          >
            <Picker.Item label="Name" value="name" />
            <Picker.Item label="Price" value="price" />
            <Picker.Item label="Quantity" value="quantity" />
          </Picker>
          <Text style={styles.label}>Sort order:</Text>
          <Picker
            selectedValue={sortOrder}
            style={styles.picker}
            onValueChange={(itemValue) => setSortOrder(itemValue as 'asc' | 'desc')}
          >
            <Picker.Item label="Ascending" value="asc" />
            <Picker.Item label="Descending" value="desc" />
          </Picker>
          <TouchableOpacity onPress={handleApplyFilters} style={styles.button}>
            <Text style={styles.buttonText}>Apply Filters</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.button}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    modalContent: {
      backgroundColor: 'white',
      padding: 24,
      borderRadius: 16,
      width: '90%',
      maxWidth: 400,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    title: {
      fontSize: 20,
      fontWeight: '600',
      color: '#1a1a1a',
      marginBottom: 24,
      textAlign: 'center',
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
      paddingBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: '#404040',
      marginBottom: 8,
    },
    picker: {
      backgroundColor: '#f8f9fa',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#e0e0e0',
      marginBottom: 16,
    },
    pickerItem: {
      fontSize: 16,
    },
    buttonContainer: {
      marginTop: 8,
    },
    button: {
      backgroundColor: '#fdbc00',
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 12,
      shadowColor: '#fdbc00',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    secondaryButton: {
      backgroundColor: '#6c757d',
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
  });

export default FilterModal;