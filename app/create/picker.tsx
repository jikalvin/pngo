import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Search, Filter, UserCheck, AlertCircle } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Layout, { spacing, fontSizes, borderRadius } from '@/constants/Layout';
import { ProgressSteps } from '@/components/ProgressSteps';
import { PickerSelectItem } from '@/components/PickerSelectItem'; // Assuming this can display a User object
import { useDispatch, useSelector } from 'react-redux';
import { matchPicker, clearMatchResult, fetchUsers } from '@/store/userSlice'; // fetchUsers for fallback
import type { AppDispatch, RootState } from '@/store/store';
import type { User } from '@/store/authSlice';
import { useTranslation } from 'react-i18next';

// Static pickers list for fallback/manual selection - replace with fetchUsers if needed
const staticPickers = [
  // ... (keep your static pickers or remove if always fetching)
];

export default function SelectPickerScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const params = useLocalSearchParams(); // To get task data from previous steps

  const { matchResult, isMatchingPicker, matchPickerError, users: fetchedPickers, isLoading: isLoadingPickers } = useSelector(
    (state: RootState) => state.users
  );

  const [searchText, setSearchText] = useState('');
  const [selectedPickerId, setSelectedPickerId] = useState<string | null>(null);
  const [showManualList, setShowManualList] = useState(false);

  // Simulate task data passed from previous steps (e.g. details.tsx)
  // In a real app, ensure this data is correctly passed via route params or a creation flow context
  const taskDataForMatching = {
    taskId: params.taskId as string || "temp-task-id", // A temporary or actual task ID if available
    description: params.description as string || "Default description",
    pickupAddress: params.pickupAddress as string, // Assuming these are passed
    deliveryAddress: params.dropoffAddress as string,
    // Add other relevant fields like 'requiredSkills', 'title', 'location' (parsed from addresses)
  };
  
  useEffect(() => {
    // Clear previous match results when the screen mounts or task data changes
    dispatch(clearMatchResult());
  }, [dispatch, taskDataForMatching.taskId]);


  const handleFindBestMatch = () => {
    // Ensure necessary data is present for matching
    if (!taskDataForMatching.pickupAddress || !taskDataForMatching.deliveryAddress) {
        Alert.alert(t('task.errors.missingMatchDataTitle'), t('task.errors.missingMatchDataMessage'));
        return;
    }
    dispatch(matchPicker(taskDataForMatching));
    setShowManualList(false); // Hide manual list when trying to match
  };

  const handleSelectPicker = (picker: User) => {
    setSelectedPickerId(picker.id);
    // If a matched picker is re-selected, it's fine.
  };
  
  const handleConfirmSelection = (pickerToConfirm: User | null) => {
    if (pickerToConfirm) {
        setSelectedPickerId(pickerToConfirm.id);
        // Proceed to next step with this picker's ID
        // Pass all accumulated data to summary screen
        router.push({
            pathname: '/create/summary',
            params: { ...params, selectedPickerId: pickerToConfirm.id, pickerName: pickerToConfirm.fullName }
        });
    } else {
        Alert.alert(t('task.errors.noPickerSelectedTitle'), t('task.errors.noPickerSelectedMessage'));
    }
  };

  const handleShowManualList = () => {
    setShowManualList(true);
    // Optionally, fetch pickers if not already available or if search is used
    if (fetchedPickers.length === 0) {
        dispatch(fetchUsers({ role: 'picker', page: 1, limit: 20 })); // Load some pickers
    }
  };

  useEffect(() => {
    // If a match is found, pre-select it
    if (matchResult) {
        setSelectedPickerId(matchResult.id); // Assuming matchResult is a User object
    }
  }, [matchResult]);


  const currentPickerToDisplay = matchResult ? (matchResult as User) : (fetchedPickers.find(p => p.id === selectedPickerId) || null);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} disabled={isMatchingPicker}>
          <ChevronLeft size={24} color={Colors.primary.DEFAULT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('task.selectPickerTitle')}</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ProgressSteps totalSteps={4} currentStep={2} />
      
      <ScrollView style={styles.content}>
        <View style={styles.infoContainer}>
          <TouchableOpacity style={styles.matchButton} onPress={handleFindBestMatch} disabled={isMatchingPicker}>
            {isMatchingPicker ? <ActivityIndicator color={Colors.white} /> : <UserCheck size={20} color={Colors.white} />}
            <Text style={styles.matchButtonText}>{t('task.findBestMatch')}</Text>
          </TouchableOpacity>

          {matchPickerError && <Text style={styles.errorText}>{matchPickerError}</Text>}
        </View>

        {matchResult && !showManualList && (
          <View style={styles.matchedPickerContainer}>
            <Text style={styles.sectionTitle}>{t('task.bestMatchFound')}</Text>
            <PickerSelectItem
              picker={matchResult as User} // Assuming matchResult is a User object
              isSelected={selectedPickerId === (matchResult as User).id}
              onSelect={() => handleSelectPicker(matchResult as User)}
            />
          </View>
        )}

        {!matchResult && !isMatchingPicker && !showManualList && (
             <View style={styles.infoContainer}>
                <Text style={styles.infoText}>{t('task.orSelectManually')}</Text>
                <TouchableOpacity style={styles.manualListButton} onPress={handleShowManualList}>
                    <Text style={styles.manualListButtonText}>{t('task.viewPickersList')}</Text>
                </TouchableOpacity>
            </View>
        )}

        {showManualList && (
            <>
            <View style={styles.searchSection}>
                <View style={styles.searchContainer}>
                    <Search size={20} color={Colors.gray[500]} style={styles.searchIcon} />
                    <TextInput
                    style={styles.searchInput}
                    placeholder={t('pickersScreen.searchPlaceholder')}
                    placeholderTextColor={Colors.gray[400]}
                    value={searchText}
                    onChangeText={setSearchText}
                    // Add onSubmitEditing to trigger search with fetchUsers
                    />
                    <TouchableOpacity>
                    <Filter size={20} color={Colors.primary.DEFAULT} />
                    </TouchableOpacity>
                </View>
            </View>
            {isLoadingPickers && <ActivityIndicator style={{marginTop: spacing.md }} color={Colors.primary.DEFAULT}/>}
            {fetchedPickers.length > 0 ? (
                fetchedPickers.map((picker) => (
                <PickerSelectItem
                    key={picker.id}
                    picker={picker}
                    isSelected={selectedPickerId === picker.id}
                    onSelect={() => handleSelectPicker(picker)}
                />
                ))
            ) : (
                !isLoadingPickers && <Text style={styles.infoText}>{t('pickersScreen.noPickersFound')}</Text>
            )}
            </>
        )}
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
          disabled={isMatchingPicker}
        >
          <Text style={styles.backButtonText}>{t('common.back')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.continueButton, (!selectedPickerId && styles.disabledButton)]}
          onPress={() => handleConfirmSelection(currentPickerToDisplay)}
          disabled={!selectedPickerId || isMatchingPicker}
        >
          <Text style={styles.continueButtonText}>{t('common.continue')}</Text>
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
  errorText: {
    color: Colors.danger.DEFAULT,
    textAlign: 'center',
    marginVertical: spacing.sm,
    fontFamily: 'Poppins-Regular',
  },
  infoText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.sm,
    color: Colors.gray[600],
    textAlign: 'center',
    marginBottom: spacing.md,
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm, // Reduced padding
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  matchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary.DEFAULT,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  matchButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.md,
    color: Colors.white,
  },
  manualListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary.DEFAULT,
    gap: spacing.sm,
  },
  manualListButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.md,
    color: Colors.primary.DEFAULT,
  },
  matchedPickerContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  sectionTitle: { // Reused for "Best Match Found"
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.md,
    color: Colors.gray[800],
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  searchSection: { // Container for search bar when manual list is shown
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  searchContainer: { // Style for the search bar itself
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[50],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    // paddingVertical: spacing.sm, // Handled by fixed height or parent
    height: 44, // Fixed height for search bar
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.sm,
    color: Colors.gray[800],
    height: '100%', // Ensure TextInput takes full height of container
  },
  pickersList: { // For ScrollView containing PickerSelectItems
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