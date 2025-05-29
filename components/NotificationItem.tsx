import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Colors from '@/constants/Colors';
import Layout, { spacing, fontSizes, borderRadius } from '@/constants/Layout';

type NotificationType = 'request' | 'progress' | 'completed' | 'system';

interface NotificationItemProps {
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  isUnread?: boolean;
  onPress?: () => void;
}

export function NotificationItem({ 
  type, 
  title, 
  message, 
  time, 
  isUnread = false,
  onPress 
}: NotificationItemProps) {
  const getNotificationImage = () => {
    switch (type) {
      case 'request':
        return 'https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg';
      case 'progress':
        return 'https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg';
      case 'completed':
        return 'https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg';
      case 'system':
        return 'https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg';
      default:
        return 'https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, isUnread && styles.unreadContainer]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {isUnread && <View style={styles.unreadIndicator} />}
      
      <Image source={{ uri: getNotificationImage() }} style={styles.image} />
      
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.time}>{time}</Text>
        </View>
        
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
      </View>
      
      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionButtonText}>View</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
    backgroundColor: Colors.white,
  },
  unreadContainer: {
    backgroundColor: Colors.primary[50],
  },
  unreadIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: Colors.primary.DEFAULT,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  contentContainer: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.sm,
    color: Colors.gray[800],
  },
  time: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.xs,
    color: Colors.gray[500],
  },
  message: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.xs,
    color: Colors.gray[600],
    flex: 1,
  },
  actionButton: {
    marginLeft: spacing.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: Colors.primary[100],
    borderRadius: borderRadius.md,
    alignSelf: 'center',
  },
  actionButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.xs,
    color: Colors.primary.DEFAULT,
  },
});