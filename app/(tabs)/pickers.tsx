import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Bell, Search, Filter } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Bell, Search, Filter, AlertCircle } from 'lucide-react-native'; // Added AlertCircle
import Colors from '@/constants/Colors';
import Layout, { spacing, fontSizes, borderRadius } from '@/constants/Layout';
// import PickerListItem from '@/components/PickerListItem'; // Will be replaced
import PackageListItem, { PackageItemProps } from '@/components/PackageListItem'; // Import new component
import api from '@/utils/api'; // Assuming default export from api.js
import { useAuth } from '@/context/AuthContext'; // Or your Redux equivalent to get user role
import { useFocusEffect } from 'expo-router';


export default function AvailablePackagesScreen() { // Renamed screen
  const [searchText, setSearchText] = useState('');
  const [packages, setPackages] = useState<PackageItemProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // const { user } = useAuth(); // Uncomment and use if you have useAuth() from AuthContext

  // TODO: Add role check - this screen is for drivers
  // if (user?.role !== 'driver') {
  //   return (
  //     <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
  //       <View style={styles.centeredMessageContainer}>
  //         <Text style={styles.errorText}>This section is for drivers only.</Text>
  //       </View>
  //     </SafeAreaView>
  //   );
  // }

  const fetchAvailablePackages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/packages/available');
      setPackages(response.data || []);
    } catch (err: any) {
      console.error("Failed to fetch available packages:", err);
      setError(err.response?.data?.msg || err.message || "An unexpected error occurred.");
      setPackages([]); // Clear packages on error
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on initial load and when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchAvailablePackages();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAvailablePackages().then(() => setRefreshing(false));
  }, []);
  
  // TODO: Implement search/filter logic if needed, or remove search UI
  const filteredPackages = packages.filter(pkg => 
    pkg.name.toLowerCase().includes(searchText.toLowerCase()) ||
    pkg.pickupAddress.toLowerCase().includes(searchText.toLowerCase()) ||
    pkg.deliveryAddress.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Animated.Text 
          entering={FadeIn.duration(800)}
          style={styles.title}
        >
          Available Packages
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
          placeholder="Search packages (name, pickup, destination)..."
          placeholderTextColor={Colors.gray[400]}
          value={searchText}
          onChangeText={setSearchText}
        />
        {/* <TouchableOpacity>
          <Filter size={20} color={Colors.primary.DEFAULT} />
        </TouchableOpacity> */}
      </Animated.View>

      {isLoading && !refreshing && (
        <View style={styles.centeredMessageContainer}>
          <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
          <Text style={styles.loadingText}>Loading packages...</Text>
        </View>
      )}

      {error && !isLoading && (
        <View style={styles.centeredMessageContainer}>
          <AlertCircle size={40} color={Colors.danger.DEFAULT} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchAvailablePackages}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isLoading && !error && filteredPackages.length === 0 && (
        <View style={styles.centeredMessageContainer}>
          <Text style={styles.noPackagesText}>No available packages found at the moment.</Text>
          <Text style={styles.noPackagesSubText}>Check back later or pull to refresh.</Text>
        </View>
      )}

      {!isLoading && !error && filteredPackages.length > 0 && (
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary.DEFAULT]}/>
          }
        >
          <Animated.View
            entering={FadeInDown.duration(600).delay(300)} // Consider removing if list is long
            style={styles.packagesListContainer} // Renamed from pickersContainer
          >
            {filteredPackages.map((pkg) => ( // Use filteredPackages
              <PackageListItem 
                key={pkg.id} // Assuming API returns 'id', if it's '_id', adjust here and in component
                item={pkg}
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
  packagesListContainer: { // Renamed
    paddingHorizontal: spacing.lg, // Use lg for consistency with search bar horizontal margin
    paddingVertical: spacing.md,
  },
});