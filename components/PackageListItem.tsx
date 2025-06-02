import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import { spacing, fontSizes, borderRadius } from '@/constants/Layout';
import { Package as PackageIcon, MapPin, DollarSign } from 'lucide-react-native'; // Assuming you have lucide-react-native

// Define the expected structure of a package object from the API
// Based on Package schema: name, description, pickupAddress, deliveryAddress, price, status, owner
// And what getAvailablePackages populates: owner: { username, name }
export interface PackageItemProps {
  id: string;
  name: string;
  description?: string;
  pickupAddress: string;
  deliveryAddress: string;
  price?: number;
  status: 'pending' | 'accepted' | 'cancelled' | 'completed' | 'failed_delivery';
  owner?: {
    username: string;
    name?: string; // if available
  };
  // Add any other relevant fields you might need from the API response
}

interface Props {
  item: PackageItemProps;
}

const PackageListItem: React.FC<Props> = ({ item }) => {
  const handlePress = () => {
    router.push(`/package/${item.id}`);
  };

  return (
    <Pressable 
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={handlePress}
    >
      <View style={styles.iconContainer}>
        <PackageIcon size={24} color={Colors.primary.DEFAULT} />
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.name}>{item.name}</Text>
        {item.description && <Text style={styles.description} numberOfLines={2}>{item.description}</Text>}
        
        <View style={styles.addressContainer}>
          <MapPin size={14} color={Colors.gray[600]} style={styles.addressIcon} />
          <Text style={styles.addressText}>From: {item.pickupAddress}</Text>
        </View>
        <View style={styles.addressContainer}>
          <MapPin size={14} color={Colors.gray[600]} style={styles.addressIcon} />
          <Text style={styles.addressText}>To: {item.deliveryAddress}</Text>
        </View>

        {item.owner?.username && (
          <Text style={styles.ownerText}>Sender: {item.owner.name || item.owner.username}</Text>
        )}
      </View>
      {item.price !== undefined && item.price > 0 && (
        <View style={styles.priceContainer}>
          <DollarSign size={16} color={Colors.success.DEFAULT} />
          <Text style={styles.priceText}>{item.price.toFixed(2)}</Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  iconContainer: {
    marginRight: spacing.md,
    padding: spacing.sm,
    backgroundColor: Colors.primary[50],
    borderRadius: borderRadius.lg,
  },
  detailsContainer: {
    flex: 1,
  },
  name: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.md,
    color: Colors.gray[800],
    marginBottom: spacing.xs,
  },
  description: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.sm,
    color: Colors.gray[600],
    marginBottom: spacing.sm,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs / 2,
  },
  addressIcon: {
    marginRight: spacing.xs,
  },
  addressText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.sm,
    color: Colors.gray[700],
  },
  ownerText: {
    fontFamily: 'Poppins-Italic',
    fontSize: fontSizes.xs,
    color: Colors.gray[500],
    marginTop: spacing.xs,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.sm,
    marginLeft: spacing.sm,
    borderLeftWidth: 1,
    borderLeftColor: Colors.gray[200],
  },
  priceText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSizes.md,
    color: Colors.success.DEFAULT,
    marginLeft: spacing.xs,
  },
});

export default PackageListItem;
