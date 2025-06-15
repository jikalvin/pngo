import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput as RNTextInput, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native'; // Added Platform
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import AnimatedAppLoader from '../../components/AnimatedAppLoader'; // Added import
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Calendar, Clock, MapPin } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Layout, { spacing, fontSizes, borderRadius } from '@/constants/Layout';
import { ProgressSteps } from '@/components/ProgressSteps';
import { useTranslation } from 'react-i18next'; // Added import

export default function DeliveryDetailsScreen() {
  const { t } = useTranslation();
  const localParams = useLocalSearchParams();

  // const [date, setDate] = useState(''); // Replaced
  // const [time, setTime] = useState(''); // Replaced
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [dropoffAddress, setDropoffAddress] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [paymentMethods, setPaymentMethods] = useState('');

  // New state variables for map and location
  const [pickupRegion, setPickupRegion] = useState<Region | undefined>(undefined);
  const [pickupMarkerCoordinate, setPickupMarkerCoordinate] = useState<{ latitude: number; longitude: number } | null>(null);
  const [pickupAddressString, setPickupAddressString] = useState('');
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);

  const GOOGLE_MAPS_API_KEY = 'AIzaSyAn1a1mLTt9HApWWoFRc-hoE_U2mtsBSI0';

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('createTask.alertLocationPermissionDeniedTitle'), t('createTask.alertLocationPermissionDeniedMessage'));
        setPickupRegion({
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        setLocationPermissionGranted(false);
        return;
      }
      setLocationPermissionGranted(true);
      try {
        let location = await Location.getCurrentPositionAsync({});
        setPickupRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } catch (e) {
          console.error("Error fetching current location:", e);
          Alert.alert(t('createTask.alertLocationErrorTitle'), t('createTask.alertLocationErrorMessage'));
          setPickupRegion({ latitude: 37.78825, longitude: -122.4324, latitudeDelta: 0.0922, longitudeDelta: 0.0421 });
      }
    })();
  }, []);

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const performReverseGeocode = async (coordinate: { latitude: number; longitude: number }) => {
    if (!GOOGLE_MAPS_API_KEY) {
      Alert.alert(t('createTask.alertApiKeyMissingTitle'), t('createTask.alertApiKeyMissingMessage'));
      setPickupAddressString(t('createTask.errorFetchingAddress')); // Or a more specific key for API key missing
      return;
    }
    setIsFetchingAddress(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinate.latitude},${coordinate.longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        setPickupAddressString(data.results[0].formatted_address);
      } else {
        setPickupAddressString(t('createTask.addressNotFound'));
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      setPickupAddressString(t('createTask.errorFetchingAddress'));
      Alert.alert(t('createTask.alertGeocodingErrorTitle'), t('createTask.alertGeocodingErrorMessage'));
    } finally {
      setIsFetchingAddress(false);
    }
  };

  const handleBack = () => {
    router.back();
  };
  
  const handleNext = () => {
    if (!pickupMarkerCoordinate || !pickupAddressString) {
        Alert.alert(t('createTask.alertMissingPickupTitle'), t('createTask.alertMissingPickupMessage'));
        return;
    }
    if (!dropoffAddress.trim()) {
        Alert.alert(t('createTask.alertMissingDropoffTitle'), t('createTask.alertMissingDropoffMessage'));
        return;
    }

    const paramsToForward = {
      ...localParams,
      date: date.toISOString(), // Pass as ISO string
      time: time.toISOString(), // Pass as ISO string
      pickupAddressString: pickupAddressString,
      pickupLatitude: pickupMarkerCoordinate.latitude.toString(),
      pickupLongitude: pickupMarkerCoordinate.longitude.toString(),
      dropoffAddress,
      minAmount,
      maxAmount,
      paymentMethods,
    };
    router.push({ pathname: '/create/summary', params: paramsToForward as any });
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
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.inputWithIcon}>
              <Text style={styles.inputTextDisplay}>{date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
              <Calendar size={20} color={Colors.gray[600]} />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                testID="datePicker"
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('createTask.timeLabel')}</Text>
            <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.inputWithIcon}>
              <Text style={styles.inputTextDisplay}>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</Text>
              <Clock size={20} color={Colors.gray[600]} />
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                testID="timePicker"
                value={time}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                is24Hour={false}
                onChange={onTimeChange}
              />
            )}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('createTask.pickingAddressLabel')}</Text>
            <RNTextInput
                style={styles.addressDisplay}
                placeholder={t('createTask.mapTapPlaceholder')}
                value={pickupAddressString}
                editable={false}
                multiline
            />
            {isFetchingAddress && <ActivityIndicator size="small" color={Colors.primary.DEFAULT} style={{ marginVertical: 5 }} />}

            {pickupRegion ? (
              <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={pickupRegion}
                onPress={async (e) => {
                  const coord = e.nativeEvent.coordinate;
                  setPickupMarkerCoordinate(coord);
                  await performReverseGeocode(coord);
                }}
                onMapReady={() => setIsMapReady(true)}
                showsUserLocation={locationPermissionGranted}
                moveOnMarkerPress={false}
              >
                {pickupMarkerCoordinate && isMapReady && (
                  <Marker draggable coordinate={pickupMarkerCoordinate} title={t('createTask.pickupLocationMarkerTitle')}
                    onDragEnd={async (e) => {
                      const coord = e.nativeEvent.coordinate;
                      setPickupMarkerCoordinate(coord);
                      await performReverseGeocode(coord);
                    }}
                  />
                )}
              </MapView>
            ) : (
              <View style={{ height: 250, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.gray[100] }}>
                <AnimatedAppLoader size={80} />
                <Text style={{ marginTop: spacing.sm, color: Colors.gray[600] }}>{t('createTask.loadingMap')}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('createTask.droppingAddressLabel')}</Text>
            <TouchableOpacity style={styles.inputWithIcon}>
              <RNTextInput
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
  input: { // This style might be unused now for date/time, or can be adapted for inputTextDisplay
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.md,
    color: Colors.gray[800],
  },
  inputTextDisplay: { // New style for displaying date/time text
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.md,
    color: Colors.gray[800],
    paddingVertical: Platform.OS === 'android' ? spacing.sm - ( (styles.inputWithIcon && styles.inputWithIcon.paddingVertical) || 0) : 0,
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
  map: {
    height: 250,
    width: '100%',
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: borderRadius.md
  },
  addressDisplay: {
    backgroundColor: Colors.gray[100],
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.md,
    color: Colors.gray[800],
    marginBottom: spacing.sm,
    minHeight: 40
  },
});