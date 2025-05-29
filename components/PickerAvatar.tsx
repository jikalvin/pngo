import { StyleSheet, Image, View } from 'react-native';
import Colors from '@/constants/Colors';

interface PickerAvatarProps {
  pickerId: number;
  size?: number;
  showBadge?: boolean;
  isAvailable?: boolean;
}

export function PickerAvatar({ pickerId, size = 50, showBadge = false, isAvailable = true }: PickerAvatarProps) {
  // Generate a predictable avatar URL based on the pickerId
  const getAvatarUrl = () => {
    const imageIds = [
      'pexels-photo-614810.jpeg',
      'pexels-photo-2379005.jpeg',
      'pexels-photo-1222271.jpeg',
      'pexels-photo-1239291.jpeg',
      'pexels-photo-1681010.jpeg',
      'pexels-photo-733872.jpeg',
    ];
    
    const index = pickerId % imageIds.length;
    return `https://images.pexels.com/photos/${imageIds[index]}`;
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: getAvatarUrl() }}
        style={[
          styles.avatar,
          { width: size, height: size, borderRadius: size / 2 }
        ]}
      />
      
      {showBadge && (
        <View style={[
          styles.badge,
          { backgroundColor: isAvailable ? Colors.success.DEFAULT : Colors.gray[400] }
        ]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  avatar: {
    borderWidth: 2,
    borderColor: Colors.white,
  },
  badge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.white,
  },
});