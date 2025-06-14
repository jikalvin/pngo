import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { updateUserProfile } from '@/store/authSlice';
import Colors from '@/constants/Colors';
import Layout, { spacing, fontSizes, borderRadius } from '@/constants/Layout';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';

const DEFAULT_PROFILE_IMAGE = 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg'; // Placeholder

export default function ProfileEditScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isProfileUpdating, profileUpdateError } = useSelector((state: RootState) => state.auth);

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [email, setEmail] = useState(user?.email || ''); // Usually not editable
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [photo, setPhoto] = useState<{ uri: string; name: string; type: string } | null>(null); // For new photo to upload
  const [photoPreview, setPhotoPreview] = useState(user?.photoUrl || DEFAULT_PROFILE_IMAGE);


  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setBio(user.bio || '');
      setEmail(user.email || '');
      setPhoneNumber(user.phoneNumber || '');
      setPhotoPreview(user.photoUrl || DEFAULT_PROFILE_IMAGE);
    }
  }, [user]);

  const handleChoosePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('profile.errors.permissionRequired'), t('profile.errors.mediaPermission'));
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7, // Compress image slightly
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setPhotoPreview(asset.uri); // Show local preview
      // Prepare photo object for FormData
      const fileName = asset.uri.split('/').pop() || 'photo.jpg';
      const fileType = asset.mimeType || (fileName.endsWith('.png') ? 'image/png' : 'image/jpeg');
      setPhoto({ uri: asset.uri, name: fileName, type: fileType });
    }
  };

  const handleSubmit = async () => {
    if (isProfileUpdating) return;

    const profileData: any = { // Use 'any' for FormData flexibility or define a more specific type
      fullName,
      bio,
      phoneNumber, // Assuming phone number can be updated
    };

    // If a new photo was selected, add it to profileData for the thunk
    if (photo) {
      profileData.photo = photo;
    }

    // console.log('Submitting profile data:', profileData);
    const resultAction = await dispatch(updateUserProfile(profileData));

    if (updateUserProfile.fulfilled.match(resultAction)) {
      Alert.alert(t('profile.updateSuccessTitle'), t('profile.updateSuccessMessage'));
      router.back();
    } else if (updateUserProfile.rejected.match(resultAction)) {
      Alert.alert(
        t('profile.errors.updateFailedTitle'),
        (resultAction.payload as string) || t('profile.errors.updateFailedMessage')
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} disabled={isProfileUpdating}>
          <Text style={styles.cancelButton}>{t('common.cancel')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('profile.editProfileTitle')}</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={isProfileUpdating}>
          {isProfileUpdating ? (
            <ActivityIndicator size="small" color={Colors.primary.DEFAULT} />
          ) : (
            <Text style={styles.saveButton}>{t('common.save')}</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.photoSection}>
          <Image source={{ uri: photoPreview }} style={styles.profileImage} />
          <TouchableOpacity onPress={handleChoosePhoto} style={styles.photoButton} disabled={isProfileUpdating}>
            <Text style={styles.photoButtonText}>{t('profile.changePhoto')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('common.fullName')}</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder={t('auth.enterFullName')}
            editable={!isProfileUpdating}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('common.email')}</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={email}
            editable={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('common.phoneNumber')}</Text>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder={t('auth.enterPhoneNumber')}
            keyboardType="phone-pad"
            editable={!isProfileUpdating}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('profile.bio')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder={t('profile.enterBio')}
            multiline
            numberOfLines={4}
            editable={!isProfileUpdating}
          />
        </View>

        {profileUpdateError && <Text style={styles.errorText}>{profileUpdateError}</Text>}
        {isProfileUpdating && <View style={styles.formOverlay}><ActivityIndicator size="large" color={Colors.primary.DEFAULT} /></View>}

      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  formOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Ensure overlay is on top
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.lg,
    color: Colors.primary.DEFAULT,
  },
  cancelButton: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.md,
    color: Colors.gray[600],
  },
  saveButton: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.md,
    color: Colors.primary.DEFAULT,
  },
  formContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: spacing.md,
    backgroundColor: Colors.gray[200],
  },
  photoButton: {
    backgroundColor: Colors.primary.DEFAULT,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  photoButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.sm,
    color: Colors.white,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.sm,
    color: Colors.gray[700],
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.md,
    color: Colors.gray[800],
    borderWidth: 1,
    borderColor: Colors.gray[300],
  },
  disabledInput: {
    backgroundColor: Colors.gray[100],
    color: Colors.gray[500],
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  loadingIndicator: {
    marginTop: spacing.lg,
  },
  errorText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.sm,
    color: Colors.danger.DEFAULT,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
