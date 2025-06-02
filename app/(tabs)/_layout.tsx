import { Tabs, Redirect } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import Colors from '@/constants/Colors';
import { spacing, fontSizes } from '@/constants/Layout';
import { Package, Users, User, Home, Search } from 'lucide-react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export default function TabLayout() {
  const userType = useSelector((state: RootState) => state.auth.user?.userType);
  const isPicker = userType === 'picker';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary.DEFAULT,
        tabBarInactiveTintColor: Colors.gray[400],
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon focused={focused}>
              <Home size={size} color={color} />
            </TabBarIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon focused={focused}>
              <Search size={size} color={color} />
            </TabBarIcon>
          ),
        }}
        redirect={!isPicker}
      />
      <Tabs.Screen
        name="pickers"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon focused={focused}>
              <Users size={size} color={color} />
            </TabBarIcon>
          ),
        }}
        redirect={isPicker}
      />
      <Tabs.Screen
        name="my-packages"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon focused={focused}>
              <Package size={size} color={color} />
            </TabBarIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon focused={focused}>
              <User size={size} color={color} />
            </TabBarIcon>
          ),
        }}
      />
    </Tabs>
  );
}

function TabBarIcon({ children, focused }: { children: React.ReactNode, focused: boolean }) {
  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ 
        scale: withTiming(focused ? 1.2 : 1, { duration: 200 }) 
      }],
      opacity: withTiming(focused ? 1 : 0.7, { duration: 200 }),
    };
  });
  
  return (
    <Animated.View style={[styles.iconContainer, animatedStyles]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.white,
    height: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: Platform.OS === 'ios' ? spacing.md : 0,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    elevation: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tabBarLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.xs,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});