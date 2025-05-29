import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Search, Filter } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Layout, { spacing, fontSizes, borderRadius } from '@/constants/Layout';
import { ProgressSteps } from '@/components/ProgressSteps';
import { PickerSelectItem } from '@/components/PickerSelectItem';

const pickers = [
  { 
    id: 1, 
    name: 'Marcel Wankbuba', 
    location: 'Bamenda, Cameroon',
    rating: 4.4, 
    deliveries: 23, 
    date: 'Oct 23, 2024',
    available: true 
  },
  { 
    id: 2, 
    name: 'The Jedi', 
    location: 'Bamenda, Cameroon',
    rating: 4.4, 
    deliveries: 21, 
    date: 'Oct 23, 2024',
    available: true 
  },
  { 
    id: 3, 
    name: 'Rexon P.', 
    location: 'Bamenda, Cameroon',
    rating: 4.4, 
    deliveries: 23, 
    date: 'Oct 23, 2024',
    available: true 
  },
];

export default function SelectPickerScreen() {
  const [searchText, setSearchText] = useState('');
  const [selectedPicker, setSelectedPicker] = useState<number | null>(null);
  
  const handleBack = () => {
    router.back();
  };
  
  const handleNext = () => {
    router.push('/create/summary');
  };
  
  const handleSelectPicker = (id: number) => {
    setSelectedPicker(id);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <ChevronLeft size={24} color={Colors.primary.DEFAULT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Delivery</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ProgressSteps totalSteps={4} currentStep={2} />
      
      <View style={styles.content}>
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Let Pickers apply</Text>
          <View style={styles.searchContainer}>
            <Search size={20} color={Colors.gray[500]} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Pickers"
              placeholderTextColor={Colors.gray[400]}
              value={searchText}
              onChangeText={setSearchText}
            />
            <TouchableOpacity>
              <Filter size={20} color={Colors.primary.DEFAULT} />
            </TouchableOpacity>
          </View>
        </View>
        
        <ScrollView style={styles.pickersList}>
          {pickers.map((picker) => (
            <PickerSelectItem
              key={picker.id}
              picker={picker}
              isSelected={selectedPicker === picker.id}
              onSelect={handleSelectPicker}
            />
          ))}
        </ScrollView>
      </View>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.continueButton, (!selectedPicker && styles.disabledButton)]}
          onPress={handleNext}
          disabled={!selectedPicker}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.lg,
    color: Colors.primary.DEFAULT,
  },
  content: {
    flex: 1,
  },
  infoContainer: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  infoTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.md,
    color: Colors.gray[700],
    marginBottom: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[50],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
  pickersList: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    backgroundColor: Colors.white,
  },
  backButton: {
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
  },
  backButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.md,
    color: Colors.gray[700],
  },
  continueButton: {
    backgroundColor: Colors.primary.DEFAULT,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
  },
  continueButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.md,
    color: Colors.white,
  },
  disabledButton: {
    backgroundColor: Colors.gray[400],
  },
});