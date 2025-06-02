import { View, Text, StyleSheet, Pressable } from 'react-native';
import Colors from '@/constants/Colors';
import { spacing, fontSizes } from '@/constants/Layout';
import { Package, MapPin } from 'lucide-react-native';
import StatusBadge from './StatusBadge'; // Assuming StatusBadge can handle the new status enums
import { PackageItemProps } from './PackageListItem'; // Reuse the interface

interface Props { // Renamed from PackageCardProps for consistency
  item: PackageItemProps; // Changed prop name from 'package' to 'item' and type to PackageItemProps
  onPress: () => void;
}

export default function PackageCard({ item: pkg, onPress }: Props) { // item destructured as pkg
  return (
    <Pressable 
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed
      ]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Package size={24} color={Colors.primary.DEFAULT} />
        </View>
        <Text style={styles.title} numberOfLines={1}>{pkg.name}</Text> {/* Use name instead of title */}
        <StatusBadge status={pkg.status} />
      </View>

      <View style={styles.details}>
        <View style={styles.locationRow}>
          <MapPin size={16} color={Colors.gray[500]} style={styles.locationIcon}/>
          <Text style={styles.locationText} numberOfLines={1}>
            From: {pkg.pickupAddress} {/* Use pickupAddress */}
          </Text>
        </View>
        <View style={styles.locationRow}>
          <MapPin size={16} color={Colors.gray[500]} style={styles.locationIcon}/>
          <Text style={styles.locationText} numberOfLines={1}>
            To: {pkg.deliveryAddress} {/* Use deliveryAddress */}
          </Text>
        </View>
      </View>

      {pkg.price !== undefined && pkg.price > 0 && (
        <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Offer:</Text>
            <Text style={styles.priceText}>${pkg.price.toFixed(2)}</Text>
        </View>
      )}

      {/* Assuming 'createdAt' field exists, if not, this part or 'pkg.createdAt' needs adjustment */}
      {/* <View style={styles.footer}>
        <Text style={styles.date}>
          Created: {pkg.createdAt ? new Date(pkg.createdAt).toLocaleDateString() : 'N/A'}
        </Text>
      </View> */}
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
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  title: {
    flex: 1,
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.md,
    color: Colors.gray[800],
    marginLeft: spacing.sm, // Add some space if icon is not in its own container always
  },
  locationIcon: {
    marginRight: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
  },
  priceLabel:{
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.sm,
    color: Colors.gray[600],
    marginRight: spacing.xs,
  },
  priceText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.sm,
    color: Colors.success.DEFAULT,
  },
  details: {
    marginBottom: spacing.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  locationText: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.sm,
    color: Colors.gray[600],
    // marginLeft: spacing.xs, // Icon has its own margin now
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    paddingTop: spacing.sm,
  },
  date: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.xs,
    color: Colors.gray[500],
  },
});