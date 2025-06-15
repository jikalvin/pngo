import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { spacing, fontSizes, borderRadius } from '@/constants/Layout'; // Added borderRadius
import { ChevronLeft, MessageCircle, MapPin } from 'lucide-react-native';
import StatusBadge from '@/components/StatusBadge';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { getFirestore, doc, getDoc, collection, addDoc, serverTimestamp, query, where, onSnapshot, writeBatch } from 'firebase/firestore';
import { useTranslation } from 'react-i18next'; // Added import

export default function PackageDetailsScreen() {
  const { t } = useTranslation(); // Initialized t
  const { id: taskIdParam } = useLocalSearchParams<{ id: string }>();
  const taskId = Array.isArray(taskIdParam) ? taskIdParam[0] : taskIdParam;
  const router = useRouter();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [isBidPlaced, setIsBidPlaced] = useState(false);
  const [bids, setBids] = useState<any[]>([]); // State for bids

  // Effect for fetching the task
  useEffect(() => {
    if (!taskId) {
      setLoading(false);
      Alert.alert(t('packageDetails.errorTitle'), t('createTask.alertMissingLogin')); // Reusing a general key, or create specific
      return;
    }
    const db = getFirestore();
    const taskDocRef = doc(db, 'tasks', taskId as string);

    const fetchTask = async () => {
      setLoading(true);
      try {
        const docSnap = await getDoc(taskDocRef);
        if (docSnap.exists()) {
          setTask({ id: docSnap.id, ...docSnap.data() });
        } else {
          Alert.alert(t('packageDetails.errorTitle'), t('packageDetails.taskNotFound'));
          setTask(null);
        }
      } catch (error) {
        console.error("Error fetching task:", error);
        Alert.alert(t('packageDetails.errorTitle'), t('packageDetails.taskLoadError'));
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [taskId]);

  // Effect for fetching bids if the current user is the task owner and task is open
  useEffect(() => {
    if (currentUser?.id === task?.userId && taskId && task?.status === 'open') {
      const db = getFirestore();
      const bidsQuery = query(
        collection(db, 'bids'),
        where('taskId', '==', taskId),
        where('status', '==', 'active') // Only show active bids for acceptance
      );
      const unsubscribe = onSnapshot(bidsQuery, (querySnapshot) => {
        const fetchedBids: any[] = [];
        querySnapshot.forEach((doc) => {
          fetchedBids.push({ id: doc.id, ...doc.data() });
        });
        setBids(fetchedBids);
      });
      return () => unsubscribe(); // Cleanup listener
    } else {
      setBids([]); // Clear bids if conditions are not met
    }
  }, [taskId, task, currentUser]);


  const handleAcceptBid = async (bid: any) => {
    if (!currentUser || !task || currentUser.id !== task.userId) {
      Alert.alert("Error", "You are not authorized to accept bids for this task.");
      return;
    }
    const db = getFirestore();
    const batch = writeBatch(db);

    // 1. Update the accepted bid
    const acceptedBidRef = doc(db, 'bids', bid.id);
    batch.update(acceptedBidRef, { status: 'accepted' });

    // 2. Update the task
    const taskRef = doc(db, 'tasks', taskId as string);
    batch.update(taskRef, {
      status: 'assigned',
      pickerId: bid.pickerId,
      assignedPrice: bid.bidAmount,
      // acceptedBidId: bid.id // Optional: store accepted bid ID
    });

    // 3. (Simplified) Reject other active bids for this task
    // This part can be expanded to query and update all other 'active' bids to 'rejected'
    // For simplicity now, we'll just update the accepted one and the task.
    // A more robust solution would involve a Cloud Function to ensure atomicity for rejecting other bids.
    bids.forEach(otherBid => {
      if (otherBid.id !== bid.id && otherBid.status === 'active') {
        const otherBidRef = doc(db, 'bids', otherBid.id);
        batch.update(otherBidRef, { status: 'rejected' });
      }
    });

    try {
      await batch.commit();
      Alert.alert("Success", "Bid accepted and task assigned!");
      // UI will update due to onSnapshot listeners for task and potentially bids
    } catch (error) {
      console.error("Error accepting bid:", error);
      Alert.alert("Error", "Failed to accept bid. Please try again.");
    }
  };

  const handleSubmitBid = async () => {
    if (!bidAmount || isNaN(parseFloat(bidAmount)) || parseFloat(bidAmount) <= 0) {
      Alert.alert("Invalid Bid", "Please enter a valid bid amount.");
      return;
    }
    if (!currentUser || !task) {
      Alert.alert("Error", "User or task details missing.");
      return;
    }

    const db = getFirestore();
    const bidData = {
      taskId: taskId,
      pickerId: currentUser.id,
      taskCreatorId: task.userId,
      bidAmount: parseFloat(bidAmount),
      bidAt: serverTimestamp(),
      status: 'active', // Initial status of the bid
      pickerName: currentUser.displayName || 'Picker',
      // pickerAvatar: currentUser.avatarUrl, // Optional
    };

    try {
      await addDoc(collection(db, 'bids'), bidData);
      Alert.alert("Success", "Bid placed successfully!");
      setIsBidPlaced(true); // Disable further bidding or change UI
      setBidAmount(''); // Clear input
    } catch (error) {
      console.error("Error placing bid:", error);
      Alert.alert("Error", "Failed to place bid. Please try again.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
        </View>
      </SafeAreaView>
    );
  }

  if (!task) {
    return (
      <SafeAreaView style={styles.container}>
         <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft color={Colors.primary.DEFAULT} size={24} />
            </Pressable>
            <Text style={styles.title}>{t('packageDetails.taskNotFound')}</Text>
          </View>
        <View style={styles.centered}>
          <Text>{t('packageDetails.taskLoadError')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Format price range for display
  const priceRange = `\$${task.priceMin?.toFixed(2) || '0.00'} - \$${task.priceMax?.toFixed(2) || '0.00'}`;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color={Colors.primary.DEFAULT} size={24} />
        </Pressable>
        <Text style={styles.title}>{task.deliveryName || `${t('packageDetails.headerFallbackPrefix')}${task.id.substring(0,4)}`}</Text>
        <StatusBadge status={task.status} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('packageDetails.sectionPackageDetails')}</Text>
          <View style={styles.detailRow}>
            <Text style={styles.label}>{t('packageDetails.labelFrom')}</Text>
            <Text style={styles.value}>{task.pickupAddress}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>{t('packageDetails.labelTo')}</Text>
            <Text style={styles.value}>{task.dropoffAddress}</Text>
          </View>
          {task.description && (
            <View style={styles.detailRow}>
              <Text style={styles.label}>{t('packageDetails.labelDescription')}</Text>
              <Text style={styles.value}>{task.description}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.label}>{t('packageDetails.labelWeight')}</Text>
            <Text style={styles.value}>{task.weight || t('packageDetails.labelNotAvailable')} {t('packageDetails.labelKgSuffix')}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>{t('packageDetails.labelSize')}</Text>
            <Text style={styles.value}>{task.size || t('packageDetails.labelNotAvailable')}</Text>
          </View>
           <View style={styles.detailRow}>
            <Text style={styles.label}>{t('packageDetails.labelPriority')}</Text>
            <Text style={styles.value}>{task.priority || t('common.notAvailable')}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>{t('packageDetails.labelType')}</Text>
            <Text style={styles.value}>{task.type || t('common.notAvailable')}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>{t('packageDetails.labelPriceRange')}</Text>
            <Text style={styles.value}>{priceRange}</Text>
          </View>
           <View style={styles.detailRow}>
            <Text style={styles.label}>{t('packageDetails.labelPaymentMethods')}</Text>
            <Text style={styles.value}>{task.paymentMethods || t('packageDetails.labelNotAvailable')}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>{t('packageDetails.labelCreatedAt')}</Text>
            <Text style={styles.value}>
              {task.createdAt?.toDate ? task.createdAt.toDate().toLocaleString() : t('packageDetails.labelNotAvailable')}
            </Text>
          </View>
        </View>

        {/* Bidding Section for Pickers */}
        {currentUser?.userType === 'picker' && task?.status === 'open' && (
          <View style={styles.biddingSection}>
            <Text style={styles.sectionTitle}>{t('packageDetails.sectionPlaceBid')}</Text>
            <TextInput
              style={styles.bidInput}
              placeholder={t('packageDetails.bidAmountPlaceholder')}
              keyboardType="numeric"
              value={bidAmount}
              onChangeText={setBidAmount}
              editable={!isBidPlaced}
            />
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton, isBidPlaced && styles.disabledButton]}
              onPress={handleSubmitBid}
              disabled={isBidPlaced || !bidAmount}
            >
              <Text style={styles.actionButtonText}>{isBidPlaced ? t('packageDetails.bidPlacedButton') : t('packageDetails.submitBidButton')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bids Display for Task Creator */}
        {currentUser?.id === task?.userId && task?.status === 'open' && bids.length > 0 && (
          <View style={styles.bidsListSection}>
            <Text style={styles.sectionTitle}>{t('packageDetails.sectionBidsReceived')}</Text>
            {bids.map((bid) => (
              <View key={bid.id} style={styles.bidItem}>
                <View style={styles.bidInfo}>
                  <Text style={styles.bidderName}>{bid.pickerName || `${t('packageDetails.labelBidderNamePrefix')}${bid.pickerId.substring(0,6)}`}</Text>
                  <Text style={styles.bidAmountText}>{`${t('packageDetails.labelBidAmountPrefix')}${bid.bidAmount?.toFixed(2)}`}</Text>
                  <Text style={styles.bidTimestamp}>
                    {t('packageDetails.labelBidTimestampPrefix')}{bid.bidAt?.toDate ? bid.bidAt.toDate().toLocaleTimeString() : t('packageDetails.labelNotAvailable')}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.actionButton, styles.acceptButton]}
                  onPress={() => handleAcceptBid(bid)}
                >
                  <Text style={styles.acceptButtonText}>{t('packageDetails.acceptBidButton')}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {currentUser?.id === task?.userId && task?.status === 'open' && bids.length === 0 && (
           <View style={styles.bidsListSection}>
            <Text style={styles.sectionTitle}>{t('packageDetails.sectionBidsReceived')}</Text>
            <Text style={styles.noBidsText}>{t('packageDetails.noActiveBids')}</Text>
          </View>
        )}


        {/* Existing Actions - adjust visibility/functionality based on user type */}
        {currentUser?.userType !== 'picker' && task?.status !== 'open' && (
          // Show "View Delivery Pickers / Bids" if task is assigned or closed, for creator
          <View style={styles.actions}>
            <Pressable
              style={[styles.actionButton, styles.primaryButton]}
              onPress={() => router.push(`/package/${taskId}/pickers`)}
            >
              <Text style={styles.actionButtonText}>{t('packageDetails.viewAssignedPickerButton')}</Text>
            </Pressable>
          </View>
        )}

        {/* Common actions or adjust based on role */}
        <View style={styles.actions}>
          <View style={styles.secondaryActions}>
            <Pressable 
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => router.push(`/package/${taskId}/chat`)} // Use taskId
            >
              <MessageCircle color={Colors.primary.DEFAULT} size={20} />
              <Text style={styles.secondaryButtonText}>{t('packageDetails.chatButton')}</Text>
            </Pressable>
            
            <Pressable 
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => router.push(`/package/${id}/track`)}
            >
              <MapPin color={Colors.primary.DEFAULT} size={20} />
              <Text style={styles.secondaryButtonText}>{t('packageDetails.trackButton')}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  },
  title: {
    flex: 1,
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.lg,
    color: Colors.primary.DEFAULT,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.md,
    color: Colors.gray[700],
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  label: {
    width: 100,
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.sm,
    color: Colors.gray[500],
  },
  value: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.sm,
    color: Colors.gray[700],
  },
  actions: {
    padding: spacing.lg,
  },
  actionButton: {
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary.DEFAULT,
    marginBottom: spacing.md,
  },
  actionButtonText: {
    color: Colors.white,
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.sm,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: Colors.primary[50],
    gap: spacing.xs,
  },
  secondaryButtonText: {
    color: Colors.primary.DEFAULT,
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.sm,
  },
});