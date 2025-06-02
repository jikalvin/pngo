import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { ChevronLeft, Camera, Upload, Plus } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Layout, { spacing, fontSizes, borderRadius } from '@/constants/Layout';
import { ProgressSteps } from '@/components/ProgressSteps';

import api from '@/utils/api'; // For API calls
import { useAuth } from '@/context/AuthContext'; // Or Redux for user role
import { Alert } from 'react-native';

export default function CreatePackageScreen() { // Renamed component
  // const [images, setImages] = useState<string[]>([]); // Image upload not part of current backend task for package creation
  const [name, setName] = useState(''); // Was deliveryName
  const [description, setDescription] = useState('');
  const [weight, setWeight] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [price, setPrice] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // const { user } = useAuth(); // For role checking, if needed to restrict access

  // Image handling removed for now as it's not in the backend Package schema for creation
  // const handleAddImage = async () => { ... };
  
  const handleSubmitPackage = async () => {
    if (!name || !pickupAddress || !deliveryAddress) {
      Alert.alert('Missing Information', 'Please fill in Package Name, Pickup Address, and Delivery Address.');
      return;
    }
    setIsLoading(true);
    setError(null);

    const packageData = {
      name,
      description,
      weight: weight ? parseFloat(weight) : undefined,
      pickupAddress,
      deliveryAddress,
      price: price ? parseFloat(price) : undefined,
      // dimensions are not collected in this simplified form
    };

    try {
      const response = await api.post('/packages', packageData);
      setIsLoading(false);
      Alert.alert('Package Created', `Package "${response.data.name}" has been successfully created.`, [
        { text: 'OK', onPress: () => router.replace('/(tabs)/packages') } // Navigate to a relevant screen, e.g., a list of user's packages
      ]);
      // Clear form
      setName('');
      setDescription('');
      setWeight('');
      setPickupAddress('');
      setDeliveryAddress('');
      setPrice('');
    } catch (err: any) {
      setIsLoading(false);
      console.error("Failed to create package:", err.response?.data || err.message);
      setError(err.response?.data?.msg || "Failed to create package. Please try again.");
      Alert.alert('Creation Failed', err.response?.data?.msg || "An error occurred.");
    }
  };
  
  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel}>
          <ChevronLeft size={24} color={Colors.primary.DEFAULT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create New Package</Text> 
        <View style={{ width: 24 }} /> 
      </View>
      
      {/* ProgressSteps removed as we are simplifying to a single screen submission for this task */}
      {/* <ProgressSteps totalSteps={4} currentStep={0} /> */}
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image upload UI removed for this task */}
        {/* <View style={styles.imageContainer}> ... </View> */}
        
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Package Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Documents, Small Box"
              placeholderTextColor={Colors.gray[400]}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Package contents, special instructions..."
              placeholderTextColor={Colors.gray[400]}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pickup Address *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter full pickup address"
              placeholderTextColor={Colors.gray[400]}
              value={pickupAddress}
              onChangeText={setPickupAddress}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Delivery Address *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter full delivery address"
              placeholderTextColor={Colors.gray[400]}
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Weight (kg, Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 0.5"
              placeholderTextColor={Colors.gray[400]}
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Price (Optional, what sender offers for delivery)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 5.00"
              placeholderTextColor={Colors.gray[400]}
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>
          {/* Removed Size, Type, Priority dropdowns as they are not in the target schema */}

          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={handleCancel}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.continueButton, isLoading && styles.disabledButton]}
          onPress={handleSubmitPackage} // Changed from handleNext
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.continueButtonText}>Create Package</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.lg,
    color: Colors.primary.DEFAULT,
  },
  errorText: {
    color: Colors.danger.DEFAULT,
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.sm,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    padding: spacing.lg,
  },
  mainImageBox: {
    height: 200,
    backgroundColor: Colors.gray[200],
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
  },
  uploadIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  additionalImagesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  smallImageBox: {
    width: '30%',
    height: 80,
    backgroundColor: Colors.gray[200],
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  uploadButtons: {
    marginTop: spacing.md,
  },
  uploadButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  uploadButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.xs,
    color: Colors.gray[600],
  },
  uploadImagesButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  uploadImagesButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.xs,
    color: Colors.gray[600],
  },
  formContainer: {
    padding: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.sm,
    color: Colors.gray[700],
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.md,
    color: Colors.gray[800],
  },
  textArea: {
    height: 80, // For multiline input
    textAlignVertical: 'top', // For multiline input
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dropdownText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.md,
    color: Colors.gray[800],
  },
  selectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    width: '48%',
  },
  selectButtonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.md,
    color: Colors.gray[800],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    backgroundColor: Colors.white,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
  },
  cancelButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.md,
    color: Colors.gray[700],
  },
  continueButton: {
    backgroundColor: Colors.primary.DEFAULT,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
  },
  continueButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.md,
    color: Colors.white,
  },
  disabledButton: {
    backgroundColor: Colors.gray[400],
  }
});