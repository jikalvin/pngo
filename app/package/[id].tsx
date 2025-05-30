import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { spacing, fontSizes } from '@/constants/Layout';
import { ChevronLeft, MessageCircle, MapPin } from 'lucide-react-native';
import StatusBadge from '@/components/StatusBadge';

export default function PackageDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // TODO: Fetch package details from API using the id
  const packageDetails = {
    id,
    status: 'pending',
    title: 'Package #1234',
    from: '123 Main St, City',
    to: '456 Second St, City',
    description: 'Fragile items, handle with care',
    weight: '2.5 kg',
    dimensions: '30x20x15 cm',
    created: '2024-01-20',
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color={Colors.primary.DEFAULT} size={24} />
        </Pressable>
        <Text style={styles.title}>{packageDetails.title}</Text>
        <StatusBadge status={packageDetails.status} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Package Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.label}>From</Text>
            <Text style={styles.value}>{packageDetails.from}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>To</Text>
            <Text style={styles.value}>{packageDetails.to}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.value}>{packageDetails.description}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Weight</Text>
            <Text style={styles.value}>{packageDetails.weight}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Dimensions</Text>
            <Text style={styles.value}>{packageDetails.dimensions}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable 
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => router.push(`/package/${id}/pickers`)}
          >
            <Text style={styles.actionButtonText}>View Delivery Pickers</Text>
          </Pressable>
          
          <View style={styles.secondaryActions}>
            <Pressable 
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => router.push(`/package/${id}/chat`)}
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