import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Bell, UserCircle, Settings, Shield, Palette, Calendar, History, Heart, DollarSign } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Layout, { spacing, fontSizes, borderRadius } from '@/constants/Layout';
import { useAuth } from '@/context/AuthContext'; // Or Redux
import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { router } from 'expo-router';


export default function ProfileScreen() {
  const { user, login: updateUserInContext } = useAuth(); // Assuming login can also update user in context
  const [isAvailable, setIsAvailable] = useState(user?.availability || false);
  const [isToggleLoading, setIsToggleLoading] = useState(false);

  useEffect(() => {
    // Initialize availability from user context if it changes (e.g. after re-fetch)
    if (user) {
        setIsAvailable(user.availability || false);
    }
  }, [user?.availability]);

  const handleAvailabilityToggle = async (newValue: boolean) => {
    if (!user || user.role !== 'driver') return;
    
    setIsToggleLoading(true);
    setIsAvailable(newValue); // Optimistic update for UI responsiveness

    try {
      await api.put('/pickers/availability', { availability: newValue });
      // Successfully updated on backend
      // Optionally, update user data in global context if it's not automatically refreshed
      if (updateUserInContext) { // Check if updateUserInContext exists
        const updatedUser = { ...user, availability: newValue };
        // This depends on how your AuthContext's login/update function works.
        // It might expect a full user object or just the updated fields.
        // For simplicity, if you have a dedicated updateUser function, use that.
        // Or, if login also serves as update:
        // await updateUserInContext(updatedUser, await AuthStorage.getToken()); // This is a common pattern
        // For now, just log success. User object should be refreshed on next app load or profile fetch.
         console.log("Availability updated successfully on backend.");
         // If your AuthContext doesn't have a direct way to update `user` partially,
         // you might need to add one, or rely on a full user re-fetch elsewhere.
         // A simple way for local context update if `setUser` is exposed:
         // setUser({ ...user, availability: newValue });
      }
       Alert.alert("Availability Updated", `You are now ${newValue ? 'available' : 'unavailable'} for deliveries.`);

    } catch (error) {
      console.error("Failed to update availability:", error);
      Alert.alert("Update Failed", "Could not update your availability. Please try again.");
      setIsAvailable(!newValue); // Revert optimistic update on error
    } finally {
      setIsToggleLoading(false);
    }
  };

  // Placeholder for user data - replace with actual data from auth context or API
  const profileUser = user || {
    name: 'Guest User',
    description: 'Please log in',
    profileImage: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg', // Default image
  };


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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View
          entering={FadeInDown.duration(600).delay(300)}
          style={styles.profileHeader}
        >
          <Image
            source={{ uri: profileUser.profileImage || 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg' }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{profileUser.name || user?.username}</Text>
            <Text style={styles.description}>{profileUser.description || (user?.role ? `Role: ${user.role}` : '')}</Text>
          </View>
        </Animated.View>

        <View style={styles.menuContainer}>
          <MenuItem 
            icon={<UserCircle size={24} color={Colors.primary.DEFAULT} />} 
            title="Personal Details" 
            description="Name, phone number, address, email"
            delay={400}
            onPress={() => router.push('/profile/edit-details')} // Example navigation
          />
          
          <MenuItem 
            icon={<Settings size={24} color={Colors.primary.DEFAULT} />} 
            title="Account Settings" 
            description="Password, payment and security"
            delay={500}
            onPress={() => router.push('/profile/account-settings')}
          />
          
          {user?.role === 'driver' && (
            <>
              <MenuItem 
                icon={<Calendar size={24} color={Colors.primary.DEFAULT} />} 
                title="Availability" 
                description={isAvailable ? "You are currently available" : "You are currently unavailable"}
                delay={800}
                isToggle={true}
                toggleValue={isAvailable}
                onToggle={handleAvailabilityToggle}
                toggleDisabled={isToggleLoading}
              />
              <MenuItem 
                icon={<DollarSign size={24} color={Colors.primary.DEFAULT} />} 
                title="My Earnings" 
                description="View your earnings history"
                delay={850}
                onPress={() => router.push('/picker/earnings')} // Navigate to earnings screen
              />
               <MenuItem 
                icon={<History size={24} color={Colors.primary.DEFAULT} />} 
                title="My Active Deliveries" 
                description="View and manage your current deliveries"
                delay={900}
                onPress={() => router.push('/(tabs)/my-deliveries')} // Navigate to active deliveries
              />
            </>
          )}
          
          {/* Common menu items */}
          <MenuItem 
            icon={<History size={24} color={Colors.primary.DEFAULT} />} 
            title="Order History" // Or Package History for senders
            description="View your past packages/orders"
            delay={950}
            onPress={() => router.push('/history')}
          />
           <MenuItem 
            icon={<Shield size={24} color={Colors.primary.DEFAULT} />} 
            title="KYC & Verification" 
            description="Verification Status: Verified" // This should be dynamic
            delay={600}
            onPress={() => router.push('/profile/kyc')}
          />
          <MenuItem 
            icon={<Palette size={24} color={Colors.primary.DEFAULT} />} 
            title="App Preferences" 
            description="Language and Theme"
            delay={700}
            onPress={() => router.push('/profile/preferences')}
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
  isToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  toggleDisabled?: boolean;
}

function MenuItem({ 
  icon, title, description, delay = 0, onPress, 
  isToggle = false, toggleValue = false, onToggle, toggleDisabled = false 
}: MenuItemProps) {
  return (
    <Animated.View
      entering={FadeInDown.duration(600).delay(delay)}
    >
      <TouchableOpacity style={styles.menuItem} onPress={onPress} disabled={isToggle || !onPress}>
        <View style={styles.menuIconContainer}>
          {icon}
        </View>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>{title}</Text>
          <Text style={styles.menuDescription}>{description}</Text>
        </View>
        {isToggle && onToggle && (
          <Switch
            trackColor={{ false: Colors.gray[300], true: Colors.primary[200] }}
            thumbColor={toggleValue ? Colors.primary.DEFAULT : Colors.gray[500]}
            ios_backgroundColor={Colors.gray[300]}
            onValueChange={onToggle}
            value={toggleValue}
            disabled={toggleDisabled}
          />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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