import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Bell, Plus, Search, ChevronRight, Filter } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Layout, { spacing, fontSizes, borderRadius } from '@/constants/Layout';
import StatusBadge from '@/components/StatusBadge';
import PackageCard from '@/components/PackageCard';
import { PickerAvatar } from '@/components/PickerAvatar';

const statuses = ['All', 'Ongoing', 'Upcoming', 'Delivered', 'Delayed'];

export default function HomeScreen() {
  const [activeStatus, setActiveStatus] = useState('All');
  const [searchText, setSearchText] = useState('');
  
  const handleCreateDelivery = () => {
    router.push('/create');
  };
  
  const navigateToNotifications = () => {
    router.push('/notifications');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Animated.Text 
              entering={FadeIn.duration(800)}
              style={styles.greeting}
            >
              Hello Jik,
            </Animated.Text>
          </View>
          <TouchableOpacity onPress={navigateToNotifications}>
            <Bell color={Colors.primary.DEFAULT} size={24} />
          </TouchableOpacity>
        </View>

        <Animated.View 
          entering={FadeInDown.duration(600).delay(200)}
          style={styles.searchContainer}
        >
          <Search size={20} color={Colors.gray[500]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor={Colors.gray[400]}
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity>
            <Filter size={20} color={Colors.primary.DEFAULT} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(600).delay(300)}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pickers Near You</Text>
            <TouchableOpacity style={styles.seeMoreButton}>
              <Text style={styles.seeMoreText}>More</Text>
              <ChevronRight size={16} color={Colors.primary.DEFAULT} />
            </TouchableOpacity>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.pickersList}
            contentContainerStyle={styles.pickersListContent}
          >
            {[
              { id: 1, name: 'Marcel W.', rating: 4.4 },
              { id: 2, name: 'The Jedi', rating: 4.4 },
              { id: 3, name: 'Rexon P.', rating: 4.4 },
              { id: 4, name: 'Dora F.', rating: 4.4 },
            ].map((picker) => (
              <TouchableOpacity key={picker.id} style={styles.pickerCard}>
                <PickerAvatar pickerId={picker.id} size={60} />
                <Text style={styles.pickerName}>{picker.name}</Text>
                <View style={styles.ratingContainer}>
                  <Text style={styles.rating}>{picker.rating}</Text>
                  <View style={styles.stars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Text 
                        key={star} 
                        style={[styles.star, star <= Math.floor(picker.rating) ? styles.filledStar : null]}
                      >
                        ★
                      </Text>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
        
        <Animated.View
          entering={FadeInDown.duration(600).delay(400)}
          style={styles.statusFilterContainer}
        >
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statusFilterContent}
          >
            {statuses.map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusButton,
                  status === activeStatus && styles.statusButtonActive
                ]}
                onPress={() => setActiveStatus(status)}
              >
                <Text 
                  style={[
                    styles.statusText,
                    status === activeStatus && styles.statusTextActive
                  ]}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
        
        <Animated.View
          entering={FadeInDown.duration(600).delay(500)}
          style={styles.packagesContainer}
        >
          <PackageCard 
            package={{
              id: '1',
              title: 'Bag of Oranges Delivery',
              status: 'progress',
              from: '45 Green Street',
              to: '123 Blue Avenue',
              created: '2024-10-15',
            }}
            onPress={() => {}}
          />
          
          <PackageCard 
            package={{
              id: '2',
              title: 'Electronics Delivery',
              status: 'pending',
              from: '17 Tech Road',
              to: '89 Circuit Street',
              created: '2024-10-16',
            }}
            onPress={() => {}}
          />
        </Animated.View>
      </ScrollView>
      
      <TouchableOpacity 
        style={styles.fabContainer}
        onPress={handleCreateDelivery}
      >
        <Plus color={Colors.white} size={24} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  greeting: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.xl,
    color: Colors.primary.DEFAULT,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: Colors.primary[50],
    borderRadius: borderRadius.md,
    height: 44,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.sm,
    color: Colors.gray[800],
  },
  section: {
    marginVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.md,
    color: Colors.gray[800],
  },
  seeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeMoreText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.sm,
    color: Colors.primary.DEFAULT,
  },
  pickersList: {
    marginTop: spacing.sm,
  },
  pickersListContent: {
    paddingRight: spacing.lg,
  },
  pickerCard: {
    marginRight: spacing.lg,
    alignItems: 'center',
  },
  pickerName: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.sm,
    color: Colors.gray[800],
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.xs,
    color: Colors.gray[600],
    marginRight: spacing.xs,
  },
  stars: {
    flexDirection: 'row',
  },
  star: {
    fontSize: fontSizes.xs,
    color: Colors.gray[300],
  },
  filledStar: {
    color: Colors.warning.DEFAULT,
  },
  statusFilterContainer: {
    marginVertical: spacing.sm,
  },
  statusFilterContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  statusButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  statusButtonActive: {
    backgroundColor: Colors.primary.DEFAULT,
    borderColor: Colors.primary.DEFAULT,
  },
  statusText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.xs,
    color: Colors.gray[600],
  },
  statusTextActive: {
    color: Colors.white,
  },
  packagesContainer: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  fabContainer: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});