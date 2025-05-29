import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '@/constants/Colors';
import Layout, { spacing, fontSizes, borderRadius } from '@/constants/Layout';
import { PickerAvatar } from './PickerAvatar';
import { StatusBadge } from './StatusBadge';
import { MapPin } from 'lucide-react-native';

interface Picker {
  id: number;
  name: string;
  location: string;
  rating: number;
  deliveries: number;
  available: boolean;
}

interface PickerListItemProps {
  picker: Picker;
  onPress?: () => void;
}

export function PickerListItem({ picker, onPress }: PickerListItemProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <PickerAvatar pickerId={picker.id} size={50} showBadge isAvailable={picker.available} />
      
      <View style={styles.infoContainer}>
        <View style={styles.header}>
          <Text style={styles.name}>{picker.name}</Text>
          <StatusBadge status={picker.available ? 'available' : 'unavailable'} />
        </View>
        
        <View style={styles.location}>
          <MapPin size={12} color={Colors.gray[500]} />
          <Text style={styles.locationText}>{picker.location}</Text>
        </View>
        
        <View style={styles.stats}>
          <Text style={styles.deliveries}>{picker.deliveries} Packages Delivered</Text>
          <View style={styles.rating}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Text 
                key={star} 
                style={[styles.star, star <= Math.floor(picker.rating) ? styles.filledStar : null]}
              >
                ★
              </Text>
            ))}
            <Text style={styles.ratingText}>{picker.rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
    backgroundColor: Colors.white,
  },
  infoContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  name: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.md,
    color: Colors.gray[800],
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  locationText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.xs,
    color: Colors.gray[600],
    marginLeft: spacing.xs,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deliveries: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.xs,
    color: Colors.gray[600],
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    fontSize: fontSizes.xs,
    color: Colors.gray[300],
  },
  filledStar: {
    color: Colors.warning.DEFAULT,
  },
  ratingText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.xs,
    color: Colors.gray[600],
    marginLeft: spacing.xs,
  },
});