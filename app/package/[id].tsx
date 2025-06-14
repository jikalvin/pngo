import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, TouchableOpacity, Alert } from 'react-native'; // Added Alert
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { spacing, fontSizes } from '@/constants/Layout';
import { ChevronLeft, MessageCircle, MapPin, AlertCircle, Edit3, Trash2, CreditCard } from 'lucide-react-native';
import StatusBadge from '@/components/StatusBadge';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTaskById, resetTaskDetail, deleteTask } from '@/store/taskSlice'; // Import deleteTask
import type { AppDispatch, RootState } from '@/store/store';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next'; // For i18n

export default function PackageDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation(); // For internationalized alert messages
  const { task, isLoading, error, isDeletingTask, deleteTaskError } = useSelector( // Added deletion states
    (state: RootState) => state.tasks
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchTaskById(id));
    }
    // Cleanup function to reset task detail when component unmounts
    return () => {
      dispatch(resetTaskDetail());
    };
  }, [dispatch, id]);

  const handleRefresh = () => {
    if (id) {
      dispatch(fetchTaskById(id));
    }
  };

  // Placeholder actions - implementation in future subtasks
  const handleEditTask = () => {
    if (id) { // Ensure id is available before navigating
      router.push(`/task/${id}/edit`);
    } else {
      console.error("Task ID is undefined, cannot navigate to edit screen.");
      // Optionally, show an alert to the user
    }
  };

  const handleDeleteTask = () => {
    if (!id || isDeletingTask) return;

    Alert.alert(
      t('task.deleteConfirmTitle'),
      t('task.deleteConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            const resultAction = await dispatch(deleteTask(id));
            if (deleteTask.fulfilled.match(resultAction)) {
              Alert.alert(
                t('task.deleteSuccessTitle'),
                t('task.deleteSuccessMessage'),
                [{ text: 'OK', onPress: () => router.replace('/(tabs)/my-packages') }]
              );
            } else if (deleteTask.rejected.match(resultAction)) {
              Alert.alert(
                t('task.errors.deleteFailedTitle'),
                (resultAction.payload as string) || t('task.errors.deleteFailedMessage')
              );
            }
          }
        },
      ]
    );
  };

  const handleInitiatePayment = () => console.log("Initiate payment action");

  // Combined loading state for initial fetch and deletion
  const isBusy = isLoading || isDeletingTask;

  if (isBusy && !task && !error && !deleteTaskError) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={['top']}>
        <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
        {isDeletingTask && <Text style={styles.loadingText}>{t('task.deletingTask')}</Text>}
      </SafeAreaView>
    );
  }

  // Display fetch error if task is not available
  if (error && !task) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={['top']}>
        <AlertCircle size={48} color={Colors.danger.DEFAULT} />
        <Text style={styles.errorText}>{t('task.errors.loadFailed')}: {error}</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.retryButton} disabled={isBusy}>
          <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // If task is null after loading and no specific error (e.g. deleted and then navigated back weirdly)
  if (!task) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={['top']}>
        <Text style={styles.errorText}>{t('task.notFound')}</Text>
      </SafeAreaView>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'PPpp'); // e.g., Aug 17, 2023, 7:30 PM
    } catch (e) {
      return dateString; // Return original if formatting fails
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton} disabled={isBusy}>
          <ChevronLeft color={isBusy ? Colors.gray[400] : Colors.primary.DEFAULT} size={24} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{task.title || `Task #${task.id}`}</Text>
        <StatusBadge status={task.status} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Package Details</Text>
          <DetailItem label="Status" value={task.status} isBadge />
          <DetailItem label="From" value={task.pickupAddress} />
          <DetailItem label="To" value={task.deliveryAddress} />
          {task.description && <DetailItem label="Description" value={task.description} />}
          {task.packageWeight && <DetailItem label="Weight" value={`${task.packageWeight} kg`} />}
          {task.packageSize && <DetailItem label="Size" value={task.packageSize} />}
          <DetailItem label="Created At" value={formatDate(task.createdAt)} />
          {task.pickupDate && <DetailItem label="Pickup Date" value={formatDate(task.pickupDate)} />}
          {task.deliveryDate && <DetailItem label="Delivery Date" value={formatDate(task.deliveryDate)} />}
          {task.price !== undefined && <DetailItem label="Price" value={`$${task.price.toFixed(2)}`} />}
          {task.paymentStatus && <DetailItem label="Payment" value={task.paymentStatus} isBadge />}
        </View>

        {/* Placeholder for potential actions based on user role / task status */}
        <View style={styles.actions}>
          {/* Example: Edit/Delete for task creator if task is pending */}
          {/* Example: Edit/Delete for task creator if task is pending and not currently deleting */}
          {task.status === 'pending' && (
            <>
              <ActionButton icon={<Edit3 />} text="Edit Task" onPress={handleEditTask} styleType="secondary" disabled={isBusy} />
              <ActionButton icon={<Trash2 />} text="Delete Task" onPress={handleDeleteTask} styleType="danger" disabled={isBusy} />
            </>
          )}
          {/* Example: Payment if task is pending payment */}
          {task.price && task.paymentStatus === 'pending' && (
             <ActionButton icon={<CreditCard />} text="Proceed to Payment" onPress={handleInitiatePayment} styleType="primary" disabled={isBusy} />
          )}

          <ActionButton
            icon={<MessageCircle />}
            text="Chat with Picker/User"
            onPress={() => router.push(`/package/${id}/chat`)}
            styleType="primaryOutline"
            disabled={isBusy}
          />
          <ActionButton
            icon={<MapPin />}
            text="Track Package"
            onPress={() => router.push(`/package/${id}/track`)}
            styleType="primaryOutline"
            disabled={isBusy}
          />
          {/* Remove or adapt the "View Delivery Pickers" button as needed */}
          {/* <Pressable
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => router.push(`/package/${id}/pickers`)}
          >
            <Text style={styles.actionButtonText}>View Delivery Pickers</Text>
          </Pressable> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper component for detail items
const DetailItem = ({ label, value, isBadge }: { label: string; value: string; isBadge?: boolean }) => (
  <View style={styles.detailRow}>
    <Text style={styles.label}>{label}</Text>
    {isBadge ? <StatusBadge status={value} /> : <Text style={styles.value}>{value}</Text>}
  </View>
);

// Helper component for action buttons
const ActionButton = ({ icon, text, onPress, styleType = 'primary', disabled = false }: { icon: React.ReactNode; text: string; onPress: () => void; styleType?: 'primary' | 'secondary' | 'danger' | 'primaryOutline', disabled?: boolean }) => {
  let buttonStyle = styles.primaryButton;
  let textStyle = styles.actionButtonText;
  let iconColor = Colors.white;

  if (styleType === 'secondary') {
    buttonStyle = styles.secondaryButtonOld;
    textStyle = styles.secondaryButtonTextOld;
    iconColor = Colors.primary.DEFAULT; // Assuming secondary icon color
  } else if (styleType === 'danger') {
    buttonStyle = styles.dangerButton;
    textStyle = styles.actionButtonText; // White text for danger button too
    iconColor = Colors.white;
  } else if (styleType === 'primaryOutline') {
    buttonStyle = styles.primaryOutlineButton;
    textStyle = styles.primaryOutlineButtonText;
    iconColor = Colors.primary.DEFAULT;
  }

  const finalButtonStyle = [
    styles.actionButtonBase,
    buttonStyle,
    disabled && styles.disabledButton // Apply disabled style
  ];
  const finalIcon = React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { color: disabled ? Colors.gray[400] : iconColor }) : null;


  return (
    <TouchableOpacity style={finalButtonStyle} onPress={onPress} disabled={disabled}>
      {finalIcon}
      <Text style={[styles.actionButtonTextBase, textStyle, disabled && styles.disabledButtonText]}>{text}</Text>
    </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.sm,
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.sm,
    color: Colors.gray[600],
  },
  errorText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.md,
    color: Colors.danger.DEFAULT,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryButton: {
    backgroundColor: Colors.primary.DEFAULT,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: fontSizes.sm,
  },
  retryButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.md,
    color: Colors.white,
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
    marginHorizontal: spacing.sm, // Added margin for very long titles
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.md,
    color: Colors.gray[700],
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Align label and value
    alignItems: 'center', // Vertically align items if values wrap
    marginBottom: spacing.md, // Increased spacing
  },
  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.sm,
    color: Colors.gray[500],
    marginRight: spacing.sm, // Space between label and value
  },
  value: {
    flex: 1, // Allow value to take remaining space
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.sm,
    color: Colors.gray[700],
    textAlign: 'right', // Align value to the right
  },
  actions: {
    padding: spacing.lg,
    gap: spacing.md, // Add gap between action buttons
  },
  actionButtonBase: { // Base style for all action buttons
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent', // Default no border
    gap: spacing.sm, // Gap between icon and text
  },
  actionButtonTextBase: { // Base style for action button text
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.sm,
  },
  primaryButton: { // Kept for reference if needed, but ActionButton is more flexible
    backgroundColor: Colors.primary.DEFAULT,
  },
  actionButtonText: { // Specific for primary filled button
    color: Colors.white,
  },
  secondaryButtonOld: { // Renamed to avoid conflict
    backgroundColor: Colors.primary[50],
  },
  secondaryButtonTextOld: { // Renamed to avoid conflict
    color: Colors.primary.DEFAULT,
  },
  dangerButton: {
    backgroundColor: Colors.danger.DEFAULT,
    borderColor: Colors.danger.DEFAULT,
  },
  primaryOutlineButton: {
    backgroundColor: 'transparent',
    borderColor: Colors.primary.DEFAULT,
  },
  primaryOutlineButtonText: {
    color: Colors.primary.DEFAULT,
  },
  disabledButton: {
    backgroundColor: Colors.gray[200], // Example disabled style
    borderColor: Colors.gray[300],
  },
  disabledButtonText: {
    color: Colors.gray[500], // Example disabled text style
  }
});