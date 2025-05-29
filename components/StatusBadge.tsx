import { View, Text, StyleSheet } from 'react-native';
import Colors, { StatusColors } from '@/constants/Colors';
import { spacing, fontSizes, borderRadius } from '@/constants/Layout';

type StatusType = 'available' | 'unavailable' | 'pending' | 'completed' | 'ongoing' | 'upcoming' | 'delivered' | 'delayed' | 'progress';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'small' | 'medium' | 'large';
}

export function StatusBadge({ status, size = 'medium' }: StatusBadgeProps) {
  const getStatusColor = () => {
    return StatusColors[status] || Colors.gray[400];
  };

  const getStatusText = () => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'unavailable':
        return 'Unavailable';
      case 'pending':
        return 'Pending';
      case 'completed':
        return 'Completed';
      case 'ongoing':
        return 'Ongoing';
      case 'upcoming':
        return 'Upcoming';
      case 'delivered':
        return 'Delivered';
      case 'delayed':
        return 'Delayed';
      case 'progress':
        return 'In Progress';
      default:
        return 'Unknown';
    }
  };

  const sizeStyles = {
    small: {
      paddingVertical: spacing.xs / 2,
      paddingHorizontal: spacing.sm,
      fontSize: fontSizes.xs - 2,
    },
    medium: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      fontSize: fontSizes.xs,
    },
    large: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      fontSize: fontSizes.sm,
    },
  };

  return (
    <View style={[styles.container, { backgroundColor: getStatusColor() }]}>
      <Text style={[
        styles.text, 
        { fontSize: sizeStyles[size].fontSize },
        { paddingVertical: sizeStyles[size].paddingVertical, paddingHorizontal: sizeStyles[size].paddingHorizontal },
      ]}>
        {getStatusText()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.full,
  },
  text: {
    fontFamily: 'Poppins-Medium',
    color: Colors.white,
    textAlign: 'center',
  },
});