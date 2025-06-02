import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { spacing, fontSizes } from '@/constants/Layout';
import { ChevronLeft, CheckCircle, XCircle, Package, User, DollarSign, AlertCircle } from 'lucide-react-native';
import StatusBadge from '@/components/StatusBadge';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext'; // Assuming you have this context
import { PackageItemProps } from '@/components/PackageListItem'; // Import type

// Extended Package Details type, including populated owner if available from API
interface PackageDetails extends PackageItemProps {
  // dimensions might be an object { width, height, depth } or string
  dimensions?: string | { width?: number; height?: number; depth?: number };
  createdAt?: string; // Assuming API sends this
  // Add other fields that GET /packages/:id might return
  delivery?: { // If delivery details are populated for accepted packages
    driver_id: string;
    status: string;
    // other delivery fields
  }
}

export default function PackageDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth(); // Get logged-in user { id, role, ... }

  const [packageDetails, setPackageDetails] = useState<PackageDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchPackageDetails = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/packages/${id}`);
      setPackageDetails(response.data);
    } catch (err: any) {
      console.error("Failed to fetch package details:", err);
      setError(err.response?.data?.msg || "Failed to load package details.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useFocusEffect(fetchPackageDetails); // Refetch when screen comes into focus

  const handleAcceptPackage = async () => {
    if (!id) return;
    setIsActionLoading(true);
    try {
      const response = await api.put(`/packages/${id}/accept`, {}); // Backend requires pickup/dropoff in body if not on package
      setPackageDetails(response.data.package); // Update package details with the response from backend
      Alert.alert("Package Accepted", "You have accepted this package for delivery.");
      // router.push('/(tabs)/deliveries/active'); // Navigate to active deliveries or similar
    } catch (err: any) {
      console.error("Failed to accept package:", err);
      Alert.alert("Error", err.response?.data?.msg || "Could not accept the package.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRejectPackage = async () => {
    if (!id) return;
    setIsActionLoading(true);
    try {
      await api.put(`/packages/${id}/reject`);
      Alert.alert("Package Rejected", "You have chosen not to deliver this package.", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (err: any) {
      console.error("Failed to reject package:", err);
      Alert.alert("Error", err.response?.data?.msg || "Could not reject the package.");
    } finally {
      setIsActionLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={['top']}>
        <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
        <Text style={styles.loadingText}>Loading Package...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={['top']}>
        <AlertCircle size={40} color={Colors.danger.DEFAULT} />
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={fetchPackageDetails}>
            <Text style={styles.retryButtonText}>Try Again</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (!packageDetails) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={['top']}>
        <Text style={styles.errorText}>Package not found.</Text>
      </SafeAreaView>
    );
  }
  
  const isUserSender = user?.id === packageDetails.owner?.id || user?.id === packageDetails.owner; // owner might be ObjectId string or populated object
  const isPicker = user?.role === 'driver';
  // A package is considered accepted by THIS picker if a delivery exists for this package
  // AND the delivery's driver_id matches the current user's id.
  // This info (packageDetails.delivery.driver_id) needs to come from GET /packages/:id if status is 'accepted'
  const acceptedByCurrentUser = isPicker && packageDetails.status === 'accepted' && packageDetails.delivery?.driver_id === user?.id;


  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color={Colors.primary.DEFAULT} size={24} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>{packageDetails.name}</Text>
        <StatusBadge status={packageDetails.status} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Package Details</Text>
          <DetailItem icon={Package} label="Name" value={packageDetails.name} />
          {packageDetails.description && <DetailItem icon={Package} label="Description" value={packageDetails.description} />}
          <DetailItem icon={MapPin} label="From" value={packageDetails.pickupAddress} />
          <DetailItem icon={MapPin} label="To" value={packageDetails.deliveryAddress} />
          {packageDetails.weight && <DetailItem icon={Package} label="Weight" value={`${packageDetails.weight} kg`} />}
          {typeof packageDetails.dimensions === 'string' && <DetailItem icon={Package} label="Dimensions" value={packageDetails.dimensions} />}
          {/* TODO: Display object dimensions if available */}
          {packageDetails.price && <DetailItem icon={DollarSign} label="Price" value={`$${packageDetails.price.toFixed(2)}`} />}
          {packageDetails.owner?.username && <DetailItem icon={User} label="Sender" value={packageDetails.owner.name || packageDetails.owner.username} />}
          {packageDetails.createdAt && <DetailItem icon={Package} label="Created" value={new Date(packageDetails.createdAt).toLocaleDateString()} />}
        </View>

        {/* Conditional Actions */}
        <View style={styles.actions}>
          {isPicker && packageDetails.status === 'pending' && !isActionLoading && (
            <>
              <Pressable 
                style={[styles.actionButton, styles.acceptButton]}
                onPress={handleAcceptPackage}
                disabled={isActionLoading}
              >
                <CheckCircle color={Colors.white} size={20} />
                <Text style={styles.actionButtonText}>Accept Package</Text>
              </Pressable>
              <Pressable 
                style={[styles.actionButton, styles.rejectButton]}
                onPress={handleRejectPackage}
                disabled={isActionLoading}
              >
                <XCircle color={Colors.danger.DEFAULT} size={20} />
                <Text style={[styles.actionButtonText, styles.rejectButtonText]}>Reject Package</Text>
              </Pressable>
            </>
          )}
          {isActionLoading && <ActivityIndicator size="small" color={Colors.primary.DEFAULT} style={{ marginVertical: spacing.md }}/>}

          {isPicker && acceptedByCurrentUser && (
            <View style={styles.infoBox}>
              <CheckCircle color={Colors.success.DEFAULT} size={20} />
              <Text style={styles.infoText}>You have accepted this package. Manage in your active deliveries.</Text>
            </View>
          )}
          
          {isUserSender && (
             <View style={styles.infoBox}>
                <Package color={Colors.primary.DEFAULT} size={20} />
                <Text style={styles.infoText}>This is your package. Status: {packageDetails.status}.</Text>
             </View>
          )}

          {/* Original secondary actions can be kept or adapted */}
          {/* <View style={styles.secondaryActions}> ... </View> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Reusable DetailItem component
const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | undefined }) => (
  <View style={styles.detailRow}>
    <Icon color={Colors.gray[500]} size={18} style={styles.detailIcon} />
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.sm,
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.md,
    color: Colors.gray[600],
  },
  errorText: {
    marginTop: spacing.md,
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.md,
    color: Colors.danger.DEFAULT,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.lg,
    backgroundColor: Colors.primary.DEFAULT,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12, // Match actionButton
  },
  retryButtonText: {
    color: Colors.white,
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  backButton: {
    marginRight: spacing.md,
    padding: spacing.xs, // Make it easier to tap
  },
  title: {
    flex: 1,
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.lg,
    color: Colors.primary.DEFAULT,
    textAlign: 'left', // Ensure it aligns left if space allows
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.md,
    color: Colors.gray[700],
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align items to the start for multiline values
    marginBottom: spacing.md, // Increased margin
  },
  detailIcon: {
    marginRight: spacing.md,
    marginTop: spacing.xs / 2, // Align icon nicely with text
  },
  label: {
    width: 100, // Keep or adjust based on content
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.sm,
    color: Colors.gray[500],
  },
  value: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.sm,
    color: Colors.gray[800], // Darker for better readability
  },
  actions: {
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: spacing.md, // Standardized padding
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.md, // Spacing between buttons
    gap: spacing.sm, // Gap between icon and text
  },
  acceptButton: { // Was primaryButton
    backgroundColor: Colors.success.DEFAULT, // Changed color for accept
  },
  rejectButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.danger.DEFAULT,
  },
  actionButtonText: {
    color: Colors.white,
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.md, // Slightly larger text
  },
  rejectButtonText: {
    color: Colors.danger.DEFAULT,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[50],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.sm,
    color: Colors.primary.DEFAULT,
  }
  // secondaryActions and secondaryButton can be removed or adapted if needed
});