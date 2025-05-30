import { View, Text, StyleSheet, Pressable } from 'react-native';
import Colors from '@/constants/Colors';
import { spacing, fontSizes } from '@/constants/Layout';
import { Star, Clock } from 'lucide-react-native';
// import PickerAvatar from './PickerAvatar';
import { PickerAvatar } from './PickerAvatar';

type PickerListItemProps = {
  picker: {
    id: string;
    name: string;
    rating: number;
    reviews: number;
    price: number;
    avatar: string;
    estimatedTime: string;
  };
  onSelect: () => void;
};

export default function PickerListItem({ picker, onSelect }: PickerListItemProps) {
  return (
    <Pressable 
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed
      ]}
      onPress={onSelect}
    >
      <View style={styles.header}>
        <PickerAvatar
          size={48}
          uri={picker.avatar}
        />
        <View style={styles.info}>
          <Text style={styles.name}>{picker.name}</Text>
          <View style={styles.ratingContainer}>
            <Star size={16} color={Colors.warning.DEFAULT} fill={Colors.warning.DEFAULT} />
            <Text style={styles.rating}>
              {typeof picker.rating === 'number' ? picker.rating.toFixed(1) : 'N/A'} ({picker.reviews})
            </Text>
          </View>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>${typeof picker.rating === 'number' ? picker.rating.toFixed(1) : 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.estimatedTime}>
          <Clock size={16} color={Colors.gray[500]} />
          <Text style={styles.estimatedTimeText}>
            Estimated delivery: {picker.estimatedTime}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  pressed: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.md,
    color: Colors.gray[800],
    marginBottom: spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.sm,
    color: Colors.gray[600],
    marginLeft: spacing.xs,
  },
  priceContainer: {
    backgroundColor: Colors.primary[50],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  price: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.md,
    color: Colors.primary.DEFAULT,
  },
  footer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  estimatedTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  estimatedTimeText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.sm,
    color: Colors.gray[600],
    marginLeft: spacing.xs,
  },
});