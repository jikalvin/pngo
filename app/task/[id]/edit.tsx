import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchTaskById, updateTask } from '@/store/taskSlice'; // Assuming updateTask will be created
import type { Task, CreateTaskData } from '@/store/taskSlice';
import Colors from '@/constants/Colors';
import Layout, { spacing, fontSizes, borderRadius } from '@/constants/Layout';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';

const DEFAULT_TASK_IMAGE = 'https://images.pexels.com/photos/356079/pexels-photo-356079.jpeg'; // Placeholder

export default function TaskEditScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { id: taskId } = useLocalSearchParams<{ id: string }>();

  // Selectors for task being edited, and update-specific loading/error states
  const { task: currentTask, isLoading: isLoadingTask, error: fetchTaskError, isUpdatingTask, updateTaskError } = useSelector(
    (state: RootState) => state.tasks
  );


  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState<Array<{ uri: string; name?: string; type?: string }>>([]); // For new images
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);


  useEffect(() => {
    if (taskId && (!currentTask || currentTask.id !== taskId)) {
      dispatch(fetchTaskById(taskId));
    }
  }, [dispatch, taskId, currentTask]);

  useEffect(() => {
    if (currentTask && currentTask.id === taskId) {
      setTitle(currentTask.title || '');
      setDescription(currentTask.description || '');
      setPickupAddress(currentTask.pickupAddress || '');
      setDeliveryAddress(currentTask.deliveryAddress || '');
      setPrice(currentTask.price?.toString() || '');
      // Assuming images are stored as an array of URLs in the Task interface for now
      // setExistingImageUrls(currentTask.images || []); // If currentTask.images are URLs
    }
  }, [currentTask, taskId]);

  const handleChooseImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('profile.errors.permissionRequired'), t('profile.errors.mediaPermission'));
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // Allow multiple selections if backend supports or handle one by one
      quality: 0.7,
      // allowsMultipleSelection: true, // If you want to allow multiple images at once
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newImages = result.assets.map(asset => {
        const fileName = asset.uri.split('/').pop() || 'image.jpg';
        const fileType = asset.mimeType || (fileName.endsWith('.png') ? 'image/png' : 'image/jpeg');
        return { uri: asset.uri, name: fileName, type: fileType };
      });
      setImages(prev => [...prev, ...newImages]); // Add to new images queue
    }
  };

  const removeNewImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!taskId || isUpdatingTask) return;

    const taskDataToUpdate: Partial<CreateTaskData> = {
      title,
      description,
      pickupAddress,
      deliveryAddress,
      price: parseFloat(price) || undefined,
      // images: images, // Pass the array of new image objects for FormData
      // Backend needs to handle existing images vs new images.
      // For simplicity here, we might just replace all images.
    };
    if (images.length > 0) {
        taskDataToUpdate.images = images;
    }

    // console.log("Updating task:", taskId, "with data:", taskDataToUpdate);
    // console.log("Updating task:", taskId, "with data:", taskDataToUpdate);
    const resultAction = await dispatch(updateTask({ taskId, taskData: taskDataToUpdate }));
    if (updateTask.fulfilled.match(resultAction)) {
      Alert.alert(t('task.updateSuccessTitle'), t('task.updateSuccessMessage'));
      router.back(); // Go back to detail screen
    } else if (updateTask.rejected.match(resultAction)) {
      Alert.alert(t('task.errors.updateFailedTitle'), (resultAction.payload as string) || t('task.errors.updateFailedMessage'));
    }
    // Alert.alert("Task Update", "Submitting data (edit integration pending)..."); // Removed placeholder
  };

  if (isLoadingTask && !currentTask && !fetchTaskError) { // Adjusted condition to avoid showing loader if there's already an error
    return <SafeAreaView style={styles.centered}><ActivityIndicator size="large" color={Colors.primary.DEFAULT} /></SafeAreaView>;
  }
  if (fetchTaskError && !currentTask) {
    return <SafeAreaView style={styles.centered}><Text style={styles.errorText}>{fetchTaskError}</Text></SafeAreaView>;
  }
  if (!currentTask && !isLoadingTask) {
     return <SafeAreaView style={styles.centered}><Text style={styles.errorText}>Task not found.</Text></SafeAreaView>;
  }


  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} disabled={isUpdatingTask}>
          <Text style={styles.cancelButton}>{t('common.cancel')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('task.editTaskTitle')}</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={isUpdatingTask}>
          {isUpdatingTask ? <ActivityIndicator size="small" color={Colors.primary.DEFAULT} /> : <Text style={styles.saveButton}>{t('common.save')}</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('task.title')}</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder={t('task.enterTitle')} editable={!isUpdatingTask} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('task.description')}</Text>
          <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder={t('task.enterDescription')} multiline numberOfLines={4} editable={!isUpdatingTask} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('task.pickupAddress')}</Text>
          <TextInput style={styles.input} value={pickupAddress} onChangeText={setPickupAddress} placeholder={t('task.enterPickupAddress')} editable={!isUpdatingTask} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('task.deliveryAddress')}</Text>
          <TextInput style={styles.input} value={deliveryAddress} onChangeText={setDeliveryAddress} placeholder={t('task.enterDeliveryAddress')} editable={!isUpdatingTask} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('task.price')}</Text>
          <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder={t('task.enterPrice')} keyboardType="numeric" editable={!isUpdatingTask} />
        </View>

        {/* Image Upload Section */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('task.images')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagePreviewContainer}>
            {/* Display existing images (read-only for now, or implement removal) */}
            {existingImageUrls.map((url, index) => (
              <Image key={`existing-${index}`} source={{ uri: url }} style={styles.imagePreview} />
            ))}
            {/* Display newly selected images with a remove button */}
            {images.map((img, index) => (
              <View key={`new-${index}`} style={styles.imagePreviewWrapper}>
                <Image source={{ uri: img.uri }} style={styles.imagePreview} />
                <TouchableOpacity onPress={() => removeNewImage(index)} style={styles.removeImageButton}>
                  <Text style={styles.removeImageButtonText}>X</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity onPress={handleChooseImage} style={styles.photoButton} disabled={isUpdatingTask}>
            <Text style={styles.photoButtonText}>{t('task.addImages')}</Text>
          </TouchableOpacity>
        </View>

        {updateTaskError && <Text style={styles.errorText}>{updateTaskError}</Text>}
        {isUpdatingTask && <View style={styles.formOverlay}><ActivityIndicator size="large" color={Colors.primary.DEFAULT} /></View>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.lg,
    color: Colors.primary.DEFAULT,
  },
  cancelButton: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.md,
    color: Colors.gray[600],
  },
  saveButton: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.md,
    color: Colors.primary.DEFAULT,
  },
  formContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.sm,
    color: Colors.gray[700],
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.md,
    color: Colors.gray[800],
    borderWidth: 1,
    borderColor: Colors.gray[300],
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  photoButton: {
    backgroundColor: Colors.primary.DEFAULT,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  photoButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.sm,
    color: Colors.white,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  imagePreviewWrapper: {
    position: 'relative',
    marginRight: spacing.sm,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.sm,
    backgroundColor: Colors.gray[200],
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: Colors.danger.DEFAULT,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  removeImageButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: fontSizes.sm,
  },
  formOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  errorText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.sm,
    color: Colors.danger.DEFAULT,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
