import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Bell, Search, Filter } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Layout, { spacing, fontSizes, borderRadius } from '@/constants/Layout';
import PickerListItem from '@/components/PickerListItem';

const pickers = [
  { 
    id: 1, 
    name: 'Marcel Wankbuba', 
    location: 'Bamenda, Cameroon',
    rating: 4.4, 
    deliveries: 23, 
    available: true 
  },
  { 
    id: 2, 
    name: 'The Jedi', 
    location: 'Bamenda, Cameroon',
    rating: 4.4, 
    deliveries: 25, 
    available: true 
  },
  { 
    id: 3, 
    name: 'Rexon Pennyworth', 
    location: 'Bamenda, Cameroon',
    rating: 4.4, 
    deliveries: 23, 
    available: false 
  },
  { 
    id: 4, 
    name: 'Dora Finesta', 
    location: 'Bamenda, Cameroon',
    rating: 4.4, 
    deliveries: 29, 
    available: true 
  },
  { 
    id: 5, 
    name: 'Lespa Khingston', 
    location: 'Bamenda, Cameroon',
    rating: 4.4, 
    deliveries: 23, 
    available: true 
  },
  { 
    id: 6, 
    name: 'Marcel Wankbuba', 
    location: 'Bamenda, Cameroon',
    rating: 4.4, 
    deliveries: 23, 
    available: true 
  },
];

export default function PickersScreen() {
  const [searchText, setSearchText] = useState('');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Animated.Text 
          entering={FadeIn.duration(800)}
          style={styles.title}
        >
          Pickers
        </Animated.Text>
        <TouchableOpacity>
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

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.duration(600).delay(300)}
          style={styles.pickersContainer}
        >
          {pickers.map((picker, index) => (
            <PickerListItem 
              key={`${picker.id}-${index}`}
              picker={picker}
            />
          ))}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
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
  content: {
    flex: 1,
  },
  pickersContainer: {
    padding: spacing.md,
  },
});