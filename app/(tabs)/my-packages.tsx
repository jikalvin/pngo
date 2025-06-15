import { View, Text, StyleSheet, FlatList } from 'react-native'; // Removed Pressable
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import Colors from '@/constants/Colors';
import { spacing, fontSizes } from '@/constants/Layout';
import { Package } from 'lucide-react-native';
import PackageCard from '@/components/PackageCard';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // Added import
import { useSelector } from 'react-redux'; // Added Redux
import { RootState } from '@/store/store'; // Added Redux
import { getFirestore, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'; // Added Firestore

export default function MyPackagesScreen() {
  const router = useRouter();
  const { t } = useTranslation(); // Initialized t
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.id;
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) {
      setTasks([]); // Clear tasks if no user
      return;
    }

    const db = getFirestore();
    const tasksCollection = collection(db, 'tasks');
    const q = query(
      tasksCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userTasks: any[] = [];
      querySnapshot.forEach((doc) => {
        userTasks.push({ id: doc.id, ...doc.data() });
      });
      setTasks(userTasks);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [userId]); // Rerun effect if userId changes

  const renderPackage = ({ item }: { item: any }) => (
    <PackageCard
      package={{ // Adapt Firestore data to PackageCard's expected 'package' prop structure
        id: item.id,
        title: item.deliveryName || `Package #${item.id.substring(0,4)}`,
        status: item.status,
        from: item.pickupAddress,
        to: item.dropoffAddress, // Assuming dropoffAddress is the destination
        // Firestore Timestamps need conversion. Handle potential null.
        created: item.createdAt?.toDate ? item.createdAt.toDate().toISOString() : new Date().toISOString(),
      }}
      onPress={() => router.push(`/package/${item.id}`)}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Animated.Text 
          entering={FadeIn.duration(800)}
          style={styles.title}
        >
          {t('myPackages.title')}
        </Animated.Text>
      </View>
      
      {tasks.length > 0 ? (
        <FlatList
          data={tasks}
          renderItem={renderPackage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.content}>
          <View style={styles.emptyState}>
            <Package color={Colors.gray[300]} size={64} />
            <Text style={styles.emptyStateText}>{t('myPackages.emptyStateText')}</Text>
            <Text style={styles.emptyStateSubtext}>{t('myPackages.emptyStateSubtext')}</Text>
          </View>
        </View>
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