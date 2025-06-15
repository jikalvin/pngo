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
import { getFirestore, doc, getDoc, collection, addDoc, serverTimestamp, query, where, onSnapshot, writeBatch } from 'firebase/firestore'; // Added query, where, onSnapshot, writeBatch

export default function PackageDetailsScreen() {
  const { id: taskIdParam } = useLocalSearchParams<{ id: string }>();
  const taskId = Array.isArray(taskIdParam) ? taskIdParam[0] : taskIdParam; // Ensure taskId is a string
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
      Alert.alert("Error", "Task ID is missing.");
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
          Alert.alert("Error", "Task not found.");
          setTask(null); // Ensure task is null if not found
        }
      } catch (error) {
        console.error("Error fetching task:", error);
        Alert.alert("Error", "Failed to fetch task details.");
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
            <Text style={styles.title}>Task Not Found</Text>
          </View>
        <View style={styles.centered}>
          <Text>Could not load task details.</Text>
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
        <Text style={styles.title}>{task.deliveryName || `Task #${task.id.substring(0,4)}`}</Text>
        <StatusBadge status={task.status} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Package Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.label}>From</Text>
            <Text style={styles.value}>{task.pickupAddress}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>To</Text>
            <Text style={styles.value}>{task.dropoffAddress}</Text>
          </View>
          {task.description && (
            <View style={styles.detailRow}>
              <Text style={styles.label}>Description</Text>
              <Text style={styles.value}>{task.description}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.label}>Weight</Text>
            <Text style={styles.value}>{task.weight || 'N/A'} kg</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Size</Text>
            <Text style={styles.value}>{task.size || 'N/A'}</Text>
          </View>
           <View style={styles.detailRow}>
            <Text style={styles.label}>Priority</Text>
            <Text style={styles.value}>{task.priority || 'Standard'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Type</Text>
            <Text style={styles.value}>{task.type || 'Standard'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Price Range</Text>
            <Text style={styles.value}>{priceRange}</Text>
          </View>
           <View style={styles.detailRow}>
            <Text style={styles.label}>Payment Methods</Text>
            <Text style={styles.value}>{task.paymentMethods || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Created At</Text>
            <Text style={styles.value}>
              {task.createdAt?.toDate ? task.createdAt.toDate().toLocaleString() : 'N/A'}
            </Text>
          </View>
        </View>

        {/* Bidding Section for Pickers */}
        {currentUser?.userType === 'picker' && task?.status === 'open' && (
          <View style={styles.biddingSection}>
            <Text style={styles.sectionTitle}>Place Your Bid</Text>
            <TextInput
              style={styles.bidInput}
              placeholder="Enter your bid amount"
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
              <Text style={styles.actionButtonText}>{isBidPlaced ? "Bid Placed" : "Submit Bid"}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bidding Section for Pickers - remains unchanged */}
        {currentUser?.userType === 'picker' && task?.status === 'open' && (
          <View style={styles.biddingSection}>
            <Text style={styles.sectionTitle}>Place Your Bid</Text>
            <TextInput
              style={styles.bidInput}
              placeholder="Enter your bid amount"
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
              <Text style={styles.actionButtonText}>{isBidPlaced ? "Bid Placed" : "Submit Bid"}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bids Display for Task Creator */}
        {currentUser?.id === task?.userId && task?.status === 'open' && bids.length > 0 && (
          <View style={styles.bidsListSection}>
            <Text style={styles.sectionTitle}>Bids Received</Text>
            {bids.map((bid) => (
              <View key={bid.id} style={styles.bidItem}>
                <View style={styles.bidInfo}>
                  <Text style={styles.bidderName}>{bid.pickerName || `Picker ID: ${bid.pickerId.substring(0,6)}`}</Text>
                  <Text style={styles.bidAmountText}>Amount: ${bid.bidAmount?.toFixed(2)}</Text>
                  <Text style={styles.bidTimestamp}>
                    Placed: {bid.bidAt?.toDate ? bid.bidAt.toDate().toLocaleTimeString() : 'N/A'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.actionButton, styles.acceptButton]}
                  onPress={() => handleAcceptBid(bid)}
                >
                  <Text style={styles.acceptButtonText}>Accept Bid</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {currentUser?.id === task?.userId && task?.status === 'open' && bids.length === 0 && (
           <View style={styles.bidsListSection}>
            <Text style={styles.sectionTitle}>Bids Received</Text>
            <Text style={styles.noBidsText}>No active bids yet for this task.</Text>
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
              <Text style={styles.actionButtonText}>View Assigned Picker / All Bids</Text>
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
              <Text style={styles.secondaryButtonText}>Chat</Text>
            </Pressable>
            
            <Pressable 
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => router.push(`/package/${id}/track`)}
            >
              <MapPin color={Colors.primary.DEFAULT} size={20} />
              <Text style={styles.secondaryButtonText}>Track</Text>
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