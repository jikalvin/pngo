import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserById, resetSelectedUser } from '@/store/userSlice';
import type { AppDispatch, RootState } from '@/store/store';
import type { User } from '@/store/authSlice'; // Re-use User interface
import Colors from '@/constants/Colors';
import Layout, { spacing, fontSizes, borderRadius } from '@/constants/Layout';
import { ChevronLeft, Star, MapPin, LanguagesIcon, Briefcase, MessageSquare } from 'lucide-react-native'; // Example icons
import { useTranslation } from 'react-i18next';

const DEFAULT_PICKER_IMAGE = 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg'; // Generic placeholder

export default function PickerProfileScreen() {
  const { t } = useTranslation();
  const { id: userId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { selectedUser, isLoading, error } = useSelector((state: RootState) => state.users);

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserById(userId));
    }
    return () => {
      dispatch(resetSelectedUser());
    };
  }, [dispatch, userId]);

  const handleRetry = () => {
    if (userId) {
      dispatch(fetchUserById(userId));
    }
  };

  if (isLoading || (!selectedUser && !error)) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={['top']}>
        <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={['top']}>
        <Text style={styles.errorText}>{t('userProfile.errors.loadFailed', { error })}</Text>
        <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!selectedUser) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={['top']}>
        <Text style={styles.errorText}>{t('userProfile.errors.notFound')}</Text>
      </SafeAreaView>
    );
  }

  const { fullName, photoUrl, bio, location, languages, userType } = selectedUser as User; // Type assertion

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.primary.DEFAULT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{fullName || t('userProfile.title')}</Text>
        <View style={{width: 24}} /> {/* Placeholder for right side icon if any */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <Image source={{ uri: photoUrl || DEFAULT_PICKER_IMAGE }} style={styles.profileImage} />
          <Text style={styles.profileName}>{fullName}</Text>
          <Text style={styles.profileRole}>{userType === 'picker' ? t('userType.picker') : t('userType.user')}</Text>
          {/* Placeholder for Rating */}
          <View style={styles.ratingContainer}>
            <Star size={18} color={Colors.yellow} fill={Colors.yellow} />
            <Text style={styles.ratingText}>4.5 (120 reviews)</Text>
          </View>
        </View>

        {bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('userProfile.bio')}</Text>
            <Text style={styles.sectionContent}>{bio}</Text>
          </View>
        )}

        {location?.address && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('userProfile.location')}</Text>
            <View style={styles.infoItem}>
              <MapPin size={18} color={Colors.gray[600]} />
              <Text style={styles.infoText}>{`${location.address}, ${location.city}`}</Text>
            </View>
          </View>
        )}

        {languages && languages.length > 0 && (
           <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('userProfile.languages')}</Text>
            <View style={styles.infoItem}>
                <LanguagesIcon size={18} color={Colors.gray[600]} />
                <Text style={styles.infoText}>{languages.join(', ')}</Text>
            </View>
          </View>
        )}

        {/* Placeholder for Skills/Specialties - if applicable for pickers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('userProfile.skills')}</Text>
          <View style={styles.infoItem}>
            <Briefcase size={18} color={Colors.gray[600]} />
            <Text style={styles.infoText}>Parcel Delivery, Document Transport</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.contactButton}>
            <MessageSquare size={20} color={Colors.white} />
            <Text style={styles.contactButtonText}>{t('userProfile.contact')} {fullName?.split(' ')[0]}</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.lg,
    color: Colors.primary.DEFAULT,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
    marginBottom: spacing.md,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: Colors.primary.DEFAULT,
  },
  profileName: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSizes.xl,
    color: Colors.gray[800],
    marginBottom: spacing.xs,
  },
  profileRole: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.sm,
    color: Colors.gray[600],
    marginBottom: spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
  },
  ratingText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.xs,
    color: Colors.primary.DEFAULT,
    marginLeft: spacing.xs,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: Colors.white,
    marginBottom: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.gray[100],
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.md,
    color: Colors.gray[700],
    marginBottom: spacing.sm,
  },
  sectionContent: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.sm,
    color: Colors.gray[600],
    lineHeight: fontSizes.sm * 1.5,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  infoText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.sm,
    color: Colors.gray[700],
    marginLeft: spacing.sm,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary.DEFAULT,
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  contactButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.md,
    color: Colors.white,
  },
  errorText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.md,
    color: Colors.danger.DEFAULT,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryButton: {
    backgroundColor: Colors.primary.DEFAULT,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.md,
    color: Colors.white,
  },
});
