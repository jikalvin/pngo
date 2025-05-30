import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { spacing, fontSizes } from '@/constants/Layout';
import { ChevronLeft, Send } from 'lucide-react-native';
import {PickerAvatar} from '@/components/PickerAvatar';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'picker';
  timestamp: Date;
};

export default function PackageChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState('');

  // TODO: Fetch chat history from API
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I will be delivering your package today.',
      sender: 'picker',
      timestamp: new Date(),
    },
    {
      id: '2',
      text: 'Great! Whats your estimated arrival time?',
      sender: 'user',
      timestamp: new Date(),
    },
  ]);

  const handleSend = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setMessage('');
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.sender === 'user' ? styles.userMessage : styles.pickerMessage
    ]}>
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.timestamp}>
        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color={Colors.primary.DEFAULT} size={24} />
        </Pressable>
        <PickerAvatar
          size={32}
          pickerId={2}
          // uri="https://i.pravatar.cc/150?img=1"
        />
        <Text style={styles.title}>John Doe</Text>
      </View>

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          inverted={false}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor={Colors.gray[400]}
            multiline
          />
          <Pressable 
            onPress={handleSend}
            style={[
              styles.sendButton,
              !message.trim() && styles.sendButtonDisabled
            ]}
            disabled={!message.trim()}
          >
            <Send 
              size={20} 
              color={message.trim() ? Colors.white : Colors.gray[400]}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
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
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.md,
    color: Colors.primary.DEFAULT,
    marginLeft: spacing.sm,
  },
  content: {
    flex: 1,
  },
  messagesList: {
    padding: spacing.md,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: spacing.xs,
    padding: spacing.sm,
    borderRadius: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary.DEFAULT,
  },
  pickerMessage: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.gray[200],
  },
  messageText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.sm,
    color: Colors.white,
  },
  timestamp: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.xs,
    color: Colors.gray[400],
    marginTop: spacing.xs,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    backgroundColor: Colors.white,
  },
  input: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.sm,
    backgroundColor: Colors.gray[100],
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.gray[200],
  },
});