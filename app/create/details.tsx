import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router'; // Added useLocalSearchParams
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Calendar, Clock, MapPin } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Layout, { spacing, fontSizes, borderRadius } from '@/constants/Layout';
import { ProgressSteps } from '@/components/ProgressSteps';
import { useTranslation } from 'react-i18next'; // Added import

export default function DeliveryDetailsScreen() {
  const { t } = useTranslation(); // Initialized t
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [paymentMethods, setPaymentMethods] = useState('');
  
  const handleBack = () => {
    router.back();
  };
  
  const handleNext = () => {
    const receivedParams = useLocalSearchParams();
    // Consolidate all params to pass to the summary screen
    const paramsToForward = {
      ...receivedParams, // Params from index.tsx (deliveryName, size, weight, type, priority, imageUris)
      date,
      time,
      pickupAddress,
      dropoffAddress,
      minAmount,
      maxAmount,
      paymentMethods,
    };
    router.push({
      pathname: '/create/summary', // Changed from /create/picker
      params: paramsToForward,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <ChevronLeft size={24} color={Colors.primary.DEFAULT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('createTask.headerTitle')}</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ProgressSteps totalSteps={4} currentStep={1} />
      
      <ScrollView style={styles.content}>
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('createTask.dateLabel')}</Text>
            <TouchableOpacity style={styles.inputWithIcon}>
              <TextInput
                style={styles.input}
                placeholder={t('createTask.datePlaceholder')}
                placeholderTextColor={Colors.gray[400]}
                value={date}
                onChangeText={setDate}
              />
              <Calendar size={20} color={Colors.gray[600]} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('createTask.timeLabel')}</Text>
            <TouchableOpacity style={styles.inputWithIcon}>
              <TextInput
                style={styles.input}
                placeholder={t('createTask.timePlaceholder')}
                placeholderTextColor={Colors.gray[400]}
                value={time}
                onChangeText={setTime}
              />
              <Clock size={20} color={Colors.gray[600]} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('createTask.pickingAddressLabel')}</Text>
            <TouchableOpacity style={styles.inputWithIcon}>
              <TextInput
                style={styles.input}
                placeholder={t('createTask.pickingAddressPlaceholder')}
                placeholderTextColor={Colors.gray[400]}
                value={pickupAddress}
                onChangeText={setPickupAddress}
              />
              <MapPin size={20} color={Colors.gray[600]} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('createTask.droppingAddressLabel')}</Text>
            <TouchableOpacity style={styles.inputWithIcon}>
              <TextInput
                style={styles.input}
                placeholder={t('createTask.droppingAddressPlaceholder')}
                placeholderTextColor={Colors.gray[400]}
                value={dropoffAddress}
                onChangeText={setDropoffAddress}
              />
              <MapPin size={20} color={Colors.gray[600]} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('createTask.priceRangeLabel')}</Text>
            <View style={styles.priceRangeContainer}>
              <View style={styles.priceInputContainer}>
                <Text style={styles.currencyText}>$</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder={t('createTask.minAmountPlaceholder')}
                  placeholderTextColor={Colors.gray[400]}
                  keyboardType="numeric"
                  value={minAmount}
                  onChangeText={setMinAmount}
                />
              </View>
              
              <View style={styles.priceInputContainer}>
                <Text style={styles.currencyText}>$</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder={t('createTask.maxAmountPlaceholder')}
                  placeholderTextColor={Colors.gray[400]}
                  keyboardType="numeric"
                  value={maxAmount}
                  onChangeText={setMaxAmount}
                />
              </View>
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('createTask.paymentMethodsLabel')}</Text>
            <TouchableOpacity style={styles.dropdown}>
              <Text style={styles.dropdownText}>
                {paymentMethods || t('createTask.paymentMethodsPlaceholder')}
              </Text>
              <ChevronLeft size={20} color={Colors.gray[600]} style={{ transform: [{ rotate: '-90deg' }] }} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <Text style={styles.backButtonText}>{t('common.back')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={handleNext}
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
  formContainer: {
    padding: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.sm,
    color: Colors.gray[700],
    marginBottom: spacing.xs,
  },
  input: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.md,
    color: Colors.gray[800],
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary[50],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primary[50],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dropdownText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.md,
    color: Colors.gray[500],
  },
  priceRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[50],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    width: '48%',
  },
  currencyText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.md,
    color: Colors.gray[800],
    marginRight: spacing.xs,
  },
  priceInput: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.md,
    color: Colors.gray[800],
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
});