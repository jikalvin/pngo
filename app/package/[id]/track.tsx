import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { spacing, fontSizes } from '@/constants/Layout';
import { ChevronLeft } from 'lucide-react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
// import PickerAvatar from '@/components/PickerAvatar';
import { PickerAvatar } from '@/components/PickerAvatar';

export default function PackageTrackingScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // TODO: Fetch tracking details from API
  const trackingDetails = {
    picker: {
      name: 'John Doe',
      avatar: 'https://i.pravatar.cc/150?img=1',
      location: {
        latitude: 4.1537,
        longitude: 9.2920,
      },
    },
    package: {
      status: 'in_transit',
      estimatedArrival: '15 minutes',
      from: {
        latitude: 4.1537,
        longitude: 9.2920,
      },
      to: {
        latitude: 4.1637,
        longitude: 9.3020,
      },
    },
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color={Colors.primary.DEFAULT} size={24} />
        </Pressable>
        <Text style={styles.title}>Track Package</Text>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: trackingDetails.picker.location.latitude,
            longitude: trackingDetails.picker.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {/* Picker's current location */}
          <Marker
            coordinate={trackingDetails.picker.location}
            title={trackingDetails.picker.name}
          >
            <View style={styles.pickerMarker}>
              <PickerAvatar
                size={32}
                uri={trackingDetails.picker.avatar}
              />
            </View>
          </Marker>

          {/* Package destination */}
          <Marker
            coordinate={trackingDetails.package.to}
            title="Destination"
            pinColor={Colors.primary.DEFAULT}
          />
        </MapView>
      </View>

      <View style={styles.detailsCard}>
        <View style={styles.pickerInfo}>
          <PickerAvatar
            size={48}
            uri={trackingDetails.picker.avatar}
          />
          <View style={styles.pickerDetails}>
            <Text style={styles.pickerName}>{trackingDetails.picker.name}</Text>
            <Text style={styles.estimatedTime}>
              Arrives in {trackingDetails.package.estimatedArrival}
            </Text>
          </View>
        </View>

        <Pressable 
          style={styles.chatButton}
          onPress={() => router.push(`/package/${id}/chat`)}
        >
          <Text style={styles.chatButtonText}>Chat with Picker</Text>
        </Pressable>
      </View>
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
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  backButton: {
    marginRight: spacing.md,
  },
  title: {
    flex: 1,
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.lg,
    color: Colors.primary.DEFAULT,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: '100%',
  },
  pickerMarker: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 2,
    borderWidth: 2,
    borderColor: Colors.primary.DEFAULT,
  },
  detailsCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  pickerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  pickerDetails: {
    marginLeft: spacing.md,
  },
  pickerName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.md,
    color: Colors.gray[800],
  },
  estimatedTime: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.sm,
    color: Colors.gray[600],
  },
  chatButton: {
    backgroundColor: Colors.primary.DEFAULT,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  chatButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.md,
    color: Colors.white,
    textAlign: 'center',
  },
});