import { View, Text, StyleSheet, Pressable } from 'react-native';
import Colors from '@/constants/Colors';
import { spacing, fontSizes } from '@/constants/Layout';
import { Package, MapPin } from 'lucide-react-native';
import StatusBadge from './StatusBadge';
import { useTranslation } from 'react-i18next'; // Added import

type PackageCardProps = {
  package: {
    id: string;
    title: string;
    status: string;
    from: string;
    to: string;
    created: string;
  };
  onPress: () => void;
};

export default function PackageCard({ package: pkg, onPress }: PackageCardProps) {
  const { t } = useTranslation(); // Initialized t

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
        <Text style={styles.title}>{pkg.title}</Text>
        <StatusBadge status={pkg.status} />
      </View>

      <View style={styles.details}>
        <View style={styles.locationRow}>
          <MapPin size={16} color={Colors.gray[500]} />
          <Text style={styles.locationText} numberOfLines={1}>
            {t('packageCard.fromPrefix')}{pkg.from}
          </Text>
        </View>
        <View style={styles.locationRow}>
          <MapPin size={16} color={Colors.gray[500]} />
          <Text style={styles.locationText} numberOfLines={1}>
            {t('packageCard.toPrefix')}{pkg.to}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.date}>
          {t('packageCard.createdPrefix')}{new Date(pkg.created).toLocaleDateString()}
        </Text>
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
    marginLeft: spacing.xs,
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