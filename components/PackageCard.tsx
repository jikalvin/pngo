import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Colors from '@/constants/Colors';
import Layout, { spacing, fontSizes, borderRadius } from '@/constants/Layout';
import { StatusBadge } from './StatusBadge';
import { PickerAvatar } from './PickerAvatar';
import { MapPin, MoreHorizontal } from 'lucide-react-native';

interface PackageCardProps {
  title: string;
  location: string;
  date: string;
  pickerId: number;
  status: 'pending' | 'progress' | 'delivered' | 'delayed';
  imageUrl: string;
  onPress?: () => void;
}

export function PackageCard({ 
  title, 
  location, 
  date, 
  pickerId, 
  status, 
  imageUrl,
  onPress 
}: PackageCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        <View style={styles.pickerContainer}>
          <PickerAvatar pickerId={pickerId} size={36} />
        </View>
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <TouchableOpacity>
            <MoreHorizontal size={20} color={Colors.gray[600]} />
          </TouchableOpacity>
        </View>
        <View style={styles.locationContainer}>
          <MapPin size={14} color={Colors.gray[600]} />
          <Text style={styles.locationText} numberOfLines={1}>{location}</Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.dateText}>{date}</Text>
          <View style={styles.badgeContainer}>
            <StatusBadge status={status} size="small" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  imageContainer: {
    position: 'relative',
    height: 120,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  pickerContainer: {
    position: 'absolute',
    bottom: -18,
    right: spacing.md,
  },
  contentContainer: {
    padding: spacing.md,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.md,
    color: Colors.gray[800],
    flex: 1,
  },
  locationContainer: {
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  dateText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.xs,
    color: Colors.gray[500],
  },
  badgeContainer: {
    alignSelf: 'flex-end',
  },
});