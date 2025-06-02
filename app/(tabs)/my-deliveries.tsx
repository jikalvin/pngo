import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, router } from 'expo-router'; // Added router for potential navigation from header
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { AlertCircle, PackagePlus } from 'lucide-react-native'; // PackagePlus for adding new packages (if applicable)

import Colors from '@/constants/Colors';
import Layout, { spacing, fontSizes, borderRadius } from '@/constants/Layout';
import DeliveryListItem, { DeliveryItemData } from '@/components/DeliveryListItem';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext'; // Or your Redux equivalent

export default function MyDeliveriesScreen() {
  const [deliveries, setDeliveries] = useState<DeliveryItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false); // For individual item actions
  const [targetedDeliveryId, setTargetedDeliveryId] = useState<string | null>(null); // To show loading on specific item


  const { user } = useAuth(); // Assuming useAuth provides user info including role

  // Role check
  if (user?.role !== 'driver') {
    // This check should ideally happen at the layout level or via a Higher Order Component
    // For now, just rendering a message.
    return (
      <SafeAreaView style={[styles.container, styles.centeredMessageContainer]} edges={['top']}>
        <Text style={styles.errorText}>Access Denied. This section is for drivers only.</Text>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/')} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Go to Home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const fetchActiveDeliveries = async () => {
    if (!isLoading) setIsLoading(true); // Ensure loading is true if not already (e.g. for manual refresh)
    setError(null);
    try {
      const response = await api.get('/deliveries/active');
      setDeliveries(response.data || []);
    } catch (err: any) {
      console.error("Failed to fetch active deliveries:", err);
      setError(err.response?.data?.msg || err.message || "An unexpected error occurred.");
      setDeliveries([]);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchActiveDeliveries();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchActiveDeliveries().then(() => setRefreshing(false));
  }, []);

  const handleUpdateStatus = async (deliveryId: string, newStatus: DeliveryItemData['status']) => {
    setIsActionLoading(true);
    setTargetedDeliveryId(deliveryId);
    try {
      await api.put(`/deliveries/${deliveryId}/status`, { status: newStatus });
      // Refresh the list to show updated status and potentially remove completed/failed items
      await fetchActiveDeliveries(); 
    } catch (err: any) {
      console.error(`Failed to update delivery ${deliveryId} to ${newStatus}:`, err);
      Alert.alert("Update Failed", err.response?.data?.msg || `Could not update status to ${newStatus}.`);
    } finally {
      setIsActionLoading(false);
      setTargetedDeliveryId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Animated.Text entering={FadeIn.duration(800)} style={styles.title}>
          My Active Deliveries
        </Animated.Text>
        {/* Optional: Add a button to navigate somewhere, e.g., delivery history */}
      </View>

      {isLoading && !refreshing && (
        <View style={styles.centeredMessageContainer}>
          <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
          <Text style={styles.loadingText}>Loading active deliveries...</Text>
        </View>
      )}

      {error && !isLoading && (
        <View style={styles.centeredMessageContainer}>
          <AlertCircle size={40} color={Colors.danger.DEFAULT} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchActiveDeliveries}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isLoading && !error && deliveries.length === 0 && (
        <View style={styles.centeredMessageContainer}>
          <Text style={styles.noPackagesText}>No active deliveries at the moment.</Text>
          <Text style={styles.noPackagesSubText}>Accepted packages will appear here.</Text>
        </View>
      )}

      {!isLoading && !error && deliveries.length > 0 && (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary.DEFAULT]} />
          }
        >
          <Animated.View
            entering={FadeInDown.duration(600).delay(200)} // Staggered animation for the list
            style={styles.listContainer}
          >
            {deliveries.map((item) => (
              <DeliveryListItem 
                key={item._id} 
                item={item} 
                onUpdateStatus={handleUpdateStatus}
                isActionLoading={isActionLoading && targetedDeliveryId === item._id}
                setTargetedDeliveryId={setTargetedDeliveryId}
              />
            ))}
          </Animated.View>
        </ScrollView>
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.xl,
    color: Colors.primary.DEFAULT,
  },
  centeredMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.md,
    color: Colors.danger.DEFAULT,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  loadingText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.md,
    color: Colors.gray[600],
    marginTop: spacing.md,
  },
  noPackagesText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.lg,
    color: Colors.gray[700],
    textAlign: 'center',
  },
  noPackagesSubText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.md,
    color: Colors.gray[500],
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  retryButton: {
    marginTop: spacing.lg,
    backgroundColor: Colors.primary.DEFAULT,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    fontFamily: 'Poppins-SemiBold',
    color: Colors.white,
    fontSize: fontSizes.md,
  },
  content: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});
