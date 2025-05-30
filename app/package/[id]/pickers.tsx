import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { spacing, fontSizes } from '@/constants/Layout';
import { ChevronLeft, Star } from 'lucide-react-native';
import PickerListItem from '@/components/PickerListItem';

export default function PackagePickersScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // TODO: Fetch pickers from API
  const pickers = [
    {
      id: '1',
      name: 'John Doe',
      rating: 4.8,
      reviews: 156,
      price: 25.00,
      avatar: 'https://i.pravatar.cc/150?img=1',
      estimatedTime: '2-3 hours',
    },
    {
      id: '2',
      name: 'Jane Smith',
      rating: 4.9,
      reviews: 243,
      price: 28.50,
      avatar: 'https://i.pravatar.cc/150?img=2',
      estimatedTime: '1-2 hours',
    },
  ];

  const handlePickerSelect = (pickerId: string) => {
    router.push(`/package/${id}/payment?picker=${pickerId}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color={Colors.primary.DEFAULT} size={24} />
        </Pressable>
        <Text style={styles.title}>Available Pickers</Text>
      </View>

      <ScrollView style={styles.content}>
        {pickers.map((picker) => (
          <PickerListItem
            key={picker.id}
            picker={picker}
            onSelect={() => handlePickerSelect(picker.id)}
          />
        ))}
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
    padding: spacing.md,
  },
});