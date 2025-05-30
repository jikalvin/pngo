import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import { spacing, fontSizes } from '@/constants/Layout';

type StatusBadgeProps = {
  status: string;
};

const STATUS_COLORS: { [key: string]: { bg: string; text: string } } = {
  pending: {
    bg: Colors.warning[100],
    text: Colors.warning[700],
  },
  in_transit: {
    bg: Colors.info[100],
    text: Colors.info[700],
  },
  delivered: {
    bg: Colors.success[100],
    text: Colors.success[700],
  },
  cancelled: {
    bg: Colors.error[100],
    text: Colors.error[700],
  },
};

const STATUS_LABELS: { [key: string]: string } = {
  pending: 'Pending',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.pending;
  const label = STATUS_LABELS[status] || status;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  text: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.xs,
  },
});