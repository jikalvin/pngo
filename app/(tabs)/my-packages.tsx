import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import Colors from '@/constants/Colors';
import { spacing, fontSizes } from '@/constants/Layout';
import { Package } from 'lucide-react-native';
import PackageCard from '@/components/PackageCard';

export default function MyPackagesScreen() {
  const router = useRouter();

  // TODO: Fetch packages from API
  const packages = [
    {
      id: '1',
      title: 'Package #1234',
      status: 'pending',
      from: '123 Main St, City',
      to: '456 Second St, City',
      created: '2024-01-20',
    },
    {
      id: '2',
      title: 'Package #5678',
      status: 'in_transit',
      from: '789 Third St, City',
      to: '321 Fourth St, City',
      created: '2024-01-19',
    },
  ];

  const renderPackage = ({ item }) => (
    <PackageCard
      package={item}
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
          My Packages
        </Animated.Text>
      </View>
      
      {packages.length > 0 ? (
        <FlatList
          data={packages}
          renderItem={renderPackage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.content}>
          <View style={styles.emptyState}>
            <Package color={Colors.gray[300]} size={64} />
            <Text style={styles.emptyStateText}>No packages yet</Text>
            <Text style={styles.emptyStateSubtext}>Your packages will appear here</Text>
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