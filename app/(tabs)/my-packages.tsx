import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import Colors from '@/constants/Colors';
import { spacing, fontSizes } from '@/constants/Layout';
import { Package, AlertCircle } from 'lucide-react-native'; // Added AlertCircle for errors
import PackageCard from '@/components/PackageCard'; // Assuming PackageCard can be used for Tasks
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks } from '@/store/taskSlice';
import type { AppDispatch, RootState } from '@/store/store';
import type { Task } from '@/store/taskSlice'; // Import Task interface

// Default filters - you might want to make these configurable (e.g., via UI tabs or filters)
const DEFAULT_TASK_STATUS = 'pending';
const DEFAULT_PAGE_LIMIT = 10;

export default function MyPackagesScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, isLoading, error, currentPage, totalPages, totalTasks } = useSelector(
    (state: RootState) => state.tasks
  );

  const [currentStatusFilter, setCurrentStatusFilter] = useState<string>(DEFAULT_TASK_STATUS);
  // TODO: Implement pagination logic (e.g., onEndReached for FlatList)

  useEffect(() => {
    // Fetch tasks when the component mounts or when the filter/page changes
    dispatch(fetchTasks({
      page: 1, // Start with page 1 on initial load/filter change
      limit: DEFAULT_PAGE_LIMIT,
      status: currentStatusFilter
    }));
  }, [dispatch, currentStatusFilter]);

  const handleRefresh = () => {
    dispatch(fetchTasks({ page: 1, limit: DEFAULT_PAGE_LIMIT, status: currentStatusFilter }));
  };

  const loadMoreTasks = () => {
    if (currentPage < totalPages && !isLoading) {
      dispatch(fetchTasks({ page: currentPage + 1, limit: DEFAULT_PAGE_LIMIT, status: currentStatusFilter }));
    }
  };

  const renderTaskItem = ({ item }: { item: Task }) => {
    // Adapt the props for PackageCard or create a TaskCard component
    // For now, assuming PackageCard can take a 'task' object similar to 'package'
    // Or that the Task interface is compatible with what PackageCard expects.
    // Example adaptation:
    const packageCardProps = {
      id: item.id,
      title: item.title || `Task #${item.id}`, // Fallback title
      status: item.status,
      from: item.pickupAddress,
      to: item.deliveryAddress,
      created: item.createdAt, // Assuming PackageCard can handle ISO string
      // Add any other props PackageCard expects, mapping from Task fields
    };
    return (
      <PackageCard
        package={packageCardProps} // Pass the adapted props
        onPress={() => router.push(`/package/${item.id}`)} // Ensure this route exists and can handle task IDs
      />
    );
  };

  if (isLoading && tasks.length === 0) { // Show full screen loader only on initial load (no tasks yet)
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={['top', 'left', 'right']}>
        <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
      </SafeAreaView>
    );
  }

  if (error && tasks.length === 0) { // Show full screen error only if no tasks could be displayed
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={['top', 'left', 'right']}>
        <AlertCircle size={48} color={Colors.danger.DEFAULT} />
        <Text style={styles.errorText}>Error loading packages: {error}</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Animated.Text 
          entering={FadeIn.duration(800)}
          style={styles.title}
        >
          My Packages
        </Animated.Text>
        {/* TODO: Add filter UI (e.g., tabs for different statuses) */}
      </View>
      
      {tasks.length > 0 ? (
        <FlatList
          data={tasks}
          renderItem={renderTaskItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} colors={[Colors.primary.DEFAULT]} />
          }
          onEndReached={loadMoreTasks}
          onEndReachedThreshold={0.5} // Load more when half a screen away from the end
          ListFooterComponent={isLoading && tasks.length > 0 ? <ActivityIndicator style={{ marginVertical: spacing.md }} color={Colors.primary.DEFAULT} /> : null}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={ // Allow refresh even on empty state
            <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} colors={[Colors.primary.DEFAULT]} />
          }
        >
          <View style={styles.emptyState}>
            <Package color={Colors.gray[300]} size={64} />
            <Text style={styles.emptyStateText}>No packages yet for "{currentStatusFilter}" status.</Text>
            <Text style={styles.emptyStateSubtext}>Your packages will appear here.</Text>
            {error && <Text style={styles.inlineErrorText}>Last attempt failed: {error}</Text>}
          </View>
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
  centered: { // For full screen loader/error
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: { // For full screen error
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.md,
    color: Colors.danger.DEFAULT,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  inlineErrorText: { // For error message on empty screen when a previous fetch failed
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.sm,
    color: Colors.danger.DEFAULT,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  retryButton: { // For full screen error
    backgroundColor: Colors.primary.DEFAULT,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: fontSizes.sm, // Assuming borderRadius is a constant object like fontSizes
  },
  retryButtonText: { // For full screen error
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.md,
    color: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.xl,
    color: Colors.primary.DEFAULT,
  },
  list: {
    padding: spacing.md,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyStateText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.lg,
    color: Colors.gray[700],
    marginTop: spacing.md,
  },
  emptyStateSubtext: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.sm,
    color: Colors.gray[500],
    marginTop: spacing.xs,
  },
});