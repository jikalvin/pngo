import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { ChevronLeft, Camera, Upload, Plus } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Layout, { spacing, fontSizes, borderRadius } from '@/constants/Layout';
import { ProgressSteps } from '@/components/ProgressSteps';
import { useTranslation } from 'react-i18next'; // Added import

export default function CreateDeliveryScreen() {
  const { t } = useTranslation(); // Initialized t
  const [images, setImages] = useState<string[]>([]);
  const [deliveryName, setDeliveryName] = useState('');
  const [size, setSize] = useState('');
  const [weight, setWeight] = useState('');
  const [type, setType] = useState('Standard');
  const [priority, setPriority] = useState('Standard');
  
  const handleAddImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };
  
  const handleNext = () => {
    // For images, pass URIs as a JSON string or just count for now
    // Example: first image URI. Max 4 images.
    const imageUrisToSend = images.length > 0 ? JSON.stringify(images.slice(0, 4)) : JSON.stringify([]);

    router.push({
      pathname: '/create/details',
      params: {
        deliveryName,
        size, // size is currently not well-defined in state, might be empty or default
        weight,
        type,
        priority,
        imageUris: imageUrisToSend
      },
    });
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
        <Text style={styles.headerTitle}>{t('createTask.headerTitle')}</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ProgressSteps totalSteps={4} currentStep={0} />
      
      <ScrollView style={styles.content}>
        <View style={styles.imageContainer}>
          <TouchableOpacity 
            style={styles.mainImageBox}
            onPress={handleAddImage}
          >
            {images.length > 0 ? (
              <Image source={{ uri: images[0] }} style={styles.uploadedImage} />
            ) : (
              <View style={styles.uploadIconContainer}>
                <Upload size={24} color={Colors.primary.DEFAULT} />
              </View>
            )}
          </TouchableOpacity>
          
          <View style={styles.additionalImagesContainer}>
            <TouchableOpacity 
              style={styles.smallImageBox}
              onPress={handleAddImage}
            >
              {images.length > 1 ? (
                <Image source={{ uri: images[1] }} style={styles.uploadedImage} />
              ) : (
                <Camera size={20} color={Colors.gray[500]} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.smallImageBox}
              onPress={handleAddImage}
            >
              {images.length > 2 ? (
                <Image source={{ uri: images[2] }} style={styles.uploadedImage} />
              ) : (
                <Camera size={20} color={Colors.gray[500]} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.smallImageBox}
              onPress={handleAddImage}
            >
              {images.length > 3 ? (
                <Image source={{ uri: images[3] }} style={styles.uploadedImage} />
              ) : (
                <Camera size={20} color={Colors.gray[500]} />
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.uploadButtons}>
            <TouchableOpacity style={styles.uploadButton}>
              <Text style={styles.uploadButtonText}>{t('createTask.uploadVideoHint')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.uploadImagesButton}>
              <Text style={styles.uploadImagesButtonText}>{t('createTask.uploadImagesHint')}</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('createTask.deliveryNameLabel')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('createTask.deliveryNamePlaceholder')}
              placeholderTextColor={Colors.gray[400]}
              value={deliveryName}
              onChangeText={setDeliveryName}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('createTask.sizeEstimateLabel')}</Text>
            <TouchableOpacity style={styles.dropdown}>
              <Text style={styles.dropdownText}>{t('createTask.sizeEstimatePlaceholder')}</Text>
              <ChevronLeft size={20} color={Colors.gray[600]} style={{ transform: [{ rotate: '-90deg' }] }} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('createTask.weightLabel')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('createTask.weightPlaceholder')}
              placeholderTextColor={Colors.gray[400]}
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('createTask.typePriorityLabel')}</Text>
            <View style={styles.selectRow}>
              <TouchableOpacity style={styles.selectButton}>
                <Text style={styles.selectButtonText}>{t('createTask.typeDefault')}</Text>
                <ChevronLeft size={20} color={Colors.gray[600]} style={{ transform: [{ rotate: '-90deg' }] }} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.selectButton}>
                <Text style={styles.selectButtonText}>{t('createTask.priorityDefault')}</Text>
                <ChevronLeft size={20} color={Colors.gray[600]} style={{ transform: [{ rotate: '-90deg' }] }} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={handleCancel}
        >
          <Text style={styles.cancelButtonText}>{t('createTask.cancelButton')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={handleNext}
        >
          <Text style={styles.continueButtonText}>{t('common.continue')}</Text>
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
});