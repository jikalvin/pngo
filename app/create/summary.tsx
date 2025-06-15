import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native'; // Added Alert
import { router, useLocalSearchParams } from 'expo-router'; // Added useLocalSearchParams
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, MapPin } from 'lucide-react-native';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore'; // Added Firestore
import { useSelector } from 'react-redux'; // Added Redux
import { RootState } from '@/store/store'; // Added Redux
import Colors from '@/constants/Colors';
import Layout, { spacing, fontSizes, borderRadius } from '@/constants/Layout';
import { ProgressSteps } from '@/components/ProgressSteps';

export default function DeliverySummaryScreen() {
  const params = useLocalSearchParams();
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.id;

  // Extract params - provide defaults or handle undefined
  const {
    deliveryName = 'N/A',
    size = 'N/A',
    weight = 'N/A',
    type = 'Standard',
    priority = 'Standard',
    imageUris: imageUrisJson = '[]', // Default to empty array JSON string
    date = 'N/A',
    time = 'N/A',
    pickupAddress = 'N/A',
    dropoffAddress = 'N/A',
    minAmount = '0',
    maxAmount = '0',
    paymentMethods = 'N/A',
  } = params;

  let parsedImageUris: string[] = [];
  try {
    const uris = JSON.parse(imageUrisJson as string);
    if (Array.isArray(uris) && uris.every(u => typeof u === 'string')) {
      parsedImageUris = uris;
    }
  } catch (e) {
    console.error("Error parsing imageUris:", e);
  }

  const handleBack = () => {
    router.back();
  };
  
  const handleCreate = async () => {
    if (!userId) {
      Alert.alert("Error", "You must be logged in to create a task.");
      return;
    }

    const db = getFirestore();
    const taskData = {
      userId,
      deliveryName: deliveryName as string,
      size: size as string,
      weight: weight as string,
      type: type as string,
      priority: priority as string,
      imageUris: parsedImageUris, // Store the array of URIs
      date: date as string,
      time: time as string,
      pickupAddress: pickupAddress as string,
      dropoffAddress: dropoffAddress as string,
      priceMin: parseFloat(minAmount as string) || 0,
      priceMax: parseFloat(maxAmount as string) || 0,
      paymentMethods: paymentMethods as string, // This could be an array or object if structured
      createdAt: serverTimestamp(),
      status: 'open', // Initial status
      pickerId: null, // No picker assigned yet
    };

    try {
      await addDoc(collection(db, 'tasks'), taskData);
      Alert.alert("Success", "Task created successfully!");
      router.replace('/(tabs)/my-packages');
    } catch (error) {
      console.error("Error creating task:", error);
      Alert.alert("Error", "Failed to create task. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <ChevronLeft size={24} color={Colors.primary.DEFAULT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Delivery</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ProgressSteps totalSteps={4} currentStep={3} />
      
      <ScrollView style={styles.content}>
        <View style={styles.imagesContainer}>
          {parsedImageUris.length > 0 ? (
            <Image
              source={{ uri: parsedImageUris[0] }}
              style={styles.mainImage}
            />
          ) : (
            <View style={[styles.mainImage, styles.placeholderImage]}>
              <Text>No Image</Text>
            </View>
          )}
          <View style={styles.thumbnailsContainer}>
            {parsedImageUris.slice(1, 3).map((uri, index) => (
              <Image
                key={index}
                source={{ uri }}
                style={styles.thumbnail}
              />
            ))}
          </View>
        </View>
        
        <View style={styles.detailsContainer}>
          <Text style={styles.deliveryTitle}>{deliveryName as string}</Text>
          <Text style={styles.deliveryInfo}>Size: {size as string}</Text>
          <Text style={styles.deliveryInfo}>Weight: ~{weight as string} kg</Text>
          {/* <Text style={styles.deliveryDescription}>Description here if available</Text> */}
          
          <View style={styles.tagContainer}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Priority: {priority as string}</Text>
            </View>
          </View>
          
          <View style={styles.tagContainer}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Type: {type as string}</Text>
            </View>
          </View>
          
          {/* <View style={styles.tagContainer}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Apply: (none)</Text>
            </View>
          </View> */}
          
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Price: ${minAmount as string} - ${maxAmount as string}</Text>
          </View>
          
          <View style={styles.addressContainer}>
            <MapPin size={16} color={Colors.primary.DEFAULT} />
            <Text style={styles.addressText}>{pickupAddress as string} to {dropoffAddress as string}</Text>
            {/* <TouchableOpacity>
              <Text style={styles.changeText}>change</Text>
            </TouchableOpacity> */}
          </View>
          
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>Pickup Date: {date as string} at {time as string}</Text>
            <Text style={styles.timeText}>Payment Methods: {paymentMethods as string}</Text>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.createButton}
          onPress={handleCreate}
        >
          <Text style={styles.createButtonText}>Create</Text>
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
  imagesContainer: {
    padding: spacing.lg,
  },
  mainImage: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  placeholderImage: {
    backgroundColor: Colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: Colors.gray[200], // Placeholder background for thumbnail
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