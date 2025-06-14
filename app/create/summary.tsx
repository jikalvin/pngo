import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router'; // useLocalSearchParams to get passed data
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, MapPin } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Layout, { spacing, fontSizes, borderRadius } from '@/constants/Layout';
import { ProgressSteps } from '@/components/ProgressSteps';
import { useDispatch, useSelector } from 'react-redux';
import { createTask } from '@/store/taskSlice';
import type { CreateTaskData } from '@/store/taskSlice';
import type { AppDispatch, RootState } from '@/store/store';
import { useTranslation } from 'react-i18next';


export default function DeliverySummaryScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { isCreatingTask, createTaskError } = useSelector((state: RootState) => state.tasks);

  // Simulate receiving data from previous steps.
  // In a real app, this would come from route params (useLocalSearchParams) or a state management solution for the create flow.
  // For now, using useLocalSearchParams as a placeholder, assuming data is passed.
  const params = useLocalSearchParams();

  // Create a mock taskData object based on what might be passed or assembled
  // This needs to be replaced with actual data aggregation from previous steps.
  const taskDataToSubmit: CreateTaskData = {
    title: params.deliveryName as string || "My New Delivery", // From app/create/index.tsx
    description: params.description as string || "Details about the delivery.", // Assuming description is collected
    pickupAddress: params.pickupAddress as string || "123 Pickup St, City", // From app/create/details.tsx
    deliveryAddress: params.dropoffAddress as string || "456 Delivery Ave, City", // From app/create/details.tsx
    packageSize: params.size as any || 'medium', // From app/create/index.tsx
    packageWeight: parseFloat(params.weight as string) || 5, // From app/create/index.tsx
    price: parseFloat(params.maxAmount as string) || 20, // From app/create/details.tsx (using maxAmount as example)
    // images: params.images, // Array of image objects { uri, name, type } from app/create/index.tsx
    // Add other fields as needed: pickupDate, deliveryDate, etc.
  };

  const handleBack = () => {
    if (!isCreatingTask) {
      router.back();
    }
  };
  
  const handleCreate = async () => {
    if (isCreatingTask) return;

    // console.log("Submitting task data:", taskDataToSubmit);
    const resultAction = await dispatch(createTask(taskDataToSubmit));

    if (createTask.fulfilled.match(resultAction)) {
      Alert.alert(
        t('task.createSuccessTitle'),
        t('task.createSuccessMessage', { taskId: resultAction.payload.id }),
        [{ text: "OK", onPress: () => router.replace('/(tabs)/my-packages') }] // Navigate to task list or new task
      );
    } else if (createTask.rejected.match(resultAction)) {
      Alert.alert(
        t('task.errors.createFailedTitle'),
        (resultAction.payload as string) || t('task.errors.createFailedMessage')
      );
    }
  };

  // Displaying some of the mock/param data for summary
  const displayImages = (params.images as string[]) || ['https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg'];
  const displayTitle = taskDataToSubmit.title;
  const displayPickupAddress = taskDataToSubmit.pickupAddress;
  const displayDeliveryAddress = taskDataToSubmit.deliveryAddress;
  const displayPrice = taskDataToSubmit.price;


  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} disabled={isCreatingTask}>
          <ChevronLeft size={24} color={Colors.primary.DEFAULT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Delivery - Summary</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ProgressSteps totalSteps={4} currentStep={3} />
      
      <ScrollView style={styles.content}>
        <View style={styles.imagesContainer}>
          <Image
            source={{ uri: displayImages[0] }} // Show first image
            style={styles.mainImage}
          />
          {/* Optionally display more thumbnails if needed */}
        </View>
        
        <View style={styles.detailsContainer}>
          <Text style={styles.deliveryTitle}>{displayTitle}</Text>
          <Text style={styles.deliveryInfo}>Size: {taskDataToSubmit.packageSize}</Text>
          <Text style={styles.deliveryInfo}>Weight: ~{taskDataToSubmit.packageWeight} kg</Text>
          {taskDataToSubmit.description && <Text style={styles.deliveryDescription}>{taskDataToSubmit.description}</Text>}
          
          {/* Simplified tags for summary, adapt as needed */}
          <View style={styles.tagContainer}>
            <View style={styles.tag}><Text style={styles.tagText}>Priority: Standard</Text></View>
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Price: ${displayPrice}</Text>
          </View>
          
          <View style={styles.addressContainer}>
            <MapPin size={16} color={Colors.primary.DEFAULT} />
            <Text style={styles.addressText}>{`${displayPickupAddress} to ${displayDeliveryAddress}`}</Text>
          </View>
          
          {/* Add more summary details here if collected */}
        </View>
        {createTaskError && <Text style={styles.errorText}>{createTaskError}</Text>}
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.backButton, isCreatingTask && styles.disabledFooterButton]}
          onPress={handleBack}
          disabled={isCreatingTask}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.createButton, isCreatingTask && styles.disabledFooterButton]}
          onPress={handleCreate}
          disabled={isCreatingTask}
        >
          {isCreatingTask ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={styles.createButtonText}>Create</Text>
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
  errorText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.sm,
    color: Colors.danger.DEFAULT,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  disabledFooterButton: {
    opacity: 0.6,
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
  imagesContainer: {
    padding: spacing.lg,
  },
  mainImage: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  thumbnailsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
  },
  detailsContainer: {
    padding: spacing.lg,
  },
  deliveryTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.xl,
    color: Colors.gray[800],
    marginBottom: spacing.xs,
  },
  deliveryInfo: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.sm,
    color: Colors.gray[600],
    marginBottom: spacing.xs,
  },
  deliveryDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.sm,
    color: Colors.gray[600],
    marginVertical: spacing.md,
  },
  tagContainer: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  tag: {
    backgroundColor: Colors.primary[50],
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  tagText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.xs,
    color: Colors.gray[700],
  },
  priceContainer: {
    marginVertical: spacing.md,
  },
  priceLabel: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.md,
    color: Colors.gray[800],
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  addressText: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.sm,
    color: Colors.gray[700],
    marginHorizontal: spacing.sm,
  },
  changeText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.xs,
    color: Colors.primary.DEFAULT,
  },
  timeContainer: {
    alignItems: 'center',
  },
  timeText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.xs,
    color: Colors.gray[600],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    backgroundColor: Colors.white,
  },
  backButton: {
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
  },
  backButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.md,
    color: Colors.gray[700],
  },
  createButton: {
    backgroundColor: Colors.primary.DEFAULT,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
  },
  createButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.md,
    color: Colors.white,
  },
});