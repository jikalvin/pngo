import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Bell, UserCircle, Settings, Shield, Palette, Calendar, History, Heart, LogOut } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Layout, { spacing, fontSizes, borderRadius } from '@/constants/Layout';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile, logout } from '@/store/authSlice';
import { AppDispatch, RootState } from '@/store/store';
import { router } from 'expo-router';

// Default profile image URI
const DEFAULT_PROFILE_IMAGE = 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg';

export default function ProfileScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isProfileLoading, profileError } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Fetch profile if user data is not present or partially loaded, or on screen focus if needed
    // loadTokenFromStorage already attempts to load profile, this can be a fallback/refresh
    if (!user?.fullName) { // Example condition: fetch if fullName is missing
      dispatch(fetchUserProfile());
    }
  }, [dispatch, user]);

  const handleRefresh = () => {
    dispatch(fetchUserProfile());
  };

  const handleLogout = () => {
    dispatch(logout());
    // After logout, you might want to navigate the user to the sign-in screen
    // Expo Router v3 should automatically handle this via the RootLayoutNav logic
    // if not, explicitly navigate:
    // router.replace('/onboarding/sign-in');
  };

  if (isProfileLoading && !user) { // Show full screen loader only on initial load
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={['top', 'left', 'right']}>
        <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
      </SafeAreaView>
    );
  }

  if (profileError && !user) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={['top', 'left', 'right']}>
        <Text style={styles.errorText}>Error loading profile: {profileError}</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const displayName = user?.fullName || user?.email || 'User';
  const displayDescription = user?.bio || (user?.userType ? `Role: ${user.userType}` : 'Welcome to PiknGo!');
  const profileImageUrl = user?.photoUrl || DEFAULT_PROFILE_IMAGE;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Animated.Text 
          entering={FadeIn.duration(800)}
          style={styles.title}
        >
          Profile
        </Animated.Text>
        <TouchableOpacity>
          <Bell color={Colors.primary.DEFAULT} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isProfileLoading} onRefresh={handleRefresh} colors={[Colors.primary.DEFAULT]} />
        }
      >
        <Animated.View
          entering={FadeInDown.duration(600).delay(300)}
          style={styles.profileHeader}
        >
          <Image
            source={{ uri: profileImageUrl }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.description}>{displayDescription}</Text>
            {user?.email && <Text style={styles.emailText}>{user.email}</Text>}
            {user?.phoneNumber && <Text style={styles.phoneText}>{user.phoneNumber}</Text>}
          </View>
        </Animated.View>

        <View style={styles.menuContainer}>
          <MenuItem 
            icon={<UserCircle size={24} color={Colors.primary.DEFAULT} />} 
            title="Personal Details" 
            description={user?.location?.address || "Update your personal info"}
            delay={400}
            onPress={() => router.push('/profile/edit')}
          />
          
          <MenuItem 
            icon={<Settings size={24} color={Colors.primary.DEFAULT} />} 
            title="Account Settings" 
            description="Password, payment and security"
            delay={500}
            onPress={() => router.push('/(profile)/account-settings')}
          />
          
          <MenuItem 
            icon={<Shield size={24} color={Colors.primary.DEFAULT} />} 
            title="KYC & Verification" 
            description={user?.isVerified ? "Status: Verified" : "Status: Not Verified"}
            delay={600}
            onPress={() => router.push('/(profile)/kyc')}
          />
          
          <MenuItem 
            icon={<Palette size={24} color={Colors.primary.DEFAULT} />} 
            title="App Preferences" 
            description="Language and Theme"
            delay={700}
          />
          
          {user?.userType === 'picker' && ( // Conditional item for pickers
            <MenuItem
              icon={<Calendar size={24} color={Colors.primary.DEFAULT} />}
              title="Availability"
              description="Schedule, Unavailable"
              delay={800}
            />
          )}
          
          <MenuItem 
            icon={<History size={24} color={Colors.primary.DEFAULT} />} 
            title="Delivery History" 
            description="View completed, ongoing, and cancelled tasks"
            delay={900}
          />
          
          <MenuItem 
            icon={<Heart size={24} color={Colors.primary.DEFAULT} />} 
            title="Favourites" 
            description="Favorite Pickers for quick access"
            delay={1000}
          />
           <MenuItem
            icon={<LogOut size={24} color={Colors.danger.DEFAULT} />}
            title="Logout"
            description="Sign out of your account"
            delay={1100}
            onPress={handleLogout}
            titleColor={Colors.danger.DEFAULT}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
  onPress?: () => void;
  titleColor?: string;
}

function MenuItem({ icon, title, description, delay = 0, onPress, titleColor }: MenuItemProps) {
  return (
    <Animated.View
      entering={FadeInDown.duration(600).delay(delay)}
    >
      <TouchableOpacity style={styles.menuItem} onPress={onPress} disabled={!onPress}>
        <View style={styles.menuIconContainer}>
          {icon}
        </View>
        <View style={styles.menuTextContainer}>
          <Text style={[styles.menuTitle, titleColor ? { color: titleColor } : {}]}>{title}</Text>
          <Text style={styles.menuDescription}>{description}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.xl,
    color: Colors.primary.DEFAULT,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: Colors.white,
    margin: spacing.lg,
    borderRadius: borderRadius.lg,
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.lg,
    color: Colors.gray[800],
    marginBottom: spacing.xs,
  },
  description: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.sm,
    color: Colors.gray[600],
    marginBottom: spacing.xs / 2,
  },
  emailText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.sm,
    color: Colors.gray[500],
  },
  phoneText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.sm,
    color: Colors.gray[500],
    marginTop: spacing.xs / 2,
  },
  menuContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  menuIconContainer: {
    marginRight: spacing.md,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.md,
    color: Colors.primary.DEFAULT,
    marginBottom: spacing.xs,
  },
  menuDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.sm,
    color: Colors.gray[600],
  },
});