import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '@/constants/Colors';
import Layout, { spacing, fontSizes, borderRadius } from '@/constants/Layout';
import { PickerAvatar } from './PickerAvatar';
import { MapPin } from 'lucide-react-native';

interface Picker {
  id: number;
  name: string;
  location: string;
  rating: number;
  deliveries: number;
  date: string;
  available: boolean;
}

interface PickerSelectItemProps {
  picker: Picker;
  isSelected: boolean;
  onSelect: (id: number) => void;
}

export function PickerSelectItem({ picker, isSelected, onSelect }: PickerSelectItemProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onSelect(picker.id)}
      activeOpacity={0.7}
    >
      <View style={styles.leftContainer}>
        <PickerAvatar pickerId={picker.id} size={50} />
        
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{picker.name}</Text>
          
          <View style={styles.location}>
            <MapPin size={12} color={Colors.gray[500]} />
            <Text style={styles.locationText}>{picker.location}</Text>
          </View>
          
          <View style={styles.stats}>
            <Text style={styles.deliveries}>{picker.deliveries} Packages Delivered</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.rightContainer}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{picker.date}</Text>
        </View>
        
        <View style={styles.ratingContainer}>
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
        
        <TouchableOpacity 
          style={[styles.requestButton, isSelected && styles.requestButtonActive]}
          onPress={() => onSelect(picker.id)}
        >
          <Text style={[styles.requestText, isSelected && styles.requestTextActive]}>
            {isSelected ? 'Selected' : 'Request'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
    backgroundColor: Colors.white,
  },
  leftContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  infoContainer: {
    marginLeft: spacing.md,
    flex: 1,
  },
  name: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.sm,
    color: Colors.gray[800],
    marginBottom: spacing.xs,
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
  },
  deliveries: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.xs,
    color: Colors.gray[600],
  },
  rightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  dateContainer: {
    marginBottom: spacing.xs,
  },
  dateText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.xs,
    color: Colors.gray[500],
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
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
  requestButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.primary.DEFAULT,
  },
  requestButtonActive: {
    backgroundColor: Colors.primary.DEFAULT,
    borderColor: Colors.primary.DEFAULT,
  },
  requestText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.xs,
    color: Colors.primary.DEFAULT,
  },
  requestTextActive: {
    color: Colors.white,
  },
});