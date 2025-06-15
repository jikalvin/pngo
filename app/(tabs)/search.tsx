import { View, Text, StyleSheet, FlatList } from 'react-native'; // Changed ScrollView to FlatList
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { spacing, fontSizes } from '@/constants/Layout';
import { Search as SearchIcon, Package } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // Added import
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { getFirestore, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import PackageCard from '@/components/PackageCard';
import { useRouter } from 'expo-router';

export default function SearchScreen() {
  const router = useRouter();
  const { t } = useTranslation(); // Initialized t
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [openTasks, setOpenTasks] = useState<any[]>([]);

  useEffect(() => {
    const db = getFirestore();
    const q = query(
      collection(db, 'tasks'),
      where('status', '==', 'open'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasks: any[] = [];
      querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() });
      });
      setOpenTasks(tasks);
    });

    return () => unsubscribe();
  }, []);

  const renderTaskCard = ({ item }: { item: any }) => (
    <PackageCard
      package={{
        id: item.id,
        title: item.deliveryName || `Task #${item.id.substring(0,4)}`,
        status: item.status,
        from: item.pickupAddress,
        to: item.dropoffAddress,
        created: item.createdAt?.toDate ? item.createdAt.toDate().toISOString() : new Date().toISOString(),
        // Add price range if PackageCard supports it, or if needed for display
        // priceMin: item.priceMin,
        // priceMax: item.priceMax,
      }}
      onPress={() => router.push(`/package/${item.id}`)}
    />
  );

  // Optional: Show different content if user is not a picker
  // if (currentUser?.userType !== 'picker') {
  //   return (
  //     <SafeAreaView style={styles.container}>
  //       <View style={styles.header}>
  //         <Text style={styles.title}>Task Search</Text>
  //         <SearchIcon color={Colors.primary.DEFAULT} size={24} />
  //       </View>
  //       <View style={styles.emptyContainer}>
  //         <Text style={styles.emptyText}>Task search is available for pickers.</Text>
  //       </View>
  //     </SafeAreaView>
  //   );
  // }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('search.title')}</Text>
        <SearchIcon color={Colors.primary.DEFAULT} size={24} />
      </View>
      
      {openTasks.length > 0 ? (
        <FlatList
          data={openTasks}
          renderItem={renderTaskCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContentContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Package color={Colors.gray[300]} size={64} />
          <Text style={styles.emptyText}>{t('search.emptyStateText')}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white, // Changed from Colors.background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200], // Consistent border color
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.lg,
    color: Colors.black, // Consistent title color
  },
  listContentContainer: { // Changed from contentContainer for FlatList
    padding: spacing.md, // Consistent padding
  },
  emptyContainer: { // For centering empty state content
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  emptyText: {
    fontFamily: 'Poppins-Regular', // Consistent font
    fontSize: fontSizes.md, // Slightly larger for better visibility
    color: Colors.gray[600], // Consistent color
    textAlign: 'center',
    marginTop: spacing.md, // Consistent margin
  },
});