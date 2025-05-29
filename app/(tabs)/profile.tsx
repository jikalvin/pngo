import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Bell, UserCircle, Settings, Shield, Palette, Calendar, History, Heart } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Layout, { spacing, fontSizes, borderRadius } from '@/constants/Layout';

export default function ProfileScreen() {
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
            source={{ uri: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg' }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>Marcel Wankbuba</Text>
            <Text style={styles.description}>Delivering smiles, one package at a time</Text>
          </View>
        </Animated.View>

        <View style={styles.menuContainer}>
          <MenuItem 
            icon={<UserCircle size={24} color={Colors.primary.DEFAULT} />} 
            title="Personal Details" 
            description="Name, phone number, address, email"
            delay={400}
          />
          
          <MenuItem 
            icon={<Settings size={24} color={Colors.primary.DEFAULT} />} 
            title="Account Settings" 
            description="Password, payment and security"
            delay={500}
          />
          
          <MenuItem 
            icon={<Shield size={24} color={Colors.primary.DEFAULT} />} 
            title="KYC & Verification" 
            description="Verification Status: Verified"
            delay={600}
          />
          
          <MenuItem 
            icon={<Palette size={24} color={Colors.primary.DEFAULT} />} 
            title="App Preferences" 
            description="Language and Theme"
            delay={700}
          />
          
          <MenuItem 
            icon={<Calendar size={24} color={Colors.primary.DEFAULT} />} 
            title="Availability" 
            description="Schedule, Unavailable"
            delay={800}
          />
          
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
}

function MenuItem({ icon, title, description, delay = 0 }: MenuItemProps) {
  return (
    <Animated.View
      entering={FadeInDown.duration(600).delay(delay)}
    >
      <TouchableOpacity style={styles.menuItem}>
        <View style={styles.menuIconContainer}>
          {icon}
        </View>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>{title}</Text>
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