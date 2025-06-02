import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, router } from 'expo-router';
import { DollarSign, AlertCircle, ChevronLeft } from 'lucide-react-native';

import Colors from '@/constants/Colors';
import Layout, { spacing, fontSizes, borderRadius } from '@/constants/Layout';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext'; // Or your Redux equivalent

export default function PickerEarningsScreen() {
  const [earnings, setEarnings] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { user } = useAuth();

  if (user?.role !== 'driver') {
    return (
      <SafeAreaView style={[styles.container, styles.centeredMessageContainer]} edges={['top']}>
        <Text style={styles.errorText}>Access Denied. This section is for drivers only.</Text>
         <TouchableOpacity onPress={() => router.replace('/(tabs)/')} style={styles.button}>
            <Text style={styles.buttonText}>Go to Home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const fetchEarnings = async () => {
    if (!user?.id) {
      setError("User ID not found. Cannot fetch earnings.");
      setIsLoading(false);
      return;
    }
    if(!isLoading) setIsLoading(true);
    setError(null);
    try {
      // The backend route is /api/pickers/:id/earnings
      const response = await api.get(`/pickers/${user.id}/earnings`);
      setEarnings(response.data.earnings); // Assuming API returns { username, earnings }
    } catch (err: any) {
      console.error("Failed to fetch earnings:", err);
      setError(err.response?.data?.msg || err.message || "An unexpected error occurred.");
      setEarnings(null);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEarnings();
    }, [user?.id]) // Re-fetch if user ID changes (e.g., re-login)
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEarnings().then(() => setRefreshing(false));
  }, [user?.id]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.primary.DEFAULT} />
        </TouchableOpacity>
        <Text style={styles.title}>My Earnings</Text>
        <View style={{width: 24}} />{/* Placeholder for right side balance */}
      </View>

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary.DEFAULT]}/>
        }
      >
        {isLoading && !refreshing ? (
          <View style={styles.centeredMessageContainer}>
            <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
            <Text style={styles.loadingText}>Loading earnings...</Text>
          </View>
        ) : error ? (
          <View style={styles.centeredMessageContainer}>
            <AlertCircle size={40} color={Colors.danger.DEFAULT} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.button} onPress={fetchEarnings}>
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : earnings !== null ? (
          <View style={styles.earningsCard}>
            <DollarSign size={48} color={Colors.success.DEFAULT} />
            <Text style={styles.earningsLabel}>Total Earnings</Text>
            <Text style={styles.earningsAmount}>${earnings.toFixed(2)}</Text>
            <Text style={styles.infoText}>This reflects your earnings from successfully delivered packages.</Text>
          </View>
        ) : (
           <View style={styles.centeredMessageContainer}>
             <Text style={styles.noDataText}>No earnings data available yet.</Text>
           </View>
        )}
        {/* TODO: Add transaction history or breakdown if available from other endpoints */}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.xl,
    color: Colors.primary.DEFAULT,
  },
  contentContainer: {
    flexGrow: 1, // Ensures content can center if not scrollable
    padding: spacing.lg,
  },
  centeredMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.md,
    color: Colors.danger.DEFAULT,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  loadingText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.md,
    color: Colors.gray[600],
    marginTop: spacing.md,
  },
  noDataText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.md,
    color: Colors.gray[600],
  },
  button: {
    backgroundColor: Colors.primary.DEFAULT,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
  },
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    color: Colors.white,
    fontSize: fontSizes.md,
  },
  earningsCard: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  earningsLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.lg,
    color: Colors.gray[600],
    marginTop: spacing.md,
  },
  earningsAmount: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSizes.xxxl,
    color: Colors.success.DEFAULT,
    marginVertical: spacing.sm,
  },
  infoText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.sm,
    color: Colors.gray[500],
    textAlign: 'center',
    marginTop: spacing.md,
  }
});
