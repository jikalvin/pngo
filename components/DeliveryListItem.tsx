import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import { spacing, fontSizes, borderRadius } from '@/constants/Layout';
import { Package, MapPin, Edit3, CheckCircle, XCircle, Truck } from 'lucide-react-native';
import StatusBadge from './StatusBadge'; // Assuming StatusBadge can handle delivery statuses
import api from '@/utils/api'; // For status updates

// Define the expected structure of a delivery object from the API
// Based on Delivery schema & getActiveDeliveries population
export interface DeliveryItemData {
  _id: string; // Delivery ID
  package_id: {
    _id: string;
    name: string;
    pickupAddress: string;
    deliveryAddress: string;
    price?: number;
    owner?: {
      username: string;
      name?: string;
    };
  };
  status: 'pending' | 'assigned' | 'in-transit' | 'delivered' | 'failed';
  pickup_location: string; // This should be same as package_id.pickupAddress
  dropoff_location: string; // This should be same as package_id.deliveryAddress
  // Add other fields like pickup_time, delivery_time if available/needed
}

interface Props {
  item: DeliveryItemData;
  onUpdateStatus: (deliveryId: string, newStatus: DeliveryItemData['status']) => Promise<void>; // Callback to refresh list or update state
  isActionLoading: boolean; // To disable buttons during an action on this item
  setTargetedDeliveryId: (id: string | null) => void; // To indicate which item is loading
}

const DeliveryListItem: React.FC<Props> = ({ item, onUpdateStatus, isActionLoading, setTargetedDeliveryId }) => {
  
  const handleUpdateStatus = async (newStatus: DeliveryItemData['status']) => {
    if (item.status === 'delivered' || item.status === 'failed') {
      Alert.alert("Update Not Allowed", `This delivery is already ${item.status}.`);
      return;
    }
    setTargetedDeliveryId(item._id); // Indicate this item is being updated
    await onUpdateStatus(item._id, newStatus);
    setTargetedDeliveryId(null); // Clear indicator
  };

  const canBePickedUp = item.status === 'assigned';
  const canBeDelivered = item.status === 'in-transit';
  const canBeFailed = item.status === 'assigned' || item.status === 'in-transit';

  return (
    <Pressable 
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={() => router.push(`/package/${item.package_id._id}`)} // Navigate to package details
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Truck size={24} color={Colors.primary.DEFAULT} />
        </View>
        <View style={styles.headerTextContainer}>
            <Text style={styles.packageName} numberOfLines={1}>{item.package_id.name}</Text>
            <Text style={styles.packageOwner} numberOfLines={1}>
                Sender: {item.package_id.owner?.name || item.package_id.owner?.username || 'N/A'}
            </Text>
        </View>
        <StatusBadge status={item.status} />
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.addressRow}>
          <MapPin size={16} color={Colors.gray[600]} style={styles.addressIcon} />
          <Text style={styles.addressLabel}>From:</Text>
          <Text style={styles.addressText} numberOfLines={1}>{item.pickup_location}</Text>
        </View>
        <View style={styles.addressRow}>
          <MapPin size={16} color={Colors.gray[600]} style={styles.addressIcon} />
          <Text style={styles.addressLabel}>To:</Text>
          <Text style={styles.addressText} numberOfLines={1}>{item.dropoff_location}</Text>
        </View>
        {item.package_id.price && (
            <View style={styles.addressRow}>
                <Text style={styles.priceLabel}>Earnings:</Text>
                <Text style={styles.priceText}>${item.package_id.price.toFixed(2)}</Text>
            </View>
        )}
      </View>

      { (item.status === 'assigned' || item.status === 'in-transit') &&
        <View style={styles.actionsContainer}>
            {canBePickedUp && (
            <Pressable 
                style={[styles.actionButton, styles.pickedUpButton, isActionLoading && styles.disabledButton]} 
                onPress={() => handleUpdateStatus('in-transit')}
                disabled={isActionLoading}
            >
                <Truck size={16} color={Colors.white} />
                <Text style={styles.actionButtonText}>Picked Up (In Transit)</Text>
            </Pressable>
            )}
            {canBeDelivered && (
            <Pressable 
                style={[styles.actionButton, styles.deliveredButton, isActionLoading && styles.disabledButton]} 
                onPress={() => handleUpdateStatus('delivered')}
                disabled={isActionLoading}
            >
                <CheckCircle size={16} color={Colors.white} />
                <Text style={styles.actionButtonText}>Delivered</Text>
            </Pressable>
            )}
            {canBeFailed && (
                 <Pressable 
                    style={[styles.actionButton, styles.failedButton, isActionLoading && styles.disabledButton]} 
                    onPress={() => handleUpdateStatus('failed')}
                    disabled={isActionLoading}
                >
                    <XCircle size={16} color={Colors.white} />
                    <Text style={styles.actionButtonText}>Failed</Text>
                </Pressable>
            )}
        </View>
      }
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    marginRight: spacing.sm,
    padding: spacing.xs,
    backgroundColor: Colors.primary[50],
    borderRadius: borderRadius.sm,
  },
  headerTextContainer: {
    flex: 1,
  },
  packageName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.md,
    color: Colors.gray[800],
  },
  packageOwner: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.xs,
    color: Colors.gray[500],
  },
  detailsContainer: {
    marginBottom: spacing.md,
    paddingLeft: spacing.sm, // Indent details slightly
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  addressIcon: {
    marginRight: spacing.xs,
  },
  addressLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.sm,
    color: Colors.gray[700],
    marginRight: spacing.xs,
  },
  addressText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.sm,
    color: Colors.gray[600],
    flex: 1,
  },
  priceLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.sm,
    color: Colors.gray[700],
    marginRight: spacing.xs,
  },
  priceText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.sm,
    color: Colors.success.DEFAULT,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Or 'flex-end', or add specific styling
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    elevation: 1, // For Android shadow
  },
  actionButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.xs,
    color: Colors.white,
    marginLeft: spacing.xs,
  },
  pickedUpButton: {
    backgroundColor: Colors.info.DEFAULT, // Example: Blue for in-transit
  },
  deliveredButton: {
    backgroundColor: Colors.success.DEFAULT, // Green for delivered
  },
  failedButton: {
    backgroundColor: Colors.danger.DEFAULT, // Red for failed
  },
  disabledButton: {
    opacity: 0.6,
  }
});

export default DeliveryListItem;
