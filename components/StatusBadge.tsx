import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import { spacing, fontSizes } from '@/constants/Layout';
import { useTranslation } from 'react-i18next'; // Added import

type StatusBadgeProps = {
  status: string;
};

const STATUS_COLORS: { [key: string]: { bg: string; text: string } } = {
  pending: {
    bg: Colors.warning[100],
    text: Colors.warning[700],
  },
  in_transit: { // Key for translation: statusBadge.in_transit
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
  open: { // Added for tasks
    bg: Colors.primary[100],
    text: Colors.primary[700],
  },
  assigned: { // Added for tasks
    bg: Colors.secondary[100], // Assuming Colors.secondary exists
    text: Colors.secondary[700], // Assuming Colors.secondary exists
  },
  // Add other statuses if they appear
};

// STATUS_LABELS object removed

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation(); // Initialized t

  // Normalize status key for translation and color lookup
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_');

  const colors = STATUS_COLORS[normalizedStatus] || STATUS_COLORS.pending; // Default to pending colors
  // Construct translation key, e.g., "statusBadge.in_transit"
  const label = t(`statusBadge.${normalizedStatus}`, { defaultValue: status });


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