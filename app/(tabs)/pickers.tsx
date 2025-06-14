import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Bell, Search, Filter, AlertCircle, UserX } from 'lucide-react-native'; // Added UserX for empty state
import Colors from '@/constants/Colors';
import Layout, { spacing, fontSizes, borderRadius } from '@/constants/Layout';
import PickerListItem from '@/components/PickerListItem';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from '@/store/userSlice';
import type { AppDispatch, RootState } from '@/store/store';
import type { User } from '@/store/authSlice'; // Re-use User from authSlice
import { useRouter } from 'expo-router'; // For navigation

const DEFAULT_PAGE_LIMIT = 10;

export default function PickersScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { users, isLoading, error, currentPage, totalPages } = useSelector(
    (state: RootState) => state.users // Assuming 'users' is the key for userSlice in store
  );

  const [searchText, setSearchText] = useState('');
  // TODO: Implement search and filter logic

  const loadPickers = useCallback((page = 1, isRefreshing = false) => {
    // For now, fetch all pickers. Add search/filter params as needed.
    dispatch(fetchUsers({ role: 'picker', page, limit: DEFAULT_PAGE_LIMIT }));
  }, [dispatch]);

  useEffect(() => {
    loadPickers(); // Initial load
  }, [loadPickers]);

  const handleRefresh = () => {
    loadPickers(1, true);
  };

  const loadMorePickers = () => {
    if (currentPage < totalPages && !isLoading) {
      loadPickers(currentPage + 1);
    }
  };

  const handlePickerPress = (picker: User) => {
    // Navigate to picker's profile.
    // Actual navigation path might be /picker/[id] or /profile/[id]
    // console.log("Selected picker:", picker.id);
    router.push(`/picker/${picker.id}`);
  };

  const renderPickerItem = ({ item }: { item: User }) => (
    <PickerListItem
      picker={item} // Assuming PickerListItem is compatible with the User interface
      onPress={() => handlePickerPress(item)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <UserX size={64} color={Colors.gray[300]} />
      <Text style={styles.emptyStateText}>No pickers found</Text>
      {error && <Text style={styles.inlineErrorText}>Error: {error}</Text>}
      <TouchableOpacity onPress={handleRefresh} style={styles.retryButtonSmall}>
        <Text style={styles.retryButtonTextSmall}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && users.length === 0) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={['top', 'left', 'right']}>
        <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
      </SafeAreaView>
    );
  }

  // Show full-screen error only if initial load failed catastrophically
  if (error && users.length === 0 && !isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={['top', 'left', 'right']}>
        <AlertCircle size={48} color={Colors.danger.DEFAULT} />
        <Text style={styles.errorText}>Failed to load pickers: {error}</Text>
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
          Pickers
        </Animated.Text>
        <TouchableOpacity>
          <Bell color={Colors.primary.DEFAULT} size={24} />
        </TouchableOpacity>
      </View>

      <Animated.View 
        entering={FadeInDown.duration(600).delay(200)}
        style={styles.searchContainer}
      >
        <Search size={20} color={Colors.gray[500]} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search pickers by name, location..."
          placeholderTextColor={Colors.gray[400]}
          value={searchText}
          onChangeText={setSearchText}
          // onSubmitEditing={() => loadPickers(1, true)} // Trigger search on submit
        />
        <TouchableOpacity>
          <Filter size={20} color={Colors.primary.DEFAULT} />
        </TouchableOpacity>
      </Animated.View>

      <FlatList
        data={users}
        renderItem={renderPickerItem}
        keyExtractor={(item) => item.id.toString()} // Ensure ID is string for keyExtractor
        contentContainerStyle={styles.pickersContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} colors={[Colors.primary.DEFAULT]} />
        }
        onEndReached={loadMorePickers}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isLoading && users.length > 0 ? <ActivityIndicator style={{ marginVertical: spacing.md }} color={Colors.primary.DEFAULT} /> : null}
      />
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
  errorText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.md,
    color: Colors.danger.DEFAULT,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  inlineErrorText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.sm,
    color: Colors.danger.DEFAULT,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  retryButton: {
    backgroundColor: Colors.primary.DEFAULT,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  retryButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.md,
    color: Colors.white,
  },
  retryButtonSmall: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth:1,
    borderColor: Colors.primary.DEFAULT,
    marginTop: spacing.md,
  },
  retryButtonTextSmall: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.sm,
    color: Colors.primary.DEFAULT,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    marginTop: spacing.xxl * 2, // Push it down a bit
  },
  emptyStateText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.lg,
    color: Colors.gray[700],
    marginTop: spacing.md,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: Colors.primary[50],
    borderRadius: borderRadius.md,
    height: 44,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.sm,
    color: Colors.gray[800],
  },
  content: {
    flex: 1,
  },
  pickersContainer: {
    paddingVertical: spacing.sm, // Adjusted padding
  },
  content: { // This style might not be directly used if FlatList is the main body
    flex: 1,
  },
  pickersContainer: { // Used for FlatList contentContainerStyle
    padding: spacing.md,
  },
});